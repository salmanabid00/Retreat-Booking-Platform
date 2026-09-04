import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Star } from 'lucide-react';

const getOptimizedThumbnail = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=75&w=600';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/w_600,c_fill,q_auto,f_auto/');
  }
  if (url.includes('images.unsplash.com')) {
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?auto=format&fit=crop&q=75&w=600`;
  }
  return url;
};

const PropertyCard = ({ property }) => {
  const rawImage = property.images && property.images.length > 0
    ? property.images[0].url
    : '';
  const mainImage = getOptimizedThumbnail(rawImage);

  return (
    <div className="bg-stone-900/70 backdrop-blur-sm rounded-3xl overflow-hidden border border-stone-800/80 hover:border-amber-500/30 flex flex-col h-full group transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/5">
      
      {/* Thumbnail Banner */}
      <div className="relative h-64 overflow-hidden bg-stone-950">
        <img
          src={mainImage}
          alt={property.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-80"></div>

        {/* Category Badge */}
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700/60 text-stone-200 text-xs font-semibold uppercase tracking-wider shadow-lg">
          {property.propertyType}
        </span>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold shadow-lg">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{property.rating || '5.0'}</span>
          <span className="text-stone-400 font-normal">({property.numReviews || 0})</span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-stone-100 tracking-tight font-serif">
              ${property.pricePerNight}
            </span>
            <span className="text-xs text-stone-300 font-medium">/ night</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-300 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-stone-800">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-[120px]">{property.location?.city}, {property.location?.state}</span>
          </div>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-semibold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
            {property.title}
          </h3>
          <p className="text-xs text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-stone-950/50 border border-stone-800/70 text-xs text-stone-300 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{property.maxGuests} Guests</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 border-x border-stone-800">
            <Bed className="w-3.5 h-3.5 text-amber-400" />
            <span>{property.bedrooms} Bed</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Bath className="w-3.5 h-3.5 text-amber-400" />
            <span>{property.bathrooms} Bath</span>
          </div>
        </div>

        {/* Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-stone-950/60 text-stone-300 text-[11px] font-medium border border-stone-800"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-2 py-0.5 rounded-lg bg-stone-950/40 text-stone-500 text-[11px]">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer & CTA */}
        <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
          {property.owner && (
            <div className="flex items-center gap-2">
              <img
                src={property.owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={property.owner.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-500/30"
              />
              <span className="text-xs text-stone-400 truncate max-w-[100px]">
                Host: {property.owner.name.split(' ')[0]}
              </span>
            </div>
          )}

          <Link
            to={`/properties/${property._id}`}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 shadow-md shadow-amber-600/20 transition flex items-center gap-1"
          >
            View Details
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PropertyCard;
