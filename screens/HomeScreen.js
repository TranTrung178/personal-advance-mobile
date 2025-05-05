import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign, Feather } from "@expo/vector-icons";
// import { SliderBox } from "react-native-image-slider-box";

import axios from "axios";
import ProductItem from "../components/ProductItem";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../UserContext";

const HomeScreen = () => {
  const list = [
    {
      id: "0",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT20SzyLWRYAjxLPL1wt6gwC0NkpvrzXBgtVQ&s",
      name: "Lamp",
    },
    {
      id: "1",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJowdqpV6KE3spD6uSi9CaSdMDaCvXVlK2Kw&s",
      name: "Chair",
    },
    {
      id: "3",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP2Y5vWtKmWhi6t16aszdW4Ps79KqjpuZBig&s",
      name: "Wardrobe",
    },
    {
      id: "4",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2n1L73Y1urchVrfcGMgbCM7B31q5WL0AhxQ&s",
      name: "Bed",
    },
    {
      id: "5",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN8duC_vuln_SkMl2rnxaZ0dhFOLS9j6OLNA&s",
      name: "Carpet",
    },
    {
      id: "6",
      image: "https://m.media-amazon.com/images/I/71hg3l7PkHL.jpg",
      name: "Food Trolley",
    },
  ];

  const sampleAddresses = [
    {
      id: "1",
      name: "John Doe",
      houseNo: "123",
      landmark: "Near Park",
      street: "MG Road",
    },
    {
      id: "2",
      name: "Alice Smith",
      houseNo: "456",
      landmark: "Opposite Mall",
      street: "Brigade Road",
    },
    {
      id: "3",
      name: "Bob Johnson",
      houseNo: "789",
      landmark: "Next to Hospital",
      street: "Residency Road",
    },
  ];

  const navigation = useNavigation();

  const [products, setProducts] = useState([]); // Danh sách sản phẩm đang hiển thị
  const [page, setPage] = useState(1); // Trang hiện tại
  const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
  const [hasMore, setHasMore] = useState(true);
  const [isSorted, setIsSorted] = useState(false);
  const [isCategory, setIsCategory] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [loadingSearch, setloadingSearch] = useState(false);
  const [prodSearch, setProdSearch] = useState([]); // Danh sách sản phẩm đang hiển thị


  const [addresses, setAddresses] = useState([]);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([{ label: "All", value: "all" }]);
  const [category, setCategory] = useState("all");

  const [openSort, setOpenSort] = useState(false);
  const [sortValue, setSortValue] = useState(null);
  const [sortOptions, setSortOptions] = useState([
    {
      label: "Giá tăng dần",
      value: "price_low",
      icon: () => <Ionicons name="arrow-up" size={20} color="black" />,
    },
    {
      label: "Giá giảm dần",
      value: "price_high",
      icon: () => <Ionicons name="arrow-down" size={20} color="black" />,
    },
  ]);

  const { userId, setUserId, token, setToken, refreshToken, setRefreshToken } = useContext(UserType);
  console.log("Home: ", userId, token);

  const fetchSearchResults = async (text) => {
    if (!text.trim()) return; // Không tìm kiếm nếu input rỗng
    console.log(text, 'dfd')
    setloadingSearch(true);
    try {
      const response = await axios.get(
        `http://192.168.5.123:8080/api/v1/product/search/${text}/1`,
        {
          headers: { Authorization: `Bearer ${token}` }, // Thêm token nếu cần xác thực
        }
      );
      const data = response.data.products
        ? [].concat(response.data.products) // Đảm bảo chuyển thành mảng
        : [];
      setProdSearch(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setIsSorted(true);

    try {
      const response = await axios.get(`http://192.168.5.123:8080/api/v1/product/getall/${page}`);

      // Kiểm tra response.data có dữ liệu hay không trước khi chuyển thành mảng
      const newProducts = response.data.products
        ? [].concat(response.data.products) // Đảm bảo chuyển thành mảng
        : [];

      if (newProducts.length === 0) {
        setHasMore(false); // Hết dữ liệu
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1); // Tăng page lên
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductSort = async (sortValue) => {
    if (!sortValue) return; // Nếu chưa chọn giá trị sort thì không gọi API
    setLoading(true);
    setProducts([])
    setIsCategory(true)
    const order = sortValue === "price_high" ? "desc" : "asc";

    try {
      const response = await axios.get(
        `http://192.168.5.123:8080/api/v1/product/sort/${order}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // Thêm token nếu cần xác thực
        }
      );

      // Kiểm tra response.data có dữ liệu không trước khi chuyển thành mảng
      const sortedProducts = response.data
        ? [].concat(response.data)
        : [];

      setProducts(sortedProducts);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo sort:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSorted) {
      fetchProducts();
    }

  }, [isSorted]);

  useEffect(() => {
    if (sortValue) {
      fetchProductSort(sortValue);
    }
  }, [sortValue]);


  //    Category
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://192.168.5.123:8080/api/v1/category/getall");
        const categoryData = response.data.map((cat) => ({
          label: cat.name,
          value: cat.id.toString(),
        }));

        setItems([{ label: "All", value: "all" }, ...categoryData]);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  const onDropdownOpen = useCallback(() => {
    setOpen(true);
  }, []);


  // Fetch product by category
  const fetchProductsByCategory = async (categoryId) => {

    setProducts([]);
    setPage(1);

    try {
      if (categoryId === 'all') {
        setLoading(false)
        setHasMore(true)
        fetchProducts();
        return;
      }
      const url = `http://192.168.5.123:8080/api/v1/product/category/${categoryId}/1`

      const response = await axios.get(url);

      const newProducts = response.data.products || [];



      setProducts(newProducts);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    }
  };

  useEffect(() => {
    if (!isCategory) return
    fetchProductsByCategory(category);
  }, [category]);


  const [lastProducts, setLastProducts] = useState([]);

  const fetchLast10Products = async () => {
    try {
      const response = await axios.get("http://192.168.5.123:8080/api/v1/product/last-10");
      const products = response.data ? [].concat(response.data) : [];
      setLastProducts(products);
    } catch (error) {
      console.error("Lỗi khi lấy 10 sản phẩm mới nhất:", error);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchLast10Products();
  }, []);



  const cart = useSelector((state) => state.cart.cart);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId, modalVisible]);
  const fetchAddresses = async () => {
    try {
      // const response = await axios.get(
      //   `http://localhost:8000/addresses/${userId}`
      // );
      // const { addresses } = response.data;

      setAddresses(sampleAddresses);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedToken = await AsyncStorage.getItem("authToken");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken");

        if (storedUserId) setUserId(storedUserId);
        if (storedToken) setToken(storedToken);
        if (storedRefreshToken) setRefreshToken(storedRefreshToken);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ AsyncStorage:", error);
      }
    };

    fetchUser();
  }, []);

  const renderHeader = () => (
    <View>
      {/* <Pressable
            onPress={() => setModalVisible(!modalVisible)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              padding: 10,
              backgroundColor: "#AFEEEE",
            }}
          >
            <Ionicons name="location-outline" size={24} color="black" />

            <Pressable>
              {selectedAddress ? (
                <Text>
                  Deliver to {selectedAddress?.name} - {selectedAddress?.street}
                </Text>
              ) : (
                <Text style={{ fontSize: 13, fontWeight: "500" }}>
                  Add a Address
                </Text>
              )}
            </Pressable>

            <Ionicons name="keyboard-arrow-down" size={24} color="black" />
          </Pressable> */}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {list.map((item, index) => (
          <Pressable
            key={index}
            style={{
              margin: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                resizeMode: "cover",
                overflow: "hidden",
              }}
              source={{ uri: item.image }}
            />

            <Text
              style={{
                textAlign: "center",
                fontSize: 12,
                fontWeight: "500",
                marginTop: 5,
              }}
            >
              {item?.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* <SliderBox
            images={images}
            autoPlay
            circleLoop
            dotColor={"#13274F"}
            inactiveDotColor="#90A4AE"
            ImageComponentStyle={{ width: "100%" }}
          /> */}

      {/* Top deal of the week */}
      {/* <Carousel
            loop
            autoPlay
            data={images}
            width={width_image.width}
            height={200}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width: "100%", height: 200 }} />
            )}
          />

          <Text style={{ padding: 10, fontSize: 18, fontWeight: "bold" }}>
            Trending Deals of the week
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {deals.map((item, index) => (
              <Pressable
                key={index}
                onPress={() =>
                  navigation.navigate("Info", {
                    id: item.id,
                    title: item.title,
                    price: item?.price,
                    carouselImages: item.carouselImages,
                    color: item?.color,
                    size: item?.size,
                    oldPrice: item?.oldPrice,
                    item: item,
                  })
                }
                style={{
                  marginVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  style={{ width: 180, height: 180, resizeMode: "contain" }}
                  source={{ uri: item?.image }}
                />
              </Pressable>
            ))}
          </View> */}

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 10 }}>

        {/* Category list */}
        <View
          style={{
            marginHorizontal: 10,
            marginTop: 20,
            width: "45%",
            marginBottom: open ? 50 : 15,
          }}
        >
          <Text style={{ fontSize: 13, marginBottom: 5, marginLeft: 5, fontWeight: "bold" }}>
            Category
          </Text>
          <DropDownPicker
            style={{
              borderColor: "#B7B7B7",
              height: 20,
              marginBottom: open ? 50 : 15,
            }}
            open={open}
            value={category}
            items={items}
            setOpen={setOpen}
            setValue={(val) => {
              setCategory(val)
              setIsCategory(true)
              // fetchProductsByCategory(category)
            }}
            setItems={setItems}
            placeholder="choose category"
            placeholderStyle={styles.placeholderStyles}
            onOpen={onDropdownOpen}
            zIndex={3000}
            zIndexInverse={1000}
            dropDownDirection="BOTTOM"
            listMode="SCROLLVIEW"
            maxHeight={250}
          />
        </View>

        {/* Sort */}
        <View style={{ marginHorizontal: 10, marginTop: 20, width: "30%" }}>
          <Text style={{ fontSize: 13, marginBottom: 5, marginLeft: 5, fontWeight: "bold" }}>
            Sort
          </Text>
          <DropDownPicker
            style={{ borderColor: "#B7B7B7", height: 40 }}
            open={openSort}
            value={sortValue}
            items={sortOptions}
            setOpen={setOpenSort}
            setValue={(val) => {
              setSortValue(val); // Cập nhật giá trị sort
              fetchProductSort(sortValue); // Gọi hàm sắp xếp sản phẩm
            }}
            placeholder="Sắp xếp"
            placeholderStyle={{ color: "#999" }}
            dropDownDirection="BOTTOM"
            listMode="SCROLLVIEW"
            maxHeight={250}
            showTickIcon={false}
          />
        </View>

      </View>

      <Text
        style={{
          height: 1,
          borderColor: "#D0D0D0",
          borderWidth: 2,
          marginTop: 15,
        }}
      />

      <Text style={{ padding: 10, fontSize: 18, fontWeight: "bold" }}>
        Today's Deals
      </Text>

      {/* Old 4 product */}
      {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {offers.map((item, index) => (
          <Pressable
            key={index}
            onPress={() =>
              navigation.navigate("Info", {
                id: item.id,
                title: item.title,
                price: item?.price,
                carouselImages: item.carouselImages,
                color: item?.color,
                size: item?.size,
                oldPrice: item?.oldPrice,
                item: item,
              })
            }
            style={{
              marginVertical: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              style={{ width: 150, height: 150, resizeMode: "contain" }}
              source={{ uri: item?.image }}
            />

            <View
              style={{
                backgroundColor: "#E31837",
                paddingVertical: 5,
                width: 130,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontSize: 13,
                  fontWeight: "bold",
                }}
              >
                Upto {item?.offer}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView> */}

      {/* 10 new products */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {lastProducts.map((item, index) => (
          <Pressable
            key={index}
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
                stock: item.stoke,
              })
            }
            style={{
              backgroundColor: "#e8e6e5",

              marginVertical: 10,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 5,
            }}
          >
            <Image
              style={{
                width: 150, height: 150, borderRadius: 25,
                resizeMode: "cover",
                overflow: "hidden",
              }}
              source={{ uri: `data:image/jpeg;base64,${item?.img1}` }}
            />

            <View
              style={{
                backgroundColor: "#E31837",
                paddingVertical: 5,
                width: 130,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontSize: 13,
                  fontWeight: "bold",
                }}
              >
                Upto {item?.offer}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>


      <Text
        style={{
          height: 1,
          borderColor: "#D0D0D0",
          borderWidth: 2,
          marginTop: 15,
        }}
      />


    </View>
  );

  return (
    <>
      {/* Thanh tìm kiếm */}
      <View style={{ backgroundColor: "#878595", padding: 10, flexDirection: "row", alignItems: "center", paddingTop: 35, height: 100 }}>
        <Pressable style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 7, gap: 10, backgroundColor: "white", borderRadius: 3, height: 38, flex: 1 }}>
          <Pressable onPress={() => fetchSearchResults(searchText)} style={{ paddingLeft: 10 }}>
            <AntDesign name="search1" size={22} color="black" />
          </Pressable>

          <TextInput
            placeholder="Search Furniture..."
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text)
              if (text.length === 0) setloadingSearch(false)
            }}
            style={{ flex: 1 }}
          />
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Profile")}>
          <Image
            source={{ uri: "https://img.freepik.com/premium-vector/avatar-profile-vector-illustrations-website-social-networks-user-profile-icon_495897-224.jpg" }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 50,
              // marginBottom: 25,
            }}
          />
        </Pressable>
      </View>

      {/* Hiển thị danh sách sản phẩm */}
      {loadingSearch ? (
        // 🔹 Chỉ hiển thị kết quả tìm kiếm khi `isSearching === true`
        <FlatList
          key={"search"}
          data={prodSearch}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ flex: 1, margin: 5 }}>
              <ProductItem item={item} />
            </View>
          )}
          ListEmptyComponent={

            <View style={{ alignItems: "center", marginVertical: 50 }}>
              <Feather name="shopping-bag" size={50} color="#B7B7B7" />
              <Text style={{ fontSize: 16, color: "#777", marginTop: 10 }}>No products available.</Text>
            </View>

          }
        />
      ) : (
        // 🔹 Nếu không tìm kiếm, hiển thị danh sách sản phẩm trên Home
        <FlatList
          key={"grid"}
          ListHeaderComponent={renderHeader}
          data={products}
          renderItem={({ item }) => (
            <View style={{ flex: 1, margin: 5 }}>
              <ProductItem item={item} />
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          onEndReached={fetchProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator size="large" color="blue" /> : null}
          ListEmptyComponent={
            !loading && (
              <View style={{ alignItems: "center", marginVertical: 50 }}>
                <Feather name="shopping-bag" size={50} color="#B7B7B7" />
                <Text style={{ fontSize: 16, color: "#777", marginTop: 10 }}>No products available.</Text>
              </View>
            )
          }
        />
      )}
    </>



  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
