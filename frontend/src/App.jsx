import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import TransactionTable from './components/TransactionTable';
import Summary from './components/Summary';
import DateFilter from './components/DateFilter';
import TransferIndicator from './components/TransferIndicator';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function handleFileUpload(file) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        setTransactions(data.transactions);
        setSummary(data.summary);
      } else {
        alert(data.error || 'Error al procesar archivo');
      }
    } catch (error) {
      alert('Error de conexión: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Abre AXA Colpatria en una nueva pestaña con la placa y documento pre-cargados.
   * El usuario completa el reCAPTCHA y descarga el PDF directamente.
   */
  function handleDownloadAXA(placa, documento) {
    const url = `https://clientes.axacolpatria.co/descargar-soat?placa=${placa}&documento=${documento}`;
    window.open(url, '_blank');
  }

  // Filtrado por fecha
  function parseDate(dateStr) {
    if (!dateStr) return null;
    // Formato del Excel: "26-06-2026 16:09" o "2026-06-26" (del input date)
    const parts = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (parts) {
      return new Date(parts[3], parts[2] - 1, parts[1]);
    }
    return new Date(dateStr);
  }

  const filteredTransactions = transactions.filter((t) => {
    // Filtro por estado
    if (statusFilter !== 'all') {
      if (statusFilter === 'aprobado' && t.estado !== 'APROBADO') return false;
      if (statusFilter === 'rechazado' && t.estado !== 'RECHAZADO') return false;
      if (statusFilter === 'expirada' && t.estado !== 'EXPIRADA') return false;
    }

    // Filtro por fecha
    if (dateFrom || dateTo) {
      const txDate = parseDate(t.fecha);
      if (!txDate) return true;

      if (dateFrom) {
        const from = new Date(dateFrom);
        if (txDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        if (txDate > to) return false;
      }
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SOAT Manager</h1>
        <p className="text-gray-600 mt-1">
          Gestión de descarga de SOATs — AXA Colpatria / Proyectiva
        </p>
      </header>

      {/* Upload */}
      <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />

      {/* Summary */}
      {summary && <Summary summary={summary} />}

      {/* Transfer Indicator */}
      {transactions.length > 0 && (
        <TransferIndicator transactions={transactions} />
      )}

      {/* Filters */}
      {transactions.length > 0 && (
        <div className="my-6 p-4 bg-white rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase">Filtros</h3>
          
          <div className="flex flex-wrap gap-4 items-end">
            {/* Date Filter */}
            <DateFilter
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
            />

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="aprobado">Aprobados</option>
                <option value="rechazado">Rechazados</option>
                <option value="expirada">Expirados</option>
              </select>
            </div>

            {/* Clear filters */}
            {(dateFrom || dateTo || statusFilter !== 'all') && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setStatusFilter('all'); }}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {transactions.length > 0 && (
        <TransactionTable
          transactions={filteredTransactions}
          totalCount={transactions.length}
          onDownloadAXA={handleDownloadAXA}
        />
      )}
    </div>
  );
}

export default App;
