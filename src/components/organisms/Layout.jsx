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

const handleSearch = async (query) => {
    // This function is now handled by SearchBar component directly
    // but kept for backwards compatibility
    if (query && query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
    }
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