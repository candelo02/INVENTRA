# ── Etapa 1: Dependencias de producción ─────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ── Etapa 2: Imagen final ─────────────────────────────────────────────────────
FROM node:24-alpine
WORKDIR /app

# Copiar solo lo necesario
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# Principio de menor privilegio: nunca correr como root
USER node

EXPOSE 5000
CMD ["node", "src/server.js"]
