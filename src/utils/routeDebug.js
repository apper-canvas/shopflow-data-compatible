import { routeConfig, getRouteConfig } from "@/config/routes.config";

// Debug utility to show route configuration
export const showRouteConfig = () => {
    console.group("🛣️ Route Configuration");

    Object.entries(routeConfig).forEach(([path, config]) => {
        const accessColor = config.access === "public" ? "🟢" :
            config.access === "authenticated" ? "🟡" : "🔴";
        console.log(`${accessColor} ${path} → ${config.access} (${config.title})`);
    });

    console.groupEnd();
};

// Test route access for a specific path
export const testRouteAccess = (path) => {
    const config = getRouteConfig(path);
    console.log(`🔍 Testing path: ${path}`);
    console.log(`Access: ${config.access}`);
    console.log(`Title: ${config.title}`);
    return config;
};

// Show all routes by access type
export const showRoutesByAccess = () => {
    const routesByAccess = {};

    Object.entries(routeConfig).forEach(([path, config]) => {
        if (!routesByAccess[config.access]) {
            routesByAccess[config.access] = [];
        }
        routesByAccess[config.access].push(path);
    });

    console.group("🗂️ Routes by Access Type");
    Object.entries(routesByAccess).forEach(([access, paths]) => {
        console.log(`${access}:`, paths);
    });
    console.groupEnd();

    return routesByAccess;
};

// Development only - remove in production
if (import.meta.env.DEV) {
    window.routeDebug = {
        showConfig: showRouteConfig,
        testAccess: testRouteAccess,
        showByAccess: showRoutesByAccess
    };
}
