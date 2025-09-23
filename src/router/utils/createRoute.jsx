import { Suspense } from "react";
import { getRouteConfig } from "@/config/routes.config";

export const createRoute = ({
    path,
    index,
    element,
    title = "Apper",
    access, // Access type override (public, authenticated, role:admin, etc.)
    children,
    ...meta
}) => {
    // Get config for this route - ensure consistent path format
    let configPath;
    if (index) {
        configPath = "/";
    } else {
        // Ensure path starts with "/" for config lookup
        configPath = path.startsWith('/') ? path : `/${path}`;
    }
    
    const config = getRouteConfig(configPath);
    const finalAccess = access || config.access;
    const finalTitle = title !== "Apper" ? title : config.title || title;
    
    // No guards needed - all auth logic handled in Root.jsx
    const route = {
        ...(index ? { index: true } : { path }),
        element: element ? <Suspense fallback={<div>Loading.....</div>}>{element}</Suspense> : element,
        handle: {
            title: finalTitle,
            access: finalAccess,
            ...meta,
        },
    };

    // Add children if provided
    if (children && children.length > 0) {
        route.children = children;
    }

    return route;
};