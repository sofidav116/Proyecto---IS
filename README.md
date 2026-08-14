# SmartFlow AI — Frontend + Backend conectados

Esta versión de la app trae el **frontend** (React + Vite + Tailwind + React Flow) y el
**backend** (Node.js + Express, datos en memoria por ahora, pronto se conectarán al servidor) ya conectados entre sí.

## 1. Levantar el backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Queda corriendo en `http://localhost:4000`. Prueba que responde:
`curl http://localhost:4000/api/health` → `{"status":"ok"}`

## 2. Levantar el frontend (en otra terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173`.

## 3. Iniciar sesión

Usa cualquiera de estos usuarios de prueba (definidos en `backend/src/data/store.js`):

| Email                 | Password       |
|------------------------|----------------|
| sofia@smartflow.ai     | smartflow123   |
| wilder@smartflow.ai    | smartflow123   |

## Cómo quedaron conectados

- **`frontend/src/lib/api.js`** — cliente HTTP único, lee `VITE_API_URL` (por
  defecto `http://localhost:4000/api`) y agrega el header `Authorization: Bearer <token>`
  automáticamente en cada request.
- **`frontend/src/lib/AuthContext.jsx`** — guarda el token en `localStorage`,
  expone `login()` / `logout()` / `user` a toda la app, y valida la sesión
  contra `GET /api/auth/me` al recargar la página.
- **`App.jsx`** — todas las rutas privadas (`/dashboard`, `/flujos`, etc.)
  están envueltas en `<ProtectedRoute>`, que redirige a `/` si no hay sesión.
- **`Login.jsx`** → `POST /api/auth/login`
- **`Dashboard.jsx`** → `GET /api/dashboard/kpis` + `GET /api/dashboard/recent-flows`
- **`MisFlujos.jsx`** → `GET /api/flows`
- **`CrearFlujo.jsx`** → `POST /api/ai/generate-flow` para generar el diagrama
  (hoy simulado en el backend; el botón "Guardar en Mis Flujos" hace
  `POST /api/flows` para persistirlo)
- **`Reportes.jsx`** → `GET /api/reports/summary` + `GET /api/reports/bottlenecks`
- **`Configuracion.jsx`** → `GET /api/users` + datos del usuario logueado


## Siguientes etapas 

1. **PostgreSQL** real en el backend (hoy usa un arreglo en memoria).
2. **JWT real** con `jsonwebtoken` + hash de contraseñas con `bcrypt` (hoy el
   "token" es un string simple `demo-token::<id>`, suficiente para desarrollar
   pero no para producción).
3. **Vertex AI + Gemini** real en `backend/src/services/ai.service.js`
   (hoy genera el flujo con una lógica simulada, pero el contrato de
   respuesta ya está definido para no tener que tocar el frontend).
4. **Contenedores** para empaquetar backend + PostgreSQL.
5. Generación real de PDF/Word desde `CrearFlujo.jsx`.
