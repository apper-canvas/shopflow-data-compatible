import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  count: 0
}

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const existingItem = state.items.find(item => item.Id === action.payload.Id)
      
      if (!existingItem) {
        state.items.push({
          ...action.payload,
          addedAt: new Date().toISOString()
        })
        state.count = state.items.length
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.Id !== action.payload)
      state.count = state.items.length
    },
    setWishlistItems: (state, action) => {
      state.items = action.payload || []
      state.count = state.items.length
    },
    clearWishlist: (state) => {
      state.items = []
      state.count = 0
    }
  }
})

export const { 
  addToWishlist, 
  removeFromWishlist, 
  setWishlistItems, 
  clearWishlist 
} = wishlistSlice.actions

export default wishlistSlice.reducer