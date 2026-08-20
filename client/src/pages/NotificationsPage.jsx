import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import { Bell, CheckCheck, Calendar, MessageSquare, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const { setUnreadNotificationsCount, refreshNotifications } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadNotificationsCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
      setError(err.response?.data?.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await API.patch('/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadNotificationsCount(0);
      }
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      refreshNotifications();
    } catch (err) {
      console.error('Mark single read error:', err);
    }
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading notifications..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex items-center justify-between shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Notifications Center
          </div>
          <h1 className="text-3xl font-extrabold text-white">Activity Alerts</h1>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
        >
          <CheckCheck className="w-4 h-4 text-emerald-400" /> Mark All as Read
        </button>
      </div>

      <ErrorBanner message={error} onRetry={fetchNotifications} />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications Yet"
          description="You don't have any system notifications or booking alerts right now."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleMarkSingleRead(notif._id)}
              className={`glass-panel p-5 rounded-2xl border transition flex items-start gap-4 cursor-pointer ${
                notif.isRead
                  ? 'border-slate-800 opacity-70'
                  : 'border-indigo-500/40 bg-indigo-950/20'
              }`}
            >
              <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0">
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {notif.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-2 animate-pulse"></span>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default NotificationsPage;
