import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import { locationService } from '../../services/locationService';
import { MapPin, Bus, GraduationCap, Building2 as Hospital, ShoppingBag, ArrowRight } from 'lucide-react';

export default function LocationDetails() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocationDetails();
  }, [slug]);

  const fetchLocationDetails = async () => {
    try {
      setLoading(true);
      const res = await locationService.getLocationBySlug(slug);
      setData(res.data);
    } catch (error) {
      console.error('Error fetching location:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-navy-900 font-bold">Loading locality information...</div>;
  if (!data || !data.location) return <div className="py-20 text-center text-navy-900 font-bold">Location not found</div>;

  const { location, properties } = data;

  return (
    <>
      <SEO
        title={`Property in ${location.name} Kolkata | Swarnamayi Real Estate`}
        description={`Find flats, apartments, commercial offices and land for sale in ${location.name}, Kolkata. ${location.description}`}
      />

      <div className="bg-light-bg min-h-screen pb-16">
        <div className="bg-navy-900 text-white py-10 border-b border-gold-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: 'Locations', link: '/locations' }, { label: location.name }]} />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Property in {location.name}, Kolkata</h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">{location.description}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
          {/* Factual Infrastructure Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm mb-2">
                <Bus className="w-5 h-5 text-gold-600" />
                <span>Connectivity</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{location.connectivity || 'Convenient access to major roads & public transit.'}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm mb-2">
                <GraduationCap className="w-5 h-5 text-gold-600" />
                <span>Educational Institutions</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{location.schools || 'Top reputed schools & universities nearby.'}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm mb-2">
                <Hospital className="w-5 h-5 text-gold-600" />
                <span>Healthcare Services</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{location.hospitals || 'Super-specialty medical centers & hospitals.'}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm mb-2">
                <ShoppingBag className="w-5 h-5 text-gold-600" />
                <span>Shopping & Lifestyle</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{location.shopping || 'Shopping malls, hypermarkets & recreation.'}</p>
            </div>
          </div>

          {/* Properties in this Location */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-navy-900">Available Properties in {location.name}</h2>
              <Link to={`/properties?location=${location.name}`} className="text-xs font-bold text-gold-600 hover:text-navy-900 flex items-center space-x-1">
                <span>View All Listings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {properties.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-sm text-gray-500">
                No active properties listed in {location.name} currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop, idx) => (
                  <PropertyCard key={prop.id || prop._id || prop.slug || idx} property={prop} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
