import { useState, useEffect } from "react"
import { toast } from "react-toastify"

const STORAGE_KEY = "shopflow_cart"

export const useCart = () => {
  const [cartItems, setCartItems] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY)
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setCartItems(parsed)
      } catch (error) {
        console.error("Error parsing saved cart:", error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.Id === product.Id)
      
      if (existingItem) {
        toast.success(`Increased quantity of ${product.title}`)
        return prev.map(item =>
          item.product.Id === product.Id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        toast.success(`Added ${product.title} to cart`)
        return [...prev, {
          product: { ...product },
          quantity: 1,
          addedAt: new Date().toISOString()
        }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCartItems(prev => {
      const item = prev.find(item => item.product.Id === productId)
      if (item) {
        toast.info(`Removed ${item.product.title} from cart`)
      }
      return prev.filter(item => item.product.Id !== productId)
    })
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems(prev => 
      prev.map(item =>
        item.product.Id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    toast.info("Cart cleared")
  }

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    )
  }

  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    isDrawerOpen,
    openDrawer,
    closeDrawer
  }
}