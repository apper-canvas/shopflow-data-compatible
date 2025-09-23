import { redirect } from "react-router-dom";
import { store } from "@/store/store";
import { getRouteConfig } from "@/router/routes.config";

// Super Simple Guards - No Complex Polling Logic!
export const createAccessGuard = (configPath) => {
    return ({ request }) => {
        const state = store.getState();
        const { user, isInitialized } = state.user;
        const url = new URL(request.url);
        const actualPath = url.pathname;
        const fullRedirectPath = url.pathname + url.search; // Include query params

        console.log(`🛡️ Guard executing for: ${actualPath} (config: ${configPath})`);
        console.log(`🔍 Auth state: initialized=${isInitialized}, hasUser=${!!user}`);

        // If auth isn't initialized yet, redirect to login with actualPath
        // ApperSDK will handle redirecting back after auth completes
        if (!isInitialized) {
            console.log(`⏳ Auth not ready yet, redirecting to login: ${actualPath}`);
            console.log(`🗺️ Will redirect back to: ${fullRedirectPath}`);
            throw redirect(`/login?redirect=${encodeURIComponent(fullRedirectPath)}`);
        }

        // Auth is ready - get route config and check access
        const config = getRouteConfig(configPath);
        console.log(`📋 Route config for "${configPath}":`, config);

        /*const { allowed, redirectTo } = checkAccess(config.access, user);
        console.log(`🔍 Access check result:`, {
            actualPath,
            configPath,
            accessType: config.access,
            allowed,
            redirectTo,
            hasUser: !!user
        });

        if (!allowed && redirectTo) {
            console.log(`🔒 Access DENIED: ${actualPath} -> ${redirectTo}`);
            console.log(`🗺️ Reason: ${config.access} required, user: ${user ? 'exists but insufficient' : 'not logged in'}`);
            throw redirect(`${redirectTo}?redirect=${encodeURIComponent(fullRedirectPath)}`);
        }*/

        console.log(`✅ Access GRANTED: ${actualPath} (${config.access})`);
        return null;
    };
};

// Check access logic for ALL access types
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

            break;

        default:
            // Default to requiring authentication for unknown types
            return { allowed: !!user, redirectTo: "/login" };
    }
}