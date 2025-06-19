import { Router, Request } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

import { API_BASE_URL } from "../config";
import { createBookingRequestWithShifts } from "../services/shiftService";

import { IncomingShift } from "../types";

const prisma = new PrismaClient();

const router = Router();

router.post("/", async (_req: Request<{}, {}, IncomingShift[]>, res: any) => {
  const shifts = _req.body;

  if (!Array.isArray(shifts)) {
    return res.status(400).json({ error: "Body must be an array of shifts" });
  }

  try {
    const request = await createBookingRequestWithShifts(shifts);
    res.status(202).json({ requestId: request.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking request" });
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

router.get("/:requestId", async (_req: Request, res: any) => {
  const { requestId } = _req.params;

  try {
    const request = await prisma.bookingRequest.findUnique({
      where: { id: requestId },
      include: { shifts: true },
    });

    if (!request) return res.status(404).json({ error: "Request not found" });

    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch request" });
  }
});

export default router;
