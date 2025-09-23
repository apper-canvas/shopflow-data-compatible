import { lazy } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { createRoute } from "../utils/createRoute";

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

export const mainRoutes = [
  {
    path: "",
    element: <Layout />, // Layout becomes the parent route
    children: [
      createRoute({
        index: true, // This means it's the default child route for "/"
        element: <Home />,
        // Uses config: access: "public", title: "Home"
      }),
      createRoute({
        path: "product/:id",
        element: <ProductDetail />,
        // Uses config: access: "public", title: "Product Detail"
      }),
      createRoute({
        path: "category/:category",
        element: <Category />,
        // Uses config: access: "public", title: "Category"
      }),
      createRoute({
        path: "search",
        element: <SearchResults />,
        // Uses config: access: "authenticated", title: "Search Results"
      }),
      createRoute({
        path: "wishlist",
        element: <Wishlist />,
        // Uses config: access: "authenticated", title: "Wishlist"
      }),
      createRoute({
        path: "deals",
        element: <Deals />,
        // Uses config: access: "authenticated", title: "Deals"
      }),
      createRoute({
        path: "orders",
        element: <Orders />,
        // Uses config: access: "authenticated", title: "Orders"
      }),
      // Checkout routes under Layout
      createRoute({
        path: "checkout",
        element: <CheckoutLayout />,
        // Uses config: access: "authenticated", title: "Checkout"
        children: [
          createRoute({
            index: true,
            element: <Navigate to="cart-review" replace />,
            access: "authenticated", // Explicit override for redirect
          }),
          createRoute({
            path: "cart-review",
            element: <CartReview />,
            // Uses config: access: "authenticated" from "/checkout/*" pattern
          }),
          createRoute({
            path: "shipping",
            element: <ShippingInfo />,
            // Uses config: access: "authenticated" from "/checkout/*" pattern
          }),
        ],
      }),
      createRoute({
        path: "admin",
        element: <Outlet />,
        // Uses config: access: "authenticated", title: "Checkout"
        children: [
          createRoute({
            index: true,
            element: <Navigate to="manage-orders" replace />
          }),
          createRoute({
            path: "manage-orders",
            element: <ManageOrders />,
            // Uses config: access: "authenticated" from "/checkout/*" pattern
          }),
        ]
      })
    ],
  },
];
