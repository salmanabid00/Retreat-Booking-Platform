import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import { 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Star, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Share2,
  Sparkles
} from 'lucide-react';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCustomer } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Booking Form State
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await API.get(`/properties/${id}`);
        if (response.data.success) {
          setProperty(response.data.data);
        }
      } catch (err) {
        console.error('Fetch property details error:', err);
        const errorMsg = err.response?.data?.message || 'Property not found.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Real-time calculation of nights and total price using useMemo
  const { nights, total } = useMemo(() => {
    if (!checkInDate || !checkOutDate || !property || !property.pricePerNight) {
      return { nights: 0, total: 0 };
    }

    const [inY, inM, inD] = checkInDate.split('-').map(Number);
    const [outY, outM, outD] = checkOutDate.split('-').map(Number);

    if (!inY || !inM || !inD || !outY || !outM || !outD) {
      return { nights: 0, total: 0 };
    }

    const start = new Date(Date.UTC(inY, inM - 1, inD));
    const end = new Date(Date.UTC(outY, outM - 1, outD));

    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { nights: 0, total: 0 };

    return {
      nights: diffDays,
      total: diffDays * property.pricePerNight,
    };
  }, [checkInDate, checkOutDate, guests, property]);

  // Check-in date change handler with intelligent auto-adjust
  const handleCheckInChange = (newCheckIn) => {
    setCheckInDate(newCheckIn);
    setBookingError('');
    setBookingSuccess('');

    if (!newCheckIn) return;

    if (!checkOutDate || new Date(checkOutDate) <= new Date(newCheckIn)) {
      const inDate = new Date(newCheckIn);
      inDate.setDate(inDate.getDate() + 1);
      const nextDayStr = inDate.toISOString().split('T')[0];
      setCheckOutDate(nextDayStr);
    }
  };

  // Check-out date change handler
  const handleCheckOutChange = (newCheckOut) => {
    setCheckOutDate(newCheckOut);
    setBookingError('');
    setBookingSuccess('');
  };

  // Booking Submit Handler
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!user) {
      toast.error('Please sign in to book a retreat sanctuary.');
      navigate('/login', { state: { from: { pathname: `/properties/${id}` } } });
      return;
    }

    if (!checkInDate || !checkOutDate) {
      const msg = 'Please select valid check-in and check-out dates.';
      setBookingError(msg);
      toast.error(msg);
      return;
    }

    if (nights <= 0) {
      const msg = 'Check-out date must be strictly after check-in date.';
      setBookingError(msg);
      toast.error(msg);
      return;
    }

    if (guests > property.maxGuests) {
      const msg = `Guests cannot exceed maximum allowed capacity of ${property.maxGuests}.`;
      setBookingError(msg);
      toast.error(msg);
      return;
    }

    try {
      setBookingLoading(true);
      const response = await API.post('/bookings', {
        propertyId: property._id,
        checkInDate,
        checkOutDate,
        guests: Number(guests),
      });

      if (response.data.success) {
        const msg = 'Booking request submitted successfully! Pending host approval.';
        setBookingSuccess(msg);
        toast.success(msg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Booking request failed.';
      setBookingError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  // Contact Owner Handler
  const handleContactHost = async () => {
    if (!user) {
      toast.error('Please sign in to contact the host.');
      navigate('/login');
      return;
    }
    try {
      const res = await API.post('/conversations', { propertyId: property._id, recipientId: property.owner._id });
      if (res.data.success) {
        navigate(`/chat?conversation=${res.data.data._id}`);
      }
    } catch (err) {
      navigate('/chat');
    }
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading retreat details..." />;
  if (error || !property) return <div className="max-w-4xl mx-auto px-4 py-12"><ErrorBanner message={error || 'Property not found'} /></div>;

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200' }];

  const isOwnerOfProperty = user && user._id === property.owner?._id;
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <Link
        to="/properties"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Retreats
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              {property.propertyType}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{property.address}, {property.location?.city}, {property.location?.state}</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{property.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{property.rating || '5.0'}</span>
            <span className="text-slate-400 text-xs font-normal">({property.numReviews || 0} reviews)</span>
          </div>
        </div>
      </div>

      {/* Image Gallery Showcase */}
      <div className="space-y-3">
        <div className="relative h-[420px] sm:h-[500px] rounded-3xl overflow-hidden glass-panel border border-slate-800">
          <img
            src={images[activeImageIdx].url}
            alt={property.title}
            className="w-full h-full object-cover transition-all duration-300"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/70 border border-slate-700 text-white hover:bg-slate-950 transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/70 border border-slate-700 text-white hover:bg-slate-950 transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Selector Strip */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-24 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                  activeImageIdx === idx ? 'border-indigo-500 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details & Specs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Specs Bar */}
          <div className="grid grid-cols-4 gap-3 p-4 rounded-2xl glass-panel border border-slate-800 text-center">
            <div>
              <Users className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Max Guests</p>
              <p className="text-sm font-bold text-white">{property.maxGuests}</p>
            </div>
            <div>
              <Bed className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Bedrooms</p>
              <p className="text-sm font-bold text-white">{property.bedrooms}</p>
            </div>
            <div>
              <Bath className="w-5 h-5 text-teal-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Bathrooms</p>
              <p className="text-sm font-bold text-white">{property.bathrooms}</p>
            </div>
            <div>
              <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Check-in / Out</p>
              <p className="text-xs font-bold text-white">{property.checkInTime} / {property.checkOutTime}</p>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-lg font-bold text-white">About this Retreat Sanctuary</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {/* Amenities Grid */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">Featured Amenities & Services</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-medium text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House Rules */}
          {property.rules && property.rules.length > 0 && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">House Rules & Sanctuary Policies</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {property.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Host Info Card */}
          {property.owner && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={property.owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={property.owner.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/40"
                />
                <div>
                  <h4 className="text-base font-bold text-white">Hosted by {property.owner.name}</h4>
                  <p className="text-xs text-slate-400">{property.owner.bio || 'Experienced Retreat Host'}</p>
                </div>
              </div>

              {!isOwnerOfProperty && (
                <button
                  onClick={handleContactHost}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-xs font-semibold text-indigo-300 hover:text-white transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-400" /> Contact Host
                </button>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Booking Widget Box */}
        <div>
          <div className="sticky top-28 glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
            
            {/* Price Header */}
            <div className="flex items-baseline justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight">${property.pricePerNight}</span>
                <span className="text-xs text-slate-400 font-medium"> / night</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Instant Availability
              </span>
            </div>

            <ErrorBanner message={bookingError} />

            {bookingSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                {bookingSuccess}
              </div>
            )}

            {/* Booking Form Inputs */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Check-in</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Check-out</label>
                  <input
                    type="date"
                    min={checkInDate || todayStr}
                    value={checkOutDate}
                    onChange={(e) => handleCheckOutChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                >
                  {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num} className="bg-slate-900 text-white">
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Recalculating Price Breakdown Box */}
              {nights > 0 ? (
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300 animate-in fade-in">
                  <div className="flex justify-between">
                    <span>${property.pricePerNight} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
                    <span className="font-semibold text-slate-200">${total}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-800/60">
                    <span>Total Amount</span>
                    <span className="text-indigo-400 text-base font-extrabold">${total}</span>
                  </div>
                </div>
              ) : (checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate)) ? (
                <div className="pt-2 text-center text-xs text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  Check-out date must be after check-in date
                </div>
              ) : null}

              {isOwnerOfProperty ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center font-medium">
                  You own this property retreat listing.
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={bookingLoading || nights <= 0}
                  className="w-full py-3.5 rounded-xl gradient-button text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" /> Request Retreat Booking
                    </>
                  )}
                </button>
              )}
            </form>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Protected by Double-Booking Engine
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default PropertyDetailPage;
