import { lazy } from "react";
import { createRoute } from "../utils/createRoute";

const Layout = lazy(() => import("@/components/organisms/Layout"));
const Home = lazy(() => import("@/components/pages/Homepage"));
const ProductDetail = lazy(() => import("@/components/pages/ProductDetail"));
const Category = lazy(() => import("@/components/pages/CategoryPage"));
const SearchResults = lazy(() => import("@/components/pages/SearchResults"));
const Wishlist = lazy(() => import("@/components/pages/WishlistPage"));
const Deals = lazy(() => import("@/components/pages/DealsPage"));
const Orders = lazy(() => import("@/components/pages/OrdersPage"));

export const productRoutes = [
  {
    path: "/",
    element: <Layout />, // Layout becomes the parent route
    children: [
      createRoute({
        index: true, // This means it's the default child route for "/"
        element: <Home />,
        title: "Home",
        requiresAuth: false,
      }),
      createRoute({
        path: "product/:id",
        element: <ProductDetail />,
        title: "Product Detail",
        requiresAuth: true,
      }),
      createRoute({
        path: "category/:category",
        element: <Category />,
        title: "Category",
        requiresAuth: true,
      }),
      createRoute({
        path: "search",
        element: <SearchResults />,
        title: "Search Results",
        requiresAuth: true,
      }),
      createRoute({
        path: "wishlist",
        element: <Wishlist />,
        title: "Wishlist",
        requiresAuth: true,
      }),
      createRoute({
        path: "deals",
        element: <Deals />,
        title: "Deals",
        requiresAuth: true,
      }),
      createRoute({
        path: "orders",
        element: <Orders />,
        title: "Orders",
        requiresAuth: true,
      }),
    ],
  },
];
