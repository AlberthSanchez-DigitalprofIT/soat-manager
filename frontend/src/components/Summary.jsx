import React from 'react';

function Summary({ summary }) {
  const cards = [
    { label: 'Total SOAT', value: summary.total, color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { label: 'Aprobados', value: summary.aprobados, color: 'bg-green-50 text-green-800 border-green-200' },
    { label: 'Rechazados', value: summary.rechazados, color: 'bg-red-50 text-red-800 border-red-200' },
    { label: 'Expirados', value: summary.expirados, color: 'bg-orange-50 text-orange-800 border-orange-200' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-lg p-4 border ${card.color}`}>
          <p className="text-2xl font-bold">{card.value}</p>
          <p className="text-sm font-medium opacity-80">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

export default Summary;
