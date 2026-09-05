import { MarkerType } from "reactflow";

// Convierte nodos/edges del backend al formato de React Flow.
// Compartido entre CrearFlujo.jsx (admin, genera con IA) y VerFlujo.jsx
// (cualquier usuario, solo lectura) para que ambos se vean igual.
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

    const isDecision = n.type === "decision";
    const isInicio = n.type === "inicio";
    const isPasoAlternate = n.type === "paso" && depth % 2 === 0;

    let nodeClass = "rounded-xl border p-3 text-xs font-semibold font-body text-center w-[200px] transition-colors shadow-xs ";

    if (isInicio) {
      nodeClass += "bg-navyDeep dark:bg-blue text-white border-transparent";
    } else if (isPasoAlternate) {
      nodeClass += "bg-greenSoft dark:bg-green/20 text-green dark:text-emerald-400 border-green/30 dark:border-green/40";
    } else if (isDecision) {
      nodeClass += "bg-white dark:bg-navy text-ink dark:text-white border-blue dark:border-blue";
    } else {
      nodeClass += "bg-white dark:bg-navy text-ink dark:text-white border-border dark:border-navyCard";
    }

    return {
      id: n.id,
      position: { x: 250 + slot * 260 - (perLevelCount.get(depth) > 1 ? 130 : 0), y: depth * 120 },
      data: { label: n.label },
      className: nodeClass,
    };
  });
}

export function layoutEdges(rawEdges) {
  return rawEdges.map((e) => {
    const isNo = e.label === "No";
    const isSi = e.label === "Sí" || e.label === "Si";
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || undefined,
      style: isNo ? { stroke: "#D6414B" } : isSi ? { stroke: "#12946B" } : undefined,
      labelStyle: isNo ? { fill: "#D6414B", fontWeight: 700 } : isSi ? { fill: "#12946B", fontWeight: 700 } : undefined,
      markerEnd: { type: MarkerType.ArrowClosed },
    };
  });
}
