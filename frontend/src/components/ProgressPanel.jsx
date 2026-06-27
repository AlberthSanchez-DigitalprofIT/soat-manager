import React, { useRef, useEffect } from 'react';

function ProgressPanel({ logs, progress }) {
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const percentage = progress ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="my-4 bg-gray-900 rounded-lg p-4">
      {/* Progress bar */}
      {progress && (
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>
              {progress.current}/{progress.total} — {progress.placa}
            </span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="max-h-48 overflow-y-auto font-mono text-xs text-green-400 space-y-0.5">
        {logs.map((log, i) => (
          <p key={i}>{log}</p>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

export default ProgressPanel;
