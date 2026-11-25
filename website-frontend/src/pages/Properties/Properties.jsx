import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import LoadingSkeleton from '../../components/Common/LoadingSkeleton';
import EmptyState from '../../components/Common/EmptyState';
import Pagination from '../../components/Common/Pagination';
import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';
import { propertyService } from '../../services/propertyService';
import { SlidersHorizontal, ArrowUpDown, LayoutGrid, List, X } from 'lucide-react';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const requestIdRef = React.useRef(0);

  // Extract initial filters from searchParams
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    propertyType: searchParams.get('propertyType') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minSqft: searchParams.get('minSqft') || '',
    furnishing: searchParams.get('furnishing') || '',
    status: searchParams.get('status') || '',
    isSold: searchParams.get('isSold') || '',
    reraApproved: searchParams.get('reraApproved') || '',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1',
  });

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      location: searchParams.get('location') || '',
      propertyType: searchParams.get('propertyType') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minSqft: searchParams.get('minSqft') || '',
      furnishing: searchParams.get('furnishing') || '',
      status: searchParams.get('status') || '',
      isSold: searchParams.get('isSold') || '',
      reraApproved: searchParams.get('reraApproved') || '',
      sort: searchParams.get('sort') || 'newest',
      page: searchParams.get('page') || '1',
    });
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 150);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchProperties = async () => {
    const reqId = ++requestIdRef.current;
    try {
      setLoading(true);
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params[key] = filters[key];
      });

      const res = await propertyService.getProperties(params);
      if (reqId !== requestIdRef.current) return;
      setProperties(res.data || []);
      setMeta(res.meta || { page: Number(filters.page) || 1, totalPages: 1, total: res.total ?? (res.data?.length || 0) });
    } catch (error) {
      if (reqId === requestIdRef.current) {
        console.error('Error fetching properties:', error);
      }
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const isSoldView = filters.isSold === 'true' || (filters.status && filters.status.toLowerCase().includes('sold'));

  const handleResetFilters = () => {
    const resetObj = {
      search: '',
      category: '',
      location: '',
      propertyType: '',
      bedrooms: '',
      minPrice: '',
      maxPrice: '',
      minSqft: '',
      furnishing: '',
      status: '',
      isSold: '',
      reraApproved: '',
      sort: 'newest',
      page: '1',
    };
    setFilters(resetObj);
    setSearchParams({});
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({ ...prev, sort: e.target.value, page: '1' }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage.toString() }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEO
        title={isSoldView ? "Sold Out Properties in Kolkata | Swarnamayi Real Estate" : "Properties for Sale & Rent in Kolkata | Swarnamayi Real Estate"}
        description={isSoldView ? "Browse Kolkata properties successfully closed and delivered by Swarnamayi." : "Search apartments, flats, sky villas, commercial offices, plots & shops for sale and rent in Kolkata."}
      />

      <div className="bg-light-bg min-h-screen pb-16">
        {/* Top Header Banner */}
        <div className="bg-navy-900 text-white py-10 border-b border-gold-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: isSoldView ? 'Sold Out Properties' : 'Properties in Kolkata' }]} />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              {isSoldView ? 'Sold Out Properties in Kolkata' : 'Properties in Kolkata'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
              {isSoldView 
                ? 'Browse Kolkata properties successfully delivered and closed by Swarnamayi Real Estate.' 
                : 'Explore verified residential apartments, independent villas, commercial spaces, and new launches across Kolkata.'}
            </p>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Top Control Bar */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs font-semibold text-gray-600 w-full sm:w-auto">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center space-x-1 px-3 py-2 bg-navy-900 text-gold-400 font-bold rounded-lg"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <span>
                Showing <strong className="text-navy-900 font-extrabold">{meta.total}</strong> Properties
              </span>
            </div>

            {/* Sort & Grid Toggle */}
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center space-x-2 text-xs">
                <ArrowUpDown className="w-4 h-4 text-gold-600 shrink-0" />
                <span className="font-semibold text-gray-700 hidden sm:inline">Sort By:</span>
                <select
                  value={filters.sort}
                  onChange={handleSortChange}
                  className="bg-gray-50 border border-gray-300 text-navy-900 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="most_viewed">Most Viewed</option>
                  <option value="featured">Featured First</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-navy-900 text-gold-400 shadow-sm' : 'text-gray-500'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-navy-900 text-gold-400 shadow-sm' : 'text-gray-500'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout: Left Filter Sidebar + Right Results */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <FilterSidebar filters={filters} setFilters={setFilters} onReset={handleResetFilters} />
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <LoadingSkeleton count={6} />
              ) : properties.length === 0 ? (
                <EmptyState onReset={handleResetFilters} />
              ) : (
                <>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-6'
                    }
                  >
                    {properties.map((property, idx) => (
                      <PropertyCard key={property.id || property._id || property.slug || idx} property={property} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-4/5 max-w-xs bg-white p-5 overflow-y-auto z-50">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
              <h3 className="font-extrabold text-navy-900 text-sm uppercase">Filter Properties</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <FilterSidebar filters={filters} setFilters={setFilters} onReset={handleResetFilters} isMobile={true} />
          </div>
        </div>
      )}
    </>
  );
}
