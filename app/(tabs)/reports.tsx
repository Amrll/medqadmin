import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
  Alert,
} from "react-native";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { FIRESTORE_DB } from "@/lib/firebase"; // Adjust import path as needed

const PostReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Define a function to handle the real-time updates
    const unsubscribe = onSnapshot(
      collection(FIRESTORE_DB, "appreports"),
      (querySnapshot) => {
        const reportsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportsData);
        setLoading(false); // Set loading to false once data is received
      },
      (error) => {
        console.error("Error fetching reports:", error);
        setLoading(false); // Set loading to false on error
      }
    );

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, []);

  const handleDelete = async (
    donationId: string,
    reportId: string,
    userId: string,
    reason: string
  ) => {
    try {
      await deleteDoc(doc(FIRESTORE_DB, "posts", donationId));
      await deleteDoc(doc(FIRESTORE_DB, "appreports", reportId));

      await setDoc(doc(FIRESTORE_DB, "userWarning", userId), {
        reason: reason,
        timestamp: Timestamp.fromDate(new Date()), // Current timestamp
      }, { merge: true });
      
      Alert.alert("Success", "Donation deleted successfully.");
    } catch (error) {
      Alert.alert("Error", "Unable to delete report.");
    }
  };

  const handleIgnore = (reportId: string) => {
    Alert.alert("Ignored", "Report ignored successfully.");
    // Optionally implement logic to ignore the report if needed
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.reportItem}>
      <Text style={styles.title}>Report ID: {item.id}</Text>
      <Text style={styles.details}>Reason: {item.reason}</Text>
      <Text style={styles.details}>User: {item.userName}</Text>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <Text style={styles.details}>Caption: {item.caption}</Text>
      <Text style={styles.details}>Details: {item.details}</Text>
      <Text style={styles.timestamp}>
        Reported At: {new Date(item.timestamp?.seconds * 1000).toLocaleString()}
      </Text>
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => handleIgnore(item.id)}>
          <Text style={styles.buttonText}>Ignore</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.deleteButton]}
          onPress={() =>
            handleDelete(item.donationId, item.id, item.userId, item.reason)
          }
        >
          <Text style={styles.buttonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#62b485" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report List</Text>
      {reports.length > 0 ? (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noReports}>No reports available</Text>
      )}
    </View>
  );
};

export default PostReports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
  reportItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  details: {
    fontSize: 16,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReports: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
  },
});
