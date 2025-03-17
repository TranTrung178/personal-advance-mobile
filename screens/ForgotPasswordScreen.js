import React, { useState } from "react";
import { View, Text, TextInput, Alert, Pressable, SafeAreaView } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState("");
    const navigation = useNavigation();

    const handleForgotPassword = () => {
        axios
            .post("http://192.168.1.240:8080/api/v1/auth/forget-password", { email })
            .then((response) => {
                Alert.alert("OTP Sent", "Check your email for the OTP.");
                navigation.navigate("ResetPassword", { email });
            })
            .catch((error) => {
                Alert.alert("Error", "Email not found. Please try again.");
                console.log(error.response?.data || error);
            });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white", alignItems: "center", marginTop: 50 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#041E42" }}>Forgot Password</Text>
            <Text style={{ color: "gray", marginTop: 5 }}>Enter your email to receive OTP</Text>

            <TextInput
                value={email}
                onChangeText={setEmail}
                style={{
                    width: 250,
                    height: 50,
                    borderWidth: 1,
                    borderColor: "gray",
                    borderRadius: 10,
                    textAlign: "center",
                    fontSize: 16,
                    marginTop: 20,
                }}
                placeholder="Enter Email"
                keyboardType="email-address"
            />

            <Pressable
                onPress={handleForgotPassword}
                style={{ width: 200, backgroundColor: "#FEBE10", borderRadius: 6, marginTop: 30, padding: 15 }}
            >
                <Text style={{ textAlign: "center", color: "white", fontSize: 16, fontWeight: "bold" }}>Send OTP</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;
