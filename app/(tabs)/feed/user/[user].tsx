import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FIRESTORE_DB, getUserById } from "@/lib/firebase"; // Assuming you have a function to fetch user by ID
import { User } from "@/types";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { getDocs, collection } from "firebase/firestore";
import DonationListItem from "@/components/DonationListItem";
import { getAuth } from "firebase/auth";

const UserProfile = () => {
  const { user } = useLocalSearchParams();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDonations, setUserDonations] = useState([]);
  const { id, email, profilePicture, firstName, lastName } =
    useLocalSearchParams();
  const { currentUser } = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data
        const userData = await getUserById(user);
        setUserData(userData);

        // Fetch user donations
        if (user) {
          const querySnapshot = await getDocs(
            collection(FIRESTORE_DB, "posts")
          );
          const userDonationsData = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((post) => post.userId === user);
          setUserDonations(userDonationsData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      const userData = await getUserById(id);
      setUserData(userData);
    };

    fetchUserData();
  }, [id]);

  const isMessageButtonHidden = currentUser?.uid === user;

  if (!user) {
    return <Text>User not found</Text>;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3EB489" />
      </View>
    );
  }

  if (!userData) {
    return <Text>User Not Found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "" }} />
      <Image source={{ uri: userData.profilePicture }} style={styles.image} />
      <Text
        style={styles.userName}
      >{`${userData.firstName} ${userData.lastName}`}</Text>
      <View style={styles.statsContainer}>
        <FontAwesome
          name={"certificate"}
          size={40}
          color={"#40826D"}
          style={{ marginLeft: 10 }}
        />
      </View>
      <View style={styles.postContainer}>
        <FlatList
          data={userDonations}
          renderItem={({ item }) => <DonationListItem donation={item} />}
          keyExtractor={(item) => item.id}
        />
      </View>
    </ScrollView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 10,
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgbargba(62, 180, 137, 0.05)",
    borderRadius: 20,
    margin: 10,
    width: "100%",
    minHeight: 78,
  },
  userName: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "200",
  },
  image: {
    height: 160,
    width: 160,
    borderRadius: 999,
  },
  messageBtn: {
    marginLeft: "auto",
    backgroundColor: "#40826D",
    padding: 15,
    borderRadius: 25,
  },
  messageTxt: {
    color: "white",
  },
  postContainer: {
    backgroundColor: "rgba(62, 180, 137, 0.3)",
    borderRadius: 20,
    width: "100%",
    marginBottom: 20,
  },
});
