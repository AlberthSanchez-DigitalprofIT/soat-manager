import React from 'react';

function DateFilter({ dateFrom, dateTo, onDateFromChange, onDateToChange }) {
  return (
    <div className="flex gap-3 items-end">
      <div>
        <label htmlFor="date-from" className="block text-xs font-medium text-gray-500 mb-1">
          Desde
        </label>
        <input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="date-to" className="block text-xs font-medium text-gray-500 mb-1">
          Hasta
        </label>
        <input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}

export default DateFilter;
