const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * Descarga un SOAT desde AXA Colpatria usando Playwright.
 * @param {object} params
 * @param {string} params.placa - Placa del vehículo
 * @param {string} params.documento - Número de documento (CC)
 * @param {string} params.referencia - Referencia de producto (para fallback)
 * @param {string} params.pdfsDir - Directorio donde guardar PDFs
 * @param {function} params.onProgress - Callback para reportar progreso
 * @returns {Promise<{ success: boolean, filePath?: string, fallback?: string, error?: string }>}
 */
async function downloadSoat({ placa, documento, referencia, pdfsDir, onProgress }) {
  const pdfPath = path.join(pdfsDir, `SOAT_${placa}.pdf`);

  // Si ya existe, no re-descargar
  if (fs.existsSync(pdfPath)) {
    return { success: true, filePath: pdfPath, alreadyExisted: true };
  }

  let browser = null;

  try {
    onProgress?.({ step: 'launching', message: `Iniciando navegador para ${placa}...` });

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      acceptDownloads: true,
    });

    const page = await context.newPage();

    onProgress?.({ step: 'navigating', message: `Navegando a AXA para placa ${placa}...` });

    await page.goto('https://clientes.axacolpatria.co/descargar-soat', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Llenar formulario
    await page.getByRole('textbox', { name: 'Placa' }).fill(placa);
    await page.getByRole('textbox', { name: 'No documento' }).fill(documento);

    onProgress?.({ step: 'downloading', message: `Descargando SOAT ${placa}...` });

    // Click en descargar y esperar posible descarga
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
      page.getByRole('button', { name: 'Descargar' }).click(),
    ]);

    if (download) {
      await download.saveAs(pdfPath);
      await browser.close();
      return { success: true, filePath: pdfPath };
    }

    // Si no hubo descarga, verificar si hay error en la página
    await page.waitForTimeout(3000);

    // Intentar fallback con Proyectiva si hay referencia
    if (referencia) {
      onProgress?.({ step: 'fallback', message: `AXA no disponible, intentando confirmación Proyectiva para ${placa}...` });

      const confirmUrl = `https://www.proyectivaseguros.com/venta-soat/confirmacion?p=${referencia}`;
      await page.goto(confirmUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const screenshotPath = path.join(pdfsDir, `confirmacion_${placa}_proyectiva.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      await browser.close();
      return { success: false, fallback: screenshotPath, error: 'PDF no disponible en AXA, se guardó confirmación de pago' };
    }

    await browser.close();
    return { success: false, error: 'No se pudo descargar el PDF y no hay referencia para fallback' };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { success: false, error: error.message };
  }
}

/**
 * Verifica cuáles pólizas ya tienen PDF descargado.
 * @param {Array} transactions - Lista de transacciones
 * @param {string} pdfsDir - Directorio de PDFs
 * @returns {Array} Transacciones con downloadStatus actualizado
 */
function checkDownloadStatus(transactions, pdfsDir) {
  return transactions.map((t) => {
    const pdfPath = path.join(pdfsDir, `SOAT_${t.placa}.pdf`);
    const confirmPath = path.join(pdfsDir, `confirmacion_${t.placa}_proyectiva.png`);

    let downloadStatus = 'pending';
    if (fs.existsSync(pdfPath)) {
      downloadStatus = 'downloaded';
    } else if (fs.existsSync(confirmPath)) {
      downloadStatus = 'confirmation';
    }

    return { ...t, downloadStatus };
  });
}

module.exports = { downloadSoat, checkDownloadStatus };
