import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const cities = ['Mumbai', 'Bangalore', 'Hyderabad', 'Delhi', 'Pune', 'Chennai'];

const features = [
  { icon: '🔍', title: 'Smart Search', desc: 'Filter by location, budget, move-in date and property type to find your perfect home.' },
  { icon: '📅', title: 'Visit Scheduling', desc: 'Request property visits and track status in real-time — Requested → Scheduled → Visited.' },
  { icon: '📋', title: 'Move-in Checklist', desc: 'Upload documents, confirm agreement, and manage inventory list digitally.' },
  { icon: '⚖️', title: 'Compare Properties', desc: 'Shortlist favorites and compare up to 3 properties side-by-side instantly.' },
  { icon: '🎫', title: 'Support Tickets', desc: 'Raise issues anytime. Get threaded replies from our support team.' },
  { icon: '🛡️', title: 'Admin Control', desc: 'Structured workflows for listing management, visits, and tenant operations.' },
];

const steps = [
  { step: '01', title: 'Browse & Filter', desc: 'Search properties by location, budget and move-in date.' },
  { step: '02', title: 'Visit the Property', desc: 'Request a visit and track your visit status in real-time.' },
  { step: '03', title: 'Move In', desc: 'Complete the digital checklist and confirm your agreement.' },
];

const testimonials = [
  { name: 'Rahul Sharma', city: 'Mumbai', text: 'Found my 2BHK in Bandra within 3 days. The visit scheduling was seamless!', avatar: 'RS' },
  { name: 'Priya Patel', city: 'Bangalore', text: 'The move-in checklist saved so much hassle. Everything digital and organized.', avatar: 'PP' },
  { name: 'Arjun Mehta', city: 'Hyderabad', text: 'Compared 3 properties side-by-side and made a confident decision in minutes.', avatar: 'AM' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900">
        {/* subtle grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#ffffff22 1px,transparent 1px),linear-gradient(90deg,#ffffff22 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-28 text-center">
          <span className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            🏆 Cohort 26 Buildathon · Web Dev 2026
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Find Your Perfect<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Rental Home
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover properties, schedule visits, manage your move-in checklist — all in one beautifully simple platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse"
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
              Browse Properties →
            </Link>
            {!user && (
              <Link to="/register"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-2xl text-lg backdrop-blur-sm transition-all hover:scale-105">
                Create Free Account
              </Link>
            )}
          </div>

          {/* city pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-10">
            {cities.map((c) => (
              <Link key={c} to={`/browse?location=${c}`}
                className="text-xs text-blue-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full hover:bg-white/10 transition-colors">
                📍 {c}
              </Link>
            ))}
          </div>
        </div>

        {/* wave divider */}
        <div className="h-16 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ── STATS ── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '500+', label: 'Properties Listed', icon: '🏠' },
              { num: '200+', label: 'Happy Tenants', icon: '😊' },
              { num: '6', label: 'Cities Covered', icon: '🌆' },
              { num: '98%', label: 'Satisfaction Rate', icon: '⭐' },
            ].map((s) => (
              <div key={s.label} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-extrabold text-blue-700">{s.num}</div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">How RentEase Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-blue-200 z-0" />
            {steps.map((s) => (
              <div key={s.step} className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow z-10">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-extrabold mx-auto mb-4 shadow-lg shadow-blue-200">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Built for the Modern Renter</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white">
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">What Tenants Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 text-amber-400 mb-3">{'★★★★★'}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">📍 {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-700 to-blue-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to find your home?</h2>
          <p className="text-blue-200 mb-8 text-lg">Join thousands of happy tenants who found their perfect rental on RentEase.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse"
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg">
              Browse All Properties →
            </Link>
            {!user && (
              <Link to="/register"
                className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-all">
                Sign Up Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-gray-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="text-white font-bold text-lg">RentEase</span>
          </div>
          <p className="text-sm text-center">© 2026 RentEase · Built for Cohort 26 Buildathon · Web Dev</p>
          <div className="flex gap-6 text-sm">
            <Link to="/browse" className="hover:text-white transition-colors">Browse</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
