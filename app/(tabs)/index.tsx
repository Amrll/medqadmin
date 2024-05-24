import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "@/lib/firebase";

export default function TabOneScreen() {
  const [loading, setLoading] = useState(true);
  const [activeDonationCount, setActiveDonationCount] = useState(0);
  const [activeUserCount, setActiveUserCount] = useState(0);
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch active donations
        const donationsQuery = query(
          collection(FIRESTORE_DB, "posts"),
          where("approved", "==", true)
        );
        const donationsSnapshot = await getDocs(donationsQuery);
        const donations = donationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActiveDonationCount(donations.length);

        // Fetch active users
        const usersQuery = query(
          collection(FIRESTORE_DB, "users"),
        );
        const usersSnapshot = await getDocs(usersQuery);
        const users = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActiveUserCount(users.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <View style={styles.infoContainer}>
              <Text style={styles.title}>Active Donations</Text>
              <Text style={styles.count}>{activeDonationCount}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.title}>Active Users</Text>
              <Text style={styles.count}>{activeUserCount}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  count: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#50C878',
    marginTop: 10,
  },
  infoContainer: {
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 2,
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
});
