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
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
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
            gap: 10,
            marginRight: 12,
          }}
        >
          <Ionicons name="notifications-outline" size={26} color="#333333" />
          <AntDesign name="search1" size={26} color="#333333" />
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
        `http://192.168.5.123:8080/api/v1/user/my-orders/${userId}`,
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
      NEW: { color: "#007bff", backgroundColor: "#e6f3ff" },
      CONFIRMED: { color: "#ffc107", backgroundColor: "#fff8e1" },
      PREPARING: { color: "#6f42c1", backgroundColor: "#f3e8ff" },
      SHIPPING: { color: "#17a2b8", backgroundColor: "#e6f7fa" },
      DELIVERED: { color: "#28a745", backgroundColor: "#e6f4ea" },
      CANCELED: { color: "#dc3545", backgroundColor: "#f8e8eb" },
    };

    return (
      <Pressable
        style={({ pressed }) => [
          styles.orderCard,
          { backgroundColor: statusStyles[item.orderStatus].backgroundColor },
          pressed && styles.orderCardPressed,
        ]}
        onPress={() => navigation.navigate("OrderHistory", { orderId: item.id })}
      >
        <Text style={styles.orderId}>Mã đơn: {item.id}</Text>
        <Text style={styles.orderAmount}>
          Tổng tiền: {item.totalAmount.toLocaleString()} VND
        </Text>
        {item.couponName && item.couponName !== "NONE" && (
          <Text style={styles.couponName}>🎁 {item.couponName}</Text>
        )}
        <Text style={[styles.orderStatus, { color: statusStyles[item.orderStatus].color }]}>
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
          <Text style={styles.welcomeText}>Profile</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => navigation.navigate("Wishlist")}
            >
              <AntDesign name="heart" size={20} color="#333333" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Wishlist</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => navigation.navigate("Account")}
            >
              <Ionicons name="person-outline" size={20} color="#333333" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Your Account</Text>
            </Pressable>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => navigation.navigate("CashFlowStatistics")}
            >
              <MaterialIcons name="bar-chart" size={20} color="#333333" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Statistics</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={logout}
            >
              <AntDesign name="logout" size={20} color="#333333" style={styles.buttonIcon} />
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
    padding: 20,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 25,
    textTransform: "uppercase",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#333333",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonPressed: {
    backgroundColor: "#878595",
    borderColor: "#333333",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  ordersListContent: {
    paddingBottom: 20,
  },
  orderCard: {
    flex: 0.5,
    margin: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#333333",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  orderCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 6,
  },
  orderAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#28a745",
    marginVertical: 6,
  },
  couponName: {
    fontSize: 13,
    color: "#007bff",
    fontStyle: "italic",
    marginVertical: 6,
  },
  orderStatus: {
    fontSize: 15,
    fontWeight: "600",
    marginVertical: 6,
    textTransform: "capitalize",
  },
  orderImage: {
    width: 110,
    height: 110,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    textAlign: "center",
    marginVertical: 20,
  },
  noOrdersText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    textAlign: "center",
    marginVertical: 20,
  },
});

export default ProfileScreen;