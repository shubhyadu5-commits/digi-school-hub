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
    <div className="min-h-screen bg-white font-sans">
      
      {/* 1. FULL-SCREEN HERO SECTION (Image Background) */}
      <div className="relative w-full h-[85vh] flex flex-col items-center justify-center text-center overflow-hidden">
        
        {/* Background Image Setup */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2000&auto=format&fit=crop')` 
          }}
        >
          {/* Dark Overlay so text is readable */}
          <div className="absolute inset-0 bg-slate-900/60"></div>
        </div>

        {/* Hero Content (Centered) */}
        <div className="relative z-10 px-4 w-full max-w-4xl">
          <div className="inline-flex flex-col items-center mb-8">
             <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white mb-4 rotate-45 flex items-center justify-center shadow-2xl">
                <span className="text-white font-black text-2xl -rotate-45">S</span>
             </div>
             <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight uppercase drop-shadow-lg">
               Digital <br/> Campus
             </h1>
          </div>
          
          <p className="text-slate-200 text-sm sm:text-lg font-medium mb-10 max-w-2xl mx-auto drop-shadow-md">
            The complete academic management campaign is now live. Mark attendance, check results, and connect seamlessly.
          </p>

          {/* Search Bar - Prominent in the center */}
          <form 
            onSubmit={handleHeroSearch}
            className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-1.5 pl-6 rounded-full shadow-2xl border border-white/30 flex items-center justify-between focus-within:bg-white/20 transition-all"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college name or university..."
              className="w-full bg-transparent text-white placeholder-slate-300 text-sm sm:text-base focus:outline-none font-medium"
            />
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-8 py-3.5 rounded-full flex items-center gap-2 shrink-0 shadow-md transition"
            >
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-white/70">
            <span className="text-xs uppercase tracking-widest font-bold mb-2">Explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      {/* 2. IITK-STYLE GRID SECTION (Platform Highlights + Featured Modules) */}
      <div className="bg-[#f4f2f0] border-t-8 border-amber-700 pb-16">
        
        {/* Top Strip over the grid (Optional, matching the UI vibe) */}
        <div className="h-4 bg-amber-700 w-full mb-8"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Core Platform Highlights (Replaced fake statistics) */}
            <div className="bg-[#efedeb] p-8 border border-slate-200 row-span-2">
              <h2 className="text-xl font-bold text-slate-800 mb-8">Platform Highlights</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                <div className="border-b border-slate-300 pb-3">
                  <div className="text-3xl mb-2">⏱️</div>
                  <p className="text-sm font-bold text-amber-700 mb-1">Real-Time</p>
                  <p className="text-xs font-medium text-slate-600 leading-tight">Instant updates for<br/>attendance & marks</p>
                </div>
                <div className="border-b border-slate-300 pb-3">
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="text-sm font-bold text-amber-700 mb-1">Role-Based</p>
                  <p className="text-xs font-medium text-slate-600 leading-tight">Secure access for<br/>Admins, Faculty & Students</p>
                </div>
                <div className="border-b border-slate-300 pb-3">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm font-bold text-amber-700 mb-1">Analytics</p>
                  <p className="text-xs font-medium text-slate-600 leading-tight">Auto-calculated<br/>percentages & ranks</p>
                </div>
                <div className="border-b border-slate-300 pb-3">
                  <div className="text-3xl mb-2">📱</div>
                  <p className="text-sm font-bold text-amber-700 mb-1">Responsive</p>
                  <p className="text-xs font-medium text-slate-600 leading-tight">Access anywhere<br/>on any device</p>
                </div>
              </div>
            </div>

            {/* Box 2: Featured Text Card */}
            <div className="bg-white p-8 border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Featured</h3>
                <h2 className="text-lg font-bold text-amber-700 mb-4 border-b border-slate-800 pb-2 flex justify-between items-center">
                  Digital Campus Network
                  <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  SchoolWeave Live has been at the forefront of digital management in education. The diverse roles of Admins, Faculty, and Students span across attendance, marksheets, and real-time connectivity, ensuring a holistic approach to academic tracking.
                </p>
              </div>
              <button 
                onClick={() => navigate('/onboarding')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm px-6 py-2.5 flex items-center justify-between w-fit gap-3 transition"
              >
                Find an Institute
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>

            {/* Box 3: Image Card 1 */}
            <div className="relative h-64 md:h-auto group overflow-hidden bg-slate-900 border border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop" 
                alt="Students" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                 <span className="bg-amber-700 text-white text-[10px] font-bold px-2 py-1 mb-2 w-fit">Academic Reports</span>
                 <div className="flex justify-between items-end">
                   <h3 className="text-white text-sm font-bold w-2/3 leading-tight">Instant 6-Subject Marksheets and Grading...</h3>
                   <span className="text-white text-xs flex items-center gap-1 cursor-pointer hover:text-amber-400">Learn More <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></span>
                 </div>
              </div>
            </div>

            {/* Box 4: Image Card 2 (Spans 2 columns on desktop) */}
            <div className="relative h-64 md:col-span-2 group overflow-hidden bg-slate-900 border border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop" 
                alt="Campus" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                 <span className="bg-amber-700 text-white text-[10px] font-bold px-2 py-1 mb-2 w-fit">Live Tracking</span>
                 <div className="flex justify-between items-end">
                   <h3 className="text-white text-sm font-bold w-1/2 leading-tight">Live Date-wise Period Attendance for Students...</h3>
                   <span className="text-white text-xs flex items-center gap-1 cursor-pointer hover:text-amber-400">Learn More <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></span>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}