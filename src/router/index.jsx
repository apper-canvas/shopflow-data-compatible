import { createBrowserRouter } from "react-router-dom";
import Root from "@/layouts/Root";
import { authRoutes } from "./routes/authRoutes";
import { productRoutes } from "./routes/productRoutes";
import { checkoutRoutes } from "./routes/checkoutRoutes";
import { publicRoutes } from "./routes/publicRoutes";

const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      ...authRoutes,
      ...productRoutes,
      ...checkoutRoutes,
      ...publicRoutes,
    ],
  },
];

export const router = createBrowserRouter(routes);
