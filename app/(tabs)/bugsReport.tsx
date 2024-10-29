import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "@/lib/firebase";

const PostReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Fetch bug reports from Firestore
        const querySnapshot = await getDocs(collection(FIRESTORE_DB, "bugreports"));
        const reportsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching bug reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.reportItem}>
      <Text style={styles.title}>Title: {item.title}</Text>
      <Text style={styles.description}>Description: {item.description}</Text>
      <Text style={styles.timestamp}>Submitted: {new Date(item.timestamp?.seconds * 1000).toLocaleString()}</Text>
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
      <Text style={styles.header}>Bug Reports</Text>
      {reports.length > 0 ? (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noReports}>No bug reports available</Text>
      )}
    </View>
  );
};

export default PostReports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  reportItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 14,
    color: '#777',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noReports: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
});
