import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Pressable, StyleSheet, View, Text } from "react-native";

export default function MenuStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#f2f3ef",
        },
        headerShadowVisible: false,
        headerRight: () => (
          <View style={styles.container}>
            <Link href="/search" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="search"
                    size={25}
                    color={Colors.light.tint}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
            <Link href="/notifications" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="bell"
                    size={25}
                    color={Colors.light.tint}
                    style={{ marginRight: 5, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link> 
          </View>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
      <Stack.Screen name="user/[user]" options={{ title: "" }} />
      <Stack.Screen name="user/Chat" options={{ title: "" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
});
