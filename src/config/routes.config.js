// Route configuration mapping paths to access types and metadata
export const routeConfig = {
    // Public routes
    "/": { access: "public", title: "Home" },
    "/product/:id": { access: "public", title: "Product Detail" },
    "/category/:category": { access: "public", title: "Category" },
    "/login": { access: "public", title: "Login" },
    "/signup": { access: "public", title: "Sign Up" },
    "/callback": { access: "public", title: "Callback" },
    "/error": { access: "public", title: "Error" },

    // Authenticated routes
    "/search": { access: "authenticated", title: "Search Results" },
    "/wishlist": { access: "authenticated", title: "Wishlist" },
    "/deals": { access: "authenticated", title: "Deals" },
    "/orders": { access: "authenticated", title: "Orders" },

    // Checkout process - all require authentication
    "/checkout": { access: "authenticated", title: "Checkout" },
    "/checkout/*": { access: "authenticated", title: "Checkout Process" },

    // Admin routes - require admin role
    "/admin": { access: "role:admin", title: "Admin Panel" },
    "/admin/*": { access: "role:admin", title: "Admin" },
    "/admin/**/*": { access: "role:admin", title: "Admin" },

    // Premium features - require premium plan
    "/premium/*": { access: "plan:premium", title: "Premium Features" },
};

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

    return matches[0]?.config || { access: "authenticated", title: "Protected Page" };
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