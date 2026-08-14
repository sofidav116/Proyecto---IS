import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MisFlujos from "./pages/MisFlujos";
import CrearFlujo from "./pages/CrearFlujo";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/flujos" element={<MisFlujos />} />
        <Route path="/flujos/nuevo" element={<CrearFlujo />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
