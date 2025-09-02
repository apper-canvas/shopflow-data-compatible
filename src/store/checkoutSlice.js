import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStep: 'cart-review',
  sessionId: null,
  shippingInfo: {
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phoneNumber: ''
  },
  validation: {
    errors: {},
    isValid: false
  },
  loading: false,
  error: null
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    updateShippingInfo: (state, action) => {
      state.shippingInfo = {
        ...state.shippingInfo,
        ...action.payload
      };
    },
    setShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
    },
    setValidationErrors: (state, action) => {
      state.validation.errors = action.payload;
      state.validation.isValid = Object.keys(action.payload).length === 0;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearValidation: (state) => {
      state.validation = {
        errors: {},
        isValid: false
      };
    },
    resetCheckout: (state) => {
      return initialState;
    }
  }
});

export const {
  setCurrentStep,
  setSessionId,
  updateShippingInfo,
  setShippingInfo,
  setValidationErrors,
  setLoading,
  setError,
  clearValidation,
  resetCheckout
} = checkoutSlice.actions;

export default checkoutSlice.reducer;