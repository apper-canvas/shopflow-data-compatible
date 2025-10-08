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

    return matches[0]?.config || {
        allow: {
            conditions: [{ label: "User must be logged in", rule: "authenticated" }]
        }
    };
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
// CONDITION EVALUATOR
// ==========================================

function evaluateRule(rule, user) {
    // Basic rules
    if (rule === "public") return true;
    if (rule === "authenticated") return !!user;

    // Field equality pattern: field:value
    if (rule.includes(":")) {
        if (!user) return false;

        const [field, value] = rule.split(":");

        // Handle array fields (roles, teams, permissions)
        if (field === "role" || field === "roles") {
            const userRoles = user.roles || [];
            return userRoles.includes(value);
        }

        // Handle external user check
        if (field === "external") {
            const isExternal = user.userMetadata?.isExternal;
            const expectedValue = value === "true" || value === true;
            return isExternal === expectedValue;
        }

        // Direct field comparison
        return user[field] === value;
    }

    return false;
}

// ==========================================
// ACCESS CHECK
// ==========================================

export function checkAccess(accessConfig, user) {
    // Backward compatibility: string format (old routes.json)
    if (typeof accessConfig === "string") {
        const allowed = evaluateRule(accessConfig, user);
        return {
            allowed,
            redirectTo: allowed ? null : "/login",
            failed: []
        };
    }

    const { conditions = [], operator = "AND" } = accessConfig;

    // Evaluate all conditions
    const results = conditions.map(cond => ({
        label: cond.label,
        rule: cond.rule,
        passed: evaluateRule(cond.rule, user)
    }));

    const failed = results.filter(r => !r.passed);

    // Apply operator logic
    const allowed = operator === "OR"
        ? results.some(r => r.passed)
        : results.every(r => r.passed);

    // Determine redirect
    let redirectTo = null;
    if (!allowed) {
        const needsAuth = failed.some(f => f.rule === "authenticated");
        redirectTo = (!user || needsAuth) ? "/login" : "/error?message=insufficient_permissions";
    }

    return {
        allowed,
        redirectTo,
        failed: failed.map(f => f.label)
    };
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
