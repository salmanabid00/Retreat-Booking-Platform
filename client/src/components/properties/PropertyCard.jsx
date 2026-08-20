import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Star, Sparkles, Heart } from 'lucide-react';

const PropertyCard = ({ property }) => {
  const mainImage = property.images && property.images.length > 0
    ? property.images[0].url
    : 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/80 flex flex-col h-full group">
      
  
      <div className="relative h-64 overflow-hidden bg-slate-900">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>

        
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-white text-xs font-semibold uppercase tracking-wider shadow-lg">
          {property.propertyType}
        </span>

        
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold shadow-lg">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{property.rating || '5.0'}</span>
          <span className="text-slate-400 font-normal">({property.numReviews || 0})</span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              ${property.pricePerNight}
            </span>
            <span className="text-xs text-slate-300 font-medium">/ night</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[120px]">{property.location?.city}, {property.location?.state}</span>
          </div>
        </div>
      </div>

      
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
            {property.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-300 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{property.maxGuests} Guests</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 border-x border-slate-800">
            <Bed className="w-4 h-4 text-purple-400" />
            <span>{property.bedrooms} Bed</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Bath className="w-4 h-4 text-teal-400" />
            <span>{property.bathrooms} Bath</span>
          </div>
        </div>

        
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 text-[11px] font-medium border border-slate-700/40"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-800/40 text-slate-500 text-[11px]">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          {property.owner && (
            <div className="flex items-center gap-2">
              <img
                src={property.owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={property.owner.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
              />
              <span className="text-xs text-slate-400 truncate max-w-[100px]">
                Host: {property.owner.name.split(' ')[0]}
              </span>
            </div>
          )}

          <Link
            to={`/properties/${property._id}`}
            className="gradient-button px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md shadow-indigo-600/20 flex items-center gap-1"
          >
            View Details
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PropertyCard;
