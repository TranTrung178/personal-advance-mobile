import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import React, { useEffect, useContext } from "react";
import { Feather, AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementQuantity,
  incementQuantity,
  removeFromCart,
  fetchCart,
} from "../redux/CartReducer.js";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";

const CartScreen = () => {
  const { userId, token, checkCart, setCheckCart } = useContext(UserType);
  
  console.log(checkCart, 'fdjdf');

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart) || [];
  const orderId = useSelector((state) => state.cart.orderId) || null;
  console.log('cart length: ', cart.length);
  console.log('orderOd: ', orderId);

  useEffect(() => {
    dispatch(fetchCart({ userId, token, checkCart, setCheckCart }));
  }, [dispatch]);

  const total = cart ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.searchBox}>
          <AntDesign style={styles.searchIcon} name="search1" size={22} color="black" />
          <TextInput placeholder="Search Furniture.ute" style={styles.searchInput} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Profile")}>
          <Image
            source={{ uri: "https://img.freepik.com/premium-vector/avatar-profile-vector-illustrations-website-social-networks-user-profile-icon_495897-224.jpg" }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 50,
            }}
          />
        </Pressable>
      </View>

      <View style={styles.subtotalContainer}>
        <Text style={styles.subtotalText}>Subtotal:</Text>
        <Text style={styles.totalPrice}>{total}</Text>
      </View>
      <Text style={styles.emiDetails}>EMI details Available</Text>

      <Pressable onPress={() => navigation.navigate("Confirm")} style={styles.proceedButton}>
        {cart && cart.length > 0 ? (
          <Text>You have {cart.length} items in your cart.</Text>
        ) : (
          <Text>Your cart is empty.</Text>
        )}

      </Pressable>

      <View style={styles.divider} />

      <View style={styles.cartContainer}>
        {cart?.map((item, index) => (
          <View style={styles.cartItem} key={index}>
            <Pressable style={styles.itemRow}>
              <Image style={styles.itemImage} source={{ uri: `data:image/jpeg;base64,${item?.img || item?.img1}` }} />
              <View style={styles.itemDetails}>
                <Text numberOfLines={3} style={styles.itemTitle}>{item.productName || item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
                <Image style={styles.stockImage} source={{ uri: "https://example.com/stock.png" }} />
                <Text style={styles.inStock}>In Stock</Text>
              </View>
            </Pressable>

            <View style={styles.quantityContainer}>
              <Pressable onPress={() => item.quantity > 1 ? dispatch(decrementQuantity(item)) : dispatch(removeFromCart(item))} style={styles.quantityButton}>
                <AntDesign name={item.quantity > 1 ? "minus" : "delete"} size={24} color="black" />
              </Pressable>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Pressable onPress={() => dispatch(incementQuantity(item))} style={styles.quantityButton}>
                <Feather name="plus" size={24} color="black" />
              </Pressable>
              <Pressable onPress={() => dispatch(removeFromCart(item))} style={styles.deleteButton}>
                <Text>Delete</Text>
              </Pressable>
            </View>

          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 40, flex: 1, backgroundColor: "white" },
  header: { backgroundColor: "#878595", padding: 10, flexDirection: "row", alignItems: "center" },
  searchBox: { flexDirection: "row", alignItems: "center", flex: 1, backgroundColor: "white", borderRadius: 3, height: 38, marginHorizontal: 7 },
  searchIcon: { paddingLeft: 10 },
  searchInput: { flex: 1 },
  subtotalContainer: { padding: 10, flexDirection: "row", alignItems: "center" },
  subtotalText: { fontSize: 18, fontWeight: "400" },
  totalPrice: { fontSize: 20, fontWeight: "bold" },
  emiDetails: { marginHorizontal: 10 },
  proceedButton: { backgroundColor: "#FFC72C", padding: 10, borderRadius: 5, justifyContent: "center", alignItems: "center", marginHorizontal: 10, marginTop: 10 },
  divider: { height: 1, borderColor: "#D0D0D0", borderWidth: 1, marginTop: 16 },
  cartContainer: { marginHorizontal: 10 },
  cartItem: { backgroundColor: "white", marginVertical: 10, borderBottomColor: "#F0F0F0", borderWidth: 2, borderLeftWidth: 0, borderTopWidth: 0, borderRightWidth: 0 },
  itemRow: { marginVertical: 10, flexDirection: "row", justifyContent: "space-between" },
  itemImage: { width: 140, height: 140, resizeMode: "contain" },
  itemDetails: { width: 150 },
  itemTitle: { marginTop: 10 },
  itemPrice: { fontSize: 20, fontWeight: "bold", marginTop: 6 },
  stockImage: { width: 30, height: 30, resizeMode: "contain" },
  inStock: { color: "green" },
  quantityContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7 },
  quantityButton: { backgroundColor: "#D8D8D8", padding: 7, borderRadius: 6 },
  quantityText: { backgroundColor: "white", paddingHorizontal: 18, paddingVertical: 6 },
  deleteButton: { backgroundColor: "white", marginLeft: 15, paddingHorizontal: 8, paddingVertical: 10, borderRadius: 10, borderColor: "#C0C0C0", borderWidth: 0.6 },
});

export default CartScreen;
