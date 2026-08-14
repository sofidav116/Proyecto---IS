// Por ahora este servicio SIMULA lo que hará Vertex AI + Gemini.
// Mantiene la misma forma de respuesta que usará el endpoint real más adelante,
// para que cuando conectemos Vertex AI no haya que tocar el frontend.

export function generateFlowFromDescription(descripcion = "") {
  const texto = descripcion.toLowerCase();

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

  // Genérico: arma un flujo lineal simple a partir de las oraciones del texto
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
