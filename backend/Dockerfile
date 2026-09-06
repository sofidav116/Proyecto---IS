FROM node:22-slim

WORKDIR /app

# Instala dependencias primero para aprovechar la caché de Docker
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia el resto del código del backend
COPY . .

# Cloud Run inyecta la variable PORT (por defecto 8080).
# env.js ya lee process.env.PORT, así que no hay que tocar nada.
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/server.js"]
