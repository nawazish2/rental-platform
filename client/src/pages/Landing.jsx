import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Find Your Perfect Home</h1>
          <p className="text-xl text-blue-100 mb-8">
            Discover rental properties, schedule visits, and manage your move-in — all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/browse" className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 text-lg">
              Browse Properties
            </Link>
            {!user && (
              <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 text-lg">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-3 gap-8 text-center">
          {[['500+', 'Properties Listed'], ['200+', 'Happy Tenants'], ['50+', 'Cities Covered']].map(([num, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold text-blue-700">{num}</div>
              <div className="text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🔍', title: 'Smart Search', desc: 'Filter by location, budget, move-in date and property type.' },
            { icon: '📅', title: 'Visit Scheduling', desc: 'Request and track property visits with real-time status updates.' },
            { icon: '📋', title: 'Move-in Checklist', desc: 'Upload documents, confirm agreement, and manage inventory digitally.' },
            { icon: '❤️', title: 'Shortlist & Compare', desc: 'Save favorites and compare up to 3 properties side-by-side.' },
            { icon: '🎫', title: 'Support Tickets', desc: 'Raise and track support issues with threaded conversations.' },
            { icon: '🛡️', title: 'Admin Dashboard', desc: 'Full control over listings, visits, and tenant management.' },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-50 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to find your home?</h2>
        <Link to="/browse" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 text-lg inline-block">
          Browse All Properties →
        </Link>
      </div>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        © 2026 RentEase — Cohort 26 Buildathon
      </footer>
    </div>
  );
}
