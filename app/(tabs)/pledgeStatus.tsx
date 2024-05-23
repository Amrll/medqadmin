import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/auth";

const defaultImage = "https://www.asiaoceania.org/aogs2021/img/no_uploaded.png";

const PledgeStatus = () => {
  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // State to track selected image for full screen view
  const db = getFirestore();
  const { user } = useAuth();
  const lastPledgeTimestampRef = useRef(null); // Reference to store the timestamp of the last fetched pledge

  useEffect(() => {
    const pledgeRef = collection(db, "pledges");
    let q = query(pledgeRef, orderBy("createdAt", "desc"));
  
    if (lastPledgeTimestampRef.current) {
      q = query(
        pledgeRef,
        where("createdAt", ">", lastPledgeTimestampRef.current),
        orderBy("createdAt", "desc")
      );
    }
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedPledges = [];
      querySnapshot.forEach((doc) => {
        fetchedPledges.push({ id: doc.id, ...doc.data() });
      });
  
      if (fetchedPledges.length > 0) {
        lastPledgeTimestampRef.current =
          fetchedPledges[fetchedPledges.length - 1].createdAt;
      }
  
      setPledges((prevPledges) => {
        const updatedPledges = [
          ...prevPledges.filter(
            (prevPledge) =>
              !fetchedPledges.some((fetchedPledge) => fetchedPledge.id === prevPledge.id)
          ),
          ...fetchedPledges,
        ];
        return updatedPledges.sort((a, b) => b.createdAt - a.createdAt);
      });
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const openFullScreen = (image) => {
    setSelectedImage(image);
  };

  const closeFullScreen = () => {
    setSelectedImage(null);
  };

  const ConfirmDonor = async (pledgeId) => {
    try {
      const pledgeRef = doc(db, "pledges", pledgeId);
      await updateDoc(pledgeRef, {
        donorConfirmed: true,
      });
    } catch (error) {
      console.error("Error confirming donor: ", error);
    }
  };

  const RejectDonor = async (pledgeId) => {
    try {
      const pledgeRef = doc(db, "pledges", pledgeId);
      // Delete donation photo URL
      await updateDoc(pledgeRef, {
        donationPhotoURL: null,
      });
    } catch (error) {
      console.error("Error rejecting donation: ", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={"#3EB489"} />
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        {pledges
          .filter((pledge) => pledge.status === "pending")
          .map((pledge) => (
            <View key={pledge.id} style={styles.pledgeContainer}>
              <TouchableOpacity
                onPress={() =>
                  openFullScreen(pledge.donationPhotoURL || defaultImage)
                }
              >
                <Image
                  source={{ uri: pledge.donationPhotoURL || defaultImage }}
                  style={styles.image}
                />
              </TouchableOpacity>
              <View>
                <Text style={styles.pledgeText}>
                  Donation Name: {pledge.donationName}
                </Text>
                <Text style={styles.pledgeText}>
                  Amount: ₱{pledge.amount.toFixed(2)}
                </Text>
                <Text style={styles.pledgeText}>
                  Donor ID: {pledge.donorId}
                </Text>
                <Text style={styles.pledgeText}>
                  Donee ID: {pledge.doneeId}
                </Text>
                <Text style={styles.pledgeText}>Status: {pledge.status}</Text>
                <Text style={styles.pledgeText}>
                  Donor Confirmed: {pledge.donorConfirmed ? "Yes" : "No"}
                </Text>
                <Text style={styles.pledgeText}>
                  Donee Confirmed: {pledge.doneeConfirmed ? "Yes" : "No"}
                </Text>
              </View>
              <View style={{ marginLeft: "auto" }}>
                <Pressable
                  style={styles.optionButton}
                  onPress={() => ConfirmDonor(pledge.id)}
                >
                  <Text style={{ color: "white" }}>Confirm Donation</Text>
                </Pressable>
                <Pressable
                  style={styles.optionButtonReject}
                  onPress={() => RejectDonor(pledge.id)}
                >
                  <Text style={{ color: "white" }}>Reject Donation</Text>
                </Pressable>
              </View>
            </View>
          ))}
      </View>

      {/* Full screen image modal */}
      <Modal visible={selectedImage !== null} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeFullScreen}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullScreenImage}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  pledgeContainer: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
  pledgeText: {
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 15,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  fullScreenImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  optionButton: {
    backgroundColor: "#40826D",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  optionButtonReject: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PledgeStatus;
