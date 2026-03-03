import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [visitForm, setVisitForm] = useState({ preferredDate: '', notes: '' });
  const [visitMsg, setVisitMsg] = useState('');
  const [visitLoading, setVisitLoading] = useState(false);
  const [shortlistMsg, setShortlistMsg] = useState('');

  useEffect(() => {
    api.get(`/api/properties/${id}`)
      .then((res) => setProperty(res.data.property))
      .catch(() => navigate('/browse'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVisitRequest = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setVisitLoading(true);
    try {
      await api.post('/api/visits', { propertyId: id, ...visitForm });
      setVisitMsg('✅ Visit requested! Check your dashboard for updates.');
      setVisitForm({ preferredDate: '', notes: '' });
    } catch (err) {
      setVisitMsg('❌ ' + (err.response?.data?.message || 'Error requesting visit'));
    } finally {
      setVisitLoading(false);
    }
  };

  const handleShortlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/api/shortlists/add', { propertyId: id });
      setShortlistMsg('❤️ Added to shortlist!');
    } catch (err) {
      setShortlistMsg(err.response?.data?.message || 'Error');
    }
    setTimeout(() => setShortlistMsg(''), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!property) return null;

  const images = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center gap-1">← Back</button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-4">
            <img src={images[imgIdx]} alt={property.title} className="w-full h-72 object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow">‹</button>
                <button onClick={() => setImgIdx((i) => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow">›</button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />)}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {images.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setImgIdx(i)} className={`w-20 h-14 object-cover rounded-lg cursor-pointer flex-shrink-0 border-2 ${i === imgIdx ? 'border-blue-500' : 'border-transparent'}`} />
              ))}
            </div>
          )}

          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-gray-500 mt-1">📍 {property.location}</p>
            </div>
            <StatusBadge status={property.status} />
          </div>

          <div className="flex items-center gap-3 my-3">
            <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">{property.type}</span>
            <span className="text-2xl font-bold text-gray-900">₹{property.price?.toLocaleString()}<span className="text-base font-normal text-gray-500">/month</span></span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{property.description}</p>

          {/* Amenities */}
          <div className="mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">✨ Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities?.map((a) => (
                <span key={a} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm">✓ {a}</span>
              ))}
            </div>
          </div>

          {/* Rules */}
          {property.rules?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-3">📋 House Rules</h3>
              <div className="flex flex-wrap gap-2">
                {property.rules?.map((r) => (
                  <span key={r} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-sm">✗ {r}</span>
                ))}
              </div>
            </div>
          )}

          {/* Availability Timeline */}
          <div className="mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">📅 Availability</h3>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 font-medium">
                Available from: {new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            {property.availabilityTimeline?.length > 0 && (
              <div className="mt-3 space-y-2">
                {property.availabilityTimeline.map((t, i) => (
                  <div key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="text-gray-400">{new Date(t.date).toLocaleDateString()}</span>
                    <span>— {t.note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          {/* Price Card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <div className="text-2xl font-bold text-gray-900 mb-1">₹{property.price?.toLocaleString()}<span className="text-base font-normal text-gray-500">/month</span></div>
            <p className="text-sm text-gray-500 mb-4">📍 {property.city}</p>
            <button onClick={handleShortlist} className="w-full border-2 border-blue-200 text-blue-600 py-2 rounded-xl font-medium hover:bg-blue-50 mb-3">
              ❤️ Add to Shortlist
            </button>
            {shortlistMsg && <p className="text-sm text-center text-green-600 mb-2">{shortlistMsg}</p>}
          </div>

          {/* Request Visit */}
          {user?.role === 'tenant' && property.status === 'published' && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3">📅 Request a Visit</h3>
              <form onSubmit={handleVisitRequest} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Preferred Date</label>
                  <input
                    type="date" required
                    value={visitForm.preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setVisitForm({ ...visitForm, preferredDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Notes (optional)</label>
                  <textarea
                    value={visitForm.notes}
                    onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                    placeholder="Any specific requirements..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button type="submit" disabled={visitLoading} className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
                  {visitLoading ? 'Requesting...' : 'Request Visit'}
                </button>
                {visitMsg && <p className="text-xs text-center text-gray-600">{visitMsg}</p>}
              </form>
            </div>
          )}

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
              <p className="text-blue-700 text-sm mb-3">Login to request a visit or shortlist this property</p>
              <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 inline-block">Login</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
