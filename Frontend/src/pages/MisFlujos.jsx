import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Workflow, ChevronRight, Search, Loader2 } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import { Card, Pill } from "../components/ui";
import { api } from "../lib/api";

// Flujos de respaldo si la API falla o no devuelve datos
const DEMO_FLOWS = [
  {
    id: "fl-01",
    nombre: "Declaración Jurada Mensual (DJM)",
    fecha: "2026-08-25",
    pasos: 8,
    estado: "Activo",
  },
  {
    id: "fl-02",
    nombre: "Aprobación de Órdenes de Compra",
    fecha: "2026-08-22",
    pasos: 5,
    estado: "Activo",
  },
  {
    id: "fl-03",
    nombre: "Onboarding de Nuevos Empleados",
    fecha: "2026-08-18",
    pasos: 6,
    estado: "En Pausa",
  },
  {
    id: "fl-04",
    nombre: "Revisión de Descargos e ICT",
    fecha: "2026-08-10",
    pasos: 4,
    estado: "Activo",
  },
];

export default function MisFlujos() {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .getFlows()
      .then((res) => {
        if (!cancelled) {
          const list = Array.isArray(res) ? res : res?.flows || [];
          setFlows(list.length > 0 ? list : DEMO_FLOWS);
        }
      })
      .catch(() => {
        // Fallback automático a datos demo si no hay sesión activa
        if (!cancelled) setFlows(DEMO_FLOWS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Filtrado reactivo mediante el buscador
  const filteredFlows = flows.filter(
    (f) =>
      f.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell>
      <TopBar
        title="Mis Flujos"
        subtitle="Procesos que has creado o generado con IA."
        right={
          <div className="flex items-center gap-2 rounded-xl px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm transition-colors h-[36px]">
            <Search size={14} className="text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar flujo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-36 sm:w-48 font-body"
            />
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 md:p-8 w-full max-w-7xl mx-auto font-body">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-blue-500" /> Cargando…
              </span>
            ) : (
              `${filteredFlows.length} flujos en total`
            )}
          </p>

          <Link
            to="/flujos/nuevo"
            className="rounded-xl text-sm font-semibold text-white px-4 py-2.5 flex items-center gap-2 font-body bg-blue-600 hover:bg-blue-500 transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-[0.98]"
          >
            <PlusCircle size={16} /> Nuevo Flujo
          </Link>
        </div>

        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-2xl bg-white dark:bg-[#111827]/90 backdrop-blur-xl">
          {/* Header de la Tabla */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 uppercase tracking-wider font-body">
            <span>Nombre</span>
            <span>Fecha de creación</span>
            <span>Pasos</span>
            <span>Estado</span>
            <span></span>
          </div>

          {/* Filas */}
          {filteredFlows.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              No se encontraron flujos coincidentes.
            </div>
          ) : (
            filteredFlows.map((f, idx) => (
              <div
                key={f.id || idx}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] items-center px-6 py-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-t border-slate-100 dark:border-slate-800/60 first:border-t-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 w-9 h-9 text-blue-600 dark:text-blue-400 shrink-0">
                    <Workflow size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white font-body">
                    {f.nombre}
                  </span>
                </div>

                <span className="text-xs text-slate-500 dark:text-slate-400 font-body font-mono">
                  {f.fecha}
                </span>

                <span className="text-sm text-slate-600 dark:text-slate-300 font-body font-medium">
                  {f.pasos} {f.pasos === 1 ? "paso" : "pasos"}
                </span>

                <div>
                  <Pill tone={f.estado === "Activo" ? "green" : "amber"}>
                    {f.estado}
                  </Pill>
                </div>

                <Link
                  to="/flujos/nuevo"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline justify-end font-body"
                >
                  Abrir <ChevronRight size={14} />
                </Link>
              </div>
            ))
          )}
        </Card>
      </div>
    </AppShell>
  );
}