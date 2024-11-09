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
  Alert,
} from "react-native";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  arrayUnion,
  getDoc, // Import getDoc for fetching individual user document
} from "firebase/firestore";
import { FIRESTORE_DB } from "@/lib/firebase";

const approveDonation = async (id, userId, postImage, caption) => {
  try {
    const donationRef = doc(FIRESTORE_DB, "posts", id);
    await updateDoc(donationRef, {
      approved: true,
    });

    const notificationsRef = doc(FIRESTORE_DB, "notifications", userId);
    const currentTime = new Date().toISOString();

    await updateDoc(notificationsRef, {
      notifications: arrayUnion({
        postImage: postImage,
        approved: true,
        time: currentTime,
        caption: caption,
      }),
    });

    Alert.alert(
      "Donation Approved",
      "The donation has been approved successfully."
    );
  } catch (error) {
    console.error("Error approving donation:", error);
    Alert.alert("Error", "An error occurred while approving the donation.");
  }
};

const AdminPanel = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null); // State to store user data

  useEffect(() => {
    const q = query(
      collection(FIRESTORE_DB, "posts"),
      where("approved", "==", false)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching pending posts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const userRef = doc(FIRESTORE_DB, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        console.log("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleApprove = async (post) => {
    const { id, userId, image, caption } = post;
    await approveDonation(id, userId, image, caption);
  };

  const openModal = (post) => {
    setSelectedPost(post);
    fetchUserData(post.userId); // Fetch user data when opening modal
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPost(null);
    setUserData(null); // Reset user data on modal close
  };

  const PostModal = ({ post }) => {
    const [loadingImage, setLoadingImage] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageLoad = () => {
      setLoadingImage(false);
      setImageLoaded(true);
    };

    const openImageModal = (imageUri) => {
      setSelectedImage(imageUri);
    };

    const closeImageModal = () => {
      setSelectedImage(null);
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {post ? (
              <>
                {loadingImage && !imageLoaded && (
                  <ActivityIndicator
                    size="large"
                    color="#0000ff"
                    style={styles.loader}
                  />
                )}
                <View style={{ flexDirection: "row" }}>
                  <View style={{flex: 1,}}>
                    <Image
                      source={{ uri: post.image }}
                      style={[
                        styles.image,
                        { display: imageLoaded ? "flex" : "none" },
                      ]}
                      resizeMode="contain"
                      onLoad={handleImageLoad}
                    />
                  </View>
                  <View style={{flex: 1,}}>
                    <Text style={{ marginTop: 20, fontSize: 18 }}>
                      Supporting Images
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.supportingImagesContainer}
                    >
                      {post.supportingImages.map((imageUri, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => openImageModal(imageUri)}
                        >
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.supportingImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.textContainer}>
                  {userData && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>User:</Text>
                      <Text style={styles.value}>
                        {userData.firstName} {userData.lastName}
                      </Text>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Caption:</Text>
                    <Text style={styles.value}>{post.caption}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Details:</Text>
                    <Text style={styles.value}>{post.details}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Amount Needed:</Text>
                    <Text style={styles.value}>{post.amountNeeded}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Category:</Text>
                    <Text style={styles.value}>{post.category}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Target Date:</Text>
                    <Text style={styles.value}>
                      {post.targetDate && post.targetDate.toDate
                        ? post.targetDate.toDate().toLocaleDateString()
                        : "Date not available"}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Location:</Text>
                    <Text style={styles.value}>
                      {post.barangay}, {post.city}
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={() => {
                      handleApprove(post);
                      closeModal();
                    }}
                  >
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.removeButton]}
                    onPress={() => {
                      updatePostStatus(post.id, false);
                      closeModal();
                    }}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
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

          {selectedImage && (
            <Modal
              animationType="fade"
              transparent={true}
              visible={true}
              onRequestClose={closeImageModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.imageModalContainer}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity onPress={closeImageModal}>
                    <Text style={styles.closeButton}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        posts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
            onPress={() => openModal(post)}
          >
            <Text>{post.caption}</Text>
            <Text>{post.category}</Text>
          </TouchableOpacity>
        ))
      )}
      {selectedPost && <PostModal post={selectedPost} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  postCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  Image: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    maxHeight: "90%",
    width: "70%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 10,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 1, // Ensure loader is above the image
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
  closeButton: {
    marginTop: 10,
    color: "blue",
    textAlign: "center",
  },
  supportingImagesContainer: {
    flexDirection: "row",
    marginVertical: 10,
  },
  supportingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  imageModalContainer: {
    width: "50%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fullImage: {
    width: "100%",
    height: "90%",
    borderRadius: 10,
    marginBottom: 10,
  },
  textContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 5,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    flex: 0.4,
  },
  value: {
    fontSize: 16,
    color: "#555",
    textAlign: "right",
    flex: 0.6,
  },
});

export default AdminPanel;
