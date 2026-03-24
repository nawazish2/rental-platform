import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const VISIT_STEPS = ['requested','scheduled','visited','decision_pending'];

export default function TenantDashboard() {
  const { user } = useAuth();
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
    setShortlist((p) => p.filter((x) => x._id !== id));
  };

  const handleCompareToggle = (id) =>
    setCompareIds((p) => p.includes(id) ? p.filter((i) => i !== id) : p.length < 3 ? [...p, id] : p);

  const TABS = [
    { key: 'visits', label: 'My Visits', icon: '📅', count: visits.length },
    { key: 'shortlist', label: 'Shortlist', icon: '❤️', count: shortlist.length },
    { key: 'movein', label: 'Move-In', icon: '🏠' },
    { key: 'payments', label: 'Payments', icon: '💳' },
  ];

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600" />
      <p className="text-gray-400 text-sm">Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">My Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5">Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span></p>
            </div>
            <Link to="/browse" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              + Browse Properties
            </Link>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 mt-5">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t.key
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {t.icon} {t.label}
                {t.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── VISITS TAB ── */}
        {tab === 'visits' && (
          <div>
            {/* Status flow banner */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center gap-3 overflow-x-auto">
              <span className="text-xs text-gray-400 font-medium flex-shrink-0">Status Flow:</span>
              {VISIT_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={s} />
                  {i < VISIT_STEPS.length - 1 && <span className="text-gray-300 text-sm">→</span>}
                </div>
              ))}
            </div>

            {visits.length === 0 ? (
              <EmptyState icon="📅" title="No visits yet"
                desc="Browse properties and request a visit to get started."
                action={{ label: 'Browse Properties', to: '/browse' }} />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Property', 'Preferred Date', 'Scheduled Date', 'Status', 'Action'].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visits.map((v) => (
                      <tr key={v._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={v.property?.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=80'}
                              className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-gray-100" alt="" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{v.property?.title}</p>
                              <p className="text-xs text-gray-400">📍 {v.property?.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{new Date(v.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {v.scheduledDate
                            ? <span className="text-green-600 font-medium">{new Date(v.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={v.status} /></td>
                        <td className="px-5 py-4">
                          {v.status === 'decision_pending' && (
                            <button onClick={() => navigate(`/movein-init/${v.property._id}`)}
                              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium transition-colors">
                              Initiate Move-In
                            </button>
                          )}
                          {v.adminNotes && (
                            <p className="text-xs text-blue-600 mt-1 max-w-32 truncate" title={v.adminNotes}>💬 {v.adminNotes}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SHORTLIST TAB ── */}
        {tab === 'shortlist' && (
          <div>
            {compareIds.length >= 2 && (
              <div className="mb-5 flex items-center gap-3 bg-blue-600 text-white rounded-2xl px-5 py-3 shadow-lg shadow-blue-200">
                <span className="text-sm font-semibold">{compareIds.length} properties selected</span>
                <a href={`/compare?ids=${compareIds.join(',')}`}
                  className="bg-white text-blue-600 px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-blue-50 ml-auto">
                  Compare Now →
                </a>
                <button onClick={() => setCompareIds([])} className="text-blue-200 hover:text-white text-sm">Clear</button>
              </div>
            )}

            {shortlist.length === 0 ? (
              <EmptyState icon="❤️" title="No shortlisted properties"
                desc="Browse properties and tap the heart icon to shortlist them."
                action={{ label: 'Browse Properties', to: '/browse' }} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {shortlist.map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="relative">
                      <Link to={`/property/${p._id}`}>
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" alt={p.title} />
                      </Link>
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{p.type}</span>
                    </div>
                    <div className="p-4">
                      <Link to={`/property/${p._id}`} className="font-bold text-gray-900 hover:text-blue-600 line-clamp-1 text-sm transition-colors">{p.title}</Link>
                      <p className="text-xs text-gray-400 mt-0.5">📍 {p.location}</p>
                      <p className="font-extrabold text-gray-900 mt-2">₹{p.price?.toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                          <input type="checkbox" checked={compareIds.includes(p._id)}
                            onChange={() => handleCompareToggle(p._id)} className="w-3.5 h-3.5 accent-blue-600" />
                          Compare
                        </label>
                        <button onClick={() => handleRemoveShortlist(p._id)}
                          className="ml-auto text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MOVEIN TAB ── */}
        {tab === 'movein' && <MoveInTab />}
        {tab === 'payments' && <PaymentsTab />}
      </div>
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

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600" /></div>;

  if (moveIns.length === 0) return (
    <EmptyState icon="🏠" title="No move-in records"
      desc="After a successful property visit, initiate your move-in process." />
  );

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {moveIns.map((m) => {
        const docs = m.checklist?.documents?.length || 0;
        const agreement = m.checklist?.agreementConfirmed;
        const inventory = m.checklist?.inventoryList?.length || 0;
        const progress = [docs > 0, agreement, inventory > 0].filter(Boolean).length;

        return (
          <div key={m._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              <img src={m.property?.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=80'}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-gray-100" alt="" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 line-clamp-1 text-sm">{m.property?.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">📍 {m.property?.city}</p>
                <div className="mt-2"><StatusBadge status={m.status} /></div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Checklist Progress</span>
                <span className="text-xs font-bold text-blue-600">{progress}/3 steps</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${(progress / 3) * 100}%` }} />
              </div>
              <div className="flex gap-3 mt-2">
                {[['📄', 'Docs', docs > 0], ['📜', 'Agreement', agreement], ['🛋️', 'Inventory', inventory > 0]].map(([icon, label, done]) => (
                  <span key={label} className={`text-xs flex items-center gap-1 ${done ? 'text-green-600' : 'text-gray-400'}`}>
                    {done ? '✅' : '⬜'} {label}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={() => navigate(`/movein/${m._id}`)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Open Checklist →
            </button>
          </div>
        );
      })}
    </div>
  );
}

function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/payments/my').then((r) => setPayments(r.data.payments)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600" /></div>;

  if (payments.length === 0) return (
    <EmptyState icon="💳" title="No payment records" desc="Your rent payments and invoices will appear here." />
  );

  const STATUS_STYLE = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
              {p.type === 'rent' ? '🏠' : p.type === 'deposit' ? '🔒' : '🔧'}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{p.property?.title || 'Property'}</p>
              <p className="text-xs text-gray-400 capitalize">{p.type}{p.month ? ` · ${p.month}` : ''}</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div>
              <p className="font-bold text-gray-900">₹{p.amount?.toLocaleString()}</p>
              {p.paidAt && <p className="text-xs text-gray-400">{new Date(p.paidAt).toLocaleDateString('en-IN')}</p>}
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[p.status] || 'bg-gray-100 text-gray-600'}`}>
              {p.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
      <span className="text-5xl block mb-3">{icon}</span>
      <h3 className="text-lg font-bold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-5">{desc}</p>
      {action && (
        <Link to={action.to} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          {action.label}
        </Link>
      )}
    </div>
  );
}
