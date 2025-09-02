import React, { useState, useEffect } from "react"
import { useSearchParams, useOutletContext } from "react-router-dom"
import ProductGrid from "@/components/organisms/ProductGrid"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"
import productService from "@/services/api/productService"

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("relevance")
  
  const { addToCart } = useOutletContext()
  const query = searchParams.get('q') || ''
  const categories = productService.getCategories()

  const performSearch = async () => {
    if (!query.trim()) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")
      
      let results = await productService.search(query.trim())
      
      // Apply category filter
      if (selectedCategory !== "all") {
        results = results.filter(product => 
          product.category.toLowerCase() === selectedCategory.toLowerCase()
        )
      }
      
      // Apply sorting
      results = [...results].sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price
          case 'price-high':
            return b.price - a.price
          case 'name':
            return a.title.localeCompare(b.title)
          case 'relevance':
          default:
            // For relevance, prioritize exact title matches, then partial matches
            const aExactMatch = a.title.toLowerCase().includes(query.toLowerCase())
            const bExactMatch = b.title.toLowerCase().includes(query.toLowerCase())
            if (aExactMatch && !bExactMatch) return -1
            if (!aExactMatch && bExactMatch) return 1
            return a.title.localeCompare(b.title)
        }
      })
      
      setProducts(results)
    } catch (err) {
      setError("Failed to search products. Please try again.")
      console.error("Error searching products:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    performSearch()
  }, [query, selectedCategory, sortBy])

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const handleSortChange = (sort) => {
    setSortBy(sort)
  }

  const getResultsText = () => {
    if (loading) return "Searching..."
    if (error) return "Search failed"
    if (!query.trim()) return "Enter a search term"
    
    const count = products.length
    const categoryText = selectedCategory === "all" ? "" : ` in ${selectedCategory}`
    return `${count} result${count !== 1 ? 's' : ''} found for "${query}"${categoryText}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-surface border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">Search Results</h1>
              <p className="text-secondary mt-1">{getResultsText()}</p>
            </div>
            
            {!loading && !error && query.trim() && (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="appearance-none bg-surface border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ApperIcon 
                    name="ChevronDown" 
                    size={16} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>

                {/* Sort Filter */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-surface border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="relevance">Sort by Relevance</option>
                    <option value="name">Sort by Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ApperIcon 
                    name="ChevronDown" 
                    size={16} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Results Content */}
      <div className="max-w-7xl mx-auto">
        {!query.trim() ? (
          <div className="text-center py-20">
            <ApperIcon name="Search" size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-primary mb-2">Start Your Search</h2>
            <p className="text-secondary">Enter a search term to find products</p>
          </div>
        ) : (
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            onAddToCart={addToCart}
            onRetry={performSearch}
            emptyMessage={`No products found for "${query}"`}
            emptyDescription="Try adjusting your search terms or browse our categories."
          />
        )}
      </div>
    </div>
  )
}

export default SearchResults