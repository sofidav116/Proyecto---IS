import { MarkerType } from "reactflow";

// Clases de estilo por tipo de nodo de negocio ("inicio" | "paso" | "decision" | "fin").
// Se usa tanto para el layout automático (flujos generados por IA) como para
// los nodos que el usuario agrega a mano en modo manual, así ambos se ven igual.
export function styleForTipo(tipo) {
  const base =
    "rounded-xl border p-3 text-xs font-semibold font-body text-center w-[200px] transition-colors shadow-xs ";
  if (tipo === "inicio") return base + "bg-navyDeep dark:bg-blue text-white border-transparent";
  if (tipo === "fin") return base + "bg-greenSoft dark:bg-green/20 text-green dark:text-emerald-400 border-green/30 dark:border-green/40";
  if (tipo === "decision") return base + "bg-white dark:bg-navy text-ink dark:text-white border-blue dark:border-blue";
  return base + "bg-white dark:bg-navy text-ink dark:text-white border-border dark:border-navyCard"; // "paso"
}

// Estilo (color de línea/etiqueta) de una conexión según su label ("Sí"/"No"/otro).
// Compartido entre el layout inicial y la edición manual de conexiones.
export function edgeStyleForLabel(label) {
  const isNo = label === "No";
  const isSi = label === "Sí" || label === "Si";
  return {
    style: isNo ? { stroke: "#D6414B" } : isSi ? { stroke: "#12946B" } : undefined,
    labelStyle: isNo ? { fill: "#D6414B", fontWeight: 700 } : isSi ? { fill: "#12946B", fontWeight: 700 } : undefined,
  };
}

// Convierte nodos/edges del backend al formato de React Flow.
// Compartido entre CrearFlujo.jsx (admin, genera con IA y/o construye a mano)
// y VerFlujo.jsx (cualquier usuario, solo lectura) para que ambos se vean igual.
export function layoutNodes(rawNodes, rawEdges) {
  const outgoing = new Map();
  rawEdges.forEach((e) => {
    if (!outgoing.has(e.source)) outgoing.set(e.source, []);
    outgoing.get(e.source).push(e);
  });

  const levels = new Map();
  const visited = new Set();
  const queue = rawNodes.length ? [[rawNodes[0].id, 0]] : [];
  while (queue.length) {
    const [id, depth] = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    levels.set(id, Math.max(levels.get(id) ?? 0, depth));
    (outgoing.get(id) || []).forEach((e) => queue.push([e.target, depth + 1]));
  }
  rawNodes.forEach((n) => {
    if (!levels.has(n.id)) levels.set(n.id, levels.size);
  });

  const perLevelCount = new Map();
  return rawNodes.map((n) => {
    const depth = levels.get(n.id) ?? 0;
    const slot = perLevelCount.get(depth) ?? 0;
    perLevelCount.set(depth, slot + 1);

    return {
      id: n.id,
      position: { x: 250 + slot * 260 - (perLevelCount.get(depth) > 1 ? 130 : 0), y: depth * 120 },
      // Guardamos el tipo de negocio ("inicio"|"paso"|"decision"|"fin") en data.tipo
      // para poder reconstruir el flujo "crudo" (para guardar/editar) a partir
      // del estado visual de React Flow, tanto si vino de la IA como si el
      // usuario lo editó/creó a mano después.
      data: { label: n.label, tipo: n.type || "paso" },
      className: styleForTipo(n.type),
    };
  });
}

export function layoutEdges(rawEdges) {
  return rawEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label || undefined,
    ...edgeStyleForLabel(e.label),
    markerEnd: { type: MarkerType.ArrowClosed },
  }));
}
