import { lazy } from "react";
import { createRoute } from "../utils/createRoute";

const Error = lazy(() => import("@/components/pages/ErrorPage"));

export const publicRoutes = [
    createRoute({
        path: "error",
        element: <Error />,
        title: "Error",
    }),
];