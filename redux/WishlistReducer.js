const initialState = {
    wishlist: [],
};

export const wishlistReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_TO_WISHLIST":
            return {
                ...state,
                wishlist: [...state.wishlist, action.payload],
            };
        case "REMOVE_FROM_WISHLIST":
            return {
                ...state,
                wishlist: state.wishlist.filter(
                    (item) => item.product_id !== action.payload.product_id
                ),
            };
        default:
            return state;
    }
};

// Action Creators
export const addToWishlist = (item) => ({
    type: "ADD_TO_WISHLIST",
    payload: item,
});

export const removeFromWishlist = (product_id) => ({
    type: "REMOVE_FROM_WISHLIST",
    payload: { product_id },
});