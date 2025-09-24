import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, clearUser, setInitialized } from "@/store/userSlice";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Local state for Auth component's own loading spinner
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    if (!window.ApperSDK) {
      dispatch(clearUser()); // Ensure user is null
      handleAuthComplete();
      return;
    }

    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
    });

    ApperUI.setup(client, {
      target: "#authentication",
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: "both",
      onSuccess: handleAuthSuccess,
      onError: handleAuthError,
    });
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
    setIsInitialized(true); // Local state for Auth component loading
    dispatch(setInitialized(true)); // Redux state for Root component route guards
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

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={{ logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
      {/* <h3 className="text-lg font-semibold text-gray-800">Initializing Authentication</h3>
      <p className="text-gray-600 text-sm">Please wait while we check your login status</p> */}
    </div>
  </div>
);

export default AuthProvider;