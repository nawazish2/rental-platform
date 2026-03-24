import { useState, useEffect } from 'react';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const TYPES = ['Studio', '1BHK', '2BHK', '3BHK', 'Villa', 'Hostel', 'Airbnb'];

export default function Browse() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [shortlisted, setShortlisted] = useState(new Set());
  const [compareIds, setCompareIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({ location: '', budgetMin: '', budgetMax: '', moveInDate: '', type: '' });
  const [applied, setApplied] = useState({});

  useEffect(() => {
    fetchProperties();
    if (user?.role === 'tenant') fetchShortlist();
  }, [applied, page]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/properties', { params: { ...applied, page } });
      setProperties(res.data.properties);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchShortlist = async () => {
    try {
      const res = await api.get('/api/shortlists/my');
      setShortlisted(new Set(res.data.properties.map((p) => p._id)));
    } catch {}
  };

  const handleSearch = (e) => { e.preventDefault(); setApplied({ ...filters }); setPage(1); };
  const handleReset = () => { const empty = { location: '', budgetMin: '', budgetMax: '', moveInDate: '', type: '' }; setFilters(empty); setApplied({}); setPage(1); };

  const handleShortlist = (id, added) => {
    setShortlisted((prev) => { const n = new Set(prev); added ? n.add(id) : n.delete(id); return n; });
  };

  const handleCompareToggle = (id) => {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const activeFiltersCount = Object.values(applied).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Browse Properties</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Searching...' : <><span className="text-blue-600 font-semibold">{total}</span> properties available</>}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Filter Bar */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <input
              type="text" name="location" value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="�� Location or city"
              className="col-span-2 md:col-span-2 lg:col-span-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number" value={filters.budgetMin}
              onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })}
              placeholder="Min ₹"
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number" value={filters.budgetMax}
              onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
              placeholder="Max ₹"
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
            >
              <option value="">All Types</option>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200">
                Search
              </button>
              {activeFiltersCount > 0 && (
                <button type="button" onClick={handleReset} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">✕</button>
              )}
            </div>
          </div>

          {/* Type pills */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {TYPES.map((t) => (
              <button key={t} type="button"
                onClick={() => { const v = filters.type === t ? '' : t; setFilters({ ...filters, type: v }); setApplied({ ...applied, type: v }); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${applied.type === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </form>

        {/* Compare Bar */}
        {compareIds.length >= 2 && (
          <div className="mb-4 flex items-center gap-3 bg-blue-600 text-white rounded-2xl px-5 py-3 shadow-lg shadow-blue-200">
            <span className="text-sm font-semibold">{compareIds.length} properties selected</span>
            <a href={`/compare?ids=${compareIds.join(',')}`}
              className="bg-white text-blue-600 px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors ml-auto">
              Compare Now →
            </a>
            <button onClick={() => setCompareIds([])} className="text-blue-200 hover:text-white text-sm">Clear</button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="text-gray-400 text-sm">Finding properties for you...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-6xl block mb-4">🏘️</span>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search a different location</p>
            <button onClick={handleReset} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {properties.map((p) => (
                <PropertyCard
                  key={p._id} property={p}
                  isShortlisted={shortlisted.has(p._id)}
                  onShortlist={handleShortlist}
                  showCompare={true}
                  compareSelected={compareIds.includes(p._id)}
                  onCompareToggle={handleCompareToggle}
                />
              ))}
            </div>

            {pages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  ← Prev
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <button disabled={page === pages} onClick={() => setPage((p) => p + 1)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
