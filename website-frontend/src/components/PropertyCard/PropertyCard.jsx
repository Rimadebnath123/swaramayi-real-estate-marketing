import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, MapPin, Bed, Bath, Maximize2, ShieldCheck, Star, Phone, Calendar } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useCompare } from '../../context/CompareContext';

export default function PropertyCard({ property }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isComparing } = useCompare();
  const navigate = useNavigate();

  if (!property) return null;

  const propId = property._id || property.id;
  const favorited = isFavorite(propId);
  const comparing = isComparing(propId);

  const formatPrice = (amount) => {
    if (!amount) return 'Price on Request';
    if (amount >= 10000000) {
      return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹ ${(amount / 100000).toFixed(2)} Lakhs`;
    }
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/properties/${property.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert('Property link copied to clipboard!');
    }
  };

  const defaultFallbackImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

  const mainImage =
    (property.images && property.images.length > 0 && property.images[0]) ||
    property.image ||
    property.building_photo ||
    property.cover_image ||
    defaultFallbackImage;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gold-500/50 shadow-sm hover:shadow-navy transition-all duration-300 flex flex-col justify-between">
      {/* CARD TOP IMAGE & BADGES */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultFallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {property.isSold ? (
            <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow animate-pulse">
              🔴 SOLD OUT
            </span>
          ) : (
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow ${
              property.constructionStatus?.toLowerCase().includes('under')
                ? 'bg-purple-600 text-white'
                : property.constructionStatus?.toLowerCase().includes('booked')
                ? 'bg-amber-500 text-navy-900'
                : property.constructionStatus?.toLowerCase().includes('hold')
                ? 'bg-yellow-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              {property.constructionStatus?.toLowerCase().includes('under') && '🏗️ '}
              {property.constructionStatus?.toLowerCase().includes('booked') && '🟡 '}
              {property.constructionStatus?.toLowerCase().includes('hold') && '⚡ '}
              {(property.constructionStatus?.toLowerCase().includes('ready') || property.constructionStatus?.toLowerCase().includes('live')) && '🟢 '}
              {property.constructionStatus || 'LIVE / AVAILABLE'}
            </span>
          )}


          {property.verified && (
            <span className="bg-navy-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-gold-500/40 shadow flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-gold-500" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Floating Icons Top Right */}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(property);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              favorited ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-gold-500 hover:text-navy-900'
            }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-black/40 text-white hover:bg-gold-500 hover:text-navy-900 flex items-center justify-center backdrop-blur-md transition-all"
            title="Share Property"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Price Overlay Bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <div className="text-xl font-black text-gold-400 drop-shadow-md">{formatPrice(property.price)}</div>
            {Boolean(property.pricePerSqft) && Number(property.pricePerSqft) > 0 ? (
              <div className="text-[11px] text-gray-200 font-medium">
                ₹ {Number(property.pricePerSqft).toLocaleString('en-IN')} / sqft
              </div>
            ) : null}
          </div>
          <span className="bg-navy-900/80 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-lg border border-gold-500/30">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* CARD BODY CONTENT */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location Line */}
          <div className="flex items-center space-x-1 text-xs font-semibold text-gray-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
            <span className="truncate">
              {property.location}, {property.city || 'Kolkata'}
            </span>
          </div>

          {/* Description instead of Property Name */}
          <Link to={`/properties/${property.slug}`}>
            <h3 className="text-base font-bold text-navy-900 group-hover:text-navy-800 line-clamp-2 transition-colors mb-3">
              {property.description || property.short_description || property.overview || `${property.bedrooms || 3} BHK residential apartment with modern amenities in ${property.location || 'Kolkata'}.`}
            </h3>
          </Link>

          {/* Key Features Grid */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-gray-50 rounded-xl mb-4 text-xs font-medium text-gray-700">
            <div className="flex items-center space-x-1">
              <Bed className="w-3.5 h-3.5 text-navy-800" />
              <span>{property.bedrooms || 0} BHK</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="w-3.5 h-3.5 text-navy-800" />
              <span>{property.bathrooms || 0} Baths</span>
            </div>
            <div className="flex items-center space-x-1">
              <Maximize2 className="w-3.5 h-3.5 text-navy-800" />
              <span>{property.areaSqft} sqft</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/properties/${property.slug}`}
              className="w-full py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-lg text-center transition-colors shadow-sm"
            >
              View Details
            </Link>
            <a
              href="tel:+918902130791"
              className="w-full py-2 border border-gold-500/60 text-navy-900 hover:bg-gold-500 font-bold text-xs rounded-lg flex items-center justify-center space-x-1 transition-colors"
            >
              <Phone className="w-3 h-3 text-gold-600" />
              <span>Contact</span>
            </a>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
            <span className="font-medium">RERA: {property.reraApproved ? 'Approved' : 'Pending'}</span>
            <button
              onClick={() => toggleCompare(property)}
              className={`text-[11px] font-semibold underline ${
                comparing ? 'text-gold-600' : 'text-gray-500 hover:text-navy-900'
              }`}
            >
              {comparing ? 'Comparing ✓' : '+ Compare'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
