import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const STAT_CONFIG = [
  { key: 'totalProperties', label: 'Total Properties', icon: '🏘️', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  { key: 'publishedProperties', label: 'Published', icon: '✅', color: 'bg-green-50 text-green-600', border: 'border-green-100' },
  { key: 'pendingVisits', label: 'Pending Visits', icon: '📅', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
  { key: 'openTickets', label: 'Open Tickets', icon: '🎫', color: 'bg-red-50 text-red-600', border: 'border-red-100' },
];

const QUICK_LINKS = [
  { to: '/admin/listings', icon: '🏠', label: 'Manage Listings', desc: 'Publish, review, edit properties', color: 'hover:border-blue-300 hover:bg-blue-50/40' },
  { to: '/admin/visits', icon: '📅', label: 'Manage Visits', desc: 'Schedule and update visit status', color: 'hover:border-amber-300 hover:bg-amber-50/40' },
  { to: '/admin/tickets', icon: '🎫', label: 'Support Tickets', desc: 'Reply and resolve tenant issues', color: 'hover:border-red-300 hover:bg-red-50/40' },
  { to: '/admin/moveout', icon: '🚪', label: 'Move-Out Requests', desc: 'Approve or reject move-out requests', color: 'hover:border-orange-300 hover:bg-orange-50/40' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats').then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/listings" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                + Add Listing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CONFIG.map(({ key, label, icon, color, border }) => (
            <div key={key} className={`bg-white rounded-2xl border ${border} p-5 shadow-sm`}>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl ${color} mb-3`}>{icon}</div>
              {loading ? (
                <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse mb-1" />
              ) : (
                <p className="text-3xl font-extrabold text-gray-900 leading-none">{stats?.[key] ?? '—'}</p>
              )}
              <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Status breakdown + Quick links side-by-side */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Listing status breakdown */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Listing Status Breakdown</h2>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Published', key: 'publishedProperties', color: 'bg-green-500', total: stats?.totalProperties },
                  { label: 'Draft', key: 'draftProperties', color: 'bg-gray-300', total: stats?.totalProperties },
                  { label: 'Under Review', key: 'reviewProperties', color: 'bg-amber-400', total: stats?.totalProperties },
                ].map(({ label, key, color, total }) => {
                  const val = stats?.[key] ?? 0;
                  const pct = total ? Math.round((val / total) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700">{label}</span>
                        <span className="text-gray-400">{val} <span className="text-gray-300">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Extra stats row */}
            <div className="mt-6 pt-5 border-t border-gray-50 grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Total Visits', val: stats?.totalVisits },
                { label: 'Active Move-Ins', val: stats?.activeMoveIns },
                { label: 'Total Tickets', val: stats?.totalTickets },
              ].map(({ label, val }) => (
                <div key={label}>
                  {loading ? <div className="h-6 bg-gray-100 rounded animate-pulse mx-auto w-10 mb-1" /> : <p className="text-2xl font-extrabold text-gray-900">{val ?? '—'}</p>}
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              {QUICK_LINKS.map(({ to, icon, label, desc, color }) => (
                <Link key={to} to={to}
                  className={`flex items-start gap-3 p-4 rounded-xl border border-transparent transition-all cursor-pointer ${color}`}>
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
