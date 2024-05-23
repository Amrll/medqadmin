import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Modal,
} from "react-native";
import DonationListItem from "@/components/DonationListItem";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth";
import fetchPosts from "@/utils/fetchPost";
import { Link } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

// Define the structure of a post
interface Post {
  pledgeAmount: number;
  verified: boolean;
  approved: boolean;
  id: string;
  userId: string;
  image: string;
  caption: string;
  details: string;
  amountNeeded: string;
  donatedAmount: number;
  location: { latitude: number; longitude: number };
  createdAt: string;
  profilePicture: string;
  onGoing: boolean;
  targetDate: string;
  donatedUsers: string[];
}

export default function DonationScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<{
    category?: string;
    verifiedOnly?: boolean;
    nearbyOnly?: boolean;
  }>({});

  const loadPosts = async () => {
    setLoading(true);
    const fetchedPosts = await fetchPosts();
    setPosts(fetchedPosts);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts().then(() => setRefreshing(false));
  };

  const toggleNearbyFilter = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      nearbyOnly: !prevFilters.nearbyOnly,
    }));
  };

  const toggleVerifiedFilter = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      VerifiedOnly: !prevFilters.verifiedOnly,
    }));
  };

  const renderItem = ({ item }: { item: Post }) => (
    <DonationListItem donation={item} />
  );

  return (
    <FlatList
      style={{ backgroundColor: "#f2f3ef" }}
      ListHeaderComponent={() => (
        <View>
          {/* <FeaturedDonation /> */}
          <View style={styles.middleContainer}>
            <Text style={styles.donateText}>Donate Now</Text>
            <Pressable
              onPress={() => setShowFilterModal(true)}
              style={{ marginRight: 20 }}
            >
              <FontAwesome name="filter" size={20} color="#40826D" />
            </Pressable>
          </View>
        </View>
      )}
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListFooterComponent={() =>
        loading && <ActivityIndicator size="small" color={'#40826D'} />
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  middleContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  donateText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#f2f3ef",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
    width: "100%",
    height: "80%",
  },
  modalTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    padding: 10,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  optionsContainer: {
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 10,
    marginVertical: 3,
  },
});
