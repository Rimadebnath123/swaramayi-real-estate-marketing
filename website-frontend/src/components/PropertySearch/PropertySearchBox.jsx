import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, IndianRupee, Layers, SlidersHorizontal, ArrowRight, X, ChevronDown } from 'lucide-react';

// All 52 previous Kolkata location options + popular extended hubs
export const KOLKATA_LOCATIONS = [
  "Alipore",
  "Anwar Shah Road",
  "Ashok Nagar Road",
  "Ballygunge",
  "Bamangachhi",
  "Bansdroni",
  "Barasat",
  "Behala",
  "Bhawanipur",
  "Bidhan Nagar Road",
  "Bira",
  "Birati",
  "Bisharpara Kodaliya",
  "Chetla",
  "Dattapukur",
  "Dhakuria",
  "Dum Dum",
  "Dum Dum Cantonment",
  "Dum Dum Junction",
  "Durganagar",
  "EM Bypass",
  "Garia",
  "Gariahat",
  "Golf Green",
  "Guma",
  "Hazra",
  "Howrah",
  "Hridaypur",
  "Jadavpur",
  "Jodhpur Park",
  "Kalighat",
  "Kasba",
  "Kudghat",
  "Lake Gardens",
  "Lansdowne",
  "Madhyamgram",
  "Mukundapur",
  "Naktala",
  "Netaji Nagar",
  "New Alipore",
  "New Barrackpore",
  "New Town",
  "Prince Anwar Shah Road",
  "Rajarhat",
  "Rashbehari Avenue",
  "Regent Park",
  "Ruby",
  "Salt Lake",
  "Santoshpur",
  "Sarat Bose Road",
  "Sealdah",
  "Tollygunge",
  // Extended hubs
  "Action Area 1",
  "Action Area 2",
  "Action Area 3",
  "Baguiati",
  "Baruipur",
  "BT Road",
  "Chinar Park",
  "Joka",
  "Kaikhali",
  "Kestopur",
  "Lake Town",
  "Park Street",
  "Rajarhat Chowmatha",
  "Sector V",
  "Sonarpur",
  "Ultadanga",
  "VIP Road"
];

export default function PropertySearchBox() {
  const [activeTab, setActiveTab] = useState('Buy');
  const [location, setLocation] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSqft, setMinSqft] = useState('');
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('category', activeTab);
    if (location) params.set('location', location);
    if (propertyType) params.set('propertyType', propertyType);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minSqft) params.set('minSqft', minSqft);

    navigate(`/properties?${params.toString()}`);
  };

  const filteredLocations = KOLKATA_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes((location || '').toLowerCase())
  );

  return (
    <div className="relative z-30 max-w-6xl mx-auto px-4 -mt-16 sm:-mt-24 mb-12">
      <div className="bg-navy-900/95 backdrop-blur-xl border border-gold-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl">
        {/* TABS: BUY | RENT | COMMERCIAL | PG */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-gray-800">
          {['Buy', 'Rent', 'Commercial', 'PG'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all ${
                activeTab === tab
                  ? 'bg-gold-500 text-navy-900 shadow-gold'
                  : 'text-gray-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* SEARCH FORM */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* UNIFIED LOCATION / AREA: TYPE & DROPDOWN MENU TOGETHER */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
              Location / Area
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gold-500 absolute left-3 top-3 pointer-events-none z-10" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setIsOpen(true);
                }}
                onClick={() => setIsOpen(true)}
                onFocus={() => setIsOpen(true)}
                placeholder="All Kolkata Locations"
                className="w-full bg-navy-800 text-white text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2.5 border border-gray-700 focus:border-gold-500 focus:outline-none placeholder-gray-400 cursor-text"
              />
              {location ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation('');
                    setIsOpen(true);
                  }}
                  className="absolute right-2.5 top-3 text-gray-400 hover:text-white z-10"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                  }}
                  className="absolute right-2.5 top-3 text-gray-400 hover:text-gold-400 z-10"
                  title="Open location list"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gold-400' : ''}`} />
                </button>
              )}

              {/* Combined Type + Dropdown Menu */}
              {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-navy-900 border border-gold-500/50 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-1 divide-y divide-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setLocation('');
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      !location ? 'bg-gold-500/20 text-gold-400 font-bold' : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                    }`}
                  >
                    <span className="font-bold">🏙️ All Kolkata Locations</span>
                    <span className="text-[10px] text-gray-400">Show All</span>
                  </button>

                  {location.trim() && !KOLKATA_LOCATIONS.some(l => l.toLowerCase() === location.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 font-bold flex items-center justify-between"
                    >
                      <span>🔍 Search typed: "{location}"</span>
                      <span className="text-[10px] bg-gold-500 text-navy-900 font-extrabold px-1.5 py-0.5 rounded">Custom</span>
                    </button>
                  )}

                  {filteredLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setLocation(loc);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                        location.toLowerCase() === loc.toLowerCase()
                          ? 'bg-gold-500/20 text-gold-400 font-bold'
                          : 'text-gray-200 hover:bg-navy-800 hover:text-white'
                      }`}
                    >
                      <span>{loc}</span>
                      <MapPin className="w-3 h-3 text-gold-500/60" />
                    </button>
                  ))}

                  {filteredLocations.length === 0 && (
                    <div className="px-3.5 py-2.5 text-xs text-gray-400 text-center">
                      Press <span className="text-gold-400 font-bold">Search Property</span> to search "{location}".
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Property Type Field */}
          <div>
            <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
              Property Type
            </label>
            <div className="relative">
              <Home className="w-4 h-4 text-gold-500 absolute left-3 top-3 pointer-events-none" />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-navy-800 text-white text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 border border-gray-700 focus:border-gold-500 focus:outline-none"
              >
                <option value="">All Property Types</option>
                <option value="Apartment">Apartment / Flat</option>
                <option value="Villa">Villa / House</option>
                <option value="Penthouse">Sky Villa / Penthouse</option>
                <option value="Commercial Office">Commercial Office</option>
                <option value="Retail Shop">Retail Shop</option>
                <option value="Plot">Plot / Land</option>
              </select>
            </div>
          </div>

          {/* BHK / Bedrooms */}
          <div>
            <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
              Bedrooms (BHK)
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-gold-500 absolute left-3 top-3 pointer-events-none" />
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-navy-800 text-white text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 border border-gray-700 focus:border-gold-500 focus:outline-none"
              >
                <option value="">Any BHK</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>
          </div>

          {/* Max Budget */}
          <div>
            <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
              Max Budget
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-gold-500 absolute left-3 top-3 pointer-events-none" />
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-navy-800 text-white text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 border border-gray-700 focus:border-gold-500 focus:outline-none"
              >
                <option value="">Any Budget</option>
                <option value="2000000">Up to ₹20 Lakhs</option>
                <option value="3000000">Up to ₹30 Lakhs</option>
                <option value="4000000">Up to ₹40 Lakhs</option>
                <option value="6000000">Up to ₹60 Lakhs</option>
                <option value="10000000">Up to ₹1 Crore</option>
                <option value="20000000">Up to ₹2 Crores</option>
                <option value="50000000">Up to ₹5 Crores</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-extrabold py-2.5 px-4 rounded-xl shadow-gold transition-all duration-300 flex items-center justify-center space-x-2 text-xs sm:text-sm"
            >
              <Search className="w-4 h-4" />
              <span>SEARCH PROPERTY</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
