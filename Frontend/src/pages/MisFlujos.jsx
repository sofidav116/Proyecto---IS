import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Workflow, ChevronRight, Search, Loader2 } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import { Card, Pill } from "../components/ui";
import { api } from "../lib/api";

export default function MisFlujos() {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .getFlows()
      .then((res) => !cancelled && setFlows(res.flows))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <TopBar
        title="Mis Flujos"
        subtitle="Procesos que has creado o generado con IA."
        right={
          <div className="flex items-center gap-2 rounded-lg px-3 border border-border" style={{ height: 34 }}>
            <Search size={13} className="text-faint" />
            <span className="text-xs text-faint font-body">Buscar flujo…</span>
          </div>
        }
      />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted font-body">
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Cargando…</span>
            ) : (
              `${flows.length} flujos en total`
            )}
          </p>
          <Link
            to="/flujos/nuevo"
            className="rounded-lg text-sm font-semibold text-white px-4 py-2.5 flex items-center gap-2 font-body"
            style={{ background: "#2F6FED" }}
          >
            <PlusCircle size={15} /> Nuevo Flujo
          </Link>
        </div>

        {error && <p className="text-sm text-red font-body mb-4">Error: {error}</p>}

        <Card>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] px-6 py-3 text-xs font-semibold text-muted bg-bg font-body">
            <span>Nombre</span><span>Fecha de creación</span><span>Pasos</span><span>Estado</span><span></span>
          </div>
          {flows.map((f, idx) => (
            <div
              key={f.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] items-center px-6 py-4"
              style={{ borderTop: idx > 0 ? "1px solid #E4E8F1" : "none" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg bg-blueSoft" style={{ width: 32, height: 32 }}>
                  <Workflow size={15} className="text-blue" />
                </div>
                <span className="text-sm font-medium text-ink font-body">{f.nombre}</span>
              </div>
              <span className="text-sm text-muted font-body">{f.fecha}</span>
              <span className="text-sm text-muted font-body">{f.pasos}</span>
              <Pill tone={f.estado === "Activo" ? "green" : "amber"}>{f.estado}</Pill>
              <Link to="/flujos/nuevo" className="flex items-center gap-1 text-xs font-medium text-blue justify-end font-body">
                Abrir <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  );
}
