import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Image, Alert } from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserType } from "../UserContext";
import { AntDesign } from "@expo/vector-icons";

const ProductReviewScreen = () => {
    const { userId, token } = useContext(UserType);
    const route = useRoute();
    const navigation = useNavigation();
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [hasReviewed, setHasReviewed] = useState(false);
    const { product, orderStatus } = route.params;

    // Lấy danh sách đánh giá và kiểm tra xem user đã đánh giá chưa
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(
                    `http://192.168.1.249:8080/api/v1/user/review/${product.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const reviewList = response.data;
                setReviews(reviewList);
                // Kiểm tra xem user hiện tại đã đánh giá sản phẩm này chưa
                const userReview = reviewList.find(review => review.user_id === userId);
                setHasReviewed(!!userReview);
            } catch (error) {
                console.error("Error fetching reviews:", error);
                Alert.alert("Lỗi", "Không thể tải danh sách đánh giá.");
            }
        };
        fetchReviews();
    }, [product.id, userId]);

    // Xử lý gửi đánh giá
    const submitReview = async () => {
        if (!comment || rating === 0) {
            Alert.alert("Lỗi", "Vui lòng nhập bình luận và chọn số sao.");
            return;
        }

        try {
            const response = await axios.post(
                "http://192.168.1.249:8080/api/v1/user/review",
                {
                    product_id: product.id,
                    user_id: userId,
                    content: comment,
                    rating,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setReviews([...reviews, response.data]);
            setComment("");
            setRating(0);
            setHasReviewed(true); // Cập nhật trạng thái sau khi gửi đánh giá

            // Hiển thị thông báo phần thưởng
            if (response.data.reward && response.data.reward.type === "COUPON") {
                Alert.alert(
                    "Thành công",
                    `Đánh giá đã được gửi! Bạn nhận được mã giảm giá: ${response.data.reward.coupon.code}`
                );
            } else if (response.data.reward && response.data.reward.type === "POINTS") {
                Alert.alert(
                    "Thành công",
                    `Đánh giá đã được gửi! Bạn nhận được ${response.data.reward.points} điểm tích lũy.`
                );
            } else {
                Alert.alert("Thành công", "Đánh giá đã được gửi!");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại.");
            console.error("Error submitting review:", error);
        }
    };

    return (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Product Info */}
            <View style={styles.productContainer}>
                <Image
                    style={styles.productImage}
                    source={{
                        uri: product.img1
                            ? `data:image/jpeg;base64,${product.img1}`
                            : "https://via.placeholder.com/300?text=No+Image",
                    }}
                    resizeMode="contain"
                />
                <View style={styles.productDetails}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>{product.price.toLocaleString()}₫</Text>
                    <Text style={styles.stockText}>
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </Text>
                </View>
            </View>

            {/* Review Section */}
            <View style={styles.reviewContainer}>
                <Text style={styles.reviewTitle}>Đánh giá sản phẩm</Text>
                {orderStatus === "DELIVERED" ? (
                    hasReviewed ? (
                        <Text style={styles.hasReviewedMessage}>
                            Bạn đã đánh giá sản phẩm này. Mỗi người dùng chỉ được đánh giá một lần.
                        </Text>
                    ) : (
                        <View style={styles.reviewForm}>
                            <Text style={styles.formLabel}>Chọn số sao:</Text>
                            <View style={styles.starContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Pressable
                                        key={star}
                                        onPress={() => setRating(star)}
                                        style={styles.starButton}
                                    >
                                        <AntDesign
                                            name={rating >= star ? "star" : "staro"}
                                            size={24}
                                            color={rating >= star ? "#ff922b" : "#ccc"}
                                        />
                                    </Pressable>
                                ))}
                            </View>

                            <TextInput
                                style={styles.commentInput}
                                placeholder="Nhập bình luận của bạn..."
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                numberOfLines={4}
                            />

                            <Pressable style={styles.submitButton} onPress={submitReview}>
                                <Text style={styles.buttonText}>Gửi đánh giá</Text>
                            </Pressable>
                        </View>
                    )
                ) : (
                    <Text style={styles.noReviewMessage}>
                        Chưa thể đánh giá vì đơn hàng chưa được giao thành công.
                    </Text>
                )}

                {/* Review List */}
                <View style={styles.reviewList}>
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <View key={index} style={styles.reviewItem}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{review.username}</Text>
                                    <View style={styles.reviewStars}>
                                        {[...Array(review.rating)].map((_, i) => (
                                            <AntDesign key={i} name="star" size={16} color="#ff922b" />
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.reviewComment}>{review.content}</Text>
                                {review.byteImg && (
                                    <Image
                                        source={{ uri: `data:image/jpeg;base64,${review.byteImg}` }}
                                        style={styles.reviewImage}
                                    />
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noReviewsText}>Chưa có đánh giá nào.</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    productContainer: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        margin: 15,
        flexDirection: "row",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: 140,
        height: 140,
        marginRight: 15,
    },
    productDetails: {
        flex: 1,
        justifyContent: "center",
    },
    productName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    stockText: {
        fontSize: 14,
        color: "green",
    },
    reviewContainer: {
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
    reviewTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    reviewForm: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 16,
        color: "#333",
        marginBottom: 10,
    },
    starContainer: {
        flexDirection: "row",
        marginBottom: 15,
    },
    starButton: {
        marginRight: 10,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 15,
        minHeight: 80,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    reviewList: {
        marginTop: 10,
    },
    reviewItem: {
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    reviewStars: {
        flexDirection: "row",
    },
    reviewComment: {
        fontSize: 14,
        color: "#333",
    },
    reviewImage: {
        width: 100,
        height: 100,
        marginTop: 10,
        borderRadius: 8,
    },
    noReviewsText: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginVertical: 20,
    },
    noReviewMessage: {
        fontSize: 16,
        color: "#dc3545",
        textAlign: "center",
        marginVertical: 20,
    },
    hasReviewedMessage: {
        fontSize: 16,
        color: "#dc3545",
        textAlign: "center",
        marginVertical: 20,
    },
});

export default ProductReviewScreen;