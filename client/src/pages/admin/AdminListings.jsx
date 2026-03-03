import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const STATUS_NEXT = { draft: 'review', review: 'published' };

export default function AdminListings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', city: '', price: '', type: '2BHK', amenities: '', rules: '', availableFrom: '' });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { load(); }, [statusFilter]);

  const load = async () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    const r = await api.get('/api/admin/listings', { params }).finally(() => setLoading(false));
    setProperties(r.data.properties);
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/api/properties/${id}/status`, { status });
    setMsg('Status updated!');
    setTimeout(() => setMsg(''), 2000);
    await load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    await api.delete(`/api/properties/${id}`);
    await load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((f) => formData.append('images', f));
      await api.post('/api/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('✅ Property created!');
      setShowForm(false);
      setForm({ title: '', description: '', location: '', city: '', price: '', type: '2BHK', amenities: '', rules: '', availableFrom: '' });
      setImages([]);
      await load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error'));
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Listings</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">+ New Listing</button>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{msg}</div>}

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'draft', 'review', 'published'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Add Listing Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 mt-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900">Add New Listing</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              {[
                { name: 'title', label: 'Title', type: 'text', placeholder: 'Modern 2BHK in Bandra', span: 2 },
                { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the property...', span: 2 },
                { name: 'location', label: 'Location', type: 'text', placeholder: 'Bandra West, Mumbai' },
                { name: 'city', label: 'City', type: 'text', placeholder: 'Mumbai' },
                { name: 'price', label: 'Monthly Rent (₹)', type: 'number', placeholder: '35000' },
                { name: 'availableFrom', label: 'Available From', type: 'date' },
              ].map((f) => (
                <div key={f.name} className={f.span === 2 ? 'col-span-2' : ''}>
                  <label className="text-sm text-gray-600 block mb-1">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea required value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder} rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <input required type={f.type} value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  )}
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-600 block mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['Studio', '1BHK', '2BHK', '3BHK', 'Villa'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Images</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} className="text-sm w-full" />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600 block mb-1">Amenities (comma-separated)</label>
                <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, Parking, Gym"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600 block mb-1">House Rules (comma-separated)</label>
                <input type="text" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} placeholder="No Pets, No Smoking"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2 flex gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {properties.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=60'} className="w-10 h-10 rounded-lg object-cover" alt="" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.city}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{p.price?.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_NEXT[p.status] && (
                        <button onClick={() => handleStatusChange(p._id, STATUS_NEXT[p.status])}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200 font-medium">
                          → {STATUS_NEXT[p.status]}
                        </button>
                      )}
                      {p.status !== 'published' && (
                        <button onClick={() => handleStatusChange(p._id, 'draft')}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-200">
                          Set Draft
                        </button>
                      )}
                      <button onClick={() => handleDelete(p._id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-lg hover:bg-red-200">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {properties.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No properties found.</p>}
        </div>
      )}
    </div>
  );
}
