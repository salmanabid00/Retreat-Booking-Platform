import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  ShieldAlert, 
  UserCheck, 
  Ban, 
  CheckCircle2,
  Mail,
  RefreshCw
} from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [blockLoadingId, setBlockLoadingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Failed to load user accounts.');
      toast.error(err.response?.data?.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'blocked' && u.isBlocked) ||
      (statusFilter === 'active' && !u.isBlocked);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> User Accounts Moderation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review registered customers, hosts, and administrator privileges across the platform
            </p>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-xs"
          >
            <option value="all">All Roles (Customer, Owner, Admin)</option>
            <option value="customer">Role: Customer (Guests)</option>
            <option value="owner">Role: Owner (Hosts)</option>
            <option value="admin">Role: Administrator</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-xs"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Accounts Only</option>
            <option value="blocked">Blocked / Suspended Only</option>
          </select>

        </div>
      </div>

      <ErrorBanner message={error} onRetry={fetchUsers} />

      {/* Users Table */}
      {loading ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex items-center justify-center min-h-[300px]">
          <LoadingSpinner label="Loading user registry..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Users Found</h3>
          <p className="text-xs text-slate-400">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Try changing your search or filter parameters.'
              : 'No user accounts currently registered in the database.'}
          </p>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">User Profile</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-900/40 transition">
                    
                    {/* User info */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                          alt={usr.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-800"
                        />
                        <div>
                          <p className="font-bold text-white">{usr.name}</p>
                          <p className="text-[10px] text-slate-500">ID: {usr._id.substring(usr._id.length - 8)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        usr.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        usr.role === 'owner' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {usr.role}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                      {usr.email}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {usr.isBlocked ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                          <Ban className="w-3 h-3" /> Suspended / Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Active & Verified
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      {usr.role === 'admin' ? (
                        <span className="text-[11px] text-slate-500 font-semibold px-3 py-1">Protected Admin</span>
                      ) : (
                        <button
                          onClick={() => handleToggleBlock(usr._id)}
                          disabled={blockLoadingId === usr._id}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                            usr.isBlocked
                              ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30'
                              : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30'
                          }`}
                        >
                          {blockLoadingId === usr._id ? 'Updating...' : usr.isBlocked ? 'Unblock User' : 'Block User'}
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsersPage;
