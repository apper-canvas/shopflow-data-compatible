import { lazy, Suspense } from "react";
import { requireAuth } from "../guard";

const CheckoutLayout = lazy(() => import("@/components/pages/CheckoutLayout"));
const CartReview = lazy(() => import("@/components/pages/CartReview"));
const ShippingInfo = lazy(() => import("@/components/pages/ShippingInfo"));

export const checkoutRoutes = [
    {
        path: "checkout",
        element: (
            <Suspense fallback={<div>Loading.....</div>}>
                <CheckoutLayout />
            </Suspense>
        ),
        loader: requireAuth,
        handle: {
            title: "Checkout",
            requiresAuth: true,
        },
        children: [
            {
                path: "cart-review",
                element: (
                    <Suspense fallback={<div>Loading.....</div>}>
                        <CartReview />
                    </Suspense>
                ),
                handle: {
                    title: "Cart Review",
                    requiresAuth: true,
                },
            },
            {
                path: "shipping",
                element: (
                    <Suspense fallback={<div>Loading.....</div>}>
                        <ShippingInfo />
                    </Suspense>
                ),
                handle: {
                    title: "Shipping Info",
                    requiresAuth: true,
                },
            },
        ],
    },
];