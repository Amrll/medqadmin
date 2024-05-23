import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import * as Progress from "react-native-progress";

const windowWidth = Dimensions.get("window").width;

const DonationProgress = ({ totalAmount, donatedAmount }) => {
  
  // Convert donatedAmount to string and remove commas if it's not already
  const cleanedDonatedAmount = typeof donatedAmount === 'string'
    ? donatedAmount.replace(/,/g, "")
    : donatedAmount.toString().replace(/,/g, "");

  // Remove commas from totalAmount
  const cleanedTotalAmount = totalAmount.replace(/,/g, "");

  const progressPercentage = (parseFloat(cleanedDonatedAmount) / parseFloat(cleanedTotalAmount)) * 100;

  return (
    <View style={styles.progressContainer}>
      <View></View>
      <View>
        <Progress.Bar
          color="#3EB489"
          progress={progressPercentage / 100}
          width={windowWidth * 0.4}
        />
        <View style={styles.textContainer}>
          <Text style={styles.text}>{`Donated ₱${donatedAmount}`}</Text>
          <Text style={styles.text}>{`Goal ₱${totalAmount}`}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    overflow: "hidden",
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 8,
  },
  textContainer: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  image: {
    position: "absolute",
    top: 2,
    right: 150,
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  text: {
    fontSize: 12,
  },
});

export default DonationProgress;
