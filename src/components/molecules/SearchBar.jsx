import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Input from "@/components/atoms/Input"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"
import { productService } from "@/services/api/productService"

const SearchBar = ({ onSearch, placeholder = "Search products...", className }) => {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Debounced search for suggestions
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim() && query.length > 2) {
        setLoading(true)
        try {
          const results = await productService.search(query.trim())
          setSuggestions(results.slice(0, 5)) // Show max 5 suggestions
          setShowDropdown(true)
        } catch (error) {
          console.error("Error fetching search suggestions:", error)
          setSuggestions([])
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
        setShowDropdown(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setShowDropdown(false)
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSuggestionClick = (product) => {
    setQuery(product.title)
    setShowDropdown(false)
    navigate(`/search?q=${encodeURIComponent(product.title)}`)
  }

  const handleClear = () => {
    setQuery("")
    setSuggestions([])
    setShowDropdown(false)
    if (onSearch) {
      onSearch("")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <form onSubmit={handleSubmit} className="relative flex">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-20"
          autoComplete="off"
        />
        
        <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <ApperIcon name="X" size={16} />
            </Button>
          )}
          
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <ApperIcon name="Search" size={16} />
          </Button>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-secondary">
              <ApperIcon name="Loader2" size={16} className="animate-spin inline mr-2" />
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((product) => (
                <button
                  key={product.Id}
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-10 h-10 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'flex'
                      }}
                    />
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center hidden">
                      <ApperIcon name="Image" size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary truncate">{product.title}</p>
                      <p className="text-sm text-secondary">${product.price.toFixed(2)} • {product.category}</p>
                    </div>
                  </div>
                </button>
              ))}
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleSubmit}
                  className="w-full text-center text-sm text-primary hover:text-accent transition-colors"
                >
                  View all results for "{query}" →
                </button>
              </div>
            </>
          ) : query.length > 2 ? (
            <div className="p-4 text-center text-secondary">
              No products found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchBar