import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "../components/ui";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("sofia@smartflow.ai");
  const [password, setPassword] = useState("smartflow123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-bg font-body">
      <div
        className="hidden md:flex flex-col justify-between w-[42%] p-10"
        style={{ background: "linear-gradient(160deg, #0F1B33, #152449)" }}
      >
        <Logo light />
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] mb-3 text-faint font-mono">
            Automatización de procesos · Pymes
          </div>
          <h1 className="text-3xl leading-tight font-semibold mb-4 text-white font-display">
            Diseña y automatiza<br />procesos en minutos,<br />no en semanas.
          </h1>
          <p className="text-sm leading-relaxed max-w-[280px] text-faint font-body">
            Describe tu proceso en lenguaje natural. SmartFlow AI genera el flujo,
            detecta cuellos de botella y te deja los documentos listos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {["SD", "WC"].map((i, idx) => (
              <div
                key={i}
                className="rounded-full border-2 flex items-center justify-center text-[10px] font-semibold text-white font-display"
                style={{ width: 26, height: 26, borderColor: "#152449", background: idx ? "#12946B" : "#2F6FED" }}
              >
                {i}
              </div>
            ))}
          </div>
          <span className="text-xs text-faint font-body">Proyecto académico · Procesos inteligentes</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
          <div className="md:hidden mb-8"><Logo /></div>
          <h2 className="text-2xl font-semibold mb-1 text-ink font-display">Inicia sesión</h2>
          <p className="text-sm mb-8 text-muted font-body">Accede a tu panel de flujos y procesos.</p>

          <label className="text-xs font-medium mb-1.5 block text-ink font-body">Correo</label>
          <div className="flex items-center gap-2 rounded-lg px-3 mb-4 border border-border bg-white" style={{ height: 44 }}>
            <Mail size={16} className="text-faint" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@empresa.com"
              className="w-full text-sm outline-none text-ink font-body placeholder:text-faint"
            />
          </div>

          <label className="text-xs font-medium mb-1.5 block text-ink font-body">Contraseña</label>
          <div className="flex items-center gap-2 rounded-lg px-3 mb-2 border border-border bg-white" style={{ height: 44 }}>
            <Lock size={16} className="text-faint" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full text-sm outline-none text-ink font-body placeholder:text-faint"
            />
          </div>

          {error && <p className="text-xs text-red mb-4 font-body">{error}</p>}
          {!error && <div className="mb-6" />}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg text-sm font-semibold text-white py-3 flex items-center justify-center gap-2 font-body disabled:opacity-70"
            style={{ background: "#0F1B33" }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Entrando…
              </>
            ) : (
              <>
                Entrar al panel <ArrowRight size={15} />
              </>
            )}
          </button>

          <p className="text-xs text-center mt-5 text-faint font-body">
            Demo: sofia@smartflow.ai / smartflow123
          </p>
        </form>
      </div>
    </div>
  );
}
