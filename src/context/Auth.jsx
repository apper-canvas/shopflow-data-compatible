import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/store/userSlice";

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
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get(
          "redirect"
        );
        const isAuthPage =
          currentPath.includes("/login") ||
          currentPath.includes("/signup") ||
          currentPath.includes("/callback") ||
          currentPath.includes("/error");

        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (
              !currentPath.includes("/login") &&
              !currentPath.includes("/signup")
            ) {
              navigate(currentPath);
            } else {
              navigate("/");
            }
          } else {
            navigate("/");
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes("/signup")
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes("/login")
                ? `/login?redirect=${currentPath}`
                : "/login"
            );
          } else if (redirectPath) {
            if (
              !["error", "signup", "login", "callback"].some((path) =>
                currentPath.includes(path)
              )
            ) {
              navigate(`/login?redirect=${redirectPath}`);
            } else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate("/login");
          }
          dispatch(clearUser());
        }
      },
      onError: function (error) {
        console.error("Authentication failed:", error);
      },
    });
  }, [navigate, dispatch]);

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
    <AuthContext.Provider value={authMethods}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
