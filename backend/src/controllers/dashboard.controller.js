import { kpis, flows } from "../data/store.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/dashboard/kpis
export const getKpis = asyncHandler(async (_req, res) => {
  res.json({ kpis });
});

// GET /api/dashboard/recent-flows
// Igual que en flows.controller: solo los flujos de la organización del usuario.
export const getRecentFlows = asyncHandler(async (req, res) => {
  const orgFlows = flows.filter((f) => f.organizationId === req.user.organizationId);
  res.json({ flows: orgFlows.slice(0, 5) });
});
