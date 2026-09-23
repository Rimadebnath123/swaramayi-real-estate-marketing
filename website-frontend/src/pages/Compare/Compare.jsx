import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';
import { useCompare } from '../../context/CompareContext';
import { X, Check, ArrowRight } from 'lucide-react';

export default function Compare() {
  const { compareItems, toggleCompare, clearCompare } = useCompare();

  const formatPrice = (amount) => {
    if (!amount) return 'N/A';
    if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(2)} Lakhs`;
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  return (
    <>
      <SEO title="Compare Properties | Swarnamayi Real Estate Kolkata" />

      <div className="bg-light-bg min-h-screen pb-16">
        <div className="bg-navy-900 text-white py-10 border-b border-gold-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: 'Property Comparison' }]} />
            <div className="flex items-center justify-between mt-1">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Compare Properties</h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  Side-by-side feature comparison of up to 4 properties.
                </p>
              </div>
              {compareItems.length > 0 && (
                <button
                  onClick={clearCompare}
                  className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
                >
                  Clear Comparison Matrix
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          {compareItems.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-md mx-auto shadow-sm">
              <h3 className="text-xl font-bold text-navy-900 mb-2">No Properties Selected for Comparison</h3>
              <p className="text-xs text-gray-500 mb-6">
                Click "+ Compare" on any property card to add items to your side-by-side matrix.
              </p>
              <Link
                to="/properties"
                className="px-6 py-3 bg-navy-900 text-gold-400 font-bold text-xs rounded-xl shadow inline-block"
              >
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-navy-900 text-white">
                    <th className="p-4 font-bold border-b border-gray-800 w-1/5">Features</th>
                    {compareItems.map((item, idx) => (
                      <th key={item.id || item._id || item.slug || idx} className="p-4 font-bold border-b border-gray-800 relative w-1/5">
                        <button
                          onClick={() => toggleCompare(item)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="pr-6">
                          <img
                            src={
                              item.images?.[0] ||
                              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'
                            }
                            alt={item.title}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                          />
                          <Link to={`/properties/${item.slug}`} className="font-bold text-white hover:text-gold-400 line-clamp-2">
                            {item.description || item.short_description || item.overview || `${item.bedrooms || 2} BHK ${item.propertyType || 'Apartment'} in ${item.location || 'Kolkata'}`}
                          </Link>
                          <div className="text-gold-400 font-black text-sm mt-1">{formatPrice(item.price)}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  <tr>
                    <td className="p-4 bg-gray-50 font-bold text-navy-900">Location</td>
                    {compareItems.map((item, idx) => (
                      <td key={item.id || item._id || item.slug || idx} className="p-4 text-gray-700">
                        {item.location}, {item.city}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-gray-50 font-bold text-navy-900">Property Type</td>
                    {compareItems.map((item, idx) => (
                      <td key={item.id || item._id || item.slug || idx} className="p-4 text-gray-700">
                        {item.propertyType}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-gray-50 font-bold text-navy-900">Bedrooms (BHK)</td>
                    {compareItems.map((item, idx) => (
                      <td key={item.id || item._id || item.slug || idx} className="p-4 text-gray-700 font-bold">
                        {item.bedrooms || 0} BHK
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-gray-50 font-bold text-navy-900">Bathrooms</td>
                    {compareItems.map((item, idx) => (
                      <td key={item.id || item._id || item.slug || idx} className="p-4 text-gray-700">
                        {item.bathrooms || 0} Baths
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-gray-50 font-bold text-navy-900">Super Area</td>
                    {compareItems.map((item, idx) => (
                      <td key={item.id || item._id || item.slug || idx} className="p-4 text-gray-700 font-bold">
                        {item.areaSqft} sqft
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-gray-50 font-bold text-navy-900">Price / Sqft</td>
                    {compareItems.map((item, idx) => (
                      <td key={item.id || item._id || item.slug || idx} className="p-4 text-gray-700">
                        ₹ {item.pricePerSqft?.toLocaleString('en-IN') || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-gray-50 font-bold text-navy-900">Furnishing</td>
                    {compareItems.map((item, idx) => (
                      <td key={item.id || item._id || item.slug || idx} className="p-4 text-gray-700">
                        {item.furnishing}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-gray-50 font-bold text-navy-900">Possession</td>
                    {compareItems.map((item, idx) => (
                      <td key={item.id || item._id || item.slug || idx} className="p-4 text-gray-700">
                        {item.possessionStatus}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-gray-50 font-bold text-navy-900">RERA Approved</td>
                    {compareItems.map((item, idx) => (
                      <td key={item.id || item._id || item.slug || idx} className="p-4 text-gray-700">
                        {item.reraApproved ? (
                          <span className="text-green-600 font-bold flex items-center space-x-1">
                            <Check className="w-4 h-4" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-gray-50 font-bold text-navy-900">Action</td>
                    {compareItems.map((item, idx) => (
                      <td key={item.id || item._id || item.slug || idx} className="p-4">
                        <Link
                          to={`/properties/${item.slug}`}
                          className="w-full py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-xs rounded-lg text-center block"
                        >
                          View Details
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
