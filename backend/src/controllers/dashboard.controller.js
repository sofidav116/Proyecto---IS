import { kpis, flows } from "../data/store.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/dashboard/kpis
export const getKpis = asyncHandler(async (_req, res) => {
  res.json({ kpis });
});

// GET /api/dashboard/recent-flows
export const getRecentFlows = asyncHandler(async (_req, res) => {
  res.json({ flows: flows.slice(0, 5) });
});
