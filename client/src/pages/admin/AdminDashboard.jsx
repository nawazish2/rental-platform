import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
);

const STAT_CONFIG = [
  { key: 'totalProperties', label: 'Total Properties', icon: '🏘️', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', accent: '#3b82f6' },
  { key: 'publishedProperties', label: 'Published', icon: '✅', color: 'bg-green-50 text-green-600', border: 'border-green-100', accent: '#22c55e' },
  { key: 'pendingVisits', label: 'Pending Visits', icon: '📅', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100', accent: '#f59e0b' },
  { key: 'openTickets', label: 'Open Tickets', icon: '🎫', color: 'bg-red-50 text-red-600', border: 'border-red-100', accent: '#ef4444' },
];

const QUICK_LINKS = [
  { to: '/admin/listings', icon: '🏠', label: 'Manage Listings', desc: 'Publish, review, edit properties', color: 'hover:border-blue-300 hover:bg-blue-50/40' },
  { to: '/admin/visits', icon: '📅', label: 'Manage Visits', desc: 'Schedule and update visit status', color: 'hover:border-amber-300 hover:bg-amber-50/40' },
  { to: '/admin/tickets', icon: '🎫', label: 'Support Tickets', desc: 'Reply and resolve tenant issues', color: 'hover:border-red-300 hover:bg-red-50/40' },
  { to: '/admin/moveout', icon: '🚪', label: 'Move-Out Requests', desc: 'Approve or reject move-out requests', color: 'hover:border-orange-300 hover:bg-orange-50/40' },
];

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { font: { family: 'Inter, sans-serif', size: 12 }, color: '#6b7280' } } },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/charts'),
    ]).then(([s, c]) => {
      setStats(s.data);
      setCharts(c.data);
    }).finally(() => setLoading(false));
  }, []);

  // Chart datasets
  const lineData = charts ? {
    labels: charts.visits.labels,
    datasets: [{
      label: 'Visit Requests',
      data: charts.visits.data,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      fill: true,
      tension: 0.45,
      pointBackgroundColor: '#3b82f6',
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  } : null;

  const barData = charts ? {
    labels: charts.propertiesByCity.labels,
    datasets: [{
      label: 'Properties',
      data: charts.propertiesByCity.data,
      backgroundColor: ['#3b82f6','#6366f1','#8b5cf6','#ec4899','#f59e0b','#22c55e'],
      borderRadius: 8,
    }],
  } : null;

  const STATUS_COLORS = { open: '#ef4444', in_progress: '#f59e0b', resolved: '#22c55e', closed: '#6b7280' };
  const doughnutData = charts ? {
    labels: charts.ticketStatus.labels.map(l => l.replace('_', ' ')),
    datasets: [{
      data: charts.ticketStatus.data,
      backgroundColor: charts.ticketStatus.labels.map(l => STATUS_COLORS[l] || '#6b7280'),
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 6,
    }],
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Link to="/admin/listings" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-sm shadow-blue-200">
              + Add Listing
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CONFIG.map(({ key, label, icon, color, border, accent }) => (
            <div key={key} className={`bg-white rounded-2xl border ${border} p-5 shadow-sm hover:shadow-md transition-shadow`}>
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

        {/* ── Listing Status + Quick Actions ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Listing Status Breakdown</h2>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Published', key: 'publishedProperties', color: 'bg-green-500' },
                  { label: 'Draft', key: 'draftProperties', color: 'bg-gray-300' },
                  { label: 'Under Review', key: 'reviewProperties', color: 'bg-amber-400' },
                ].map(({ label, key, color }) => {
                  const val = stats?.[key] ?? 0;
                  const total = stats?.totalProperties || 1;
                  const pct = Math.round((val / total) * 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700">{label}</span>
                        <span className="text-gray-400">{val} <span className="text-gray-300">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

        {/* ── Charts Row ── */}
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">📊 Analytics</h2>
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Line: visits trend */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">Visit Requests</p>
              <p className="text-xs text-gray-400 mb-4">Last 6 months</p>
              <div style={{ height: 220 }}>
                {loading || !lineData
                  ? <div className="h-full bg-gray-50 rounded-xl animate-pulse" />
                  : <Line data={lineData} options={{ ...chartDefaults, scales: { y: { beginAtZero: true, ticks: { precision: 0, color: '#9ca3af' }, grid: { color: '#f3f4f6' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } } }} />
                }
              </div>
            </div>

            {/* Doughnut: ticket status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">Support Tickets</p>
              <p className="text-xs text-gray-400 mb-4">By status</p>
              <div className="flex-1 flex items-center justify-center" style={{ minHeight: 200 }}>
                {loading || !doughnutData
                  ? <div className="w-40 h-40 rounded-full bg-gray-100 animate-pulse" />
                  : doughnutData.labels.length === 0
                    ? <p className="text-gray-400 text-sm">No ticket data yet</p>
                    : <Doughnut data={doughnutData} options={{ ...chartDefaults, cutout: '65%', plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, position: 'bottom' } } }} />
                }
              </div>
            </div>

          </div>

          {/* Bar: properties by city */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">Properties by City</p>
            <p className="text-xs text-gray-400 mb-4">Top cities on the platform</p>
            <div style={{ height: 220 }}>
              {loading || !barData
                ? <div className="h-full bg-gray-50 rounded-xl animate-pulse" />
                : barData.labels.length === 0
                  ? <p className="text-gray-400 text-sm">No property data yet</p>
                  : <Bar data={barData} options={{ ...chartDefaults, scales: { y: { beginAtZero: true, ticks: { precision: 0, color: '#9ca3af' }, grid: { color: '#f3f4f6' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } }, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
