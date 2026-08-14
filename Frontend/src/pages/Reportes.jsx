import { AlertTriangle } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import { Card } from "../components/ui";

const BOTTLENECKS = [
  { paso: "Revisión de RRHH", flujo: "Solicitud de Vacaciones", tiempo: "72h", riesgo: "Alto" },
  { paso: "Aprobación de Presupuesto", flujo: "Revisión de Gastos", tiempo: "48h", riesgo: "Medio" },
  { paso: "Validación de Documentos", flujo: "Aprobación de Beneficio", tiempo: "24h", riesgo: "Bajo" },
];

export default function Reportes() {
  return (
    <AppShell>
      <TopBar title="Reportes de Eficiencia" subtitle="Cuellos de botella y tiempos detectados por la IA." />
      <div className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-3 gap-5 mb-6">
          {[
            { label: "Flujos analizados", value: "3" },
            { label: "Tiempo promedio de proceso", value: "1.6 días" },
            { label: "Cuellos de botella detectados", value: "3" },
          ].map((k) => (
            <Card key={k.label} className="p-5">
              <p className="text-xs text-muted font-body mb-1.5">{k.label}</p>
              <p className="text-2xl font-semibold font-display text-ink">{k.value}</p>
            </Card>
          ))}
        </div>

        <Card>
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr] px-6 py-3 text-xs font-semibold text-muted bg-bg font-body">
            <span>Paso</span><span>Flujo</span><span>Tiempo promedio</span><span>Riesgo</span>
          </div>
          {BOTTLENECKS.map((b, idx) => (
            <div key={b.paso} className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center px-6 py-4"
              style={{ borderTop: idx > 0 ? "1px solid #E4E8F1" : "none" }}>
              <span className="text-sm font-medium text-ink font-body">{b.paso}</span>
              <span className="text-sm text-muted font-body">{b.flujo}</span>
              <span className="text-sm text-muted font-mono">{b.tiempo}</span>
              <span className={`flex items-center gap-1.5 text-xs font-semibold font-body ${
                b.riesgo === "Alto" ? "text-red" : b.riesgo === "Medio" ? "text-amber" : "text-green"
              }`}>
                <AlertTriangle size={13} /> {b.riesgo}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  );
}
