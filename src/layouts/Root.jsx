import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthProvider from "@/context/Auth";

export default function Root() {
  const { isInitialized, user, isAuthenticated } = useSelector(state => state.user);
  
  console.log('🏠 Root render:', { isInitialized, hasUser: !!user, isAuthenticated });

  return (
    <AuthProvider>
      <div style={{background: 'yellow', padding: '4px', fontSize: '12px'}}>
        isInitialized: {String(isInitialized)}, hasUser: {String(!!user)}, isAuthenticated: {String(isAuthenticated)}
      </div>
      {isInitialized ? (
        <Outlet />
      ) : (
        <div className="loading flex items-center justify-center p-6 h-screen w-full">
          <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path>
          </svg>
        </div>
      )}
    </AuthProvider>
  );
}
