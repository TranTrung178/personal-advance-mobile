import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useLayoutEffect, useEffect, useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "../assets/Ute2022New.png";


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
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId || !token) {
        console.warn("⚠️ userId hoặc token đang trống!");
        return;
      }

      console.log("📡 Gửi request với token:", token);

      try {
        const response = await axios.get(
          `http://192.168.1.10:8080/api/v1/user/order/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("✅ Dữ liệu trả về:", response.data);

        const ordersData = Array.isArray(response.data) ? response.data : [response.data];

        setOrders(ordersData);
      } catch (error) {
        console.error("❌ Lỗi khi lấy đơn hàng:", error.response?.status, error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, token]);



  console.log("orders", orders);
  return (
    <ScrollView style={{ padding: 10, flex: 1, backgroundColor: "white" }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
        {/* Welcome {user?.name} */}
        Welcome
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 12,
        }}
      >
        <Pressable
          style={{
            padding: 10,
            backgroundColor: "#E0E0E0",
            borderRadius: 25,
            flex: 1,
          }}
        >
          <Text style={{ textAlign: "center" }}>Your orders</Text>
        </Pressable>

        <Pressable
          style={{
            padding: 10,
            backgroundColor: "#E0E0E0",
            borderRadius: 25,
            flex: 1,
          }}
          onPress={() => navigation.replace("Account")}
        >
          <Text style={{ textAlign: "center" }}>Your Account</Text>
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 12,
        }}
      >
        <Pressable
          style={{
            padding: 10,
            backgroundColor: "#E0E0E0",
            borderRadius: 25,
            flex: 1,
          }}
        >
          <Text style={{ textAlign: "center" }}>Buy Again</Text>
        </Pressable>

        <Pressable
          onPress={logout}
          style={{
            padding: 10,
            backgroundColor: "#E0E0E0",
            borderRadius: 25,
            flex: 1,
          }}
        >
          <Text style={{ textAlign: "center" }}>Logout</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {loading ? (
          <Text>Loading...</Text>
        ) : Array.isArray(orders) && orders.length > 0 ? (
          orders.map((order) => (
            <Pressable
              style={{
                marginTop: 20,
                padding: 15,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#d0d0d0",
                marginHorizontal: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 200,
              }}
              key={order.id}
            >
              {/* 🆔 Hiển thị Mã Đơn Hàng */}
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>Mã đơn: {order.id}</Text>

              {/* 💰 Hiển thị Tổng Tiền */}
              <Text style={{ color: "green", fontWeight: "bold", marginTop: 5 }}>
                Tổng tiền: {order.totalAmount.toLocaleString()} VND
              </Text>

              {/* 🎁 Hiển thị Tên Khuyến Mãi */}
              {order.couponName && (
                <Text style={{ color: "blue", fontStyle: "italic", marginTop: 5 }}>
                  🎁 {order.couponName}
                </Text>
              )}

              {/* 📦 Hiển thị Trạng Thái Đơn Hàng */}
              <Text style={{ marginTop: 5, color: "orange" }}>
                🏷 {order.orderStatus}
              </Text>

              {/* 🖼 Hiển thị Ảnh Sản Phẩm (Fallback ảnh mặc định nếu lỗi) */}
              {Array.isArray(order.cartItems) && order.cartItems.slice(0, 1).map((item) => (
                <View style={{ marginVertical: 10 }} key={item.id}>
                  <Image
                    source={{
                      uri: item.img || "https://cdni.iconscout.com/illustration/premium/thumb/product-is-empty-illustration-download-in-svg-png-gif-file-formats--no-records-list-record-emply-data-user-interface-pack-design-development-illustrations-6430781.png?f=webp",
                    }}
                    style={{ width: 100, height: 100, resizeMode: "contain" }}
                    onError={(e) => (e.target.src = "https://cdni.iconscout.com/illustration/premium/thumb/product-is-empty-illustration-download-in-svg-png-gif-file-formats--no-records-list-record-emply-data-user-interface-pack-design-development-illustrations-6430781.png?f=webp")}
                  />
                </View>
              ))}
            </Pressable>
          ))
        ) : (
          <Text>No orders found</Text>
        )}
      </ScrollView>



    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
