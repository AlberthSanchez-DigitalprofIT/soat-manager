import React from 'react';

function TransferIndicator({ transactions }) {
  const aprobados = transactions.filter((t) => t.estado === 'APROBADO');
  
  const totalMonto = aprobados.reduce((sum, t) => sum + t.monto, 0);
  
  const porMetodo = aprobados.reduce((acc, t) => {
    const metodo = t.metodoPago || 'Sin dato';
    if (!acc[metodo]) acc[metodo] = { count: 0, monto: 0 };
    acc[metodo].count++;
    acc[metodo].monto += t.monto;
    return acc;
  }, {});

  return (
    <div className="my-6 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
        Transferencias Realizadas (Aprobadas)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Total Recaudado</p>
          <p className="text-2xl font-bold text-green-800">
            ${totalMonto.toLocaleString('es-CO')}
          </p>
          <p className="text-xs text-green-600 mt-1">{aprobados.length} transacciones aprobadas</p>
        </div>

        {/* Por método de pago */}
        {Object.entries(porMetodo).map(([metodo, data]) => (
          <div key={metodo} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">{metodo}</p>
            <p className="text-xl font-bold text-blue-800">
              ${data.monto.toLocaleString('es-CO')}
            </p>
            <p className="text-xs text-blue-600 mt-1">{data.count} transacciones</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TransferIndicator;
