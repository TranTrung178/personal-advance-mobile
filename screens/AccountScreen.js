import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { UserType } from "../UserContext";

const AccountScreen = () => {
    const { userId, token } = useContext(UserType);
    const [user, setUser] = useState(null);
    const [reviewPoints, setReviewPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!userId || !token) {
                console.warn("⚠️ userId hoặc token đang trống!");
                setLoading(false);
                return;
            }

            try {
                // Lấy thông tin user
                const userResponse = await axios.get(
                    `http://192.168.5.123:8080/api/v1/auth/user/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setUser(userResponse.data);

                // Lấy số điểm tích lũy
                const pointsResponse = await axios.get(
                    `http://192.168.5.123:8080/api/v1/user/review/coupon/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setReviewPoints(pointsResponse.data || 0);
            } catch (error) {
                console.error("❌ Lỗi khi lấy thông tin:", error.response?.status, error.response?.data || error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId, token]);

    const logout = async () => {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userId");
        await AsyncStorage.removeItem("refreshToken");
        console.log("auth token cleared");
        navigation.replace("Login");
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00CED1" />
                    <Text style={styles.loadingText}>Đang tải thông tin...</Text>
                </View>
            ) : user ? (
                <View style={styles.infoContainer}>
                    <Image
                        source={{ uri: "https://img.freepik.com/premium-vector/avatar-profile-vector-illustrations-website-social-networks-user-profile-icon_495897-224.jpg" }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{user.fullname}</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>📧 Email: {user.email}</Text>
                        <Text style={styles.infoText}>🎭 Role: {user.role}</Text>
                        <Text style={styles.infoText}>🆔 ID: {userId}</Text>
                        <Text style={styles.infoText}>⭐ Điểm tích lũy: {reviewPoints} bình luận</Text>
                    </View>

                    <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={() => navigation.replace("Main")}>
                        <Text style={styles.buttonText}>Quay về Profile</Text>
                    </Pressable>

                    <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={() => navigation.navigate("ChangeEmailScreen")}>
                        <Text style={styles.buttonText}>Thay đổi Email</Text>
                    </Pressable>

                    <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]} onPress={logout}>
                        <Text style={styles.buttonText}>Đăng xuất</Text>
                    </Pressable>
                </View>
            ) : (
                <Text style={styles.errorText}>Không thể tải thông tin user.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "linear-gradient(180deg, #E0F7FA 0%, #FFFFFF 100%)",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    infoContainer: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        width: "90%",
        maxWidth: 400,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: "#00CED1",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    name: {
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
        marginBottom: 15,
        textAlign: "center",
    },
    infoCard: {
        backgroundColor: "#F9F9F9",
        borderRadius: 10,
        padding: 15,
        width: "100%",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    infoText: {
        fontSize: 16,
        color: "#555",
        marginBottom: 10,
        fontWeight: "500",
    },
    button: {
        backgroundColor: "#00CED1",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
        width: "100%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutButton: {
        backgroundColor: "#FF6347",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
        width: "100%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#555",
        marginTop: 10,
    },
    errorText: {
        fontSize: 16,
        color: "#FF6347",
        textAlign: "center",
    },
});

export default AccountScreen;