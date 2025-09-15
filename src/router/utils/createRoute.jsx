import { Suspense } from "react";
import { requireAuth } from "../guard";

export const createRoute = ({
    path,
    index, // Add support for index routes
    element,
    title = "Apper",
    requiresAuth = false, // true = auth required, false = public access
    children, // Add support for nested children
    ...meta
}) => {
    const route = {
        ...(index ? { index: true } : { path }), // Use index if provided, otherwise use path
        element: element ? <Suspense fallback={<div>Loading.....</div>}>{element}</Suspense> : element,
        loader: requiresAuth ? requireAuth : undefined, // ✅ Fixed this line!
        handle: {
            title,
            requiresAuth,
            ...meta,
        },
    };

    // Add children if provided
    if (children && children.length > 0) {
        route.children = children;
    }

    return route;
};