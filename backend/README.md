# SmartFlow AI — Backend (Node.js + Express)

Backend inicial del proyecto, **solo con Node.js + Express** por ahora (sin base
de datos ni Vertex AI todavía — eso viene en la siguiente etapa). Usa datos en
memoria con la misma forma que ya usaba el frontend en `mockData.js`, así que
el frontend puede conectarse hoy mismo sin cambiar su lógica cuando lleguemos
a PostgreSQL.

## Cómo correrlo

```bash
npm install
cp .env.example .env
npm run dev
```

Servidor en `http://localhost:4000`. CORS habilitado para `http://localhost:5173`
(el puerto por defecto de Vite).

## Usuarios de prueba (login)

| Email                  | Password       | Rol    |
|-------------------------|----------------|--------|
| sofia@smartflow.ai      | smartflow123   | Admin  |
| wilder@smartflow.ai     | smartflow123   | Editor |

## Endpoints

Todos bajo el prefijo `/api`. Los marcados 🔒 requieren header
`Authorization: Bearer <token>` (el token se obtiene en `/auth/login`).

| Método | Ruta                       | Descripción                                  |
|--------|----------------------------|-----------------------------------------------|
| GET    | `/health`                  | Chequeo de salud                              |
| POST   | `/auth/login`               | Login (email + password) → `{ token, user }`  |
| GET    | `/auth/me`                  | 🔒 Usuario autenticado                        |
| GET    | `/flows`                    | 🔒 Lista de flujos                            |
| GET    | `/flows/:id`                | 🔒 Detalle de un flujo                        |
| POST   | `/flows`                    | 🔒 Crear/guardar un flujo                     |
| PUT    | `/flows/:id`                | 🔒 Actualizar un flujo                        |
| DELETE | `/flows/:id`                | 🔒 Eliminar un flujo                          |
| POST   | `/ai/generate-flow`         | 🔒 Genera nodes/edges + insight desde texto (IA simulada por ahora) |
| GET    | `/dashboard/kpis`           | 🔒 KPIs del dashboard                         |
| GET    | `/dashboard/recent-flows`   | 🔒 Flujos recientes                           |
| GET    | `/reports/summary`          | 🔒 Resumen de reportes                        |
| GET    | `/reports/bottlenecks`      | 🔒 Cuellos de botella detectados              |
| GET    | `/users`                    | 🔒 Equipo (para Configuración)                |

## Estructura

```
src/
  app.js               Configuración de Express (cors, json, rutas, errores)
  server.js             Punto de entrada (levanta el servidor)
  config/env.js         Variables de entorno
  data/store.js         "Base de datos" en memoria (reemplazar por PostgreSQL luego)
  middleware/
    auth.middleware.js  Verifica el token Bearer (placeholder, luego JWT real)
    error.middleware.js 404 + manejador de errores centralizado
  controllers/          Lógica de cada recurso (auth, flows, ai, dashboard, reports, users)
  routes/                Definición de rutas por recurso + index.js
  services/
    ai.service.js        Genera el flujo a partir de texto (simulado; luego Vertex AI/Gemini)
  utils/
    ApiError.js           Error tipado con statusCode
    asyncHandler.js        Evita try/catch repetido en controladores
```

## Siguientes etapas (ya identificadas, para cuando digas)

1. **PostgreSQL**: reemplazar `data/store.js` por consultas reales (pool `pg`,
   tablas `users`, `flows`, `bottlenecks`).
2. **Auth real**: `bcrypt` para hash de contraseñas + `jsonwebtoken` para JWT
   firmado, roles y permisos.
3. **Vertex AI + Gemini**: reemplazar `services/ai.service.js` por una llamada
   real al modelo, manteniendo el mismo contrato de respuesta.
4. **Docker**: Dockerfile del backend + `docker-compose.yml` con Postgres.
5. **Generación de documentos** (PDF/Word) para los botones de `CrearFlujo`.
