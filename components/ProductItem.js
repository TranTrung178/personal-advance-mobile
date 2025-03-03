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
    <Pressable style={styles.container}
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
          stock: item.stock, // Lưu ý sửa `stoke` thành `stock`
        })
      }
    >
      {/* Hiển thị ảnh sản phẩm */}
      <Image
        style={styles.image}
        source={{ uri: `data:image/jpeg;base64,${item?.img1}` }} // Đổi `img1` thành base64
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
        <Text>{addedToCart ? "Đã thêm" : "Thêm vào giỏ"}</Text>
      </Pressable>
    </Pressable>
  );
};

export default ProductItem;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 25,
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  name: {
    width: 150,
    marginTop: 10,
    fontWeight: "bold",
  },
  priceRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  status: {
    color: "#008000",
    fontWeight: "bold",
  },
  button: {
    width: 150,
    backgroundColor: "#FFC72C",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
});
