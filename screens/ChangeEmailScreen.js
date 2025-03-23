import React, { useState, useContext, useId } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";
import axios from "axios";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";

const ChangeEmailScreen = () => {
    const { userId, token } = useContext(UserType);
    const [newEmail, setNewEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isChange, setIsChange] = useState(true);
    const navigation = useNavigation();

    // Gửi OTP đến email mới
    const sendOtp = async () => {
        if (!newEmail.includes("@")) {
            Alert.alert("Lỗi", "Email không hợp lệ");
            return;
        }

        try {
            const response = await axios.post(
                "http://192.168.1.249:8080/api/v1/user/change-email",
                {
                    email: newEmail,
                    userId: userId
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("djđfd1", userId)

            Alert.alert("Thành công", "Mã OTP đã được gửi tới email của bạn");
            setIsOtpSent(true);
            setIsChange(false);
        } catch (error) {
            Alert.alert("Lỗi", error.response?.data?.message || "Không thể gửi OTP");
        }
    };

    // Xác nhận OTP và cập nhật email
    const verifyOtpAndUpdateEmail = async () => {
        if (!otp) {
            Alert.alert("Lỗi", "Vui lòng nhập mã OTP");
            return;
        }

        try {
            console.log(userId, newEmail, otp)

            const response = await axios.post(
                "http://192.168.1.249:8080/api/v1/user/verify-otp",
                { userId, email: newEmail, otp },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(userId, newEmail, otp)

            Alert.alert("Thành công", "Email của bạn đã được cập nhật");
            navigation.replace("Main");
        } catch (error) {
            Alert.alert("Lỗi", error.response?.data?.message || "Xác thực OTP thất bại");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thay đổi Email</Text>

            <TextInput
                style={styles.input}
                placeholder="Nhập email mới"
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {
                isChange && (
                    <>
                        <Pressable style={styles.button} onPress={sendOtp}>
                            <Text style={styles.buttonText}>Gửi OTP</Text>
                        </Pressable>
                    </>
                )

            }



            {isOtpSent && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập mã OTP"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                    />

                    <Pressable style={styles.button} onPress={verifyOtpAndUpdateEmail}>
                        <Text style={styles.buttonText}>Xác nhận</Text>
                    </Pressable>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        width: "90%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#00CED1",
        padding: 10,
        borderRadius: 5,
        width: 200,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default ChangeEmailScreen;
