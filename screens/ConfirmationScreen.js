import { StyleSheet, Text, View, ScrollView, Pressable, Alert, TextInput } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { UserType } from "../UserContext";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { cleanCart } from "../redux/CartReducer";
import { useNavigation } from "@react-navigation/native";

const ConfirmationScreen = () => {
  const steps = [
    { title: "Address", content: "Address Form" },
    { title: "Delivery", content: "Select Coupon" },
    { title: "Payment", content: "Payment Details" },
    { title: "Place Order", content: "Order Summary" },
  ];
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const { userId, token } = useContext(UserType);
  const cart = useSelector((state) => state.cart.cart) || [];
  const orderId = useSelector((state) => state.cart.orderId) || null;
  const user_id = userId ? userId : (useSelector((state) => state.cart.userId) || null);
  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);
  const [newAddress, setNewAddress] = useState({
    name: "",
    houseNo: "",
    landmark: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    mobileNo: "",
  });
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [totalAmount, setTotalAmount] = useState(total);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [reviewPoints, setReviewPoints] = useState(0); // Số điểm tích lũy từ bình luận

  const dispatch = useDispatch();
  const [selectedAddress, setSelectedAdress] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  // Lấy số điểm tích lũy từ API
  const fetchReviewPoints = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.249:8080/api/v1/user/review/coupon/${user_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReviewPoints(response.data || 0);
    } catch (error) {
      console.error("Lỗi khi lấy điểm tích lũy:", error);
      Alert.alert("Lỗi", "Không thể tải điểm tích lũy.");
    }
  };

  // Lấy danh sách coupon từ API
  const fetchCoupons = async () => {
    if (!user_id) {
      setCouponError("Không tìm thấy userId!");
      return;
    }

    setLoadingCoupons(true);
    setCouponError("");
    try {
      const response = await axios.get(
        `http://192.168.1.249:8080/api/v1/admin/coupon/user/${user_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const couponList = response.data;
      setCoupons(couponList);

      // Chọn coupon NONE mặc định
      const defaultCoupon = couponList.find(coupon => coupon.code === "NONE") || null;
      setSelectedCoupon(defaultCoupon);
    } catch (error) {
      setCouponError("Không thể tải danh sách mã giảm giá!");
      setCoupons([]);
      console.error("Lỗi khi lấy coupon:", error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // Gọi API coupon và điểm tích lũy khi vào bước Delivery
  useEffect(() => {
    if (currentStep === 1 && user_id) {
      fetchCoupons();
      fetchReviewPoints();
    }
  }, [currentStep, user_id]);

  // Áp dụng coupon khi chọn
  const applyCoupon = (coupon) => {
    if (!coupon) {
      setSelectedCoupon(null);
      setTotalAmount(total);
      setDiscountAmount(0);
      return;
    }

    // Kiểm tra expirationDate
    if (coupon.expirationDate) {
      const expirationDate = new Date(coupon.expirationDate);
      const now = new Date();
      if (expirationDate < now) {
        Alert.alert("Lỗi", `Mã ${coupon.name} đã hết hạn!`);
        return;
      }
    }

    setSelectedCoupon(coupon);
    const discount = coupon.discount / 100;
    const discountValue = total * discount;
    setDiscountAmount(discountValue);
    setTotalAmount(total - discountValue);
    Alert.alert("Thành công", `Áp dụng mã ${coupon.name} giảm ${coupon.discount}%!`);
  };

  // Áp dụng điểm tích lũy để tạo coupon (không gọi API mark-used)
  const applyReviewPoints = () => {
    if (reviewPoints === 0) {
      Alert.alert("Lỗi", "Bạn không có điểm tích lũy để sử dụng!");
      return;
    }

    // Tạo coupon động từ điểm tích lũy
    const discountPercentage = reviewPoints * 0.01;
    const newCoupon = {
      id: `points_${Date.now()}`,
      name: "Giảm giá từ điểm tích lũy",
      code: `POINTS_${Date.now()}`,
      discount: discountPercentage,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Hết hạn sau 30 ngày
      description: `Giảm ${discountPercentage}% dựa trên ${reviewPoints} bình luận.`,
    };

    // Thêm coupon vào danh sách và áp dụng
    setCoupons([...coupons, newCoupon]);
    applyCoupon(newCoupon);
  };

  // Gọi API mark-used khi chuyển sang bước Payment
  const handleNextStep = async () => {
    if (selectedCoupon && selectedCoupon.code.startsWith("POINTS_")) {
      try {
        await axios.post(
          `http://192.168.1.249:8080/api/v1/user/review/mark-used/${user_id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReviewPoints(0); // Đặt lại điểm tích lũy
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái bình luận:", error);
        Alert.alert("Lỗi", error.response?.data?.message || "Không thể cập nhật điểm tích lũy.");
        return; // Ngăn chuyển bước nếu lỗi
      }
    }
    setCurrentStep(2);
  };

  // Hàm đặt hàng
  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        description: "",
        address: Object.values(newAddress).filter(Boolean).join(", "),
        userId: user_id,
        amount: total,
        totalAmount: totalAmount,
        payment: selectedOption,
        discount: selectedCoupon ? selectedCoupon.discount : 0,
        couponId: selectedCoupon && !selectedCoupon.id.startsWith("points_") ? selectedCoupon.id : 0,
        orderId: orderId || 0,
      };

      const response = await axios.post(
        "http://192.168.1.249:8080/api/v1/user/cart/place-order",
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const currentOrderId = response.data.id;

      for (const item of cart) {
        const cartItemPayload = {
          price: item.price,
          quantity: item.quantity,
          productId: item.productId,
          userId: user_id,
          orderId: currentOrderId,
          img: item.img,
          id: item.id || 0,
        };

        await axios.post(
          "http://192.168.1.249:8080/api/v1/user/cart/add",
          cartItemPayload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      navigation.navigate("Order");
      dispatch(cleanCart());
      console.log("Order + CartItems created successfully");
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Lỗi", "Không thể đặt hàng. Vui lòng thử lại!");
    }
  };

  // Thanh toán online
  const pay = async () => {
    try {
      const options = {
        description: "Adding To Wallet",
        currency: "VND",
        name: "Furniture",
        key: "rzp_test_E3GWYimxN7YMk8",
        amount: totalAmount * 100,
        prefill: {
          email: "void@razorpay.com",
          contact: "9191919191",
          name: "RazorPay Software",
        },
        theme: { color: "#878595" },
      };

      navigation.navigate("Order");
      dispatch(cleanCart());
      console.log("Order created successfully");
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Lỗi", "Thanh toán thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.stepsContainer}>
          {steps?.map((step, index) => (
            <View key={index} style={styles.step}>
              {index > 0 && (
                <View
                  style={[
                    styles.stepConnector,
                    index <= currentStep && styles.stepConnectorActive,
                  ]}
                />
              )}
              <View
                style={[
                  styles.stepCircle,
                  index <= currentStep && styles.stepCircleActive,
                ]}
              >
                <Text style={styles.stepNumber}>
                  {index < currentStep ? "✓" : index + 1}
                </Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {currentStep === 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn địa chỉ giao hàng</Text>
          <TextInput
            placeholder="Họ và tên"
            value={newAddress.name}
            onChangeText={(text) => setNewAddress({ ...newAddress, name: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Số nhà, căn hộ, tòa nhà"
            value={newAddress.houseNo}
            onChangeText={(text) => setNewAddress({ ...newAddress, houseNo: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Đường, phường/xã"
            value={newAddress.street}
            onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Thành phố"
            value={newAddress.city}
            onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Mã bưu điện"
            value={newAddress.postalCode}
            onChangeText={(text) => setNewAddress({ ...newAddress, postalCode: text })}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Số điện thoại"
            value={newAddress.mobileNo}
            onChangeText={(text) => setNewAddress({ ...newAddress, mobileNo: text })}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.mobileNo) {
                Alert.alert("Lỗi", "Vui lòng nhập đầy đủ họ tên, đường, thành phố và số điện thoại!");
                return;
              }
              setSelectedAdress(newAddress);
              setCurrentStep(1);
            }}
          >
            <Text style={styles.buttonText}>Giao đến địa chỉ này</Text>
          </Pressable>
        </View>
      )}

      {currentStep === 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn mã giảm giá</Text>
          <Text style={styles.pointsText}>
            Điểm tích lũy: {reviewPoints} bình luận ({(reviewPoints * 0.01).toFixed(2)}% giảm giá)
          </Text>
          {loadingCoupons ? (
            <Text style={styles.loadingText}>Đang tải mã giảm giá...</Text>
          ) : couponError ? (
            <Text style={styles.errorText}>{couponError}</Text>
          ) : (
            <View style={styles.couponContainer}>
              {coupons.length === 0 && reviewPoints === 0 ? (
                <Text style={styles.noCouponsText}>Không có mã giảm giá nào!</Text>
              ) : (
                <>
                  {coupons.map((coupon) => (
                    <Pressable
                      key={coupon.id}
                      style={({ pressed }) => [
                        styles.couponItem,
                        selectedCoupon && selectedCoupon.id === coupon.id && styles.couponItemSelected,
                        pressed && styles.couponItemPressed,
                      ]}
                      onPress={() => applyCoupon(coupon)}
                    >
                      <View style={styles.couponRadio}>
                        {selectedCoupon && selectedCoupon.id === coupon.id ? (
                          <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                        ) : (
                          <MaterialIcons name="circle" size={20} color="gray" />
                        )}
                      </View>
                      <View style={styles.couponDetails}>
                        <Text style={styles.couponName}>{coupon.name}</Text>
                        <Text style={styles.couponCode}>Mã: {coupon.code}</Text>
                        <Text style={styles.couponDiscount}>
                          Giảm: {coupon.discount}%{' '}
                          {coupon.expirationDate
                            ? `(Hết hạn: ${new Date(coupon.expirationDate).toLocaleDateString()})`
                            : '(Không thời hạn)'}
                        </Text>
                        {coupon.description && (
                          <Text style={styles.couponDescription}>{coupon.description}</Text>
                        )}
                      </View>
                    </Pressable>
                  ))}
                  {reviewPoints > 0 && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.couponItem,
                        pressed && styles.couponItemPressed,
                      ]}
                      onPress={applyReviewPoints}
                    >
                      <View style={styles.couponRadio}>
                        {selectedCoupon && selectedCoupon.code.startsWith("POINTS_") ? (
                          <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                        ) : (
                          <MaterialIcons name="circle" size={20} color="gray" />
                        )}
                      </View>
                      <View style={styles.couponDetails}>
                        <Text style={styles.couponName}>Sử dụng điểm tích lũy</Text>
                        <Text style={styles.couponDiscount}>
                          Giảm: {(reviewPoints * 0.01).toFixed(2)}% ({reviewPoints} bình luận)
                        </Text>
                      </View>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleNextStep}
          >
            <Text style={styles.buttonText}>Tiếp tục</Text>
          </Pressable>
        </View>
      )}

      {currentStep === 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.option}
              onPress={() => setSelectedOption("cash")}
            >
              {selectedOption === "cash" ? (
                <FontAwesome5 name="dot-circle" size={20} color="#008397" />
              ) : (
                <MaterialIcons name="circle" size={20} color="gray" />
              )}
              <Text style={styles.optionText}>Thanh toán khi nhận hàng</Text>
            </Pressable>
            <Pressable
              style={styles.option}
              onPress={() => {
                setSelectedOption("card");
                Alert.alert("UPI/Thẻ tín dụng", "Thanh toán trực tuyến", [
                  { text: "Hủy", onPress: () => console.log("Cancel pressed") },
                  { text: "OK", onPress: () => pay() },
                ]);
              }}
            >
              {selectedOption === "card" ? (
                <FontAwesome5 name="dot-circle" size={20} color="#008397" />
              ) : (
                <MaterialIcons name="circle" size={20} color="gray" />
              )}
              <Text style={styles.optionText}>Thẻ tín dụng/thẻ ghi nợ</Text>
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              if (!selectedOption) {
                Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán!");
                return;
              }
              setCurrentStep(3);
            }}
          >
            <Text style={styles.buttonText}>Tiếp tục</Text>
          </Pressable>
        </View>
      )}

      {currentStep === 3 && selectedOption && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đặt hàng ngay</Text>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Giao hàng đến: {selectedAddress?.name}
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng giá sản phẩm</Text>
              <Text style={styles.summaryValue}>{total.toLocaleString()}₫</Text>
            </View>
            {selectedCoupon && selectedCoupon.code !== "NONE" && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Giảm giá ({selectedCoupon.name} - {selectedCoupon.discount}%)
                </Text>
                <Text style={styles.summaryValue}>
                  -{discountAmount.toLocaleString()}₫
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí giao hàng</Text>
              <Text style={styles.summaryValue}>0₫</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Tổng thanh toán</Text>
              <Text style={styles.summaryTotalValue}>
                {totalAmount.toLocaleString()}₫
              </Text>
            </View>
          </View>
          <View style={styles.paymentContainer}>
            <Text style={styles.paymentLabel}>Thanh toán bằng</Text>
            <Text style={styles.paymentValue}>
              {selectedOption === "cash" ? "Thanh toán khi nhận hàng (Tiền mặt)" : "Thẻ tín dụng/thẻ ghi nợ"}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.buttonText}>Đặt hàng</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

export default ConfirmationScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginTop: 55,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  step: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  stepConnector: {
    position: "absolute",
    top: 14,
    left: -50,
    width: 100,
    height: 2,
    backgroundColor: "#ccc",
  },
  stepConnectorActive: {
    backgroundColor: "#28a745",
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: "#28a745",
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  stepTitle: {
    fontSize: 12,
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  couponContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  couponItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  couponItemSelected: {
    backgroundColor: "#e6f7fa",
  },
  couponItemPressed: {
    backgroundColor: "#f0f0f0",
  },
  couponRadio: {
    marginRight: 10,
  },
  couponDetails: {
    flex: 1,
  },
  couponName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  couponCode: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  couponDiscount: {
    fontSize: 14,
    color: "#28a745",
    marginTop: 2,
  },
  couponDescription: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#008397",
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#dc3545",
    marginBottom: 10,
    textAlign: "center",
  },
  noCouponsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginVertical: 20,
  },
  optionContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#555",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#C60C30",
  },
  paymentContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  button: {
    backgroundColor: "#FFC72C",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    backgroundColor: "#e6b800",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});