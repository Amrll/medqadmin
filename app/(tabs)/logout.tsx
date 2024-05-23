import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/auth";

const Logout = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Get the device's screen dimensions
    const { width } = Dimensions.get("window");

    // Adjust image dimensions based on screen width
    const imageWidth = width * 0.6;
    const imageHeight = (imageWidth * .5) / 4;

    setImageDimensions({ width: imageWidth, height: imageHeight });
  }, []);

  return (
    <View style={styles.container}>
        <Image
          source={require("@/assets/images/logout.png")}
          style={[styles.image, imageDimensions]}
        />
      <Text style={styles.message}>Are you sure you want to logout?</Text>
      <View style={styles.buttonContainer}>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={{ color: "white", fontSize: 16 }}>Log out</Text>
        </Pressable>
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={{ color: "black", fontSize: 16 }}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Logout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "30%",
  },
  logoutButton: {
    backgroundColor: "#40826D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    borderColor: "black",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  image: {
    width: "20%",
    resizeMode: "contain",
    marginBottom: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
