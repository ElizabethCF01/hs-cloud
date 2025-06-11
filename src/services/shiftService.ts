import axios from "axios";
import { retry } from "../utils/retry";
import { API_BASE_URL } from "../config";

export interface Shift {
  companyId: string;
  userId: string;
  startTime: string;
  endTime: string;
  action: string;
}

function getShiftKey(shift: Shift): string {
  return `${shift.companyId}-${shift.userId}-${shift.startTime}-${shift.endTime}`;
}

export async function processShifts(shifts: Shift[]) {
  const results = [];

  for (const shift of shifts) {
    const key = getShiftKey(shift);

    try {
      const response = await retry(() =>
        axios.post(`${API_BASE_URL}/shift`, shift, {
          headers: { "Content-Type": "application/json" },
        })
      );

      results.push({ shift, data: response.data });
    } catch (error) {
      console.error(`Failed to process shift ${key}`);
    }
  }

  return results;
}
