import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, Alert, TextInput, StyleSheet, Image, ScrollView } from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserType } from "../UserContext";

const OrderDetailsScreen = () => {
    const { userId, token } = useContext(UserType);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelReason, setCancelReason] = useState("");
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params;

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(
                    `http://192.168.1.240:8080/api/v1/user/order/${orderId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setOrder(response.data);
            } catch (error) {
                console.error("Error fetching order:", error);
                Alert.alert("Lỗi", "Không thể tải chi tiết đơn hàng.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [userId, token]);
    console.log("cacelorderid: ", orderId);
    const handleCancelOrder = async () => {
        if (!cancelReason) {
            Alert.alert("Lỗi", "Vui lòng nhập lý do hủy đơn.");
            return;
        }
        try {
            const response = await axios.post(
                `http://192.168.1.240:8080/api/v1/user/order/${orderId}/cancel`,
                { reason: cancelReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert("Thành công", response.data);
            navigation.goBack();
        } catch (error) {
            console.error("Error canceling order:", error);
            Alert.alert("Lỗi", "Không thể hủy đơn hàng. Vui lòng thử lại.");
        }
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemRow}>
                <Image
                    style={styles.itemImage}
                    source={{
                        uri: item.img
                            ? `data:image/jpeg;base64,${item.img}`
                            : "https://via.placeholder.com/140?text=No+Image",
                    }}
                    resizeMode="contain"
                />
                <View style={styles.itemDetails}>
                    <Text numberOfLines={3} style={styles.itemTitle}>
                        {item.productName || "Sản phẩm không xác định"}
                    </Text>
                    <Text style={styles.itemPrice}>{item.price.toLocaleString()} VND</Text>
                    <Text style={styles.inStock}>In Stock</Text>
                </View>
            </View>
            <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>Số lượng: {item.quantity}</Text>
            </View>
        </View>
    );

    const renderStatus = () => {
        const statuses = [
            { status: "NEW", label: "Đơn hàng mới" },
            { status: "CONFIRMED", label: "Đã xác nhận" },
            { status: "PREPARING", label: "Shop đang chuẩn bị" },
            { status: "SHIPPING", label: "Đang giao hàng" },
            { status: "DELIVERED", label: "Đã giao thành công" },
            { status: "CANCELED", label: "Đã hủy" },
        ];

        return (
            <View style={styles.statusContainer}>
                <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
                {statuses.map((s, index) => (
                    <View key={index} style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: order.orderStatus === s.status ? "#28a745" : "#e0e0e0" },
                            ]}
                        />
                        <Text style={styles.statusText}>{s.label}</Text>
                    </View>
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Không tìm thấy đơn hàng.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Chi tiết đơn hàng #{order.id}</Text>
            </View>
            <View style={styles.orderInfo}>
                <Text style={styles.infoText}>
                    Ngày đặt: {new Date(order.date).toLocaleString("vi-VN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                    })}
                </Text>
                <Text style={styles.infoText}>Địa chỉ: {order.address}</Text>
                <Text style={styles.infoText}>Tổng tiền: {order.totalAmount.toLocaleString()} VND</Text>
                <Text style={styles.infoText}>Giảm giá: {order.discount.toLocaleString()} VND</Text>
                <Text style={styles.infoText}>Phương thức thanh toán: {order.payment || "Chưa xác định"}</Text>
                <Text style={styles.infoText}>Mã giảm giá: {order.couponName}</Text>
                {order.trackingId && (
                    <Text style={styles.infoText}>Mã vận chuyển: {order.trackingId}</Text>
                )}
                {order.userName && <Text style={styles.infoText}>Người đặt: {order.userName}</Text>}
            </View>
            {renderStatus()}
            <View style={styles.cartContainer}>
                <Text style={styles.sectionTitle}>Sản phẩm</Text>
                <FlatList
                    data={order.cartItems}
                    renderItem={renderCartItem}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal={true}
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.cartListContent}
                />
            </View>
            {order.orderStatus === "CANCELED" && order.cancelReason ? (
                <View style={styles.cancelContainer}>
                    <Text style={styles.cancelReasonText}>Lý do hủy: {order.cancelReason}</Text>
                </View>
            ) : (order.orderStatus === "NEW" || order.orderStatus === "CONFIRMED" || order.orderStatus === "PREPARING") ? (
                <View style={styles.cancelContainer}>
                    <TextInput
                        placeholder="Lý do hủy đơn"
                        value={cancelReason}
                        onChangeText={setCancelReason}
                        style={styles.input}
                        multiline
                    />
                    <Pressable
                        style={styles.cancelButton}
                        onPress={handleCancelOrder}
                    >
                        <Text style={styles.cancelButtonText}>
                            {order.orderStatus === "PREPARING" ? "Gửi yêu cầu hủy" : "Hủy đơn hàng"}
                        </Text>
                    </Pressable>
                </View>
            ) : null}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 8,
        margin: 15,
        marginTop: 26,
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    orderInfo: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    infoText: {
        fontSize: 16,
        color: "#333",
        marginBottom: 8,
    },
    statusContainer: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    statusDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 16,
        color: "#333",
        marginLeft: 10,
    },
    cartContainer: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cartListContent: {
        paddingRight: 15,
    },
    cartItem: {
        backgroundColor: "#fff",
        marginRight: 10,
        borderWidth: 2,
        borderColor: "#F0F0F0",
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
        minWidth: 300,
        padding: 10,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    itemImage: {
        width: 140,
        height: 140,
        resizeMode: "contain",
    },
    itemDetails: {
        width: 140,
        justifyContent: "flex-start",
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginTop: 10,
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginTop: 6,
    },
    inStock: {
        fontSize: 14,
        color: "green",
        marginTop: 6,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    quantityText: {
        fontSize: 16,
        color: "#333",
        paddingHorizontal: 18,
        paddingVertical: 6,
    },
    cancelContainer: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 15,
        minHeight: 80,
        textAlignVertical: "top",
    },
    cancelButton: {
        backgroundColor: "#dc3545",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    cancelReasonText: {
        fontSize: 16,
        color: "#dc3545",
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    loadingText: {
        fontSize: 18,
        color: "#333",
    },
});

export default OrderDetailsScreen;