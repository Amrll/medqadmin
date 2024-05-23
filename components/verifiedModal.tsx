import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

const DonationVerificationModal = ({ modalVisible, handleModalClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleModalClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <FontAwesome name={"star"} size={25} color={"#3EB489"} />
            </View>
            <Text style={styles.modalText}>Donation verified</Text>
          </View>
          <Text style={styles.descText}>
            This donation has been verified to be genuinely needed by the aid
            seeker
          </Text>
          <TouchableOpacity
            style={styles.openButton}
            onPress={handleModalClose}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  descText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "300",
  },
  openButton: {
    backgroundColor: "#3EB489",
    borderRadius: 15,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  iconContainer: {
    marginRight: 5,
  },
});

export default DonationVerificationModal;
