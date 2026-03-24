import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function AdminMoveOut() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/api/admin/moveout-requests')
      .then(r => setRequests(r.data.moveIns))
      .finally(() => setLoading(false));
  }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const respond = async (id, status) => {
    setActionLoading(id + status);
    try {
      await api.put(`/api/movein/${id}/moveout-respond`, { status });
      setRequests(p => p.filter(r => r._id !== id));
      flash(`Move-out ${status} ✅`);
    } catch (err) {
      flash('Error: ' + (err.response?.data?.message || err.message));
    } finally { setActionLoading(''); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Admin</Link>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Move-Out Requests</h1>
              <p className="text-gray-400 text-sm mt-0.5">{requests.length} pending request{requests.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {msg && <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium border ${msg.startsWith('Error') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{msg}</div>}

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <span className="text-5xl block mb-3">🚪</span>
            <h3 className="text-lg font-bold text-gray-700">No pending move-out requests</h3>
            <p className="text-gray-400 text-sm mt-2">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{r.tenant?.name}</p>
                      <span className="text-gray-300">·</span>
                      <p className="text-sm text-gray-400">{r.tenant?.email}</p>
                    </div>
                    <p className="text-sm text-gray-600">🏠 {r.property?.title} — {r.property?.city}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      <span className="text-gray-500">
                        📅 Preferred: <span className="font-semibold text-gray-700">
                          {r.moveOut?.preferredDate ? new Date(r.moveOut.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                        </span>
                      </span>
                      <span className="text-gray-500">
                        🕒 Requested: <span className="font-semibold text-gray-700">
                          {r.moveOut?.requestedAt ? new Date(r.moveOut.requestedAt).toLocaleDateString('en-IN') : '—'}
                        </span>
                      </span>
                    </div>
                    {r.moveOut?.reason && (
                      <div className="mt-3 bg-gray-50 rounded-xl px-4 py-2.5">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Reason</p>
                        <p className="text-sm text-gray-700">{r.moveOut.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      disabled={!!actionLoading}
                      onClick={() => respond(r._id, 'approved')}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
                      {actionLoading === r._id + 'approved' ? '...' : '✅ Approve'}
                    </button>
                    <button
                      disabled={!!actionLoading}
                      onClick={() => respond(r._id, 'rejected')}
                      className="border border-red-200 text-red-500 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors">
                      {actionLoading === r._id + 'rejected' ? '...' : '❌ Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
