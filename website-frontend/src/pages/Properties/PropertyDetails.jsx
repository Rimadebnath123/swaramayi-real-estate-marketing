import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Phone,
  MessageSquare,
  Share2,
  Heart,
  Layers,
  FileText,
  Calendar,
  CheckCircle,
  Building,
  UserCheck,
  Compass,
  ArrowRight,
  Eye,
  Star,
} from 'lucide-react';

import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';
import EnquiryForm from '../../components/Forms/EnquiryForm';
import EMICalculator from '../../components/Calculators/EMICalculator';
import PropertyCard from '../../components/PropertyCard/PropertyCard';

import { propertyService } from '../../services/propertyService';
import { useFavorites } from '../../context/FavoritesContext';
import { useCompare } from '../../context/CompareContext';

export default function PropertyDetails() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isComparing } = useCompare();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(5);
  const [ratingAdvisorName, setRatingAdvisorName] = useState('');
  const [ratingCustomerName, setRatingCustomerName] = useState('');
  const [ratingCustomerPhone, setRatingCustomerPhone] = useState('');
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmittedSuccess, setRatingSubmittedSuccess] = useState(false);

  const resetRatingForm = () => {
    setRatingCustomerName('');
    setRatingCustomerPhone('');
    setRatingComment('');
    setRatingStars(5);
    setHoverStars(5);
    setRatingSubmittedSuccess(false);
  };

  useEffect(() => {
    fetchDetails();
    window.scrollTo(0, 0);

    const getQueryParam = (paramName) => {
      let searchParams = new URLSearchParams(window.location.search);
      let val = searchParams.get(paramName);
      if (val) return val;

      const hash = window.location.hash || '';
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashQuery = hash.substring(qIndex + 1);
        const hashParams = new URLSearchParams(hashQuery);
        val = hashParams.get(paramName);
        if (val) return val;
      }
      return null;
    };

    const hash = window.location.hash || '';
    const urlCustomer = getQueryParam('customer') || getQueryParam('name') || getQueryParam('customerName');
    const urlAdvisor = getQueryParam('advisor') || getQueryParam('advisorName') || getQueryParam('advisor_name');
    const urlMobile = getQueryParam('mobile') || getQueryParam('phone') || getQueryParam('customerPhone');

    if (hash.includes('rate-advisor') || getQueryParam('rate') === 'true' || urlCustomer || urlAdvisor) {
      resetRatingForm();
      setShowRatingModal(true);
      if (urlCustomer) {
        setRatingCustomerName(decodeURIComponent(urlCustomer));
      }
      if (urlAdvisor) {
        setRatingAdvisorName(decodeURIComponent(urlAdvisor));
      }
      if (urlMobile) {
        setRatingCustomerPhone(decodeURIComponent(urlMobile));
      }
    }
  }, [slug]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await propertyService.getPropertyBySlug(slug);
      if (res.data) {
        setProperty(res.data);
        setActiveImage(res.data.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80');

        // Fetch similar properties
        const simRes = await propertyService.getProperties({
          location: res.data.location,
          limit: 3,
        });
        setSimilarProperties((simRes.data || []).filter((p) => p._id !== res.data._id));
      }
    } catch (error) {
      console.error('Error loading property details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-navy-900 font-bold">
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Property Not Found</h2>
        <Link to="/properties" className="px-6 py-2.5 bg-gold-500 text-navy-900 font-bold rounded-xl">
          Back to Properties
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(property._id);
  const comparing = isComparing(property._id);

  const formatPrice = (amount) => {
    if (!amount) return 'Price on Request';
    if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(2)} Lakhs`;
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  const images = property.images?.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

  const whatsappUrl = `https://wa.me/918902130791?text=${encodeURIComponent(
    `Hello Swarnamayi Real Estate Team, I am interested in "${property.title}" (${window.location.href}). Please share details.`
  )}`;

  return (
    <>
      <SEO
        title={`${property.title} | Swarnamayi Real Estate`}
        description={`${property.bedrooms} BHK Property in ${property.location}, ${property.city}. Price: ${formatPrice(property.price)}. Area: ${property.areaSqft} sqft.`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: property.title,
          description: property.description,
          url: window.location.href,
        }}
      />

      <div className="bg-light-bg min-h-screen pb-16">
        {/* Top Breadcrumb Header */}
        <div className="bg-navy-900 text-white py-6 border-b border-gold-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs
              items={[
                { label: 'Properties', link: '/properties' },
                { label: property.location, link: `/properties?location=${property.location}` },
                { label: 'Property Details' },
              ]}
            />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-gold-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-500" />
                  <span>
                    {property.location}, {property.city}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white max-w-3xl leading-relaxed mt-1">
                  {property.description}
                </h1>
              </div>

              {/* Price Tag & Action Badges */}
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-xs text-gray-400">Offered Price</div>
                  <div className="text-2xl sm:text-3xl font-black text-gold-400">{formatPrice(property.price)}</div>
                </div>
                <button
                  onClick={() => toggleFavorite(property)}
                  className={`p-3 rounded-xl border backdrop-blur-md transition-colors ${
                    favorited ? 'bg-red-500 border-red-500 text-white' : 'bg-navy-800 border-gold-500/40 text-gold-400'
                  }`}
                  title="Bookmark Property"
                >
                  <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Gallery, Details, Amenities, EMI */}
            <div className="lg:col-span-2 space-y-8">
              {/* IMAGE GALLERY */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
                {/* Main Large Image */}
                <div className="relative h-[360px] sm:h-[450px] rounded-xl overflow-hidden bg-gray-100 group">
                  <img
                    src={activeImage}
                    alt={property.title}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                    onClick={() => setLightboxOpen(true)}
                  />
                  <div className="absolute bottom-3 right-3 bg-navy-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md">
                    Click for Fullscreen Gallery
                  </div>
                </div>

                {/* Thumbnails Row */}
                {images.length > 1 && (
                  <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          activeImage === img ? 'border-gold-500 scale-105' : 'border-transparent opacity-70'
                        }`}
                      >
                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* QUICK SPEC HIGHLIGHTS GRID */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-navy-900 mb-4 pb-2 border-b border-gray-100">
                  Property Quick Specs
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-gray-500 font-semibold mb-1">Bedrooms</div>
                    <div className="font-bold text-navy-900 text-sm">{property.bedrooms || 0} BHK</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-gray-500 font-semibold mb-1">Super Area</div>
                    <div className="font-bold text-navy-900 text-sm">
                      {property.superBuiltupArea || property.built_up_area_sqft || property.superArea || property.areaSqft} sqft
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-gray-500 font-semibold mb-1">Carpet Area</div>
                    <div className="font-bold text-navy-900 text-sm">
                      {property.carpetArea || property.carpet_area_sqft || property.areaSqft} sqft
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-gray-500 font-semibold mb-1">Furnishing</div>
                    <div className="font-bold text-navy-900 text-sm">{property.furnishing}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-gray-500 font-semibold mb-1">Facing</div>
                    <div className="font-bold text-navy-900 text-sm">{property.facing || 'East'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-gray-500 font-semibold mb-1">Floor</div>
                    <div className="font-bold text-navy-900 text-sm">
                      {property.floor
                        ? (String(property.floor).toLowerCase().includes('floor')
                            ? property.floor
                            : `${property.floor}${property.totalFloors ? ` of ${property.totalFloors}` : ''}`)
                        : 'Ground'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-gray-500 font-semibold mb-1">Possession</div>
                    <div className="font-bold text-navy-900 text-sm">
                      {property.possessionStatus || property.possession_status || property.possession_date || 'Ready to Move In'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-gray-500 font-semibold mb-1">RERA Status</div>
                    <div className="font-bold text-navy-900 text-sm">{property.reraApproved ? 'Approved' : 'Pending'}</div>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">
                  Full Property Description
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* AMENITIES */}
              {property.amenities?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-base font-bold text-navy-900 mb-4 pb-2 border-b border-gray-100">
                    Amenities & Features
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-gray-800 p-2.5 bg-light-bg rounded-xl">
                        <CheckCircle className="w-4 h-4 text-gold-600 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMI CALCULATOR */}
              <EMICalculator defaultPrice={property.price} />
            </div>

            {/* RIGHT COLUMN: Enquiry Form, Site Visit Form & Agent Info */}
            <div className="space-y-6">
              {/* Agent Card */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="text-xs font-bold text-gold-600 uppercase tracking-wider mb-3">Assigned Property Advisor</div>
                {(() => {
                  const advisor = property.assignedAdvisor || property.agent || {};
                  const advisorName = advisor.name || 'Punita Roy';
                  const advisorRole = advisor.role || advisor.designation || 'Sales Management';
                  const advisorPhone = advisor.phone || advisor.mobile || '+91 90513 22932';
                  const advisorImage = advisor.profileImage || advisor.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80';
                  const advisorRating = advisor.rating || advisor.advisor_rating || (advisorName.toLowerCase().includes('abinash') ? '4.7' : '4.8');

                  const cleanPhone = advisorPhone.replace(/[^0-9]/g, '');
                  const waLink = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Hi ${advisorName}, I am interested in ${property.title} (${property.location}). Please share more details.`)}`;

                  return (
                    <>
                      <div className="flex items-center space-x-3 mb-4">
                        <img
                          src={advisorImage}
                          alt={advisorName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gold-500 shadow-sm"
                        />
                        <div>
                          <h4 className="font-bold text-navy-900 text-sm">{advisorName}</h4>
                          <p className="text-xs text-gray-500 font-medium">{advisorRole}</p>
                          <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
                            <span className="inline-flex items-center bg-amber-50 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-300 shadow-xs">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                              ★{advisorRating} Rating
                            </span>
                            <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">
                              Official Swaramayi Advisor
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <a
                          href={`tel:${advisorPhone}`}
                          className="py-2.5 bg-navy-900 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 hover:bg-navy-800 transition-colors shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5 text-gold-400" />
                          <span>Call Advisor</span>
                        </a>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          resetRatingForm();
                          setRatingAdvisorName(advisorName);
                          setShowRatingModal(true);
                        }}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-navy-950 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5 fill-navy-950 text-navy-950" />
                        <span>Rate Assigned Advisor</span>
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Enquiry Form */}
              <EnquiryForm propertyId={property._id} propertyTitle={property.title} />
            </div>
          </div>

          {/* SIMILAR RECOMMENDED PROPERTIES */}
          {similarProperties.length > 0 && (
            <div className="mt-16 pt-10 border-t border-gray-200">
              <h2 className="text-2xl font-extrabold text-navy-900 mb-6">Similar Properties in {property.location}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarProperties.map((simProp, idx) => (
                  <PropertyCard key={simProp.id || simProp._id || simProp.slug || idx} property={simProp} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOMER 5-STAR ADVISOR RATING MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative animate-fadeIn">
            <button
              onClick={() => {
                setShowRatingModal(false);
                resetRatingForm();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>

            {ratingSubmittedSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold shadow-inner">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-navy-900">Rating Received!</h3>
                <p className="text-xs text-gray-600 font-medium">
                  Thank you <strong className="text-navy-900">{ratingCustomerName || 'Valued Customer'}</strong>! Your <strong className="text-amber-600">{ratingStars}-Star Rating</strong> for <strong className="text-navy-900">{ratingAdvisorName || property?.assignedAdvisor?.name || property?.agent?.name || 'Punita Roy'}</strong> has been successfully recorded.
                </p>
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    resetRatingForm();
                  }}
                  className="mt-4 px-6 py-2.5 bg-navy-900 text-white font-bold text-xs rounded-xl hover:bg-navy-800 transition-colors shadow-sm"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!ratingCustomerName.trim()) {
                    alert('Please enter your full name to submit the rating.');
                    return;
                  }
                  const advName = ratingAdvisorName || property?.assignedAdvisor?.name || property?.agent?.name || 'Punita Roy';
                  const host = window.location.hostname || 'localhost';
                  const ratingPayload = {
                    advisorName: advName,
                    rating: ratingStars,
                    customerName: ratingCustomerName,
                    customerPhone: ratingCustomerPhone,
                    comment: ratingComment,
                    propertyTitle: property?.title || 'GAJAPATI APARTMENT'
                  };

                  try {
                    await fetch(`http://${host}:5000/api/public/advisor-rating`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(ratingPayload)
                    });
                  } catch (err) {
                    try {
                      await fetch('/api/public/advisor-rating', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(ratingPayload)
                      });
                    } catch (e2) {
                      console.warn('Backend rating endpoint sync:', e2);
                    }
                  }

                  setProperty(prev => {
                    if (!prev) return prev;
                    const updatedAdvisor = {
                      ...(prev.assignedAdvisor || prev.agent || {}),
                      rating: ratingStars.toFixed(1)
                    };
                    return {
                      ...prev,
                      assignedAdvisor: updatedAdvisor,
                      agent: updatedAdvisor
                    };
                  });

                  setRatingSubmittedSuccess(true);
                }}
                className="space-y-4"
              >
                <div className="text-center border-b border-gray-100 pb-3">
                  <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1">
                    Customer Advisor Feedback
                  </span>
                  <h3 className="text-lg font-bold text-navy-900">Rate Your Property Advisor</h3>
                  <p className="text-xs text-gray-500">
                    Share your consultation experience with {ratingAdvisorName || property?.assignedAdvisor?.name || property?.agent?.name || 'Punita Roy'}
                  </p>
                </div>

                {/* Advisor Banner */}
                <div className="flex items-center space-x-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
                  <img
                    src={property?.assignedAdvisor?.profileImage || property?.agent?.profileImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                    alt="Advisor"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gold-500 shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-navy-900 text-sm">{ratingAdvisorName || property?.assignedAdvisor?.name || property?.agent?.name || 'Punita Roy'}</h4>
                    <p className="text-xs text-gray-500 font-medium">{property?.assignedAdvisor?.role || property?.agent?.role || 'Sales Management'}</p>
                    <div className="text-[10px] text-amber-800 font-bold mt-0.5">Official Swaramayi Property Advisor</div>
                  </div>
                </div>

                {/* Interactive Star Rating */}
                <div className="text-center py-2">
                  <label className="block text-xs font-extrabold text-navy-900 uppercase tracking-wider mb-2">
                    Select Your Rating (1 - 5 Stars) *
                  </label>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverStars(star)}
                        onMouseLeave={() => setHoverStars(ratingStars)}
                        onClick={() => setRatingStars(star)}
                        className="p-1 focus:outline-none transform hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverStars || ratingStars)
                              ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-extrabold text-amber-700 mt-2">
                    {ratingStars === 5 && '😍 5/5 Stars - Outstanding & Highly Recommended!'}
                    {ratingStars === 4 && '😊 4/5 Stars - Very Good Consultation'}
                    {ratingStars === 3 && '😐 3/5 Stars - Average Experience'}
                    {ratingStars <= 2 && '😕 Needs Improvement'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Das"
                    value={ratingCustomerName}
                    onChange={(e) => setRatingCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-navy-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Your Phone / Mobile Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 90513 22932"
                    value={ratingCustomerPhone}
                    onChange={(e) => setRatingCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-navy-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Feedback Review / Comment (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Tell us about your experience..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-navy-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <Star className="w-4 h-4 fill-navy-950 text-navy-950" />
                  <span>Submit Advisor Rating & Review</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
