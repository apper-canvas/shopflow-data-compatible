# Technical Integration Guide: React Router v6 + Apper SDK

> Complete technical reference for implementing authentication-aware routing with React Router v6 and Apper SDK


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

8\. [Three-File Architecture Overview](#8-three-file-architecture-overview) 

9\. [apperClient.js - SDK Singleton](#9-apperclientjs---sdk-singleton) 

10\. [userSlice.js - State Management](#10-userslicejs---state-management) 

11\. [Root.jsx - The Orchestrator](#11-rootjsx---the-orchestrator) 

12\. [Complete Integration Flow](#12-complete-integration-flow) 

13\. [The Gate-Keeping Mechanism](#13-the-gate-keeping-mechanism) 

14\. [Common Patterns](#14-common-patterns) 

15\. [Common Pitfalls](#15-common-pitfalls) 

16\. [Technical Q&A](#16-technical-qa)


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

* Programmatic route configuration
* Route-level data loading
* Easier testing and validation
* Dynamic route generation from JSON/API

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

* `RouterProvider` was introduced in **React Router v6.4**
* Earlier versions (6.0-6.3) only support `BrowserRouter` with JSX routes
* Using `RouterProvider` with v6.3 or below will cause runtime errors

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

* ✅ `RouterProvider` component
* ✅ `createBrowserRouter` function
* ✅ Data router features (loaders, actions)
* ✅ Route objects pattern used in this project


---

## 2. Route Objects vs JSX Routes

### Route Object Structure

```javascript
const route = {
  path: "/products",           // URL pattern
  element: <ProductList />,    // Component to render
  children: [...],             // Nested routes
  handle: { ... },             // Custom metadata
};
```



| Feature | JSX Routes | Route Objects |
|----|----|----|
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

**CRITICAL:** `**index: true**` **means NO path, renders at parent URL.**

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
    { index: true, element: <Navigate to="cart" replace /> },
    { path: "cart", element: <Cart /> },
    { path: "shipping", element: <Shipping /> },
    { path: "payment", element: <Payment /> }
  ]
}

// URLs:
// /checkout → redirects to /checkout/cart
// /checkout/cart → renders CheckoutLayout + Cart
// /checkout/shipping → renders CheckoutLayout + Shipping
```

#### `handle` - Custom Metadata

Store custom data accessible via `useMatches()`:

```javascript
{
  path: "/admin",
  element: <AdminPanel />,
  handle: {
    access: { roles: ["admin"] },
    breadcrumb: "Admin Panel",
    icon: "settings"
  }
}

// Access in components:
const matches = useMatches();
const access = matches[0]?.handle?.access;
```

**In this project:** `handle` stores access control configuration.


---

## 4. The Outlet Component

### What is Outlet?

`<Outlet />` is a placeholder that renders the matched child route's element.

### Where to Use It

**In parent route components that have** `**children**`**:**

```javascript
// Route definition
{
  path: "/",
  element: <Layout />,
  children: [
    { index: true, element: <Home /> },
    { path: "about", element: <About /> }
  ]
}

// Layout.jsx component
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

### URL to Component Mapping

```
URL: /
Renders: <Layout><Home /></Layout>

URL: /about
Renders: <Layout><About /></Layout>
```

### Multiple Nesting Levels

```javascript
{
  path: "/",
  element: <Root />,           // Has <Outlet />
  children: [{
    path: "",
    element: <Layout />,       // Has <Outlet />
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

**Each level with children MUST have** `**<Outlet />**`**.**


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

* `to` - Destination path (required)
* `replace` - Replace history entry instead of push (recommended for redirects)
* `state` - Pass state to destination

### Navigate vs useNavigate

```javascript
// Navigate component - Declarative, in render
<Navigate to="/login" replace />

// useNavigate hook - Programmatic, in handlers
const navigate = useNavigate();
navigate("/login", { replace: true });
```

**In this project:**

* `Navigate` used in route definitions for index redirects
* `useNavigate` used in Root.jsx for programmatic navigation


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

* ✅ Page routes (Login, Home, ProductDetail, etc.)
* ❌ Layout routes (Root, Layout - they need `<Outlet />`)


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

* Use `createRoute()` for pages
* Use plain objects for layouts (Root, Layout)
* Put wildcard `*` at the end
* Order: specific → dynamic → wildcard

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
│  • user: User data + roles                            │
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

* `apperClient.js` - SDK integration layer
* `userSlice.js` - State management layer
* `Root.jsx` - Orchestration and routing layer

**Benefits:**

* Testable (each file can be tested independently)
* Maintainable (changes isolated to relevant layer)
* Reusable (apperClient and userSlice used throughout app)
* Clear responsibilities


---

## 8.1. routes.json - Access Control Configuration

### Overview

`routes.json` is a declarative configuration file that defines access control rules for routes. Instead of hardcoding permissions in components, you define them in JSON format.

**Why JSON?**

* Easy to modify without touching code
* Clear overview of all route permissions
* Non-developers can understand and audit

### ⚠️ Critical: File Path Must Not Change

**The file path** `**src/router/routes.json**` **is FIXED and should not be changed.**

```
src/
  router/
    index.jsx
    routes.json        ← MUST be at this exact path
    route.utils.js
```

**Why this path is fixed:**

* **Backend service uses this path** to deliver route configuration to the frontend
* The backend expects `src/router/routes.json` as the target location
* This is the contract between backend and frontend for UI configuration
* `route.utils.js` imports from `"./routes.json"` (relative path)

**Important:**

* Do NOT move or rename this file
* Backend service depends on this exact path
* Changing it will break both frontend UI


---

### File Structure

There are two approaches to define access control:

#### Approach 1: When Conditions (Inline Rules)

```json
{
  "/path": {
    "allow": {
      "when": {
        "conditions": [
          {
            "label": "Human-readable description",
            "rule": "actual_rule"
          }
        ],
        "operator": "AND"
      },
      "redirectOnDeny": "/custom/redirect/path"
    }
  }
}
```

#### Approach 2: Custom Function 

```json
{
  "/path": {
    "allow": {
      "function": "customFunctionName",
      "redirectOnDeny": "/custom/redirect/path"
    }
  }
}
```

**Properties:**

* `**/path**` - Route pattern (exact, parameter, or wildcard)
* `**allow**` - Access configuration object
* `**when**` - Contains conditions for inline rule evaluation
* `**conditions**` - Array of rules to check
* `**label**` - Description for errors/debugging
* `**rule**` - The actual access rule (JavaScript expression or built-in)
* `**operator**` - `"OR"` (default) or `"AND"`
* `**function**` - Name of registered custom function (alternative to `when`)
* `**redirectOnDeny**` - Custom redirect path when access is denied (optional, defaults to `/login`)
* `**excludeRedirectQuery**` - Boolean, when `true`, prevents adding `?redirect=` query parameter on denial (optional, defaults to `false`)


---

### Rule Types

#### 1. Built-in Rules

`**public**` - Anyone can access

```json
{
  "/": {
    "allow": {
      "when": {
        "conditions": [{"label": "Home is public", "rule": "public"}]
      }
    }
  }
}
```

`**authenticated**` - Must be logged in

```json
{
  "/dashboard": {
    "allow": {
      "when": {
        "conditions": [{"label": "Must be logged in", "rule": "authenticated"}]
      },
      "redirectOnDeny": "/login"
    }
  }
}
```

#### 2. JavaScript Expression Rules

**Important:** The rule system uses **JavaScript expressions** for maximum flexibility. Any valid JavaScript expression that evaluates to a boolean can be used as a rule.

**How it works:**

* All user object properties are available as variables in your expression
* The expression is evaluated using `new Function()` with user properties as context
* Return value is coerced to boolean


---

##### 🔑 Key Rule: Write Properties WITHOUT `user.`

**In routes.json, write property names directly:**

✅ **CORRECT:**
```json
{
  "rule": "emailAddress == \"admin@example.com\""
}
```

❌ **WRONG:**
```json
{
  "rule": "user.emailAddress == \"admin@example.com\""
}
```

**Why?**
The system automatically makes all user properties available by name. You can directly use `emailAddress`, `roles`, `userMetadata`, etc.

**More Examples:**

| ✅ Write This | ❌ Not This |
|--------------|------------|
| `emailAddress == "admin@example.com"` | `user.emailAddress == "admin@example.com"` |
| `userMetadata?.isExternal` | `user.userMetadata.isExternal` |
| `roles?.includes('admin')` | `user.roles && user.roles.includes('admin')` |
| `accounts?.[0]?.profile?.name == 'CEO'` | `user.accounts[0].profile.name == 'CEO'` |

**Think of it like this:**
```javascript
// You have access to:
emailAddress, roles, userMetadata, accounts, etc.

// You DON'T have access to:
user.emailAddress ❌  // 'user' doesn't exist in rules!
```

---

##### JavaScript Expression Examples

**Check email address:**

```json
{
  "/admin": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "User must be logged in", "rule": "authenticated"},
          {"label": "Must be admin email", "rule": "emailAddress == \"admin@example.com\""}
        ],
        "operator": "AND"
      },
      "redirectOnDeny": "/error?message=admin_access_required"
    }
  }
}
```

**Check nested object property:**

```json
{
  "/admin/**/*": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "User must be logged in", "rule": "authenticated"},
          {"label": "Must be CEO", "rule": "accounts?.[0]?.profile?.name == 'CEO'"}
        ],
        "operator": "AND"
      },
      "redirectOnDeny": "/error?message=admin_access_required"
    }
  }
}
```

**Check user metadata:**

```json
{
  "/external": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "Must be external user", "rule": "userMetadata?.isExternal"}
        ]
      },
      "redirectOnDeny": "/error?message=internal_users_only"
    }
  }
}
```

**Complex boolean logic:**

```json
{
  "/admin/dashboard": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "Admin access", "rule": "authenticated && emailAddress == \"admin@example.com\""}
        ]
      },
      "redirectOnDeny": "/error?message=admin_access_required",
      "excludeRedirectQuery": true
    }
  }
}
```

**Array operations:**

```json
{
  "/moderators": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "Has moderator role", "rule": "roles?.includes('moderator')"}
        ]
      }
    }
  }
}
```


---

##### Available Context in Rules

When writing JavaScript expressions, all user object properties are available as variables:

**Example user object:**

```javascript
{
  id: "user123",
  emailAddress: "john@example.com",
  roles: ["user", "moderator"],
  accounts: [
    {
      profile: {
        name: "John Doe",
        avatar: "..."
      }
    }
  ],
  userMetadata: {
    isExternal: false,
    department: "engineering"
  }
}
```

**Available variables in rules:**

* `id`
* `emailAddress`
* `roles`
* `accounts`
* `userMetadata`
* Any other property in the user object

#### 3. Custom Functions (Reusable Logic)

For complex or reusable authorization logic, use custom functions instead of inline expressions.

**Define in** `**route.utils.js**`**:**

```javascript
const customFunctions = {
    isCEO: (user) => {
        return user?.accounts?.[0]?.profile?.name === 'CEO';
    },
    hasMinimumCredits: (user) => {
        return user && user.credits >= 100;
    },
    isTeamMember: (user) => {
        return user?.teams?.includes('engineering');
    }
};
```

**⚠️ Important: Function Registration**

When you use `"function": "isCEO"` in routes.json:
- The function name `"isCEO"` **MUST** exist as a key in the `customFunctions` object
- The name must match **exactly** (case-sensitive)
- **ALL custom functions MUST be registered** in `customFunctions` in `route.utils.js`

**Example:**
```javascript
// In route.utils.js - MUST register here
const customFunctions = {
  isCEO: (user) => { ... },           // ← Register function
  yourNewFunction: (user) => { ... }  // ← Add new functions here
};
```

```json
// In routes.json - Use the exact name
{
  "function": "isCEO"  // ← Must match key name in customFunctions
}
```

**If function is not found:**
- Logs error: `Custom function "yourFunction" not found`
- Access is **denied** (returns false)

---

**Use in** `**routes.json**`**:**

```json
{
  "/admin/*": {
    "allow": {
      "function": "isCEO",
      "redirectOnDeny": "/error?message=admin_access_required"
    }
  },
  "/premium-features": {
    "allow": {
      "function": "hasMinimumCredits",
      "redirectOnDeny": "/upgrade"
    }
  }
}
```

**When to use custom functions:**

* Complex logic that's hard to read as inline expressions
* Reusable logic across multiple routes
* Logic requiring try-catch error handling
* Better performance for expensive computations (can add caching)


---

**Remember:**

* Return `true` (allowed) or `false` (denied)
* Check specific patterns before generic ones
* Add comments to explain your logic


---

### Operators

**AND** - All conditions must pass (recommended for admin routes):

```json
{
  "/admin": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "Must be logged in", "rule": "authenticated"},
          {"label": "Must be admin", "rule": "emailAddress == \"admin@example.com\""}
        ],
        "operator": "AND"
      },
      "redirectOnDeny": "/error?message=admin_access_required",
      "excludeRedirectQuery": true
    }
  }
}
```

Only users who are logged in AND have admin email can access.

**OR** - At least one condition must pass:

```json
{
  "/dashboard": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "Must be logged in", "rule": "authenticated"},
          {"label": "Or be admin", "rule": "emailAddress == \"admin@example.com\""}
        ],
        "operator": "OR"
      }
    }
  }
}
```

Either logged in users OR admins can access.

**Note:** Default operator is `"OR"` when not specified, but it's recommended to explicitly set `"operator": "AND"` for admin routes to ensure all conditions must pass.


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

* Exact paths: 1000 + length
* Parameter routes: 500 + length
* Single wildcards: 300 + length
* Multi-level wildcards: 100 + length

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
  "/": {"allow": {"when": {"conditions": [{"rule": "public"}]}}},
  "/login": {"allow": {"when": {"conditions": [{"rule": "public"}]}}},
  
  "// AUTHENTICATED ROUTES": {},
  "/dashboard": {"allow": {"when": {"conditions": [{"rule": "authenticated"}]}}},
  
  "// ADMIN ROUTES (exact before wildcards)": {},
  "/admin": {
    "allow": {
      "when": {"conditions": [{"rule": "emailAddress == \"admin@example.com\""}]}
    }
  },
  "/admin/*": {
    "allow": {
      "function": "isCEO"
    }
  },
  "/admin/**/*": {
    "allow": {
      "when": {"conditions": [{"rule": "roles && roles.includes('admin')"}]}
    }
  }
}
```

