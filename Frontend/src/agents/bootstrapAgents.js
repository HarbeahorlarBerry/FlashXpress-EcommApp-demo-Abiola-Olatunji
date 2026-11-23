import toast from "react-hot-toast";
import { eventBus } from "../core/eventBus";
import fraudAgent from "./fraudAgent";
import inventoryAgent from "./inventoryAgent";
import "./reviewAgent"; // these two register their own listeners on import,
import "./reviewAnalyticsAgent"; // but were never imported, so they never ran

eventBus.on("order_created", (order) => {
  const result = fraudAgent.analyze(order);
  console.log("Fraud Agent:", result);
});

eventBus.on("product_created", (product) => {
  const result = inventoryAgent.analyze(product);
  console.log("Inventory Agent:", result);
  if (result.low) toast(`Low stock on "${product.name}": ${result.message}`, { icon: "📦" });
});