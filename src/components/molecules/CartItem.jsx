import React from "react"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity } = item
  const lineTotal = product.price * quantity

  const handleQuantityChange = (newQuantity) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(product.Id, newQuantity)
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove(product.Id)
    }
  }

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <img
        src={product.image}
        alt={product.title}
        className="w-16 h-16 object-cover rounded-md"
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-primary text-sm line-clamp-2">
          {product.title}
        </h4>
        <p className="text-secondary text-xs">
          ${product.price.toFixed(2)} each
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleQuantityChange(quantity - 1)}
          className="h-8 w-8"
        >
          <ApperIcon name="Minus" size={12} />
        </Button>
        
        <span className="w-8 text-center text-sm font-medium">
          {quantity}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleQuantityChange(quantity + 1)}
          className="h-8 w-8"
        >
          <ApperIcon name="Plus" size={12} />
        </Button>
      </div>
      
      <div className="text-right">
        <p className="font-semibold text-primary text-sm">
          ${lineTotal.toFixed(2)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-error hover:text-error hover:bg-error/10 h-6 px-2"
        >
          <ApperIcon name="Trash2" size={12} />
        </Button>
      </div>
    </div>
  )
}

export default CartItem