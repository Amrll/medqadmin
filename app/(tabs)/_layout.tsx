import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { FIRESTORE_DB } from "@/lib/firebase";
import { query, collection, where, getDocs } from "firebase/firestore";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [activeDonationCount, setActiveDonationCount] = useState(0);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        // Fetch active donations
        const activeDonationsQuery = query(
          collection(FIRESTORE_DB, "posts"),
          where("approved", "==", false)
        );
        const activeDonationsSnapshot = await getDocs(activeDonationsQuery);
        setActiveDonationCount(activeDonationsSnapshot.size);

        // Fetch active users
        const usersQuery = query(
          collection(FIRESTORE_DB, "verification"),
          where("status", "==", "active")
        );
        const usersSnapshot = await getDocs(usersQuery);
        setActiveUserCount(usersSnapshot.size);
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen
          name="index"
          options={{
            title: "Home",
            headerRight: () => (
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="bell"
                      size={25}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
        <Drawer.Screen
          name="two"
          options={{
            title: `Donation Request (${activeDonationCount})`,
          }}
        />
        <Drawer.Screen
          name="userVerification"
          options={{
            title: `User Verification (${activeUserCount})`,
          }}
        />
        <Drawer.Screen
          name="pledgeStatus"
          options={{
            title: "Pledges",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
