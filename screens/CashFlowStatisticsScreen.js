import React, { useState, useContext, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Dimensions,
    BackHandler,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";
import axios from "axios";
import {
    BarChart,
    PieChart,
} from "react-native-chart-kit";


const CashFlowStatisticsScreen = () => {
    const screenWidth = Dimensions.get("window").width;
    const { userId, token } = useContext(UserType);
    const navigation = useNavigation();
    const [statistics, setStatistics] = useState({
        pendingAmount: 0,
        shippingAmount: 0,
        deliveredAmount: 0,
        canceledAmount: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Xử lý nút back vật lý trên Android
    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [navigation]);

    // Lấy dữ liệu thống kê từ API
    const fetchStatistics = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://192.168.1.249:8080/api/v1/user/cashflow/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStatistics(response.data);
        } catch (err) {
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchStatistics(userId);
        }
    }, [userId]);

    // Dữ liệu cho biểu đồ cột
    const barData = {
        labels: ["Chờ xác nhận", "Đang giao", "Đã giao", "Đã hủy"],
        datasets: [
            {
                data: [
                    statistics.pendingAmount,
                    statistics.shippingAmount,
                    statistics.deliveredAmount,
                    statistics.canceledAmount,
                ],
            },
        ],
    };

    // Dữ liệu cho biểu đồ tròn
    const pieData = [
        {
            name: "Chờ xác nhận",
            amount: statistics.pendingAmount,
            color: "#e63946",
            legendFontColor: "#333",
            legendFontSize: 14,
        },
        {
            name: "Đang giao",
            amount: statistics.shippingAmount,
            color: "#f4a261",
            legendFontColor: "#333",
            legendFontSize: 14,
        },
        {
            name: "Đã giao",
            amount: statistics.deliveredAmount,
            color: "#2a9d8f",
            legendFontColor: "#333",
            legendFontSize: 14,
        },
        {
            name: "Đã hủy",
            amount: statistics.canceledAmount,
            color: "#6b7280",
            legendFontColor: "#333",
            legendFontSize: 14,
        },
    ].filter(item => item.amount > 0);

    // Dữ liệu cho bảng
    const tableData = [
        { label: "Đơn chờ xác nhận", amount: statistics.pendingAmount },
        { label: "Đơn đang giao", amount: statistics.shippingAmount },
        { label: "Đơn đã giao", amount: statistics.deliveredAmount },
        { label: "Đơn đã hủy", amount: statistics.canceledAmount },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <AntDesign name="arrowleft" size={24} color="#e63946" />
                </Pressable>
                <Text style={styles.title}>Thống Kê Dòng Tiền</Text>
                <Pressable
                    style={styles.cartButton}
                    onPress={() => navigation.navigate("Cart")}
                >
                    <AntDesign name="shoppingcart" size={24} color="#e63946" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#e63946" style={styles.loader} />
                ) : (
                    <>
                        {/* Biểu đồ cột */}
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Tổng Số Tiền</Text>
                            <BarChart
                                data={barData}
                                width={screenWidth - 40}
                                height={240}
                                yAxisLabel="₫"
                                chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#ffffff",
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(230, 57, 70, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                                    style: {
                                        borderRadius: 12,
                                    },
                                    propsForBars: {
                                        strokeWidth: "2",
                                        stroke: "#e63946",
                                    },
                                }}
                                style={styles.chart}
                                showValuesOnTopOfBars
                            />
                        </View>

                        {/* Biểu đồ tròn */}
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Tỷ Lệ</Text>
                            {pieData.length > 0 ? (
                                <PieChart
                                    data={pieData}
                                    width={screenWidth - 40}
                                    height={240}
                                    chartConfig={{
                                        backgroundColor: "#ffffff",
                                        backgroundGradientFrom: "#ffffff",
                                        backgroundGradientTo: "#ffffff",
                                        color: (opacity = 1) => `rgba(230, 57, 70, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                                    }}
                                    accessor="amount"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    center={[10, 0]}
                                    absolute
                                />
                            ) : (
                                <Text style={styles.emptyChartText}>Không có dữ liệu để hiển thị</Text>
                            )}
                        </View>

                        {/* Bảng giá trị */}
                        <View style={styles.tableContainer}>
                            <Text style={styles.tableTitle}>Bảng Giá Trị</Text>
                            {tableData.map((item, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableLabel}>{item.label}</Text>
                                    <Text style={styles.tableAmount}>
                                        {item.amount.toLocaleString()}₫
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

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
        borderWidth: 1,
        borderColor: "#e63946",
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
        borderWidth: 1,
        borderColor: "#e63946",
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
        textTransform: "uppercase",
    },
    content: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    errorText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#e63946",
        textAlign: "center",
        marginVertical: 15,
    },
    loader: {
        marginVertical: 30,
    },
    chartContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginVertical: 8,
        padding: 15,
        borderWidth: 1,
        borderColor: "#e63946",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 15,
        textAlign: "center",
    },
    chart: {
        borderRadius: 10,
        padding: 10,
    },
    emptyChartText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#777",
        textAlign: "center",
        marginVertical: 20,
    },
    tableContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginVertical: 8,
        padding: 15,
        borderWidth: 1,
        borderColor: "#e63946",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 15,
        textAlign: "center",
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    tableLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    tableAmount: {
        fontSize: 16,
        fontWeight: "600",
        color: "#e63946",
    },
});

export default CashFlowStatisticsScreen;