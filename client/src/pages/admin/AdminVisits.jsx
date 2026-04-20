import { Fragment, useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const STATUS_OPTIONS = ['requested', 'scheduled', 'visited', 'decision_pending'];

export default function AdminVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: '', scheduledDate: '', adminNotes: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (filter !== 'all') params.status = filter;
      const r = await api.get('/api/admin/visits', { params });
      setVisits(r.data.visits);
      setTotal(r.data.total ?? 0);
      setPages(r.data.pages ?? 1);
      setStatusCounts(r.data.statusCounts || {});
    } catch (err) {
      setMsg('Could not load visits: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const openEdit = (v) => {
    setEditing(v._id);
    setForm({ status: v.status, scheduledDate: v.scheduledDate?.split('T')[0] || '', adminNotes: v.adminNotes || '' });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/api/visits/${editing}/status`, form);
      setEditing(null);
      setMsg('Visit updated ✅');
      setTimeout(() => setMsg(''), 2000);
      await fetchVisits();
    } finally {
      setSaving(false);
    }
  };

  const FILTER_TABS = [
    { key: 'all', icon: '📋', label: 'All' },
    { key: 'requested', icon: '🕐', label: 'Requested' },
    { key: 'scheduled', icon: '📅', label: 'Scheduled' },
    { key: 'visited', icon: '✅', label: 'Visited' },
    { key: 'decision_pending', icon: '⏳', label: 'Decision' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Manage Visits</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {total} in this view · page {page} of {pages} · {statusCounts.all ?? 0} total
          </p>

          <div className="flex gap-1 mt-5 flex-wrap">
            {FILTER_TABS.map(({ key, icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${filter === key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {icon} {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {statusCounts[key] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {msg && !msg.startsWith('Could not') && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">{msg}</div>
        )}
        {msg && msg.startsWith('Could not') && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">{msg}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600" /></div>
        ) : visits.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <span className="text-4xl block mb-2">📅</span>
            <p className="text-gray-500 font-semibold">No visits in this category</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Tenant', 'Property', 'Preferred Date', 'Scheduled', 'Status', 'Action'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visits.map((v) => (
                    <Fragment key={v._id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-800">{v.tenant?.name}</p>
                          <p className="text-xs text-gray-400">{v.tenant?.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={v.property?.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=60'}
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                              alt=""
                            />
                            <div>
                              <p className="text-xs font-semibold text-gray-800 line-clamp-1">{v.property?.title}</p>
                              <p className="text-xs text-gray-400">{v.property?.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{new Date(v.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {v.scheduledDate ? (
                            <span className="text-green-600 font-medium">{new Date(v.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={v.status} /></td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => openEdit(v)}
                            className="text-xs bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-all"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                      {editing === v._id && (
                        <tr className="bg-blue-50/60">
                          <td colSpan={6} className="px-5 py-4">
                            <div className="flex flex-wrap gap-4 items-end">
                              <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">Status</label>
                                <select
                                  value={form.status}
                                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">Scheduled Date</label>
                                <input
                                  type="date"
                                  value={form.scheduledDate}
                                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                              </div>
                              <div className="flex-1 min-w-48">
                                <label className="text-xs text-gray-500 font-medium block mb-1">Admin Notes</label>
                                <input
                                  value={form.adminNotes}
                                  onChange={(e) => setForm((f) => ({ ...f, adminNotes: e.target.value }))}
                                  placeholder="Optional notes for tenant..."
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  disabled={saving}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" onClick={() => setEditing(null)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} / {pages}</span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
