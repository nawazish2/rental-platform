import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const TYPES = ['1BHK', '2BHK', '3BHK', 'Studio', 'Villa', 'Hostel', 'Airbnb'];
const CITIES = ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];
const AMENITIES_LIST = ['WiFi', 'AC', 'Parking', 'Gym', 'Swimming Pool', 'Power Backup', 'Security', 'Lift', 'Washing Machine', 'Gated Society'];
const BLANK = { title: '', description: '', city: '', location: '', price: '', type: '2BHK', bedrooms: '', bathrooms: '', area: '', amenities: [], rules: '', availableFrom: '', images: '' };

function PropertyForm({ initial = BLANK, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a) => set('amenities', form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area: Number(form.area),
      images: form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
      rules: form.rules ? form.rules.split('\n').map(s => s.trim()).filter(Boolean) : [],
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Title *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Modern 2BHK in Bandra West"
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">City *</label>
          <select required value={form.city} onChange={e => set('city', e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select city</option>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Type *</label>
          <select required value={form.type} onChange={e => set('type', e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Location / Area *</label>
          <input required value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Bandra West, Mumbai"
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Price (₹/month) *</label>
          <input required type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="25000"
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Available From</label>
          <input type="date" value={form.availableFrom} onChange={e => set('availableFrom', e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bedrooms</label>
          <input type="number" min="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="2"
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bathrooms</label>
          <input type="number" min="0" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="1"
            className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
        <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the property..."
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
        <textarea rows={2} value={form.rules} onChange={e => set('rules', e.target.value)} placeholder="No smoking&#10;No pets"
          className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Image URLs (one per line)</label>
        <textarea rows={3} value={form.images} onChange={e => set('images', e.target.value)} placeholder="https://images.unsplash.com/..."
          className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Listing'}
        </button>
      </div>
    </form>
  );
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProp, setEditProp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/api/properties/my-listings').then(r => setListings(r.data.properties)),
      api.get('/api/visits/my-property').then(r => setVisits(r.data.visits)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      const res = await api.post('/api/properties', payload);
      setListings(p => [res.data.property, ...p]);
      setShowForm(false);
      flash('Listing created! ✅ Admin will review and publish it.');
    } catch (err) { flash('Error: ' + (err.response?.data?.message || err.message)); }
    finally { setSaving(false); }
  };

  const handleEdit = async (payload) => {
    setSaving(true);
    try {
      const res = await api.put(`/api/properties/${editProp._id}`, payload);
      setListings(p => p.map(x => x._id === editProp._id ? res.data.property : x));
      setEditProp(null);
      flash('Listing updated ✅');
    } catch (err) { flash('Error: ' + (err.response?.data?.message || err.message)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/api/properties/${id}`);
      setListings(p => p.filter(x => x._id !== id));
      flash('Listing deleted');
    } catch (err) { flash('Error: ' + (err.response?.data?.message || err.message)); }
  };

  const TABS = [
    { key: 'listings', label: 'My Listings', icon: '🏠', count: listings.length },
    { key: 'visits', label: 'Inquiries', icon: '📅', count: visits.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Owner Dashboard</h1>
              <p className="text-gray-400 text-sm mt-0.5">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
            </div>
            {tab === 'listings' && (
              <button onClick={() => { setShowForm(true); setEditProp(null); }}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                ➕ Add Listing
              </button>
            )}
          </div>

          <div className="flex gap-1 mt-5">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {t.icon} {t.label}
                {t.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{t.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {msg && <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium border ${msg.startsWith('Error') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{msg}</div>}

        {/* Add/Edit form inline */}
        {(showForm || editProp) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
            <h2 className="font-extrabold text-gray-900 mb-4">{editProp ? '✏️ Edit Listing' : '➕ New Listing'}</h2>
            <PropertyForm
              initial={editProp ? {
                ...editProp,
                images: (editProp.images || []).join('\n'),
                rules: (editProp.rules || []).join('\n'),
                availableFrom: editProp.availableFrom ? new Date(editProp.availableFrom).toISOString().split('T')[0] : '',
              } : BLANK}
              onSave={editProp ? handleEdit : handleCreate}
              onCancel={() => { setShowForm(false); setEditProp(null); }}
              saving={saving}
            />
          </div>
        )}

        {/* Listings tab */}
        {tab === 'listings' && (
          loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600" /></div>
          : listings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <span className="text-5xl block mb-3">🏠</span>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No listings yet</h3>
              <p className="text-gray-400 text-sm mb-5">Add your first property to get started</p>
              <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">Add Listing</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {listings.map(p => (
                <div key={p._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'} className="w-full h-40 object-cover" alt="" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-gray-900 line-clamp-1">{p.title}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">📍 {p.city} · {p.type}</p>
                    <p className="font-bold text-blue-600 mt-2">₹{p.price?.toLocaleString()}<span className="text-gray-400 font-normal text-xs">/mo</span></p>
                    {p.status === 'draft' && (
                      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-2">⏳ Awaiting admin review before publishing</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setEditProp(p); setShowForm(false); }}
                        className="flex-1 border border-gray-200 text-gray-600 py-1.5 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(p._id)}
                        className="flex-1 border border-red-100 text-red-400 py-1.5 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Visits/Inquiries tab */}
        {tab === 'visits' && (
          visits.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <span className="text-5xl block mb-3">📅</span>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No inquiries yet</h3>
              <p className="text-gray-400 text-sm">Visit requests from tenants will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Tenant', 'Property', 'Requested', 'Status'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visits.map(v => (
                    <tr key={v._id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">{v.tenant?.name || 'Tenant'}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{v.property?.title}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{v.preferredDate ? new Date(v.preferredDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-5 py-4"><StatusBadge status={v.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
