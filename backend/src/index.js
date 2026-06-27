const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { WebSocketServer } = require('ws');
const http = require('http');
const uploadRouter = require('./routes/upload');
const { getTransactions } = require('./routes/upload');
const downloadRouter = require('./routes/download');

const app = express();
const server = http.createServer(app);

// WebSocket para progreso en tiempo real
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket conectado' }));
});

/** @param {object} data */
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// Crear directorio de PDFs si no existe
const pdfsDir = path.join(__dirname, '..', 'pdfs');
if (!fs.existsSync(pdfsDir)) {
  fs.mkdirSync(pdfsDir, { recursive: true });
}

// Compartir broadcast y funciones con rutas
app.set('broadcast', broadcast);
app.set('pdfsDir', pdfsDir);
app.set('getTransactions', () => getTransactions(pdfsDir));

// Rutas
app.use('/api', uploadRouter);
app.use('/api', downloadRouter);

// Servir PDFs descargados
app.use('/api/pdfs', express.static(pdfsDir));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Servir frontend en producción (soporta ambas estructuras: docker-compose y Dockerfile unificado)
const frontendPaths = [
  path.join(__dirname, '..', '..', 'frontend', 'dist'),  // docker-compose
  path.join(__dirname, '..', 'frontend', 'dist'),         // Dockerfile unificado
];
const frontendDist = frontendPaths.find((p) => fs.existsSync(p));
if (frontendDist) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SOAT Manager Backend corriendo en http://localhost:${PORT}`);
  console.log(`WebSocket disponible en ws://localhost:${PORT}/ws`);
  console.log(`PDFs se guardan en: ${pdfsDir}`);
});
