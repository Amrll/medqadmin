import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  Animated,
} from "react-native";
import Colors from "@/constants/Colors";
import { Donation, User } from "../types";
import { Link } from "expo-router";
import DonationProgress from "./DonationProgress";
import { getUserById } from "@/lib/firebase";
import { useState, useEffect, useRef } from "react";
import { FontAwesome } from "@expo/vector-icons";

type DonationListItemProps = {
  donation: Donation;
};

export const defaultImage =
  "https://donate.unicef.ph/sites/default/files/main_content/Secondary-Image_ALS_1.jpg";

const DonationListItem = ({ donation }: DonationListItemProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserById(donation.userId);
      setUser(userData);
      setLoading(false); // Set loading to false when data is fetched
    };

    fetchUser();
  }, [donation.userId]);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: loading ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [loading, fadeAnim]);

  let daysLeft = "Invalid dates";
  if (donation?.createdAt && donation.targetDate) {
    const currentDate = new Date(); // Convert string to Date object
    const targetDate = donation.targetDate.toDate(); // Convert timestamp to Date object
    if (!isNaN(currentDate.getTime()) && !isNaN(targetDate.getTime())) {
      const differenceMs = targetDate.getTime() - currentDate.getTime();
      daysLeft = Math.round(differenceMs / (1000 * 60 * 60 * 24));
    } else {
      daysLeft = "Invalid dates";
    }
  } else {
    daysLeft = "Date missing";
  }

  const daysLeftStyle =
    typeof daysLeft === "number" && daysLeft > 10
      ? styles.daysLeftNormal
      : styles.daysLeftWarning;

  // Render loading indicator while loading
  return (
    <Link href={`/feed/${donation.id}`} asChild>
      <Pressable style={styles.container}>
        <Animated.View
          style={{ ...styles.loadingContainer, opacity: fadeAnim }}
        >
          <ActivityIndicator size="small" color={Colors.light.tint} />
        </Animated.View>
        {!loading && user && (
          <>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: donation.image || defaultImage }}
                style={styles.image}
              />
              {donation.verified && (
                <View style={styles.iconContainer}>
                  <FontAwesome name={"star"} size={18} color={"#3EB489"} />
                </View>
              )}
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>{donation.category}</Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: 8,
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.title}>{donation.caption}</Text>
              <Text style={daysLeftStyle}>{daysLeft} days left</Text>
            </View>
            <View style={styles.detailsContainer}>
              <View style={styles.doneeContainer}>
                <Image
                  source={{ uri: user.profilePicture || defaultImage }}
                  style={styles.doneeProfile}
                />
                <Text
                  style={styles.doneeName}
                >{`${user.firstName} ${user.lastName}`}</Text>
              </View>
              <View>
                <DonationProgress
                  totalAmount={donation.amountNeeded}
                  donatedAmount={donation.donatedAmount}
                />
              </View>
            </View>
          </>
        )}
      </Pressable>
    </Link>
  );
};

export default DonationListItem;

const styles = StyleSheet.create({
  container: {
    minHeight: 250,
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 20,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginStart: 5,
  },
  image: {
    width: "100%",
    aspectRatio: 2 / 1,
    borderRadius: 20,
  },
  doneeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  doneeProfile: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent white background
  },
  doneeName: {
    fontSize: 14,
  },
  imageContainer: {
    position: "relative",
  },
  iconContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "white",
    borderRadius: 40,
    padding: 8,
  },
  categoryContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(88, 88, 88, 0.5)",
    borderRadius: 40,
    padding: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  daysLeftNormal: {
    fontSize: 16,
    color: "#3EB489",
    fontWeight: "600", // Color for more than 10 days
  },
  daysLeftWarning: {
    fontSize: 16,
    color: "#e68c8e",
    fontWeight: "600", // Color for 10 days or less
  },
});
