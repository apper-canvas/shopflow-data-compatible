import React from "react"
import { Link } from "react-router-dom"
import SearchBar from "@/components/molecules/SearchBar"
import CartIcon from "@/components/molecules/CartIcon"
import ApperIcon from "@/components/ApperIcon"

const Header = ({ cartItemCount, onCartClick, onSearch }) => {
  const categories = ["Electronics", "Clothing", "Home & Kitchen", "Sports", "Accessories"]

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
            
            <CartIcon
              itemCount={cartItemCount}
              onClick={onCartClick}
            />
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