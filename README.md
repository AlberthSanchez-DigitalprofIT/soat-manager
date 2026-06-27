# SOAT Manager

App web para gestionar la descarga de SOATs (Seguro Obligatorio de Accidentes de Tránsito) desde AXA Colpatria.

## Qué hace

1. **Carga un Excel** de reporte de ePayco (con transacciones de pago)
2. **Parsea y clasifica** las transacciones: aprobadas, rechazadas, expiradas
3. **Detecta cuáles ya se descargaron** (busca `SOAT_{PLACA}.pdf` en disco)
4. **Descarga automáticamente** los SOATs pendientes desde el portal de AXA Colpatria
5. **Fallback**: Si AXA no tiene el PDF, navega a Proyectiva para capturar confirmación de pago
6. **Reporta progreso en tiempo real** vía WebSocket

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Express 4 + Playwright (Chromium headless)
- **Containerización:** Docker + Docker Compose
- **Comunicación:** REST + WebSocket para progreso

## Uso con Docker (recomendado)

```bash
# Construir imágenes
docker-compose build

# Levantar servicios
docker-compose up

# Acceder
# http://localhost:8080
```

Los PDFs se persisten en un volumen Docker (`soat-pdfs`).

## Uso sin Docker (desarrollo local)

```bash
# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# En terminal 1: backend
cd backend && npm run dev

# En terminal 2: frontend
cd frontend && npm run dev

# Acceder
# http://localhost:5173
```

**Requisito:** El backend necesita Playwright con Chromium. Al hacer `npm install` en backend, se instala automáticamente. Si falla, ejecutar:

```bash
cd backend && npx playwright install chromium
```

## Estructura

```
soat-manager/
├── docker-compose.yml          # Orquestación de servicios
├── backend/
│   ├── Dockerfile              # Node + Playwright + Chromium
│   ├── package.json
│   └── src/
│       ├── index.js            # Server Express + WebSocket
│       ├── routes/
│       │   ├── upload.js       # POST /api/upload — recibe Excel
│       │   └── download.js     # POST /api/download — ejecuta descargas
│       └── services/
│           ├── excel-parser.js     # Parsea XLSX de ePayco
│           └── soat-downloader.js  # Scraper AXA + fallback Proyectiva
├── frontend/
│   ├── Dockerfile              # Multi-stage: build + nginx
│   ├── nginx.conf              # Proxy reverse a backend
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── FileUpload.jsx      # Drag & drop de Excel
│           ├── TransactionTable.jsx # Tabla con filtros
│           ├── Summary.jsx          # Cards de resumen
│           └── ProgressPanel.jsx    # Logs en tiempo real
└── README.md
```

## API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/upload` | Recibe archivo Excel (multipart/form-data) |
| GET | `/api/transactions` | Devuelve transacciones actuales con estado |
| POST | `/api/download` | Inicia descarga de pendientes. Body: `{ placas?: string[] }` |
| GET | `/api/download/:placa` | Descarga PDF específico |
| GET | `/api/health` | Health check |
| WS | `/ws` | WebSocket para progreso en tiempo real |

## Formato Excel esperado

El Excel debe ser un reporte de ePayco con al menos estas columnas:

- `Referencia De Pago` (debe empezar con `PSOAT`)
- `Documento`
- `Descripción` (contiene `PLACA:XXX`)
- `Estado` (APROBADO, RECHAZADO, EXPIRADA)
- `Nombre`, `email`, `Fecha`, `Monto`, `Método De Pago`

## Configuración

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3001` | Puerto del backend |
| `NODE_ENV` | `development` | Entorno |

## Notas

- El portal de AXA tiene reCAPTCHA invisible que generalmente no bloquea en headless
- Las descargas se ejecutan secuencialmente con 2s de pausa entre cada una
- Si AXA no tiene el PDF (póliza con vigencia futura), se captura screenshot de la confirmación de Proyectiva como evidencia
