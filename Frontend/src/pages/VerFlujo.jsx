import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from "reactflow";
import "reactflow/dist/style.css";
import { ArrowLeft, Loader2, Lightbulb } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import FlowZoomControls from "../components/FlowZoomControls";
import { Card, Pill } from "../components/ui";
import { api } from "../lib/api";
import { layoutNodes, layoutEdges } from "../lib/flowLayout";

// Vista de solo consulta: "Empleados pueden ver el flujo" (sin editar, sin
// generar con IA). Cualquier usuario autenticado puede entrar aquí, siempre
// que el flujo pertenezca a su organización (el backend ya lo filtra).
export default function VerFlujo() {
  const { id } = useParams();
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .getFlow(id)
      .then((data) => {
        if (!active) return;
        setFlow(data.flow);
        if (data.flow?.nodes?.length) {
          setNodes(layoutNodes(data.flow.nodes, data.flow.edges || []));
          setEdges(layoutEdges(data.flow.edges || []));
        }
      })
      .catch((err) => active && setError(err.message || "No se pudo cargar el flujo."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, setNodes, setEdges]);

  return (
    <AppShell>
      <TopBar title={flow?.nombre || "Flujo"} subtitle="Vista de solo consulta" />
      <div className="p-8">
        <Link
          to="/flujos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 font-body"
        >
          <ArrowLeft size={14} /> Volver a Mis Flujos
        </Link>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-body">
            <Loader2 size={16} className="animate-spin" /> Cargando flujo…
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 dark:text-red-400 font-body">{error}</div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Pill tone={flow?.estado === "Activo" ? "green" : "amber"}>{flow?.estado}</Pill>
              {flow?.tipo && (
                <Pill tone={flow.tipo === "especifico" ? "blue" : "gray"}>
                  {flow.tipo === "especifico" ? "Específico de tu organización" : "Flujo general"}
                </Pill>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400 font-body">
                {flow?.pasos} pasos · creado {flow?.fecha}
              </span>
            </div>

            <Card className="h-[480px] overflow-hidden border border-slate-200 dark:border-slate-800/80 rounded-2xl mb-6">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                fitView
              >
                <Background />
                <Controls showInteractive={false} />
                <FlowZoomControls />
                <MiniMap pannable zoomable />
              </ReactFlow>
            </Card>

            {flow?.aiInsight && (
              <Card className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-body">
                    Insight de la IA
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-body">
                  {flow.aiInsight.sugerencia || flow.aiInsight.optimizacion}
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
