import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const STATUS_FLOW = { draft: 'review', review: 'published' };
const STATUS_LABEL = { draft: 'Submit for Review', review: 'Publish', published: null };
const TYPES = ['1BHK', '2BHK', '3BHK', 'Studio', 'Villa', 'Hostel', 'Airbnb'];
const CITIES = ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];
const AMENITIES_LIST = ['WiFi', 'AC', 'Parking', 'Gym', 'Swimming Pool', 'Power Backup', 'Security', 'Lift', 'Washing Machine', 'Gated Society'];

const BLANK_FORM = { title: '', description: '', city: '', location: '', price: '', type: '2BHK', bedrooms: '', bathrooms: '', area: '', amenities: [], rules: '', availableFrom: '', images: '' };

function AddListingModal({ onClose, onCreated }) {
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleAmenity = (a) => set('amenities', form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area: Number(form.area),
        images: form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
        rules: form.rules ? form.rules.split('\n').map(s => s.trim()).filter(Boolean) : [],
      };
      const res = await api.post('/api/properties', payload);
      onCreated(res.data.property);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900">➕ Add New Listing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Title *</label>
              <input required value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Modern 2BHK in Bandra West"
                className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">City *</label>
              <select required value={form.city} onChange={e => set('city', e.target.value)}
                className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Type *</label>
              <select required value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Location / Area *</label>
              <input required value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="e.g. Bandra West, Mumbai"
                className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Price (₹/month) *</label>
              <input required type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="25000"
                className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Available From</label>
              <input type="date" value={form.availableFrom} onChange={e => set('availableFrom', e.target.value)}
                className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bedrooms</label>
              <input type="number" min="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}
                placeholder="2"
                className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bathrooms</label>
              <input type="number" min="0" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}
                placeholder="1"
                className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Area (sq ft)</label>
              <input type="number" min="0" value={form.area} onChange={e => set('area', e.target.value)}
                placeholder="850"
                className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe the property..."
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map(a => (
                <button type="button" key={a} onClick={() => toggleAmenity(a)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${form.amenities.includes(a) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-400'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">House Rules (one per line)</label>
            <textarea rows={2} value={form.rules} onChange={e => set('rules', e.target.value)}
              placeholder="No smoking&#10;No pets"
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Image URLs (one per line)</label>
            <textarea rows={3} value={form.images} onChange={e => set('images', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs" />
            <p className="text-xs text-gray-400 mt-1">Paste Unsplash or any image URLs, one per line</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    api.get('/api/admin/listings').then((r) => setListings(r.data.listings)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const advanceStatus = async (id, current) => {
    const next = STATUS_FLOW[current];
    if (!next) return;
    setActionLoading(id);
    try {
      await api.put(`/api/properties/${id}/status`, { status: next });
      setListings((prev) => prev.map((p) => p._id === id ? { ...p, status: next } : p));
      setMsg(`Listing ${next === 'published' ? 'published ✅' : 'submitted for review'}`);
      setTimeout(() => setMsg(''), 2500);
    } finally { setActionLoading(''); }
  };

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/api/properties/${id}`);
      setListings((prev) => prev.filter((p) => p._id !== id));
      setMsg('Listing deleted');
      setTimeout(() => setMsg(''), 2000);
    } finally { setActionLoading(''); }
  };

  const handleCreated = (property) => {
    setListings((prev) => [property, ...prev]);
    setMsg('Listing created! ✅');
    setTimeout(() => setMsg(''), 2500);
  };

  const filtered = listings.filter((p) => {
    const matchStatus = filter === 'all' || p.status === filter;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = { all: listings.length, draft: 0, review: 0, published: 0 };
  listings.forEach((l) => { if (counts[l.status] !== undefined) counts[l.status]++; });

  return (
    <div className="min-h-screen bg-gray-50">
      {showAdd && <AddListingModal onClose={() => setShowAdd(false)} onCreated={handleCreated} />}

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Manage Listings</h1>
              <p className="text-gray-400 text-sm mt-0.5">{listings.length} total properties</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
              ➕ Add Listing
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 mt-5 flex-wrap">
            {['all', 'draft', 'review', 'published'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all flex items-center gap-1.5 ${
                  filter === s ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {s === 'all' ? '📋' : s === 'draft' ? '📝' : s === 'review' ? '🔍' : '✅'} {s}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === s ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {msg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">{msg}</div>}

        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or city..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <span className="text-4xl block mb-2">🏠</span>
            <p className="text-gray-500 font-semibold">No listings found</p>
            <button onClick={() => setShowAdd(true)} className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Add your first listing
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Property', 'Type', 'Price', 'City', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=80'}
                          className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-gray-100" alt="" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                          <p className="text-xs text-gray-400">📍 {p.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">{p.type}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-sm text-gray-800">₹{p.price?.toLocaleString()}<span className="text-gray-400 font-normal text-xs">/mo</span></td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.city}</td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {STATUS_LABEL[p.status] && (
                          <button disabled={actionLoading === p._id} onClick={() => advanceStatus(p._id, p.status)}
                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors whitespace-nowrap">
                            {actionLoading === p._id ? '...' : STATUS_LABEL[p.status]}
                          </button>
                        )}
                        <button disabled={actionLoading === p._id} onClick={() => deleteListing(p._id)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors px-2">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
