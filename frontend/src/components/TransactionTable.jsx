import React, { useState } from 'react';

const STATUS_BADGES = {
  downloaded: { text: 'Descargado', className: 'bg-green-100 text-green-700' },
  pending: { text: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  confirmation: { text: 'Confirmación', className: 'bg-blue-100 text-blue-700' },
  unknown: { text: '-', className: 'bg-gray-100 text-gray-500' },
};

const ESTADO_BADGES = {
  APROBADO: { className: 'bg-green-100 text-green-700' },
  RECHAZADO: { className: 'bg-red-100 text-red-700' },
  EXPIRADA: { className: 'bg-orange-100 text-orange-700' },
};

function TransactionTable({ transactions, onDownloadSingle, isDownloading }) {
  const [filter, setFilter] = useState('all');

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'aprobado') return t.estado === 'APROBADO';
    if (filter === 'pending') return t.estado === 'APROBADO' && t.downloadStatus === 'pending';
    if (filter === 'downloaded') return t.downloadStatus === 'downloaded';
    if (filter === 'rechazado') return t.estado === 'RECHAZADO' || t.estado === 'EXPIRADA';
    return true;
  });

  return (
    <div className="mt-6">
      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'aprobado', label: 'Aprobados' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'downloaded', label: 'Descargados' },
          { key: 'rechazado', label: 'Rechazados/Expirados' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referencia</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirmación</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado Pago</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((t) => {
              const statusBadge = STATUS_BADGES[t.downloadStatus] || STATUS_BADGES.unknown;
              const estadoBadge = ESTADO_BADGES[t.estado] || { className: 'bg-gray-100 text-gray-500' };

              return (
                <tr key={t.referencia} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-bold">{t.placa}</td>
                  <td className="px-4 py-3 text-sm">{t.documento}</td>
                  <td className="px-4 py-3 text-sm truncate max-w-[200px]" title={t.nombre}>{t.nombre}</td>
                  <td className="px-4 py-3 text-sm font-mono text-xs text-gray-500 truncate max-w-[150px]" title={t.referencia}>{t.referencia}</td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={`https://www.proyectivaseguros.com/venta-soat/confirmacion?p=${t.referencia}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      Ver confirmación
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{t.fecha}</td>
                  <td className="px-4 py-3 text-sm">${Number(t.monto).toLocaleString('es-CO')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge.className}`}>
                      {t.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.downloadStatus === 'downloaded' ? (
                      <a
                        href={`/api/download/${t.placa}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        download
                      >
                        Descargar PDF
                      </a>
                    ) : t.estado === 'APROBADO' && t.downloadStatus === 'pending' ? (
                      <button
                        onClick={() => onDownloadSingle(t.placa)}
                        disabled={isDownloading}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400"
                      >
                        Obtener
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Mostrando {filtered.length} de {transactions.length} transacciones
      </p>
    </div>
  );
}

export default TransactionTable;