**Why organize this way?**

* Easy to find routes
* Clear access levels
* Good for team collaboration

**Remember:** Exact paths → Wildcards → Multi-level wildcards


---

### Complete Example

```json
{
  "// PUBLIC ROUTES": {},
  "/": {"allow": {"when": {"conditions": [{"rule": "public"}]}}},
  "/login": {"allow": {"when": {"conditions": [{"rule": "public"}]}}},
  "/signup": {"allow": {"when": {"conditions": [{"rule": "public"}]}}},
  
  "// AUTHENTICATED ROUTES": {},
  "/dashboard": {
    "allow": {
      "when": {"conditions": [{"rule": "authenticated"}]},
      "redirectOnDeny": "/login"
    }
  },
  "/profile": {
    "allow": {
      "when": {"conditions": [{"rule": "authenticated"}]},
      "redirectOnDeny": "/login"
    }
  },
  
  "// ADMIN ROUTES": {},
  "/admin/*": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "Must be logged in", "rule": "authenticated"},
          {"label": "Must be admin", "rule": "emailAddress == \"admin@example.com\""}
        ],
        "operator": "AND"
      },
      "redirectOnDeny": "/error?message=admin_access_required"
    }
  },
  
  "// PREMIUM ROUTES": {},
  "/premium/*": {
    "allow": {
      "when": {
        "conditions": [{"label": "Premium plan required", "rule": "plan == 'premium'"}]
      },
      "redirectOnDeny": "/upgrade"
    }
  }
}
```


---

### Best Practices


1. **Organize by access level** - Group public, authenticated, admin routes
2. **Use wildcards for groups** - `/admin/*` instead of listing each admin route
3. **Always make auth pages public** - `/login`, `/signup`, `/callback`, `/error`
4. **Use descriptive labels** - Helps with debugging and error messages
5. **Default is authenticated** - Unknown routes require login by default


---

## 8.2. route.utils.js - Access Verification Engine

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
5. Return most specific match or null (let React Router handle 404)
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

    // Return most specific or null (let React Router handle it)
    return matches[0]?.config || null;
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
// → Returns null (React Router will show 404 page naturally)
```

**Key Change:** Returns `null` instead of default authenticated config. This allows React Router to handle unmatched routes naturally (404 pages), rather than forcing authentication on every unknown route.


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

**This handles built-in rules and delegates to dynamic evaluation!**

**Code:**

```javascript
function evaluateRule(rule, user) {
    // Built-in rules
    if (rule === "public") return true;
    if (rule === "authenticated") return !!user;

    // All other rules are JavaScript expressions
    return evaluateDynamicRule(rule, user);
}
```

**Examples:**

```javascript
evaluateRule("public", null)                                      → true
evaluateRule("authenticated", null)                               → false
evaluateRule("authenticated", {id: 123})                          → true
evaluateRule("emailAddress == \"admin@example.com\"", user)       → true/false
evaluateRule("roles?.includes('admin')", user)                    → true/false
evaluateRule("accounts?.[0]?.profile?.name == 'CEO'", user)       → true/false
```


---

### Function 4a: evaluateDynamicRule(rule, user)

**Purpose:** Evaluate JavaScript expressions as rules

**This is the magic that makes JavaScript expressions work!**

**Code:**

```javascript
function evaluateDynamicRule(rule, user) {
    if (!user) return false;

    try {
        // Dynamically extract all keys and values from user object
        const contextKeys = Object.keys(user);
        const contextValues = Object.values(user);

        // Wrap expression in return statement if not already present
        const wrappedRule = rule.trim().startsWith('return')
            ? rule
            : `return (${rule})`;

        // Create function with all user properties as parameters
        const func = new Function(...contextKeys, wrappedRule);

        // Execute function with user values
        const result = func(...contextValues);

        // Ensure boolean result
        return Boolean(result);

    } catch (error) {
        console.error('Error evaluating rule:', rule, error);
        return false;
    }
}
```

**How it works:**


1. **Extract user properties**: Gets all keys and values from user object
2. **Wrap rule**: Adds `return` statement if missing
3. **Create dynamic function**: Uses `new Function()` with user properties as parameters
4. **Execute**: Calls function with user values
5. **Return boolean**: Ensures result is boolean

**Example flow:**

```javascript
// Rule: "emailAddress == \"admin@example.com\""
// User: { id: 123, emailAddress: "admin@example.com", roles: ["admin"] }

// Step 1: Extract
contextKeys = ["id", "emailAddress", "roles"]
contextValues = [123, "admin@example.com", ["admin"]]

// Step 2: Wrap
wrappedRule = "return (emailAddress == \"admin@example.com\")"

// Step 3: Create function
func = new Function("id", "emailAddress", "roles", 
                    "return (emailAddress == \"admin@example.com\")")

// Step 4: Execute
result = func(123, "admin@example.com", ["admin"])
// Inside function: emailAddress is "admin@example.com", so returns true

// Step 5: Return
return true
```

**Security Note:** The `new Function()` approach evaluates user-defined expressions. In this implementation, the expressions come from `routes.json` which is part of your codebase (not user input from end-users), so it's safe. Never evaluate expressions from untrusted sources.

**Error Handling:** If expression fails (syntax error, undefined property, etc.), it logs error and returns `false` (denies access).


---

### Function 4b: executeCustomFunction(functionName, user)

**Purpose:** Execute registered custom functions for complex reusable logic

**Code:**

```javascript
// Custom functions registry at top of file
const customFunctions = {
    isCEO: (user) => {
        return user?.accounts?.[0]?.profile?.name === 'CEO';
    }
};

// Helper to execute custom function
function executeCustomFunction(functionName, user) {
    const func = customFunctions[functionName];

    if (!func) {
        console.error(`Custom function "${functionName}" not found`);
        return false;
    }

    try {
        return Boolean(func(user));
    } catch (error) {
        console.error(`Error executing custom function "${functionName}":`, error);
        return false;
    }
}
```

**How it works:**


1. **Look up function**: Finds function in `customFunctions` registry
2. **Error if not found**: Logs error and denies access
3. **Execute function**: Calls function with user object
4. **Return boolean**: Coerces result to boolean

**Example:**

```javascript
// In routes.json
{
  "/admin/*": {
    "allow": {
      "function": "isCEO"
    }
  }
}

// Execution
executeCustomFunction("isCEO", user)
// → Calls customFunctions.isCEO(user)
// → Returns true if user?.accounts?.[0]?.profile?.name === 'CEO'
```

**When to use custom functions:**

* Complex logic that spans multiple conditions
* Reusable logic across multiple routes
* Logic requiring try-catch or external calls
* Better performance (can add memoization/caching)


---

### Function 5: verifyRouteAccess(config, user)

**Purpose:** Verify if user can access route and determine redirect

**Code:**

```javascript
export function verifyRouteAccess(config, user) {
    // If no config exists, allow access (let React Router handle it)
    if (!config || !config.allow) {
        return {
            allowed: true,
            redirectTo: null,
            excludeRedirectQuery: false,
            failed: []
        };
    }

    const allowedConfig = config.allow;

    // If custom function is specified, use it instead of when conditions
    if (allowedConfig.function) {
        const allowed = executeCustomFunction(allowedConfig.function, user);

        return {
            allowed,
            redirectTo: allowed ? null : (allowedConfig.redirectOnDeny || "/login"),
            excludeRedirectQuery: allowedConfig.excludeRedirectQuery === true,
            failed: allowed ? [] : [`Custom function "${allowedConfig.function}" failed`]
        };
    }

    // Otherwise, use the when conditions as before
    const whenClause = allowedConfig.when || allowedConfig;
    const { conditions = [], operator = "OR" } = whenClause;

    // Evaluate all conditions
    const results = conditions.map(cond => ({
        label: cond.label,
        rule: cond.rule,
        passed: evaluateRule(cond.rule, user)
    }));

    const failed = results.filter(r => !r.passed);

    // Apply operator logic
    const allowed = operator === "OR"
        ? results.some(r => r.passed)    // At least one must pass
        : results.every(r => r.passed);  // All must pass

    // Determine redirect
    let redirectTo = null;
    if (!allowed) {
        // Use allowedConfig's redirectOnDeny if available, otherwise redirect to login
        redirectTo = allowedConfig.redirectOnDeny || "/login";
    }

    return {
        allowed,
        redirectTo,
        excludeRedirectQuery: allowedConfig.excludeRedirectQuery === true,
        failed: failed.map(f => f.label)
    };
}
```

**Return Structure:**

```javascript
{
  allowed: boolean,               // Can user access?
  redirectTo: string|null,        // Where to redirect if denied
  excludeRedirectQuery: boolean,  // If true, don't add ?redirect= query param
  failed: string[]                // Labels of failed conditions
}
```

**Examples:**

```javascript
// No config (let React Router handle)
verifyRouteAccess(null, user)
→ {allowed: true, redirectTo: null, excludeRedirectQuery: false, failed: []}

