import { useCallback, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState, MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Sparkles, Lightbulb, FileText, FileDown, Loader2 } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import { Card } from "../components/ui";

const EXAMPLE =
  "Crear un flujo para solicitudes de vacaciones: el empleado envía la solicitud, " +
  "el gerente la revisa, si la aprueba, RRHH verifica días restantes y da el visto " +
  "bueno final. Si se rechaza en algún paso, notificar al empleado.";

const nodeBase = {
  style: {
    borderRadius: 10,
    border: "1px solid #E4E8F1",
    padding: "10px 16px",
    fontSize: 12,
    fontFamily: "Inter, sans-serif",
    fontWeight: 600,
    background: "#fff",
    color: "#131A2C",
    width: 200,
    textAlign: "center",
  },
};

// Simula lo que hoy hace un endpoint /api/ai/generate-flow (Vertex AI + Gemini).
// Cuando el backend exista, esta función se reemplaza por un fetch real.
function generarFlujoDeVacaciones() {
  const nodes = [
    { id: "1", position: { x: 250, y: 0 }, data: { label: "Solicitud de Vacaciones (Empleado)" },
      ...nodeBase, style: { ...nodeBase.style, background: "#0F1B33", color: "#fff", border: "none" } },
    { id: "2", position: { x: 250, y: 110 }, data: { label: "¿Aprobación de Gerente?" }, ...nodeBase },
    { id: "3", position: { x: 30, y: 230 }, data: { label: "Notificar Empleado" }, ...nodeBase },
    { id: "4", position: { x: 470, y: 230 }, data: { label: "Revisión de RRHH" },
      ...nodeBase, style: { ...nodeBase.style, background: "#E7F7F1", border: "1px solid #12946B" } },
    { id: "5", position: { x: 470, y: 340 }, data: { label: "Verificación de Días Restantes" }, ...nodeBase },
    { id: "6", position: { x: 470, y: 450 }, data: { label: "Visto Bueno Final" }, ...nodeBase },
    { id: "7", position: { x: 700, y: 450 }, data: { label: "Notificar Rechazo" }, ...nodeBase },
  ];
  const edges = [
    { id: "e1-2", source: "1", target: "2", markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e2-3", source: "2", target: "3", label: "No", style: { stroke: "#D6414B" }, labelStyle: { fill: "#D6414B", fontWeight: 700 }, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e2-4", source: "2", target: "4", label: "Sí", style: { stroke: "#12946B" }, labelStyle: { fill: "#12946B", fontWeight: 700 }, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e4-5", source: "4", target: "5", markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e5-6", source: "5", target: "6", markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e6-7", source: "6", target: "7", label: "No", style: { stroke: "#D6414B" }, labelStyle: { fill: "#D6414B", fontWeight: 700 }, markerEnd: { type: MarkerType.ArrowClosed } },
  ];
  return { nodes, edges };
}

export default function CrearFlujo() {
  const [descripcion, setDescripcion] = useState(EXAMPLE);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((c) => setEdges((eds) => addEdge(c, eds)), [setEdges]);

  const handleGenerar = () => {
    if (!descripcion.trim()) return;
    setLoading(true);
    setGenerated(false);
    // Simulación de la llamada al backend de IA. Reemplazar por:
    // const res = await fetch("/api/ai/generate-flow", { method: "POST", body: JSON.stringify({ descripcion }) })
    setTimeout(() => {
      const { nodes: n, edges: e } = generarFlujoDeVacaciones();
      setNodes(n);
      setEdges(e);
      setLoading(false);
      setGenerated(true);
    }, 1400);
  };

  return (
    <AppShell>
      <TopBar title="Crear Nuevo Flujo" subtitle="Describe tu proceso en lenguaje natural y deja que la IA lo dibuje." />
      <div className="flex-1 overflow-hidden flex">
        {/* Panel izquierdo: input en lenguaje natural */}
        <div className="w-[340px] shrink-0 border-r border-border bg-white p-6 flex flex-col overflow-auto">
          <label className="text-xs font-semibold text-ink font-body mb-2">
            1. Describe tu flujo en lenguaje natural (Español)
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={8}
            className="w-full text-sm rounded-lg border border-border p-3 text-ink font-body outline-none focus:border-blue resize-none mb-4"
            placeholder="Describe tu proceso de negocio en lenguaje natural…"
          />
          <button
            onClick={handleGenerar}
            disabled={loading}
            className="w-full rounded-lg text-sm font-semibold text-white py-3 flex items-center justify-center gap-2 font-body disabled:opacity-70"
            style={{ background: "#0F1B33" }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Analizando descripción…
              </>
            ) : (
              <>
                <Sparkles size={15} /> Generar Flujo con IA
              </>
            )}
          </button>

          {generated && (
            <div className="mt-6 rounded-lg p-4" style={{ background: "#EAF1FF" }}>
              <p className="text-xs font-semibold text-ink font-body mb-2 flex items-center gap-1.5">
                <Lightbulb size={13} className="text-blue" /> AI Insight
              </p>
              <p className="text-xs leading-relaxed text-muted font-body mb-2">
                <strong className="text-ink">Optimización inteligente:</strong> el paso "Revisión de RRHH"
                tiene un tiempo promedio de 72 horas.
              </p>
              <p className="text-xs leading-relaxed text-muted font-body mb-2">
                <strong className="text-ink">Sugerencia:</strong> automatizar la verificación de días
                mediante integración con el sistema de nómina.
              </p>
              <p className="text-xs text-green font-semibold font-body">Ahorro estimado: 48 horas</p>
            </div>
          )}

          {generated && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-ink font-body mb-3">Generación de documentos</p>
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 text-xs font-medium text-ink border border-border rounded-lg px-3 py-2.5 font-body">
                  <FileText size={14} className="text-red" /> Reporte de Eficiencia (PDF)
                </button>
                <button className="flex items-center gap-2 text-xs font-medium text-ink border border-border rounded-lg px-3 py-2.5 font-body">
                  <FileDown size={14} className="text-blue" /> Plantilla de Carta (Word)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas: React Flow */}
        <div className="flex-1 relative bg-bg">
          {!generated && !loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-sm text-faint font-body">
                El diagrama generado por la IA aparecerá aquí
              </p>
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#D8DEEC" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={() => "#2F6FED"}
              maskColor="rgba(244,246,251,0.7)"
              style={{ background: "#fff", border: "1px solid #E4E8F1" }}
            />
          </ReactFlow>
        </div>
      </div>
    </AppShell>
  );
}
