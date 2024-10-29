import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
import { FIRESTORE_DB } from "@/lib/firebase";
import "../../assets/images/PlantPhase/plant1.png";
import "../../assets/images/PlantPhase/plant2.png";
import "../../assets/images/PlantPhase/plant3.png";
import "../../assets/images/PlantPhase/plant4.png";
import "../../assets/images/PlantPhase/plant5.png";
import "../../assets/images/PlantPhase/plant6.png";
import FundsRaisedComparisonChart from "@/components/FundsRaisedChart";
import { Drawer } from "expo-router/drawer";
import { Stack } from "expo-router";
import FeedHeader from "@/components/FeedHeader";

export default function TabOneScreen() {
  const [loading, setLoading] = useState(true);
  const [activeDonationCount, setActiveDonationCount] = useState(0);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [totalFundsRaised, setTotalFundsRaised] = useState(0);
  const [recentDonations, setRecentDonations] = useState<{ id: string }[]>([]);

  useEffect(() => {
    const fetchRecentDonations = async () => {
      try {
        const recentDonationsQuery = query(
          collection(FIRESTORE_DB, "DirectDonations"),
          orderBy("createdAt", "desc"),
          limit(7)
        );
        const recentDonationsSnapshot = await getDocs(recentDonationsQuery);
        const recentDonationsData = recentDonationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentDonations(recentDonationsData);
      } catch (error) {
        console.error("Error fetching recent donations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDonations();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          <FeedHeader />
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                flex: 1,
                margin: 10,
                borderRadius: 5,
                padding: 20,
                backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", marginBottom: 25 }}
              >
                Recent Activity
              </Text>
              {recentDonations.map((donation, index) => (
                <TouchableOpacity
                  style={{ width: "100%" }}
                  key={index}
                  onPress={() => console.log("Donation:", donation)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <Image
                      source={{ uri: donation.donationImage }}
                      style={styles.image}
                    />
                    <Text style={styles.activityText}>
                      {donation.donationName} raised ₱{donation.amount}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
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
    backgroundColor: "#F2F2F2",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  count: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginTop: 10,
  },
  infoContainer: {
    alignItems: "center",
    borderColor: "black",
    borderWidth: 2,
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  plantImage: {
    width: 400,
    height: 400,
    marginBottom: 20,
  },
});
