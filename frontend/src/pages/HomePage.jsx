import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Download, Users, ArrowRight, GraduationCap, Sparkles, ChevronRight } from 'lucide-react';
import SearchBar from '../components/SearchBar';

const UNIVERSITIES = [
  { code: 'TU', name: 'Tribhuvan University', color: 'bg-blue-600', desc: 'Nepal\'s largest & oldest university' },
  { code: 'PU', name: 'Pokhara University', color: 'bg-sky-600', desc: 'Leading technical university' },
  { code: 'KU', name: 'Kathmandu University', color: 'bg-indigo-600', desc: 'Excellence in engineering' },
  { code: 'PoU', name: 'Purbanchal University', color: 'bg-cyan-600', desc: 'Eastern Nepal\'s premier institution' },
];

const STATS = [
  { label: 'Past Papers', value: '2,000+', icon: BookOpen },
  { label: 'Universities', value: '4', icon: GraduationCap },
  { label: 'Downloads', value: '50K+', icon: Download },
  { label: 'Students Helped', value: '10K+', icon: Users },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', university_id: '', department_id: '', semester: '', year: '' });
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/papers?${params.toString()}`);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-500/8 rounded-full blur-3xl animate-pulse-slow delay-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(147,197,253,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className={`text-center transition-all duration-700 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm font-medium mb-8 backdrop-blur-sm">
              <Sparkles size={14} className="text-sky-400" />
              Nepal's #1 Engineering Past Papers Resource
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
              Ace Your
              <span className="block mt-1" style={{ background: 'linear-gradient(135deg, #60a5fa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                IOE Exams
              </span>
            </h1>

            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Access past year question papers from TU, PU, KU & PoU — organized by university, semester, and department for smarter exam preparation.
            </p>

            {/* Search Box */}
            <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl" onKeyDown={handleKeyDown}>
              <SearchBar filters={filters} onChange={setFilters} />
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                >
                  <Search size={16} />
                  Search Papers
                </button>
                <button
                  onClick={() => navigate('/papers')}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl border border-white/20 transition-all"
                >
                  Browse All
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 transition-all duration-700 delay-300 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/8 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/30 transition-colors">
                  <Icon size={18} className="text-blue-300" />
                </div>
                <div className="font-display font-bold text-2xl text-white">{value}</div>
                <div className="text-slate-400 text-sm mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
              Browse by University
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Select your university to find relevant past papers for your course
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {UNIVERSITIES.map(({ code, name, color, desc }, i) => (
              <button
                key={code}
                onClick={() => navigate(`/papers?uni=${code}`)}
                className="group text-left p-6 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-card-hover transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <span className="text-white font-display font-bold text-sm">{code}</span>
                </div>
                <h3 className="font-display font-semibold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">{name}</h3>
                <p className="text-sm text-slate-500 mb-3">{desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:gap-2 transition-all">
                  View papers <ChevronRight size={13} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How to use section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-sky-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 text-lg">Find and access your study materials in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose University', desc: 'Select from TU, PU, KU, or PoU to narrow your search to the right institution.', icon: GraduationCap },
              { step: '02', title: 'Filter Papers', desc: 'Filter by department, semester, and year to find the exact papers you need.', icon: Search },
              { step: '03', title: 'Download & Study', desc: 'Preview papers inline or download them as PDFs for offline exam preparation.', icon: Download },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative text-center bg-white rounded-2xl p-7 shadow-card border border-white">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold font-mono shadow-md">
                  {step}
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mt-2 mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-blue-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-4">Ready to start studying?</h2>
          <p className="text-blue-200 text-lg mb-8">Browse thousands of past papers — completely free, no signup required.</p>
          <button
            onClick={() => navigate('/papers')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Browse All Papers
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap size={15} className="text-white" />
            </div>
            <span className="font-display font-semibold text-white">IOE Papers</span>
          </div>
          <p className="text-sm text-center">© {new Date().getFullYear()} IOE Papers. For educational use only.</p>
          <p className="text-xs text-slate-600">Built for engineering students of Nepal</p>
        </div>
      </footer>
    </div>
  );
}
