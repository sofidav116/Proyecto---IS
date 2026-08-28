// Nivel 1 del documento de arquitectura: "Usuario describe proceso → Gemini →
// Genera workflow". Si hay un proyecto de GCP configurado (.env), llama a
// Vertex AI + Gemini de verdad. Si no, cae al generador simulado para poder
// seguir desarrollando sin gastar cuota.
//
// Flujo de datos (nunca React → Gemini directo, siempre por el backend):
//   React → POST /api/ai/generate-flow → este archivo → Vertex AI → Gemini → JSON → React

import { GoogleGenAI } from "@google/genai";
import { env, isVertexConfigured } from "../config/env.js";

const SYSTEM_PROMPT = `Eres un asistente experto en modelado y optimización de procesos de negocio (BPM) para PyMEs.
A partir de la descripción en lenguaje natural de un proceso, debes devolver EXCLUSIVAMENTE un JSON válido
(sin markdown, sin texto adicional) con esta forma exacta:

{
  "nombre": "Nombre corto del flujo",
  "nodes": [
    { "id": "1", "label": "Texto del paso", "type": "inicio|paso|decision|fin" }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "label": "Sí|No|" }
  ],
  "insight": {
    "optimizacion": "Descripción del cuello de botella principal detectado",
    "sugerencia": "Sugerencia concreta de automatización o mejora",
    "ahorro_estimado_horas": 0
  },
  "bottlenecks": [
    { "paso": "Nombre del paso", "tiempo_promedio": "72h", "riesgo": "Alto|Medio|Bajo" }
  ]
}

Reglas:
- Usa entre 4 y 10 nodos según la complejidad del proceso descrito.
- Los "id" de nodos son strings únicos ("1","2",...).
- Marca decisiones (if/aprueba/rechaza) con type "decision" y crea dos edges de salida etiquetados "Sí" / "No".
- "riesgo" en bottlenecks debe ser "Alto" si el tiempo promedio estimado supera 48h, "Medio" si es 24-48h y "Bajo" si es menor.
- Responde SOLO el JSON, nada más, sin \`\`\`json ni texto alrededor.`;

let aiClient = null;
function getClient() {
  if (!aiClient) {
    // Con vertexai:true y sin apiKey, el SDK se autentica solo leyendo
    // GOOGLE_APPLICATION_CREDENTIALS (la cuenta de servicio) del .env
    aiClient = new GoogleGenAI({
      vertexai: true,
      project: env.vertex.project,
      location: env.vertex.location,
    });
  }
  return aiClient;
}

export async function generateFlowFromDescription(descripcion = "") {
  if (isVertexConfigured()) {
    try {
      return await callGemini(descripcion);
    } catch (err) {
      console.error("[ai.service] Falló Vertex AI/Gemini, usando fallback simulado:", err.message);
      return simulateFlowGeneration(descripcion);
    }
  }
  return simulateFlowGeneration(descripcion);
}

async function callGemini(descripcion) {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: env.vertex.model,
    contents: descripcion,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini no devolvió texto en la respuesta.");

  const parsed = JSON.parse(text);
  return normalizeAiResult(parsed);
}

function normalizeAiResult(parsed) {
  const nodes = (parsed.nodes || []).map((n, idx) => ({
    id: String(n.id ?? idx + 1),
    label: n.label,
    type: n.type || "paso",
  }));
  const edges = (parsed.edges || []).map((e, idx) => ({
    id: e.id || `e${e.source}-${e.target}-${idx}`,
    source: String(e.source),
    target: String(e.target),
    label: e.label || "",
  }));
  return {
    nombre: parsed.nombre || "Flujo generado por IA",
    nodes,
    edges,
    insight: parsed.insight || null,
    bottlenecks: parsed.bottlenecks || [],
  };
}


