import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useCart } from '@/hooks/useCart';
import { setCurrentStep } from '@/store/checkoutSlice';
import OrderSummary from '@/components/molecules/OrderSummary';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

const CheckoutLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, getSubtotal } = useCart();
  const { currentStep } = useSelector((state) => state.checkout);

  const steps = [
    { key: 'cart-review', label: 'Cart Review', path: '/checkout/cart-review' },
    { key: 'shipping', label: 'Shipping', path: '/checkout/shipping' }
  ];

  useEffect(() => {
    // Redirect to cart if no items
    if (cartItems.length === 0) {
navigate('/', { replace: true });
    return;
  }

  // Update current step based on URL
    const currentPath = location.pathname;
    const step = steps.find(s => currentPath.includes(s.key));
    if (step && step.key !== currentStep) {
      dispatch(setCurrentStep(step.key));
    }
  }, [location.pathname, cartItems.length, currentStep, dispatch, navigate]);

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.key === currentStep);
  };

  const isStepCompleted = (stepIndex) => {
    return stepIndex < getCurrentStepIndex();
  };

  const isStepCurrent = (stepIndex) => {
    return stepIndex === getCurrentStepIndex();
  };

  const handleStepClick = (step, index) => {
    // Allow navigation to previous steps only
    if (index <= getCurrentStepIndex()) {
      navigate(step.path);
    }
  };

  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="p-2"
>
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-primary">Checkout</h1>
          </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-surface border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center justify-center space-x-8">
              {steps.map((step, index) => (
                <li key={step.key} className="relative">
                  <button
                    onClick={() => handleStepClick(step, index)}
                    disabled={index > getCurrentStepIndex()}
                    className={cn(
                      "flex items-center space-x-3 text-sm font-medium transition-colors",
                      isStepCurrent(index)
                        ? "text-primary"
                        : isStepCompleted(index)
                        ? "text-success hover:text-success/80"
                        : "text-secondary cursor-not-allowed"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                        isStepCurrent(index)
                          ? "border-primary bg-primary text-surface"
                          : isStepCompleted(index)
                          ? "border-success bg-success text-surface"
                          : "border-gray-300 bg-surface text-secondary"
                      )}
                    >
                      {isStepCompleted(index) ? (
                        <ApperIcon name="Check" size={16} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="hidden sm:block">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-4 left-8 w-16 h-0.5 sm:w-24",
                        isStepCompleted(index) ? "bg-success" : "bg-gray-300"
                      )}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          {/* Main Content Area */}
          <div className="lg:col-span-7">
            <Outlet />
          </div>

          {/* Order Summary Sidebar */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <OrderSummary cartItems={cartItems} subtotal={getSubtotal()} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutLayout;