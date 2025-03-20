import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
} from "react-native";
import React, { useLayoutEffect, useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "../assets/Ute2022New.png";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const ProfileScreen = () => {
  const { userId, token } = useContext(UserType);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerStyle: {
        backgroundColor: "#878595",
      },
      headerLeft: () => (
        <Image
          style={{
            width: 140,
            height: 120,
            resizeMode: "contain",
          }}
          source={logo}
        />
      ),
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginRight: 12,
          }}
        >
          <Ionicons name="notifications-outline" size={24} color="black" />
          <AntDesign name="search1" size={24} color="black" />
        </View>
      ),
    });
  }, []);

  const logout = () => {
    clearAuthToken();
  };

  const clearAuthToken = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("refreshToken");
    console.log("auth token cleared");
    navigation.replace("Login");
  };

  const fetchOrders = async () => {
    if (!userId || !token) {
      console.warn("⚠️ userId hoặc token đang trống!");
      return;
    }

    try {
      const response = await axios.get(
        `http://192.168.1.240:8080/api/v1/user/my-orders/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const ordersData = Array.isArray(response.data) ? response.data : [response.data];
      setOrders(ordersData);
    } catch (error) {
      console.error("❌ Lỗi khi lấy đơn hàng:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [userId, token])
  );

  const renderOrderItem = ({ item }) => {
    const statusStyles = {
      NEW: { color: "#007bff" },
      CONFIRMED: { color: "#ffc107" },
      PREPARING: { color: "#6f42c1" },
      SHIPPING: { color: "#17a2b8" },
      DELIVERED: { color: "#28a745" },
      CANCELED: { color: "#dc3545" },
    };

    return (
      <Pressable
        style={styles.orderCard}
        onPress={() => navigation.navigate("OrderHistory", { orderId: item.id })}
      >
        <Text style={styles.orderId}>Mã đơn: {item.id}</Text>
        <Text style={styles.orderAmount}>
          Tổng tiền: {item.totalAmount.toLocaleString()} VND
        </Text>
        {item.couponName && item.couponName !== "NONE" && (
          <Text style={styles.couponName}>🎁 {item.couponName}</Text>
        )}
        <Text style={[styles.orderStatus, statusStyles[item.orderStatus]]}>
          🏷 {item.orderStatus}
        </Text>
        {Array.isArray(item.cartItems) && item.cartItems.slice(0, 1).map((cartItem) => (
          <Image
            key={cartItem.id}
            source={{
              uri: cartItem.img || "https://cdni.iconscout.com/illustration/premium/thumb/product-is-empty-illustration-download-in-svg-png-gif-file-formats--no-records-list-record-emply-data-user-interface-pack-design-development-illustrations-6430781.png?f=webp",
            }}
            style={styles.orderImage}
            resizeMode="contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://cdni.iconscout.com/illustration/premium/thumb/product-is-empty-illustration-download-in-svg-png-gif-file-formats--no-records-list-record-emply-data-user-interface-pack-design-development-illustrations-6430781.png?f=webp";
            }}
          />
        ))}
      </Pressable>
    );
  };

  return (
    <FlatList
      data={orders}
      renderItem={renderOrderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={styles.ordersListContent}
      ListHeaderComponent={
        <>
          <Text style={styles.welcomeText}>Welcome</Text>
          <View style={styles.buttonRow}>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Your orders</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => navigation.replace("Account")}>
              <Text style={styles.buttonText}>Your Account</Text>
            </Pressable>
          </View>
          <View style={styles.buttonRow}>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Buy Again</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={logout}>
              <Text style={styles.buttonText}>Logout</Text>
            </Pressable>
          </View>
        </>
      }
      ListFooterComponent={loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : orders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders found</Text>
      ) : null}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 25,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  ordersListContent: {
    paddingBottom: 15,
  },
  orderCard: {
    flex: 0.5,
    backgroundColor: "#fff",
    margin: 5,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#28a745",
    marginTop: 5,
  },
  couponName: {
    fontSize: 12,
    color: "#007bff",
    fontStyle: "italic",
    marginTop: 5,
  },
  orderStatus: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: "600",
  },
  orderImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  noOrdersText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});

export default ProfileScreen;
