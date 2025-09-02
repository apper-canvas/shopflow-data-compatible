import React from "react"
import { Outlet } from "react-router-dom"
import Header from "@/components/organisms/Header"
import CartDrawer from "@/components/organisms/CartDrawer"
import { useCart } from "@/hooks/useCart"

const Layout = () => {
  const {
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
  } = useCart()

  const handleSearch = (query) => {
    // Placeholder for search functionality
    console.log("Search query:", query)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={getItemCount()}
        onCartClick={openDrawer}
        onSearch={handleSearch}
      />
      
      <main className="flex-1">
        <Outlet context={{ addToCart }} />
      </main>

      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        subtotal={getSubtotal()}
      />
    </div>
  )
}

export default Layout