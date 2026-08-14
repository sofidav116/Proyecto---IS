import { Link } from "react-router-dom";
import { PlusCircle, Sparkles, TrendingUp, Clock, Gauge, ChevronRight } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import { Card, Pill } from "../components/ui";
import { FLOWS } from "../lib/mockData";

const KPIS = [
  { label: "Flujos activos", value: "3", delta: "+1 esta semana", icon: Gauge, tone: "text-blue" },
  { label: "Tiempo ahorrado", value: "2h 30m", delta: "vs. proceso manual", icon: Clock, tone: "text-green" },
  { label: "Score de optimización", value: "40", delta: "IA sugiere 2 mejoras", icon: TrendingUp, tone: "text-amber" },
];

export default function Dashboard() {
  return (
    <AppShell>
      <TopBar title="¡Bienvenida, Sofía! 👋" subtitle="Aquí tienes el resumen de la actividad de tus procesos." />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="grid grid-cols-3 gap-5 flex-1 mr-6">
            {KPIS.map((k) => (
              <Card key={k.label} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted font-body">{k.label}</p>
                  <k.icon size={15} className={k.tone} />
                </div>
                <p className={`text-2xl font-semibold font-display ${k.tone}`}>{k.value}</p>
                <p className="text-xs text-faint font-body mt-1">{k.delta}</p>
              </Card>
            ))}
          </div>
          <Link
            to="/flujos/nuevo"
            className="shrink-0 rounded-lg text-sm font-semibold text-white px-5 py-3 flex items-center gap-2 font-body"
            style={{ background: "#2F6FED" }}
          >
            <PlusCircle size={16} /> Nuevo Flujo
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold font-display text-ink">Mis Flujos</h2>
              <Link to="/flujos" className="text-xs text-blue font-body flex items-center gap-1">
                Ver todos <ChevronRight size={13} />
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {FLOWS.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink font-body">{f.nombre}</p>
                    <p className="text-xs text-muted font-body">{f.fecha} · {f.pasos} pasos</p>
                  </div>
                  <Pill tone={f.estado === "Activo" ? "green" : "amber"}>{f.estado}</Pill>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6" style={{ background: "linear-gradient(160deg, #0F1B33, #152449)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-blue" />
              <h2 className="text-sm font-semibold font-display text-white">Sugerencia de IA</h2>
            </div>
            <p className="text-xs leading-relaxed text-faint font-body mb-4">
              El paso "Revisión de RRHH" en tu flujo de vacaciones tiene un tiempo promedio de 72 horas.
              Automatizar la verificación de días con el sistema de nómina podría ahorrar hasta 48 horas.
            </p>
            <Link
              to="/flujos/nuevo"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              Ver detalle <ChevronRight size={12} />
            </Link>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
