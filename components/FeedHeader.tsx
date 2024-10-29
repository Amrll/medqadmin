import { useUserData } from "../context/UserDataContext";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "@/lib/firebase";
import { FontAwesome } from "@expo/vector-icons";

const FeedHeader = () => {
  const { userData } = useUserData();
  const [loading, setLoading] = useState(true);
  const userName = userData ? userData.firstName : "Guest";
  const donated = userData ? userData.donatedAmount : 0;
  const [activeDonationCount, setActiveDonationCount] = useState(0);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [totalFundsRaised, setTotalFundsRaised] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch active donations
        const activeDonationsQuery = query(
          collection(FIRESTORE_DB, "posts"),
          where("approved", "==", true)
        );
        const activeDonationsSnapshot = await getDocs(activeDonationsQuery);
        const activeDonations = activeDonationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActiveDonationCount(activeDonations.length);

        // Fetch all donations to calculate total funds raised
        const allDonationsQuery = query(collection(FIRESTORE_DB, "posts"));
        const allDonationsSnapshot = await getDocs(allDonationsQuery);
        const allDonations = allDonationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const totalFunds = allDonations.reduce(
          (acc, donation) => acc + (donation.donatedAmount || 0),
          0
        );
        setTotalFundsRaised(totalFunds);

        // Fetch active users
        const usersQuery = query(collection(FIRESTORE_DB, "users"));
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
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Welcome, {userName}!</Text>
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.iconTextContainer}>
            <FontAwesome
              name={"star"}
              size={24}
              color={"#473c33"}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.boldText}>{activeDonationCount}</Text>
          </View>
          <Text style={{ color: "#473c33" }}>Donations</Text>
        </View>
        <View style={styles.innerContainer}>
          <View style={styles.iconTextContainer}>
            <FontAwesome
              name={"user"}
              size={24}
              color={"#473c33"}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.boldText}>{activeUserCount}</Text>
          </View>
          <Text style={{ color: "#473c33" }}>Active Users</Text>
        </View>
        <View style={styles.innerContainer}>
          <Text style={styles.boldText}>₱{totalFundsRaised.toFixed(2)}</Text>
          <Text style={{ color: "#473c33" }}>Total Funds Raised</Text>
        </View>
        <Image
          source={require("../assets/images/donate.png")}
          style={styles.image}
        />
      </View>
    </View>
  );
};

export default FeedHeader;

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 20,
    minHeight: 200,
    marginHorizontal: 10,
    backgroundColor: "#3EB489",
    borderRadius: 10,
    overflow: "hidden",
    borderBottomColor: "#4C9C7F",
    borderBottomWidth: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    marginLeft: 20,
    marginVertical: 20,
  },
  outerContainer: {
    flexDirection: "row",
  },
  innerContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 10,
    minHeight: 100,
    justifyContent: "center",
    borderColor: "rgba(255, 255, 255, 0.7)",
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    borderTopColor: "rgba(255, 255, 255, 0.8)",
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    position: "absolute",
    top: -10,
    right: -60,
    width: 180,
    height: 130,
    resizeMode: "contain",
  },
  boldText: {
    fontSize: 25,
    color: "#473c33",
    fontWeight: "bold",
  },
});
