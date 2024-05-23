import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Linking,
  Pressable,
  ActivityIndicator,
  Animated,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { defaultImage } from "@/components/DonationListItem";
import Button from "@/components/Button3";
import DonationProgress from "@/components/DonationProgress";
import { FIREBASE_APP, FIRESTORE_DB } from "@/lib/firebase";
import {
  FieldValue,
  FieldValue as FirebaseFieldValue,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getUserById } from "@/lib/firebase";
import { Donation, User } from "@/types";
import { useUserData } from "@/context/UserDataContext";
import { FontAwesome } from "@expo/vector-icons";
import DonationVerificationModal from "@/components/verifiedModal";
import {
  closeDonation,
  approveDonation,
  removeDonation,
} from "@/helpers/donationActions";

const DonationDetailsScreen = () => {
  const { userData } = useUserData();
  const { id } = useLocalSearchParams();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);
  const [donationAmount, setDonationAmount] = useState("");
  const [email, setEmail] = useState("");
  const loggedInUserId = userData.userId;
  const { isAdmin } = useUserData();
  const [showDonateFields, setShowDonateFields] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [modalVisible, setModalVisible] = useState(false);
  const [showPledgeTab, setShowPledgeTab] = useState(false);
  const [showDonateTab, setShowDonateTab] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [pledgePressed, setPledgePressed] = useState(false);
  const [donatedUsersData, setDonatedUsersData] = useState([]);
  const [donorsModalVisible, setDonorsModalVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);

  const toggleDonorsModal = (donor) => {
    setSelectedDonor(donor);
    setDonorsModalVisible(!donorsModalVisible);
  };

  const fetchDonatedUsersData = async () => {
    if (!donation || !donation.donatedUsers) return;

    const usersData = [];
    for (const donatedUser of donation.donatedUsers) {
      const userDocRef = doc(FIRESTORE_DB, "users", donatedUser.userId);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        usersData.push({ id: userDocSnapshot.id, ...userDocSnapshot.data() });
      }
    }
    setDonatedUsersData(usersData);
  };

  useEffect(() => {
    fetchDonatedUsersData();
  }, [donation]);

  const handleMethodChoice = (method: string) => {
    if (method === "pledge") {
      setShowPledgeTab(true);
      setShowDonateTab(false);
    } else if (method === "card") {
      setShowPledgeTab(false);
      setShowDonateTab(true);
    }
  };

  const handleStarPress = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handlePaymentMethodChange = (method: React.SetStateAction<string>) => {
    setPaymentMethod(method);
  };

  const isOwner = user && user.id === loggedInUserId;

