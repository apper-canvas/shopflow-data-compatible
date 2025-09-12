import { Suspense } from "react";
import { requireAuth, requireGuest } from "../guard";

export const createRoute = ({
    path,
    index, // Add support for index routes
    element,
    title = "Apper",
    requiresAuth = false,
    requiresGuest = false,
    ...meta
}) => ({
    ...(index ? { index: true } : { path }), // Use index if provided, otherwise use path
    element: <Suspense fallback={<div>Loading.....</div>}>{element}</Suspense>,
    loader: requiresAuth ? requireAuth : requiresGuest ? requireGuest : undefined,
    handle: {
        title,
        requiresAuth,
        requiresGuest,
        ...meta,
    },
});