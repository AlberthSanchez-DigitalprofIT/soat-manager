const XLSX = require('xlsx');

/**
 * Parsea un archivo Excel de reporte ePayco y extrae transacciones SOAT.
 * @param {Buffer} buffer - Contenido del archivo Excel
 * @returns {{ transactions: Array, summary: object }}
 */
function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const transactions = [];

  for (const row of rows) {
    const referencia = row['Referencia De Pago'] || row['referencia De Pago'] || '';
    const descripcion = row['Descripción'] || row['Descripcion'] || '';
    const estado = (row['Estado'] || '').toUpperCase();
    const documento = String(row['Documento'] || '').trim();
    const nombre = row['Nombre'] || '';
    const email = row['email'] || row['Email'] || '';
    const fecha = row['Fecha'] || '';
    const monto = row['Monto'] || 0;
    const metodoPago = row['Método De Pago'] || row['Metodo De Pago'] || '';
    const detalleEstado = row['Detalle De estado'] || row['Detalle De Estado'] || '';

    // Extraer placa de la descripción: <p><b>PLACA:XXX</b></p>
    const placaMatch = descripcion.match(/PLACA[:\s]*([A-Z0-9]+)/i);
    const placa = placaMatch ? placaMatch[1].toUpperCase() : null;

    // Solo procesar si tiene referencia tipo PSOAT y placa
    if (!referencia.startsWith('PSOAT') || !placa) {
      continue;
    }

    transactions.push({
      referencia,
      documento,
      placa,
      nombre: limpiarNombre(nombre),
      email,
      fecha,
      monto: Number(monto),
      metodoPago,
      estado,
      detalleEstado,
      // Estado de descarga se calcula después
      downloadStatus: 'unknown',
    });
  }

  const summary = {
    total: transactions.length,
    aprobados: transactions.filter((t) => t.estado === 'APROBADO').length,
    rechazados: transactions.filter((t) => t.estado === 'RECHAZADO').length,
    expirados: transactions.filter((t) => t.estado === 'EXPIRADA').length,
  };

  return { transactions, summary };
}

/**
 * Limpia nombres duplicados del formato "NOMBRE NOMBRE"
 * @param {string} nombre
 * @returns {string}
 */
function limpiarNombre(nombre) {
  const parts = nombre.trim().split(/\s+/);
  const half = Math.floor(parts.length / 2);
  const firstHalf = parts.slice(0, half).join(' ');
  const secondHalf = parts.slice(half).join(' ');
  if (firstHalf === secondHalf) {
    return firstHalf;
  }
  return nombre.trim();
}

module.exports = { parseExcel };
