import { bottlenecks, flows, aiInsights } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/reports/summary
export const getSummary = asyncHandler(async (req, res) => {
  const orgFlows = flows.filter((f) => f.organizationId === req.user.organizationId);
  res.json({
    summary: {
      flujosAnalizados: String(orgFlows.length),
      tiempoPromedioProceso: "1.6 días",
      cuellosDeBotella: String(bottlenecks.length),
    },
  });
});

// GET /api/reports/bottlenecks
export const getBottlenecks = asyncHandler(async (_req, res) => {
  res.json({ bottlenecks });
});

// GET /api/reports/insights
// Fase 4: devuelve los reportes de IA YA GUARDADOS (campo CLOB reporteTexto),
// filtrados por la organización del usuario. No vuelve a llamar a la IA:
// esto es "Reportes de la IA guardado" que pedía el catedrático.
export const getInsights = asyncHandler(async (req, res) => {
  const orgInsights = aiInsights
    .filter((i) => i.organizationId === req.user.organizationId)
    .sort((a, b) => new Date(b.generatedEn) - new Date(a.generatedEn));
  res.json({ insights: orgInsights });
});

// GET /api/reports/insights/:id
export const getInsightById = asyncHandler(async (req, res) => {
  const insight = aiInsights.find((i) => i.id === req.params.id);
  if (!insight) throw new ApiError(404, "Reporte no encontrado.");
  if (insight.organizationId !== req.user.organizationId) {
    throw new ApiError(403, "Este reporte no pertenece a tu organización.");
  }
  res.json({ insight });
});
