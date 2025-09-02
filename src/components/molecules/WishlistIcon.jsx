import React from "react"
import { Link } from "react-router-dom"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"

const WishlistIcon = ({ itemCount = 0 }) => {
  return (
    <Link to="/wishlist">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-gray-100"
      >
        <ApperIcon name="Heart" size={20} className="text-primary" />
        {itemCount > 0 && (
          <Badge 
            variant="default"
            className="absolute -top-2 -right-2 h-5 w-5 text-xs animate-bounce-gentle"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}

export default WishlistIcon