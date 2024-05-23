import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";

const Splash = ({ loading }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!loading) {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 5000, // Adjust duration as needed
        useNativeDriver: true,
      }).start();
    }
  }, [loading, fadeAnim]);

  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Get the device's screen dimensions
    const { width } = Dimensions.get("window");

    // Adjust image dimensions based on screen width
    const imageWidth = width * 0.6;
    const imageHeight = (imageWidth * 3) / 4;

    setImageDimensions({ width: imageWidth, height: imageHeight });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/medqlogo2.png")}
          style={[styles.image, imageDimensions]}
        />
      </View>
      <View style={styles.companyNameContainer}>
        <Text style={styles.companyName}>Domain Expansion</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  companyNameContainer: {
    paddingBottom: 50,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  image: {
    resizeMode: "contain",
    marginBottom: 20,
  },
});

export default Splash;
