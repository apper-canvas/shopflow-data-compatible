# Technical Integration Guide: React Router v6 + Apper SDK (Basic)

> Simplified guide for basic authentication routing with public and authenticated routes only

---

## Table of Contents

**PART 1: React Router v6 Fundamentals**
1. [RouterProvider Architecture](#1-routerprovider-architecture)
2. [Route Objects vs JSX Routes](#2-route-objects-vs-jsx-routes)
3. [Route Properties](#3-route-properties)
4. [The Outlet Component](#4-the-outlet-component)
5. [Navigate Component](#5-navigate-component)
6. [Lazy Loading Pattern](#6-lazy-loading-pattern)
7. [createRoute Helper](#7-createroute-helper)

**PART 2: Apper SDK Integration System**
8. [Three-File Architecture Overview](#8-three-file-architecture-overview)
9. [apperClient.js - SDK Singleton](#9-apperclientjs---sdk-singleton)
10. [userSlice.js - State Management](#10-userslicejs---state-management)
11. [Root.jsx - The Orchestrator](#11-rootjsx---the-orchestrator)
12. [Complete Integration Flow](#12-complete-integration-flow)
13. [The Gate-Keeping Mechanism](#13-the-gate-keeping-mechanism)
14. [Common Patterns](#14-common-patterns)
15. [Common Pitfalls](#15-common-pitfalls)
16. [Technical Q&A](#16-technical-qa)

---

# PART 1: React Router v6 Fundamentals

## 1. RouterProvider Architecture

### What is RouterProvider?

React Router v6.4+ introduces a new data-centric approach using `RouterProvider` instead of the older `BrowserRouter` component pattern.

**Old Pattern (v5/early v6):**
```javascript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</BrowserRouter>
```

**New Pattern (v6.4+) - Used in this project:**
```javascript
// Define routes as objects
const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> }
]);

// Use RouterProvider
<RouterProvider router={router} />
```

### Why This Matters

**Route Objects** enable:
- Programmatic route configuration
- Route-level data loading
- Easier testing and validation
- Dynamic route generation from JSON/API

**In App.jsx:**
```javascript
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}
```

The `router` is created once in `src/router/index.jsx` and passed to the provider.

### ⚠️ Critical Dependency Requirement

**React Router version 6.4.0 or higher is REQUIRED** for `RouterProvider` and `createBrowserRouter` to work.

**In your package.json:**
```json
{
  "dependencies": {
    "react-router-dom": "^6.4.0"
  }
}
```

**Why this matters:**
- `RouterProvider` was introduced in **React Router v6.4**
- Earlier versions (6.0-6.3) only support `BrowserRouter` with JSX routes
- Using `RouterProvider` with v6.3 or below will cause runtime errors

**Check your version:**
```bash
npm list react-router-dom
# Should show: react-router-dom@6.4.0 or higher
```

**If you have an older version:**
```bash
npm install react-router-dom@latest
# or
npm install react-router-dom@^6.4.0
```

**Features requiring v6.4+:**
- ✅ `RouterProvider` component
- ✅ `createBrowserRouter` function
- ✅ Data router features (loaders, actions)
- ✅ Route objects pattern used in this project

---

## 2. Route Objects vs JSX Routes

### Route Object Structure

```javascript
const route = {
  path: "/products",           // URL pattern
  element: <ProductList />,    // Component to render
  children: [...],             // Nested routes
  handle: { ... },
};
```

### Comparison

| Feature | JSX Routes | Route Objects |
|---------|-----------|---------------|
| Syntax | `<Route path="/" element={<Home />} />` | `{ path: "/", element: <Home /> }` |
| Dynamic | Harder | Easy |
| Metadata | Via context | Via `handle` |
| Type Safety | Limited | Full |
| This Project | ❌ Not used | ✅ Used |

---

## 3. Route Properties

### Essential Properties

#### `path` - URL Pattern

```javascript
// Exact match
{ path: "/products", element: <Products /> }

// Parameter
{ path: "/product/:id", element: <ProductDetail /> }

// Multiple parameters
{ path: "/category/:category/product/:id", element: <Detail /> }

// Wildcard (404)
{ path: "*", element: <NotFound /> }

// Empty path (wrapper routes)
{ path: "", element: <Layout />, children: [...] }
```

#### `index` - Index Route

An **index route** renders when the parent path is exactly matched with no additional segments.

```javascript
{
  path: "/dashboard",
  element: <DashboardLayout />,
  children: [
    // This renders at /dashboard (not /dashboard/overview)
    { index: true, element: <Overview /> },
    
    // This renders at /dashboard/settings
    { path: "settings", element: <Settings /> }
  ]
}
```

**CRITICAL: `index: true` means NO path, renders at parent URL.**

#### `element` - Component to Render

```javascript
// Direct component
{ path: "/", element: <Home /> }

// With lazy loading (recommended)
const Home = lazy(() => import("./Home"));
{ path: "/", element: <Suspense fallback={<Loading />}><Home /></Suspense> }

// Redirect
{ path: "/old", element: <Navigate to="/new" replace /> }

// Layout with outlet
{ path: "/", element: <Layout />, children: [...] }
```

#### `children` - Nested Routes

```javascript
{
  path: "/checkout",
  element: <CheckoutLayout />,  // Must contain <Outlet />
  children: [
    { path: "cart", element: <Cart /> },
    { path: "shipping", element: <Shipping /> }
  ]
}
```

**Parent component MUST render `<Outlet />` where children appear.**

---

## 4. The Outlet Component

### What is Outlet?

`<Outlet />` is a placeholder where **child routes render** inside parent layouts.

### Basic Example

```javascript
// Layout.jsx
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />  {/* Child routes render here */}
      </main>
      <Footer />
    </div>
  );
}
```

### Route Configuration

```javascript
{
  path: "/",
  element: <Layout />,
  children: [
    { path: "home", element: <Home /> },
    { path: "about", element: <About /> }
  ]
}
```

**URL `/home` renders:**
```jsx
<Layout>
  <Header />
  <main>
    <Home />  {/* Outlet replaced with Home */}
  </main>
  <Footer />
</Layout>
```

### Multiple Nesting Levels

```javascript
{
  path: "/",
  element: <Root />,        // Has <Outlet />
  children: [{
    path: "",
    element: <Layout />,    // Has <Outlet />
    children: [{
      path: "checkout",
      element: <CheckoutLayout />,  // Has <Outlet />
      children: [
        { path: "cart", element: <Cart /> }
      ]
    }]
  }]
}

// URL: /checkout/cart
// Renders: <Root><Layout><CheckoutLayout><Cart /></CheckoutLayout></Layout></Root>
```

**Each level with children MUST have `<Outlet />`.**

---

## 5. Navigate Component

### Declarative Redirects

```javascript
import { Navigate } from "react-router-dom";

// Simple redirect
{ path: "/old-path", element: <Navigate to="/new-path" /> }

// Index route redirect
{
  path: "/dashboard",
  element: <DashboardLayout />,
  children: [
    { index: true, element: <Navigate to="overview" replace /> }
  ]
}

// Conditional redirect in component
function PrivateRoute({ children }) {
  const isAuthenticated = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}
```

### Props

- `to` - Destination path (required)
- `replace` - Replace history entry instead of push (recommended for redirects)
- `state` - Pass state to destination

### Navigate vs useNavigate

```javascript
// Navigate component - Declarative, in render
<Navigate to="/login" replace />

// useNavigate hook - Programmatic, in handlers
const navigate = useNavigate();
navigate("/login", { replace: true });
```

**In this project:** 
- `Navigate` used in route definitions for index redirects
- `useNavigate` used in Root.jsx for programmatic navigation

---

## 6. Lazy Loading Pattern

### Why Lazy Load?

Splits code into chunks loaded on-demand, reducing initial bundle size.

### Implementation

```javascript
import { lazy, Suspense } from "react";

// Lazy import (top level)
const ProductDetail = lazy(() => import("@/components/pages/ProductDetail"));

// Wrap in Suspense
{
  path: "/product/:id",
  element: (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetail />
    </Suspense>
  )
}
```

### Project Pattern

All page components are lazy loaded:

```javascript
// src/router/index.jsx
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Home = lazy(() => import("@/components/pages/Homepage"));
// ... etc

// Each wrapped in Suspense via createRoute()
```

---

## 7. createRoute Helper

### Purpose

Wraps common patterns (Suspense, access control, metadata) into a reusable function.

### Implementation

```javascript
const createRoute = ({
  path,
  index,
  element,
  access,      // Optional override
  children,
  ...meta      // Additional metadata
}) => {
  // Determine config path
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  // Get access rules from routes.json
  const config = getRouteConfig(configPath);
  const finalAccess = access || config.allow;

  // Build route object
  const route = {
    ...(index ? { index: true } : { path }),
    
    // Wrap in Suspense if element provided
    element: element ? (
      <Suspense fallback={<div>Loading.....</div>}>
        {element}
      </Suspense>
    ) : element,
    
    // Store access config in handle
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};
```

### Usage

```javascript
// Without createRoute
{
  path: "products",
  element: <Suspense fallback={<Loading />}><Products /></Suspense>,
  handle: { access: { conditions: [{ rule: "public" }] } }
}

// With createRoute
createRoute({
  path: "products",
  element: <Products />
})
// Automatically adds Suspense, fetches access config, stores in handle
```

### Why It Exists

1. **DRY Principle** - Don't repeat Suspense wrapping
2. **Centralized Access** - Pulls from routes.json
3. **Consistent Metadata** - Standard handle structure
4. **Easy Overrides** - Can override access per route

---

### ⚠️ Route Ordering + createRoute Pattern

**Two important concepts in this project:**

1. **Route Ordering** - Order matters! React Router checks from top to bottom
2. **createRoute Helper** - Wraps routes with automatic Suspense and access control

---

#### Why Route Order Matters

React Router checks routes **from top to bottom** and uses the **first match**.

**Wrong Order (Don't do this!):**
```javascript
const routes = [
  { path: "*", element: <NotFound /> },     // Matches everything - WRONG!
  { path: "/", element: <Home /> },          // Never reached
  { path: "/products", element: <Products /> } // Never reached
];
```

**Correct Order:**
```javascript
const routes = [
  { path: "/", element: <Home /> },          // Check specific routes first
  { path: "/products", element: <Products /> },
  { path: "/product/:id", element: <ProductDetail /> },
  { path: "*", element: <NotFound /> }       // Wildcard ALWAYS last!
];
```

**Simple Rules:**
1. Specific paths before dynamic paths (`/products` before `/product/:id`)
2. Static routes before parameter routes (`/product/new` before `/product/:id`)
3. Wildcard `*` ALWAYS last

---

#### The createRoute Helper

**This project uses a helper function** to make routes cleaner:

**Without createRoute (repetitive):**
```javascript
{
  path: "products",
  element: <Suspense fallback={<div>Loading...</div>}><Products /></Suspense>,
  handle: { access: {...} }
}
```

**With createRoute (simple):**
```javascript
createRoute({
  path: "products",
  element: <Products />
})
// Automatically adds Suspense, gets access rules from routes.json
```

**When to use:**
- ✅ Page routes (Login, Home, ProductDetail, etc.)
- ❌ Layout routes (Root, Layout - they need `<Outlet />`)

---

#### Complete Example

Here's how a real route file looks:

```javascript
// src/router/index.jsx
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "@/layouts/Root";

// Lazy load pages
const Login = lazy(() => import("@/components/pages/Login"));
const Home = lazy(() => import("@/components/pages/Homepage"));
const ProductDetail = lazy(() => import("@/components/pages/ProductDetail"));
const NotFound = lazy(() => import("@/components/pages/NotFoundPage"));

// Helper function
const createRoute = ({ path, index, element, access }) => {
  // Wraps element in Suspense, gets access from routes.json
  // Returns complete route object
};

// Define routes - ORDER MATTERS!
const routes = [
  {
    path: "/",
    element: <Root />,        // Plain object - has auth guard
    children: [
      // Auth routes (must be accessible)
      createRoute({ path: "login", element: <Login /> }),
      
      // App routes
      {
        path: "",
        element: <Layout />,  // Plain object - has <Outlet />
        children: [
          createRoute({ index: true, element: <Home /> }),
          createRoute({ path: "product/:id", element: <ProductDetail /> }),
        ]
      }
    ]
  },
  createRoute({ path: "*", element: <NotFound /> })  // Always last!
];

export const router = createBrowserRouter(routes);
```

**Key Points:**
- Use `createRoute()` for pages
- Use plain objects for layouts (Root, Layout)
- Put wildcard `*` at the end
- Order: specific → dynamic → wildcard

#### Common Mistakes

**Mistake 1: Wildcard first**
```javascript
// ❌ Wrong - wildcard catches everything
{ path: "*", element: <NotFound /> },
{ path: "/products", element: <Products /> }  // Never reached
```

**Mistake 2: Dynamic before static**
```javascript
// ❌ Wrong - :id matches "new"
{ path: "/product/:id", element: <ProductDetail /> },
{ path: "/product/new", element: <NewProduct /> }  // Never reached

// ✅ Correct
{ path: "/product/new", element: <NewProduct /> },
{ path: "/product/:id", element: <ProductDetail /> }
```

**Remember:** Specific first, wildcard last!

---

# PART 2: Apper SDK Integration System

## 8. Three-File Architecture Overview

### The Authentication System Components

This project uses **three interconnected files** to implement authentication-aware routing:

```
┌─────────────────────────────────────────────────────────┐
│                   window.ApperSDK                       │
│              (Loaded from CDN in index.html)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│            services/apperClient.js                      │
│            (Singleton SDK Wrapper)                      │
│  • Wraps window.ApperSDK.ApperClient                   │
│  • Ensures single instance                              │
│  • Safe null handling                                   │
│  • Exports: getApperClient()                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              layouts/Root.jsx                           │
│              (The Orchestrator)                         │
│  • Gets client via getApperClient()                    │
│  • Initializes ApperUI with callbacks                  │
│  • Manages loading states                              │
│  • Guards all routes                                    │
│  • Dispatches to Redux                                  │
└────────┬──────────────────────────────┬─────────────────┘
         │                              │
         │ dispatch()                   │ useSelector()
         ↓                              ↓
┌────────────────────────────────────────────────────────┐
│              store/userSlice.js                        │
│              (Redux State)                             │
│  • user: User data                                     │
│  • isAuthenticated: Boolean flag                      │
│  • isInitialized: THE GATE KEY 🔑                     │
│  • Actions: setUser, clearUser, setInitialized       │
└────────────────────────────────────────────────────────┘
```

### Data Flow Summary

```
1. Root.jsx calls getApperClient()
2. apperClient.js returns singleton instance
3. Root.jsx calls ApperUI.setup(client, callbacks)
4. User authenticates → onSuccess callback
5. Callback dispatches setUser() to userSlice
6. userSlice updates Redux state
7. Root.jsx reads isInitialized from Redux
8. Route guards activate
9. Access verified against routes.json
10. Page renders or redirects
```

### Why Three Files?

**Separation of Concerns:**
- `apperClient.js` - SDK integration layer
- `userSlice.js` - State management layer  
- `Root.jsx` - Orchestration and routing layer

**Benefits:**
- Testable (each file can be tested independently)
- Maintainable (changes isolated to relevant layer)
- Reusable (apperClient and userSlice used throughout app)
- Clear responsibilities

---

## 8.5. routes.json - Access Control Configuration

### Overview

`routes.json` is a declarative configuration file that defines access control rules for routes. Instead of hardcoding permissions in components, you define them in JSON format.

**Why JSON?**
- Easy to modify without touching code
- Clear overview of all route permissions
- Non-developers can understand and audit

### ⚠️ Critical: File Path Must Not Change

**The file path `src/router/routes.json` is FIXED and should not be changed.**

```
src/
  router/
    index.jsx
    routes.json        ← MUST be at this exact path
    route.utils.js
```

**Why this path is fixed:**
- **Backend service uses this path** to deliver route configuration to the frontend
- The backend expects `src/router/routes.json` as the target location
- This is the contract between backend and frontend for UI configuration
- `route.utils.js` imports from `"./routes.json"` (relative path)

**Important:**
- Do NOT move or rename this file
- Backend service depends on this exact path
- Changing it will break frontend UI

---

### File Structure

```json
{
  "/path": {
    "allow": {
      "conditions": [
        {
          "label": "Human-readable description",
          "rule": "actual_rule"
        }
      ]
    }
  }
}
```

**Properties:**
- **`/path`** - Route pattern (exact, parameter, or wildcard)
- **`allow`** - Access configuration
- **`conditions`** - Array of rules to check
- **`label`** - Description for errors/debugging
- **`rule`** - The actual access rule

---

### Rule Types

#### 1. `public` - Anyone Can Access

```json
{
  "/": {
    "allow": {
      "conditions": [
        {
          "label": "Home is public",
          "rule": "public"
        }
      ]
    }
  }
}
```

**Evaluation:** Always returns `true`

**Use Cases:**
- Landing pages
- Login/signup pages
- Marketing pages
- Public product listings

---

#### 2. `authenticated` - Logged In Users Only

```json
{
  "/dashboard": {
    "allow": {
      "conditions": [
        {
          "label": "Must be logged in",
          "rule": "authenticated"
        }
      ]
    }
  }
}
```

**Evaluation:** `!!user` (user is not null)

**Use Cases:**
- User dashboards
- Profile pages
- Settings pages
- Any authenticated-only feature

---

### Route Patterns

#### 1. Exact Path
```json
{"/dashboard": {...}}
```
Matches: `/dashboard` only

#### 2. Parameter Route
```json
{"/product/:id": {...}}
```
Matches: `/product/123`, `/product/abc`, etc.

#### 3. Single-Level Wildcard
```json
{"/admin/*": {...}}
```
Matches: `/admin/users`, `/admin/settings`  
Doesn't match: `/admin/users/edit` (too deep)

#### 4. Multi-Level Wildcard
```json
{"/admin/**/*": {...}}
```
Matches: `/admin/users`, `/admin/users/edit`, `/admin/users/edit/123` (any depth)

---

### Pattern Specificity

When multiple patterns match, the most specific wins:

**Scoring:**
- Exact paths: 1000 + length
- Parameter routes: 500 + length
- Single wildcards: 300 + length
- Multi-level wildcards: 100 + length

**Example:**
```
Path: /admin/users

Matches:
- /admin/* (score: 308) ← WINNER
- /admin/**/* (score: 111)
```

---

### ⚠️ Route Ordering in routes.json

**Good news:** The code automatically picks the best match using specificity scores!

**Best practice:** Organize your routes.json file for easy reading:

```json
{
  "// PUBLIC ROUTES (most specific first)": {},
  "/": {"allow": {"conditions": [{"rule": "public"}]}},
  "/login": {"allow": {"conditions": [{"rule": "public"}]}},
  
  "// AUTHENTICATED ROUTES": {},
  "/dashboard": {"allow": {"conditions": [{"rule": "authenticated"}]}}
}
```

**Why organize this way?**
- Easy to find routes
- Clear access levels
- Good for team collaboration

**Remember:** Exact paths → Wildcards → Multi-level wildcards

---

### Complete Example

```json
{
  "// PUBLIC ROUTES": {},
  "/": {"allow": {"conditions": [{"rule": "public"}]}},
  "/login": {"allow": {"conditions": [{"rule": "public"}]}},
  "/signup": {"allow": {"conditions": [{"rule": "public"}]}},
  
  "// AUTHENTICATED ROUTES": {},
  "/dashboard": {"allow": {"conditions": [{"rule": "authenticated"}]}},
  "/profile": {"allow": {"conditions": [{"rule": "authenticated"}]}}
}
```

---

### Best Practices

1. **Organize by access level** - Group public, authenticated routes
2. **Use wildcards for groups** - `/admin/*` instead of listing each admin route
3. **Always make auth pages public** - `/login`, `/signup`, `/callback`, `/error`
4. **Use descriptive labels** - Helps with debugging and error messages
5. **Default is authenticated** - Unknown routes require login by default

---

## 8.6. route.utils.js - Access Verification Engine

### Overview

`route.utils.js` reads `routes.json` and verifies if users can access routes. It handles pattern matching, rule evaluation, and determines where to redirect unauthorized users.

**Core Functions:**
1. `getRouteConfig(path)` - Find matching route config
2. `matchesPattern(path, pattern)` - Check if path matches pattern
3. `getSpecificity(pattern)` - Calculate pattern priority
4. `evaluateRule(rule, user)` - Check if rule passes
5. `verifyRouteAccess(config, user)` - Verify access and determine redirect

---

### Function 1: getRouteConfig(path)

**Purpose:** Get access configuration for a path

**How it works:**
```
1. Normalize path ("admin" → "/admin")
2. Check for exact match first
3. If no match, find all matching patterns
4. Sort by specificity (highest first)
5. Return most specific match or default to "authenticated"
```

**Code:**
```javascript
export const getRouteConfig = (path) => {
    // Normalize
    if (!path || path === "index") path = "/";
    if (!path.startsWith("/")) path = "/" + path;

    // Direct match (fastest)
    if (routeConfig[path]) {
        return routeConfig[path];
    }

    // Pattern matching
    const matches = Object.keys(routeConfig)
        .filter(pattern => matchesPattern(path, pattern))
        .map(pattern => ({
            pattern,
            config: routeConfig[pattern],
            specificity: getSpecificity(pattern)
        }))
        .sort((a, b) => b.specificity - a.specificity);

    // Return most specific or default
    return matches[0]?.config || {
        allow: {
            conditions: [{ label: "User must be logged in", "rule": "authenticated" }]
        }
    };
};
```

**Examples:**
```javascript
getRouteConfig("/dashboard") 
// → Exact match returns config

getRouteConfig("/admin/users")
// → Matches "/admin/*" and "/admin/**/*"
// → Returns "/admin/*" (higher specificity)

getRouteConfig("/unknown/route")
// → No matches found
// → Returns default: {allow: {conditions: [{rule: "authenticated"}]}}
```

---

### Function 2: matchesPattern(path, pattern)

**Purpose:** Check if a path matches a route pattern

**Code:**
```javascript
function matchesPattern(path, pattern) {
    // Exact match
    if (path === pattern) return true;

    // Parameter routes: /product/:id → /product/123
    if (pattern.includes(":")) {
        const regex = new RegExp("^" + pattern.replace(/:[^/]+/g, "[^/]+") + "$");
        return regex.test(path);
    }

    // Wildcard patterns
    if (pattern.includes("*")) {
        if (pattern.endsWith("/**/*")) {
            // Multi-level: /admin/**/* matches any depth
            const base = pattern.replace("/**/*", "");
            return path.startsWith(base + "/");
        } else if (pattern.endsWith("/*")) {
            // Single-level: /admin/* matches one level only
            const base = pattern.replace("/*", "");
            const remainder = path.replace(base, "");
            return remainder.startsWith("/") && !remainder.substring(1).includes("/");
        }
    }

    return false;
}
```

**Examples:**
```javascript
// Exact
matchesPattern("/dashboard", "/dashboard") → true

// Parameter
matchesPattern("/product/123", "/product/:id") → true
matchesPattern("/product/123/reviews", "/product/:id") → false

// Single wildcard
matchesPattern("/admin/users", "/admin/*") → true
matchesPattern("/admin/users/edit", "/admin/*") → false (too deep)

// Multi-level wildcard
matchesPattern("/admin/users/edit", "/admin/**/*") → true
```

---

### Function 3: getSpecificity(pattern)

**Purpose:** Calculate pattern priority score

**Code:**
```javascript
function getSpecificity(pattern) {
    let score = 0;

    // Exact paths: highest priority
    if (!pattern.includes("*") && !pattern.includes(":")) {
        score += 1000;
    }

    // Parameter routes
    if (pattern.includes(":")) {
        score += 500;
    }

    // Single wildcards
    if (pattern.includes("/*") && !pattern.includes("/**/*")) {
        score += 300;
    }

    // Multi-level wildcards: lowest priority
    if (pattern.includes("/**/*")) {
        score += 100;
    }

    // Length as tie-breaker
    score += pattern.length;

    return score;
}
```

**Examples:**
```javascript
getSpecificity("/admin")         → 1006 (exact)
getSpecificity("/product/:id")   → 512 (parameter)
getSpecificity("/admin/*")       → 308 (single wildcard)
getSpecificity("/admin/**/*")    → 111 (multi wildcard)
```

---

### Function 4: evaluateRule(rule, user)

**Purpose:** Check if a single rule passes for a user

**Code:**
```javascript
function evaluateRule(rule, user) {
    // Built-in rules
    if (rule === "public") return true;
    if (rule === "authenticated") return !!user;
    
    return false;
}
```

**Examples:**
```javascript
evaluateRule("public", null)                    → true
evaluateRule("authenticated", null)             → false
evaluateRule("authenticated", {id: 123})        → true
```

---

### Function 5: verifyRouteAccess(config, user)

**Purpose:** Verify if user can access route and determine redirect

**Code:**
```javascript
export function verifyRouteAccess(config, user) {
    const { conditions = [] } = config;

    // Evaluate all conditions
    const results = conditions.map(cond => ({
        label: cond.label,
        rule: cond.rule,
        passed: evaluateRule(cond.rule, user)
    }));

    const failed = results.filter(r => !r.passed);

    // All conditions must pass
    const allowed = results.every(r => r.passed);

    // Determine redirect
    let redirectTo = null;
    if (!allowed) {
        const needsAuth = failed.some(f => f.rule === "authenticated");
        redirectTo = (!user || needsAuth) 
            ? "/login" 
            : "/error?message=insufficient_permissions";
    }

    return {
        allowed,
        redirectTo,
        failed: failed.map(f => f.label)
    };
}
```

**Return Structure:**
```javascript
{
  allowed: boolean,        // Can user access?
  redirectTo: string|null, // Where to redirect if denied
  failed: string[]         // Labels of failed conditions
}
```

**Examples:**
```javascript
// Public route
verifyRouteAccess(
  {conditions: [{rule: "public"}]}, 
  null
)
→ {allowed: true, redirectTo: null, failed: []}

// Not logged in
verifyRouteAccess(
  {conditions: [{rule: "authenticated"}]}, 
  null
)
→ {allowed: false, redirectTo: "/login", failed: ["Must be logged in"]}

// Logged in
verifyRouteAccess(
  {conditions: [{rule: "authenticated"}]}, 
  {id: 123}
)
→ {allowed: true, redirectTo: null, failed: []}
```

---

### How It All Works Together

```javascript
// User visits /admin/users

// 1. Get route config from routes.json
const config = getRouteConfig("/admin/users");

// 2. Check if user has access
const {allowed, redirectTo} = verifyRouteAccess(config.allow, user);

// 3. Redirect if not allowed
if (!allowed) {
  navigate(redirectTo); // → "/login"
}
```

**That's it!** The system automatically:
- Finds the right route config
- Checks all access rules
- Redirects if needed

---

## 9. apperClient.js - SDK Singleton

### Complete Annotated Code

```javascript
/**
 * Singleton class to manage ApperClient instance
 * WHY: Prevents multiple SDK initializations which cause:
 *   - Duplicate auth checks
 *   - State conflicts
 *   - Race conditions
 *   - Performance issues
 */
class ApperClientSingleton {
    constructor() {
        this._client = null;           // The single instance
        this._isInitializing = false;  // Race condition guard
    }

    /**
     * Get or create the ApperClient instance
     * @returns {ApperClient|null} Client instance or null if SDK not loaded
     */
    getInstance() {
        // Return cached instance if exists
        if (this._client) {
            return this._client;
        }

        // SDK not loaded yet (timing issue)
        if (!window.ApperSDK) {
            console.warn('ApperSDK not available on window object');
            return null;
        }

        // Prevent simultaneous initialization attempts
        if (this._isInitializing) {
            return null;
        }

        try {
            this._isInitializing = true;

            // Extract ApperClient constructor from global SDK
            const { ApperClient } = window.ApperSDK;

            // Get configuration from environment
            const projectId = import.meta.env.VITE_APPER_PROJECT_ID;
            const publicKey = import.meta.env.VITE_APPER_PUBLIC_KEY;

            // Validate required config
            if (!projectId) {
                console.error('VITE_APPER_PROJECT_ID is required');
                return null;
            }

            // Create the singleton instance
            this._client = new ApperClient({
                apperProjectId: projectId,
                apperPublicKey: publicKey,
            });

            console.log('ApperClient initialized successfully');
            return this._client;

        } catch (error) {
            console.error('Failed to initialize ApperClient:', error);
            return null;
        } finally {
            // Always reset the flag
            this._isInitializing = false;
        }
    }

    /**
     * Reset the singleton (useful for testing)
     */
    reset() {
        if (this._client) {
            this._client = null;
        }
    }

    /**
     * Check if client has been initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this._client !== null;
    }
}

// Create the singleton instance
let _singletonInstance = null;

/**
 * Lazy getter for singleton
 * @returns {ApperClientSingleton}
 */
const getSingleton = () => {
    if (!_singletonInstance) {
        _singletonInstance = new ApperClientSingleton();
    }
    return _singletonInstance;
};

/**
 * Main export - Get ApperClient instance
 * USAGE: const client = await getApperClient();
 */
export const getApperClient = () => getSingleton().getInstance();

/**
 * Alternative export with methods
 */
export const apperClientSingleton = {
    getInstance: () => getSingleton().getInstance(),
    reset: () => getSingleton().reset(),
    isInitialized: () => getSingleton().isInitialized()
};

export default getSingleton;
```

### Key Concepts

#### 1. Singleton Pattern

**Problem:** Multiple `new ApperClient()` calls create:
- Multiple auth checks
- Conflicting state
- Wasted resources

**Solution:** Class ensures ONE instance reused everywhere.

```javascript
// BAD - Multiple instances
const client1 = new ApperClient(config); // Login page
const client2 = new ApperClient(config); // Profile page
const client3 = new ApperClient(config); // Checkout

// GOOD - Single instance
const client = getApperClient(); // Everywhere
```

#### 2. Lazy Initialization

Client created **only when first requested**, not at module load.

```javascript
// Module loads → Nothing happens yet
import { getApperClient } from './apperClient';

// First call → Creates instance
const client = getApperClient();

// Subsequent calls → Returns cached instance
const sameClient = getApperClient();
```

#### 3. Race Condition Guard

```javascript
this._isInitializing = false;

getInstance() {
    if (this._isInitializing) {
        return null; // Another call is already creating instance
    }
    
    try {
        this._isInitializing = true;
        // ... create instance
    } finally {
        this._isInitializing = false; // Always reset
    }
}
```

Prevents multiple simultaneous initialization attempts.

#### 4. Safe Null Handling

```javascript
if (!window.ApperSDK) {
    console.warn('ApperSDK not available');
    return null; // Don't throw error
}
```

SDK loaded from CDN might not be ready yet. Return null gracefully instead of crashing.

### Usage in Root.jsx

```javascript
const initializeAuth = async () => {
    try {
        // Get singleton instance
        const apperClient = await getApperClient();
        
        // Check if SDK loaded
        if (!apperClient || !window.ApperSDK) {
            console.error('Failed to initialize ApperSDK');
            // Handle gracefully
            return;
        }
        
        // Use the client
        const { ApperUI } = window.ApperSDK;
        ApperUI.setup(apperClient, { ... });
        
    } catch (error) {
        console.error('Auth initialization failed:', error);
    }
};
```

---

## 10. userSlice.js - State Management

### Complete Annotated Code

```javascript
import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial authentication state
 */
const initialState = {
  /**
   * User object from Apper SDK
   * Contains: id, email, name, userMetadata, etc.
   */
  user: null,
  
  /**
   * Quick boolean check - is there a user?
   * Derived from user !== null
   */
  isAuthenticated: false,
  
  /**
   * THE GATE KEY 🔑
   * Set to true ONLY after auth check completes (success or failure)
   * Prevents route guards from running prematurely
   * CRITICAL FOR PREVENTING INFINITE REDIRECT LOOPS
   */
  isInitialized: false,
};

/**
 * Redux slice for user authentication
 */
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Set authenticated user
     * @param {object} action.payload - User object from Apper SDK
     */
    setUser: (state, action) => {
      // CRITICAL: Deep clone to avoid Redux mutation issues
      // Without this, nested object changes can cause bugs
      state.user = JSON.parse(JSON.stringify(action.payload));
      state.isAuthenticated = !!action.payload;
    },
    
    /**
     * Clear user on logout or auth error
     */
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      // NOTE: isInitialized stays true (auth check completed)
    },
    
    /**
     * Mark authentication check as complete
     * Called AFTER onSuccess or onError callbacks
     * @param {boolean} action.payload - Usually true
     */
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
  },
});

// Export actions for dispatching
export const { setUser, clearUser, setInitialized } = userSlice.actions;

// Export reducer for store configuration
export default userSlice.reducer;
```

### Three State Properties Explained

#### 1. `user` - The User Object

```javascript
// After successful authentication:
{
  id: "user_123",
  email: "user@example.com",
  name: "John Doe",
  userMetadata: {
    isExternal: false,
    organization: "Acme Corp"
  },
  // ... other Apper SDK fields
}

// Before authentication or after logout:
null
```

**Used for:**
- Displaying user info
- Access control checks
- API authentication headers

#### 2. `isAuthenticated` - Boolean Flag

```javascript
// Quick check without null checking
isAuthenticated: true   // user !== null
isAuthenticated: false  // user === null
```

**Used for:**
- Conditional rendering: `{isAuthenticated && <ProfileMenu />}`
- Quick access checks
- UI state management

**Why separate from `user`?**
- Cleaner code: `if (isAuthenticated)` vs `if (user !== null)`
- Performance: No need to check nested properties
- Semantic clarity: Explicitly shows auth status

#### 3. `isInitialized` - THE GATE KEY 🔑

**Most Critical Property**

```javascript
isInitialized: false  // Auth check not complete - DON'T CHECK ROUTES
isInitialized: true   // Auth check complete - SAFE TO CHECK ROUTES
```

**State Transitions:**

```
App Start → isInitialized = false
    ↓
ApperUI.setup() called
    ↓
[Waiting for auth check...]
    ↓
onSuccess/onError callback
    ↓
dispatch(setInitialized(true))
    ↓
isInitialized = true → Route guards activate
```

**Why This Exists:**

Without `isInitialized`:
```javascript
// BAD - Runs immediately on mount
useEffect(() => {
  const config = getRouteConfig(location.pathname);
  const { allowed, redirectTo } = verifyRouteAccess(config, user);
  // user is still null → redirects to login
  // Auth completes → has user → redirects back
  // INFINITE LOOP
}, [user, location]);
```

With `isInitialized`:
```javascript
// GOOD - Waits for auth check
useEffect(() => {
  if (isInitialized) {  // Gate closed until auth completes
    const config = getRouteConfig(location.pathname);
    const { allowed, redirectTo } = verifyRouteAccess(config, user);
    // Now safe to check access
  }
}, [isInitialized, user, location]);
```

### Deep Clone Explanation

```javascript
// WHY: JSON.parse(JSON.stringify(action.payload))?

// WITHOUT deep clone:
const user = { metadata: { org: "Acme" } };
state.user = user;  // Reference
user.metadata.org = "NewCorp";  // Mutates original
// Redux doesn't detect change → No re-render

// WITH deep clone:
state.user = JSON.parse(JSON.stringify(user));  // New object
// Changes to original don't affect Redux state
// Redux properly detects all changes
```

**Alternatives:**
- `structuredClone(action.payload)` (newer, better)
- `{ ...action.payload }` (shallow only)
- Immer (built into Redux Toolkit, but explicit clone is safer)

### Actions Usage

```javascript
import { useDispatch } from 'react-redux';
import { setUser, clearUser, setInitialized } from '@/store/userSlice';

function Root() {
  const dispatch = useDispatch();
  
  // After successful auth
  const handleAuthSuccess = (user) => {
    dispatch(setUser(user));
    dispatch(setInitialized(true));
  };
  
  // On logout
  const logout = () => {
    dispatch(clearUser());
    navigate("/login");
  };
}
```

### Reading State

```javascript
import { useSelector } from 'react-redux';

function Component() {
  // Get all auth state
  const { user, isAuthenticated, isInitialized } = useSelector(
    state => state.user
  );
  
  // Or get specific properties
  const user = useSelector(state => state.user.user);
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  
  // Use in logic
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  return <div>Welcome, {user.name}</div>;
}
```

---

## 11. Root.jsx - The Orchestrator

### Complete Annotated Code

```javascript
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, createContext, useContext } from "react";
import { setUser, clearUser, setInitialized } from "@/store/userSlice";
import { getRouteConfig, verifyRouteAccess } from "@/router/route.utils";
import { getApperClient } from "@/services/apperClient";

/**
 * Auth context for providing logout and init status to children
 */
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within Root component");
  }
  return context;
};

/**
 * Loading Spinner Component
 * Shown until authentication check completes
 */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-gray-600">Initializing authentication...</p>
    </div>
  </div>
);

/**
 * Root Component - The Authentication Guard
 * 
 * RESPONSIBILITIES:
 * 1. Initialize Apper SDK
 * 2. Manage auth state
 * 3. Guard all routes
 * 4. Handle redirects
 * 5. Provide auth context
 */
export default function Root() {
  // Redux state - source of truth for auth
  const { isInitialized, user } = useSelector(state => state.user);
  
  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local loading state - controls spinner visibility
  // WHY LOCAL? Need immediate UI control without Redux round-trip
  const [authInitialized, setAuthInitialized] = useState(false);

  /**
   * EFFECT 1: Initialize authentication on mount
   * Runs ONCE when Root component mounts
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * EFFECT 2: Route guard - Verify access on route change
   * Runs ONLY after auth is initialized
   */
  useEffect(() => {
    if (isInitialized) {
      const config = getRouteConfig(location.pathname);
      const { allowed, redirectTo } = verifyRouteAccess(config.allow, user);
      
      if (!allowed && redirectTo) {
        const redirectPath = location.pathname + location.search;
        navigate(`${redirectTo}?redirect=${encodeURIComponent(redirectPath)}`, {
          replace: true
        });
      }
    }
  }, [isInitialized, user, location.pathname, location.search, navigate]);

  /**
   * Initialize Apper SDK and setup auth callbacks
   */
  const initializeAuth = async () => {
    try {
      const apperClient = await getApperClient();

      if (!apperClient || !window.ApperSDK) {
        console.error('Failed to initialize ApperSDK');
        handleAuthComplete();
        return;
      }

      const { ApperUI } = window.ApperSDK;

      ApperUI.setup(apperClient, {
        onSuccess: (user) => {
          handleAuthSuccess(user);
        },
        onError: (error) => {
          handleAuthError(error);
        }
      });

    } catch (error) {
      console.error('Auth initialization failed:', error);
      handleAuthComplete();
    }
  };

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = (user) => {
    if (user) {
      dispatch(setUser(user));
      handleNavigation();
    } else {
      dispatch(clearUser());
    }
    handleAuthComplete();
  };

  /**
   * Handle authentication error
   */
  const handleAuthError = (error) => {
    console.error('Auth error:', error);
    dispatch(clearUser());
    handleAuthComplete();
  };

  /**
   * Mark auth check as complete
   */
  const handleAuthComplete = () => {
    setAuthInitialized(true);
    dispatch(setInitialized(true));
  };

  /**
   * Handle post-login navigation
   */
  const handleNavigation = () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    
    if (redirect) {
      navigate(redirect, { replace: true });
    } else if (['/login', '/signup', '/callback'].includes(location.pathname)) {
      navigate('/', { replace: true });
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    if (window.ApperSDK?.ApperUI) {
      window.ApperSDK.ApperUI.logout();
    }
    dispatch(clearUser());
    navigate('/login');
  };

  // Show loading spinner until auth check completes
  if (!authInitialized) {
    return <LoadingSpinner />;
  }

  // Render app with auth context
  return (
    <AuthContext.Provider value={{ logout, isInitialized }}>
      <Outlet />
    </AuthContext.Provider>
  );
}
```

### Key Responsibilities

#### 1. Initialize Apper SDK

```javascript
const apperClient = await getApperClient();
const { ApperUI } = window.ApperSDK;

ApperUI.setup(apperClient, {
  onSuccess: (user) => { /* ... */ },
  onError: (error) => { /* ... */ }
});
```

**Why:** Sets up authentication system with callbacks.

#### 2. Manage Two Loading States

```javascript
const [authInitialized, setAuthInitialized] = useState(false); // Local UI
const { isInitialized } = useSelector(state => state.user);     // Redux logic
```

**Why Two States?**
- `authInitialized` (local) - Controls spinner visibility immediately
- `isInitialized` (Redux) - Gates route guards logic

#### 3. Guard Routes

```javascript
useEffect(() => {
  if (isInitialized) {
    const config = getRouteConfig(location.pathname);
    const { allowed, redirectTo } = verifyRouteAccess(config.allow, user);
    
    if (!allowed && redirectTo) {
      navigate(redirectTo);
    }
  }
}, [isInitialized, user, location.pathname]);
```

**Why:** Checks access on every route change, redirects unauthorized users.

#### 4. Handle Post-Login Redirects

```javascript
const handleNavigation = () => {
  const redirect = new URLSearchParams(location.search).get('redirect');
  
  if (redirect) {
    navigate(redirect); // Go back to protected page
  } else if (location.pathname === '/login') {
    navigate('/');      // Default to home
  }
};
```

**Why:** Returns users to intended destination after login.

#### 5. Provide Auth Context

```javascript
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context; // { logout, isInitialized }
};
```

**Why:** Makes logout and auth status available to all child components.

---

## 12. Complete Integration Flow

### Startup Sequence

```
1. App loads, Root.jsx mounts
   ↓
2. authInitialized = false → Show loading spinner
   ↓
3. initializeAuth() called
   ↓
4. getApperClient() returns singleton
   ↓
5. ApperUI.setup() called with callbacks
   ↓
6. Apper SDK checks for existing session
   ↓
7a. User logged in → onSuccess(user)
    ↓
    dispatch(setUser(user))
    ↓
    dispatch(setInitialized(true))
    ↓
    setAuthInitialized(true)
    ↓
    Spinner removed, app renders
    ↓
    Route guard checks access
    ↓
    User sees protected page or redirects

7b. No session → onError()
    ↓
    dispatch(clearUser())
    ↓
    dispatch(setInitialized(true))
    ↓
    setAuthInitialized(true)
    ↓
    Spinner removed, app renders
    ↓
    Route guard redirects to /login
```

### Route Navigation Flow

```
User clicks link or navigates
    ↓
Router changes location
    ↓
Route guard useEffect triggers
    ↓
if (!isInitialized) → Do nothing (wait)
    ↓
if (isInitialized) → Check access
    ↓
getRouteConfig(location.pathname)
    ↓
verifyRouteAccess(config.allow, user)
    ↓
if (allowed) → Render page
    ↓
if (!allowed) → Navigate to redirectTo (/login or /error)
```

### Login Flow

```
User at /login page
    ↓
Clicks "Login" button
    ↓
ApperUI shows login modal/page
    ↓
User enters credentials
    ↓
Apper SDK authenticates
    ↓
onSuccess(user) callback
    ↓
dispatch(setUser(user))
    ↓
handleNavigation() checks for redirect param
    ↓
if (redirect exists) → navigate(redirect)
if (no redirect) → navigate('/')
    ↓
Route guard checks new page access
    ↓
User sees intended page
```

### Logout Flow

```
User clicks logout button
    ↓
logout() function called
    ↓
window.ApperSDK.ApperUI.logout()
    ↓
dispatch(clearUser())
    ↓
navigate('/login')
    ↓
User at login page
```

---

## 13. The Gate-Keeping Mechanism

### The Problem: Race Condition

```javascript
// WITHOUT isInitialized gate:

App starts
    ↓
user = null (default state)
    ↓
Route guard runs immediately
    ↓
verifyRouteAccess({ rule: "authenticated" }, null)
    ↓
Returns: { allowed: false, redirectTo: "/login" }
    ↓
Navigate to /login
    ↓
[Meanwhile] Auth check completes
    ↓
User is actually logged in!
    ↓
user = { id: 123, ... }
    ↓
Route guard runs again
    ↓
"User shouldn't be on /login"
    ↓
Navigate to /dashboard
    ↓
But there's a redirect param!
    ↓
Navigate back to /login
    ↓
INFINITE REDIRECT LOOP 💥
```

### The Solution: isInitialized Gate

```javascript
// WITH isInitialized gate:

App starts
    ↓
user = null
isInitialized = false  // ← GATE CLOSED
    ↓
Route guard checks:
if (!isInitialized) return; // ← GUARD WAITS
    ↓
[Auth check happens]
    ↓
onSuccess(user) or onError()
    ↓
dispatch(setInitialized(true))  // ← GATE OPENS
    ↓
Route guard runs:
if (isInitialized) {  // ← NOW SAFE
  verifyRouteAccess(config, user)
  // User state is accurate!
}
    ↓
Correct navigation happens once
    ↓
✅ No race conditions
```

### Code Implementation

```javascript
// userSlice.js - The gate
const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false  // ← THE GATE
};

// Root.jsx - The guard
useEffect(() => {
  if (isInitialized) {  // ← WAIT FOR GATE TO OPEN
    const config = getRouteConfig(location.pathname);
    const { allowed, redirectTo } = verifyRouteAccess(config.allow, user);
    
    if (!allowed && redirectTo) {
      navigate(redirectTo);
    }
  }
}, [isInitialized, user, location]);

// Only after auth check:
dispatch(setInitialized(true));  // ← OPEN THE GATE
```

---

## 14. Common Patterns

### Pattern 1: Accessing Current User

```javascript
import { useSelector } from 'react-redux';

function ProfilePage() {
  const { user, isAuthenticated } = useSelector(state => state.user);
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.name}</div>;
}
```

### Pattern 2: Using Logout

```javascript
import { useAuth } from '@/layouts/Root';

function Header() {
  const { logout } = useAuth();
  
  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

### Pattern 3: Conditional Rendering

```javascript
function Navigation() {
  const { isAuthenticated } = useSelector(state => state.user);
  
  return (
    <nav>
      <Link to="/">Home</Link>
      {isAuthenticated ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}
```

### Pattern 4: Protected API Calls

```javascript
const { user } = useSelector(state => state.user);

const fetchData = async () => {
  const response = await fetch('/api/data', {
    headers: {
      'Authorization': `Bearer ${user.token}`
    }
  });
  return response.json();
};
```

### Pattern 5: Loading States

```javascript
function App() {
  const { isInitialized } = useSelector(state => state.user);
  
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  return <RouterProvider router={router} />;
}
```

---

## 15. Common Pitfalls

### Pitfall 1: Using user Before isInitialized

```javascript
// ❌ BAD - Runs before auth check complete
useEffect(() => {
  if (user) {
    loadUserData();
  }
}, [user]);

// ✅ GOOD - Waits for initialization
useEffect(() => {
  if (isInitialized && user) {
    loadUserData();
  }
}, [isInitialized, user]);
```

### Pitfall 2: Direct User Mutation

```javascript
// ❌ BAD - Mutates state directly
dispatch(setUser(user));
user.name = "New Name"; // DON'T DO THIS!

// ✅ GOOD - Dispatch new object
dispatch(setUser({ ...user, name: "New Name" }));
```

### Pitfall 3: Forgetting to Handle Null User

```javascript
// ❌ BAD - Will crash if user is null
const name = user.name;

// ✅ GOOD - Safe access
const name = user?.name || "Guest";
```

### Pitfall 4: Not Checking isAuthenticated

```javascript
// ❌ BAD - Renders without check
function ProfilePage() {
  const { user } = useSelector(state => state.user);
  return <div>{user.name}</div>; // Crashes if not logged in
}

// ✅ GOOD - Check authentication
function ProfilePage() {
  const { user, isAuthenticated } = useSelector(state => state.user);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>{user.name}</div>;
}
```

### Pitfall 5: Multiple ApperClient Instances

```javascript
// ❌ BAD - Creates multiple instances
const client = new ApperClient(config);

// ✅ GOOD - Use singleton
const client = getApperClient();
```

---

## 16. Technical Q&A

### Q: Why use RouterProvider instead of BrowserRouter?

**A:** RouterProvider (v6.4+) enables:
- Route objects instead of JSX (easier to generate dynamically)
- Data loading at route level
- Better TypeScript support
- Centralized error handling
- Access to route metadata via `handle`

### Q: Why lazy load components?

**A:** 
- Reduces initial bundle size
- Faster first page load
- Components loaded on-demand when routes accessed
- Better performance for large apps

### Q: What happens if routes.json is missing a route?

**A:** The system uses a default:
```javascript
{
  allow: {
    conditions: [{ rule: "authenticated" }]
  }
}
```
Meaning: unknown routes require authentication by default.

### Q: Can I skip the route guard for a specific page?

**A:** Yes, define it in routes.json:
```json
{
  "/public-page": {
    "allow": {
      "conditions": [{ "rule": "public" }]
    }
  }
}
```

### Q: Why are there two loading states (authInitialized and isInitialized)?

**A:**
- `authInitialized` (local state) - Controls UI spinner immediately
- `isInitialized` (Redux) - Gates route guard logic globally

They serve different purposes: one for UI, one for logic.

### Q: What if ApperSDK fails to load?

**A:** 
- `getApperClient()` returns `null`
- Auth initialization handles gracefully
- Calls `handleAuthComplete()` to remove spinner
- User can still access public pages
- Protected pages redirect to error

---
