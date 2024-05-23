import React, { useEffect, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/context/auth";
import Button from "@/components/Button";

const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    signIn(email, password);
  };

  const [isPasswordShown, setIsPasswordShown] = useState(true);
  const [isChecked, setIsChecked] = useState(false);

  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Get the device's screen dimensions
    const { width } = Dimensions.get("window");

    // Adjust image dimensions based on screen width
    const imageWidth = width * 0.2;
    const imageHeight = (imageWidth * 3) / 4;

    setImageDimensions({ width: imageWidth, height: imageHeight });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/medqlogo1.png")}
            style={[styles.image, imageDimensions]}
          />
        </View>
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email Address"
            placeholderTextColor={"black"}
            keyboardType="email-address"
            style={styles.textInput}
            onChangeText={(text) => setEmail(text)}
          />
          <View style={{ marginBottom: 12 }}>
            <TextInput
              placeholder="Password"
              placeholderTextColor={"black"}
              secureTextEntry={isPasswordShown}
              style={styles.textInput}
              onChangeText={(text) => setPassword(text)}
            />

            <TouchableOpacity
              onPress={() => setIsPasswordShown(!isPasswordShown)}
              style={{
                position: "absolute",
                right: 10,
                top: 17,
              }}
            >
              {isPasswordShown == true ? (
                <FontAwesome name="eye" size={24} color="black" />
              ) : (
                <FontAwesome name="eye-slash" size={24} color="black" />
              )}
            </TouchableOpacity>
          </View>
          <Button text="Log in" onPress={handleSignIn} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#3EB489",
    alignItems: 'center'
  },
  header: {
    fontSize: 40,
    fontWeight: "500",
    color: "#F6F6F6",
  },
  textInput: {
    marginVertical: 8,
    width: "100%",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 20,
    height: 48,
    paddingLeft: 22,
  },
  btnContainer: {
    backgroundColor: "white",
    marginTop: 12,
  },
  imageContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  image: {
    resizeMode: "cover",
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    borderTopEndRadius: 50,
    borderTopStartRadius: 50,
    width: '40%',
    height: '60%',
  },
});

export default Login;
