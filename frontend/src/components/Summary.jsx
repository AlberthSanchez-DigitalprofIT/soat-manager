import React from 'react';

function Summary({ summary }) {
  const cards = [
    { label: 'Total SOAT', value: summary.total, color: 'bg-gray-100 text-gray-800' },
    { label: 'Aprobados', value: summary.aprobados, color: 'bg-green-100 text-green-800' },
    { label: 'Descargados', value: summary.downloaded, color: 'bg-blue-100 text-blue-800' },
    { label: 'Pendientes', value: summary.pending, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Rechazados', value: summary.rechazados, color: 'bg-red-100 text-red-800' },
    { label: 'Expirados', value: summary.expirados, color: 'bg-orange-100 text-orange-800' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-6">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-lg p-4 ${card.color}`}>
          <p className="text-2xl font-bold">{card.value}</p>
          <p className="text-sm font-medium opacity-80">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

export default Summary;
