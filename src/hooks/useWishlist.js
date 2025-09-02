import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import { addToWishlist, removeFromWishlist, setWishlistItems } from "@/store/wishlistSlice"

const STORAGE_KEY = "shopflow-wishlist"

export const useWishlist = () => {
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const wishlistCount = useSelector((state) => state.wishlist.count)

  useEffect(() => {
    const savedWishlist = localStorage.getItem(STORAGE_KEY)
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist)
        dispatch(setWishlistItems(parsed))
      } catch (error) {
        console.error("Error parsing saved wishlist:", error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [dispatch])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems))
  }, [wishlistItems])

  const addToWishlistHandler = (product) => {
    dispatch(addToWishlist(product))
    toast.success(`Added ${product.title} to wishlist`)
  }

  const removeFromWishlistHandler = (productId) => {
    const item = wishlistItems.find(item => item.Id === productId)
    if (item) {
      dispatch(removeFromWishlist(productId))
      toast.info(`Removed ${item.title} from wishlist`)
    }
  }

  const toggleWishlist = (product) => {
    const isInWishlist = wishlistItems.some(item => item.Id === product.Id)
    
    if (isInWishlist) {
      removeFromWishlistHandler(product.Id)
    } else {
      addToWishlistHandler(product)
    }
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.Id === productId)
  }

  const clearWishlist = () => {
    dispatch(setWishlistItems([]))
    toast.info("Wishlist cleared")
  }

  const moveToCart = (productId, addToCartCallback) => {
    const item = wishlistItems.find(item => item.Id === productId)
    if (item && addToCartCallback) {
      addToCartCallback(item)
      removeFromWishlistHandler(productId)
      toast.success(`Moved ${item.title} to cart`)
    }
  }

  return {
    wishlistItems,
    wishlistCount,
    addToWishlist: addToWishlistHandler,
    removeFromWishlist: removeFromWishlistHandler,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    moveToCart
  }
}