import { redirect } from "react-router-dom";
import { store } from "@/store/store";

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