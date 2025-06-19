import cron from "node-cron";
import { processPendingRequests } from "./bookingWorker";

// Every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
  console.log("🔁 Executing worker...");
  try {
    await processPendingRequests();
  } catch (error) {
    console.error("❌ Error executing worker:", error);
  }
});
