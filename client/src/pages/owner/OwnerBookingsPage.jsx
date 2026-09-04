import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import { 
  Calendar, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  DollarSign,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const OwnerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/bookings/owner-bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Fetch host bookings error:', err);
      setError(err.response?.data?.message || 'Failed to load guest booking requests.');
      toast.error(err.response?.data?.message || 'Failed to load guest booking requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const filteredBookings = bookings.filter((b) => {
    const custMatch =
      b.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const propMatch = b.property?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = custMatch || propMatch;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> Guest Booking Requests
              </h2>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
                  {pendingCount} Pending Action
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review guest reservation inquiries, confirm incoming dates, or message travelers directly
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by guest name, email, or retreat..."
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
            <option value="all">All Request Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={fetchBookings} />

      {/* Bookings List */}
      {loading ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex items-center justify-center min-h-[300px]">
          <LoadingSpinner label="Loading guest reservation requests..." />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Incoming Booking Requests"
          description="When guests submit booking requests for your properties, they will appear here for your review and confirmation."
        />
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Reservations</h3>
          <p className="text-xs text-slate-400">Try changing your search query or filter selection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const prop = booking.property || {};
            const guest = booking.customer || {};

            return (
              <div
                key={booking._id}
                className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base font-bold text-white truncate max-w-[280px]">
                      {prop.title || 'Sanctuary Retreat'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        booking.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                        booking.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.paymentStatus === 'paid' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                          ✓ Paid
                        </span>
                      ) : booking.status === 'confirmed' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                          Awaiting Guest Payment
                        </span>
                      ) : null}
                    </div>
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
                      <span className="text-[10px] text-slate-500 block uppercase">Guests / Stay</span>
                      <span className="font-semibold text-white">{booking.guests} Guests ({booking.nights} nights)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Host Payout</span>
                      <span className="font-bold text-emerald-400 text-sm">${booking.totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Accept / Reject / Chat Actions */}
                <div className="flex flex-row md:flex-col items-center justify-center gap-3 shrink-0">
                  <Link
                    to={`/chat?booking=${booking._id}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 hover:border-slate-700 transition"
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
      )}

    </div>
  );
};

export default OwnerBookingsPage;
