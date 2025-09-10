import { Outlet, useLocation } from "react-router-dom";
import AuthProvider from "@/context/Auth";

export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
