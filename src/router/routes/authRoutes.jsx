import { lazy } from "react";
import { createRoute } from "../utils/createRoute";

const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));

export const authRoutes = [
    createRoute({
        path: "login",
        element: <Login />,
        title: "Login",
        requiresGuest: true,
    }),
    createRoute({
        path: "signup",
        element: <Signup />,
        title: "Signup",
        requiresGuest: true,
    }),
    createRoute({
        path: "callback",
        element: <Callback />,
        title: "Authentication Callback",
    }),
];