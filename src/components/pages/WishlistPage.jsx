import React from "react"
import { useOutletContext } from "react-router-dom"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import Empty from "@/components/ui/Empty"
import HeartButton from "@/components/molecules/HeartButton"
import { useWishlist } from "@/hooks/useWishlist"

const WishlistPage = () => {
  const { addToCart } = useOutletContext()
  const { 
    wishlistItems, 
    removeFromWishlist, 
    moveToCart, 
    clearWishlist 
  } = useWishlist()

  const handleMoveToCart = (product) => {
    moveToCart(product.Id, addToCart)
  }

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId)
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">My Wishlist</h1>
          <p className="text-secondary">Save your favorite items for later</p>
        </div>
        
        <Empty
          icon="Heart"
          title="Your wishlist is empty"
          description="Start adding products to your wishlist by clicking the heart icon on any product."
          action={() => window.location.href = "/"}
          actionLabel="Browse Products"
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">My Wishlist</h1>
          <p className="text-secondary">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        
        {wishlistItems.length > 0 && (
          <Button
            variant="outline"
            onClick={clearWishlist}
            className="text-error border-error hover:bg-error hover:text-white"
          >
            <ApperIcon name="Trash2" size={16} className="mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <div key={product.Id} className="bg-surface rounded-lg shadow-card overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-64 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hidden">
                <div className="text-center">
                  <ApperIcon name="ImageOff" size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Image not available</p>
                </div>
              </div>

              {/* Heart button in top-right */}
              <div className="absolute top-3 right-3">
                <HeartButton
                  isInWishlist={true}
                  onClick={() => handleRemoveFromWishlist(product.Id)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
                />
              </div>

              {!product.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <span className="bg-surface text-primary px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                {product.title}
              </h3>
              
              <p className="text-sm text-secondary mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-primary">
                  ${product.price}
                </span>
                <span className="text-sm text-secondary px-2 py-1 bg-background rounded">
                  {product.category}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleMoveToCart(product)}
                  disabled={!product.inStock}
                  size="sm"
                  className="flex-1"
                >
                  <ApperIcon name="ShoppingCart" size={14} className="mr-1" />
                  Move to Cart
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(product.Id)}
                  className="text-error border-error hover:bg-error hover:text-white"
                >
                  <ApperIcon name="X" size={14} />
                </Button>
              </div>

              <div className="mt-2 text-xs text-secondary">
                Added {new Date(product.addedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WishlistPage