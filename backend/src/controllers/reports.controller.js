import { bottlenecks, flows } from "../data/store.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/reports/summary
export const getSummary = asyncHandler(async (_req, res) => {
  res.json({
    summary: {
      flujosAnalizados: String(flows.length),
      tiempoPromedioProceso: "1.6 días",
      cuellosDeBotella: String(bottlenecks.length),
    },
  });
});

// GET /api/reports/bottlenecks
export const getBottlenecks = asyncHandler(async (_req, res) => {
  res.json({ bottlenecks });
});
