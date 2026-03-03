import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats').then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const cards = [
    { label: 'Total Listings', value: stats?.listings?.total, sub: `${stats?.listings?.published} Published`, icon: '🏠', color: 'blue', link: '/admin/listings' },
    { label: 'Pending Visits', value: stats?.visits?.pending, sub: `${stats?.visits?.total} Total`, icon: '📅', color: 'yellow', link: '/admin/visits' },
    { label: 'Open Tickets', value: stats?.tickets?.open, sub: `${stats?.tickets?.total} Total`, icon: '🎫', color: 'red', link: '/admin/tickets' },
    { label: 'Total Move-Ins', value: stats?.moveIns?.total, sub: `${stats?.users?.tenants} Tenants`, icon: '🔑', color: 'green', link: '/admin/listings' },
  ];

  const colorMap = { blue: 'bg-blue-50 text-blue-700', yellow: 'bg-yellow-50 text-yellow-700', red: 'bg-red-50 text-red-700', green: 'bg-green-50 text-green-700' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Overview of all platform activity</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((c) => (
          <Link key={c.label} to={c.link} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${colorMap[c.color]}`}>{c.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{c.value}</div>
            <div className="font-medium text-gray-700 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-400 mt-1">{c.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick Nav */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/admin/listings', icon: '➕', label: 'Add New Listing' },
          { to: '/admin/listings', icon: '📋', label: 'Manage Listings' },
          { to: '/admin/visits', icon: '📅', label: 'Manage Visits' },
          { to: '/admin/tickets', icon: '🎫', label: 'Support Tickets' },
        ].map((a) => (
          <Link key={a.label} to={a.to} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:border-blue-200 hover:bg-blue-50 transition-colors">
            <span className="text-xl">{a.icon}</span>
            <span className="font-medium text-gray-700 text-sm">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