// Public route
verifyRouteAccess(
  {when: {conditions: [{rule: "public"}]}}, 
  null
)
→ {allowed: true, redirectTo: null, excludeRedirectQuery: false, failed: []}

// Not logged in
verifyRouteAccess(
  {
    when: {conditions: [{label: "Must be logged in", rule: "authenticated"}]},
    redirectOnDeny: "/login"
  }, 
  null
)
→ {allowed: false, redirectTo: "/login", excludeRedirectQuery: false, failed: ["Must be logged in"]}

// Custom function with excludeRedirectQuery
verifyRouteAccess(
  {function: "isCEO", redirectOnDeny: "/error?message=admin_required", excludeRedirectQuery: true},
  {id: 123, accounts: [{profile: {name: "User"}}]}
)
→ {allowed: false, redirectTo: "/error?message=admin_required", excludeRedirectQuery: true, failed: ["Custom function \"isCEO\" failed"]}

// JavaScript expression - missing admin email
verifyRouteAccess(
  {
    when: {
      conditions: [
        {label: "Must be logged in", rule: "authenticated"},
        {label: "Must be admin", rule: "emailAddress == \"admin@example.com\""}
      ],
      operator: "AND"
    },
    redirectOnDeny: "/error?message=admin_access_required",
    excludeRedirectQuery: true
  }, 
  {id: 123, emailAddress: "user@example.com"}
)
→ {allowed: false, redirectTo: "/error?message=admin_access_required", excludeRedirectQuery: true, failed: ["Must be admin"]}
```


---

### How It All Works Together

```javascript
// User visits /admin/users

// 1. Get route config from routes.json
const config = getRouteConfig("/admin/users");

// 2. Check if user has access
const {allowed, redirectTo} = verifyRouteAccess(config, user);

// 3. Redirect if not allowed
if (!allowed) {
  navigate(redirectTo); // → "/login"
}
```

**That's it!** The system automatically:

* Finds the right route config
* Checks all access rules
* Redirects if needed


---

### Quick Reference: Access Control Approaches

**Approach 1: JavaScript Expressions (Inline)**

Write expressions directly in `routes.json`:

```json
{
  "/admin": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "Must be logged in", "rule": "authenticated"},
          {"label": "Must be admin", "rule": "emailAddress == \"admin@example.com\""}
        ],
        "operator": "AND"
      },
      "redirectOnDeny": "/error?message=admin_access_required",
      "excludeRedirectQuery": true
    }
  }
}
```

**Pros:** Simple, declarative, no code changes needed **Cons:** Can get complex for advanced logic

**Approach 2: Custom Functions (Reusable)**

Register function in `route.utils.js`:

```javascript
const customFunctions = {
  isCEO: (user) => {
    return user?.accounts?.[0]?.profile?.name === 'CEO';
  }
};
```

Use in `routes.json`:

```json
{
  "/admin/*": {
    "allow": {
      "function": "isCEO",
      "redirectOnDeny": "/error?message=admin_access_required",
      "excludeRedirectQuery": true
    }
  }
}
```

**Pros:** Reusable, testable, cleaner for complex logic **Cons:** Requires code changes in route.utils.js


---

## 8.3. Advanced Access Control Features

### Custom Redirect Paths (`redirectOnDeny`)

**Purpose:** Control where users are redirected when access is denied

**Default behavior:** If not specified, users are redirected to `/login`

**Usage:**

```json
{
  "/admin": {
    "allow": {
      "when": {
        "conditions": [{"rule": "authenticated"}]
      },
      "redirectOnDeny": "/error?message=admin_access_required"
    }
  },
  "/premium": {
    "allow": {
      "when": {
        "conditions": [{"rule": "plan == 'premium'"}]
      },
      "redirectOnDeny": "/upgrade"
    }
  }
}
```

**Benefits:**

* Better UX - users see relevant error messages
* Custom upgrade flows for premium features
* Different redirects for different denial reasons


---

### Excluding Redirect Query Parameter (`excludeRedirectQuery`)

**Purpose:** Control whether the original destination URL is preserved when redirecting users who are denied access

**Default behavior:** `false` - The redirect query parameter IS added (e.g., `/login?redirect=%2Fdashboard`)

**When to use** `**excludeRedirectQuery: true**`**:**

* **Error pages** - Users shouldn't return to the page they couldn't access
* **Admin-only areas** - Non-admins shouldn't be redirected back after attempting access
* **Prevent redirect loops** - When the redirect destination might fail the same access check

**Usage in routes.json:**

```json
{
  "/admin": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "Must be logged in", "rule": "authenticated"},
          {"label": "Must be admin", "rule": "emailAddress == \"admin@example.com\""}
        ],
        "operator": "AND"
      },
      "redirectOnDeny": "/error?message=admin_access_required",
      "excludeRedirectQuery": true
    }
  },
  "/external": {
    "allow": {
      "when": {
        "conditions": [
          {"label": "Must be external user", "rule": "userMetadata.isExternal"}
        ]
      },
      "redirectOnDeny": "/error?message=internal_users_only",
      "excludeRedirectQuery": true
    }
  }
}
```

**How it works:**

**Without** `**excludeRedirectQuery**` **(default behavior):**

```
User tries to access: /dashboard
Access denied → Redirected to: /login?redirect=%2Fdashboard
After login → Redirected back to: /dashboard ✓
```

**With** `**excludeRedirectQuery: true**`**:**

```
User tries to access: /admin
Access denied → Redirected to: /error?message=admin_access_required
(No redirect query param added)
User stays on error page (no automatic return to /admin)
```

**Implementation in Root.jsx:**

The `excludeRedirectQuery` flag is used when building the redirect URL:

```javascript
const { allowed, redirectTo, excludeRedirectQuery } = verifyRouteAccess(config, user);

// Build redirect URL - add redirect query param unless excluded
let redirectUrl = redirectTo;
if (!excludeRedirectQuery) {
  const redirectPath = location.pathname + location.search;
  const separator = redirectTo.includes('?') ? '&' : '?';
  redirectUrl = `${redirectTo}${separator}redirect=${encodeURIComponent(redirectPath)}`;
}

