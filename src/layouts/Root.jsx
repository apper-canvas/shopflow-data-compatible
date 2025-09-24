import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, createContext, useContext } from "react";
import { setUser, clearUser, setInitialized } from "@/store/userSlice";
import { getRouteConfig } from "@/router/routes.config";
import { checkAccess } from "@/router/guards";
import { getApperClient } from "@/utils/apperClient";

// Auth context for logout functionality
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within Root component");
  }
  return context;
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </div>
  </div>
);

export default function Root() {
  const { isInitialized, user } = useSelector(state => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local state for initial auth loading
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize authentication
  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle route guards after auth is ready
  useEffect(() => {
    if (isInitialized) {
      console.log(`🏠 Root: Auth ready, checking access for: ${location.pathname}`);
      
      // Get route config for current path
      const config = getRouteConfig(location.pathname);
      console.log(`📋 Root: Route config for "${location.pathname}":`, config);
      
      // Check if user has access
      const { allowed, redirectTo } = checkAccess(config.access, user);
      console.log(`🔍 Root: Access check result:`, { 
        path: location.pathname, 
        access: config.access, 
        allowed, 
        hasUser: !!user 
      });

      if (!allowed && redirectTo) {
        const redirectPath = location.pathname + location.search;
        console.log(`🔒 Root: Redirecting from ${location.pathname} to ${redirectTo}`);
        navigate(`${redirectTo}?redirect=${encodeURIComponent(redirectPath)}`, { replace: true });
      }
    }
  }, [isInitialized, user, location.pathname, location.search, navigate]);

  const initializeAuth = async () => {
    try {
      // Wait for SDK to load and get client
      const apperClient = await getApperClient();
      
      if (!apperClient || !window.ApperSDK) {
        console.error('Failed to initialize ApperSDK or ApperClient');
        dispatch(clearUser());
        handleAuthComplete();
        return;
      }

      const { ApperUI } = window.ApperSDK;

      ApperUI.setup(apperClient, {
        target: "#authentication",
        clientId: import.meta.env.VITE_APPER_PROJECT_ID,
        view: "both",
        onSuccess: handleAuthSuccess,
        onError: handleAuthError,
      });

      console.log('✅ Authentication initialized successfully');
    } catch (error) {
      console.error('Failed to initialize authentication:', error);
      dispatch(clearUser());
      handleAuthComplete();
    }
  };

  const handleAuthSuccess = (user) => {
    if (user) {
      // Add admin role to user
      const userWithRole = { ...user, roles: ["admin"] };
      dispatch(setUser(userWithRole));
      handleNavigation();
    } else {
      dispatch(clearUser());
    }
    handleAuthComplete();
  };

  const handleAuthError = (error) => {
    console.error("Auth error:", error);
    dispatch(clearUser());
    handleAuthComplete();
  };

  const handleAuthComplete = () => {
    setAuthInitialized(true); // Local loading state
    dispatch(setInitialized(true)); // Redux state for route guards
  };

  const handleNavigation = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get("redirect");
    
    if (redirectPath) {
      navigate(redirectPath);
    } else {
      // Navigate to home only if on auth pages
      const authPages = ["/login", "/signup", "/callback"];
      const isOnAuthPage = authPages.some(page => 
        window.location.pathname.includes(page)
      );
      if (isOnAuthPage) {
        navigate("/");
      }
    }
  };

  const logout = async () => {
    try {
      await window.ApperSDK?.ApperUI?.logout();
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Show loading spinner until auth is initialized
  if (!authInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={{ logout, isInitialized: authInitialized }}>
      <div style={{background: 'yellow', padding: '4px', fontSize: '12px'}}>
        Auth: {isInitialized ? 'Ready' : 'Loading'} | User: {user ? 'Logged In' : 'Guest'}
      </div>
      <Outlet />
    </AuthContext.Provider>
  );
}