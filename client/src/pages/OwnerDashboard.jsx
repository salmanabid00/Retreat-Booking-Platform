import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import { 
  Home, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  Lock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  User,
  Sparkles 
} from 'lucide-react';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'bookings'
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  // Confirm delete modal state
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Blocked dates modal state
  const [selectedPropertyForBlock, setSelectedPropertyForBlock] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [propRes, bookRes] = await Promise.all([
        API.get('/properties/my-properties'),
        API.get('/bookings/owner-bookings'),
      ]);

      if (propRes.data.success) setProperties(propRes.data.data);
      if (bookRes.data.success) setBookings(bookRes.data.data);
    } catch (err) {
      console.error('Fetch owner dashboard data error:', err);
      setError(err.response?.data?.message || 'Failed to fetch owner data.');
      toast.error(err.response?.data?.message || 'Failed to fetch owner data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      setStatusLoadingId(bookingId);
      const res = await API.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
        const statusLabel = newStatus === 'confirmed' ? 'accepted' : newStatus;
        toast.success(`Booking request ${statusLabel} successfully!`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update booking status.';
      toast.error(errorMsg);
    } finally {
      setStatusLoadingId(null);
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
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block dates.');
    } finally {
      setBlockLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading owner dashboard..." />;

  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Host Management Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white">Owner Host Dashboard</h1>
          <p className="text-sm text-slate-400">
            Manage your retreat listings, review guest booking requests, and configure availability
          </p>
        </div>

        <Link
          to="/create-property"
          className="px-6 py-3 rounded-xl gradient-button text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-5 h-5" /> List New Retreat
        </Link>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer ${
            activeTab === 'properties'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Home className="w-4 h-4" /> My Properties ({properties.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer relative ${
            activeTab === 'bookings'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Calendar className="w-4 h-4" /> Guest Booking Requests ({bookings.length})
          {pendingBookingsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
              {pendingBookingsCount}
            </span>
          )}
        </button>
      </div>

      <ErrorBanner message={error} onRetry={fetchData} />

      {/* TAB 1: PROPERTIES */}
      {activeTab === 'properties' && (
        properties.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No Retreat Listings Yet"
            description="You haven't listed any property retreats yet. Add your first sanctuary to start hosting guests!"
            actionLink="/create-property"
            actionLabel="Add Your First Retreat"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const mainImg = property.images && property.images.length > 0
                ? property.images[0].url
                : 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800';

              return (
                <div key={property._id} className="glass-card rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-between">
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
                        {property.location?.city}, {property.location?.state}
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
        )
      )}

      {/* TAB 2: INCOMING BOOKING REQUESTS */}
      {activeTab === 'bookings' && (
        bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Incoming Booking Requests"
            description="When guests submit booking requests for your properties, they will appear here for your review and confirmation."
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const prop = booking.property || {};
              const guest = booking.customer || {};

              return (
                <div key={booking._id} className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-bold text-white">{prop.title}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        booking.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                        booking.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <img
                        src={guest.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={guest.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      <span>Guest: <strong>{guest.name}</strong> ({guest.email})</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Check-in</span>
                        <span className="font-semibold text-white">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Check-out</span>
                        <span className="font-semibold text-white">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Guests / Nights</span>
                        <span className="font-semibold text-white">{booking.guests} Guests ({booking.nights} nights)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Earnings</span>
                        <span className="font-bold text-emerald-400 text-sm">${booking.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Accept / Reject Action Controls */}
                  <div className="flex flex-row md:flex-col items-center justify-center gap-3 shrink-0">
                    <Link
                      to={`/chat?booking=${booking._id}`}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-400" /> Chat Guest
                    </Link>

                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                          disabled={statusLoadingId === booking._id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Accept
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'rejected')}
                          disabled={statusLoadingId === booking._id}
                          className="px-4 py-2 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
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

export default OwnerDashboard;
