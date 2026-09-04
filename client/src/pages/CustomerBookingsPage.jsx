import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  MessageSquare, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  Compass,
  Sparkles,
  CreditCard,
  Check
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'confirmed':
      return (
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
        </span>
      );
    case 'pending':
      return (
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
          <Clock className="w-3.5 h-3.5" /> Pending Host Approval
        </span>
      );
    case 'rejected':
      return (
        <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" /> Declined by Host
        </span>
      );
    case 'cancelled':
      return (
        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold uppercase tracking-wider">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          {status}
        </span>
      );
  }
};

const CustomerBookingsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [payingBookingId, setPayingBookingId] = useState(null);

  // Confirm modal state
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const handledRedirectRef = useRef(false);

  const fetchMyBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const response = await API.get('/bookings/my-bookings');
      if (response.data.success) {
        setBookings(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      console.error('Fetch customer bookings error:', err);
      if (!silent) {
        setError(err.response?.data?.message || 'Failed to load your retreat bookings.');
        toast.error(err.response?.data?.message || 'Failed to load your retreat bookings.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
    return [];
  };

  useEffect(() => {
    const initPage = async () => {
      const data = await fetchMyBookings();

      const paymentParam = searchParams.get('payment');
      const targetBookingId = searchParams.get('bookingId');

      if (paymentParam && !handledRedirectRef.current) {
        handledRedirectRef.current = true;

        if (paymentParam === 'success') {
          toast.success('Payment received successfully! Confirming your reservation...');

          // If webhook took a moment, re-poll once after 2.5 seconds
          setTimeout(async () => {
            const updated = await fetchMyBookings(true);
            const target = updated.find((b) => b._id === targetBookingId);
            if (target && target.paymentStatus === 'paid') {
              toast.success('Your booking is officially marked as PAID!');
            }
          }, 2500);
        } else if (paymentParam === 'cancelled') {
          toast('Payment was cancelled. You can complete payment whenever you are ready.', {
            icon: 'ℹ️',
          });
        }

        // Clean query parameters from URL
        setSearchParams({}, { replace: true });
      }
    };

    initPage();
  }, []);

  const handlePayNow = async (bookingId) => {
    try {
      setPayingBookingId(bookingId);
      const response = await API.post(`/bookings/${bookingId}/create-checkout-session`);
      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create payment session. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to initiate checkout. Please try again.';
      toast.error(msg);
    } finally {
      setPayingBookingId(null);
    }
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      setCancelLoadingId(bookingToCancel._id);
      const response = await API.patch(`/bookings/${bookingToCancel._id}/status`, { status: 'cancelled' });
      if (response.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingToCancel._id ? { ...b, status: 'cancelled' } : b))
        );
        toast.success('Retreat booking cancelled successfully.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoadingId(null);
      setBookingToCancel(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner fullScreen label="Fetching your retreat bookings..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Guest Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Retreat Bookings</h1>
          <p className="text-sm text-slate-400">View check-in dates, host communications, and booking statuses</p>
        </div>

        <Link
          to="/properties"
          className="gradient-button px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2"
        >
          <Compass className="w-4 h-4" /> Explore More Retreats
        </Link>
      </div>

      <ErrorBanner message={error} onRetry={() => fetchMyBookings(false)} />

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Retreat Bookings Yet"
          description="You haven't booked any retreat stays yet. Browse our curated sanctuaries and book your dream escape!"
          actionLink="/properties"
          actionLabel="Explore Retreats"
        />
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const prop = booking.property || {};
            const mainImg = prop.images && prop.images.length > 0
              ? prop.images[0].url
              : 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800';

            const isConfirmed = booking.status === 'confirmed';
            const isPaid = booking.paymentStatus === 'paid';
            const isUnpaid = !booking.paymentStatus || booking.paymentStatus === 'unpaid';

            return (
              <div key={booking._id} className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row gap-6">
                
                {/* Thumbnail */}
                <div className="w-full md:w-56 h-44 rounded-2xl overflow-hidden bg-slate-900 shrink-0 relative">
                  <img src={mainImg} alt={prop.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/80 text-[10px] font-bold text-white uppercase">
                    {prop.propertyType}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white hover:text-amber-400 transition">
                        <Link to={`/properties/${prop._id}`}>{prop.title || 'Retreat Property'}</Link>
                      </h3>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={booking.status} />
                        {isPaid && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Paid
                          </span>
                        )}
                        {isConfirmed && isUnpaid && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1">
                            Awaiting Payment
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {prop.address || 'Address'}, {prop.location?.city}, {prop.location?.state}
                    </p>
                  </div>

                  {/* Dates & Guests Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Check-in</span>
                      <span className="font-semibold text-white">{formatDate(booking.checkInDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Check-out</span>
                      <span className="font-semibold text-white">{formatDate(booking.checkOutDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Guests / Duration</span>
                      <span className="font-semibold text-white">{booking.guests} Guests ({booking.nights} nights)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Total Cost</span>
                      <span className="font-bold text-amber-400 text-sm">${booking.totalPrice}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    {prop.owner && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <img
                          src={prop.owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                          alt={prop.owner.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>Host: <strong>{prop.owner.name}</strong></span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {/* Stripe Pay Now Action: Visible only when confirmed and unpaid */}
                      {isConfirmed && isUnpaid && (
                        <Button
                          type="button"
                          variant="brand"
                          size="sm"
                          onClick={() => handlePayNow(booking._id)}
                          disabled={payingBookingId === booking._id}
                          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold shadow-md shadow-amber-600/20"
                        >
                          {payingBookingId === booking._id ? (
                            <div className="w-3.5 h-3.5 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                          Pay Now (${booking.totalPrice})
                        </Button>
                      )}

                      <Link
                        to={`/chat?booking=${booking._id}`}
                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Chat Host
                      </Link>

                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => setBookingToCancel(booking)}
                          disabled={cancelLoadingId === booking._id}
                          className="px-4 py-2 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Cancellation Modal */}
      <ConfirmModal
        isOpen={Boolean(bookingToCancel)}
        title="Cancel Retreat Booking?"
        message={bookingToCancel ? `Are you sure you want to cancel your booking for "${bookingToCancel.property?.title || 'this property'}"? The dates will be released back to the host.` : ''}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        isDanger={true}
        loading={Boolean(cancelLoadingId)}
        onConfirm={confirmCancelBooking}
        onCancel={() => setBookingToCancel(null)}
      />

    </div>
  );
};

export default CustomerBookingsPage;
