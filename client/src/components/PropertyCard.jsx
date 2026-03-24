import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useState } from 'react';

export default function PropertyCard({ property, onShortlist, isShortlisted, showCompare, compareSelected, onCompareToggle }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleShortlist = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      if (isShortlisted) {
        await api.delete(`/api/shortlists/remove/${property._id}`);
      } else {
        await api.post('/api/shortlists/add', { propertyId: property._id });
        setMsg('Added!');
        setTimeout(() => setMsg(''), 1500);
      }
      onShortlist && onShortlist(property._id, !isShortlisted);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
      setTimeout(() => setMsg(''), 1500);
    } finally { setLoading(false); }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">

      {/* Image */}
      <div className="relative overflow-hidden">
        <Link to={`/property/${property._id}`}>
          <img
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'}
            alt={property.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{property.type}</span>
        </div>
        {/* Shortlist button */}
        {user?.role === 'tenant' && (
          <button onClick={handleShortlist} disabled={loading}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
              isShortlisted ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500'
            }`}>
            {isShortlisted ? '❤️' : '🤍'}
          </button>
        )}
        {/* Compare checkbox */}
        {showCompare && user?.role === 'tenant' && (
          <label className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-600 cursor-pointer shadow-sm">
            <input type="checkbox" checked={compareSelected} onChange={() => onCompareToggle(property._id)} className="w-3.5 h-3.5 accent-blue-600" />
            Compare
          </label>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1.5">
          <Link to={`/property/${property._id}`}>
            <h3 className="font-bold text-gray-900 hover:text-blue-600 line-clamp-1 text-sm leading-snug transition-colors">
              {property.title}
            </h3>
          </Link>
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
          <span>📍</span>{property.location}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-3">
          {property.amenities?.slice(0, 3).map((a) => (
            <span key={a} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">{a}</span>
          ))}
          {property.amenities?.length > 3 && (
            <span className="text-xs text-gray-400 px-2 py-0.5">+{property.amenities.length - 3}</span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <span className="text-lg font-extrabold text-gray-900">₹{property.price?.toLocaleString()}</span>
            <span className="text-xs text-gray-400">/mo</span>
          </div>
          <Link to={`/property/${property._id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            View →
          </Link>
        </div>
        {msg && <p className="text-xs text-green-600 text-center mt-2">{msg}</p>}
      </div>
    </div>
  );
}
