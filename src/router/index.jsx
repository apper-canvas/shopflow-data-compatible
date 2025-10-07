import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { getRouteConfig } from "./route.utils";

import Root from "@/layouts/Root";

// Lazy loaded components
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const Error = lazy(() => import("@/components/pages/ErrorPage"));

const Layout = lazy(() => import("@/components/organisms/Layout"));
const Home = lazy(() => import("@/components/pages/Homepage"));
const ProductDetail = lazy(() => import("@/components/pages/ProductDetail"));
const Category = lazy(() => import("@/components/pages/CategoryPage"));
const SearchResults = lazy(() => import("@/components/pages/SearchResults"));
const Wishlist = lazy(() => import("@/components/pages/WishlistPage"));
const Deals = lazy(() => import("@/components/pages/DealsPage"));
const Orders = lazy(() => import("@/components/pages/OrdersPage"));

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
  const finalAccess = access || config.access;

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
      ...mainRoutes
    ],
  },
];

export const router = createBrowserRouter(routes);