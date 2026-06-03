import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Shipments } from "./components/Shipments";
import { Finances } from "./components/Finances";
import { Complaints } from "./components/Complaints";
import { LoyaltyProgram } from "./components/LoyaltyProgram";
import { News } from "./components/News";
import { NewOrders } from "./components/NewOrders";
import { OrderDetail } from "./components/OrderDetail";
import { Reporting } from "./components/Reporting";
import { QuarterlyDiscount } from "./components/QuarterlyDiscount";
import { Analytics } from "./components/Analytics";
import { StoreOrders } from "./components/StoreOrders";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },

      { path: "quarter-discount", Component: QuarterlyDiscount },
      { path: "new-orders", Component: NewOrders },
      { path: "new-orders/:orderId", Component: OrderDetail },
      { path: "shipments", Component: Shipments },
      { path: "finances", Component: Finances },
      { path: "complaints", Component: Complaints },
      { path: "loyalty", Component: LoyaltyProgram },
      { path: "news", Component: News },
      { path: "reporting", Component: Reporting },
      { path: "analytics", Component: Analytics },
      { path: "store-orders", Component: StoreOrders },
      ],
  {
    basename: "/my-figma-site",
  }
);
  },
]);
