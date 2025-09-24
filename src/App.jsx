import { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from "react-toastify";
import { setUser, clearUser } from './store/userSlice';
import Layout from "@/components/organisms/Layout";
import WishlistPage from "@/components/pages/WishlistPage";
import OrdersPage from "@/components/pages/OrdersPage";
import Homepage from "@/components/pages/Homepage";
import ProductDetail from "@/components/pages/ProductDetail";
import CategoryPage from "@/components/pages/CategoryPage";
import SearchResults from "@/components/pages/SearchResults";
import Login from "@/components/pages/Login";
import Signup from "@/components/pages/Signup";
import Callback from "@/components/pages/Callback";
import ErrorPage from "@/components/pages/ErrorPage";
import CheckoutLayout from "@/components/pages/CheckoutLayout";
import CartReview from "@/components/pages/CartReview";
import DealsPage from "@/components/pages/DealsPage";
import ShippingInfo from "@/components/pages/ShippingInfo";
// Create auth context
export const AuthContext = createContext(null);

function AppContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  
  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                           currentPath.includes('/callback') || currentPath.includes('/error');
        
        if (user) {
          // User is authenticated
if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                ? `/login?redirect=${currentPath}`
                : '/login'
            );
          } else if (redirectPath) {
            if (
              !['error', 'signup', 'login', 'callback'].some((path) => currentPath.includes(path))
            ) {
              navigate(`/login?redirect=${redirectPath}`);
            } else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
      }
    });
  }, [navigate, dispatch]);
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
  
  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return (
      <div className="loading flex items-center justify-center p-6 h-screen w-full">
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path>
        </svg>
      </div>
    );
  }
  
  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen bg-background font-inter">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
<Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
<Route path="/" element={<Layout />}>
            <Route index element={<Homepage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/search" element={<SearchResults />} />
<Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>
          <Route path="/checkout" element={<CheckoutLayout />}>
            <Route path="cart-review" element={<CartReview />} />
            <Route path="shipping" element={<ShippingInfo />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            fontFamily: 'Inter, sans-serif'
          }}
        />
      </div>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;