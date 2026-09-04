import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Users, Calendar, Filter, X, Sparkles, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

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
    <div className="bg-stone-900/60 backdrop-blur-xl p-6 rounded-3xl border border-stone-800/80 space-y-6 shadow-2xl mb-8">
      
      {/* Search Input & Main Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Search / Location */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
            Location / Keyword
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="e.g. Big Sur, Aspen, Bali..."
              className="pl-10 h-10 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
            />
          </div>
        </div>

        {/* Guests Count */}
        <div>
          <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
            Min Guests
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="number"
              min="1"
              max="20"
              value={filters.guests || ''}
              onChange={(e) => onFilterChange({ guests: e.target.value })}
              placeholder="1+ Guest"
              className="pl-10 h-10 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
            Price Range ($/night)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange({ minPrice: e.target.value })}
              placeholder="Min $"
              className="h-10 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
            />
            <Input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
              placeholder="Max $"
              className="h-10 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
            />
          </div>
        </div>

        {/* Expand / Filter Controls */}
        <div className="flex items-end gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex-1 h-10 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              isExpanded
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-stone-950/80 border-stone-800 text-stone-300 hover:border-stone-700 hover:text-stone-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            {isExpanded ? 'Fewer Filters' : 'More Filters'}
          </button>

          <button
            onClick={onReset}
            className="h-10 w-10 rounded-xl bg-stone-950/80 border border-stone-800 text-stone-400 hover:text-stone-100 hover:border-stone-700 flex items-center justify-center transition cursor-pointer shrink-0"
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
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-bold border-transparent shadow-md shadow-amber-600/20'
                  : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Expanded Advanced Filters */}
      {isExpanded && (
        <div className="pt-5 border-t border-stone-800/80 space-y-4 animate-in fade-in slide-in-from-top-2">
          
          {/* Availability Date Search */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Filter by Available Dates
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Check-in Date</span>
                <input
                  type="date"
                  value={filters.checkInDate || ''}
                  onChange={(e) => onFilterChange({ checkInDate: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-stone-950/80 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Check-out Date</span>
                <input
                  type="date"
                  value={filters.checkOutDate || ''}
                  onChange={(e) => onFilterChange({ checkOutDate: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-stone-950/80 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
            </div>
          </div>

          {/* Amenities Multi-Select Checklist */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
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
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                        : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
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
