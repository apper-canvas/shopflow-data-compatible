import { lazy } from "react";
import { createRoute } from "../utils/createRoute";

const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const Error = lazy(() => import("@/components/pages/ErrorPage"));

export const authRoutes = [
    createRoute({
        path: "login",
        element: <Login />,
        title: "Login",
        requiresAuth: false, // Changed from requiresGuest: true
    }),
    createRoute({
        path: "signup",
        element: <Signup />,
        title: "Signup",
        requiresAuth: false, // Changed from requiresGuest: true
    }),
    createRoute({
        path: "callback",
        element: <Callback />,
        title: "Authentication Callback",
        requiresAuth: false, // Already had no requiresGuest, but explicitly setting for clarity
    }),
    createRoute({
        path: "error",
        element: <Error />,
        title: "Error",
        requiresAuth: false,
    }),
];