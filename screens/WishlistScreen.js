import React, { useContext, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    Pressable,
    Alert,
    BackHandler,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../redux/WishlistReducer";
import { UserType } from "../UserContext";

const WishlistScreen = () => {
    const { userId } = useContext(UserType);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    // Lấy danh sách wishlist từ Redux store
    const wishlist = useSelector((state) => state.wishlist.wishlist);

    // Xử lý nút back vật lý trên Android
    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true; // Ngăn hành động mặc định (thoát app)
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [navigation]);

    // Xóa sản phẩm khỏi wishlist
    const removeFromWishlistHandler = (productId) => {
        dispatch(removeFromWishlist(productId));
        Alert.alert("Thành công", "Đã xóa sản phẩm khỏi danh sách yêu thích.");
    };

    // Render mỗi sản phẩm trong wishlist
    const renderWishlistItem = ({ item }) => (
        <Pressable
            style={styles.wishlistItem}
            onPress={() =>
                navigation.navigate("Info", {
                    id: item.product_id,
                    name: item.product_name,
                    price: item.price,
                    img1: item.img,
                    stock: item.stoke,
                })
            }
        >
            <Image
                source={{ uri: `data:image/jpeg;base64,${item.img}` }}
                style={styles.productImage}
            />
            <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.product_name}
                </Text>
                <Text style={styles.productPrice}>
                    {item.price.toLocaleString()}₫
                </Text>
                <Text style={styles.productStock}>
                    {item.stoke > 0 ? "Còn hàng" : "Hết hàng"}
                </Text>
            </View>
            <Pressable
                style={styles.removeButton}
                onPress={() => removeFromWishlistHandler(item.product_id)}
            >
                <AntDesign name="delete" size={20} color="#fff" />
            </Pressable>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <AntDesign name="arrowleft" size={24} color="#e63946" />
                </Pressable>
                <Text style={styles.title}>Danh sách yêu thích</Text>
                <Pressable
                    style={styles.cartButton}
                    onPress={() => navigation.navigate("Cart")}
                >
                    <AntDesign name="heart" size={24} color="#e63946" />
                </Pressable>
            </View>
            {wishlist.length > 0 ? (
                <FlatList
                    data={wishlist}
                    renderItem={renderWishlistItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Chưa có sản phẩm nào trong danh sách yêu thích.
                    </Text>
                    <Pressable
                        style={styles.addButton}
                        onPress={() => navigation.navigate("Main")}
                    >
                        <AntDesign name="pluscircleo" size={24} color="#e63946" />
                        <Text style={styles.addButtonText} >Thêm sản phẩm</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

export default WishlistScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    cartButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: "700",
        color: "#e63946",
        textAlign: "center",
    },
    listContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    wishlistItem: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 10,
        marginVertical: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: "#e63946",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        resizeMode: "contain",
    },
    productDetails: {
        flex: 1,
        paddingHorizontal: 10,
        justifyContent: "center",
    },
    productName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    productPrice: {
        fontSize: 14,
        fontWeight: "600",
        color: "#e63946",
        marginVertical: 4,
    },
    productStock: {
        fontSize: 12,
        color: "#555",
    },
    removeButton: {
        backgroundColor: "#e63946",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: "#777",
        textAlign: "center",
        marginBottom: 20,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#e63946",
        marginLeft: 10,
    },
});