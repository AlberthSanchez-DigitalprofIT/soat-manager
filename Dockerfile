# Dockerfile unificado para deploy en Railway/cloud
# Construye frontend + sirve todo desde el backend Express

# Stage 1: Build frontend
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + frontend estático
FROM node:20-slim

# Dependencias de Chromium para Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libx11-xcb1 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend deps
COPY backend/package.json ./
RUN npm install
RUN npx playwright install chromium

# Backend source
COPY backend/src/ ./src/

# Frontend build (servido por Express en producción)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Crear directorio para PDFs
RUN mkdir -p /app/pdfs

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "src/index.js"]
