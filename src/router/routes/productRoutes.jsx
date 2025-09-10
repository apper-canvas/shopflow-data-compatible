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
  createRoute({
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
    title: "Home",
    requiresAuth: false,
  }),
  createRoute({
    path: "product/:id",
    element: (
      <Layout>
        <ProductDetail />
      </Layout>
    ),
    title: "Product Detail",
    requiresAuth: true,
  }),
  createRoute({
    path: "category/:category",
    element: (
      <Layout>
        <Category />
      </Layout>
    ),
    title: "Category",
    requiresAuth: true,
  }),
  createRoute({
    path: "search",
    element: (
      <Layout>
        <SearchResults />
      </Layout>
    ),
    title: "Search Results",
    requiresAuth: true,
  }),
  createRoute({
    path: "wishlist",
    element: (
      <Layout>
        <Wishlist />
      </Layout>
    ),
    title: "Wishlist",
    requiresAuth: true,
  }),
  createRoute({
    path: "deals",
    element: (
      <Layout>
        <Deals />
      </Layout>
    ),
    title: "Deals",
    requiresAuth: true,
  }),
  createRoute({
    path: "orders",
    element: (
      <Layout>
        <Orders />
      </Layout>
    ),
    title: "Orders",
    requiresAuth: true,
  }),
];
