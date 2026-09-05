import { useCallback, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Sparkles, Lightbulb, FileText, FileDown, Loader2, CheckCircle2 } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import { api } from "../lib/api";
import { layoutNodes, layoutEdges } from "../lib/flowLayout";

const EXAMPLE =
  "Crear un flujo para solicitudes de vacaciones: el empleado envía la solicitud, " +
  "el gerente la revisa, si la aprueba, RRHH verifica días restantes y da el visto " +
  "bueno final. Si se rechaza en algún paso, notificar al empleado.";


export default function CrearFlujo() {
  const [descripcion, setDescripcion] = useState(EXAMPLE);
  // Fase 3: por defecto se usa la jerarquía real de la organización (flujo
  // "específico"). Si el admin marca este check, se ignora la jerarquía a
  // propósito y se pide un flujo "general" (ej: para publicar como plantilla).
  const [flujoGeneral, setFlujoGeneral] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportText, setReportText] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((c) => setEdges((eds) => addEdge(c, eds)), [setEdges]);

  const handleGenerar = async () => {
    if (!descripcion.trim()) return;
    setLoading(true);
    setGenerated(false);
    setSaved(false);
    setReportText("");
    setError("");
    try {
      const result = await api.generateFlow(descripcion, flujoGeneral);
      setAiResult(result);
      setNodes(layoutNodes(result.nodes, result.edges));
      setEdges(layoutEdges(result.edges));
      setGenerated(true);
    } catch (err) {
      setError(err.message || "No se pudo generar el flujo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!aiResult) return;
    setSaving(true);
    setError("");
    try {
      await api.createFlow({
        nombre: aiResult.nombre,
        pasos: aiResult.nodes.length,
        estado: "Activo",
        nodes: aiResult.nodes,
        edges: aiResult.edges,
        aiInsight: aiResult.insight,
        // Fase 3: "especifico" si se usó la jerarquía real de la organización,
        // "general" si el admin pidió explícitamente ignorarla.
        tipo: aiResult.tipo || (flujoGeneral ? "general" : "especifico"),
      });
      setSaved(true);
    } catch (err) {
      setError(err.message || "No se pudo guardar el flujo.");
    } finally {
      setSaving(false);
    }
  };

  // Fase 4: pide el reporte a la IA Y lo persiste en el backend (Insights_IA /
  // CLOB), no solo lo muestra en pantalla. Por eso conviene guardar el flujo
  // primero (para tener un flujoId al que asociar el reporte).
  const handleGenerarReporte = async () => {
    if (!aiResult) return;
    setReportLoading(true);
    setError("");
    try {
      const report = await api.generateReport({
        nombre: aiResult.nombre,
        nodes: aiResult.nodes,
        edges: aiResult.edges,
        insight: aiResult.insight,
        format: "pdf",
      });
      setReportText(report.contenido);
    } catch (err) {
      setError(err.message || "No se pudo generar el reporte.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <AppShell>
      <TopBar title="Crear Nuevo Flujo" subtitle="Describe tu proceso en lenguaje natural y deja que la IA lo dibuje." />
      <div className="flex-1 overflow-hidden flex bg-bg dark:bg-navyDeep transition-colors">
        {/* Panel izquierdo: formulario e IA */}
        <div className="w-[340px] shrink-0 border-r border-border dark:border-navyCard bg-white dark:bg-navy p-6 flex flex-col overflow-auto transition-colors">
          <label className="text-xs font-semibold text-ink dark:text-white font-body mb-2">
            1. Describe tu flujo en lenguaje natural (Español)
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={8}
            className="w-full text-sm rounded-lg border border-border dark:border-navyCard bg-bg dark:bg-navyDeep p-3 text-ink dark:text-white font-body outline-none focus:border-blue resize-none mb-4 transition-colors placeholder:text-muted/60 dark:placeholder:text-faint/50"
            placeholder="Describe tu proceso de negocio en lenguaje natural…"
          />

          <label className="flex items-start gap-2 text-xs text-muted dark:text-faint font-body mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={flujoGeneral}
              onChange={(e) => setFlujoGeneral(e.target.checked)}
              className="mt-0.5 accent-blue"
            />
            <span>
              Generar como flujo <strong className="text-ink dark:text-white">general</strong> (ignora la jerarquía
              de mi organización — útil para plantillas reutilizables por otras empresas)
            </span>
          </label>

          <button
            onClick={handleGenerar}
            disabled={loading}
            className="w-full rounded-lg text-sm font-semibold text-white py-3 flex items-center justify-center gap-2 font-body disabled:opacity-70 bg-navy dark:bg-blue hover:opacity-90 transition-all cursor-pointer"
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

          {error && <p className="text-xs text-red font-body mt-3">{error}</p>}

          {/* Caja AI Insight */}
          {generated && aiResult?.insight && (
            <div className="mt-6 rounded-xl p-4 bg-blueSoft dark:bg-blue/15 border border-blue/20 dark:border-blue/30 transition-colors">
              <p className="text-xs font-semibold text-ink dark:text-white font-body mb-2 flex items-center gap-1.5">
                <Lightbulb size={13} className="text-blue dark:text-blue-400" /> AI Insight
              </p>
              <p className="text-xs leading-relaxed text-muted dark:text-faint font-body mb-2">
                <strong className="text-ink dark:text-white">Optimización inteligente:</strong> {aiResult.insight.optimizacion}
              </p>
              <p className="text-xs leading-relaxed text-muted dark:text-faint font-body mb-2">
                <strong className="text-ink dark:text-white">Sugerencia:</strong> {aiResult.insight.sugerencia}
              </p>
              <p className="text-xs text-green dark:text-emerald-400 font-semibold font-body">
                Ahorro estimado: {aiResult.insight.ahorro_estimado_horas} horas
              </p>
            </div>
          )}

          {/* Acciones para Guardar / Descargar */}
          {generated && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-ink dark:text-white font-body mb-3">Guardar flujo</p>
              <button
                onClick={handleGuardar}
                disabled={saving || saved}
                className={`w-full flex items-center justify-center gap-2 text-xs font-semibold text-white rounded-lg px-3 py-2.5 font-body disabled:opacity-70 mb-4 transition-colors ${
                  saved ? "bg-green dark:bg-emerald-600" : "bg-blue hover:bg-blue/90"
                }`}
              >
                {saved ? (
                  <>
                    <CheckCircle2 size={14} /> Guardado en Mis Flujos
                  </>
                ) : saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Guardando…
                  </>
                ) : (
                  "Guardar en Mis Flujos"
                )}
              </button>

              <p className="text-xs font-semibold text-ink dark:text-white font-body mb-3">Generación de documentos</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleGenerarReporte}
                  disabled={reportLoading}
                  className="flex items-center gap-2 text-xs font-medium text-ink dark:text-white border border-border dark:border-navyCard rounded-lg px-3 py-2.5 font-body bg-bg dark:bg-navyDeep hover:border-muted transition-colors disabled:opacity-70"
                >
                  {reportLoading ? (
                    <Loader2 size={14} className="animate-spin text-red" />
                  ) : (
                    <FileText size={14} className="text-red" />
                  )}
                  {reportLoading ? "Generando reporte…" : "Reporte de Eficiencia (con IA)"}
                </button>
                <button className="flex items-center gap-2 text-xs font-medium text-ink dark:text-white border border-border dark:border-navyCard rounded-lg px-3 py-2.5 font-body bg-bg dark:bg-navyDeep hover:border-muted transition-colors">
                  <FileDown size={14} className="text-blue" /> Plantilla de Carta (Word)
                </button>
              </div>
              {reportText && (
                <div className="mt-3 rounded-lg border border-border dark:border-navyCard bg-bg dark:bg-navyDeep p-3 max-h-48 overflow-auto">
                  <p className="text-[11px] leading-relaxed text-muted dark:text-faint font-body whitespace-pre-wrap">
                    {reportText}
                  </p>
                  <p className="text-[10px] text-green dark:text-emerald-400 font-body mt-2">
                    ✓ Guardado permanentemente — disponible en Reportes → "Insights de IA guardados"
                  </p>
                </div>
              )}
              <p className="text-[11px] text-faint font-body mt-2">
                Generación real de PDF descargable: próxima etapa del backend.
              </p>
            </div>
          )}
        </div>

        {/* Lienzo React Flow */}
        <div className="flex-1 relative bg-bg dark:bg-navyDeep transition-colors">
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
            <Background color="#64708A" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={() => "#2F6FED"}
              maskColor="rgba(15, 27, 51, 0.6)"
              className="bg-white dark:bg-navy border border-border dark:border-navyCard rounded-lg"
            />
          </ReactFlow>
        </div>
      </div>
    </AppShell>
  );
}