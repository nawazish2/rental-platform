import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function TenantDashboard() {
  const [tab, setTab] = useState('visits');
  const [visits, setVisits] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/api/visits/my').then((r) => setVisits(r.data.visits)),
      api.get('/api/shortlists/my').then((r) => setShortlist(r.data.properties)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleRemoveShortlist = async (id) => {
    await api.delete(`/api/shortlists/remove/${id}`);
    setShortlist((prev) => prev.filter((p) => p._id !== id));
  };

  const handleCompareToggle = (id) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const visitStatusOrder = ['requested', 'scheduled', 'visited', 'decision_pending'];

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {[['visits', '📅 My Visits'], ['shortlist', '❤️ Shortlist'], ['movein', '🏠 Move-In']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Visits Tab */}
      {tab === 'visits' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Tracker</h2>
          {visits.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-2">📅</span>
              <p>No visits yet. <Link to="/browse" className="text-blue-600">Browse properties</Link> to request a visit.</p>
            </div>
          ) : (
            <>
              {/* Status flow indicator */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                {visitStatusOrder.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <StatusBadge status={s} />
                    {i < visitStatusOrder.length - 1 && <span className="text-gray-300">→</span>}
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Property</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Preferred Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Scheduled Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visits.map((v) => (
                      <tr key={v._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={v.property?.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=100'} className="w-10 h-10 rounded-lg object-cover" alt="" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">{v.property?.title}</p>
                              <p className="text-xs text-gray-500">{v.property?.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(v.preferredDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{v.scheduledDate ? new Date(v.scheduledDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                        <td className="px-4 py-3">
                          {v.status === 'decision_pending' && (
                            <button
                              onClick={() => navigate(`/movein-init/${v.property._id}`)}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                            >
                              Initiate Move-In
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Shortlist Tab */}
      {tab === 'shortlist' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Shortlisted Properties</h2>
            {compareIds.length >= 2 && (
              <a href={`/compare?ids=${compareIds.join(',')}`} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                Compare Selected ({compareIds.length})
              </a>
            )}
          </div>
          {shortlist.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-2">❤️</span>
              <p>No properties shortlisted yet. <Link to="/browse" className="text-blue-600">Browse</Link> and add some!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shortlist.map((p) => (
                <div key={p._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <Link to={`/property/${p._id}`}>
                    <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'} className="w-full h-40 object-cover" alt={p.title} />
                  </Link>
                  <div className="p-4">
                    <Link to={`/property/${p._id}`} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">{p.title}</Link>
                    <p className="text-sm text-gray-500 mt-0.5">📍 {p.location}</p>
                    <p className="font-bold text-gray-900 mt-1">₹{p.price?.toLocaleString()}/mo</p>
                    <div className="flex gap-2 mt-3">
                      <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                        <input type="checkbox" checked={compareIds.includes(p._id)} onChange={() => handleCompareToggle(p._id)} className="rounded" />
                        Compare
                      </label>
                      <button onClick={() => handleRemoveShortlist(p._id)} className="ml-auto text-xs text-red-500 hover:text-red-700">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Move-In Tab */}
      {tab === 'movein' && (
        <MoveInTab />
      )}
    </div>
  );
}

function MoveInTab() {
  const [moveIns, setMoveIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/movein/my').then((r) => setMoveIns(r.data.moveIns)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-8 text-center text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Move-In Records</h2>
      {moveIns.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <span className="text-4xl block mb-2">🏠</span>
          <p>No move-in records yet. After a successful visit, initiate your move-in.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {moveIns.map((m) => (
            <div key={m._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex gap-4">
              <img src={m.property?.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=100'} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 line-clamp-1">{m.property?.title}</p>
                <p className="text-sm text-gray-500">{m.property?.city}</p>
                <StatusBadge status={m.status} />
                <button onClick={() => navigate(`/movein/${m._id}`)} className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
                  Open Checklist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
