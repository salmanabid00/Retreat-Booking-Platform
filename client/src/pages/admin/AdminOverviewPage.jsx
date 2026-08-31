import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import { 
  DollarSign, 
  Users, 
  Home, 
  Calendar, 
  ArrowUpRight, 
  Sparkles,
  UserCheck,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react';

const AdminOverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverviewStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError(err.response?.data?.message || 'Failed to load platform statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner label="Compiling enterprise analytics..." />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={fetchOverviewStats} />;
  }

  return (
    <div className="space-y-6">
      
      {/* 4 Key Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-emerald-400 tracking-tight">
              ${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">Platform confirmed earnings</p>
          </div>
        </div>

        {/* Registered Users */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Users</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-white tracking-tight">{stats?.totalUsers || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium">
              {stats?.customersCount || 0} guests • {stats?.ownersCount || 0} hosts
            </p>
          </div>
        </div>

        {/* Total Properties */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Properties</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-white tracking-tight">{stats?.totalProperties || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium">
              {stats?.approvedProperties || 0} approved retreats
            </p>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-white tracking-tight">{stats?.totalBookings || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium">
              {stats?.confirmedBookings || 0} confirmed • {stats?.pendingBookings || 0} pending
            </p>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/60 transition group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition flex items-center gap-1.5">
              Moderate User Accounts <ArrowUpRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-400">Search users, audit roles, and toggle account blocks</p>
          </div>
        </Link>

        <Link
          to="/admin/properties"
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/60 transition group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition flex items-center gap-1.5">
              Approve Retreat Listings <ArrowUpRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-400">Verify property standards and toggle listing visibility</p>
          </div>
        </Link>

        <Link
          to="/admin/bookings"
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/60 transition group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition flex items-center gap-1.5">
              Audit Platform Bookings <ArrowUpRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-400">View real-time guest reservations and financial status</p>
          </div>
        </Link>
      </div>

      {/* Dual Activity Lists: Recent Bookings + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Bookings Feed */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Bookings</h3>
            </div>
            <Link to="/admin/bookings" className="text-xs text-purple-400 hover:underline font-semibold">
              View All
            </Link>
          </div>

          {!stats?.recentBookings || stats.recentBookings.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No platform bookings recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={b.property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=100'}
                      alt={b.property?.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate max-w-[180px]">{b.property?.title || 'Sanctuary Retreat'}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Guest: <span className="text-slate-300">{b.customer?.name || 'Guest User'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <p className="font-black text-emerald-400">${b.totalPrice}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                      b.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations Feed */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Users</h3>
            </div>
            <Link to="/admin/users" className="text-xs text-purple-400 hover:underline font-semibold">
              Manage Users
            </Link>
          </div>

          {!stats?.recentUsers || stats.recentUsers.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No users registered yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.map((u) => (
                <div
                  key={u._id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                      alt={u.name}
                      className="w-9 h-9 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                      u.role === 'owner' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {u.role}
                    </span>
                    {u.isBlocked && (
                      <span className="block text-[9px] text-rose-400 font-bold">Blocked</span>
                    )}
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

export default AdminOverviewPage;
