import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/onboarding');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#eef4fb] p-4 sm:p-6 md:p-8">
      
      {/* Main Outer Container like Wix Frame */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-100">
        
        {/* Sub-Header Bar inside the Frame */}
        <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-slate-100 px-2 text-xs sm:text-sm">
          <span className="font-bold text-slate-800 tracking-tight">SchoolWeave Live ERP</span>
          <div className="hidden md:flex items-center gap-6 text-slate-500 font-medium">
            <span onClick={() => navigate('/onboarding')} className="cursor-pointer hover:text-blue-600">Search Institutes</span>
            <span onClick={() => navigate('/onboarding')} className="cursor-pointer hover:text-blue-600">Register College</span>
            <span onClick={() => navigate('/dashboard')} className="cursor-pointer hover:text-blue-600">Live Attendance</span>
            <span onClick={() => navigate('/dashboard')} className="cursor-pointer hover:text-blue-600">Student Portal</span>
          </div>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded-full transition"
          >
            Launch Portal
          </button>
        </div>

        {/* WIX-STYLE 3-COLUMN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT COLUMN (2 Stacked Cards) */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Top Left Visual Card */}
            <div className="relative flex-1 rounded-3xl overflow-hidden shadow-sm group min-h-[210px] bg-teal-900">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=700&q=80"
                alt="University Graduates"
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full w-fit font-bold mb-2">
                  Verified Portals
                </span>
                <p className="font-extrabold text-lg leading-snug">One Platform for Every University</p>
              </div>
            </div>

            {/* Bottom Left Pastel Purple Card (Like www.culitina.com card in Wix) */}
            <div className="flex-1 rounded-3xl bg-gradient-to-b from-purple-100 via-indigo-50 to-purple-100/70 p-6 flex flex-col items-center justify-center text-center border border-purple-200/60 shadow-inner min-h-[200px]">
              <p className="text-xs font-bold text-purple-400 mb-2 tracking-widest uppercase">campus.edu.in</p>
              <div className="bg-white px-5 py-2.5 rounded-full shadow-md border border-purple-100 font-bold text-slate-800 text-sm mb-2">
                🔒 Role-Based ERP
              </div>
              <p className="text-xs text-purple-500 font-medium">Admin • Faculty • Student</p>
            </div>
          </div>

          {/* CENTER HERO CARD (Soft Sky Blue Gradient like Wix "Buy your perfect domain name") */}
          <div className="lg:col-span-6 rounded-3xl bg-gradient-to-b from-[#e3effd] via-[#cbe2fc] to-[#b3d4ff] p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-inner border border-blue-200/60 min-h-[440px]">
            <span className="bg-white/80 backdrop-blur-xs text-blue-700 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs mb-5">
              🚀 WELCOME TO SCHOOLWEAVE LIVE
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-950 tracking-tight leading-[1.1] mb-5">
              Find your digital <br className="hidden sm:block" /> campus portal
            </h1>

            <p className="text-slate-700 text-xs sm:text-sm max-w-md mb-8 leading-relaxed font-medium">
              Get online confidently with role-based Admin controls, live date-wise lecture attendance (P/A), and verified student academic records.
            </p>

            {/* WIX STYLE PILL SEARCH BAR */}
            <form 
              onSubmit={handleHeroSearch}
              className="w-full max-w-lg bg-white p-1.5 pl-5 rounded-full shadow-lg border border-blue-200 flex items-center justify-between focus-within:ring-4 focus-within:ring-blue-400/30 transition"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type the college or institute name..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-full flex items-center gap-2 shrink-0 shadow-md transition"
              >
                <span>Search</span>
                <span>→</span>
              </button>
            </form>

            {/* Quick Role Badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 text-xs font-semibold text-slate-700">
              <span className="bg-white/60 px-3 py-1 rounded-full">✓ Instant College Approval</span>
              <span className="bg-white/60 px-3 py-1 rounded-full">✓ 6-Lecture Live Attendance</span>
              <span className="bg-white/60 px-3 py-1 rounded-full">✓ Co-Admin Moderators</span>
            </div>
          </div>

          {/* RIGHT COLUMN (Tall Portrait Card like Wix Right Image) */}
          <div className="lg:col-span-3 rounded-3xl overflow-hidden relative shadow-sm group min-h-[380px] bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
              alt="Happy Campus Students"
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/20 to-transparent p-6 flex flex-col justify-between text-white">
              <div className="flex justify-end">
                <span className="bg-emerald-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md">
                  ● Live ERP
                </span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-blue-200 font-bold mb-1">
                  For Students & Faculty
                </p>
                <h3 className="text-xl font-extrabold leading-tight mb-3">
                  Real-time Attendance & Academic Reports
                </h3>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="w-full bg-white text-blue-950 hover:bg-blue-50 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition"
                >
                  Explore Approved Campuses →
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}