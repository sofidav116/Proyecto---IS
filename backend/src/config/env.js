import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  vertex: {
    project: process.env.GOOGLE_CLOUD_PROJECT || "",
    location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },
};

// La IA real solo se activa si hay un proyecto de GCP configurado.
// Sin esto, el backend sigue funcionando con el generador simulado.
export const isVertexConfigured = () => Boolean(env.vertex.project);
