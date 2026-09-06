import { useEffect, useState, useRef } from "react";
import { Loader2, Sun, Moon, Monitor, Camera, X, ZoomIn, Building2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import AppShell, { TopBar } from "../components/AppShell";
import { Card, Avatar, Pill } from "../components/ui";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";

function initialsFromName(name) {
  if (!name) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Configuracion() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const fileInputRef = useRef(null);

  // --- Organización: sector/industria + jerarquía real de roles ---
  // Esto es el contexto que se le pasa a la IA al generar flujos, para que
  // no asuma gerentes, juntas directivas u otros roles que esta empresa en
  // particular no tenga, y para que el vocabulario encaje con su sector.
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState("");
  const [industria, setIndustria] = useState("");
  const [niveles, setNiveles] = useState([""]);
  const [savingOrg, setSavingOrg] = useState(false);
  const [savedOrg, setSavedOrg] = useState(false);

  const fullName = user?.nombre_completo || user?.name || "Usuario";
  const username = user?.username || "usuario";

  const [avatarUrl, setAvatarUrl] = useState(() => {
    return localStorage.getItem("user_avatar") || user?.avatarUrl || "";
  });

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

  useEffect(() => {
    let cancelled = false;
    api
      .getMyOrganization()
      .then((res) => {
        if (cancelled) return;
        const org = res.organization;
        setIndustria(org?.tipo_industria || "");
        setNiveles(org?.jerarquia?.length ? org.jerarquia : [""]);
      })
      .catch((err) => !cancelled && setOrgError(err.message || "No se pudo cargar la organización."))
      .finally(() => !cancelled && setOrgLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNivelChange = (idx, value) => {
    setSavedOrg(false);
    setNiveles((n) => n.map((v, i) => (i === idx ? value : v)));
  };

  const handleAddNivel = () => {
    setSavedOrg(false);
    setNiveles((n) => n.concat(""));
  };

  const handleRemoveNivel = (idx) => {
    setSavedOrg(false);
    setNiveles((n) => (n.length > 1 ? n.filter((_, i) => i !== idx) : n));
  };

  const handleGuardarOrganizacion = async () => {
    const jerarquiaLimpia = niveles.map((n) => n.trim()).filter(Boolean);
    if (jerarquiaLimpia.length === 0) {
      setOrgError("Agrega al menos un nivel de tu organización (ej. \"Empleado\").");
      return;
    }
    setSavingOrg(true);
    setOrgError("");
    try {
      await api.updateMyOrganization({ tipo_industria: industria.trim(), jerarquia: jerarquiaLimpia });
      setNiveles(jerarquiaLimpia);
      setSavedOrg(true);
    } catch (err) {
      setOrgError(err.message || "No se pudo guardar la organización.");
    } finally {
      setSavingOrg(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      setAvatarUrl(base64Image);
      localStorage.setItem("user_avatar", base64Image);
    };
    reader.readAsDataURL(file);
  };

  const themeOptions = [
    { id: "light", label: "Claro", icon: Sun },
    { id: "dark", label: "Oscuro", icon: Moon },
    { id: "system", label: "Sistema", icon: Monitor },
  ];

  return (
    <AppShell>
      <TopBar title="Configuración" subtitle="Cuenta, equipo e integraciones." />
      <div className="flex-1 overflow-auto p-8 max-w-2xl w-full">
        {/* Card de Perfil */}
        <Card className="p-6 mb-6">
          <h2 className="text-sm font-semibold font-display text-ink dark:text-white mb-4">Perfil</h2>
          <div className="flex items-center gap-4">
            {/* Foto con trigger de Zoom */}
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => avatarUrl && setIsZoomOpen(true)}
              title={avatarUrl ? "Clic para ver en grande" : "Sin foto de perfil"}
            >
              <Avatar initials={initialsFromName(fullName)} src={avatarUrl} size={56} />
              {avatarUrl && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={18} className="text-white" />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col justify-center">
              {/* Nombre Completo en grande */}
              <h3 className="text-lg font-bold text-ink dark:text-white font-display leading-tight">
                {fullName}
              </h3>

              {/* Nombre de usuario en pequeño */}
              <p className="text-xs text-muted dark:text-faint font-body mt-0.5">
                @{username}
              </p>

              {/* Botón cambiar foto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue hover:underline cursor-pointer font-body mt-2 text-left w-fit"
              >
                Cambiar foto
              </button>
            </div>
          </div>
        </Card>

        {/* Card de Apariencia */}
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

        {/* Card de Organización — contexto real para la IA (sector + jerarquía) */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={15} className="text-blue" />
            <h2 className="text-sm font-semibold font-display text-ink dark:text-white">
              Organización
            </h2>
          </div>
          <p className="text-xs text-muted dark:text-faint font-body mb-4">
            Este es el contexto real que usa la IA al generar flujos: solo usará los roles que
            definas aquí (si no tienes "Gerente" o "Junta Directiva", no aparecerán) y adaptará el
            vocabulario al sector que indiques.
          </p>

          {orgLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted dark:text-faint font-body">
              <Loader2 size={13} className="animate-spin" /> Cargando organización…
            </div>
          ) : (
            <>
              <label className="text-xs font-semibold text-ink dark:text-white font-body mb-1.5 block">
                Sector / tipo de empresa
              </label>
              {isAdmin ? (
                <input
                  value={industria}
                  onChange={(e) => {
                    setIndustria(e.target.value);
                    setSavedOrg(false);
                  }}
                  placeholder='Ej. "Restaurante", "Clínica dental", "Software", "Retail"…'
                  className="w-full text-sm rounded-lg border border-border dark:border-navyCard bg-bg dark:bg-navyDeep p-2.5 text-ink dark:text-white font-body outline-none focus:border-blue mb-4 transition-colors"
                />
              ) : (
                <p className="text-sm text-ink dark:text-white font-body mb-4">
                  {industria || "Sin definir"}
                </p>
              )}

              <label className="text-xs font-semibold text-ink dark:text-white font-body mb-1.5 block">
                Jerarquía de roles (de menor a mayor autoridad)
              </label>

              {isAdmin ? (
                <>
                  <div className="flex flex-col gap-2 mb-3">
                    {niveles.map((nivel, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[11px] text-faint font-body w-4 shrink-0">{idx + 1}.</span>
                        <input
                          value={nivel}
                          onChange={(e) => handleNivelChange(idx, e.target.value)}
                          placeholder={idx === 0 ? "Ej. Empleado" : "Ej. Dueño del negocio"}
                          className="flex-1 text-sm rounded-lg border border-border dark:border-navyCard bg-bg dark:bg-navyDeep p-2 text-ink dark:text-white font-body outline-none focus:border-blue transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNivel(idx)}
                          disabled={niveles.length <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red border border-red/20 bg-redSoft dark:bg-red/10 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNivel}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue border border-blue/30 rounded-lg px-3 py-2 font-body bg-blueSoft dark:bg-blue/10 hover:opacity-90 transition-colors cursor-pointer mb-4"
                  >
                    <Plus size={13} /> Agregar nivel
                  </button>

                  {orgError && <p className="text-xs text-red font-body mb-3">{orgError}</p>}

                  <button
                    type="button"
                    onClick={handleGuardarOrganizacion}
                    disabled={savingOrg}
                    className={`flex items-center justify-center gap-2 text-xs font-semibold text-white rounded-lg px-4 py-2.5 font-body disabled:opacity-70 transition-colors cursor-pointer ${
                      savedOrg ? "bg-green dark:bg-emerald-600" : "bg-blue hover:bg-blue/90"
                    }`}
                  >
                    {savingOrg ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Guardando…
                      </>
                    ) : savedOrg ? (
                      <>
                        <CheckCircle2 size={13} /> Guardado
                      </>
                    ) : (
                      "Guardar organización"
                    )}
                  </button>
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {niveles.filter(Boolean).map((nivel, idx) => (
                    <Pill key={idx} tone="blue">
                      {nivel}
                    </Pill>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Card de Equipo */}
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

      {/* Modal de Zoom de la Foto */}
      {isZoomOpen && avatarUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-sm w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón para cerrar */}
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Imagen ampliada */}
            <img
              src={avatarUrl}
              alt="Foto de perfil ampliada"
              className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-2xl border-2 border-white/20"
            />

            {/* Botón para cambiar foto desde el zoom */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => {
                  setIsZoomOpen(false);
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue text-white text-xs font-semibold font-body hover:bg-blue/90 transition-colors cursor-pointer"
              >
                <Camera size={14} /> Cambiar foto
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}