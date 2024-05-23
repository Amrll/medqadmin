import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { FIRESTORE_DB } from "@/lib/firebase";

const AdminPanel = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(FIRESTORE_DB, "verification"),
        where("status", "==", "active")
      );
      const querySnapshot = await getDocs(q);
      const verificationsData = [];

      for (const doc of querySnapshot.docs) {
        const verification = { id: doc.id, ...doc.data() };
        const userData = await fetchUserData(verification.userId);
        verification.user = userData;
        verificationsData.push(verification);
      }

      setVerifications(verificationsData);
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, "users", userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const updateVerificationStatus = async (id, status) => {
    try {
      const docRef = doc(FIRESTORE_DB, "verification", id);
      await updateDoc(docRef, { status });
      // Refresh the list of verifications
      fetchPendingVerifications();
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

  const VerificationModal = ({ verification }) => (
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
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={{ uri: verification.idImageUrl }}
                  style={styles.Image}
                />
                <Image
                  source={{ uri: verification.selfieImageUrl }}
                  style={styles.Image}
                />
              </View>
              <Text>User ID: {verification.userId}</Text>
              <Text>ID Type: {verification.idType}</Text>
              {verification.user && (
                <Text style={styles.infoText}>
                  User: {verification.user.firstName}{" "}
                  {verification.user.lastName}
                </Text>
              )}  
              <Text>
                Birthdate:{" "}
                {new Date(verification.user.birthDate).toLocaleString()}
              </Text>
              <Text>Email: {verification.user.email}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => {
                    updateVerificationStatus(verification.id, "confirmed");
                    closeModal();
                  }}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.removeButton]}
                  onPress={() => {
                    updateVerificationStatus(verification.id, "removed");
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
              <Text style={{color: 'orange', fontWeight: 'bold'}}>{verification.idType}</Text>
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
    height: '100%',
    width: '50%',
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
  }
});

export default AdminPanel;
