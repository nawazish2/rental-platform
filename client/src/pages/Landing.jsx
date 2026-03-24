import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';

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
  { step: '01', title: 'Browse & Filter', desc: 'Search properties by location, budget and move-in date.', icon: '🔍' },
  { step: '02', title: 'Visit the Property', desc: 'Request a visit and track your visit status in real-time.', icon: '📅' },
  { step: '03', title: 'Move In', desc: 'Complete the digital checklist and confirm your agreement.', icon: '🏠' },
];

const testimonials = [
  { name: 'Rahul Sharma', city: 'Mumbai', text: 'Found my 2BHK in Bandra within 3 days. The visit scheduling was seamless!', avatar: 'RS', color: 'from-blue-500 to-blue-600' },
  { name: 'Priya Patel', city: 'Bangalore', text: 'The move-in checklist saved so much hassle. Everything digital and organized.', avatar: 'PP', color: 'from-violet-500 to-violet-600' },
  { name: 'Arjun Mehta', city: 'Hyderabad', text: 'Compared 3 properties side-by-side and made a confident decision in minutes.', avatar: 'AM', color: 'from-cyan-500 to-cyan-600' },
];

const STATS = [
  { end: 500, suffix: '+', label: 'Properties Listed', icon: '🏠' },
  { end: 200, suffix: '+', label: 'Happy Tenants', icon: '😊' },
  { end: 6, suffix: '', label: 'Cities Covered', icon: '🌆' },
  { end: 98, suffix: '%', label: 'Satisfaction Rate', icon: '⭐' },
];

// Animated counter hook
function useCounter(end, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

function StatCard({ end, suffix, label, icon, started }) {
  const count = useCounter(end, 1600, started);
  return (
    <div className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-4xl font-extrabold text-blue-700">{count}{suffix}</div>
      <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
    </div>
  );
}

// Scroll reveal hook
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function Landing() {
  const { user } = useAuth();
  const [statsRef, statsVisible] = useScrollReveal(0.2);
  const [featRef, featVisible] = useScrollReveal(0.1);
  const [stepsRef, stepsVisible] = useScrollReveal(0.15);
  const [testRef, testVisible] = useScrollReveal(0.1);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 min-h-[88vh] flex flex-col justify-center">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#ffffff22 1px,transparent 1px),linear-gradient(90deg,#ffffff22 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-28 text-center" style={{ animation: 'fadeInUp 0.8s ease both' }}>
          <span className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            🏆 6th Semester Project · Web Development 2026
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Find Your Perfect<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300"
              style={{ animation: 'shimmer 3s linear infinite', backgroundSize: '200%' }}>
              Rental Home
            </span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover properties, schedule visits, manage your move-in checklist — all in one beautifully simple platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse"
              className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-lg shadow-blue-500/40 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30">
              Browse Properties <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            {!user && (
              <Link to="/register"
                className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold px-10 py-4 rounded-2xl text-lg backdrop-blur-sm transition-all hover:scale-105">
                Create Free Account
              </Link>
            )}
          </div>

          {/* City pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-10">
            {cities.map((c, i) => (
              <Link key={c} to={`/browse?location=${c}`}
                className="text-xs text-blue-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/15 hover:border-white/20 hover:text-white transition-all"
                style={{ animation: `fadeInUp 0.5s ease ${0.1 * i}s both` }}>
                📍 {c}
              </Link>
            ))}
          </div>

          {/* Floating property type badges */}
          <div className="hidden md:flex justify-center gap-4 mt-8 flex-wrap">
            {['🏢 Apartments', '🏡 Villas', '🛏️ PG / Hostel', '🏘️ Shared Flats'].map((badge, i) => (
              <span key={badge}
                className="text-xs text-white/60 bg-white/5 border border-white/10 px-3 py-1 rounded-full"
                style={{ animation: `float ${2.5 + i * 0.3}s ease-in-out infinite alternate` }}>
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="h-16 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ── STATS ── */}
      <section className="bg-white py-16 px-6" ref={statsRef}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={s.label}
                style={{ opacity: statsVisible ? 1 : 0, transform: statsVisible ? 'none' : 'translateY(20px)', transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s` }}>
                <StatCard {...s} started={statsVisible} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-6" ref={stepsRef}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">How RentEase Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 z-0" />
            {steps.map((s, i) => (
              <div key={s.step}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300 z-10"
                style={{ opacity: stepsVisible ? 1 : 0, transform: stepsVisible ? 'none' : 'translateY(30px)', transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s, box-shadow 0.3s, transform 0.3s` }}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-4 shadow-lg shadow-blue-200">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Step {s.step}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 bg-white" ref={featRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Built for the Modern Renter</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white cursor-default"
                style={{ opacity: featVisible ? 1 : 0, transform: featVisible ? 'none' : 'translateY(30px)', transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s, box-shadow 0.3s, border-color 0.3s` }}>
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 group-hover:scale-110 rounded-xl flex items-center justify-center text-2xl mb-4 transition-all duration-300">
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
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white" ref={testRef}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">What Tenants Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ opacity: testVisible ? 1 : 0, transform: testVisible ? 'none' : 'translateY(30px)', transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s, box-shadow 0.3s` }}>
                <div className="flex items-center gap-0.5 text-amber-400 mb-3 text-lg">{'★★★★★'}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md`}>
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
      <section className="py-24 px-6 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#ffffff22 1px,transparent 1px),linear-gradient(90deg,#ffffff22 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Ready to find your home?</h2>
          <p className="text-blue-200 mb-8 text-lg">Join thousands of happy tenants who found their perfect rental on RentEase.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse"
              className="bg-white text-blue-700 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg">
              Browse All Properties →
            </Link>
            {!user && (
              <Link to="/register"
                className="border-2 border-white/40 text-white font-bold px-10 py-4 rounded-2xl text-lg hover:bg-white/10 transition-all hover:scale-105">
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
          <p className="text-sm text-center">© 2026 RentEase · 6th Semester Web Development Project</p>
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
