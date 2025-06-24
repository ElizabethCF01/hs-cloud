import cron from "node-cron";
import { processPendingRequests } from "./bookingWorker";
import { processOutbox } from "./publishOutbox";

// Every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
  console.log("🔁 Executing worker...");
  try {
    await processPendingRequests();
    await processOutbox();
  } catch (error) {
    console.error("❌ Error executing worker:", error);
  }
});
