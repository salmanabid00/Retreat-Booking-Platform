import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import { 
  Calendar, 
  Search, 
  Filter, 
  DollarSign, 
  User, 
  Home, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/admin/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Fetch admin bookings error:', err);
      setError(err.response?.data?.message || 'Failed to load platform bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const searchLower = searchTerm.trim().toLowerCase();
    const custName = b.customer?.name || 'Guest User';
    const custEmail = b.customer?.email || '';
    const propTitle = b.property?.title || 'Sanctuary Retreat';
    const bookingRef = b._id ? b._id.toString() : '';

    const matchesSearch =
      !searchLower ||
      custName.toLowerCase().includes(searchLower) ||
      custEmail.toLowerCase().includes(searchLower) ||
      propTitle.toLowerCase().includes(searchLower) ||
      bookingRef.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return Boolean(matchesSearch && matchesStatus);
  });

  const totalGross = bookings.reduce((sum, b) => (b.status === 'confirmed' ? sum + (b.totalPrice || 0) : sum), 0);
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Financial Overview */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" /> Platform Reservations Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive audit trail of all guest booking requests, confirmed stays, and financial settlements
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

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Confirmed Revenue</span>
            <span className="text-sm font-black text-emerald-400">${totalGross.toLocaleString()}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Bookings</span>
            <span className="text-sm font-bold text-white">{bookings.length}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Confirmed</span>
            <span className="text-sm font-bold text-emerald-400">{confirmedCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pending Review</span>
            <span className="text-sm font-bold text-amber-400">{pendingCount}</span>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, email, or retreat..."
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
            <option value="all">All Reservation Statuses ({bookings.length})</option>
            <option value="confirmed">Confirmed ({confirmedCount})</option>
            <option value="pending">Pending Review ({pendingCount})</option>
            <option value="cancelled">Cancelled ({cancelledCount})</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={fetchBookings} />

      {/* Bookings Table */}
      {loading ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex items-center justify-center min-h-[300px]">
          <LoadingSpinner label="Loading reservation ledger..." />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Reservations Found</h3>
          <p className="text-xs text-slate-400">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or status filter.'
              : 'No reservations have been placed across the platform yet.'}
          </p>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {filteredBookings.length} reservation{filteredBookings.length === 1 ? '' : 's'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Reservation / Retreat</th>
                  <th className="p-3.5">Guest (Customer)</th>
                  <th className="p-3.5">Dates / Duration</th>
                  <th className="p-3.5">Party Size</th>
                  <th className="p-3.5">Financial Total</th>
                  <th className="p-3.5 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/40 transition">
                    
                    {/* Retreat */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=120'}
                          alt={b.property?.title}
                          className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white truncate max-w-[180px]">
                            {b.property?.title || 'Sanctuary Property'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Ref: #{b._id.substring(b._id.length - 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Guest */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={b.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                          alt={b.customer?.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200 truncate">{b.customer?.name || 'Guest'}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{b.customer?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white">
                          {new Date(b.checkInDate).toLocaleDateString()} &rarr; {new Date(b.checkOutDate).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {b.nights} night{b.nights === 1 ? '' : 's'} stay
                        </p>
                      </div>
                    </td>

                    {/* Guests */}
                    <td className="p-3.5">
                      <span className="font-medium text-slate-300">{b.guests} guest{b.guests === 1 ? '' : 's'}</span>
                    </td>

                    {/* Price */}
                    <td className="p-3.5">
                      <p className="font-black text-emerald-400 text-sm">${b.totalPrice.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">${b.pricePerNight}/night · {b.nights} night{b.nights === 1 ? '' : 's'}</p>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        b.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        b.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {b.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                        {b.status === 'pending' && <Clock className="w-3 h-3" />}
                        {b.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {b.status === 'cancelled' && <AlertCircle className="w-3 h-3" />}
                        {b.status}
                      </span>
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

export default AdminBookingsPage;
