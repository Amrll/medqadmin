import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { FIRESTORE_DB } from "@/lib/firebase";

const AdminPanel = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Real-time listener for verifications with 'active' status
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(FIRESTORE_DB, "verification"),
      where("status", "==", "active")
    );
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const verificationsData = [];

        for (const doc of snapshot.docs) {
          const verification = { id: doc.id, ...doc.data() };
          const userData = await fetchUserData(verification.userId);
          verification.user = userData;
          verificationsData.push(verification);
        }

        setVerifications(verificationsData);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Error fetching real-time updates for verifications:",
          error
        );
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, "users", userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const updateVerificationStatus = async (id, userId, status) => {
    try {
      const verificationDocRef = doc(FIRESTORE_DB, "verification", id);
      await updateDoc(verificationDocRef, { status });

      if (status === "confirmed") {
        const userDocRef = doc(FIRESTORE_DB, "users", userId);
        await updateDoc(userDocRef, { verified: true });

        const notificationsRef = doc(FIRESTORE_DB, "notifications", userId);
        const currentTime = new Date().toISOString();
  
        await updateDoc(notificationsRef, {
          notifications: arrayUnion({
            time: currentTime,
            verificationId: id,
          }),
        });
      }
    } catch (error) {
      console.error("Error updating verification status:", error);
    }
  };

  const openModal = (verification) => {
    setSelectedVerification(verification);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedVerification(null);
  };


  const VerificationModal = ({ verification }) => {
    const [imagesLoaded, setImagesLoaded] = useState({
      idImage: false,
      selfieImage: false,
    });

    const allImagesLoaded = imagesLoaded.idImage && imagesLoaded.selfieImage;

    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {verification ? (
              <>
                {!allImagesLoaded && (
                  <ActivityIndicator
                    size="large"
                    color="#0000ff"
                    style={styles.loader}
                  />
                )}
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <Image
                    source={{ uri: verification.idImageUrl }}
                    style={[
                      styles.Image,
                      { display: imagesLoaded.idImage ? "flex" : "none" },
                    ]}
                    resizeMode="contain"
                    onLoad={() =>
                      setImagesLoaded((prev) => ({ ...prev, idImage: true }))
                    }
                  />
                  <Image
                    source={{ uri: verification.selfieImageUrl }}
                    style={[
                      styles.Image,
                      { display: imagesLoaded.selfieImage ? "flex" : "none" },
                    ]}
                    resizeMode="contain"
                    onLoad={() =>
                      setImagesLoaded((prev) => ({
                        ...prev,
                        selfieImage: true,
                      }))
                    }
                  />
                </View>
                <Text>User ID: {verification.userId}</Text>
                <Text>ID Type: {verification.idType}</Text>
                {verification.user && (
                  <Text style={styles.infoText}>
                    Full Name: {verification.user.firstName}{" "}
                    {verification.user.lastName}
                  </Text>
                )}
                <Text>
                  Birthdate:
                  {new Date(verification.user.birthDate.seconds * 1000).toLocaleDateString()}
                </Text>
                <Text>Email: {verification.user.email}</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={() => {
                      updateVerificationStatus(
                        verification.id,
                        verification.userId,
                        "confirmed"
                      );
                      closeModal();
                    }}
                  >
                    <Text style={styles.buttonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.removeButton]}
                    onPress={() => {
                      updateVerificationStatus(verification.id, verification.userId, "removed");
                      closeModal();
                    }}
                  >
                    <Text style={styles.buttonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.closeButton}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text>Loading...</Text>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        verifications.map((verification) => (
          <TouchableOpacity
            key={verification.id}
            style={styles.verificationCard}
            onPress={() => openModal(verification)}
          >
            <View style={styles.infoContainer}>
              <View style={styles.profileContainer}>
                <Image
                  source={{ uri: verification.user.profilePicture }}
                  style={styles.ProfilePicture}
                />
                <Text>
                  {verification.user.firstName} {verification.user.lastName}
                </Text>
              </View>
              <Text style={{ color: "orange", fontWeight: "bold" }}>
                {verification.idType}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
      {selectedVerification && (
        <VerificationModal verification={selectedVerification} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  verificationCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  removeButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  Image: {
    width: 300,
    height: 300,
    borderRadius: 15,
    marginRight: 10,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 1, // Ensure loader is above the image
  },
  ProfilePicture: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    height: "100%",
    width: "50%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: "#ccc",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    color: "black",
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 30,
  },
  infoText: {
    fontSize: 14,
  },
});

export default AdminPanel;
