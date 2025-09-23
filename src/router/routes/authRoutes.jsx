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
        // Will use config: access: "public", title: "Login"
    }),
    createRoute({
        path: "signup",
        element: <Signup />,
        // Will use config: access: "public", title: "Signup"
    }),
    createRoute({
        path: "callback",
        element: <Callback />,
        // Will use config: access: "public", title: "Authentication Callback"
    }),
    createRoute({
        path: "error",
        element: <Error />,
        // Will use config: access: "public", title: "Error"
    }),
];