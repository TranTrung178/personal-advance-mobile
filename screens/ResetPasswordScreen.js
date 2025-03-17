import React, { useState } from "react";
import { View, Text, TextInput, Alert, Pressable, SafeAreaView } from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";

const ResetPasswordScreen = () => {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params;

    const handleResetPassword = () => {
        axios
            .post("http://192.168.1.240:8080/api/v1/auth/reset-password", { email, otp, newPassword })
            .then((response) => {
                Alert.alert("Success", "Your password has been reset.");
                navigation.navigate("Login");
            })
            .catch((error) => {
                Alert.alert("Error", "Invalid OTP or other error.");
                console.log(error.response?.data || error);
            });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white", alignItems: "center", marginTop: 50 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#041E42" }}>Reset Password</Text>
            <Text style={{ color: "gray", marginTop: 5 }}>Enter the OTP & new password</Text>

            <TextInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                style={{ width: 250, height: 50, borderWidth: 1, borderColor: "gray", borderRadius: 10, textAlign: "center", fontSize: 16, marginTop: 20 }}
                placeholder="Enter OTP"
            />

            <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={{ width: 250, height: 50, borderWidth: 1, borderColor: "gray", borderRadius: 10, textAlign: "center", fontSize: 16, marginTop: 20 }}
                placeholder="New Password"
            />

            <Pressable
                onPress={handleResetPassword}
                style={{ width: 200, backgroundColor: "#FEBE10", borderRadius: 6, marginTop: 30, padding: 15 }}
            >
                <Text style={{ textAlign: "center", color: "white", fontSize: 16, fontWeight: "bold" }}>Reset Password</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default ResetPasswordScreen;
