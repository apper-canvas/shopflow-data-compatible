import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import wishlistReducer from './wishlistSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    wishlist: wishlistReducer,
  },
});