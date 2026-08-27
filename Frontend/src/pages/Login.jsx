import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Logo, Avatar } from "../components/ui";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("sofia@smartflow.ai");
  const [password, setPassword] = useState("smartflow123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirigir automáticamente cuando se confirme la autenticación
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      // La redirección la maneja automáticamente el useEffect al activarse isAuthenticated
    } catch (err) {
      setError(err?.message || "Credenciales incorrectas o problema de conexión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-bg dark:bg-navyDeep transition-colors font-body">
      {/* Columna Izquierda: Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-navyDeep dark:bg-navy text-white transition-colors">
        <div>
          <Logo light />
        </div>

        <div className="max-w-md">
          <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase font-body">
            Automatización de procesos • PyMEs
          </span>
          <h1 className="text-3xl font-bold font-display mt-3 mb-4 leading-tight">
            Diseña y automatiza procesos en minutos, no en semanas.
          </h1>
          <p className="text-sm text-faint leading-relaxed font-body">
            Describe tu proceso en lenguaje natural. SmartFlow AI genera el flujo, detecta
            cuellos de botella y te deja los documentos listos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Avatar initials="SD" tone="bg-blue" size={28} />
          <Avatar initials="WC" tone="bg-green" size={28} />
          <span className="text-xs text-faint font-body">
            Proyecto académico - Procesos inteligentes
          </span>
        </div>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white dark:bg-navyDeep transition-colors">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>

          <p className="text-xs font-medium text-center text-muted dark:text-faint font-body mb-6">
            Accede a tu panel de flujos y procesos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-faint"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                disabled={submitting}
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border dark:border-navyCard bg-bg dark:bg-navy text-ink dark:text-white font-body outline-none focus:border-blue dark:focus:border-blue transition-colors placeholder:text-muted/60 dark:placeholder:text-faint/50 disabled:opacity-50"
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-faint"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={submitting}
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border dark:border-navyCard bg-bg dark:bg-navy text-ink dark:text-white font-body outline-none focus:border-blue dark:focus:border-blue transition-colors placeholder:text-muted/60 dark:placeholder:text-faint/50 disabled:opacity-50"
              />
            </div>

            {error && <p className="text-xs text-red font-body text-center">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-navy dark:bg-blue hover:opacity-90 text-white font-semibold text-sm font-body flex items-center justify-center gap-2 transition-all cursor-pointer shadow-soft disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Iniciando sesión…</span>
                </>
              ) : (
                <>
                  <span>Entrar al panel</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-center text-muted dark:text-faint font-body mt-8">
            Demo: <span className="text-ink dark:text-white font-medium">sofia@smartflow.ai</span> / <span className="text-ink dark:text-white font-medium">smartflow123</span>
          </p>
        </div>
      </div>
    </div>
  );
}