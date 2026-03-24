import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewMsg, setReviewMsg] = useState('');
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    api.get(`/api/properties/${id}`)
      .then((res) => {
        setProperty(res.data.property);
        // fetch reviews and similar in parallel
        api.get(`/api/reviews/property/${id}`).then(r => { setReviews(r.data.reviews); setAvgRating(r.data.avgRating); }).catch(()=>{});
        const p = res.data.property;
        api.get(`/api/properties?city=${p.city}&type=${p.type}&limit=4`).then(r => setSimilar(r.data.properties?.filter(x => x._id !== id).slice(0,3))).catch(()=>{});
      })
      .catch(() => navigate('/browse'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVisitRequest = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setVisitLoading(true);
    try {
      await api.post('/api/visits', { propertyId: id, ...visitForm });
      setVisitMsg('success');
      setVisitForm({ preferredDate: '', notes: '' });
    } catch (err) {
      setVisitMsg('error:' + (err.response?.data?.message || 'Error requesting visit'));
    } finally { setVisitLoading(false); }
  };

  const handleShortlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/api/shortlists/add', { propertyId: id });
      setShortlistMsg('added');
    } catch (err) {
      setShortlistMsg(err.response?.data?.message?.includes('Already') ? 'already' : 'error');
    }
    setTimeout(() => setShortlistMsg(''), 2500);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
      <p className="text-gray-400 text-sm">Loading property...</p>
    </div>
  );
  if (!property) return null;

  const images = property.images?.length
    ? property.images
    : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>›</span>
          <Link to="/browse" className="hover:text-blue-600">Browse</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium line-clamp-1 max-w-xs">{property.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gallery */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative">
                <img src={images[imgIdx]} alt={property.title}
                  className="w-full h-80 object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-md text-lg hover:bg-white transition-colors">‹</button>
                    <button onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-md text-lg hover:bg-white transition-colors">›</button>
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                      {imgIdx + 1} / {images.length}
                    </div>
                  </>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">{property.type}</span>
                  <StatusBadge status={property.status} />
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
                      className={`w-20 h-14 object-cover rounded-xl cursor-pointer flex-shrink-0 transition-all ${i === imgIdx ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-60 hover:opacity-100'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">{property.title}</h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-1">
                    <span className="text-blue-500">📍</span>{property.location}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-extrabold text-blue-600">₹{property.price?.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">per month</div>
                </div>
              </div>

              {/* Tab Nav */}
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-5 w-fit">
                {[['overview','Overview'],['amenities','Amenities'],['rules','Rules'],['availability','Availability']].map(([key, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-5">
                {activeTab === 'overview' && (
                  <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
                )}
                {activeTab === 'amenities' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities?.length ? property.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                        <span className="text-green-500 font-bold text-sm">✓</span>
                        <span className="text-gray-700 text-sm font-medium">{a}</span>
                      </div>
                    )) : <p className="text-gray-400 text-sm col-span-3">No amenities listed.</p>}
                  </div>
                )}
                {activeTab === 'rules' && (
                  <div className="space-y-2">
                    {property.rules?.length ? property.rules.map((r) => (
                      <div key={r} className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <span className="text-red-500 font-bold text-sm">✕</span>
                        <span className="text-gray-700 text-sm font-medium">{r}</span>
                      </div>
                    )) : <p className="text-gray-400 text-sm">No specific rules listed.</p>}
                  </div>
                )}
                {activeTab === 'availability' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">📅</div>
                      <div>
                        <p className="font-semibold text-green-800">Available From</p>
                        <p className="text-green-700 text-sm">
                          {new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {property.availabilityTimeline?.map((t, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl text-sm">
                        <span className="text-gray-400 w-24 flex-shrink-0">{new Date(t.date).toLocaleDateString()}</span>
                        <span className="text-gray-600">— {t.note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-4">

            {/* Price + Shortlist Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-2xl font-extrabold text-gray-900">₹{property.price?.toLocaleString()}</div>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <p className="text-sm text-gray-500 mb-5 flex items-center gap-1"><span>📍</span>{property.city}</p>

              <button onClick={handleShortlist}
                className={`w-full py-3 rounded-2xl font-semibold text-sm border-2 transition-all mb-3 ${
                  shortlistMsg === 'added' ? 'border-red-300 bg-red-50 text-red-600' :
                  shortlistMsg === 'already' ? 'border-gray-200 bg-gray-50 text-gray-500' :
                  'border-blue-200 text-blue-600 hover:bg-blue-50'
                }`}>
                {shortlistMsg === 'added' ? '❤️ Added to Shortlist!' :
                 shortlistMsg === 'already' ? '❤️ Already in Shortlist' : '🤍 Add to Shortlist'}
              </button>

              {/* Visit Request */}
              {user?.role === 'tenant' && property.status === 'published' ? (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">📅 Request a Visit</h3>
                  {visitMsg === 'success' ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                      <span className="text-3xl block mb-2">✅</span>
                      <p className="text-green-700 font-semibold text-sm">Visit Requested!</p>
                      <p className="text-green-600 text-xs mt-1">Check your dashboard for updates.</p>
                      <Link to="/dashboard" className="text-blue-600 text-xs mt-2 inline-block hover:underline">View Dashboard →</Link>
                    </div>
                  ) : (
                    <form onSubmit={handleVisitRequest} className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1 font-medium">Preferred Date</label>
                        <input type="date" required
                          value={visitForm.preferredDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setVisitForm({ ...visitForm, preferredDate: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1 font-medium">Notes (optional)</label>
                        <textarea rows={2}
                          value={visitForm.notes}
                          onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                          placeholder="Any specific requirements..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                      </div>
                      {visitMsg.startsWith('error:') && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{visitMsg.replace('error:', '')}</p>
                      )}
                      <button type="submit" disabled={visitLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm shadow-blue-200">
                        {visitLoading ? 'Requesting...' : '📅 Request Visit'}
                      </button>
                    </form>
                  )}
                </div>
              ) : !user ? (
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-500 mb-3">Login to request a visit</p>
                  <Link to="/login" className="block bg-blue-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                    Login to Continue
                  </Link>
                  <Link to="/register" className="block mt-2 text-blue-600 text-xs hover:underline">Don't have an account? Register →</Link>
                </div>
              ) : null}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Quick Info</h3>
              <div className="space-y-2.5">
                {[
                  ['🏠', 'Type', property.type],
                  ['📍', 'City', property.city],
                  ['💰', 'Monthly Rent', `₹${property.price?.toLocaleString()}`],
                  ['📅', 'Available', new Date(property.availableFrom).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })],
                  ['✨', 'Amenities', `${property.amenities?.length || 0} included`],
                ].map(([icon, label, value]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5"><span>{icon}</span>{label}</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Calendar */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-3">Availability</h3>
              <AvailabilityCalendar availableFrom={property.availableFrom} blockedDates={property.blockedDates || []} />
            </div>
          </div>
        </div>

        {/* ── REVIEWS SECTION ── */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Reviews</h2>
              {avgRating && <p className="text-sm text-gray-400 mt-0.5">⭐ {avgRating} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>}
            </div>
          </div>

          {/* Leave a review (tenant only) */}
          {user?.role === 'tenant' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
              <h3 className="font-bold text-gray-700 text-sm mb-3">Leave a Review</h3>
              <StarRating value={reviewForm.rating} onChange={(r) => setReviewForm(f => ({...f, rating: r}))} size="lg" />
              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm(f => ({...f, comment: e.target.value}))}
                rows={3} placeholder="Share your experience with this property..."
                className="w-full mt-3 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <div className="flex items-center gap-3 mt-3">
                <button onClick={async () => {
                  if (!reviewForm.rating) return setReviewMsg('Please select a rating');
                  try {
                    const res = await api.post('/api/reviews', { propertyId: id, ...reviewForm });
                    setReviews(prev => { const filtered = prev.filter(r => r.tenant._id !== user._id); return [res.data.review, ...filtered]; });
                    setReviewMsg('Review submitted ✅');
                    setReviewForm({ rating: 0, comment: '' });
                    setTimeout(() => setReviewMsg(''), 3000);
                  } catch(e) { setReviewMsg(e.response?.data?.message || 'Error'); }
                }} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                  Submit Review
                </button>
                {reviewMsg && <p className={`text-sm font-medium ${reviewMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>{reviewMsg}</p>}
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-3xl mb-2">⭐</p>
              <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {r.tenant?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{r.tenant?.name}</p>
                        <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</p>
                      </div>
                    </div>
                    <StarRating value={r.rating} readonly size="sm" />
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SIMILAR PROPERTIES ── */}
        {similar.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-extrabold text-gray-900 mb-5">Similar Properties</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {similar.map((p) => (
                <Link key={p._id} to={`/property/${p._id}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" alt={p.title} />
                  <div className="p-3">
                    <p className="font-bold text-sm text-gray-800 line-clamp-1">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📍 {p.location}</p>
                    <p className="font-extrabold text-gray-900 mt-2 text-sm">₹{p.price?.toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
