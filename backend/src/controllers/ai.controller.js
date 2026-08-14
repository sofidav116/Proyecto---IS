import { generateFlowFromDescription } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/ai/generate-flow
export const generateFlow = asyncHandler(async (req, res) => {
  const { descripcion } = req.body;

  if (!descripcion || !descripcion.trim()) {
    throw new ApiError(400, "El campo 'descripcion' es requerido.");
  }

  // Simula la latencia de una llamada real a Vertex AI / Gemini
  await new Promise((resolve) => setTimeout(resolve, 900));

  const result = generateFlowFromDescription(descripcion);
  res.json(result);
});
