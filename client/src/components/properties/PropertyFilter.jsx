import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Users, Calendar, Filter, X, Sparkles, Check } from 'lucide-react';

const PROPERTY_TYPES = [
  'All',
  'Villa',
  'Cabin',
  'Cottage',
  'Beachfront',
  'Mountain Lodge',
  'Glamping',
  'Treehouse',
  'Resort',
];

const COMMON_AMENITIES = [
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
];

const PropertyFilter = ({ filters, onFilterChange, onReset }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAmenityToggle = (amenity) => {
    const current = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onFilterChange({ amenities: updated.join(',') });
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl mb-8">
      
      {/* Search Input & Main Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Search / Location */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Location / Keyword
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="e.g. Big Sur, Malibu, Cabin..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Guests Count */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Min Guests
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="number"
              min="1"
              max="20"
              value={filters.guests || ''}
              onChange={(e) => onFilterChange({ guests: e.target.value })}
              placeholder="1+ Guest"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Price Range ($/night)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange({ minPrice: e.target.value })}
              placeholder="Min $"
              className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
            />
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
              placeholder="Max $"
              className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Expand / Filter Controls */}
        <div className="flex items-end gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              isExpanded
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            {isExpanded ? 'Less Filters' : 'More Filters'}
          </button>

          <button
            onClick={onReset}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
            title="Reset Filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Category Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
        {PROPERTY_TYPES.map((type) => {
          const selected = (filters.propertyType || 'All') === type;
          return (
            <button
              key={type}
              onClick={() => onFilterChange({ propertyType: type === 'All' ? '' : type })}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                selected
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Expanded Advanced Filters */}
      {isExpanded && (
        <div className="pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in slide-in-from-top-2">
          
          {/* Availability Date Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Filter by Available Dates
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Check-in Date</span>
                <input
                  type="date"
                  value={filters.checkInDate || ''}
                  onChange={(e) => onFilterChange({ checkInDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Check-out Date</span>
                <input
                  type="date"
                  value={filters.checkOutDate || ''}
                  onChange={(e) => onFilterChange({ checkOutDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Amenities Multi-Select Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Filter by Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((amenity) => {
                const isSelected = (filters.amenities || '').split(',').includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default PropertyFilter;
