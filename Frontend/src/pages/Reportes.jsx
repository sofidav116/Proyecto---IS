import { useEffect, useState } from "react";
import {
  FileText,
  Lock,
  Loader2,
  Calendar,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Layers,
} from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import { api } from "../lib/api";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const ANIOS = ["2024", "2025", "2026", "2027"];

export default function Reportes() {
  const [activeTab, setActiveTab] = useState("djm");
  const [mes, setMes] = useState("Marzo");
  const [anio, setAnio] = useState("2026");
  const [loading, setLoading] = useState(false);
  const [hasPreview, setHasPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  // Fase 4: "Reportes de la IA guardado" — insights ya generados y persistidos
  // (campo CLOB en el backend), no se regeneran al entrar a esta pantalla.
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");
  const [expandedInsight, setExpandedInsight] = useState(null);

  useEffect(() => {
    if (activeTab !== "insights-ia") return;
    setInsightsLoading(true);
    setInsightsError("");
    api
      .getInsights()
      .then((res) => setInsights(res.insights || []))
      .catch((err) => setInsightsError(err.message || "No se pudieron cargar los reportes de IA."))
      .finally(() => setInsightsLoading(false));
  }, [activeTab]);

  const handleGenerarPreview = () => {
    setLoading(true);
    setTimeout(() => {
      setPreviewData([
        { id: "DJM-001", concepto: `Declaración Jurada de IVA - ${mes} ${anio}`, monto: "$4,250.00", impuesto: "$765.00", estado: "Procesado" },
        { id: "DJM-002", concepto: "Retenciones Impuesto a la Renta", monto: "$1,840.00", impuesto: "$331.20", estado: "Procesado" },
        { id: "DJM-003", concepto: "Descargos de Facturación Electrónica", monto: "$920.00", impuesto: "$165.60", estado: "Pendiente" },
        { id: "DJM-004", concepto: "Ajustes Coeficiente de Transformación", monto: "$3,100.00", impuesto: "$558.00", estado: "Procesado" },
      ]);
      setHasPreview(true);
      setLoading(false);
    }, 600);
  };

  const handleCerrarMes = () => {
    if (confirm(`¿Estás seguro de cerrar el mes de ${mes} ${anio} definitivamente?`)) {
      alert(`El periodo ${mes} ${anio} ha sido cerrado exitosamente.`);
    }
  };

  return (
    <AppShell>
      <TopBar
        title="Generador de Reportes y DJM"
        subtitle="Generación, vista previa y cierre mensual de declaraciones fiscales."
      />

      <div className="flex-1 overflow-auto p-6 md:p-8 w-full max-w-7xl mx-auto font-body">
        
        {/* Navegación por Pestañas */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 mb-8 flex gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: "djm", label: "Declaración Jurada Mensual" },
            { id: "descargos", label: "Reporte de Descargos" },
            { id: "ict", label: "ICT (Coeficiente Transformación)" },
            { id: "insights-ia", label: "Insights de IA Guardados" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setHasPreview(false);
                }}
                className={`pb-3 px-1 text-sm font-medium transition-all cursor-pointer whitespace-nowrap relative flex items-center gap-2 ${
                  isActive
                    ? "text-red-600 dark:text-red-500 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-500 dark:to-rose-400 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Grid Principal (items-stretch asegura igual altura para ambos paneles) */}
        {activeTab === "insights-ia" ? (
          /* Fase 4: lista de reportes de IA ya guardados, filtrados por
             organización en el backend. No se regeneran, solo se consultan. */
          <div className="bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-wide">
                  Reportes de IA Guardados
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generados desde "Crear Flujo" y guardados permanentemente para tu organización.
                </p>
              </div>
            </div>

            {insightsLoading && (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 size={16} className="animate-spin" /> Cargando reportes guardados…
              </div>
            )}

            {!insightsLoading && insightsError && (
              <p className="text-sm text-red-600 dark:text-red-400 py-6 text-center">{insightsError}</p>
            )}

            {!insightsLoading && !insightsError && insights.length === 0 && (
              <div className="text-center py-12 px-4 space-y-2 max-w-md mx-auto">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-3xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 shadow-inner">
                  <Sparkles size={36} strokeWidth={1.2} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Todavía no hay reportes de IA guardados
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ve a "Crear Flujo" y genera un "Reporte de Eficiencia (con IA)" — quedará aquí guardado.
                </p>
              </div>
            )}

            {!insightsLoading && !insightsError && insights.length > 0 && (
              <div className="space-y-3">
                {insights.map((insight) => {
                  const isOpen = expandedInsight === insight.id;
                  return (
                    <div
                      key={insight.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0b0f19]/60 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedInsight(isOpen ? null : insight.id)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{insight.titulo}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {new Date(insight.generatedEn).toLocaleString("es-GT")}
                            {insight.ahorroEstimadoHoras != null && ` · Ahorro estimado: ${insight.ahorroEstimadoHoras}h`}
                          </p>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-body">
                            {insight.reporteTexto}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* PANEL IZQUIERDO: Parámetros */}
          <div className="lg:col-span-4 bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-2xl backdrop-blur-xl flex flex-col justify-between h-full min-h-[480px]">
            <div>
              <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-500">
                  <Calendar size={18} />
                </div>
                <h2 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-wide">
                  Parámetros del Reporte
                </h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {/* Selector de Mes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      Mes
                    </label>
                    <div className="relative">
                      <select
                        value={mes}
                        onChange={(e) => {
                          setMes(e.target.value);
                          setHasPreview(false);
                        }}
                        className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-all appearance-none cursor-pointer"
                      >
                        {MESES.map((m) => (
                          <option key={m} value={m} className="bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white">{m}</option>
                        ))}
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Selector de Año */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      Año
                    </label>
                    <div className="relative">
                      <select
                        value={anio}
                        onChange={(e) => {
                          setAnio(e.target.value);
                          setHasPreview(false);
                        }}
                        className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-all appearance-none cursor-pointer"
                      >
                        {ANIOS.map((a) => (
                          <option key={a} value={a} className="bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white">{a}</option>
                        ))}
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Botón Generar Vista Previa */}
                <button
                  type="button"
                  onClick={handleGenerarPreview}
                  disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-red-600/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generar Vista Previa</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sección Inferior de Cierre */}
            <div className="pt-6">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-white dark:bg-[#111827] px-2 text-slate-400 dark:text-slate-500 font-semibold">Cierre de periodo</span>
                </div>
              </div>

              {/* Botón Cerrar Mes Definitivamente */}
              <button
                type="button"
                onClick={handleCerrarMes}
                className="w-full bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/60 hover:border-rose-300 dark:hover:border-rose-500/40 font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer group"
              >
                <Lock size={15} className="text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors" />
                <span>Cerrar Mes Definitivamente</span>
              </button>
            </div>
          </div>

          {/* PANEL DERECHO: Vista Previa */}
          <div className="lg:col-span-8 bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-2xl backdrop-blur-xl flex flex-col justify-between h-full min-h-[480px]">
            
            {/* Header de Vista Previa */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Layers size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-wide">
                    Vista Previa
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {hasPreview ? `${previewData.length} registros generados para ${mes} ${anio}` : "Sin registros cargados"}
                  </p>
                </div>
              </div>

              {/* Botones de Descarga */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  disabled={!hasPreview}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:hover:bg-red-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:cursor-not-allowed"
                >
                  <FileText size={14} />
                  <span>PDF DJM</span>
                </button>
                <button
                  disabled={!hasPreview}
                  className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Excel DJM</span>
                </button>
              </div>
            </div>

            {/* Cuerpo: Estado Vacío o Tabla de Datos */}
            <div className="flex-1 flex flex-col justify-center py-6">
              {!hasPreview ? (
                /* Estado Vacío Limpio */
                <div className="text-center py-12 px-4 space-y-4 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-3xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 shadow-inner">
                    <FileText size={36} strokeWidth={1.2} className="text-slate-400 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                      No hay datos generados en vista previa
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Selecciona el mes y año deseados en el panel izquierdo y haz clic en <span className="text-red-600 dark:text-red-400 font-medium">"Generar Vista Previa"</span>.
                    </p>
                  </div>
                </div>
              ) : (
                /* Tabla de Datos */
                <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0b0f19]/60">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3.5 px-4">Código</th>
                          <th className="py-3.5 px-4">Concepto</th>
                          <th className="py-3.5 px-4 text-right">Monto Base</th>
                          <th className="py-3.5 px-4 text-right">Impuesto</th>
                          <th className="py-3.5 px-4 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-body">
                        {previewData.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 font-medium">{row.id}</td>
                            <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium">{row.concepto}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-200">{row.monto}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{row.impuesto}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                  row.estado === "Procesado"
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                                }`}
                              >
                                <CheckCircle2 size={11} />
                                {row.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Informativo */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Sistema SmartFlow AI v2.4</span>
              <span>Última sincronización: Hoy</span>
            </div>

          </div>

        </div>
        )}
      </div>
    </AppShell>
  );
}