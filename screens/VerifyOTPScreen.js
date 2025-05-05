import React, { useState } from "react";
import { View, Text, TextInput, Alert, Pressable, SafeAreaView } from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";

const VerifyOTPScreen = () => {
    const [otp, setOtp] = useState("");
    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params; // Lấy email từ màn hình đăng ký

    const handleVerifyOTP = () => {
        axios
            .post("http://192.168.5.123:8080/api/v1/auth/verify-otp", { email, otp })
            .then((response) => {
                Alert.alert("Verification Successful", "Your account has been activated!");
                navigation.navigate("Login");
            })
            .catch((error) => {
                console.log(error.response?.data || error);
                Alert.alert("Invalid OTP", "Please check your code and try again.");
            });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white", alignItems: "center", marginTop: 50 }}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#041E42" }}>Verify OTP</Text>
                <Text style={{ color: "gray", marginTop: 5 }}>Enter the OTP sent to {email}</Text>
            </View>

            <TextInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                style={{ width: 250, height: 50, borderWidth: 1, borderColor: "gray", borderRadius: 10, textAlign: "center", fontSize: 20 }}
                placeholder="Enter OTP"
            />

            <Pressable onPress={handleVerifyOTP} style={{ width: 200, backgroundColor: "#FEBE10", borderRadius: 6, marginTop: 30, padding: 15 }}>
                <Text style={{ textAlign: "center", color: "white", fontSize: 16, fontWeight: "bold" }}>Verify</Text>
            </Pressable>

            <Pressable onPress={() => Alert.alert("Resend OTP", "A new OTP has been sent to your email.")} style={{ marginTop: 15 }}>
                <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>Resend OTP</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default VerifyOTPScreen;
