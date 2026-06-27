const express = require('express');
const path = require('path');
const fs = require('fs');
const { downloadSoat } = require('../services/soat-downloader');

const router = express.Router();

let isDownloading = false;

/**
 * POST /api/download
 * Inicia descarga de SOATs pendientes (solo APROBADOS sin PDF).
 * Body opcional: { placas: ["RFX821", "EMR162"] } para filtrar.
 * Requiere haber hecho POST /upload primero.
 */
router.post('/download', async (req, res) => {
  if (isDownloading) {
    return res.status(409).json({ error: 'Ya hay una descarga en progreso' });
  }

  const pdfsDir = req.app.get('pdfsDir');
  const broadcast = req.app.get('broadcast');
  const getTransactions = req.app.get('getTransactions');
  const { placas } = req.body || {};

  const data = getTransactions();

  if (!data || data.transactions.length === 0) {
    return res.status(400).json({ error: 'No hay transacciones cargadas. Sube un Excel primero.' });
  }

  // Filtrar solo aprobados pendientes de descarga
  let pending = data.transactions.filter(
    (t) => t.estado === 'APROBADO' && t.downloadStatus === 'pending'
  );

  // Si se especificaron placas, filtrar solo esas
  if (Array.isArray(placas) && placas.length > 0) {
    const placasUpper = placas.map((p) => p.toUpperCase());
    pending = pending.filter((t) => placasUpper.includes(t.placa));
  }

  if (pending.length === 0) {
    return res.json({ message: 'No hay pólizas pendientes para descargar', results: [] });
  }

  isDownloading = true;
  res.json({ message: `Iniciando descarga de ${pending.length} pólizas`, total: pending.length });

  // Ejecutar descargas secuencialmente en background
  const results = [];

  for (let i = 0; i < pending.length; i++) {
    const t = pending[i];
    broadcast({
      type: 'progress',
      current: i + 1,
      total: pending.length,
      placa: t.placa,
      status: 'downloading',
    });

    const result = await downloadSoat({
      placa: t.placa,
      documento: t.documento,
      referencia: t.referencia,
      pdfsDir,
      onProgress: (progress) => {
        broadcast({ type: 'step', placa: t.placa, ...progress });
      },
    });

    results.push({ placa: t.placa, ...result });

    broadcast({
      type: 'progress',
      current: i + 1,
      total: pending.length,
      placa: t.placa,
      status: result.success ? 'downloaded' : 'failed',
      error: result.error,
    });

    // Pausa entre descargas para no saturar AXA
    if (i < pending.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  isDownloading = false;

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  broadcast({
    type: 'complete',
    results,
    summary: { total: pending.length, successful, failed },
  });
});

/**
 * GET /api/download/:placa
 * Descarga un PDF específico ya guardado.
 */
router.get('/download/:placa', (req, res) => {
  const pdfsDir = req.app.get('pdfsDir');
  const { placa } = req.params;
  const filePath = path.join(pdfsDir, `SOAT_${placa.toUpperCase()}.pdf`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `PDF no encontrado para placa ${placa}` });
  }

  res.download(filePath);
});

module.exports = router;
