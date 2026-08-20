import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import { 
  ShieldCheck, 
  Users, 
  Home, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  Ban, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  MapPin
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blockLoadingId, setBlockLoadingId] = useState(null);
  const [approvalLoadingId, setApprovalLoadingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, usersRes, propsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/properties?limit=100'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (propsRes.data.success) setProperties(propsRes.data.data);
    } catch (err) {
      console.error('Fetch admin data error:', err);
      setError(err.response?.data?.message || 'Failed to load admin panel data.');
      toast.error(err.response?.data?.message || 'Failed to load admin panel data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBlock = async (userId) => {
    try {
      setBlockLoadingId(userId);
      const res = await API.patch(`/admin/users/${userId}/block`);
      if (res.data.success) {
        const updatedUser = res.data.data;
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBlocked: updatedUser.isBlocked } : u))
        );
        const actionText = updatedUser.isBlocked ? 'blocked' : 'unblocked';
        toast.success(`User "${updatedUser.name}" has been ${actionText}.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user block status.');
    } finally {
      setBlockLoadingId(null);
    }
  };

  const handleToggleApproval = async (propertyId) => {
    try {
      setApprovalLoadingId(propertyId);
      const res = await API.patch(`/admin/properties/${propertyId}/approval`);
      if (res.data.success) {
        const updatedProp = res.data.data;
        setProperties((prev) =>
          prev.map((p) => (p._id === propertyId ? { ...p, isApproved: updatedProp.isApproved } : p))
        );
        const actionText = updatedProp.isApproved ? 'approved' : 'revoked';
        toast.success(`Property listing has been ${actionText}.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update property approval.');
    } finally {
      setApprovalLoadingId(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading admin control center..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 flex items-center justify-between shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Platform Governance
          </div>
          <h1 className="text-3xl font-extrabold text-white">Admin Control Dashboard</h1>
          <p className="text-sm text-slate-400">View platform statistics, moderate user accounts, and approve retreat listings</p>
        </div>

        <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
          <ShieldCheck className="w-8 h-8" />
        </div>
      </div>

      <ErrorBanner message={error} onRetry={fetchAdminData} />

      {/* Platform Statistics Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">${stats.totalRevenue}</p>
            <p className="text-[10px] text-slate-500">From confirmed bookings</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase">Registered Users</span>
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">{stats.totalUsers}</p>
            <p className="text-[10px] text-slate-500">{stats.customersCount} guests / {stats.ownersCount} hosts</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase">Total Properties</span>
              <Home className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">{stats.totalProperties}</p>
            <p className="text-[10px] text-slate-500">Active retreat listings</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase">Total Bookings</span>
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">{stats.totalBookings}</p>
            <p className="text-[10px] text-slate-500">{stats.confirmedBookings} confirmed</p>
          </div>
        </div>
      )}

      {/* User Moderation Management Table */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" /> User Accounts Moderation
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((usr) => (
                <tr key={usr._id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3.5 flex items-center gap-3">
                    <img
                      src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={usr.name}
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                    <span className="font-semibold text-white">{usr.name}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      usr.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                      usr.role === 'owner' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{usr.email}</td>
                  <td className="p-3.5">
                    {usr.isBlocked ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">
                        Disabled / Blocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {usr.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleBlock(usr._id)}
                        disabled={blockLoadingId === usr._id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          usr.isBlocked
                            ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                            : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white'
                        }`}
                      >
                        {blockLoadingId === usr._id ? 'Updating...' : usr.isBlocked ? 'Unblock Account' : 'Block User'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Listings Management Table */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Home className="w-5 h-5 text-purple-400" /> Property Listings Moderation
        </h2>

        {properties.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No properties found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Property</th>
                  <th className="p-3.5">Owner</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {properties.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=100'}
                          alt={prop.title}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <span className="font-semibold text-white max-w-[140px] truncate">{prop.title}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400">{prop.owner?.name || '—'}</td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        {prop.location?.city}, {prop.location?.country}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-white">${prop.pricePerNight}/night</td>
                    <td className="p-3.5">
                      {prop.isApproved ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleApproval(prop._id)}
                        disabled={approvalLoadingId === prop._id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          prop.isApproved
                            ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white'
                            : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {approvalLoadingId === prop._id
                          ? 'Updating...'
                          : prop.isApproved
                          ? 'Revoke Approval'
                          : 'Approve Listing'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
