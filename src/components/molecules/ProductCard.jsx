import React from "react"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const ProductCard = ({ product, onAddToCart, className }) => {
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
{!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="bg-surface text-primary px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
<h3 className="font-semibold text-primary mb-2 line-clamp-2">
          {product.title}
        </h3>
        
<p className="text-secondary text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
<span className="text-lg font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          
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