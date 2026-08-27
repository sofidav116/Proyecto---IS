import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import { Card } from "../components/ui";
import { api } from "../lib/api";

export default function Reportes() {
  const [summary, setSummary] = useState(null);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getReportsSummary(), api.getBottlenecks()])
      .then(([summaryRes, bottlenecksRes]) => {
        if (cancelled) return;
        setSummary(summaryRes.summary);
        setBottlenecks(bottlenecksRes.bottlenecks);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const kpiCards = summary
    ? [
        { label: "Flujos analizados", value: summary.flujosAnalizados },
        { label: "Tiempo promedio de proceso", value: summary.tiempoPromedioProceso },
        { label: "Cuellos de botella detectados", value: summary.cuellosDeBotella },
      ]
    : [];

  return (
    <AppShell>
      <TopBar title="Reportes de Eficiencia" subtitle="Cuellos de botella y tiempos detectados por la IA." />
      <div className="flex-1 overflow-auto p-8">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted font-body mb-6">
            <Loader2 size={14} className="animate-spin" /> Cargando reportes…
          </div>
        )}
        {error && <p className="text-sm text-red font-body mb-6">Error: {error}</p>}

        {summary && (
          <div className="grid grid-cols-3 gap-5 mb-6">
            {kpiCards.map((k) => (
              <Card key={k.label} className="p-5">
                <p className="text-xs text-muted font-body mb-1.5">{k.label}</p>
                <p className="text-2xl font-semibold font-display text-ink">{k.value}</p>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr] px-6 py-3 text-xs font-semibold text-muted bg-bg font-body">
            <span>Paso</span><span>Flujo</span><span>Tiempo promedio</span><span>Riesgo</span>
          </div>
          {bottlenecks.map((b, idx) => (
            <div key={`${b.paso}-${idx}`} className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center px-6 py-4"
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
