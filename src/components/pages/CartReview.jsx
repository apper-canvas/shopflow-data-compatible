import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-toastify";
import checkoutService from "@/services/api/checkoutService";
import ApperIcon from "@/components/ApperIcon";
import CartItem from "@/components/molecules/CartItem";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import { setError, setLoading, setSessionId } from "@/store/checkoutSlice";

const CartReview = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
const { cartItems, updateQuantity, removeFromCart, getSubtotal, isCartLoading } = useCart();
  const { sessionId, loading, error, appliedDiscount } = useSelector((state) => state.checkout);
  const { user } = useSelector((state) => state.user);

  // Calculate total savings from promotional prices
  const getTotalSavings = () => {
    return cartItems.reduce((total, item) => {
      const originalPrice = item.product.OriginalPrice || item.product.Price;
      const currentPrice = item.product.Price;
      if (originalPrice > currentPrice) {
        return total + ((originalPrice - currentPrice) * item.quantity);
      }
      return total;
    }, 0);
  };

  // Calculate final total with discounts
  const getFinalTotal = () => {
    let total = getSubtotal();
    total -= getTotalSavings();
    if (appliedDiscount) {
      total -= appliedDiscount.amount;
    }
    return Math.max(0, total);
  };

  useEffect(() => {
    // Wait for cart to load before checking if it's empty
    if (isCartLoading) return;

    // Redirect to home if cart is empty
    if (cartItems.length === 0) {
      navigate('/', { replace: true });
      return;
    }

    // Create checkout session if not exists
    if (!sessionId && user && cartItems.length > 0) {
      createCheckoutSession();
    }
  }, [cartItems.length, sessionId, user, isCartLoading]);

  const createCheckoutSession = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const sessionData = {
        userId: user?.userId || null,
        cartData: cartItems,
        subtotal: getSubtotal(),
        status: 'cart_review'
      };

      const session = await checkoutService.createSession(sessionData);
      
      if (session) {
        dispatch(setSessionId(session.Id));
      } else {
        dispatch(setError('Failed to create checkout session'));
      }
    } catch (err) {
      dispatch(setError('Error creating checkout session'));
      console.error('Error creating checkout session:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleContinueToShipping = () => {
    if (isCartLoading) {
      toast.info('Please wait, cart is loading...');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout/shipping');
  };

  // Show loading while cart is loading
  if (isCartLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
        <p className="ml-3 text-secondary">Loading cart...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-primary mb-2">Checkout Error</h3>
        <p className="text-secondary mb-4">{error}</p>
        <Button onClick={createCheckoutSession}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary">Review Your Order</h2>
        <p className="text-secondary mt-1">
          Please review your items before proceeding to shipping information.
        </p>
      </div>

      {/* Cart Items */}
      <div className="bg-surface rounded-lg border border-gray-200 divide-y divide-gray-200">
        {cartItems.map((item) => (
          <div key={item.product.Id} className="p-6">
            <CartItem
              item={item}
              onUpdateQuantity={(quantity) => updateQuantity(item.product.Id, quantity)}
              onRemove={() => removeFromCart(item.product.Id)}
              showRemoveButton={true}
            />
          </div>
        ))}
</div>

      {/* Cart Summary */}
      <div className="bg-surface rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Items ({cartItems.reduce((total, item) => total + item.quantity, 0)})</span>
            <span className="text-primary">${getSubtotal().toFixed(2)}</span>
          </div>
          
          {/* Promotional Savings */}
          {getTotalSavings() > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-success">Promotional Savings:</span>
              <span className="text-success">-${getTotalSavings().toFixed(2)}</span>
            </div>
          )}
          
          {/* Applied Discount */}
          {appliedDiscount && (
            <div className="flex justify-between text-sm">
              <span className="text-success">Discount ({appliedDiscount.code}):</span>
              <span className="text-success">-${appliedDiscount.amount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between font-semibold text-lg">
              <span className="text-primary">Total</span>
              <span className="text-primary">${getFinalTotal().toFixed(2)}</span>
            </div>
            <p className="text-sm text-secondary mt-1">
              Shipping and taxes calculated at next step
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex-1 sm:flex-none"
        >
          <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
          Continue Shopping
        </Button>
        <Button
          onClick={handleContinueToShipping}
          disabled={isCartLoading || cartItems.length === 0}
          size="lg"
          className="flex-1"
        >
          Continue to Shipping
          <ApperIcon name="ArrowRight" size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default CartReview;