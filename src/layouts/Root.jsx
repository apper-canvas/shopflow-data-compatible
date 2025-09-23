import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import AuthProvider from "@/context/Auth";
import { getRouteConfig } from "@/router/routes.config";
import { checkAccess } from "@/router/guards";

export default function Root() {
  const { isInitialized, user } = useSelector(state => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle auth-based redirects once auth is initialized
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

  return (
    <AuthProvider>
      <div style={{background: 'yellow', padding: '4px', fontSize: '12px'}}>
        Auth: {isInitialized ? 'Ready' : 'Loading'} | User: {user ? 'Logged In' : 'Guest'}
      </div>
      {isInitialized ? (
        <Outlet />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">Initializing Authentication</h3>
            <p className="text-gray-600 text-sm">Please wait while we check your login status</p>
          </div>
        </div>
      )}
    </AuthProvider>
  );
}


