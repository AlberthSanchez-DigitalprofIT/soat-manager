const XLSX = require('../backend/node_modules/xlsx');
const path = require('path');
const data = [
  { 'Referencia De Pago': 'PSOATLbnUbLhl0_', Documento: '19396984', Nombre: 'MAURICIO FRANCO RODRIGUEZ MAURICIO FRANCO RODRIGUEZ', 'Descripción': '<p><b>PLACA:RFX821</b></p>', Fecha: '26-06-2026 16:09', Monto: 677400, 'Método De Pago': 'PSE', Estado: 'APROBADO', 'Detalle De estado': '00-Aprobada' },
  { 'Referencia De Pago': 'PSOATzvStXuui4Y', Documento: '51804743', Nombre: 'LUZ STELLA BELLO ZAMORA LUZ STELLA BELLO ZAMORA', 'Descripción': '<p><b>PLACA:EMR162</b></p>', Fecha: '26-06-2026 16:06', Monto: 544700, 'Método De Pago': 'TARJETA', Estado: 'APROBADO', 'Detalle De estado': 'Aprobada' },
  { 'Referencia De Pago': 'PSOATN9L8cIWBki', Documento: '21061135', Nombre: 'MERY PARDO HERNANDEZ MERY PARDO HERNANDEZ', 'Descripción': '<p><b>PLACA:DQL183</b></p>', Fecha: '26-06-2026 12:39', Monto: 946600, 'Método De Pago': 'PSE', Estado: 'RECHAZADO', 'Detalle De estado': 'El usuario no finalizo' },
];
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Worksheet');
XLSX.writeFile(wb, path.join(__dirname, 'test.xlsx'));
console.log('ok');