function simulateFlowGeneration(descripcion) {
  const texto = (descripcion || "").toLowerCase();

  if (texto.includes("vacacion")) {
    return {
      nombre: "Solicitud de Vacaciones",
      nodes: [
        { id: "1", label: "Solicitud de Vacaciones (Empleado)", type: "inicio" },
        { id: "2", label: "¿Aprobación de Gerente?", type: "decision" },
        { id: "3", label: "Notificar Empleado", type: "fin" },
        { id: "4", label: "Revisión de RRHH", type: "paso" },
        { id: "5", label: "Verificación de Días Restantes", type: "paso" },
        { id: "6", label: "Visto Bueno Final", type: "decision" },
        { id: "7", label: "Notificar Rechazo", type: "fin" },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", label: "" },
        { id: "e2-3", source: "2", target: "3", label: "No" },
        { id: "e2-4", source: "2", target: "4", label: "Sí" },
        { id: "e4-5", source: "4", target: "5", label: "" },
        { id: "e5-6", source: "5", target: "6", label: "" },
        { id: "e6-7", source: "6", target: "7", label: "No" },
      ],
      insight: {
        optimizacion: 'El paso "Revisión de RRHH" tiene un tiempo promedio de 72 horas.',
        sugerencia: "Automatizar la verificación de días restantes mediante integración con el sistema de nómina.",
        ahorro_estimado_horas: 48,
      },
      bottlenecks: [{ paso: "Revisión de RRHH", tiempo_promedio: "72h", riesgo: "Alto" }],
    };
  }

  const oraciones = descripcion
    .split(/[.;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);

  const base = oraciones.length ? oraciones : ["Inicio del proceso", "Revisión", "Aprobación", "Fin del proceso"];

  const nodes = base.map((t, idx) => ({
    id: String(idx + 1),
    label: t.length > 60 ? t.slice(0, 57) + "..." : t,
    type: idx === 0 ? "inicio" : idx === base.length - 1 ? "fin" : "paso",
  }));

  const edges = nodes.slice(1).map((n, idx) => ({
    id: `e${idx + 1}-${idx + 2}`,
    source: String(idx + 1),
    target: n.id,
    label: "",
  }));

  return {
    nombre: "Flujo generado por IA",
    nodes,
    edges,
    insight: {
      optimizacion: "Se detectaron pasos manuales que podrían automatizarse.",
      sugerencia: "Revisa los pasos intermedios para integrarlos con tus sistemas existentes.",
      ahorro_estimado_horas: 12,
    },
    bottlenecks: nodes.length > 2 ? [{ paso: nodes[1].label, tiempo_promedio: "24h", riesgo: "Medio" }] : [],
  };
}
export async function generateReportFromFlow(flowData) {
  const { nombre, nodes, edges, insight, format = "pdf" } = flowData;

  if (isVertexConfigured()) {
    try {
      const ai = getClient();
      const prompt = `
Genera un informe ejecutivo de eficiencia en formato de texto claro y profesional para el siguiente proceso:
Nombre del Flujo: ${nombre}
Nodos: ${JSON.stringify(nodes)}
Conexiones: ${JSON.stringify(edges)}
Análisis actual: ${JSON.stringify(insight)}

Incluye:
1. Resumen Ejecutivo del Proceso.
2. Identificación de Cuellos de Botella y Riesgos Operativos.
3. Recomendaciones Específicas de Automatización.
4. Conclusión y ROI Estimado.
`;

      const response = await ai.models.generateContent({
        model: env.vertex.model,
        contents: prompt,
        config: { temperature: 0.3 },
      });

      return {
        titulo: `Reporte de Eficiencia - ${nombre}`,
        formato: format,
        contenido: response.text,
        fecha: new Date().toISOString(),
      };
    } catch (err) {
      console.error("[ai.service] Falló generación de reporte con Gemini:", err.message);
    }
  }

  return {
    titulo: `Reporte de Eficiencia (Simulado) - ${nombre || "Flujo de Trabajo"}`,
    formato: format,
    contenido: `## Resumen Ejecutivo\nEl proceso "${nombre}" cuenta con ${nodes.length} pasos analizados.\n\n## Recomendación\n${insight?.sugerencia || "Optimizar tareas manuales."}`,
    fecha: new Date().toISOString(),
  };
}