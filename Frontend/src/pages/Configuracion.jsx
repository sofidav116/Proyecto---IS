import { useEffect, useState } from "react";
import { Loader2, Sun, Moon, Monitor } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import { Card, Avatar } from "../components/ui";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";

function initialsFromName(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export default function Configuracion() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (selectedTheme) => {
      const isDark =
        selectedTheme === "dark" ||
        (selectedTheme === "system" && systemQuery.matches);
      root.classList.toggle("dark", isDark);
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    const handleSystemChange = () => {
      if (theme === "system") applyTheme("system");
    };

    systemQuery.addEventListener("change", handleSystemChange);
    return () => systemQuery.removeEventListener("change", handleSystemChange);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    api
      .getUsers()
      .then((res) => !cancelled && setTeam(res.users))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const themeOptions = [
    { id: "light", label: "Claro", icon: Sun },
    { id: "dark", label: "Oscuro", icon: Moon },
    { id: "system", label: "Sistema", icon: Monitor },
  ];

  return (
    <AppShell>
      <TopBar title="Configuración" subtitle="Cuenta, equipo e integraciones." />
      <div className="flex-1 overflow-auto p-8 max-w-2xl w-full">
        <Card className="p-6 mb-6">
          <h2 className="text-sm font-semibold font-display text-ink dark:text-white mb-4">Perfil</h2>
          <div className="flex items-center gap-4">
            <Avatar initials={initialsFromName(user?.name)} />
            <div>
              <p className="text-sm font-medium text-ink dark:text-white font-body">{user?.name}</p>
              <p className="text-xs text-muted dark:text-faint font-body">{user?.role}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-sm font-semibold font-display text-ink dark:text-white mb-1">Apariencia</h2>
          <p className="text-xs text-muted dark:text-faint font-body mb-4">
            Selecciona el tema de la interfaz o sincronízalo con tu sistema operativo.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map(({ id, label, icon: Icon }) => {
              const isActive = theme === id;
              return (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  type="button"
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium font-body transition-all cursor-pointer ${
                    isActive
                      ? "border-blue bg-blueSoft dark:bg-blue/20 text-blue dark:text-white font-semibold"
                      : "border-border dark:border-navyCard text-muted dark:text-faint hover:text-ink dark:hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold font-display text-ink dark:text-white mb-2">Equipo</h2>
          <p className="text-xs text-muted dark:text-faint font-body mb-4">
            Roles y permisos vienen del backend. Cuando conectemos PostgreSQL y JWT real
            con bcrypt, esto seguirá funcionando igual.
          </p>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted dark:text-faint font-body">
              <Loader2 size={13} className="animate-spin" /> Cargando equipo…
            </div>
          )}
          {error && <p className="text-xs text-red font-body">Error: {error}</p>}
          <div className="flex flex-col gap-3">
            {team.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm font-body">
                <span className="text-ink dark:text-white">{m.name}</span>
                <span className="text-muted dark:text-faint">{m.role}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}