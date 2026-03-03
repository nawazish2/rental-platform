import { useState, useEffect } from 'react';
import api from '../api/axios';
import FilterBar from '../components/FilterBar';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';

export default function Browse() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [shortlisted, setShortlisted] = useState(new Set());
  const [compareIds, setCompareIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchProperties();
    if (user?.role === 'tenant') fetchShortlist();
  }, [filters, page]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      const res = await api.get('/api/properties', { params });
      setProperties(res.data.properties);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlist = async () => {
    try {
      const res = await api.get('/api/shortlists/my');
      setShortlisted(new Set(res.data.properties.map((p) => p._id)));
    } catch {}
  };

  const handleFilter = (f) => { setFilters(f); setPage(1); };

  const handleShortlist = (id, added) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      added ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleCompareToggle = (id) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Properties</h1>
        <p className="text-gray-500 text-sm mt-1">{total} properties available</p>
      </div>

      <FilterBar onFilter={handleFilter} />

      {compareIds.length >= 2 && (
        <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-blue-700">{compareIds.length} selected for compare</span>
          <a href={`/compare?ids=${compareIds.join(',')}`} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            Compare Now
          </a>
          <button onClick={() => setCompareIds([])} className="text-sm text-gray-500 hover:text-red-500">Clear</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="text-5xl block mb-3">🏘️</span>
          <p className="text-lg">No properties found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                isShortlisted={shortlisted.has(p._id)}
                onShortlist={handleShortlist}
                showCompare={true}
                compareSelected={compareIds.includes(p._id)}
                onCompareToggle={handleCompareToggle}
              />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {pages}</span>
              <button
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
