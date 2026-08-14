# SmartFlow AI — Frontend (avance)

Plataforma inteligente de procesos. Este es el avance del **frontend**, construido con
React + Vite + Tailwind + React Router + React Flow, siguiendo el mockup y la
identidad visual del proyecto.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Pantallas incluidas

- **/** — Login (visual, sin autenticación real todavía)
- **/dashboard** — Panel principal con KPIs, flujos recientes y sugerencia de IA
- **/flujos** — Listado de "Mis Flujos"
- **/flujos/nuevo** — Constructor de flujos: describes el proceso en lenguaje natural,
  la IA (simulada por ahora) genera el diagrama con React Flow, y muestra insights
  de optimización + generación de documentos (PDF/Word)
- **/reportes** — Reportes de eficiencia y cuellos de botella
- **/configuracion** — Perfil y equipo

## Qué falta (siguiente etapa: backend)

Todo lo marcado con `TODO` o comentarios `// Simulación` en `src/pages/CrearFlujo.jsx`
y `src/pages/Login.jsx` se conecta luego a:

- Node.js + Express + PostgreSQL
- Login con JWT, roles y permisos, hash de contraseñas
- Endpoint `/api/ai/generate-flow` → Vertex AI + Gemini (IA protegida detrás del backend)
- Generación real de PDF/Word
- Auditoría y Secret Manager para credenciales

## Estructura

```
src/
  components/   AppShell (sidebar+topbar), ui.jsx (Pill, Avatar, Logo, Card)
  pages/        Login, Dashboard, MisFlujos, CrearFlujo, Reportes, Configuracion
  lib/          mockData.js (datos de ejemplo, hoy vienen del front, luego de la API)
```
