import { configureStore } from "@reduxjs/toolkit";
import CartReducer from "./redux/CartReducer";
import { wishlistReducer } from "./redux/WishlistReducer"; // Import wishlistReducer

export default configureStore({
    reducer: {
        cart: CartReducer,
        wishlist: wishlistReducer, // Thêm wishlistReducer vào store
    },
});
