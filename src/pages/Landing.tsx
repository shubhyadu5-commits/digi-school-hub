import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const slideData = [
  {
    bg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2000&auto=format&fit=crop', 
    title: <>Digital <br/> Campus</>,
    desc: 'The complete academic management campaign is now live. Mark attendance, check results, and connect seamlessly.'
  },
  {
    bg: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2000&auto=format&fit=crop', 
    title: <>Smart <br/> Ecosystem</>,
    desc: 'Watch students step into a fully digital era. Smart tracking, instant campus updates, and a paperless environment.'
  },
  {
    bg: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2000&auto=format&fit=crop', 
    title: <>Live <br/> Attendance</>,
    desc: 'Faculty can mark period-wise attendance on the go. Instant syncing with the master database ensures absolute transparency.'
  },
  {
    bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop',  
    title: <>Academic <br/> Excellence</>,
    desc: 'Automated 6-subject marksheets, rank generation, and secure cloud records. Elevating institutional performance daily.'
  }
];

const extendedSlides = [...slideData, slideData[0]];

export default function Landing() {
  const navigate = useNavigate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Seamless Loop Logic
  useEffect(() => {
    if (currentIndex === slideData.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false); 
        setCurrentIndex(0);        
      }, 1000); 
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* 1. FULL-SCREEN HERO SECTION */}
      <div className="relative w-full h-[85vh] flex flex-col items-center justify-center text-center overflow-hidden">
        
        {/* Sliding Background Track */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div 
            className={`flex w-full h-full ${isTransitioning ? 'transition-transform duration-1000 ease-in-out' : ''}`}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {extendedSlides.map((slide, index) => (
              <div key={index} className="w-full h-full shrink-0 relative flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${slide.bg}')` }} />
                <div className="absolute inset-0 bg-slate-900/60 z-10" />
                
                {/* Sliding Text Content */}
                <div className="relative z-20 px-4 w-full max-w-4xl pb-32">
                  <div className="inline-flex flex-col items-center mb-6">
                     <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white mb-4 rotate-45 flex items-center justify-center shadow-2xl">
                        <span className="text-white font-black text-2xl -rotate-45">S</span>
                     </div>
                     <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight uppercase drop-shadow-lg text-center">
                       {slide.title}
                     </h1>
                  </div>
                  <p className="text-slate-200 text-sm sm:text-lg font-medium max-w-2xl mx-auto drop-shadow-md text-center px-2">
                    {slide.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clean Call to Action Button */}
        <div className="absolute bottom-28 left-0 w-full z-30 px-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-white text-sm sm:text-base font-semibold drop-shadow-md bg-black/30 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
              For institute or university search click here
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-base sm:text-lg px-10 py-4 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(217,119,6,0.4)] transition hover:scale-105"
            >
              <span>Go to Search</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-white/70 z-30">
            <span className="text-xs uppercase tracking-widest font-bold mb-2">Explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      {/* 2. IITK-STYLE GRID SECTION */}
      <div className="bg-[#f4f2f0] border-t-8 border-amber-700 pb-16 relative z-30">
        <div className="h-4 bg-amber-700 w-full mb-8"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
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

            <div className="relative h-64 md:h-auto group overflow-hidden bg-slate-900 border border-slate-200">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop" alt="Students" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                 <span className="bg-amber-700 text-white text-[10px] font-bold px-2 py-1 mb-2 w-fit">Academic Reports</span>
                 <div className="flex justify-between items-end">
                   <h3 className="text-white text-sm font-bold w-2/3 leading-tight">Instant 6-Subject Marksheets and Grading...</h3>
                   <span className="text-white text-xs flex items-center gap-1 cursor-pointer hover:text-amber-400">Learn More <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></span>
                 </div>
              </div>
            </div>

            <div className="relative h-64 md:col-span-2 group overflow-hidden bg-slate-900 border border-slate-200">
              <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop" alt="Campus" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700" />
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