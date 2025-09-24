import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import SearchBar from "@/components/molecules/SearchBar"
import CartIcon from "@/components/molecules/CartIcon"
import WishlistIcon from "@/components/molecules/WishlistIcon"
import ApperIcon from "@/components/ApperIcon"
import { useWishlist } from "@/hooks/useWishlist"
import { useAuth } from "@/layouts/Root"

const Header = ({ cartItemCount, onCartClick, onSearch }) => {
  const { wishlistCount } = useWishlist()
  const { logout } = useAuth()
  const { isAuthenticated } = useSelector((state) => state.user)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const categories = ["Electronics", "Clothing", "Home & Kitchen", "Sports", "Accessories"]

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple logout attempts
    
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-surface shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <ApperIcon name="Store" size={18} className="text-surface" />
            </div>
            <span className="font-bold text-xl text-primary">ShopFlow</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-primary hover:text-accent font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/deals"
              className="text-secondary hover:text-primary transition-colors font-medium"
            >
              Deals
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-primary hover:text-accent font-medium transition-colors">
                Categories
                <ApperIcon name="ChevronDown" size={16} />
              </button>
              
              <div className="absolute top-full left-0 mt-1 w-48 bg-surface rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-gray-50 transition-colors"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Search & Cart */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <SearchBar onSearch={onSearch} />
            </div>
            
            <Link
              to="/orders"
              className="text-primary hover:text-accent font-medium transition-colors hidden md:block"
            >
              My Orders
            </Link>

            
            
            <WishlistIcon itemCount={wishlistCount} />
            
            <CartIcon
              itemCount={cartItemCount}
              onClick={onCartClick}
            />

            {/* Logout Button - visible when authenticated */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`flex items-center gap-1 font-medium transition-colors ${
                  isLoggingOut
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-secondary hover:text-red-600"
                }`}
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                    <span className="hidden sm:block">Logging out...</span>
                  </>
                ) : (
                  <>
                    <ApperIcon name="LogOut" size={16} />
                    <span className="hidden sm:block">Logout</span>
                  </>
                )}
              </button>
            )}

            {/* Login Button - visible when not authenticated */}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="text-primary hover:text-accent font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-3">
          <SearchBar onSearch={onSearch} className="w-full" />
        </div>
      </div>
    </header>
  )
}

export default Header