import { redirect } from "react-router-dom";
import { store } from "@/store/store";
import routeConfig from "./routes.json";

// ==========================================
// ROUTE CONFIGURATION MATCHING
// ==========================================

// Get route configuration with pattern matching
export const getRouteConfig = (path) => {
    // Normalize the path
    if (!path || path === "index") path = "/";
    if (!path.startsWith("/")) path = "/" + path;

    // First check for direct match
    if (routeConfig[path]) {
        return routeConfig[path];
    }

    // If no direct match, check patterns
    const matches = Object.keys(routeConfig)
        .filter(pattern => matchesPattern(path, pattern))
        .map(pattern => ({
            pattern,
            config: routeConfig[pattern],
            specificity: getSpecificity(pattern)
        }))
        .sort((a, b) => b.specificity - a.specificity);

    return matches[0]?.config || { access: "authenticated" };
};

// Pattern matching logic
function matchesPattern(path, pattern) {
    if (path === pattern) return true;

    // Handle parameter routes (like /product/:id)
    if (pattern.includes(":")) {
        const regex = new RegExp("^" + pattern.replace(/:[^/]+/g, "[^/]+") + "$");
        return regex.test(path);
    }

    // Handle wildcard patterns
    if (pattern.includes("*")) {
        if (pattern.endsWith("/**/*")) {
            // Deep wildcard: /admin/**/* matches /admin/users/edit, /admin/settings/billing, etc.
            const base = pattern.replace("/**/*", "");
            return path.startsWith(base + "/");
        } else if (pattern.endsWith("/*")) {
            // Single level wildcard: /admin/* matches /admin/users but NOT /admin/users/edit
            const base = pattern.replace("/*", "");
            const remainder = path.replace(base, "");
            return remainder.startsWith("/") && !remainder.substring(1).includes("/");
        }
    }

    return false;
}

// Calculate pattern specificity for sorting (higher = more specific)
function getSpecificity(pattern) {
    let score = 0;

    // Exact paths get highest priority
    if (!pattern.includes("*") && !pattern.includes(":")) {
        score += 1000;
    }

    // Parameter routes get medium priority
    if (pattern.includes(":")) {
        score += 500;
    }

    // Single wildcards get lower priority than parameters
    if (pattern.includes("/*") && !pattern.includes("/**/*")) {
        score += 300;
    }

    // Deep wildcards get lowest priority
    if (pattern.includes("/**/*")) {
        score += 100;
    }

    // Longer patterns are more specific
    score += pattern.length;

    return score;
}

// ==========================================
// ACCESS GUARDS
// ==========================================

export const createAccessGuard = () => {
    return ({ request }) => {
        const state = store.getState();
        const { isInitialized } = state.user;

        const url = new URL(request.url);
        const fullRedirectPath = url.pathname + url.search; // Include query params

        // If auth isn't initialized yet, redirect to login with actualPath
        // ApperSDK will handle redirecting back after auth completes
        if (!isInitialized) {
            throw redirect(`/login?redirect=${encodeURIComponent(fullRedirectPath)}`);
        }

        return null;
    };
};

export function checkAccess(accessType, user) {
    switch (accessType) {
        case "public":
            return { allowed: true };

        case "authenticated":
            return {
                allowed: !!user,
                redirectTo: user ? null : "/login"
            };

        case "role:admin":
            const role = accessType.split(":")[1];
            const userRoles = user?.roles || [];
            const hasRole = userRoles.includes(role);
            return {
                allowed: !!user && hasRole,
                redirectTo: user ? "/error?message=insufficient_permissions" : "/login"
            };
        default:
            // Default to requiring authentication for unknown types
            return { allowed: !!user, redirectTo: "/login" };
    }
}

