import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",

  async ({ userId, token, checkCart, setCheckCart }, { rejectWithValue }) => {
    try {
      let response;
      console.log(checkCart, 'kkkk');
      if (1) {
        response = await axios.get(
          `http://192.168.1.249:8080/api/v1/user/cart/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCheckCart(false);
      }
      return response.data ? response.data : {
        userId,
        id: null, //order
        cartItems: [],
      };
    } catch (error) {
      console.log("❌ API Fetch Error cart reducer:", userId, token);
      // return rejectWithValue(error.response?.data || "Lỗi khi tải giỏ hàng");
    }
  }
);

export const CartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    loading: false,
    error: null,
    userId: null,
    orderId: null,
  },
  reducers: {
    addToCart: (state, action) => {
      console.log("Top-level keys:", Object.keys(action.payload), '23d2334kk');
      console.log("statesdsd", Object.keys(state), '23d2334kk');
      console.log('dfdfdf', state.userId);

      const itemPresent = state.cart.find(
        (item) => item.productId === action.payload.id
      );
      if (itemPresent) {
        itemPresent.quantity++;
      } else {
        state.cart.push({
          id: null,
          productId: action.payload.id,
          productName: action.payload.name,
          price: action.payload.price,
          quantity: 1,
          img: action.payload.img1,
          userId: state.userId || null,
          orderId: state.orderId || null,
        });
      }
    },
    removeFromCart: (state, action) => {
      console.log("Top-level keys:", Object.keys(action.payload), '2334kk');

      state.cart = state.cart.filter((item) => item.productName !== action.payload.productName);
    },
    incementQuantity: (state, action) => {
      console.log("Top-level keys:", Object.keys(action.payload), '2334kk');
      console.log('productName', action.payload.productName)
      const item = state.cart.find((item) => item.productName === action.payload.productName);
      if (item) {
        const isRestrictedProduct =
          item.productName === "Tủ bếp Daily" || item.productName === "Tủ bếp Fancy";

        if (isRestrictedProduct && item.quantity >= 10) {
          return; // Không tăng nữa nếu đã tới giới hạn
        }

        item.quantity++;
      }
    },
    decrementQuantity: (state, action) => {
      console.log("Top-level keys:", Object.keys(action.payload), '2334kk');

      const item = state.cart.find((item) => item.productName === action.payload.productName);
      if (item) {
        item.quantity--;
        if (item.quantity === 0) {
          state.cart = state.cart.filter((i) => i.productName !== item.productName);
        }
      }
    },
    cleanCart: (state) => {
      state.cart = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = "error pending";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cartItems || [];
        state.userId = action.payload.userId || null;
        state.orderId = action.payload.id || null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = "error rejected";
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  incementQuantity,
  decrementQuantity,
  cleanCart,
} = CartSlice.actions;

export default CartSlice.reducer;
