import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { getRouteConfig } from "./route.utils";

import Root from "@/layouts/Root";

// Lazy loaded components
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const Error = lazy(() => import("@/components/pages/ErrorPage"));
const NotFound = lazy(() => import("@/components/pages/NotFoundPage"));

const Layout = lazy(() => import("@/components/organisms/Layout"));
const Home = lazy(() => import("@/components/pages/Homepage"));
const ProductDetail = lazy(() => import("@/components/pages/ProductDetail"));
const Category = lazy(() => import("@/components/pages/CategoryPage"));
const SearchResults = lazy(() => import("@/components/pages/SearchResults"));
const Wishlist = lazy(() => import("@/components/pages/WishlistPage"));
const Deals = lazy(() => import("@/components/pages/DealsPage"));
const Orders = lazy(() => import("@/components/pages/OrdersPage"));
const ExternalUserPage = lazy(() => import("@/components/pages/ExternalUserPage"));

// Checkout components
const CheckoutLayout = lazy(() => import("@/components/pages/CheckoutLayout"));
const CartReview = lazy(() => import("@/components/pages/CartReview"));
const ShippingInfo = lazy(() => import("@/components/pages/ShippingInfo"));
const ManageOrders = lazy(() => import("@/components/pages/ManageOrders"));

// Route builder utility
const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  // Get config for this route
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config.allow;

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<div>Loading.....</div>}>{element}</Suspense> : element,
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

const authRoutes = [
  createRoute({
    path: "login",
    element: <Login />,
  }),
  createRoute({
    path: "signup",
    element: <Signup />,
  }),
  createRoute({
    path: "callback",
    element: <Callback />,
  }),
  createRoute({
    path: "error",
    element: <Error />,
  }),
];

const mainRoutes = [
  {
    path: "",
    element: <Layout />,
    children: [
      createRoute({
        index: true,
        element: <Home />,
      }),
      createRoute({
        path: "product/:id",
        element: <ProductDetail />,
      }),
      createRoute({
        path: "category/:category",
        element: <Category />,
      }),
      createRoute({
        path: "search",
        element: <SearchResults />,
      }),
      createRoute({
        path: "wishlist",
        element: <Wishlist />,
      }),
      createRoute({
        path: "deals",
        element: <Deals />,
      }),
      createRoute({
        path: "orders",
        element: <Orders />,
      }),
      createRoute({
        path: "external",
        element: <ExternalUserPage />,
      }),
      // Checkout routes
      createRoute({
        path: "checkout",
        element: <CheckoutLayout />,
        children: [
          createRoute({
            index: true,
            element: <Navigate to="cart-review" replace />,
            access: "authenticated",
          }),
          createRoute({
            path: "cart-review",
            element: <CartReview />,
          }),
          createRoute({
            path: "shipping",
            element: <ShippingInfo />,
          }),
          createRoute({
            path: ":id",
            element: (
              <div>
                Order Detail for ID: <span style={{ color: "blue" }}>{'{'}window.location.pathname.split('/').pop(){'}'}</span>
                <Outlet />
              </div>
            ),
            children: [
              createRoute({
                path: "summary",
                element: (
                  <div>
                    <strong>Order Summary Nested Route</strong>
                  </div>
                ),
              }),
            ],
          }),
        ],
      }),
      // Admin routes
      createRoute({
        path: "admin",
        element: <Outlet />,
        children: [
          createRoute({
            index: true,
            element: <Navigate to="manage-orders" replace />
          }),
          createRoute({
            path: "manage-orders",
            element: <ManageOrders />,
          }),
        ]
      })
    ],
  },
];

const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      ...authRoutes,
      ...mainRoutes,
      // Catch-all route for 404 Not Found
      createRoute({
        path: "*",
        element: <NotFound />,
      }),
    ],
  },
];

export const router = createBrowserRouter(routes);