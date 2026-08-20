import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Home, Upload, Plus, Trash2, CheckCircle2, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const PROPERTY_TYPES = [
  'Villa',
  'Cabin',
  'Cottage',
  'Beachfront',
  'Mountain Lodge',
  'Glamping',
  'Treehouse',
  'Resort',
  'Apartment',
  'Other',
];

const AVAILABLE_AMENITIES = [
  'WiFi',
  'Hot Tub',
  'Sauna',
  'Pool',
  'Fireplace',
  'Beachfront',
  'Mountain View',
  'Yoga Deck',
  'Chef Kitchen',
  'Air Conditioning',
  'Free Parking',
  'Stargazing Deck',
  'Fire Pit',
];

const CreateEditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOwner, isAdmin } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'Cabin',
    city: '',
    state: 'CA',
    country: 'USA',
    address: '',
    pricePerNight: '',
    maxGuests: '4',
    bedrooms: '2',
    bathrooms: '2',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    amenities: [],
    rules: '',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchProperty = async () => {
        try {
          setFetchLoading(true);
          const response = await API.get(`/properties/${id}`);
          if (response.data.success) {
            const p = response.data.data;
            setFormData({
              title: p.title || '',
              description: p.description || '',
              propertyType: p.propertyType || 'Cabin',
              city: p.location?.city || '',
              state: p.location?.state || 'CA',
              country: p.location?.country || 'USA',
              address: p.address || '',
              pricePerNight: p.pricePerNight || '',
              maxGuests: p.maxGuests || '4',
              bedrooms: p.bedrooms || '2',
              bathrooms: p.bathrooms || '2',
              checkInTime: p.checkInTime || '15:00',
              checkOutTime: p.checkOutTime || '11:00',
              amenities: p.amenities || [],
              rules: p.rules ? p.rules.join(', ') : '',
            });
            setExistingImages(p.images || []);
          }
        } catch (err) {
          const errorMsg = err.response?.data?.message || 'Failed to fetch property details';
          setError(errorMsg);
          toast.error(errorMsg);
        } finally {
          setFetchLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityToggle = (amenity) => {
    const current = formData.amenities;
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    setFormData({ ...formData, amenities: updated });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (idx) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.city || !formData.address || !formData.pricePerNight) {
      const msg = 'Please fill in all required fields marked with *';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();

      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'amenities') {
          val.forEach((a) => data.append('amenities', a));
        } else {
          data.append(key, val);
        }
      });

      imageFiles.forEach((file) => {
        data.append('images', file);
      });

      let response;
      if (isEditMode) {
        response = await API.put(`/properties/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await API.post('/properties', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (response.data.success) {
        const msg = isEditMode ? 'Retreat property updated successfully!' : 'Retreat property created & published!';
        setSuccess(msg);
        toast.success(msg);
        setTimeout(() => {
          navigate('/owner-dashboard');
        }, 1200);
      }
    } catch (err) {
      console.error('Property submit error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to save property listing.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <LoadingSpinner fullScreen label="Loading property data..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/owner-dashboard')}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Owner Dashboard
        </button>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Owner Portal
        </span>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="border-b border-slate-800/80 pb-4">
          <h1 className="text-2xl font-extrabold text-white">
            {isEditMode ? 'Edit Retreat Property' : 'List a New Retreat Sanctuary'}
          </h1>
          <p className="text-sm text-slate-400">
            Publish high-quality photos, specs, pricing, and amenities for guests
          </p>
        </div>

        <ErrorBanner message={error} />

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title & Property Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Retreat Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Redwood Sanctuary Cabin & Spa"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Property Type *
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm bg-slate-900"
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the environment, views, spa facilities, mindfulness features..."
              className="w-full p-4 rounded-xl glass-input text-sm resize-none"
              required
            />
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Big Sur"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="CA"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="USA"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Full Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="84000 Highway 1, Big Sur, CA 93920"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              required
            />
          </div>

          {/* Capacity & Pricing */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Price / Night ($) *</label>
              <input
                type="number"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleInputChange}
                placeholder="300"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Max Guests *</label>
              <input
                type="number"
                name="maxGuests"
                value={formData.maxGuests}
                onChange={handleInputChange}
                placeholder="6"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Amenities Multi-Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const selected = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition cursor-pointer text-left ${
                      selected
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-700'}`}>
                      {selected && <Plus className="w-3 h-3 rotate-45" />}
                    </div>
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
              Property Images (Upload to Cloudinary)
            </label>

            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/40 text-center transition cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Click or drag photos here to upload</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 5MB per file</p>
            </div>

            {/* Previews */}
            {(imagePreviews.length > 0 || existingImages.length > 0) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-700">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[9px] text-slate-300">Saved</span>
                  </div>
                ))}
                {imagePreviews.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-indigo-500">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl gradient-button text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Home className="w-4 h-4" /> {isEditMode ? 'Update Property Listing' : 'Publish Property Listing'}
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
};

export default CreateEditPropertyPage;
