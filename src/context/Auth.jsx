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

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    // Check if ApperSDK is loaded
    if (!window.ApperSDK) {
      console.error("❌ ApperSDK not loaded - check your environment configuration");
      setIsInitialized(true); // Local state
      dispatch(setInitialized(true)); // Redux state for guards
      return;
    }

    const { ApperClient, ApperUI } = window.ApperSDK;

    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
    });

    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: "#authentication",
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: "both",
      onSuccess: function (user) {
        console.log("🔧 Auth onSuccess called:", { user: !!user, currentURL: window.location.href });
        
        setIsInitialized(true); // Local state
        dispatch(setInitialized(true)); // Redux state for guards
        
        // Get redirect parameter from URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get("redirect");
        
        console.log("🔧 Redirect analysis:", { redirectPath, currentPath: window.location.pathname });
        
        // Store user information in Redux FIRST
        if (user) {
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
          console.log("🔧 User stored in Redux, navigating...");
          
          // Navigate based on redirect parameter
          if (redirectPath) {
            console.log("🔧 Navigating to redirect path:", redirectPath);
            navigate(redirectPath);
          } else {
            // If no redirect, go to home (only from auth pages)
            const isOnAuthPage = ["/login", "/signup", "/callback"].some(page => 
              window.location.pathname.includes(page)
            );
            if (isOnAuthPage) {
              console.log("🔧 On auth page, navigating to home");
              navigate("/");
            } else {
              console.log("🔧 Already on correct page, staying put");
            }
          }
        } else {
          dispatch(clearUser());
          console.log("🔧 No user, redirecting to login");
          // Only redirect if not already on an auth page
          if (!window.location.pathname.includes("/login")) {
            const currentPath = window.location.pathname + window.location.search;
            navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
          }
        }
      },
      onError: function (error) {
        console.error("Authentication failed:", error);
        setIsInitialized(true); // Local state
        dispatch(setInitialized(true)); // Redux state for guards
      },
    });
  }, []); // Remove dependencies to prevent multiple runs

  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    },
  };

  return (
    <AuthContext.Provider value={authMethods}>    
      {isInitialized ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
