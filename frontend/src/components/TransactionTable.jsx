import React from 'react';

const ESTADO_BADGES = {
  APROBADO: { className: 'bg-green-100 text-green-700' },
  RECHAZADO: { className: 'bg-red-100 text-red-700' },
  EXPIRADA: { className: 'bg-orange-100 text-orange-700' },
};

function TransactionTable({ transactions, totalCount, onDownloadAXA }) {
  return (
    <div className="mt-6">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referencia</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirmación</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descargar SOAT</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((t) => {
              const estadoBadge = ESTADO_BADGES[t.estado] || { className: 'bg-gray-100 text-gray-500' };

              return (
                <tr key={t.referencia + t.fecha} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm font-mono font-bold">{t.placa}</td>
                  <td className="px-3 py-3 text-sm">{t.documento}</td>
                  <td className="px-3 py-3 text-sm truncate max-w-[180px]" title={t.nombre}>{t.nombre}</td>
                  <td className="px-3 py-3 text-xs font-mono text-gray-500 truncate max-w-[140px]" title={t.referencia}>{t.referencia}</td>
                  <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{t.fecha}</td>
                  <td className="px-3 py-3 text-sm whitespace-nowrap">${Number(t.monto).toLocaleString('es-CO')}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge.className}`}>
                      {t.estado}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {t.estado === 'APROBADO' ? (
                      <a
                        href={`https://www.proyectivaseguros.com/venta-soat/confirmacion?p=${t.referencia}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Ver pago
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {t.estado === 'APROBADO' ? (
                      <button
                        onClick={() => onDownloadAXA(t.placa, t.documento)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded text-xs font-medium transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        AXA
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Mostrando {transactions.length} de {totalCount} transacciones
      </p>
    </div>
  );
}

export default TransactionTable;
