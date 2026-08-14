import AppShell, { TopBar } from "../components/AppShell";
import { Card, Avatar } from "../components/ui";

export default function Configuracion() {
  return (
    <AppShell>
      <TopBar title="Configuración" subtitle="Cuenta, equipo e integraciones." />
      <div className="flex-1 overflow-auto p-8 max-w-2xl">
        <Card className="p-6 mb-6">
          <h2 className="text-sm font-semibold font-display text-ink mb-4">Perfil</h2>
          <div className="flex items-center gap-4">
            <Avatar initials="SD" />
            <div>
              <p className="text-sm font-medium text-ink font-body">Sofía Dávila</p>
              <p className="text-xs text-muted font-body">Administradora</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-sm font-semibold font-display text-ink mb-2">Equipo</h2>
          <p className="text-xs text-muted font-body mb-4">
            Roles y permisos se gestionarán aquí una vez conectado el backend (JWT + roles).
          </p>
          <div className="flex flex-col gap-3">
            {[{ n: "Sofía Dávila", r: "Admin" }, { n: "Wilder Cardoza", r: "Editor" }].map((m) => (
              <div key={m.n} className="flex items-center justify-between text-sm font-body">
                <span className="text-ink">{m.n}</span>
                <span className="text-muted">{m.r}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
