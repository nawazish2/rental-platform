import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids) {
      setProperties([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.get('/api/properties/compare', { params: { ids } })
      .then((res) => {
        if (!cancelled) setProperties(res.data.properties || []);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const rows = [
    { label: 'Price/Month', key: (p) => `₹${p.price?.toLocaleString()}` },
    { label: 'Type', key: (p) => p.type },
    { label: 'Location', key: (p) => p.location },
    { label: 'City', key: (p) => p.city },
    { label: 'Available From', key: (p) => new Date(p.availableFrom).toLocaleDateString('en-IN') },
    { label: 'Amenities', key: (p) => p.amenities?.join(', ') || '—' },
    { label: 'House Rules', key: (p) => p.rules?.join(', ') || 'None' },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  if (!properties.length) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <p className="text-gray-400 text-lg">No properties selected to compare.</p>
      <Link to="/browse" className="text-blue-600 mt-4 inline-block">← Browse Properties</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compare Properties</h1>
        <Link to="/browse" className="text-blue-600 text-sm hover:underline">← Back to Browse</Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <thead>
            <tr>
              <th className="text-left px-6 py-4 text-gray-500 font-medium bg-gray-50 w-40">Feature</th>
              {properties.map((p) => (
                <th key={p._id} className="px-6 py-4 bg-gray-50">
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200'} alt={p.title} className="w-full h-28 object-cover rounded-xl mb-2" />
                  <Link to={`/property/${p._id}`} className="font-bold text-gray-900 hover:text-blue-600 text-sm line-clamp-2 text-left block">{p.title}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-6 py-4 text-sm font-medium text-gray-600">{row.label}</td>
                {properties.map((p) => (
                  <td key={p._id} className="px-6 py-4 text-sm text-gray-700">{row.key(p)}</td>
                ))}
              </tr>
            ))}
            <tr className="bg-white">
              <td className="px-6 py-4"></td>
              {properties.map((p) => (
                <td key={p._id} className="px-6 py-4">
                  <Link to={`/property/${p._id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 block text-center">
                    View Details
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
