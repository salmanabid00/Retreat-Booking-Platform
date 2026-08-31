import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import { 
  Home, 
  Calendar, 
  DollarSign, 
  Clock, 
  PlusCircle, 
  ArrowUpRight, 
  MessageSquare, 
  CheckCircle2, 
  XCircle,
  Sparkles
} from 'lucide-react';

const OwnerOverviewPage = () => {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const fetchHostData = async () => {
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
      console.error('Fetch host overview error:', err);
      setError(err.response?.data?.message || 'Failed to load host overview data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostData();
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
      toast.error(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setStatusLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner label="Loading sanctuary host summary..." />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={fetchHostData} />;
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  return (
    <div className="space-y-6">
      
      {/* 4 Host Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Host Earnings */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Host Earnings</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-emerald-400 tracking-tight">${totalEarnings.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 font-medium">From {confirmedBookings.length} confirmed stays</p>
          </div>
        </div>

        {/* My Active Retreats */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Listed Retreats</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-white tracking-tight">{properties.length}</p>
            <p className="text-[11px] text-slate-400 font-medium">Active sanctuaries online</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Requests</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-amber-400 tracking-tight">{pendingBookings.length}</p>
            <p className="text-[11px] text-slate-400 font-medium">Awaiting your approval</p>
          </div>
        </div>

        {/* Total Reservations */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-white tracking-tight">{bookings.length}</p>
            <p className="text-[11px] text-slate-400 font-medium">All-time reservation volume</p>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/owner-dashboard/properties"
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/60 transition group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition flex items-center gap-1.5">
              Manage My Properties ({properties.length}) <ArrowUpRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-400">Update rates, photos, amenities, and maintenance blockouts</p>
          </div>
        </Link>

        <Link
          to="/owner-dashboard/bookings"
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/60 transition group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition flex items-center gap-1.5">
              Review Guest Booking Requests ({bookings.length}) <ArrowUpRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-400">Accept or reject pending dates and contact incoming guests</p>
          </div>
        </Link>
      </div>

      {/* Pending / Recent Bookings Section */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {pendingBookings.length > 0 ? `Action Required: Pending Requests (${pendingBookings.length})` : 'Recent Guest Reservations'}
            </h3>
          </div>
          <Link to="/owner-dashboard/bookings" className="text-xs text-indigo-400 hover:underline font-semibold">
            View All Requests
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No guest booking requests received yet.</p>
        ) : (
          <div className="space-y-3">
            {(pendingBookings.length > 0 ? pendingBookings : bookings.slice(0, 4)).map((booking) => {
              const prop = booking.property || {};
              const guest = booking.customer || {};

              return (
                <div
                  key={booking._id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-sm truncate">{prop.title || 'Sanctuary Retreat'}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                        booking.status === 'pending' ? 'bg-amber-500/20 text-amber-300 animate-pulse' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                      <span>Guest: <strong className="text-slate-200">{guest.name || 'Guest User'}</strong></span>
                      <span>Dates: {new Date(booking.checkInDate).toLocaleDateString()} &rarr; {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                      <span>{booking.guests} Guests ({booking.nights} nights)</span>
                      <span className="font-bold text-emerald-400">${booking.totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <Link
                      to={`/chat?booking=${booking._id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Chat
                    </Link>

                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                          disabled={statusLoadingId === booking._id}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'rejected')}
                          disabled={statusLoadingId === booking._id}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default OwnerOverviewPage;
