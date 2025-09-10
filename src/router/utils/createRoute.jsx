import { Suspense } from "react";
import { requireAuth, requireGuest } from "../guard";

export const createRoute = ({
    path,
    element,
    title = "Apper",
    requiresAuth = false,
    requiresGuest = false,
    ...meta
}) => ({
    path,
    element: <Suspense fallback={<div>Loading.....</div>}>{element}</Suspense>,
    loader: requiresAuth ? requireAuth : requiresGuest ? requireGuest : undefined,
    handle: {
        title,
        requiresAuth,
        requiresGuest,
        ...meta,
    },
});