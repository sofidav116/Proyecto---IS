import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Workflow, PlusCircle, BarChart3, Settings, LogOut, Bell,
} from "lucide-react";
import { Logo, Avatar } from "./ui";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/flujos", icon: Workflow, label: "Mis Flujos" },
  { to: "/flujos/nuevo", icon: PlusCircle, label: "Crear Nuevo" },
  { to: "/reportes", icon: BarChart3, label: "Reportes" },
  { to: "/configuracion", icon: Settings, label: "Configuración" },
];

export const TopBar = ({ title, subtitle, right }) => (
  <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-white">
    <div>
      <h1 className="text-lg font-semibold font-display text-ink">{title}</h1>
      {subtitle && <p className="text-xs mt-0.5 text-muted font-body">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-4">
      {right}
      <Bell size={18} className="text-muted" />
      <Avatar initials="SD" />
    </div>
  </div>
);

export default function AppShell({ children }) {
  return (
    <div className="w-full min-h-screen flex bg-bg font-body">
      <aside
        className="w-[220px] shrink-0 flex flex-col justify-between py-6 px-4"
        style={{ background: "#0F1B33" }}
      >
        <div>
          <div className="px-1 mb-8"><Logo light /></div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body transition-colors ${
                    isActive ? "bg-[rgba(47,111,237,0.18)] text-white font-semibold" : "text-faint hover:text-white"
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div>
          <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-faint font-body cursor-pointer hover:text-white">
            <LogOut size={16} /> Cerrar sesión
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
