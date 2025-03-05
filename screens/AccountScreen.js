import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { UserType } from "../UserContext";

const AccountScreen = () => {
    const { userId, token } = useContext(UserType);
    const [user, setUser] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!userId || !token) {
                console.warn("⚠️ userId hoặc token đang trống!");
                return;
            }

            try {
                const response = await axios.get(
                    `http://192.168.1.170:8080/api/v1/auth/user/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setUser(response.data);
            } catch (error) {
                console.error("❌ Lỗi khi lấy thông tin user:", error.response?.status, error.response?.data || error);
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
            {user ? (
                <View style={styles.infoContainer}>
                    <Image
                        source={{ uri: "https://img.freepik.com/premium-vector/avatar-profile-vector-illustrations-website-social-networks-user-profile-icon_495897-224.jpg" }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{user.fullname}</Text>
                    <Text style={styles.email}>📧 {user.email}</Text>
                    <Text style={styles.role}>🎭 Role: {user.role}</Text>

                    {/* Nút quay về Profile */}
                    <Pressable style={styles.button} onPress={() => navigation.replace("Main")}>
                        <Text style={styles.buttonText}>Quay về Profile</Text>
                    </Pressable>

                    {/* Nút chỉnh sửa thông tin */}
                    <Pressable style={styles.button} onPress={() => navigation.navigate("ChangeEmailScreen")}>
                        <Text style={styles.buttonText}>Thay đổi Email</Text>
                    </Pressable>

                    {/* Nút đăng xuất */}
                    <Pressable style={[styles.button, styles.logoutButton]} onPress={logout}>
                        <Text style={styles.buttonText}>Đăng xuất</Text>
                    </Pressable>
                </View>
            ) : (
                <Text>Đang tải thông tin...</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    infoContainer: {
        alignItems: "center",
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: "gray",
        marginBottom: 5,
    },
    role: {
        fontSize: 16,
        color: "gray",
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#00CED1",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: 200,
        alignItems: "center",
    },
    logoutButton: {
        backgroundColor: "#FF6347",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default AccountScreen;
