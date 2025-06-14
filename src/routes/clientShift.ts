import { Router, Request } from "express";
import { processShifts, Shift } from "../services/shiftService";
import { API_BASE_URL } from "../config";

import axios from "axios";

const router = Router();

router.post("/", async (_req: Request<{}, {}, Shift[]>, res: any) => {
  const shifts = _req.body;

  if (!Array.isArray(shifts)) {
    return res.status(400).json({ error: "You must send an array of shifts" });
  }

  try {
    const result = await processShifts(shifts);
    res.status(200).json({ message: "All shifts processed", result });
  } catch (error) {
    res.status(500).json({
      error: "Failed to process some shifts, check the list before retry",
      details: error,
    });
  }
});

router.get("/", async (_req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/shifts`);
    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(502).json({
      error: "Failed to fetch shifts from external API",
      details: error.message,
    });
  }
});

export default router;
