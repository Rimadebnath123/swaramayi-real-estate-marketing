import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../../components/HeroSlider/HeroSlider';
import PropertySearchBox from '../../components/PropertySearch/PropertySearchBox';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import LoadingSkeleton from '../../components/Common/LoadingSkeleton';
import SEO from '../../components/Common/SEO';
import { propertyService } from '../../services/propertyService';

import {
  Home as HomeIcon,
  Handshake,
  Building,
  TrendingUp,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
  UserCheck,
  FileCheck,
  Users,
  Search,
} from 'lucide-react';

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [soldProperties, setSoldProperties] = useState([]);
  const [soldStats, setSoldStats] = useState({ totalSold: 150, totalVolumeCr: 250, verifiedPct: 100, satisfactionPct: 98 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featRes, recRes, soldRes] = await Promise.all([
          propertyService.getFeaturedProperties(),
          propertyService.getRecentProperties(),
          propertyService.getSoldProperties(),
        ]);

        setFeaturedProperties(featRes.data || []);
        setRecentProperties(recRes.data?.data || recRes.data || []);

        const soldData = soldRes.data?.data || soldRes.data || [];
        const statsData = soldRes.stats || soldRes.data?.stats || {};
        setSoldProperties(Array.isArray(soldData) ? soldData : []);
        if (statsData.totalSold) {
          setSoldStats(statsData);
        }
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <SEO
        title="Swarnamayi Real Estate Marketing | Dream Property Kolkata"
        description="Your Dream Property. Our Trusted Guidance. Find flats, luxury apartments, sky villas, plots & commercial space in New Town, Rajarhat & Salt Lake Kolkata."
      />

      {/* 1. HERO IMAGE SLIDER */}
      <HeroSlider />

      {/* 2. PROPERTY SEARCH BOX */}
      <PropertySearchBox />

      {/* 3. BUY | SELL | RENT | INVEST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest bg-gold-500/10 px-3.5 py-1.5 rounded-full border border-gold-500/30">
            Four Core Pillars
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-900 mt-3">
            How Swarnamayi Serves Your Real Estate Needs
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Tailored property discovery and advisory services designed for property buyers, owners, and real estate investors in Kolkata.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* BUY */}
          <Link
            to="/properties?category=Buy"
            className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-gold-500 shadow-sm hover:shadow-navy transition-all duration-300 transform hover:-translate-y-1 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-gold-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <HomeIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 group-hover:text-navy-800">BUY</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Find your perfect home with verified pricing, RERA clearance, and complete documentation.
            </p>
            <div className="mt-4 text-xs font-bold text-gold-600 inline-flex items-center space-x-1">
              <span>Explore Homes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* SELL */}
          <Link
            to="/contact"
            className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-gold-500 shadow-sm hover:shadow-navy transition-all duration-300 transform hover:-translate-y-1 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-gold-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Handshake className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 group-hover:text-navy-800">SELL</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Market your property with confidence using professional digital marketing and qualified leads.
            </p>
            <div className="mt-4 text-xs font-bold text-gold-600 inline-flex items-center space-x-1">
              <span>List Property</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* RENT */}
          <Link
            to="/properties?category=Rent"
            className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-gold-500 shadow-sm hover:shadow-navy transition-all duration-300 transform hover:-translate-y-1 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-gold-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Building className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 group-hover:text-navy-800">RENT</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Find the right residential or commercial rental property tailored to your space requirements.
            </p>
            <div className="mt-4 text-xs font-bold text-gold-600 inline-flex items-center space-x-1">
              <span>Explore Rentals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* INVEST */}
          <Link
            to="/services"
            className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-gold-500 shadow-sm hover:shadow-navy transition-all duration-300 transform hover:-translate-y-1 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-gold-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 group-hover:text-navy-800">INVEST</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Build high-appreciation real estate portfolios across Kolkata's prime growth corridors.
            </p>
            <div className="mt-4 text-xs font-bold text-gold-600 inline-flex items-center space-x-1">
              <span>Consult Advisory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. FEATURED PROPERTIES */}
      <section className="bg-light-bg py-14 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">
                Handpicked Collections
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">Featured Properties</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Explore premium handpicked properties selected by Swarnamayi advisors.
              </p>
            </div>
            <Link
              to="/properties?featured=true"
              className="mt-4 md:mt-0 text-xs font-bold text-navy-900 hover:text-gold-600 inline-flex items-center space-x-1.5 transition-colors"
            >
              <span>View All Featured</span>
              <ArrowRight className="w-4 h-4 text-gold-500" />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.slice(0, 3).map((property, idx) => (
                <PropertyCard key={property.id || property._id || property.slug || idx} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. RECENT PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">
              Latest Additions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">Recently Added Properties</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Browse freshly listed apartments, sky villas, and commercial spaces across Kolkata.
            </p>
          </div>
          <Link
            to="/properties"
            className="mt-4 md:mt-0 text-xs font-bold text-navy-900 hover:text-gold-600 inline-flex items-center space-x-1.5 transition-colors"
          >
            <span>Explore All Listings</span>
            <ArrowRight className="w-4 h-4 text-gold-500" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProperties.slice(0, 6).map((property, idx) => (
              <PropertyCard key={property.id || property._id || property.slug || idx} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* 5.5. PROPERTIES WE HAVE SOLD IN THE PAST */}
      <section className="bg-gradient-to-b from-gray-900 via-navy-900 to-navy-900 text-white py-16 border-y border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-gold-400 uppercase tracking-widest bg-gold-500/10 px-3.5 py-1.5 rounded-full border border-gold-500/30">
                Our Track Record of Success
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">Properties We Have Sold in the Past</h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-2">
                Browse premium Kolkata residential & commercial properties successfully closed and delivered by Swarnamayi.
              </p>
            </div>
            <Link
              to="/properties?isSold=true"
              className="mt-4 md:mt-0 text-xs font-bold text-gold-400 hover:text-gold-300 inline-flex items-center space-x-1.5 transition-colors"
            >
              <span>View All Sold Properties</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </Link>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 p-6 bg-navy-800/90 rounded-2xl border border-gold-500/30 text-center max-w-4xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gold-400">100+</div>
              <div className="text-[11px] sm:text-xs text-gray-300 font-medium mt-1">Properties Delivered</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gold-400">{soldStats.verifiedPct || 100}%</div>
              <div className="text-[11px] sm:text-xs text-gray-300 font-medium mt-1">Verified & Clear Titles</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gold-400">{soldStats.satisfactionPct || 98}%</div>
              <div className="text-[11px] sm:text-xs text-gray-300 font-medium mt-1">Happy Buyer Rating</div>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : soldProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {soldProperties.slice(0, 3).map((property, idx) => (
                <PropertyCard key={property.id || property._id || property.slug || idx} property={property} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-navy-800/50 rounded-2xl border border-navy-700">
              <p className="text-xs text-gray-400">Past sold properties data will be listed here as transactions are completed.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. PROPERTY CATEGORIES */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-widest bg-gold-500/10 px-3.5 py-1.5 rounded-full border border-gold-500/30">
              Tailored Property Types
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">Explore Property Categories</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              From compact smart flats to sprawling luxury penthouses and IT commercial spaces.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Apartments', type: 'Apartment', icon: HomeIcon, count: '120+' },
              { name: 'Sky Penthouses', type: 'Penthouse', icon: Sparkles, count: '35+' },
              { name: 'Villas & Houses', type: 'Villa', icon: HomeIcon, count: '45+' },
              { name: 'Commercial Offices', type: 'Commercial Office', icon: Building, count: '80+' },
              { name: 'Retail Shops', type: 'Retail Shop', icon: Handshake, count: '60+' },
              { name: 'Plots & Land', type: 'Plot', icon: MapPin, count: '25+' },
            ].map((cat, idx) => (
              <Link
                key={idx}
                to={`/properties?propertyType=${cat.type}`}
                className="bg-navy-800/80 hover:bg-gold-500 border border-gold-500/20 hover:border-gold-500 p-5 rounded-2xl text-center group transition-all duration-300"
              >
                <cat.icon className="w-8 h-8 text-gold-500 group-hover:text-navy-900 mx-auto mb-3 transition-colors" />
                <div className="font-bold text-xs sm:text-sm text-white group-hover:text-navy-900 transition-colors">
                  {cat.name}
                </div>
                <div className="text-[10px] text-gray-400 group-hover:text-navy-800 mt-1 font-semibold">
                  {cat.count} Listings
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. POPULAR KOLKATA LOCATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest bg-gold-500/10 px-3.5 py-1.5 rounded-full border border-gold-500/30">
            Kolkata Geographic Hubs
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-900 mt-3">Popular Kolkata Locations</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Explore carefully selected residential and commercial hotspots across Kolkata.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'New Town',
              slug: 'new-town',
              img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
              desc: 'IT Hub & Satellite Township',
            },
            {
              name: 'Rajarhat',
              slug: 'rajarhat',
              img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
              desc: 'Near Kolkata Airport Corridor',
            },
            {
              name: 'Salt Lake',
              slug: 'salt-lake',
              img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
              desc: 'Bidhannagar & Sector V Tech Hub',
            },
            {
              name: 'EM Bypass',
              slug: 'em-bypass',
              img: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=600&q=80',
              desc: 'Luxury High-Rise & Hospital Hub',
            },
          ].map((loc, idx) => (
            <Link
              key={idx}
              to={`/locations/${loc.slug}`}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-navy transition-all duration-300"
            >
              <img src={loc.img} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs text-gold-400 font-semibold">{loc.desc}</div>
                <h3 className="text-xl font-bold text-white group-hover:text-gold-400 transition-colors">{loc.name}</h3>
                <div className="mt-2 text-xs font-bold text-gray-200 inline-flex items-center space-x-1">
                  <span>Explore Location</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 9. WHY CHOOSE SWARNAMAYI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest bg-gold-500/10 px-3.5 py-1.5 rounded-full border border-gold-500/30">
            Trust & Excellence
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-900 mt-3">Why Choose Swarnamayi?</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Professional property guidance built on verification, local market mastery, and client satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Verified Properties',
              desc: 'Every listed property undergoes document inspection and site verification.',
              icon: ShieldCheck,
            },
            {
              title: 'Kolkata Expertise',
              desc: 'Deep local market mastery across New Town, Rajarhat, Salt Lake & South Kolkata.',
              icon: MapPin,
            },
            {
              title: 'Transparent Guidance',
              desc: 'Clear title advice, fair pricing guidance, and zero hidden costs.',
              icon: CheckCircle2,
            },
            {
              title: 'Site Visit Assistance',
              desc: 'Dedicated property advisors guiding your physical inspections and title checks.',
              icon: UserCheck,
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600 mx-auto mb-4">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-900 mb-2">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. HOW IT WORKS */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-widest bg-gold-500/10 px-3.5 py-1.5 rounded-full border border-gold-500/30">
              Step-by-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">How Swarnamayi Works</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              From your initial property search to final key handover.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: '01', title: 'Search Property', desc: 'Browse verified Kolkata listings' },
              { step: '02', title: 'Shortlist', desc: 'Compare price, specs & layout' },
              { step: '03', title: 'Connect Expert', desc: 'Speak with Swarnamayi advisor' },
              { step: '04', title: 'Site Visit', desc: 'Schedule free physical tour' },
              { step: '05', title: 'Documentation', desc: 'Verified legal & bank help' },
              { step: '06', title: 'Move In', desc: 'Possession & key handover' },
            ].map((st, idx) => (
              <div key={idx} className="bg-navy-800 p-5 rounded-2xl border border-gray-800 text-center relative">
                <div className="text-xs font-black text-gold-500 mb-2">STEP {st.step}</div>
                <h4 className="text-sm font-bold text-white mb-1">{st.title}</h4>
                <p className="text-[11px] text-gray-400">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-3xl p-8 sm:p-12 text-white border border-gold-500/40 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-widest bg-gold-500/20 px-3.5 py-1.5 rounded-full border border-gold-500/30">
              Get Started Today
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Ready to Find Your Next Property?</h2>
            <p className="text-sm sm:text-base text-gray-300">
              Let Swarnamayi help you discover the right property in Kolkata.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                to="/properties"
                className="px-8 py-3.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-extrabold text-sm sm:text-base rounded-xl shadow-gold transition-all"
              >
                Explore Properties
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3.5 bg-navy-800 hover:bg-navy-700 text-white font-bold text-sm sm:text-base rounded-xl border border-gray-700 transition-all"
              >
                Talk to an Expert
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
