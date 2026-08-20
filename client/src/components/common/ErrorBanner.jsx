import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorBanner = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="glass-panel border-l-4 border-l-rose-500 border-slate-800 p-4 rounded-2xl my-4 flex items-start gap-4">
      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-rose-300 mb-0.5">Something went wrong</h4>
        <p className="text-xs text-slate-300">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
