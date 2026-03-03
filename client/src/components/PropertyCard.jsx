import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useState } from 'react';

export default function PropertyCard({ property, onShortlist, isShortlisted, showCompare, compareSelected, onCompareToggle }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleShortlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (isShortlisted) {
        await api.delete(`/api/shortlists/remove/${property._id}`);
        setMsg('Removed from shortlist');
      } else {
        await api.post('/api/shortlists/add', { propertyId: property._id });
        setMsg('Added to shortlist!');
      }
      onShortlist && onShortlist(property._id, !isShortlisted);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/property/${property._id}`}>
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{property.type}</span>
          <span className="font-bold text-lg text-gray-900">₹{property.price?.toLocaleString()}/mo</span>
        </div>
        <Link to={`/property/${property._id}`}>
          <h3 className="font-semibold text-gray-900 mt-1 hover:text-blue-600 line-clamp-1">{property.title}</h3>
        </Link>
        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
          <span>📍</span>{property.location}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {property.amenities?.slice(0, 3).map((a) => (
            <span key={a} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{a}</span>
          ))}
          {property.amenities?.length > 3 && (
            <span className="text-xs text-gray-400">+{property.amenities.length - 3}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Link
            to={`/property/${property._id}`}
            className="flex-1 text-center bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            View Details
          </Link>
          {user?.role === 'tenant' && (
            <button
              onClick={handleShortlist}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                isShortlisted
                  ? 'border-red-300 text-red-600 hover:bg-red-50'
                  : 'border-blue-300 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {isShortlisted ? '❤️' : '🤍'}
            </button>
          )}
          {showCompare && user?.role === 'tenant' && (
            <input
              type="checkbox"
              checked={compareSelected}
              onChange={() => onCompareToggle(property._id)}
              className="w-4 h-4 text-blue-600"
              title="Add to compare"
            />
          )}
        </div>
        {msg && <p className="text-xs text-green-600 mt-1 text-center">{msg}</p>}
      </div>
    </div>
  );
}
