// "Base de datos" en memoria — solo para esta etapa (Node.js + Express puro).
// Cuando conectemos PostgreSQL, esto se reemplaza por consultas reales,
// pero la forma de los datos (y por lo tanto los endpoints) se mantiene igual.

// Roles válidos en todo el sistema: solo estos dos.
export const ROLES = { ADMIN: "admin", USUARIO: "usuario" };

// Cada organización define su propia jerarquía (departamentos/niveles).
// Ese arreglo se usa después como contexto para el prompt de Vertex AI,
// así el flujo generado respeta la estructura real de esa empresa.
export const organizations = [
  {
    id: "org1",
    nombre: "SmartFlow Demo S.A.",
    tipo_industria: "Servicios",
    jerarquia: ["Empleado", "Jefe de Área", "Gerencia", "Dirección"],
  },
];

export const users = [
  { id: "1", name: "Sofía Dávila", email: "sofia@smartflow.ai", password: "smartflow123", role: ROLES.ADMIN, organizationId: "org1" },
  { id: "2", name: "Wilder Cardoza", email: "wilder@smartflow.ai", password: "smartflow123", role: ROLES.USUARIO, organizationId: "org1" },
];

export const flows = [
  { id: "1", nombre: "Solicitud de Vacaciones", fecha: "12/06/2026", pasos: 6, estado: "Activo", ownerId: "1", organizationId: "org1", tipo: "especifico" },
  { id: "2", nombre: "Aprobación de Beneficio", fecha: "10/06/2026", pasos: 4, estado: "Activo", ownerId: "1", organizationId: "org1", tipo: "especifico" },
  { id: "3", nombre: "Revisión de Gastos", fecha: "05/06/2026", pasos: 5, estado: "Borrador", ownerId: "2", organizationId: "org1", tipo: "general" },
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

let nextOrgId = organizations.length + 1;
export const generateOrgId = () => `org${nextOrgId++}`;

// Reportes/insights de la IA guardados de forma permanente (Fase 4).
// "reporteTexto" es el campo tipo CLOB: texto largo, no se regenera al consultarlo.
export const aiInsights = [];
let nextInsightId = 1;
export const generateInsightId = () => String(nextInsightId++);
