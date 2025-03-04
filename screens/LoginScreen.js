import { Text } from "react-native-paper";

import {
  StyleSheet,

  View,
  Image,

  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { BlurView } from "@react-native-community/blur";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useContext } from "react";
import { UserType } from "../UserContext";

import Background from "../components/BackgroundLogin";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import BackButton from "../components/BackButton";
import { theme } from "../core/theme";
import { useNavigation } from "@react-navigation/native";


export default function LoginScreen() {
  const { setUserId, setToken } = useContext(UserType);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (token) {
          navigation.replace("Main");
        }
      } catch (err) {
        console.log("error message", err);
      }
    };
    checkLoginStatus();
  }, []);
  const handleLogin = () => {
    const user = {
      email: email,
      password: password,
    };
    console.log(user)

    axios
      .post("http://192.168.1.10:8080/api/v1/auth/signin", user)
      .then((response) => {
        const user = response.data.user;
        const token = response.data.token;
        const refreshToken = response.data.refreshToken;

        AsyncStorage.setItem("userId", user.userId);
        AsyncStorage.setItem("authToken", token);
        AsyncStorage.setItem("refreshToken", refreshToken);

        setUserId(user.userId);
        setToken(token);

        navigation.replace("Main");
      })
      .catch((error) => {
        console.log('error login: ', error);
        Alert.alert(`Login Error", "Invalid Email ${error}`);
      });
  };

  return (
    <Background>
      {/* <BlurView style={{ position: "absolute", }} blurType="light" blurAmount={15} /> */}

      <View style={{
        marginTop: 100,
        backgroundColor: "rgba(255, 255, 255, 0.5)", // Màu trắng mờ
        padding: 20,
        borderRadius: 10, // Bo góc
        shadowColor: "#000",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        elevation: 5, // Đổ bóng trên Android
        width: "350",
        height: "400",
        alignItems: "center",
        zIndex: 1,
      }}>
        {/* <BackButton goBack={navigation.goBack} /> */}
        {/* <Logo /> */}
        <Text style={{ fontSize: 40 }}>Login</Text>
        <TextInput
          label="Email"
          returnKeyType="next"
          value={email.value}
          onChangeText={(text) => setEmail(text)}
          error={!!email.error}
          errorText={email.error}
          autoCapitalize="none"
          autoCompleteType="email"
          textContentType="emailAddress"
          keyboardType="email-address"
        />
        <TextInput
          label="Password"
          returnKeyType="done"
          value={password.value}
          onChangeText={setPassword}
          error={!!password.error}
          errorText={password.error}
          secureTextEntry
        />
        <View style={styles.forgotPassword}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgot}>Forgot your password ?</Text>
          </TouchableOpacity>
        </View>
        <Button mode="contained" onPress={handleLogin}>
          Log in
        </Button>
        <View style={styles.row}>
          <Text>You do not have an account yet ?</Text>
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>Create !</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
