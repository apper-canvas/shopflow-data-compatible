import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Button from "@/components/atoms/Button"
import CartItem from "@/components/molecules/CartItem"
import ApperIcon from "@/components/ApperIcon"
import Empty from "@/components/ui/Empty"

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart,
  subtotal = 0 
}) => {
const handleCheckout = () => {
    onClose() // Close the cart drawer
    window.location.href = '/checkout/cart-review'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-drawer z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-primary">
                Shopping Cart
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-secondary hover:text-primary"
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <Empty
                    title="Your cart is empty"
                    description="Add some products to get started!"
                    icon="ShoppingCart"
                  />
                </div>
              ) : (
                <div className="p-4">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.product.Id}
                      item={item}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemove={onRemoveItem}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Subtotal:</span>
                  <span className="text-lg font-bold text-primary">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                  >
                    <ApperIcon name="CreditCard" size={16} className="mr-2" />
                    Checkout
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={onClearCart}
                    className="w-full text-error hover:text-error hover:bg-error/10"
                  >
                    <ApperIcon name="Trash2" size={16} className="mr-2" />
                    Clear Cart
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer