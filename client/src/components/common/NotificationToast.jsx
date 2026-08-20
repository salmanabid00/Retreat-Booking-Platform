import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Bell, X, Sparkles } from 'lucide-react';

const NotificationToast = () => {
  const { toastNotification, clearToast } = useSocket();

  if (!toastNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm glass-panel p-4 rounded-2xl border border-indigo-500/40 shadow-2xl animate-in slide-in-from-bottom-5 fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 pr-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
            Real-Time Notification
          </h4>
          <p className="text-xs text-slate-200">{toastNotification.message}</p>
        </div>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
