import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  DollarSign, 
  Home, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

const AdminReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError('');
      const [reportsRes, statsRes] = await Promise.all([
        API.get('/admin/reports'),
        API.get('/admin/stats'),
      ]);

      if (reportsRes.data.success) setReports(reportsRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (err) {
      console.error('Fetch reports error:', err);
      setError(err.response?.data?.message || 'Failed to generate platform reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner label="Compiling executive intelligence report..." />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={fetchReportsData} />;
  }

  const totalBookings = stats?.totalBookings || 1;
  const confirmedRate = Math.round(((stats?.confirmedBookings || 0) / totalBookings) * 100);

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" /> Platform Executive Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics on inventory distribution, reservation velocity, and gross revenue streams
          </p>
        </div>

        <button
          onClick={fetchReportsData}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Top Conversion Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking Confirmation Rate</span>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-indigo-400">{confirmedRate}%</p>
            <span className="text-xs text-slate-500">of total requests</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${confirmedRate}%` }} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Verification</span>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-emerald-400">
              {stats?.totalProperties ? Math.round(((stats.approvedProperties || 0) / stats.totalProperties) * 100) : 100}%
            </p>
            <span className="text-xs text-slate-500">approved & compliant</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{
                width: `${stats?.totalProperties ? Math.round(((stats.approvedProperties || 0) / stats.totalProperties) * 100) : 100}%`,
              }}
            />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Host to Guest Ratio</span>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-purple-400">
              1 : {stats?.ownersCount ? Math.max(1, Math.round(stats.customersCount / stats.ownersCount)) : stats?.customersCount || 1}
            </p>
            <span className="text-xs text-slate-500">marketplace balance</span>
          </div>
          <p className="text-[11px] text-slate-400">{stats?.ownersCount || 0} active retreat hosts</p>
        </div>

      </div>

      {/* Dual Analytics Panels: Property Distribution & Booking Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Retreat Inventory by Property Type */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Home className="w-4 h-4 text-purple-400" /> Retreat Type Distribution
          </h3>

          {!reports?.propertyTypeBreakdown || reports.propertyTypeBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No property categorization data.</p>
          ) : (
            <div className="space-y-3">
              {reports.propertyTypeBreakdown.map((item) => (
                <div key={item._id || 'Unknown'} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item._id || 'General Sanctuary'}</span>
                    <span className="font-mono text-purple-300">{item.count} listings ({Math.round((item.count / (stats?.totalProperties || 1)) * 100)}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Avg. Nightly Rate</span>
                    <span className="font-semibold text-emerald-400">${Math.round(item.avgPrice || 0)} / night</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Status Breakdown & Settlement */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" /> Reservation Settlement Breakdown
          </h3>

          {!reports?.bookingStatusBreakdown || reports.bookingStatusBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No reservation settlement data.</p>
          ) : (
            <div className="space-y-3">
              {reports.bookingStatusBreakdown.map((item) => (
                <div key={item._id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item._id === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                      item._id === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                      item._id === 'rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item._id}
                    </span>
                    <p className="text-[11px] text-slate-400">{item.count} reservation{item.count === 1 ? '' : 's'}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Volume Value</span>
                    <span className="font-black text-emerald-400 text-sm">
                      ${(item.totalRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminReportsPage;
