// "Base de datos" en memoria — solo para esta etapa (Node.js + Express puro).
// Cuando conectemos PostgreSQL, esto se reemplaza por consultas reales,
// pero la forma de los datos (y por lo tanto los endpoints) se mantiene igual.

export const users = [
  { id: "1", name: "Sofía Dávila", email: "sofia@smartflow.ai", password: "smartflow123", role: "Admin" },
  { id: "2", name: "Wilder Cardoza", email: "wilder@smartflow.ai", password: "smartflow123", role: "Editor" },
];

export const flows = [
  { id: "1", nombre: "Solicitud de Vacaciones", fecha: "12/06/2026", pasos: 6, estado: "Activo", ownerId: "1" },
  { id: "2", nombre: "Aprobación de Beneficio", fecha: "10/06/2026", pasos: 4, estado: "Activo", ownerId: "1" },
  { id: "3", nombre: "Revisión de Gastos", fecha: "05/06/2026", pasos: 5, estado: "Borrador", ownerId: "2" },
];

export const bottlenecks = [
  { paso: "Revisión de RRHH", flujo: "Solicitud de Vacaciones", tiempo: "72h", riesgo: "Alto" },
  { paso: "Aprobación de Presupuesto", flujo: "Revisión de Gastos", tiempo: "48h", riesgo: "Medio" },
  { paso: "Validación de Documentos", flujo: "Aprobación de Beneficio", tiempo: "24h", riesgo: "Bajo" },
];

export const kpis = {
  flujosActivos: { value: "3", delta: "+1 esta semana" },
  tiempoAhorrado: { value: "2h 30m", delta: "vs. proceso manual" },
  scoreOptimizacion: { value: "40", delta: "IA sugiere 2 mejoras" },
};

let nextFlowId = flows.length + 1;
export const generateFlowId = () => String(nextFlowId++);
