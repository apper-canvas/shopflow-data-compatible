import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const OrderSummary = ({ cartItems = [], subtotal = 0, className }) => {
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className={cn("bg-surface rounded-lg border border-gray-200 p-6 sticky top-6", className)}>
      <h3 className="text-lg font-semibold text-primary mb-4">Order Summary</h3>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.product.Id} className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={item.product.image}
                alt={item.product.title}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-200 flex items-center justify-center hidden">
                <ApperIcon name="Package" size={20} className="text-gray-400" />
              </div>
              {item.quantity > 1 && (
                <span className="absolute -top-2 -right-2 bg-primary text-surface text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                  {item.quantity}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-primary truncate">
                {item.product.title}
              </h4>
              <p className="text-sm text-secondary">
                ${item.product.price.toFixed(2)} {item.quantity > 1 && `× ${item.quantity}`}
              </p>
            </div>
            <div className="text-sm font-medium text-primary">
              ${(item.product.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {cartItems.length === 0 && (
        <div className="text-center py-8">
          <ApperIcon name="ShoppingCart" size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-secondary text-sm">No items in cart</p>
        </div>
      )}

      {/* Order Totals */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            <span className="text-primary font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-secondary">Shipping</span>
            <span className="text-secondary">Calculated at next step</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-secondary">Tax</span>
            <span className="text-secondary">Calculated at next step</span>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-primary">Total</span>
              <span className="text-base font-bold text-primary">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-secondary mt-1">
              *Final total will include shipping and tax
            </p>
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-secondary">
          <ApperIcon name="Lock" size={16} className="text-success" />
          <span>Secure checkout powered by SSL</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;