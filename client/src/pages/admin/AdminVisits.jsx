import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const STATUS_OPTIONS = ['requested', 'scheduled', 'visited', 'decision_pending'];

export default function AdminVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', scheduledDate: '', adminNotes: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const r = await api.get('/api/admin/visits').finally(() => setLoading(false));
    setVisits(r.data.visits);
  };

  const handleEdit = (v) => {
    setEditId(v._id);
    setEditForm({ status: v.status, scheduledDate: v.scheduledDate ? new Date(v.scheduledDate).toISOString().split('T')[0] : '', adminNotes: v.adminNotes || '' });
  };

  const handleUpdate = async () => {
    setUpdating(editId);
    try {
      await api.put(`/api/visits/${editId}/status`, editForm);
      setMsg('✅ Visit updated!');
      setEditId(null);
      await load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error'));
    } finally {
      setUpdating('');
      setTimeout(() => setMsg(''), 2000);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Visits</h1>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{msg}</div>}

      {/* Status flow */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {STATUS_OPTIONS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <StatusBadge status={s} />
            {i < STATUS_OPTIONS.length - 1 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Preferred</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visits.map((v) => (
              <>
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs">
                    <p className="line-clamp-1">{v.property?.title}</p>
                    <p className="text-xs text-gray-400">{v.property?.city}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <p>{v.tenant?.name}</p>
                    <p className="text-xs text-gray-400">{v.tenant?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(v.preferredDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{v.scheduledDate ? new Date(v.scheduledDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => editId === v._id ? setEditId(null) : handleEdit(v)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200">
                      {editId === v._id ? 'Cancel' : 'Edit'}
                    </button>
                  </td>
                </tr>
                {editId === v._id && (
                  <tr key={`${v._id}-edit`} className="bg-blue-50">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="flex gap-3 flex-wrap items-end">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Status</label>
                          <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                          </select>
                        </div>
                        {editForm.status === 'scheduled' && (
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Scheduled Date</label>
                            <input type="date" value={editForm.scheduledDate} onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-32">
                          <label className="text-xs text-gray-600 block mb-1">Admin Notes</label>
                          <input type="text" value={editForm.adminNotes} onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                            placeholder="Notes for tenant..." className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button onClick={handleUpdate} disabled={!!updating}
                          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                          {updating ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {visits.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No visits yet.</p>}
      </div>
    </div>
  );
}
