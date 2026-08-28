import { generateFlowFromDescription, generateReportFromFlow } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateFlow = asyncHandler(async (req, res) => {
  const { descripcion } = req.body;

  if (!descripcion || !descripcion.trim()) {
    throw new ApiError(400, "El campo 'descripcion' es requerido.");
  }

  const result = await generateFlowFromDescription(descripcion);
  res.json(result);
});

export const generateReport = asyncHandler(async (req, res) => {
  const flowData = req.body; // Recibe { nombre, nodes, edges, insight, format }

  if (!flowData.nodes || !flowData.nodes.length) {
    throw new ApiError(400, "Se requieren los nodos del flujo para generar el reporte.");
  }

  const report = await generateReportFromFlow(flowData);
  res.json(report);
});