useEffect(() => {
  const fetchDonation = async () => {
    try {
      const docRef = doc(FIRESTORE_DB, "posts", id);
      const unsubscribe = onSnapshot(docRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
          setDonation({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          } as Donation);
          // Fetch user based on userId from donation data
          const userRef = doc(
            FIRESTORE_DB,
            "users",
            docSnapshot.data().userId
          );
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser({ id: userSnap.id, ...userSnap.data() } as User);
            // Add viewed donation category to the user document with a delay of 10 seconds
            const donationCategory = docSnapshot.data().category;
            setTimeout(async () => {
              const userDocRef = doc(FIRESTORE_DB, "users", userData.userId);
              await updateDoc(userDocRef, {
                viewedDonationCategories: arrayUnion(donationCategory),
              });
            }, 10000); // 10 seconds delay
          } else {
            console.log("No such user document!");
          }
        } else {
          console.log("No such donation document!");
        }
        setLoading(false);
      });
      // Unsubscribe from the listener when component unmounts
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching donation:", error);
    }
  };

  fetchDonation();
}, [id, userData]);


  let daysLeft = "Invalid dates";
  if (donation?.createdAt && donation.targetDate) {
    const currentDate = new Date();
    const targetDate = donation.targetDate.toDate(); // Convert timestamp to Date object
    if (!isNaN(currentDate.getTime()) && !isNaN(targetDate.getTime())) {
      const differenceMs = targetDate.getTime() - currentDate.getTime();
      daysLeft = Math.round(differenceMs / (1000 * 60 * 60 * 24));
    } else {
      daysLeft = "Invalid dates";
    }
  } else {
    daysLeft = "Date missing";
  }

  const daysLeftStyle =
    typeof daysLeft === "number" && daysLeft > 10
      ? styles.daysLeftNormal
      : styles.daysLeftWarning;

  const handleCloseDonation = async () => {
    await closeDonation(id);
  };

  const handleApproveDonation = async () => {
    await approveDonation(
      id,
      donation?.userId,
      donation?.image,
      donation?.caption
    );
  };

  const handleRemoveDonation = async () => {
    await removeDonation(id);
  };

  //Loading animation while fetching the post details
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: loading ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [loading, fadeAnim]);

  const donate = async () => {
    setShowDonateFields(true); // Set showDonateFields to true when user clicks on Donate
  };

  const handlePledge = async () => {
    setPledgePressed(true);
    try {
      // Check if user is verified
      if (!userData || !userData.verified) {
        Alert.alert(
          "User Not Verified",
          "You must be a verified user to make a pledge."
        );
        return;
      }

      // Check if pledge amount is valid
      if (
        !pledgeAmount ||
        isNaN(parseFloat(pledgeAmount)) ||
        parseFloat(pledgeAmount) <= 0
      ) {
        Alert.alert(
          "Invalid pledge amount",
          "Please enter a valid pledge amount."
        );
        return;
      }

      // Parse the pledgeAmount string into a number
      const amount = parseFloat(pledgeAmount);

      // Create a new document in pledges collection
      const pledgeData = {
        donationImage: donation?.image,
        donationId: id,
        donationName: donation?.caption,
        postCreatedAt: donation?.createdAt,
        postTargetDate: donation?.targetDate,
        donorId: loggedInUserId,
        doneeId: user?.id,
        amount: amount,
        status: "pending",
        createdAt: new Date(),
        donorConfirmed: false,
        doneeConfirmed: false,
        statusHistory: [
          {
            status: `${userData.firstName} pledged`,
            date: new Date().toISOString(),
          },
        ],
      };

      // Add the pledge data to Firestore
      const pledgeRef = await addDoc(
        collection(FIRESTORE_DB, "pledges"),
        pledgeData
      );
      console.log("Pledge added with ID: ", pledgeRef.id);

      // Update the existing notification document with the new pledge data
      const notificationRef = doc(FIRESTORE_DB, "notifications", user?.id);
      const notificationDoc = await getDoc(notificationRef);

      if (notificationDoc.exists()) {
        const existingNotifications =
          notificationDoc.data().notifications || [];
        const updatedNotifications = [
          ...existingNotifications,
          {
            caption: `${userData.firstName} pledged ₱${amount.toFixed(2)}`,
            time: new Date().toISOString(),
            postId: id,
            approved: true,
            donorId: loggedInUserId,
            userId: user?.id,
            postImage: donation?.image,
            amount: amount,
            donorProfile: userData.profilePicture,
            postCaption: donation?.caption,
          },
        ];

        await updateDoc(notificationRef, {
          notifications: updatedNotifications,
        });
      }

      // Display success message
      Alert.alert("Pledge Successful", "Thank you for your pledge!");

      // Clear the pledge amount input field
      setPledgeAmount("");
    } catch (error) {
      console.error("Error adding pledge: ", error);
      Alert.alert(
        "Pledge Error",
        "An error occurred while processing your pledge."
      );
    } finally {
      // Re-enable the pledge button after pledge handling
      setPledgePressed(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={"#3EB489"} />
      </View>
    );
  }

  if (!donation) {
    return <Text>Donation not found</Text>;
  }

  if (showDonateFields) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: donation.image || defaultImage }}
            style={styles.donateImage}
          />
          {donation.verified && (
            <Pressable onPress={handleStarPress} style={styles.iconContainer}>
              <FontAwesome name={"star"} size={25} color={"#3EB489"} />
            </Pressable>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{donation.caption}</Text>
          <Link push href={`./user/${user?.id}`} asChild>
            <Pressable style={styles.doneeContainer}>
              <>
                <Image
                  source={{ uri: user?.profilePicture || defaultImage }}
                  style={styles.doneeProfile}
                />
                <Text
                  style={styles.donee}
                >{`${user?.firstName} ${user?.lastName}`}</Text>
              </>
            </Pressable>
          </Link>
        </View>

        <View style={styles.donationProgress}>
          <DonationProgress
            totalAmount={donation.amountNeeded}
            donatedAmount={donation.donatedAmount}
          />
        </View>
        <Text style={styles.methodHeaderText}>Select Donation Method</Text>
        <View style={styles.MethodChooseContainer}>
          <Pressable
            style={[
              styles.MethodChoice,
              showPledgeTab && styles.selectedMethodChoice,
            ]}
            onPress={() => handleMethodChoice("pledge")}
          >
            <FontAwesome name={"handshake-o"} size={24} color={"#000000"} />
            <Text
              style={[
                {
                  marginStart: 5,
                  fontWeight: "600",
                },
                showPledgeTab && styles.selectedMethodText,
              ]}
            >
              Pledge
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.MethodChoice,
              showDonateTab && styles.selectedMethodChoice,
            ]}
            onPress={() => handleMethodChoice("card")}
          >
            <FontAwesome name={"paypal"} size={24} color={"#000000"} />
            <Text
              style={[
                {
                  marginStart: 5,
                  fontWeight: "600",
                },
                showDonateTab && styles.selectedMethodText,
              ]}
            >
              Card
            </Text>
          </Pressable>
        </View>
        {/* pledge method */}
        {showPledgeTab && (
          <View>
            {userData && !userData.verified ? (
              <>
                <Text style={styles.warningText}>
                  You must be a verified user to make a pledge.
                </Text>
                <Link
                  href={"/profile/accountSettings/Account/verifyAccount"}
                  asChild
                >
                    <Button text="Verify Account" />
                </Link>
              </>
            ) : (
              <>
                <Text style={styles.pledgeExplanation}>
                  Pledging means committing to donate a certain amount to this
                  cause without making an immediate payment. You will be
                  reminded to fulfill your pledge at a later time.
                </Text>
                <TextInput
                  placeholder="Enter pledge amount"
                  keyboardType="numeric"
                  style={styles.input}
                  value={pledgeAmount}
                  onChangeText={(text) => setPledgeAmount(text)}
                />
                <View style={{ marginBottom: 80 }}>
                  <Button
                    onPress={handlePledge}
                    text="Pledge"
                    disabled={pledgePressed}
                  />
                </View>
              </>
            )}
          </View>
        )}
        {/* card method */}
      </ScrollView>
    );
  }

  const uniqueUserIds = new Set(
    donatedUsersData.map((donatedUser) => donatedUser.id)
  );
  const uniqueUserCount = uniqueUserIds.size;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "" }} />

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: donation.image || defaultImage }}
          style={styles.image}
        />
        {donation.verified && (
          <Pressable onPress={handleStarPress} style={styles.iconContainer}>
            <FontAwesome name={"star"} size={25} color={"#3EB489"} />
          </Pressable>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{donation.caption}</Text>
        <Link push href={`./user/${user?.id}`} asChild>
          <Pressable style={styles.doneeContainer}>
            <>
              <Image
                source={{ uri: user?.profilePicture || defaultImage }}
                style={styles.doneeProfile}
              />
              <Text
                style={styles.donee}
              >{`${user?.firstName} ${user?.lastName}`}</Text>
            </>
          </Pressable>
        </Link>
        <Text style={daysLeftStyle}>{daysLeft} days left</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Pressable
              onPress={() => toggleDonorsModal()}
              style={styles.donatedUsersContainer}
            >
              {/* Map through the donated users data limited to seven and remove duplicates */}
              {donatedUsersData &&
                donatedUsersData.length > 0 &&
                donatedUsersData
                  .filter(
                    (user, index, array) =>
                      array.findIndex((u) => u.id === user.id) === index
                  ) // Remove duplicates
                  .slice(0, 7) // Limit to the first seven elements
                  .reverse() // Reverse the order
                  .map((donatedUser, index, array) => (
                    <View
                      key={donatedUser.id}
                      style={[
                        styles.donatedUser,
                        { zIndex: array.length - index },
                      ]}
                    >
                      <Image
                        source={{
                          uri: donatedUser.profilePicture || defaultImage,
                        }}
                        style={styles.donatedUserProfile}
                      />
                    </View>
                  ))}
            </Pressable>
            {donatedUsersData.length > 0 && (
              <Text style={styles.donationCount}>
                {uniqueUserCount === 1
                  ? "1 user donated"
                  : `${uniqueUserCount} users donated`}
              </Text>
            )}
          </View>
          <View style={styles.donationProgress}>
            <DonationProgress
              totalAmount={donation.amountNeeded}
              donatedAmount={donation.donatedAmount}
            />
          </View>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.description}>{donation.details}</Text>
        </View>
      </View>

      {isAdmin ? (
        <>
          {!donation.approved && (
            <View style={{ marginBottom: 70 }}>
              <Button onPress={handleApproveDonation} text="Approve Donation" />
            </View>
          )}
          {donation.approved && (
            <View style={{ marginBottom: 70 }}>
              <Button onPress={handleRemoveDonation} text="Remove Donation" />
            </View>
          )}
        </>
      ) : (
        <>
          {isOwner ? (
            <>
              {!donation.approved && (
                <View style={{ marginBottom: 70 }}>
                  <Button text="Donation Under Approval" />
                </View>
              )}
              {donation.approved && (
                <View style={{ marginBottom: 70 }}>
                  <Button onPress={handleCloseDonation} text="Close Donation" />
                </View>
              )}
            </>
          ) : (
            <>
              <View style={{ marginBottom: 70 }}>
                <Button onPress={donate} text="Donate" />
              </View>
            </>
          )}
        </>
      )}

      <Modal
        animationType="none"
        transparent={true}
        visible={donorsModalVisible}
        onRequestClose={() => {
          setDonorsModalVisible(!donorsModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Donors</Text>
            <ScrollView>
              {donatedUsersData &&
                donatedUsersData.length > 0 &&
                donatedUsersData
                  .filter(
                    (user, index, array) =>
                      array.findIndex((u) => u.id === user.id) === index
                  ) // Remove duplicates
                  .map((donor) => (
                    <Link
                      push
                      key={donor.id}
                      href={`./user/${donor.id}`}
                      asChild
                    >
                      <Pressable
                        style={styles.donorItem}
                        onPress={() => toggleDonorsModal()}
                      >
                        <Image
                          source={{
                            uri: donor.profilePicture || defaultImage,
                          }}
                          style={styles.donorProfile}
                        />
                        <Text
                          style={styles.donorName}
                        >{`${donor.firstName} ${donor.lastName}`}</Text>
                      </Pressable>
                    </Link>
                  ))}
            </ScrollView>
            <Pressable
              onPress={() => toggleDonorsModal()}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <DonationVerificationModal
        modalVisible={modalVisible}
        handleModalClose={handleModalClose}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f2f3ef",
    flex: 1,
    padding: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 2 / 1,
    borderRadius: 30,
  },
  donateImage: {
    marginLeft: 20,
    width: "40%",
    aspectRatio: 1,
    borderRadius: 30,
  },
  amount: {
    marginTop: "auto",
    fontSize: 18,
    fontWeight: "bold",
  },
  donationProgress: {
    marginVertical: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  donee: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsContainer: {
    padding: 8,
    margin: 2,
  },
  description: {
    fontSize: 15,
    textAlign: "justify",
    color: "black",
  },
  textContainer: {
    marginHorizontal: 15,
    marginVertical: 15,
  },
  doneeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  doneeProfile: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  inputContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
  },
  iconContainer: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "white",
    borderRadius: 40,
    padding: 8,
  },
  MethodChooseContainer: {
    flexDirection: "row",
    minWidth: 160,
    minHeight: 80,
    marginBottom: 10,
  },
  MethodChoice: {
    justifyContent: "center",
    backgroundColor: "rgba(87, 98, 50, 0.10)",
    borderRadius: 15,
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 75,
    minWidth: 100,
  },
  selectedMethodChoice: {
    backgroundColor: "#3EB489",
  },
  selectedMethodText: {
    color: "black",
  },
  pledgeExplanation: {
    fontSize: 14,
    marginBottom: 10,
    marginHorizontal: 10,
    color: "#666666",
    textAlign: "justify",
  },
  methodHeaderText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "500",
    marginVertical: 5,
  },
  warningText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  daysLeftNormal: {
    textAlign: "right",
    marginTop: 10,
    fontSize: 16,
    color: "#3EB489",
    fontWeight: "600",
  },
  daysLeftWarning: {
    textAlign: "right",
    marginTop: 10,
    fontSize: 16,
    color: "#e68c8e",
    fontWeight: "600",
  },
  donatedUsersContainer: {
    flexDirection: "row", // Make the container flex row
    flexWrap: "wrap", // Allow wrapping to new row
    justifyContent: "flex-start",
  },
  donatedUser: {
    marginRight: -30, // Add margin between profile pictures
    marginBottom: 10,
  },
  donatedUserProfile: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  donationCount: {
    marginLeft: 30,
    fontSize: 12,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  donorItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  donorProfile: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  donorName: {
    fontSize: 16,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  closeButtonText: {
    color: "#3EB489",
    fontWeight: "bold",
  },
});

const WrappedDonationDetailsScreen = () => {
  return (
      <DonationDetailsScreen />
  );
};

export default WrappedDonationDetailsScreen;
