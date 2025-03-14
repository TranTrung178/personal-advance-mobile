import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/CartReducer";

const ProductItem = ({ item }) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const addItemToCart = (item) => {
    setAddedToCart(true);
    dispatch(addToCart(item));
    setTimeout(() => {
      setAddedToCart(false);
    }, 60000);
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        navigation.navigate("Info", {
          id: item.id,
          name: item.name,
          price: item.price,
          img1: item.img1,
          img2: item.img2,
          img3: item.img3,
          description: item.description,
          status: item.status,
          stock: item.stock,
        })
      }
    >
      {/* Hiển thị ảnh sản phẩm */}
      <Image
        style={styles.image}
        source={{ uri: `data:image/jpeg;base64,${item?.img1}` }}
      />

      {/* Tên sản phẩm */}
      <Text numberOfLines={1} style={styles.name}>
        {item?.name}
      </Text>

      {/* Giá và tình trạng */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>₫{item?.price.toLocaleString()}</Text>
      </View>
      <View>
        <Text style={styles.status}>
          {item?.status === "AVAILABLE" ? "Còn hàng" : "Hết hàng"}
        </Text>
      </View>

      {/* Nút thêm vào giỏ hàng */}
      <Pressable onPress={() => addItemToCart(item)} style={styles.button}>
        <Text style={styles.buttonText}>
          {addedToCart ? "Đã thêm" : "Thêm vào giỏ"}
        </Text>
      </Pressable>
    </Pressable>
  );
};

export default ProductItem;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    margin: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: 195, // Tăng chiều rộng
    alignSelf: "center", // Căn giữa container
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    alignSelf: "center",
  },
  name: {
    width: 150,
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    alignSelf: "center",
    textAlign: "center",
  },
  priceRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e63946",
  },
  status: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "500",
    color: "#2a9d8f",
    textAlign: "center",
  },
  button: {
    width: 150,
    backgroundColor: "#ff922b",
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",

    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});