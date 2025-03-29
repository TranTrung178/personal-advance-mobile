import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ImageBackground,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/CartReducer";
import { addToWishlist, removeFromWishlist } from "../redux/WishlistReducer";
import axios from "axios";
import { UserType } from "../UserContext";

const ProductInfoScreen = () => {
  const { userId, token } = useContext(UserType);
  const route = useRoute();
  const { width } = Dimensions.get("window");
  const navigation = useNavigation();
  const [addedToCart, setAddedToCart] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const height = width;
  const dispatch = useDispatch();

  // Lấy danh sách wishlist từ Redux store
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const isWishlisted = wishlist.some((item) => item.product_id === route.params.id);

  // Lấy danh sách bình luận/đánh giá
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `http://192.168.1.249:8080/api/v1/user/review/${route.params.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [route.params.id]);

  const addItemToCart = (item) => {
    setAddedToCart(true);
    dispatch(addToCart(item));
    setTimeout(() => {
      setAddedToCart(false);
    }, 60000);
  };

  // Xử lý thêm/xóa khỏi wishlist
  const toggleWishlist = () => {
    if (isWishlisted) {
      // Xóa khỏi wishlist
      dispatch(removeFromWishlist(route.params.id));
      Alert.alert("Thành công", "Đã xóa sản phẩm khỏi danh sách yêu thích.");
    } else {
      // Thêm vào wishlist
      const wishlistItem = {
        id: Date.now(), // Tạo ID tạm thời (có thể thay bằng ID từ backend nếu cần)
        user_id: userId,
        product_id: route.params.id,
        product_name: route.params.name,
        price: route.params.price,
        stoke: route.params.stock,
        img: route.params.img1,
      };
      dispatch(addToWishlist(wishlistItem));
      Alert.alert("Thành công", "Đã thêm sản phẩm vào danh sách yêu thích.");
    }
  };

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
          product_id: route.params.id,
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
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Pressable style={styles.searchBar}>
          <AntDesign style={styles.searchIcon} name="search1" size={22} color="#333" />
          <TextInput placeholder="Search Furniture.ute" style={styles.searchInput} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Profile")}>
          <Image
            source={{
              uri: "https://img.freepik.com/premium-vector/avatar-profile-vector-illustrations-website-social-networks-user-profile-icon_495897-224.jpg",
            }}
            style={styles.profileImage}
          />
        </Pressable>
      </View>

      {/* Product Images */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[route.params.img1, route.params.img2, route.params.img3]
          .filter(Boolean)
          .map((image, index) => (
            <ImageBackground
              style={styles.imageBackground}
              source={{ uri: `data:image/jpeg;base64,${image}` }}
              key={index}
            >
              <View style={styles.imageHeader}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>20% off</Text>
                </View>
                <View style={styles.iconButton}>
                  <MaterialCommunityIcons name="share-variant" size={24} color="#333" />
                </View>
              </View>
              <Pressable style={styles.favoriteButton} onPress={toggleWishlist}>
                <AntDesign
                  name={isWishlisted ? "heart" : "hearto"}
                  size={24}
                  color={isWishlisted ? "#e63946" : "#333"}
                />
              </Pressable>
            </ImageBackground>
          ))}
      </ScrollView>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{route?.params?.name}</Text>
        <Text style={styles.productPrice}>
          {route?.params?.price.toLocaleString()}₫
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Total: {route?.params?.price.toLocaleString()}₫
        </Text>
        <Text style={styles.deliveryText}>
          FREE delivery Tomorrow by 3 PM. Order within 10hrs 30 mins
        </Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={24} color="#333" />
          <Text style={styles.locationText}>
            Deliver To Sujan - Bangalore 560019
          </Text>
        </View>
      </View>

      <Text style={styles.stockText}>
        {route?.params?.stock > 0 ? "In Stock" : "Out of Stock"}
      </Text>

      <Pressable
        onPress={() => addItemToCart(route?.params)}
        style={styles.addToCartButton}
      >
        <Text style={styles.buttonText}>
          {addedToCart ? "Added to Cart" : "Add to Cart"}
        </Text>
      </Pressable>

      <Pressable style={styles.buyNowButton}>
        <Text style={styles.buttonText}>Buy Now</Text>
      </Pressable>

      {/* Review Section */}
    
      <View style={styles.reviewContainer}>
        <Text style={styles.reviewTitle}>Đánh giá sản phẩm</Text>

        {/* <View style={styles.reviewForm}>
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
        </View> */}

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

export default ProductInfoScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  searchBarContainer: {
    backgroundColor: "#878595",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    height: 40,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    paddingLeft: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imageBackground: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").width,
    marginTop: 10,
    resizeMode: "contain",
  },
  imageHeader: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  discountBadge: {
    width: 60,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e63946",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  discountText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  iconButton: {
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
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginLeft: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsContainer: {
    padding: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e63946",
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 15,
  },
  totalContainer: {
    padding: 15,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  deliveryText: {
    fontSize: 14,
    color: "#2a9d8f",
    marginVertical: 5,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  stockText: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 15,
    marginVertical: 10,
  },
  addToCartButton: {
    backgroundColor: "#ff922b",
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buyNowButton: {
    backgroundColor: "#e63946",
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  reviewContainer: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    marginTop: 10,
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  reviewForm: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  starButton: {
    marginRight: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#2a9d8f",
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewList: {
    marginTop: 20,
  },
  reviewItem: {
    padding: 15,
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
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  reviewStars: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 8,
  },
  noReviewsText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
  },
});