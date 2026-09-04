import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFilter from '../components/properties/PropertyFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorBanner from '../components/common/ErrorBanner';
import { Compass, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const PropertyListPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  const [filters, setFilters] = useState({
    search: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    guests: '',
    amenities: '',
    checkInDate: '',
    checkOutDate: '',
    page: 1,
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });

      const response = await API.get(`/properties?${params.toString()}`);
      if (response.data.success) {
        setProperties(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Fetch properties error:', err);
      setError(err.response?.data?.message || 'Failed to load retreat properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      guests: '',
      amenities: '',
      checkInDate: '',
      checkOutDate: '',
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Hero Header Banner */}
      <div className="relative bg-stone-900/60 backdrop-blur-xl rounded-3xl p-8 sm:p-12 overflow-hidden border border-stone-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Curated Sanctuary Escapes
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-stone-100 tracking-tight leading-tight font-serif">
            Find Your Restorative <span className="text-amber-400">Sanctuary</span>
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Discover peaceful mountain cabins, coastal wellness villas, and glamping eco-havens tailored for mindfulness, remote work, and deep relaxation.
          </p>
        </div>
      </div>

      {/* Filter Component */}
      <PropertyFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <ErrorBanner message={error} onRetry={fetchProperties} />

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-stone-900/60 border border-stone-800/80 h-96 rounded-3xl animate-pulse p-4 space-y-4">
              <div className="h-48 bg-stone-800/80 rounded-2xl"></div>
              <div className="h-5 bg-stone-800/80 rounded w-3/4"></div>
              <div className="h-4 bg-stone-800/60 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No Retreats Found"
          description="We couldn't find any properties matching your current filter criteria. Try adjusting your dates, budget, or amenity selection."
          actionLabel="Reset Filters"
          actionOnClick={handleResetFilters}
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span>
              Showing <strong className="text-stone-200">{properties.length}</strong> of{' '}
              <strong className="text-stone-200">{pagination.totalCount}</strong> retreat sanctuaries
            </span>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
          </div>

          {/* Property Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-stone-100 hover:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1 text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => handlePageChange(pNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                      pagination.page === pNum
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-600/20'
                        : 'bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-stone-100 hover:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1 text-xs font-semibold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default PropertyListPage;
