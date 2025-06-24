import express from "express";
import clientShiftRouter from "./routes/clientShift";
import bodyParser from "body-parser";
import "./jobs/cronWorker";
import { startQueueListener } from "./sqs/listener";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.use("/client-shift", clientShiftRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

startQueueListener().catch((err) =>
  console.error("❌ SQS listener error:", err)
);
