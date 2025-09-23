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
    console.log('🔧 Auth initialization starting...', { hasApperSDK: !!window.ApperSDK });
    
    // Check if ApperSDK is loaded
    if (!window.ApperSDK) {
      console.log('❌ ApperSDK not available - setting unauthenticated state');
      dispatch(clearUser()); // Ensure user is null
      setIsInitialized(true); // Local state
      dispatch(setInitialized(true)); // Redux state for guards
      console.log('🔧 Auth state updated: isInitialized=true, user=null');
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
        console.log('✅ ApperUI onSuccess called with user:', user);
        setIsInitialized(true); // Local state
        dispatch(setInitialized(true)); // Redux state for guards
        
        // Get redirect parameter from URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get("redirect");
        
        // Store user information in Redux FIRST
        if (user) {
          console.log('💾 Storing user in Redux:', user);
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
          console.log('🔧 Auth state updated: isInitialized=true, user=SET');
          
           // Navigate based on redirect parameter
           if (redirectPath) {
             navigate(redirectPath);
           } else {
            // If no redirect, go to home (only from auth pages)
            const isOnAuthPage = ["/login", "/signup", "/callback"].some(page => 
              window.location.pathname.includes(page)
            );
            if (isOnAuthPage) {
              navigate("/");
            }
          }
        } else {
          console.log('❌ No user provided, clearing user state');
          dispatch(clearUser());
          console.log('🔧 Auth state updated: isInitialized=true, user=null');
          // Auth context should NOT handle redirects - let route guards handle it
        }
      },
      onError: function (error) {
        console.error('❌ ApperUI onError:', error);
        dispatch(clearUser());
        setIsInitialized(true); // Still set initialized even on error
        dispatch(setInitialized(true));
        console.log('🔧 Auth state updated (error): isInitialized=true, user=null');
        // Auth context should NOT handle redirects - let route guards handle it
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

  if (!isInitialized) {
    console.log('⏳ Auth not initialized yet, showing loading...');
    return (
      <div className="loading flex items-center justify-center p-6 h-screen w-full">
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path>
        </svg>
      </div>
    );
  }

  console.log('✅ Auth initialized, rendering app...');
  return (
    <AuthContext.Provider value={authMethods}>    
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;