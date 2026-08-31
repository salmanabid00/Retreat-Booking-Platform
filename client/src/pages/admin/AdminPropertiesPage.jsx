import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import { 
  Home, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  RefreshCw,
  Sparkles,
  DollarSign
} from 'lucide-react';

const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [approvalLoadingId, setApprovalLoadingId] = useState(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/admin/properties');
      if (res.data.success) {
        setProperties(res.data.data);
      }
    } catch (err) {
      console.error('Fetch properties error:', err);
      setError(err.response?.data?.message || 'Failed to load property listings.');
      toast.error(err.response?.data?.message || 'Failed to load property listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

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
      toast.error(err.response?.data?.message || 'Failed to update property approval status.');
    } finally {
      setApprovalLoadingId(null);
    }
  };

  const filteredProperties = properties.filter((prop) => {
    const titleMatch = prop.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = prop.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const ownerMatch = prop.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || cityMatch || ownerMatch;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && prop.isApproved) ||
      (statusFilter === 'revoked' && !prop.isApproved);

    const matchesType = typeFilter === 'all' || prop.propertyType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-purple-400" /> Property Listings Moderation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review published sanctuaries, verify safety & quality standards, and manage visibility
            </p>
          </div>

          <button
            onClick={fetchProperties}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, city, or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-xs"
          >
            <option value="all">All Approval Statuses</option>
            <option value="approved">Approved & Live</option>
            <option value="revoked">Revoked / Disabled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-xs"
          >
            <option value="all">All Sanctuary Types</option>
            <option value="Villa">Villa</option>
            <option value="Cabin">Cabin</option>
            <option value="Resort">Resort</option>
            <option value="Cottage">Cottage</option>
            <option value="Treehouse">Treehouse</option>
            <option value="Beachfront">Beachfront</option>
            <option value="Mountain Lodge">Mountain Lodge</option>
          </select>

        </div>
      </div>

      <ErrorBanner message={error} onRetry={fetchProperties} />

      {/* Properties Table */}
      {loading ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex items-center justify-center min-h-[300px]">
          <LoadingSpinner label="Loading retreat catalog..." />
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
          <Home className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Properties Found</h3>
          <p className="text-xs text-slate-400">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try changing your search query or filters.'
              : 'No retreat listings registered on the platform.'}
          </p>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Retreat Property</th>
                  <th className="p-3.5">Host / Owner</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Rate / Capacity</th>
                  <th className="p-3.5">Live Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProperties.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-900/40 transition">
                    
                    {/* Title & Preview */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=120'}
                          alt={prop.title}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/properties/${prop._id}`}
                            className="font-bold text-white hover:text-purple-400 transition truncate max-w-[200px] block"
                          >
                            {prop.title}
                          </Link>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Type: {prop.propertyType || 'Sanctuary'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Host */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={prop.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                          alt={prop.owner?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-300 text-xs">{prop.owner?.name || 'Unknown Host'}</p>
                          <p className="text-[10px] text-slate-500">{prop.owner?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-3.5">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{prop.location?.city}, {prop.location?.country || prop.location?.state}</span>
                      </span>
                    </td>

                    {/* Price & Capacity */}
                    <td className="p-3.5">
                      <p className="font-extrabold text-white text-xs">${prop.pricePerNight} <span className="text-[10px] font-normal text-slate-400">/ night</span></p>
                      <p className="text-[10px] text-slate-500">{prop.maxGuests} max guests</p>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {prop.isApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Live & Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                          <XCircle className="w-3 h-3" /> Revoked / Offline
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/properties/${prop._id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View Retreat Page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        
                        <button
                          onClick={() => handleToggleApproval(prop._id)}
                          disabled={approvalLoadingId === prop._id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                            prop.isApproved
                              ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30'
                              : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30'
                          }`}
                        >
                          {approvalLoadingId === prop._id
                            ? 'Saving...'
                            : prop.isApproved
                            ? 'Revoke Approval'
                            : 'Approve Listing'}
                        </button>
                      </div>
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

export default AdminPropertiesPage;
