import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { FIRESTORE_DB } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

const Gcash = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [donorInfo, setDonorInfo] = useState(null);
  const [doneeInfo, setDoneeInfo] = useState(null);
  const [postInfo, setPostInfo] = useState(null); // Post info state
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(FIRESTORE_DB, "gcash"),
      (querySnapshot) => {
        const fetchedDonations = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonations(fetchedDonations);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching donations:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchUserInfo = async (userId, setUserInfo) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, "users", userId));
      if (userDoc.exists()) {
        setUserInfo(userDoc.data());
      } else {
        console.log("No such user document!");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchPostInfo = async (postId) => {
    try {
      const postDoc = await getDoc(doc(FIRESTORE_DB, "posts", postId));
      if (postDoc.exists()) {
        setPostInfo(postDoc.data());
      } else {
        console.log("No such post document!");
      }
    } catch (error) {
      console.error("Error fetching post info:", error);
    }
  };

  const handleDonationPress = (donation) => {
    setSelectedDonation(donation);
    setModalVisible(true);
    setAmount(donation.amount || "");

    if (donation.donorId) {
      fetchUserInfo(donation.donorId, setDonorInfo);
    }
    if (donation.doneeId) {
      fetchUserInfo(donation.doneeId, setDoneeInfo);
    }
    if (donation.postId) {
      fetchPostInfo(donation.postId);
    }
  };

  const handleApprove = async () => {
    if (selectedDonation) {
      try {
        const donationAmount = parseInt(amount);
  
        await updateDoc(doc(FIRESTORE_DB, "gcash", selectedDonation.id), {
          approved: true,
          amount: donationAmount,
        });
  
        if (selectedDonation.donorId) {
          const donorRef = doc(FIRESTORE_DB, "users", selectedDonation.donorId);
          await updateDoc(donorRef, {
            donated: parseInt(donorInfo.donated || 0) + 1,
            donatedAmount: parseInt(donorInfo.donatedAmount || 0) + donationAmount,
          });
        }

        await updateDoc(doc(FIRESTORE_DB, "posts", selectedDonation.postId), {
          donatedAmount: parseInt(postInfo?.donatedAmount || 0) + donationAmount,
          donatedUsers: arrayUnion({
            userId: selectedDonation.donorId,
            amount: donationAmount,
            time: new Date().toISOString(),
          }),
        });
  
        setSelectedDonation({
          ...selectedDonation,
          approved: true,
          amount: donationAmount,
        });
        setModalVisible(false);
      } catch (error) {
        console.error("Error approving donation:", error);
      }
    }
  };

  const renderDonationItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleDonationPress(item)}
      style={styles.donationItem}
    >
      <Text style={styles.donorText}>Donor ID: {item.donorId}</Text>
      {item.doneeId && (
        <Text style={styles.doneeText}>Donee ID: {item.doneeId}</Text>
      )}
      <Text style={styles.postIdText}>Post ID: {item.postId}</Text>
      <Text style={styles.approvedText}>
        Status: {item.approved ? "Approved" : "Pending"}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#3EB489" style={styles.loading} />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GCash Donations</Text>
      {donations.length > 0 ? (
        <FlatList
          data={donations}
          renderItem={renderDonationItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text style={styles.noDonationsText}>No donations available</Text>
      )}

      {/* Modal for donation details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedDonation && (
              <View>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Image
                    source={{ uri: selectedDonation.proofOfDonation }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <View style={styles.modalTextContainer}>
                  <Text style={styles.modalText}>
                    Donor ID: {selectedDonation.donorId}
                  </Text>
                  {donorInfo ? (
                    <>
                      <Text style={styles.modalText}>
                        Donor Name: {donorInfo.firstName} {donorInfo.lastName}
                      </Text>
                      <Text style={styles.modalText}>
                        Donor Email: {donorInfo.email}
                      </Text>
                      <Text style={styles.modalText}>
                        Donor Phone: {donorInfo.phoneNumber}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.modalText}>Loading donor info...</Text>
                  )}
                </View>

                <View style={styles.modalTextContainer}>
                  <Text style={styles.modalText}>
                    Donee ID: {selectedDonation.doneeId}
                  </Text>
                  {doneeInfo ? (
                    <>
                      <Text style={styles.modalText}>
                        Donee Name: {doneeInfo.firstName} {doneeInfo.lastName}
                      </Text>
                      <Text style={styles.modalText}>
                        Donee Email: {doneeInfo.email}
                      </Text>
                      <Text style={styles.modalText}>
                        Donee Phone: {doneeInfo.phoneNumber}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.modalText}>Loading donee info...</Text>
                  )}
                </View>

                {/* <Text style={styles.modalText}>Post ID: {selectedDonation.postId}</Text> */}
                <Text style={styles.modalText}>
                  Date:{" "}
                  {new Date(
                    selectedDonation.timestamp.seconds * 1000
                  ).toLocaleDateString()}
                </Text>

                <TextInput
                  style={styles.amountInput}
                  placeholder="Enter amount"
                  value={amount}
                  onChangeText={(text) => setAmount(text)}
                  keyboardType="numeric"
                />

                <Pressable
                  onPress={handleApprove}
                  style={[
                    styles.approveButton,
                    { backgroundColor: amount ? "#3EB489" : "#ccc" },
                  ]}
                  disabled={!amount}
                >
                  <Text>Approve</Text>
                </Pressable>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text>Close</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  donationItem: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  donorText: {
    fontSize: 16,
    fontWeight: "600",
  },
  doneeText: {
    fontSize: 16,
  },
  postIdText: {
    fontSize: 16,
  },
  approvedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  noDonationsText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "100%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalTextContainer: {
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 2,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  approveButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#3EB489",
    width: "80%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "center",
  },
});

export default Gcash;
