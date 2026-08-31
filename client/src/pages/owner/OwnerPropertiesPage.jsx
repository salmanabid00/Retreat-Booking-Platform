import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { 
  Home, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  Lock, 
  MapPin, 
  Search,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const OwnerPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Blocked dates modal state
  const [selectedPropertyForBlock, setSelectedPropertyForBlock] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/properties/my-properties');
      if (res.data.success) {
        setProperties(res.data.data);
      }
    } catch (err) {
      console.error('Fetch host properties error:', err);
      setError(err.response?.data?.message || 'Failed to load your retreat listings.');
      toast.error(err.response?.data?.message || 'Failed to load your retreat listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    try {
      setDeleteLoadingId(propertyToDelete._id);
      const res = await API.delete(`/properties/${propertyToDelete._id}`);
      if (res.data.success) {
        setProperties((prev) => prev.filter((p) => p._id !== propertyToDelete._id));
        toast.success(`Property "${propertyToDelete.title}" deleted successfully!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete property.');
    } finally {
      setDeleteLoadingId(null);
      setPropertyToDelete(null);
    }
  };

  const handleAddBlockedDates = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates.');
      return;
    }
    try {
      setBlockLoading(true);
      const res = await API.post(`/properties/${selectedPropertyForBlock._id}/blocked-dates`, {
        startDate,
        endDate,
        reason: blockReason || 'Maintenance Block',
      });
      if (res.data.success) {
        toast.success('Maintenance date blockout saved successfully!');
        setSelectedPropertyForBlock(null);
        setStartDate('');
        setEndDate('');
        setBlockReason('');
        fetchProperties();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block dates.');
    } finally {
      setBlockLoading(false);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const titleMatch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || cityMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-400" /> My Retreat Sanctuary Listings
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage property descriptions, nightly pricing, photos, and calendar availability lockouts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProperties}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/create-property"
              className="px-4 py-2 rounded-xl gradient-button text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <PlusCircle className="w-4 h-4" /> Add Sanctuary
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="pt-2">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your retreats by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={fetchProperties} />

      {/* Properties Grid */}
      {loading ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex items-center justify-center min-h-[300px]">
          <LoadingSpinner label="Loading your retreat catalog..." />
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No Retreat Listings Yet"
          description="You haven't listed any property retreats yet. Add your first sanctuary to start hosting guests!"
          actionLink="/create-property"
          actionLabel="Add Your First Retreat"
        />
      ) : filteredProperties.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
          <Home className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Retreats</h3>
          <p className="text-xs text-slate-400">Try changing your search query to find your listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const mainImg = property.images && property.images.length > 0
              ? property.images[0].url
              : 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800';

            return (
              <div key={property._id} className="glass-card rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="relative h-48 bg-slate-900">
                    <img src={mainImg} alt={property.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur text-white text-[11px] font-semibold uppercase">
                      {property.propertyType}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                      Approved
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-white line-clamp-1">{property.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {property.location?.city}, {property.location?.state || property.location?.country}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <span className="font-extrabold text-white text-base">${property.pricePerNight} <span className="text-xs text-slate-400 font-normal">/ night</span></span>
                      <span>{property.maxGuests} Max Guests</span>
                    </div>

                    {property.blockedDates && property.blockedDates.length > 0 && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{property.blockedDates.length} Owner Date Blockouts</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Owner Actions */}
                <div className="p-4 bg-slate-900/60 border-t border-slate-800 grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                  <Link
                    to={`/properties/${property._id}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center"
                    title="View Property"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/properties/${property._id}/edit`}
                    className="p-2 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 transition flex items-center justify-center"
                    title="Edit Property"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setSelectedPropertyForBlock(property)}
                    className="p-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition flex items-center justify-center cursor-pointer"
                    title="Block Maintenance Dates"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPropertyToDelete(property)}
                    disabled={deleteLoadingId === property._id}
                    className="p-2 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 transition flex items-center justify-center cursor-pointer disabled:opacity-40"
                    title="Delete Property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Date Blockout Modal */}
      {selectedPropertyForBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" /> Block Maintenance Dates
            </h3>
            <p className="text-xs text-slate-400">
              Block availability dates for <strong>{selectedPropertyForBlock.title}</strong>
            </p>

            <form onSubmit={handleAddBlockedDates} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Deep cleaning, maintenance, private event"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPropertyForBlock(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={blockLoading}
                  className="flex-1 py-2.5 rounded-xl gradient-button text-white font-semibold flex items-center justify-center gap-1"
                >
                  {blockLoading ? 'Saving...' : 'Save Blockout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(propertyToDelete)}
        title="Delete Retreat Listing?"
        message={propertyToDelete ? `Are you sure you want to permanently delete "${propertyToDelete.title}"? This cannot be undone.` : ''}
        confirmText="Yes, Delete Property"
        cancelText="Keep Listing"
        isDanger={true}
        loading={Boolean(deleteLoadingId)}
        onConfirm={confirmDeleteProperty}
        onCancel={() => setPropertyToDelete(null)}
      />

    </div>
  );
};

export default OwnerPropertiesPage;
