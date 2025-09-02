import React from "react"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const HeartButton = ({ 
  isInWishlist = false, 
  onClick, 
  size = 20, 
  className = "",
  variant = "ghost",
  showCount = false,
  count = 0
}) => {
  return (
    <Button
      variant={variant}
      size="icon"
      onClick={onClick}
      className={cn(
        "hover:bg-gray-100 transition-all duration-200",
        isInWishlist && "text-red-500 hover:text-red-600",
        className
      )}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <ApperIcon 
        name="Heart" 
        size={size} 
        className={cn(
          "transition-all duration-200",
          isInWishlist ? "fill-current" : "stroke-current"
        )}
      />
      {showCount && count > 0 && (
        <span className="ml-1 text-xs font-medium">
          {count}
        </span>
      )}
    </Button>
  )
}

export default HeartButton