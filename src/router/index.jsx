import { createBrowserRouter } from "react-router-dom";
import Root from "@/layouts/Root";
import { authRoutes } from "./routes/authRoutes";
import { mainRoutes } from "./routes/mainRoutes";

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