navigate(redirectUrl, { replace: true });
```

**Key points:**

* Separator logic handles both `?` and `&` for URLs with existing query params
* When excluded, only the `redirectOnDeny` path is used (clean redirect)
* Prevents infinite redirect loops for pages that can never be accessed


---

### JavaScript Expression Safety

**How expressions are evaluated:**


1. User properties extracted: `Object.keys(user)` and `Object.values(user)`
2. Dynamic function created: `new Function(...keys, wrappedRule)`
3. Function executed with user values
4. Result coerced to boolean

**Security considerations:**

✅ **Safe:** Expressions come from `routes.json` in your codebase ✅ **Safe:** Not evaluated from end-user input ❌ **Unsafe:** Never evaluate expressions from untrusted sources

**Error handling:**

* Syntax errors → logged and return `false` (deny access)
* Undefined properties → logged and return `false`
* Runtime errors → logged and return `false`

**Best practices:**

* **Use optional chaining (`?.`) for nested properties**: `userMetadata?.department` or `accounts?.[0]?.profile?.name`
* **Use optional chaining for arrays**: `roles?.includes('admin')` instead of `roles && roles.includes('admin')`
* Avoid complex logic - use custom functions instead
* Test expressions with various user objects (including null/undefined values)


---

### Custom Functions Registry Pattern

**Structure:**

```javascript
// At top of route.utils.js
const customFunctions = {
  functionName: (user) => {
    // Your logic here
    return boolean;
  }
};
```

**Example - Complex authorization:**

```javascript
const customFunctions = {
  isCEO: (user) => {
    // Simple check for CEO role
    return user?.accounts?.[0]?.profile?.name === 'CEO';
  },
  
  isAdminOrManager: (user) => {
    // Multiple role check
    if (!user) return false;
    const allowedRoles = ['admin', 'manager'];
    return user.roles?.some(role => allowedRoles.includes(role));
  },
  
  hasAdminPermissions: (user) => {
    // Complex permission check with error handling
    try {
      if (!user) return false;
      const isAdmin = user.emailAddress === 'admin@example.com';
      const hasPermission = user.permissions?.includes('admin_access');
      return isAdmin || hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }
};
```

**Usage in routes.json:**

```json
{
  "/admin/*": {
    "allow": {
      "function": "isCEO",
      "redirectOnDeny": "/error?message=admin_access_required",
      "excludeRedirectQuery": true
    }
  },
  "/admin/settings": {
    "allow": {
      "function": "isAdminOrManager",
      "redirectOnDeny": "/error?message=insufficient_permissions",
      "excludeRedirectQuery": true
    }
  }
}
```

**When to use custom functions:**

* Logic spans multiple conditions with complex boolean operations
* Need try-catch error handling
* Want to call external services or perform async checks (with caching)
* Same logic used across multiple routes
* Logic too complex to read as inline expression


---

### Mixing Approaches

You can use both `when` conditions and custom functions in the same `routes.json`:

```json
{
  "/public": {
    "allow": {
      "when": {"conditions": [{"rule": "public"}]}
    }
  },
  "/dashboard": {
    "allow": {
      "when": {"conditions": [{"rule": "authenticated"}]},
      "redirectOnDeny": "/login"
    }
  },
  "/admin": {
    "allow": {
      "when": {
        "conditions": [
          {"rule": "authenticated"},
          {"rule": "emailAddress == \"admin@example.com\""}
        ],
        "operator": "AND"
      },
      "redirectOnDeny": "/error?message=admin_access_required",
      "excludeRedirectQuery": true
    }
  },
  "/admin/*": {
    "allow": {
      "function": "isCEO",
      "redirectOnDeny": "/error?message=admin_access_required",
      "excludeRedirectQuery": true
    }
  }
}
```

**Decision guide:**

* **Simple single check** → Inline expression (`authenticated`, `public`)
* **Property comparison** → Inline expression (`emailAddress == "admin@example.com"`)
* **Multiple conditions** → Inline with AND operator for admin routes
* **Complex multi-step logic** → Custom function (like `isCEO`)
* **Reusable across routes** → Custom function


---

The new structure maintains backward compatibility:

```javascript
// Old structure (still works)
const whenClause = config.when || config;
```

This means you can have both old and new formats in the same file during migration:

```json
{
  "/old-route": {
    "allow": {
      "conditions": [{"rule": "authenticated"}]
    }
  },
  "/new-route": {
    "allow": {
      "when": {
        "conditions": [{"rule": "authenticated"}]
      },
      "redirectOnDeny": "/login"
    }
  }
}
```

However, **best practice** is to use the new `when` structure consistently.


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

* Multiple auth checks
* Conflicting state
* Wasted resources

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
   * Contains: id, email, name, roles, plan, userMetadata, etc.
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
  roles: ["admin", "moderator"],  // Added in Root.jsx
  plan: "premium",
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

* Displaying user info
* Access control checks
* API authentication headers

#### 2. `isAuthenticated` - Boolean Flag

```javascript
// Quick check without null checking
isAuthenticated: true   // user !== null
isAuthenticated: false  // user === null
```

**Used for:**

* Conditional rendering: `{isAuthenticated && <ProfileMenu />}`
* Quick access checks
* UI state management

**Why separate from** `**user**`**?**

* Cleaner code: `if (isAuthenticated)` vs `if (user !== null)`
* Performance: No need to check nested properties
* Semantic clarity: Explicitly shows auth status

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
const user = { roles: ["user"] };
state.user = user;  // Reference
user.roles.push("admin");  // Mutates original
// Redux doesn't detect change → No re-render

// WITH deep clone:
state.user = JSON.parse(JSON.stringify(user));  // New object
// Changes to original don't affect Redux state
// Redux properly detects all changes
```

**Alternatives:**

* `structuredClone(action.payload)` (newer, better)
* `{ ...action.payload }` (shallow only)
* Immer (built into Redux Toolkit, but explicit clone is safer)

### Actions Usage

```javascript
import { useDispatch } from 'react-redux';
import { setUser, clearUser, setInitialized } from '@/store/userSlice';

function Root() {
  const dispatch = useDispatch();
  
  // After successful auth
  const handleAuthSuccess = (user) => {
    const userWithRoles = { ...user, roles: ["admin"] };
    dispatch(setUser(userWithRoles));
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
  }, []); // Empty deps - run once

  /**
   * EFFECT 2: Route access control
   * Runs on EVERY navigation
   * CRITICAL: Uses early return guards for better readability
   */
  useEffect(() => {
    // Guard 1: Don't check routes until auth completes
    if (!isInitialized) return;

    // Get access rules for current path
    const config = getRouteConfig(location.pathname);

    // Guard 2: Exit if no config or no allow rules
    if (!config?.allow) return;

    // Verify user has access
    const { allowed, redirectTo, excludeRedirectQuery } = verifyRouteAccess(config, user);

    // Guard 3: Exit if access is allowed or no redirect
    if (allowed || !redirectTo) return;

    // Build redirect URL - add redirect query param unless excluded
    let redirectUrl = redirectTo;
    if (!excludeRedirectQuery) {
      const redirectPath = location.pathname + location.search;
      const separator = redirectTo.includes('?') ? '&' : '?';
      redirectUrl = `${redirectTo}${separator}redirect=${encodeURIComponent(redirectPath)}`;
    }

    navigate(redirectUrl, { replace: true });
  }, [isInitialized, user, location.pathname, location.search, navigate]);

  /**
   * Initialize Apper SDK authentication
   */
  const initializeAuth = async () => {
    try {
      // Get singleton ApperClient instance
      const apperClient = await getApperClient();

      // Check if SDK loaded successfully
      if (!apperClient || !window.ApperSDK) {
        console.error('Failed to initialize ApperSDK or ApperClient');
        dispatch(clearUser());
        handleAuthComplete();
        return;
      }

      // Extract ApperUI from global SDK
      const { ApperUI } = window.ApperSDK;

      // Setup ApperUI with callbacks
      ApperUI.setup(apperClient, {
        target: "#authentication",  // DOM element for auth UI
        clientId: import.meta.env.VITE_APPER_PROJECT_ID,
        view: "both",  // Login + Signup views
        onSuccess: handleAuthSuccess,
        onError: handleAuthError,
      });

    } catch (error) {
      console.error('Failed to initialize authentication:', error);
      dispatch(clearUser());
      handleAuthComplete();
    }
  };

  /**
   * Handle successful authentication
   * Called by ApperUI when user logs in
   * @param {object} user - User object from Apper SDK
   */
  const handleAuthSuccess = (user) => {
    if (user) {
      // IMPORTANT: Add roles to user object
      // In production, roles should come from user object itself
      // This is a demo enhancement
      const userWithRole = { ...user, roles: ["admin"] };
      
      // Update Redux state
      dispatch(setUser(userWithRole));
      
      // Handle post-login navigation
      handleNavigation();
    } else {
      // No user returned (edge case)
      dispatch(clearUser());
    }
    
    // Mark auth check as complete
    handleAuthComplete();
  };

  /**
   * Handle authentication error
   * Called by ApperUI when auth fails
   * @param {Error} error - Error object
   */
  const handleAuthError = (error) => {
    console.error("Auth error:", error);
    dispatch(clearUser());
    handleAuthComplete();
  };

  /**
   * Mark authentication initialization as complete
   * Opens the gate for route guards
   */
  const handleAuthComplete = () => {
    setAuthInitialized(true);        // Local state → Remove spinner
    dispatch(setInitialized(true));  // Redux state → Enable route guards
  };

  /**
   * Handle navigation after successful login
   * Redirects to intended destination or home
   */
  const handleNavigation = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get("redirect");

    if (redirectPath) {
      // User was redirected to login, go back to intended page
      navigate(redirectPath);
    } else {
      // Navigate to home only if on auth pages
      const authPages = ["/login", "/signup", "/callback"];
      const isOnAuthPage = authPages.some(page =>
        window.location.pathname.includes(page)
      );
      if (isOnAuthPage) {
        navigate("/");
      }
      // Otherwise stay on current page
    }
  };

  /**
   * Logout functionality
   * Exposed to children via AuthContext
   */
  const logout = async () => {
    try {
      dispatch(clearUser());
      navigate("/login");
      await window.ApperSDK?.ApperUI?.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /**
   * RENDER LOGIC
   */
  
  // GATE 1: Show loading spinner until auth check completes
  if (!authInitialized) {
    return <LoadingSpinner />;
  }

  // GATE OPEN: Render child routes
  return (
    <AuthContext.Provider value={{ logout, isInitialized: authInitialized }}>
      {/* Optional debug banner */}
      <div style={{ background: 'yellow', padding: '4px', fontSize: '12px' }}>
        Auth: {isInitialized ? 'Ready' : 'Loading'} | User: {user ? 'Logged In' : 'Guest'}
      </div>
      
      {/* Child routes render here */}
      <Outlet />
    </AuthContext.Provider>
  );
}
```

### Key Concepts

#### 1. Dual Loading States

```javascript
// LOCAL STATE (Component-level)
const [authInitialized, setAuthInitialized] = useState(false);
// Purpose: Controls spinner visibility
// Why: Immediate UI control without Redux overhead

// REDUX STATE (Application-level)
const { isInitialized } = useSelector(state => state.user);
// Purpose: Gates route access checks
// Why: Shared across all components needing auth status
```

**Why Two States?**

```
Mount → Both false → Show spinner
    ↓
Auth completes
    ↓
setAuthInitialized(true) → Remove spinner (IMMEDIATE)
dispatch(setInitialized(true)) → Enable route guards (via Redux)
    ↓
Both true → Render routes + Check access
```

Without local state:

```javascript
// BAD
if (!isInitialized) return <Spinner />;

// Problem: isInitialized from Redux
// Setting it requires:
// 1. Dispatch action
// 2. Redux update
// 3. Component re-render
// Causes brief flash or delay
```

With local state:

```javascript
// GOOD
if (!authInitialized) return <Spinner />;

// authInitialized is local
// Setting it causes immediate re-render
// No Redux overhead
// Smoother UX
```

#### 2. ApperUI.setup Configuration

```javascript
ApperUI.setup(apperClient, {
  // DOM selector where auth UI renders
  target: "#authentication",
  
  // Your Apper project ID
  clientId: import.meta.env.VITE_APPER_PROJECT_ID,
  
  // UI mode: "login" | "signup" | "both"
  view: "both",
  
  // Success callback - CRITICAL CONNECTION POINT
  onSuccess: handleAuthSuccess,
  
  // Error callback - MUST ALSO COMPLETE INIT
  onError: handleAuthError,
});
```

**Callbacks are how Apper SDK communicates with your app.**

#### 3. The Gate-Keeping Mechanism

```javascript
useEffect(() => {
  // ⛔ GATE CLOSED - Don't run this code
  if (isInitialized) {
    // ✅ GATE OPEN - Safe to check routes
    const config = getRouteConfig(location.pathname);
    const { allowed, redirectTo } = verifyRouteAccess(config, user);
    
    if (!allowed && redirectTo) {
      navigate(redirectTo);
    }
  }
}, [isInitialized, user, location.pathname, location.search, navigate]);
```

**What happens without the gate:**

```
User visits /dashboard (protected)
    ↓
Root mounts, useEffect runs
    ↓
isInitialized = false, user = null
    ↓
Route guard runs: NOT ALLOWED → Redirect to /login
    ↓
Auth check completes: User logged in
    ↓
isInitialized = true, user = {...}
    ↓
Route guard runs: ALLOWED → Redirect to /dashboard
    ↓
Redirect to /dashboard triggers guard again
    ↓
INFINITE LOOP 🔄
```

**With the gate:**

```
User visits /dashboard
    ↓
Root mounts, useEffect runs
    ↓
isInitialized = false → ⛔ GATE CLOSED, skip route check
    ↓
Auth check completes
    ↓
isInitialized = true → ✅ GATE OPENS
    ↓
useEffect runs again (isInitialized changed)
    ↓
Route guard checks ONCE with correct user state
    ↓
Navigate appropriately
```

#### 4. Callback Flow

```javascript
// SEQUENCE OF EVENTS

// 1. ApperUI.setup() called
ApperUI.setup(apperClient, {
  onSuccess: handleAuthSuccess,
  onError: handleAuthError,
});

// 2. User authenticates (or already authenticated)
// → ApperUI calls onSuccess

// 3. handleAuthSuccess executes
const handleAuthSuccess = (user) => {
  // Add roles
  const userWithRole = { ...user, roles: ["admin"] };
  
  // Update Redux (async, but fast)
  dispatch(setUser(userWithRole));
  
  // Navigate if needed
  handleNavigation();
  
  // CRITICAL: Open the gate
  handleAuthComplete();
};

// 4. handleAuthComplete opens gate
const handleAuthComplete = () => {
  setAuthInitialized(true);        // Local → Spinner off
  dispatch(setInitialized(true));  // Redux → Guards on
};

// 5. Component re-renders
// authInitialized = true → Spinner removed
// isInitialized = true → <Outlet /> renders

// 6. useEffect runs again (isInitialized changed)
// Gate open → Route guard activates
```

#### 5. Post-Login Navigation

```javascript
const handleNavigation = () => {
  // Check URL for redirect parameter
  const urlParams = new URLSearchParams(window.location.search);
  const redirectPath = urlParams.get("redirect");

  if (redirectPath) {
    // User was redirected to login from protected page
    // Example: /login?redirect=%2Fdashboard
    // Navigate back to /dashboard
    navigate(redirectPath);
  } else {
    // No redirect parameter
    const authPages = ["/login", "/signup", "/callback"];
    const isOnAuthPage = authPages.some(page =>
      window.location.pathname.includes(page)
    );
    
    if (isOnAuthPage) {
      // User on login page after auth → Go home
      navigate("/");
    }
    // Else: User on regular page → Stay there
  }
};
```

**Example Flows:**

```
Scenario 1: Direct login
  User visits /login
  Logs in
  → handleNavigation()
  → isOnAuthPage = true
  → navigate("/")
  
Scenario 2: Protected page redirect
  User visits /dashboard (not authenticated)
  Root redirects to /login?redirect=%2Fdashboard
  User logs in
  → handleNavigation()
  → redirectPath = "/dashboard"
  → navigate("/dashboard")
  
Scenario 3: Already on public page
  User on /products (public)
  Logs in
  → handleNavigation()
  → isOnAuthPage = false
  → Stay on /products
```


---

## 11.1. Route Guard Deep Dive

### Overview

The route guard `useEffect` is the **most critical piece of code** for enforcing access control in this architecture. It runs on every navigation after authentication completes and determines whether the user can access the requested route.

**This single useEffect is responsible for:**

* Fetching access rules for the current route
* Verifying user permissions
* Redirecting unauthorized users
* Preserving intended destination for post-login navigation

### The Complete Code

```javascript
useEffect(() => {
  // Guard 1: Don't check routes until auth completes
  if (!isInitialized) return;

  // Get access rules for current path
  const config = getRouteConfig(location.pathname);

  // Guard 2: Exit if no config or no allow rules
  if (!config?.allow) return;

  // Verify user has access
  const { allowed, redirectTo, excludeRedirectQuery } = verifyRouteAccess(config, user);

  // Guard 3: Exit if access is allowed or no redirect
  if (allowed || !redirectTo) return;

  // Build redirect URL - add redirect query param unless excluded
  let redirectUrl = redirectTo;
  if (!excludeRedirectQuery) {
    const redirectPath = location.pathname + location.search;
    const separator = redirectTo.includes('?') ? '&' : '?';
    redirectUrl = `${redirectTo}${separator}redirect=${encodeURIComponent(redirectPath)}`;
  }

  navigate(redirectUrl, { replace: true });
}, [isInitialized, user, location.pathname, location.search, navigate]);
```

### Line-by-Line Breakdown

#### Lines 1-2: Early Return Guards

**Guard 1:** `**if (!isInitialized) return;**`

**THE GATE** - This is the critical check that prevents the route guard from running before authentication completes.

**Why this matters:**

* Without this check, the guard runs with `user = null`
* Would redirect to login immediately
* When auth completes and user exists, would redirect back
* Creates infinite redirect loop

**State values:**

* `false` → Early return, skip entire effect (auth still initializing)
* `true` → Auth complete, continue to check route access

**Why early return?**

* Cleaner code - no nested if blocks
* Better readability - guards at the top
* Follows guard pattern best practice

#### Line 4-5: Get Route Configuration

`**const config = getRouteConfig(location.pathname);**`

Fetches access control rules for the current route from `routes.json`.

**What it does:**

```javascript
// location.pathname = "/admin/users"

// Looks up in routes.json:
// 1. Check for exact match: "/admin/users" → not found
// 2. Check patterns: "/admin/*" → match!
// 3. Returns:
{
  "allow": {
    "when": {
      "conditions": [
        {"label": "User must be logged in", "rule": "authenticated"},
        {"label": "Role must be Admin", "rule": "emailAddress == \"admin@example.com\""}
      ],
      "operator": "AND"
    },
    "redirectOnDeny": "/error?message=admin_access_required",
    "excludeRedirectQuery": true
  }
}
```

**From:** `src/router/route.utils.js` → `getRouteConfig()` function

#### Line 7-8: Guard 2 - Config Validation

`**if (!config?.allow) return;**`

**Purpose:** Exit early if route has no access control configured

**Why this guard?**

* Some routes might not be in `routes.json` (returns `null`)
* Allows React Router to handle 404 pages naturally
* Prevents errors from accessing undefined properties

**Optional chaining (**`**?.**`**):**

* Safely checks if `config` exists AND has `allow` property
* Returns `undefined` if chain breaks at any point
* Prevents "Cannot read property of null" errors

#### Line 11: Verify Access with All Return Values

`**const { allowed, redirectTo, excludeRedirectQuery } = verifyRouteAccess(config, user);**`

Evaluates whether the current user meets the access requirements.

**What it does:**

```javascript
// Given:
// config.allow = {
//   when: {
//     conditions: [
//       { rule: "authenticated" },
//       { rule: "emailAddress == \"admin@example.com\"" }
//     ],
//     operator: "AND"
//   },
//   redirectOnDeny: "/error?message=admin_access_required",
//   excludeRedirectQuery: true
// }
// user = { id: 123, emailAddress: "admin@example.com" }

// Process:
// 1. Evaluate "authenticated": user !== null → true ✓
// 2. Evaluate "emailAddress == \"admin@example.com\"": true ✓
// 3. Operator "AND": both true → allowed = true

// Returns:
{
  allowed: true,
  redirectTo: null,
  excludeRedirectQuery: true,
  failed: []
}
```

**If denied:**

```javascript
// user = null (not authenticated)

// Returns:
{
  allowed: false,
  redirectTo: "/error?message=admin_access_required",
  excludeRedirectQuery: true,
  failed: ["User must be logged in"]
}
```

**From:** `src/router/route.utils.js` → `verifyRouteAccess()` function

#### Line 14: Guard 3 - Access Check

`**if (allowed || !redirectTo) return;**`

**Purpose:** Exit early if user has access OR no redirect is needed

**Decision tree:**

* `allowed = true` → Early return, let page render ✓
* `allowed = false` AND `redirectTo = null` → Early return (shouldn't happen)
* `allowed = false` AND `redirectTo = "/login"` → Continue to redirect logic

**Why combined check?**

* Single line instead of nested ifs
* Both conditions result in same action (do nothing)
* More readable and maintainable

#### Lines 17-24: Build Redirect URL

`**let redirectUrl = redirectTo;**`

Start with the base redirect path from config.

**Conditional Redirect Query Parameter:**

```javascript
if (!excludeRedirectQuery) {
  const redirectPath = location.pathname + location.search;
  const separator = redirectTo.includes('?') ? '&' : '?';
  redirectUrl = `${redirectTo}${separator}redirect=${encodeURIComponent(redirectPath)}`;
}
```

**Logic breakdown:**


1. **Check** `**excludeRedirectQuery**` **flag:**
   * If `true` → Skip adding redirect parameter (clean redirect)
   * If `false` → Add redirect parameter (preserve destination)
2. **Capture current location:**

   ```javascript
   const redirectPath = location.pathname + location.search;
   ```

   Examples:
   * `/dashboard` → `/dashboard`
   * `/products?category=electronics` → `/products?category=electronics`
   * `/product/123?variant=blue` → `/product/123?variant=blue`
3. **Smart separator selection:**

   ```javascript
   const separator = redirectTo.includes('?') ? '&' : '?';
   ```
   * If `redirectTo` already has query params → Use `&`
   * If `redirectTo` has no query params → Use `?`

   Examples:
   * `/login` → Use `?` → `/login?redirect=...`
   * `/error?message=admin` → Use `&` → `/error?message=admin&redirect=...`
4. **Build final URL:**

   ```javascript
   redirectUrl = `${redirectTo}${separator}redirect=${encodeURIComponent(redirectPath)}`;
   ```
   * Encodes the redirect path for URL safety
   * Preserves special characters

**Complete examples:**

**Without excludeRedirectQuery (default):**

```javascript
// Scenario 1
redirectTo = "/login"
location.pathname = "/dashboard"
→ redirectUrl = "/login?redirect=%2Fdashboard"

// Scenario 2  
redirectTo = "/error?message=admin_required"
location.pathname = "/admin/users"
→ redirectUrl = "/error?message=admin_required&redirect=%2Fadmin%2Fusers"
```

**With excludeRedirectQuery = true:**

```javascript
// Scenario 1
redirectTo = "/error?message=admin_access_required"
excludeRedirectQuery = true
→ redirectUrl = "/error?message=admin_access_required" (no redirect param)

// Scenario 2
redirectTo = "/login"
excludeRedirectQuery = true  
→ redirectUrl = "/login" (no redirect param)
```

**Why exclude redirect query?**

* **Error pages:** User shouldn't return to inaccessible page
* **Admin areas:** Non-admins shouldn't be redirected back
* **Prevent loops:** Avoid infinite redirect cycles

#### Line 26: `navigate(redirectUrl, { replace: true });`

Performs the actual redirect using the computed URL (either with or without redirect query parameter).

`**redirectUrl**` **value examples:**

```javascript
// With redirect parameter (excludeRedirectQuery = false)
"/login?redirect=%2Fdashboard"

// Without redirect parameter (excludeRedirectQuery = true)
"/error?message=admin_access_required"

// With separator logic (existing query param)
"/error?message=admin_required&redirect=%2Fadmin%2Fusers"
```

`**{ replace: true }**` **option:**

**Why** `**replace: true**`**?**

Without replace (using push):

```
History stack:
1. /dashboard (protected, redirects)
2. /login
[User logs in]
3. /dashboard
[User clicks back button]
→ Goes to /login (still in history)
→ Logged in users shouldn't see login
```

With replace:

```
History stack:
1. /login (replaced /dashboard entry)
[User logs in]
2. /dashboard
[User clicks back button]
→ Goes to previous page before attempting /dashboard
→ Clean history, no login page in stack
```

**replace: true** prevents the unauthorized page from appearing in browser history.

#### Line 11: `}, [isInitialized, user, location.pathname, location.search, navigate]);`

The dependency array - effect re-runs when any of these change.

**Each dependency explained:**

`**isInitialized**` - Auth completion flag

```javascript
// When it changes:
false → true (auth completes)

// Why in array:
Triggers guard to run once auth is ready
```

`**user**` - User object with roles/permissions

```javascript
// When it changes:
null → {...} (login)
{...} → null (logout)
{roles: ["user"]} → {roles: ["user", "admin"]} (role change)

// Why in array:
User permissions changed, need to re-verify access
```

`**location.pathname**` - Current route path

```javascript
// When it changes:
"/dashboard" → "/admin" (navigation)

// Why in array:
Route changed, need to check new route's access rules
```

`**location.search**` - Query parameters

```javascript
// When it changes:
"" → "?tab=settings"

// Why in array:
Must preserve query params in redirect
```

`**navigate**` - Navigation function

```javascript
// Rarely changes, but included for:
- React Hook exhaustive deps rule
- Stability (from useNavigate)
```

### Execution Scenarios

#### Scenario 1: Public Route Access

```javascript
// User state
user = null  // Not logged in

// Navigation
location.pathname = "/"  // Home page

// Execution
→ isInitialized = true ✓
→ getRouteConfig("/")
  Returns: { allow: { conditions: [{ rule: "public" }] } }
→ verifyRouteAccess(config, user)
  Evaluates: rule "public" → always true ✓
  Returns: { allowed: true, redirectTo: null }
→ if (!allowed && redirectTo) → false
→ No redirect, page renders ✓

// Result: Home page displays
```

#### Scenario 2: Protected Route - Not Authenticated

```javascript
// User state
user = null  // Not logged in

// Navigation
location.pathname = "/dashboard"
location.search = "?view=grid"

// Execution
→ isInitialized = true ✓
→ getRouteConfig("/dashboard")
  Returns: { allow: { conditions: [{ rule: "authenticated" }] } }
→ verifyRouteAccess(config, user)
  Evaluates: rule "authenticated" → !!user → false ✗
  Returns: { allowed: false, redirectTo: "/login" }
→ if (!allowed && redirectTo) → true ✓
→ redirectPath = "/dashboard?view=grid"
→ navigate("/login?redirect=%2Fdashboard%3Fview%3Dgrid", { replace: true })

// Result: Redirected to login with preserved destination
```

#### Scenario 3: Protected Route - Authenticated

```javascript
// User state
user = { id: 123, email: "user@example.com", roles: ["user"] }

// Navigation
location.pathname = "/dashboard"

// Execution
→ isInitialized = true ✓
→ getRouteConfig("/dashboard")
  Returns: { allow: { conditions: [{ rule: "authenticated" }] } }
→ verifyRouteAccess(config, user)
  Evaluates: rule "authenticated" → !!user → true ✓
  Returns: { allowed: true, redirectTo: null }
→ if (!allowed && redirectTo) → false
→ No redirect, page renders ✓

// Result: Dashboard displays
```

#### Scenario 4: Admin Route - Insufficient Permissions

```javascript
// User state
user = { id: 123, emailAddress: "user@example.com" }  // Not admin email

// Navigation
location.pathname = "/admin/users"

// Execution
→ isInitialized = true ✓
→ getRouteConfig("/admin/users")
  Pattern matches "/admin/*"
  Returns: {
    allow: {
      when: {
        conditions: [
          { rule: "authenticated" },
          { rule: "emailAddress == \"admin@example.com\"" }
        ],
        operator: "AND"
      },
      redirectOnDeny: "/error?message=admin_access_required"
    }
  }
→ verifyRouteAccess(config, user)
  Evaluates:
    - rule "authenticated" → !!user → true ✓
    - rule "emailAddress == \"admin@example.com\"" → false ✗
  Operator "AND": not all passed → false
  Returns: { allowed: false, redirectTo: "/error?message=admin_access_required" }
→ if (!allowed && redirectTo) → true ✓
→ redirectPath = "/admin/users"
→ navigate("/error?message=admin_access_required&redirect=%2Fadmin%2Fusers", { replace: true })

// Result: Redirected to error page
```

#### Scenario 5: Admin Route - Authorized

```javascript
// User state
user = { id: 123, emailAddress: "admin@example.com" }  // Is admin

// Navigation
location.pathname = "/admin/users"

// Execution
→ isInitialized = true ✓
→ getRouteConfig("/admin/users")
  Returns: {
    allow: {
      when: {
        conditions: [
          { rule: "authenticated" },
          { rule: "emailAddress == \"admin@example.com\"" }
        ],
        operator: "AND"
      },
      redirectOnDeny: "/error?message=admin_access_required"
    }
  }
→ verifyRouteAccess(config, user)
  Evaluates:
    - rule "authenticated" → true ✓
    - rule "emailAddress == \"admin@example.com\"" → true ✓
  Operator "AND": all passed → true
  Returns: { allowed: true, redirectTo: null }
→ if (!allowed && redirectTo) → false
→ No redirect, page renders ✓

// Result: Admin panel displays
```

### Flow Diagram

```
User navigates to route
        ↓
useEffect triggered (dependency changed)
        ↓
    ┌─────────────────┐
    │ isInitialized?  │
    └────┬────────────┘
         │
    ┌────┴─────┐
    │          │
   NO         YES
    │          │
    ↓          ↓
 Skip      Continue
 (gate     (gate
 closed)   open)
            │
            ↓
    ┌───────────────────┐
    │ getRouteConfig()  │
    │ Get access rules  │
    └─────────┬─────────┘
              │
              ↓
    ┌───────────────────────┐
    │ verifyRouteAccess()   │
    │ Check user vs rules   │
    └─────────┬─────────────┘
              │
              ↓
         { allowed, redirectTo }
              │
         ┌────┴─────┐
         │          │
      allowed    !allowed
         │          │
         ↓          ↓
    Render     redirectTo?
    page           │
              ┌────┴─────┐
              │          │
             YES         NO
              │          │
              ↓          ↓
         Navigate    Do nothing
         with         (edge case)
         redirect
         preserved
```

### Why This Pattern Works

**1. Gate-Keeping Prevents Loops**

```javascript
// Without gate:
mount → check access with user=null → redirect to login
auth completes → user exists → check access → redirect to page
navigation → check access → ...LOOP

// With gate:
mount → isInitialized=false → skip check
auth completes → isInitialized=true → check ONCE with correct user
```

**2. Runs on Every Navigation**

```javascript
// Dependencies include location.pathname
// Every route change triggers re-check
"/home" → "/dashboard" → useEffect runs → verify "/dashboard" access
```

**3. Responds to Auth Changes**

```javascript
// Dependencies include user
// Login/logout triggers re-check
user: null → {...} → useEffect runs → re-verify current route
```

**4. Preserves User Intent**

```javascript
// Captures full path with query params
// After login, can return to exact state
User visits: /products?category=electronics&page=2
Redirects: /login?redirect=%2Fproducts%3Fcategory%3Delectronics%26page%3D2
After login: Navigate to /products?category=electronics&page=2
```

**5. Clean History Management**

```javascript
// replace: true removes unauthorized attempts
// Back button doesn't return to blocked pages
// Better UX
```

### Common Mistakes to Avoid

**❌ Forgetting the isInitialized check:**

```javascript
useEffect(() => {
  // Runs immediately with user=null
  const { allowed } = verifyRouteAccess(config, user);
  // Always fails for protected routes
  // Infinite loops possible
}, [user, location]);
```

**❌ Not preserving query parameters:**

```javascript
// Only captures pathname
const redirectPath = location.pathname;
// Loses ?tab=settings&view=grid
```

**❌ Not encoding redirect parameter:**

```javascript
navigate(`${redirectTo}?redirect=${redirectPath}`);
// Breaks with special characters in redirectPath
```

**❌ Not using replace:**

```javascript
navigate(`${redirectTo}?redirect=...`);
// Unauthorized page stays in history
// Back button returns to blocked page
```

**❌ Missing dependencies:**

```javascript
}, [isInitialized, user]);
// Doesn't re-run on navigation
// Access check only happens once
```

### Integration with Other Components

**Works with** `**routes.json**`**:**

```javascript
getRouteConfig(location.pathname)
  ↓
Reads from routes.json
  ↓
Returns access rules
```

**Works with** `**route.utils.js**`**:**

```javascript
verifyRouteAccess(config, user)
  ↓
Evaluates rules against user
  ↓
Returns allowed/denied
```

**Works with** `**userSlice.js**`**:**

```javascript
const { user } = useSelector(state => state.user)
  ↓
Gets current user from Redux
  ↓
Passed to verifyRouteAccess
```

**Works with React Router:**

```javascript
const navigate = useNavigate();
const location = useLocation();
  ↓
Hooks from react-router-dom
  ↓
Used for navigation and route detection
```


---

## 12. Complete Integration Flow

### Initialization Sequence Diagram

```
┌─────────┐  ┌─────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐
│ Browser │  │ index   │  │ apperClient  │  │ Root.jsx   │  │ userSlice│
│         │  │ .html   │  │ .js          │  │            │  │ .js      │
└────┬────┘  └────┬────┘  └──────┬───────┘  └─────┬──────┘  └─────┬────┘
     │            │                │                │               │
     │ Load HTML  │                │                │               │
     ├───────────>│                │                │               │
     │            │                │                │               │
     │            │ Load SDK Script│                │               │
     │            ├──────────────> │                │               │
     │            │                │                │               │
     │            │ window.ApperSDK│                │               │
     │            │ Available      │                │               │
     │            │<────────────── │                │               │
     │            │                │                │               │
     │ React App Starts            │                │               │
     ├───────────────────────────────────────────>  │               │
     │            │                │                │               │
     │            │                │ useEffect()    │               │
     │            │                │ initializeAuth()               │
     │            │                │                │               │
     │            │                │ getApperClient()               │
     │            │                ├──────────────> │               │
     │            │                │                │               │
     │            │                │Return singleton│              │
     │            │                │  <─────────────┤               │
     │            │                │                │               │
     │            │                │ ApperUI.setup()│               │
     │            │                │ with callbacks │               │
     │            │                │                │               │
     │            │                │ Show <LoadingSpinner />        │
     │            │                │                │               │
     │            │                │ [Auth Check]   │               │
     │            │                │ ...waiting...  │               │
     │            │                │                │               │
     │            │                │ onSuccess(user)│               │
     │            │                │                │               │
     │            │                │ dispatch(setUser(user))        │
     │            │                │                ├──────────────>│
     │            │                │                │               │
     │            │                │                │ Redux Update  │
     │            │                │                │ user = {...}  │
     │            │                │                │ isAuth = true │
     │            │                │                │               │
     │            │                │ dispatch(setInitialized(true)) │
     │            │                │                ├──────────────>│
     │            │                │                │               │
     │            │                │                │ Redux Update  │
     │            │                │                │ isInit = true │
     │            │                │                │               │
     │            │                │ setAuthInitialized(true)       │
     │            │                │                │               │
     │            │                │ Remove <LoadingSpinner />      │
     │            │                │ Render <Outlet />              │
     │            │                │                │               │
     │            │                │ useEffect triggers             │
     │            │                │ (isInitialized changed)        │
     │            │                │                │               │
     │            │                │ Route Guard    │               │
     │            │                │ getRouteConfig()               │
     │            │                │ verifyAccess() │               │
     │            │                │                │               │
     │            │                │ Access allowed │               │
     │            │                │ → Render page  │               │
     │            │                │                │               │
```

### State Machine Diagram

```
┌────────────────────────────────────────────────────────────┐
│                    Authentication States                   │
└────────────────────────────────────────────────────────────┘

     ┌─────────────────────────────────────────┐
     │         UNINITIALIZED                   │
     │  authInitialized: false                 │
     │  isInitialized: false                   │
     │  user: null                             │
     │                                         │
     │  UI: <LoadingSpinner />                 │
     │  Route Guards: INACTIVE                 │
     └──────────────────┬──────────────────────┘
                        │
                        │ initializeAuth()
                        │ ApperUI.setup()
                        ↓
     ┌─────────────────────────────────────────┐
     │         INITIALIZING                    │
     │  authInitialized: false                 │
     │  isInitialized: false                   │
     │  user: null                             │
     │                                         │
     │  UI: <LoadingSpinner />                 │
     │  Route Guards: INACTIVE                 │
     │  Status: Waiting for auth check...      │
     └──────────────────┬──────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
    onSuccess(user)              onError(error)
          │                           │
          ↓                           ↓
     ┌─────────────────┐     ┌────────────────────┐
     │  AUTHENTICATED  │     │  UNAUTHENTICATED   │
     │  authInit: true │     │  authInit: true    │
     │  isInit: true   │     │  isInit: true      │
     │  user: {...}    │     │  user: null        │
     │                 │     │                    │
     │  UI: <Outlet /> │     │  UI: <Outlet />    │
     │  Guards: ACTIVE │     │  Guards: ACTIVE    │
     └────────┬────────┘     └──────────┬─────────┘
              │                         │
              │                         │
              │ logout()                │
              └─────────────────────────┤
                                        │
                                        ↓
                              ┌──────────────────┐
                              │  LOGGED OUT      │
                              │  user: null      │
                              │  isAuth: false   │
                              │  isInit: true    │
                              │                  │
                              │  Navigate: /login│
                              └──────────────────┘
```

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      DATA FLOW THROUGH SYSTEM                     │
└──────────────────────────────────────────────────────────────────┘

   window.ApperSDK (Global)
         ↓
   ┌────────────────────┐
   │  apperClient.js    │──── Wraps SDK
   │  Singleton Pattern │
   └─────────┬──────────┘
             │ returns client
             ↓
   ┌────────────────────┐
   │    Root.jsx        │
   │  ┌──────────────┐  │
   │  │initializeAuth│  │
   │  └──────┬───────┘  │
   │         │          │
   │         ↓          │
   │  ApperUI.setup()  │
   │    with callbacks  │
   │         │          │
   │         ↓          │
   │  ┌──────────────┐  │
   │  │ Callbacks    │  │──── Connect SDK to Redux
   │  │ onSuccess    │  │
   │  │ onError      │  │
   │  └──────┬───────┘  │
   │         │          │
   │         ↓          │
   │  dispatch(action) │
   └─────────┬──────────┘
             │
             ↓
   ┌────────────────────┐
   │   userSlice.js     │
   │                    │
   │  State Update:     │
   │  ├─ user           │──── Data storage
   │  ├─ isAuthenticated│──── Quick check
   │  └─ isInitialized  │──── Gate key
   └─────────┬──────────┘
             │
             │ useSelector()
             ↓
   ┌────────────────────┐
   │    Root.jsx        │
   │  ┌──────────────┐  │
   │  │useEffect()   │  │
   │  │Route Guard   │  │
   │  └──────┬───────┘  │
   │         │          │
   │         ↓          │
   │  if (isInitialized)│──── Gate check
   │         │          │
   │         ↓          │
   │  getRouteConfig() │──── From routes.json
   │  verifyAccess()   │──── Check user permissions
   │         │          │
   │         ↓          │
   │  Allow/Redirect   │
   │         │          │
   │         ↓          │
   │  <Outlet />       │──── Render route
   └───────────────────┘
             │
             ↓
        Page Component
```

### Component Relationship Diagram

```
┌────────────────────────────────────────────────────────────┐
│                 FILE DEPENDENCIES                          │
└────────────────────────────────────────────────────────────┘

                    index.html
                        │
                        │ loads
                        ↓
                 window.ApperSDK
                        │
                        │ wrapped by
                        ↓
              ┌─────────────────────┐
              │ apperClient.js      │
              │ (Singleton)         │
              └──────────┬──────────┘
                         │
                         │ imported by
                         ↓
              ┌─────────────────────┐
              │   Root.jsx          │
              │   (Orchestrator)    │
              └──┬─────────────┬────┘
                 │             │
     imports     │             │ imports
                 │             │
                 ↓             ↓
      ┌──────────────┐  ┌──────────────┐
      │ userSlice.js │  │ route.utils  │
      │ (State)      │  │ (Access)     │
      └──────┬───────┘  └──────┬───────┘
             │                 │
             │ imports         │ imports
             │                 │
             ↓                 ↓
      ┌────────────────────────────┐
      │      routes.json           │
      │  (Access Configuration)    │
      └────────────────────────────┘

USAGE FLOW:
1. Root.jsx calls getApperClient()
2. Root.jsx dispatches to userSlice
3. Root.jsx uses route.utils to check access
4. route.utils reads from routes.json
5. userSlice updates trigger Root.jsx effects
```


---

## 13. The Gate-Keeping Mechanism

### Problem Statement

Without proper gating, this happens:

```javascript
// Component mounts
useEffect(() => {
  // user is null (auth not complete)
  const { allowed } = verifyRouteAccess(config, user);
  
  if (!allowed) {
    // Redirect to /login
    navigate("/login");
  }
}, [user, location]);

// Later, auth completes
// user is now {...}

// Effect runs again
// user has value (authenticated)
// navigate back to protected page

// This triggers the effect AGAIN
// INFINITE LOOP
```

### Solution: Dual Gates

```javascript
// GATE 1: UI Rendering Gate (Component Level)
const [authInitialized, setAuthInitialized] = useState(false);

if (!authInitialized) {
  return <LoadingSpinner />;
}

// GATE 2: Route Guard Gate (Logic Level)
useEffect(() => {
  if (isInitialized) {  // Only run when auth complete
    // Check route access
  }
}, [isInitialized, user, location]);
```

### Detailed Flow

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1: MOUNTING (Both gates closed)                      │
└──────────────────────────────────────────────────────────────┘

Root mounts
  ├─ authInitialized = false → Show <LoadingSpinner />
  ├─ isInitialized = false → Route guard inactive
  └─ initializeAuth() called

┌──────────────────────────────────────────────────────────────┐
│  PHASE 2: INITIALIZING (Both gates closed)                  │
└──────────────────────────────────────────────────────────────┘

ApperUI.setup() with callbacks
  └─ Waiting for auth check...
  └─ User sees spinner
  └─ Route guard still inactive (isInitialized = false)

┌──────────────────────────────────────────────────────────────┐
│  PHASE 3: AUTH COMPLETE (Opening gates)                     │
└──────────────────────────────────────────────────────────────┘

onSuccess(user) or onError(error) callback fires
  │
  ├─ dispatch(setUser(user))
  │  └─ Redux updates user state
  │
  ├─ handleAuthComplete()
  │  ├─ setAuthInitialized(true)  → GATE 1 OPENS
  │  │  └─ Component re-renders
  │  │     └─ Spinner removed
  │  │        └─ <Outlet /> renders
  │  │
  │  └─ dispatch(setInitialized(true))  → GATE 2 OPENS
  │     └─ Redux updates isInitialized
  │        └─ useEffect dependency changes
  │           └─ useEffect runs

┌──────────────────────────────────────────────────────────────┐
│  PHASE 4: ROUTE GUARD ACTIVE (Both gates open)              │
└──────────────────────────────────────────────────────────────┘

useEffect() runs (isInitialized = true)
  │
  ├─ getRouteConfig(location.pathname)
  ├─ verifyRouteAccess(config, user)
  │  └─ Check if user.roles includes required roles
  │     └─ Check if plan matches
  │        └─ Evaluate all conditions
  │
  └─ Decision:
     ├─ ALLOWED → Render page
     └─ DENIED → navigate(redirectTo)
```

### Code Walkthrough

```javascript
// ROOT COMPONENT

function Root() {
  // LOCAL STATE - Controls UI
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // REDUX STATE - Controls logic
  const { isInitialized, user } = useSelector(state => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // EFFECT 1: Initialize (runs once)
  useEffect(() => {
    initializeAuth();
  }, []);

  // EFFECT 2: Route Guard (runs on navigation)
  useEffect(() => {
    // 🔒 GATE 2: Check isInitialized
    if (isInitialized) {
      // ✅ Auth complete, safe to check routes
      
      const config = getRouteConfig(location.pathname);
      const { allowed, redirectTo } = verifyRouteAccess(config, user);
      
      if (!allowed && redirectTo) {
        const redirectPath = location.pathname + location.search;
        navigate(
          `${redirectTo}?redirect=${encodeURIComponent(redirectPath)}`,
          { replace: true }
        );
      }
    } else {
      // ⛔ Auth not complete, skip route check
      // This prevents:
      // - Checking routes with null user
      // - Premature redirects
      // - Infinite loops
    }
  }, [isInitialized, user, location.pathname, location.search, navigate]);

  const initializeAuth = async () => {
    const apperClient = await getApperClient();
    
    if (!apperClient || !window.ApperSDK) {
      // SDK failed to load
      dispatch(clearUser());
      handleAuthComplete(); // Still open gates
      return;
    }

    const { ApperUI } = window.ApperSDK;
    
    ApperUI.setup(apperClient, {
      target: "#authentication",
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: "both",
      onSuccess: handleAuthSuccess,
      onError: handleAuthError,
    });
  };

  const handleAuthSuccess = (user) => {
    if (user) {
      const userWithRole = { ...user, roles: ["admin"] };
      dispatch(setUser(userWithRole));  // Update Redux
      handleNavigation();
    } else {
      dispatch(clearUser());
    }
    handleAuthComplete(); // Open gates
  };

  const handleAuthError = (error) => {
    console.error("Auth error:", error);
    dispatch(clearUser());
    handleAuthComplete(); // Still open gates (important!)
  };

  const handleAuthComplete = () => {
    // Open BOTH gates
    setAuthInitialized(true);        // Local → Remove spinner
    dispatch(setInitialized(true));  // Redux → Enable guards
  };

  // 🔒 GATE 1: Check authInitialized
  if (!authInitialized) {
    return <LoadingSpinner />;
  }

  // ✅ Both gates open, render app
  return (
    <AuthContext.Provider value={{ logout, isInitialized: authInitialized }}>
      <Outlet />
    </AuthContext.Provider>
  );
}
```

### Why Both Gates Are Necessary

**GATE 1 (authInitialized) - UI Gate:**

* Prevents rendering `<Outlet />` before auth check
* Shows loading spinner
* Prevents flash of content
* Local state for immediate control

**GATE 2 (isInitialized) - Logic Gate:**

* Prevents route guards from running prematurely
* Waits for user state to be correct
* Prevents infinite redirect loops
* Redux state for app-wide awareness

**Example of what happens without GATE 2:**

```javascript
// WITHOUT GATE 2
useEffect(() => {
  // This runs immediately when component mounts
  const { allowed } = verifyRouteAccess(config, user);
  // user is null → not allowed → redirect to /login
  navigate("/login");
}, [user, location]);

// Auth completes
// dispatch(setUser({...}))
// user is now {...}

// Effect runs again (user changed)
// user has value → allowed → navigate back
navigate("/dashboard");

// This triggers the effect AGAIN
// LOOP CONTINUES
```

**WITH GATE 2:**

```javascript
useEffect(() => {
  if (isInitialized) {  // ⛔ Gate closed until auth completes
    const { allowed } = verifyRouteAccess(config, user);
    if (!allowed) {
      navigate("/login");
    }
  }
}, [isInitialized, user, location]);

// Effect runs on mount → isInitialized = false → Skip
// Auth completes → isInitialized = true → Effect runs ONCE with correct user
// No loop
```


---

## 14. Common Patterns

### Pattern 1: Reading User from Redux

```javascript
import { useSelector } from 'react-redux';

function ProfileComponent() {
  // Get all auth state
  const { user, isAuthenticated, isInitialized } = useSelector(
    state => state.user
  );
  
  // Show loading until auth check completes
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  
  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return <div>Please <Link to="/login">log in</Link></div>;
  }
  
  // Render user content
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles.join(", ")}</p>
    </div>
  );
}
```

### Pattern 2: Using Logout Function

```javascript
import { useAuth } from "@/layouts/Root";

function Header() {
  const { logout, isInitialized } = useAuth();
  const { user, isAuthenticated } = useSelector(state => state.user);
  
  const handleLogout = async () => {
    await logout();
    // User is redirected to /login automatically
  };
  
  if (!isInitialized) {
    return null; // Don't show header until auth ready
  }
  
  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>{user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </header>
  );
}
```

### Pattern 3: Conditional Rendering Based on Roles

```javascript
import { useSelector } from 'react-redux';

function AdminPanel() {
  const { user, isAuthenticated } = useSelector(state => state.user);
  
  // Check if user has admin role
  const isAdmin = user?.roles?.includes("admin");
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <div>Access Denied: Admin privileges required</div>;
  }
  
  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin-only content */}
    </div>
  );
}
```

### Pattern 4: Adding New Routes

```javascript
// 1. Add to routes.json
{
  "/settings": {
    "allow": {
      "conditions": [
        {"label": "User must be logged in", "rule": "authenticated"}
      ]
    }
  }
}

// 2. Create component
const Settings = lazy(() => import("@/components/pages/Settings"));

// 3. Add to router/index.jsx
const mainRoutes = [
  {
    path: "",
    element: <Layout />,
    children: [
      // ... other routes
      createRoute({
        path: "settings",
        element: <Settings />
      })
    ]
  }
];
```

### Pattern 5: Nested Routes with Layout

```javascript
// Route definition
createRoute({
  path: "dashboard",
  element: <DashboardLayout />,
  children: [
    createRoute({
      index: true,
      element: <DashboardOverview />
    }),
    createRoute({
      path: "analytics",
      element: <Analytics />
    }),
    createRoute({
      path: "reports",
      element: <Reports />
    })
  ]
})

// DashboardLayout.jsx
function DashboardLayout() {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <Outlet />  {/* Child routes render here */}
      </main>
    </div>
  );
}

// URLs:
// /dashboard → <DashboardLayout><DashboardOverview /></DashboardLayout>
// /dashboard/analytics → <DashboardLayout><Analytics /></DashboardLayout>
// /dashboard/reports → <DashboardLayout><Reports /></DashboardLayout>
```

### Pattern 6: Protected Route Wrapper

```javascript
// Create wrapper component
function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated, isInitialized } = useSelector(
    state => state.user
  );
  
  if (!isInitialized) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return <Navigate to="/error?message=insufficient_permissions" />;
  }
  
  return children;
}

// Usage in routes
createRoute({
  path: "admin",
  element: (
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  )
})
```


---

## 15. Common Pitfalls

### Pitfall 1: Checking Routes Before isInitialized

**Problem:**

```javascript
// ❌ BAD
useEffect(() => {
  // Runs immediately, user is still null
  const { allowed } = verifyRouteAccess(config, user);
  if (!allowed) {
    navigate("/login"); // Premature redirect
  }
}, [user, location]);
```

**Solution:**

```javascript
// ✅ GOOD
useEffect(() => {
  if (isInitialized) {  // Wait for auth check
    const { allowed } = verifyRouteAccess(config, user);
    if (!allowed) {
      navigate("/login");
    }
  }
}, [isInitialized, user, location]);
```

### Pitfall 2: Not Setting isInitialized in Error Case

**Problem:**

```javascript
// ❌ BAD
const handleAuthError = (error) => {
  console.error("Auth error:", error);
  dispatch(clearUser());
  // Forgot to call handleAuthComplete()
  // isInitialized stays false forever
  // App stuck on loading spinner
};
```

**Solution:**

```javascript
// ✅ GOOD
const handleAuthError = (error) => {
  console.error("Auth error:", error);
  dispatch(clearUser());
  handleAuthComplete(); // Always set initialized
};
```

### Pitfall 3: Creating Multiple ApperClient Instances

**Problem:**

```javascript
// ❌ BAD
import { ApperClient } from 'window.ApperSDK';

function Component() {
  // Creates new instance every render
  const client = new ApperClient({
    apperProjectId: "..."
  });
}
```

**Solution:**

```javascript
// ✅ GOOD
import { getApperClient } from '@/services/apperClient';

function Component() {
  // Gets singleton instance
  const client = getApperClient();
}
```

### Pitfall 4: Not Deep Cloning in Redux

**Problem:**

```javascript
// ❌ BAD
setUser: (state, action) => {
  state.user = action.payload; // Reference
  // Mutations to original object affect Redux
};
```

**Solution:**

```javascript
// ✅ GOOD
setUser: (state, action) => {
  state.user = JSON.parse(JSON.stringify(action.payload));
  // Deep clone prevents mutations
};
```

### Pitfall 5: Forgetting Outlet in Parent Routes

**Problem:**

```javascript
// ❌ BAD
function Layout() {
  return (
    <div>
      <Header />
      <main>
        {/* Forgot <Outlet /> */}
      </main>
    </div>
  );
}

// Child routes never render
```

**Solution:**

```javascript
// ✅ GOOD
function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />  {/* Child routes render here */}
      </main>
    </div>
  );
}
```

### Pitfall 6: Missing Suspense for Lazy Components

**Problem:**

```javascript
// ❌ BAD
const Home = lazy(() => import("./Home"));

{
  path: "/",
  element: <Home />  // No Suspense wrapper
}
// Error: A component suspended while responding to synchronous input
```

**Solution:**

```javascript
// ✅ GOOD
const Home = lazy(() => import("./Home"));

{
  path: "/",
  element: (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  )
}

// OR use createRoute() helper (adds Suspense automatically)
createRoute({
  path: "/",
  element: <Home />
})
```

### Pitfall 7: Incorrect Index Route Usage

**Problem:**

```javascript
// ❌ BAD
{
  path: "/dashboard",
  element: <DashboardLayout />,
  children: [
    { path: "/", element: <Overview /> }  // Wrong
  ]
}
```

**Solution:**

```javascript
// ✅ GOOD
{
  path: "/dashboard",
  element: <DashboardLayout />,
  children: [
    { index: true, element: <Overview /> }  // Correct
  ]
}
```

### Pitfall 8: Not Preserving Redirect in Login

**Problem:**

```javascript
// ❌ BAD
useEffect(() => {
  if (!allowed) {
    // Lost where user was trying to go
    navigate("/login");
  }
}, [allowed]);
```

**Solution:**

```javascript
// ✅ GOOD
useEffect(() => {
  if (!allowed && redirectTo) {
    const redirectPath = location.pathname + location.search;
    navigate(
      `${redirectTo}?redirect=${encodeURIComponent(redirectPath)}`,
      { replace: true }
    );
  }
}, [allowed, redirectTo, location]);
```


---

## 16. Technical Q&A

### Q1: Why singleton for apperClient?

**A:** Multiple instances cause:

* Duplicate auth checks
* Conflicting state
* Race conditions
* Performance issues

Singleton ensures one source of truth.

### Q2: When does the route guard actually run?

**A:** The route guard runs:


1. After `isInitialized` becomes true
2. On every navigation (location.pathname changes)
3. When user state changes (login/logout)

It does NOT run:

* Before authentication completes
* During initial mount (until initialized)

### Q3: What if Apper SDK fails to load?

**A:** The system handles this gracefully:

```javascript
const apperClient = await getApperClient();

if (!apperClient || !window.ApperSDK) {
  // SDK not loaded
  console.error('Failed to initialize ApperSDK');
  dispatch(clearUser());  // Set user to null
  handleAuthComplete();   // Still open gates
  return;
}

// Gate opens, app renders
// User sees login page or public content
// No crash
```

### Q4: How do I add custom access rules?

**A:** Extend `evaluateRule` function in `route.utils.js`:

```javascript
function evaluateRule(rule, user) {
  // Existing rules
  if (rule === "public") return true;
  if (rule === "authenticated") return !!user;
  
  // Add custom rule
  if (rule.startsWith("team:")) {
    const teamName = rule.split(":")[1];
    return user?.teams?.includes(teamName);
  }
  
  // Use in routes.json:
  // "rule": "team:engineering"
}
```


---

## Quick Reference Card

### File Purposes

| File | Purpose | Key Exports |
|----|----|----|
| `apperClient.js` | SDK wrapper singleton | `getApperClient()` |
| `userSlice.js` | Redux auth state | `setUser`, `clearUser`, `setInitialized` |
| `Root.jsx` | Auth orchestrator & route guard | `useAuth` hook |
| `route.utils.js` | Access verification | `getRouteConfig`, `verifyRouteAccess` |
| `routes.json` | Access rules | N/A (data file) |
| `router/index.jsx` | Route definitions | `router` |

### State Properties

| Property | Type | Purpose |
|----|----|----|
| `user` | object\|null | User data with roles |
| `isAuthenticated` | boolean | Has user? |
| `isInitialized` | boolean | Auth check complete? (GATE KEY) |
| `authInitialized` | boolean | Local UI state |

### Route Properties

| Property | Type | Purpose |
|----|----|----|
| `path` | string | URL pattern |
| `index` | boolean | Index route (no path) |
| `element` | ReactNode | Component to render |
| `children` | array | Nested routes |
| `handle` | object | Custom metadata |

### Key Concepts

* **Singleton Pattern**: One ApperClient instance
* **Dual Gates**: authInitialized (UI) + isInitialized (logic)
* **Gate-Keeping**: Don't check routes until auth completes
* **Deep Clone**: Prevent Redux mutation issues
* **Lazy Loading**: Code splitting for performance
* **Outlet**: Renders child routes


---

**End of Technical Integration Guide**

This document provides complete technical understanding of React Router v6 with Apper SDK integration. For implementation examples, see `ROUTING_TEMPLATE_QUICK_REF.md`. For AI training, see `AI_MASTER_PROMPT.md`.