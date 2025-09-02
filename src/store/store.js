import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import wishlistReducer from './wishlistSlice';
import checkoutReducer from './checkoutSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    wishlist: wishlistReducer,
    checkout: checkoutReducer,
  },
});