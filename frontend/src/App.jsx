import React, { useState, useEffect, useRef } from 'react';
import FileUpload from './components/FileUpload';
import TransactionTable from './components/TransactionTable';
import ProgressPanel from './components/ProgressPanel';
import Summary from './components/Summary';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWsMessage(data);
    };

    ws.onclose = () => {
      setTimeout(connectWebSocket, 3000);
    };

    wsRef.current = ws;
  }

  function handleWsMessage(data) {
    switch (data.type) {
      case 'progress':
        setProgress(data);
        setLogs((prev) => [
          ...prev,
          `[${data.current}/${data.total}] ${data.placa}: ${data.status}${data.error ? ' - ' + data.error : ''}`,
        ]);
        // Actualizar estado en la tabla
        if (data.status === 'downloaded') {
          setTransactions((prev) =>
            prev.map((t) => (t.placa === data.placa ? { ...t, downloadStatus: 'downloaded' } : t))
          );
        }
        break;
      case 'step':
        setLogs((prev) => [...prev, `  ${data.placa}: ${data.message}`]);
        break;
      case 'complete':
        setIsDownloading(false);
        setProgress(null);
        setLogs((prev) => [
          ...prev,
          `--- Completado: ${data.summary.successful} exitosos, ${data.summary.failed} fallidos ---`,
        ]);
        refreshTransactions();
        break;
    }
  }

  async function handleFileUpload(file) {
    setIsLoading(true);
    setLogs([]);
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

  async function refreshTransactions() {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (res.ok && data.transactions) {
        setTransactions(data.transactions);
        setSummary(data.summary);
      }
    } catch {
      // silenciar
    }
  }

  async function handleDownload() {
    setIsDownloading(true);
    setLogs([]);
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error');
        setIsDownloading(false);
      }
    } catch (error) {
      alert('Error: ' + error.message);
      setIsDownloading(false);
    }
  }

  async function handleDownloadSingle(placa) {
    setIsDownloading(true);
    setLogs((prev) => [...prev, `Descargando ${placa}...`]);
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placas: [placa] }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Error');
        setIsDownloading(false);
      }
    } catch (error) {
      alert('Error: ' + error.message);
      setIsDownloading(false);
    }
  }

  const pendingCount = transactions.filter(
    (t) => t.estado === 'APROBADO' && t.downloadStatus === 'pending'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SOAT Manager</h1>
        <p className="text-gray-600 mt-1">
          Gestión de descarga de SOATs — AXA Colpatria
        </p>
      </header>

      {/* Upload */}
      <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />

      {/* Summary */}
      {summary && <Summary summary={summary} />}

      {/* Actions */}
      {pendingCount > 0 && (
        <div className="my-4 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isDownloading ? 'Descargando...' : `Descargar ${pendingCount} pendientes`}
          </button>
        </div>
      )}

      {/* Progress */}
      {(isDownloading || logs.length > 0) && <ProgressPanel logs={logs} progress={progress} />}

      {/* Table */}
      {transactions.length > 0 && (
        <TransactionTable
          transactions={transactions}
          onDownloadSingle={handleDownloadSingle}
          isDownloading={isDownloading}
        />
      )}
    </div>
  );
}

export default App;
