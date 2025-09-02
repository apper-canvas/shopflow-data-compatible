import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useCart } from '@/hooks/useCart';
import {
  updateShippingInfo,
  setValidationErrors,
  setLoading,
  setError,
  clearValidation
} from '@/store/checkoutSlice';
import { shippingService } from '@/services/api/shippingService';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import { toast } from 'react-toastify';

const ShippingInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useCart();
  const {
    sessionId,
    shippingInfo,
    validation,
    loading,
    error
  } = useSelector((state) => state.checkout);

  const [formData, setFormData] = useState(shippingInfo);

  useEffect(() => {
    // Redirect if no cart items or session
    if (cartItems.length === 0) {
      navigate('/', { replace: true });
      return;
    }

    if (!sessionId) {
      navigate('/checkout/cart-review', { replace: true });
      return;
    }

    // Clear any existing validation errors
    dispatch(clearValidation());
  }, [cartItems.length, sessionId, dispatch, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field-specific error when user starts typing
    if (validation.errors[field]) {
      const newErrors = { ...validation.errors };
      delete newErrors[field];
      dispatch(setValidationErrors(newErrors));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required field validation
    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.addressLine1?.trim()) {
      errors.addressLine1 = 'Address is required';
    }

    if (!formData.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state?.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.zipCode?.trim()) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode.trim())) {
      errors.zipCode = 'Please enter a valid ZIP code';
    }

    if (!formData.country?.trim()) {
      errors.country = 'Country is required';
    }

// Phone number validation (if provided)
if (formData.phoneNumber && !/^[\d\s\-()+ ]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    dispatch(setValidationErrors(errors));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the errors below');
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const shippingData = {
        ...formData,
        checkoutSessionId: sessionId
      };

      const savedShipping = await shippingService.create(shippingData);
      
      if (savedShipping) {
        dispatch(updateShippingInfo(formData));
        toast.success('Shipping information saved successfully');
        // Navigate to next step when implemented
        // For now, show success message
        toast.info('Checkout Phase 1 complete! Payment step coming in Phase 2.');
      } else {
        dispatch(setError('Failed to save shipping information'));
      }
    } catch (err) {
      dispatch(setError('Error saving shipping information'));
      console.error('Error saving shipping information:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleBackToCart = () => {
    navigate('/checkout/cart-review');
  };

  if (loading && !formData.firstName) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary">Shipping Information</h2>
        <p className="text-secondary mt-1">
          Please provide your shipping address details.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <ApperIcon name="AlertCircle" size={20} className="text-error" />
            <p className="text-error font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Shipping Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
                First Name *
              </label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={validation.errors.firstName ? 'border-error' : ''}
                placeholder="Enter your first name"
              />
              {validation.errors.firstName && (
                <p className="text-error text-sm mt-1">{validation.errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
                Last Name *
              </label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={validation.errors.lastName ? 'border-error' : ''}
                placeholder="Enter your last name"
              />
              {validation.errors.lastName && (
                <p className="text-error text-sm mt-1">{validation.errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Address Fields */}
          <div>
            <label htmlFor="addressLine1" className="block text-sm font-medium text-primary mb-2">
              Address Line 1 *
            </label>
            <Input
              id="addressLine1"
              type="text"
              value={formData.addressLine1}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              className={validation.errors.addressLine1 ? 'border-error' : ''}
              placeholder="Street address, P.O. box, company name, c/o"
            />
            {validation.errors.addressLine1 && (
              <p className="text-error text-sm mt-1">{validation.errors.addressLine1}</p>
            )}
          </div>

          <div>
            <label htmlFor="addressLine2" className="block text-sm font-medium text-primary mb-2">
              Address Line 2
            </label>
            <Input
              id="addressLine2"
              type="text"
              value={formData.addressLine2}
              onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              placeholder="Apartment, suite, unit, building, floor, etc."
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-primary mb-2">
                City *
              </label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={validation.errors.city ? 'border-error' : ''}
                placeholder="City"
              />
              {validation.errors.city && (
                <p className="text-error text-sm mt-1">{validation.errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-primary mb-2">
                State *
              </label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={validation.errors.state ? 'border-error' : ''}
                placeholder="State"
              />
              {validation.errors.state && (
                <p className="text-error text-sm mt-1">{validation.errors.state}</p>
              )}
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-primary mb-2">
                ZIP Code *
              </label>
              <Input
                id="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className={validation.errors.zipCode ? 'border-error' : ''}
                placeholder="12345"
              />
              {validation.errors.zipCode && (
                <p className="text-error text-sm mt-1">{validation.errors.zipCode}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-primary mb-2">
              Country *
            </label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-200 bg-surface px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
            </select>
            {validation.errors.country && (
              <p className="text-error text-sm mt-1">{validation.errors.country}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-primary mb-2">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={validation.errors.phoneNumber ? 'border-error' : ''}
              placeholder="+1 (555) 123-4567"
            />
            {validation.errors.phoneNumber && (
              <p className="text-error text-sm mt-1">{validation.errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackToCart}
            className="flex-1 sm:flex-none"
          >
            <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
            Back to Cart
          </Button>
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="flex-1"
          >
            {loading ? (
              <>
                <div className="animate-spin mr-2">
                  <ApperIcon name="Loader" size={16} />
                </div>
                Saving...
              </>
            ) : (
              <>
                Save Shipping Info
                <ApperIcon name="Check" size={16} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShippingInfo;