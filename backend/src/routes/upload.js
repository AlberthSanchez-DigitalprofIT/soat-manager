const express = require('express');
const multer = require('multer');
const { parseExcel } = require('../services/excel-parser');
const { checkDownloadStatus } = require('../services/soat-downloader');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Estado en memoria de la última carga
let currentData = { transactions: [], summary: {} };

/**
 * Devuelve las transacciones actuales (para uso interno del download router).
 * @param {string} pdfsDir
 * @returns {{ transactions: Array, summary: object }}
 */
function getTransactions(pdfsDir) {
  if (currentData.transactions.length > 0 && pdfsDir) {
    currentData.transactions = checkDownloadStatus(currentData.transactions, pdfsDir);
  }
  return currentData;
}

/**
 * POST /api/upload
 * Recibe archivo Excel y devuelve transacciones parseadas con estado de descarga.
 */
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }

    const { transactions, summary } = parseExcel(req.file.buffer);
    const pdfsDir = req.app.get('pdfsDir');

    // Verificar cuáles ya se descargaron
    const withStatus = checkDownloadStatus(transactions, pdfsDir);

    const downloadedCount = withStatus.filter((t) => t.downloadStatus === 'downloaded').length;
    const pendingCount = withStatus.filter(
      (t) => t.estado === 'APROBADO' && t.downloadStatus === 'pending'
    ).length;

    currentData = {
      transactions: withStatus,
      summary: {
        ...summary,
        downloaded: downloadedCount,
        pending: pendingCount,
      },
    };

    res.json(currentData);
  } catch (error) {
    console.error('Error parsing Excel:', error);
    res.status(500).json({ error: 'Error procesando el archivo: ' + error.message });
  }
});

/**
 * GET /api/transactions
 * Devuelve las transacciones actuales con estado actualizado.
 */
router.get('/transactions', (req, res) => {
  const pdfsDir = req.app.get('pdfsDir');
  res.json(getTransactions(pdfsDir));
});

module.exports = router;
module.exports.getTransactions = getTransactions;
