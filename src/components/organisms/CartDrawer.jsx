import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import CartItem from "@/components/molecules/CartItem";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart,
  subtotal = 0 
}) => {
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const applyDiscountCode = async (code) => {
    if (!code.trim()) return;
    
    // Mock discount logic - replace with actual API call
    const mockDiscounts = {
      'SAVE10': { code: 'SAVE10', type: 'percentage', value: 10 },
      'WELCOME5': { code: 'WELCOME5', type: 'fixed', value: 5 },
      'FREESHIP': { code: 'FREESHIP', type: 'shipping', value: 0 }
    };
    
    const discount = mockDiscounts[code.toUpperCase()];
    if (discount) {
      let amount = 0;
      if (discount.type === 'percentage') {
        amount = subtotal * (discount.value / 100);
      } else if (discount.type === 'fixed') {
        amount = Math.min(discount.value, subtotal);
      }
      
      setAppliedDiscount({
        code: discount.code,
        type: discount.type,
        value: discount.value,
        amount: amount
      });
      setDiscountCode('');
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
  };

  const getFinalTotal = () => {
    if (!appliedDiscount) return subtotal;
    return Math.max(0, subtotal - appliedDiscount.amount);
  };

  const handleCheckout = () => {
    onClose(); // Close the cart drawer
    window.location.href = '/checkout/cart-review';
  };
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
{/* Discount Code Input */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Enter discount code"
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => applyDiscountCode(discountCode)}
                        disabled={!discountCode.trim()}
                        className="px-3"
                      >
                        Apply
                      </Button>
                    </div>
                    {appliedDiscount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-success">
                          Code "{appliedDiscount.code}" applied
                        </span>
                        <button
                          onClick={removeDiscount}
                          className="text-error hover:text-error/80"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">Subtotal:</span>
                    <span className="text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-success">Discount:</span>
                      <span className="text-success">-${appliedDiscount.amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-primary">Total:</span>
                    <span className="text-lg text-primary">
                      ${getFinalTotal().toFixed(2)}
                    </span>
                  </div>
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