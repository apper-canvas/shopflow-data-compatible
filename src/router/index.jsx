import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

const Layout = lazy(() => import("@/components/organisms/Layout"));
const Home = lazy(() => import("@/components/pages/Homepage"));
const ProductDetail = lazy(() => import("@/components/pages/ProductDetail"));
const Category = lazy(() => import("@/components/pages/CategoryPage"));

const SearchResults = lazy(() => import("@/components/pages/SearchResults"));
const Wishlist = lazy(() => import("@/components/pages/WishlistPage"));
const Deals = lazy(() => import("@/components/pages/DealsPage"));

const Orders = lazy(() => import("@/components/pages/OrdersPage"));
const CheckoutLayout = lazy(() => import("@/components/pages/CheckoutLayout"));
const CartReview = lazy(() => import("@/components/pages/CartReview"));
const ShippingInfo = lazy(() => import("@/components/pages/ShippingInfo"));

const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const Error = lazy(() => import("@/components/pages/ErrorPage"));

const routes = [
  // Auth routes (no layout needed)
  {
    path: "/login",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Signup />
      </Suspense>
    ),
  },
  {
    path: "/callback",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Callback />
      </Suspense>
    ),
  },
  {
    path: "/error",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Error />
      </Suspense>
    ),
  },

  // Main app routes (with Layout)
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading.....</div>}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "product/:id",
        element: (
          <Suspense fallback={<div>Loading.....</div>}>
            <ProductDetail />
          </Suspense>
        ),
      },
      {
        path: "category/:category",
        element: (
          <Suspense fallback={<div>Loading.....</div>}>
            <Category />
          </Suspense>
        ),
      },
      {
        path: "search",
        element: (
          <Suspense fallback={<div>Loading.....</div>}>
            <SearchResults />
          </Suspense>
        ),
      },
      {
        path: "wishlist",
        element: (
          <Suspense fallback={<div>Loading.....</div>}>
            <Wishlist />
          </Suspense>
        ),
      },
      {
        path: "deals",
        element: (
          <Suspense fallback={<div>Loading.....</div>}>
            <Deals />
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<div>Loading.....</div>}>
            <Orders />
          </Suspense>
        ),
      },
    ],
  },

  // Checkout routes (separate layout)
  {
    path: "/checkout",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <CheckoutLayout />
      </Suspense>
    ),
    children: [
      {
        path: "cart-review",
        element: (
          <Suspense fallback={<div>Loading.....</div>}>
            <CartReview />
          </Suspense>
        ),
      },
      {
        path: "shipping",
        element: (
          <Suspense fallback={<div>Loading.....</div>}>
            <ShippingInfo />
          </Suspense>
        ),
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
