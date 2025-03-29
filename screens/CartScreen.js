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

  console.log("cart - userId: ", userId);

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
          <AntDesign style={styles.searchIcon} name="search1" size={22} color="#333" />
          <TextInput placeholder="Search Furniture.ute" style={styles.searchInput} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Profile")}>
          <Image
            source={{ uri: "https://img.freepik.com/premium-vector/avatar-profile-vector-illustrations-website-social-networks-user-profile-icon_495897-224.jpg" }}
            style={styles.profileImage}
          />
        </Pressable>
      </View>

      <View style={styles.subtotalContainer}>
        <Text style={styles.subtotalText}>Subtotal:</Text>
        <Text style={styles.totalPrice}>{total.toLocaleString()} VND</Text>
      </View>
      <Text style={styles.emiDetails}>EMI details Available</Text>

      <Pressable onPress={() => navigation.navigate("Confirm")} style={styles.proceedButton}>
        {cart && cart.length > 0 ? (
          <Text style={styles.proceedButtonText}>Proceed to Checkout ({cart.length} items)</Text>
        ) : (
          <Text style={styles.proceedButtonText}>Your cart is empty</Text>
        )}
      </Pressable>

      <View style={styles.divider} />

      <View style={styles.cartContainer}>
        {cart?.map((item, index) => (
          <View style={styles.cartItem} key={index}>
            <Pressable style={styles.itemRow}>
              <Image
                style={styles.itemImage}
                source={{
                  uri: item.img || item.img1
                    ? `data:image/jpeg;base64,${item.img || item.img1}`
                    : "https://via.placeholder.com/140?text=No+Image",
                }}
                resizeMode="contain"
              />
              <View style={styles.itemDetails}>
                <Text numberOfLines={3} style={styles.itemTitle}>
                  {item.productName || item.name || "Unknown Product"}
                </Text>
                <Text style={styles.itemPrice}>{item.price.toLocaleString()} VND</Text>
                <Text style={styles.inStock}>In Stock</Text>
              </View>
            </Pressable>

            <View style={styles.quantityContainer}>
              <Pressable
                onPress={() => item.quantity > 1 ? dispatch(decrementQuantity(item)) : dispatch(removeFromCart(item))}
                style={styles.quantityButton}
              >
                <AntDesign name={item.quantity > 1 ? "minus" : "delete"} size={20} color="#333" />
              </Pressable>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Pressable
                onPress={() => dispatch(incementQuantity(item))}
                style={styles.quantityButton}
              >
                <Feather name="plus" size={20} color="#333" />
              </Pressable>
              <Pressable
                onPress={() => dispatch(removeFromCart(item))}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#878595",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchBox: {
    flexDirection: "row",
    marginTop: 40,
    alignItems: "center",
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    height: 40,
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    paddingLeft: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  profileImage: {
    marginTop: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  subtotalContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subtotalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
  },
  emiDetails: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  proceedButton: {
    backgroundColor: "#ffc107",
    padding: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  cartContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  cartItem: {
    backgroundColor: "#fff",
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  inStock: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "500",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  quantityButton: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: "#fff",
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  deleteButtonText: {
    fontSize: 14,
    color: "#dc3545",
    fontWeight: "600",
  },
});

export default CartScreen;