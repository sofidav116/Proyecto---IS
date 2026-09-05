import { generateFlowFromDescription, generateReportFromFlow } from "../services/ai.service.js";
import { organizations, aiInsights, generateInsightId } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/ai/generate-flow
// Fase 3: se busca la jerarquía de la organización del usuario logueado y se
// le pasa al servicio de IA, para que el flujo generado sea específico a esa
// empresa (no un organigrama genérico). Si el admin pide explícitamente un
// flujo "general" (body.general === true), se ignora la jerarquía a propósito.
export const generateFlow = asyncHandler(async (req, res) => {
  const { descripcion, general = false } = req.body;

  if (!descripcion || !descripcion.trim()) {
    throw new ApiError(400, "El campo 'descripcion' es requerido.");
  }

  let jerarquia = [];
  if (!general) {
    const org = organizations.find((o) => o.id === req.user.organizationId);
    jerarquia = org?.jerarquia || [];
  }

  const result = await generateFlowFromDescription(descripcion, jerarquia);
  res.json(result);
});

// POST /api/ai/generate-report
// Fase 4: además de devolver el reporte, lo persiste en Insights_IA
// (reporteTexto = CLOB) asociado al flujo, para no tener que regenerarlo
// cada vez que alguien lo consulta.
export const generateReport = asyncHandler(async (req, res) => {
  const flowData = req.body; // { flujoId, nombre, nodes, edges, insight, format }

  if (!flowData.nodes || !flowData.nodes.length) {
    throw new ApiError(400, "Se requieren los nodos del flujo para generar el reporte.");
  }

  const report = await generateReportFromFlow(flowData);

  const savedInsight = {
    id: generateInsightId(),
    flujoId: flowData.flujoId || null,
    organizationId: req.user.organizationId,
    titulo: report.titulo,
    reporteTexto: report.contenido, // CLOB: texto largo completo, no se recorta
    optimizacion: flowData.insight?.optimizacion || null,
    ahorroEstimadoHoras: flowData.insight?.ahorro_estimado_horas ?? null,
    generatedEn: report.fecha,
    generadoPor: req.user.id,
  };
  aiInsights.push(savedInsight);

  res.json({ ...report, insightId: savedInsight.id });
});