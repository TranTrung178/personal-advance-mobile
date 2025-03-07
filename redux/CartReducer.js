import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",

  async ({ userId, token, checkCart, setCheckCart }, { rejectWithValue }) => {
    try {
      let response;
      console.log(checkCart, 'kkkk');
      if (checkCart) {
        response = await axios.get(
          `http://192.168.1.10:8080/api/v1/user/cart/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCheckCart(false);
      }
      // console.log("📌 API Response:", response.data);
      return response.data;
    } catch (error) {
      // console.error("❌ API Fetch Error cart reducer:", error.response?.data, userId, token);
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
  },
  reducers: {
    addToCart: (state, action) => {
      const itemPresent = state.cart.find(
        (item) => item.id === action.payload.id
      );
      if (itemPresent) {
        itemPresent.quantity++;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload.id);
    },
    incementQuantity: (state, action) => {
      const item = state.cart.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity++;
      }
    },
    decrementQuantity: (state, action) => {
      const item = state.cart.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity--;
        if (item.quantity === 0) {
          state.cart = state.cart.filter((i) => i.id !== item.id);
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
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload || [];  // ✅ Gán đúng dữ liệu vào state
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
