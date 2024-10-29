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

    // Update notifications using arrayUnion
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

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  const handleApprove = async (post) => {
    const { id, userId, image, caption } = post;
    await approveDonation(id, userId, image, caption);
  };

  const openModal = (post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPost(null);
  };

  const PostModal = ({ post}) => {
    const [loadingImage, setLoadingImage] = useState(true); // Track image loading state
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageLoad = () => {
      // Image has loaded fully
      setLoadingImage(false);
      setImageLoaded(true);
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
              {/* Show ActivityIndicator while the image is loading */}
              {loadingImage && !imageLoaded && (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
              )}

              {/* Render the image only if it's fully loaded */}
              <Image
                source={{ uri: post.image }}
                style={[styles.Image, { display: imageLoaded? 'flex' : 'none' }]}
                resizeMode="contain"
                onLoad={handleImageLoad} // Once image is loaded, hide loader // Hide loader if there's an error loading the image
              />

              <Text>Caption: {post.caption}</Text>
              <Text>Details: {post.details}</Text>
              <Text>Amount Needed: {post.amountNeeded}</Text>
              <Text>Category: {post.category}</Text>
              <Text>Target Date: {new Date(post.targetDate).toLocaleDateString()}</Text>
              <Text>Location: {post.location.latitude}, {post.location.longitude}</Text>

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
    width: 300,
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
});

export default AdminPanel;
