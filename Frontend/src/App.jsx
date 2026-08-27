import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MisFlujos from "./pages/MisFlujos";
import CrearFlujo from "./pages/CrearFlujo";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-bg">
        <p className="text-sm text-muted font-body">Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/flujos" element={<ProtectedRoute><MisFlujos /></ProtectedRoute>} />
      <Route path="/flujos/nuevo" element={<ProtectedRoute><CrearFlujo /></ProtectedRoute>} />
      <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}
