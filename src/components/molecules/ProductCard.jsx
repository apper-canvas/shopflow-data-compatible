import React from "react"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import HeartButton from "@/components/molecules/HeartButton"
import { cn } from "@/utils/cn"
import { useWishlist } from "@/hooks/useWishlist"

const ProductCard = ({ product, onAddToCart, className }) => {
  const { isInWishlist, toggleWishlist } = useWishlist()

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }
  const handleAddToCart = () => {
if (product.inStock && onAddToCart) {
      onAddToCart(product)
    }
  }

  return (
    <div className={cn(
      "bg-surface rounded-lg shadow-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
      className
    )}>
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

        {/* Sale Badge */}
        {product.promotion && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-error text-white px-2 py-1 rounded-md text-xs font-bold shadow-md">
              {Math.round(product.promotion.discount_percentage_c)}% OFF
            </div>
          </div>
        )}

        {/* Heart button in top-right corner */}
        <div className="absolute top-3 right-3">
          <HeartButton
            isInWishlist={isInWishlist(product.Id)}
            onClick={handleWishlistToggle}
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
        <h3 className="font-semibold text-primary mb-2 line-clamp-2 hover:text-primary/80 cursor-pointer">
          <a href={`/product/${product.Id}`}>
            {product.title}
          </a>
        </h3>
        
        {/* Rating and Reviews */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <ApperIcon
                  key={index}
                  name="Star"
                  size={12}
                  className={`${
                    index < Math.floor(product.averageRating)
                      ? "text-warning fill-warning"
                      : index < product.averageRating
                      ? "text-warning fill-warning opacity-50"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-secondary">
              ({product.reviewCount || 0} review{(product.reviewCount || 0) !== 1 ? 's' : ''})
            </span>
          </div>
        )}
        
        <p className="text-secondary text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
<div className="flex items-center justify-between">
          <div className="flex flex-col">
            {product.promotion && product.promotionalPrice ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-error">
                    ${product.promotionalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-secondary line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-success font-medium">
                  Save ${(product.originalPrice - product.promotionalPrice).toFixed(2)}
                </div>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            size="sm"
            className="min-w-[100px]"
          >
            <ApperIcon name="Plus" size={14} className="mr-1" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard