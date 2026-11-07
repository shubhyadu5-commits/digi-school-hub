import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  
  // States ALL Menu, Notifications aur Info Popup ke liye
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<'features' | 'privacy' | 'support' | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';

  // Mock Global Notifications
  const globalNotifications = userEmail === 'shubhyadu5@gmail.com' ? [
    { id: 1, title: '⚡ Action Required', desc: 'Delhi Public School applied for listing.', time: '10 mins ago', type: 'admin' },
    { id: 2, title: '🚀 System Update', desc: 'Digi Saraswati Live Core v2.0 deployed successfully.', time: '2 hours ago', type: 'system' }
  ] : [
    { id: 1, title: '👋 Welcome to Digi Saraswati!', desc: 'Explore the largest digital campus directory.', time: '1 day ago', type: 'system' }
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email || null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user?.email || null));
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('campus_active_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveRole(parsed.role || null);
      } catch {
        setActiveRole(null);
      }
    } else {
      setActiveRole(null);
    }
    setDropdownOpen(false);
    setIsSidebarOpen(false);
    setIsNotificationOpen(false);
    setInfoModalContent(null);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false);
      if (langRef.current && !langRef.current.contains(event.target as Node)) setLangDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotificationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scroll when sidebar or modal is open
  useEffect(() => {
    if (isSidebarOpen || infoModalContent !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isSidebarOpen, infoModalContent]);

  const getFirstNameFromEmail = (email: string | null) => {
    if (!email) return 'User';
    const localPart = email.split('@')[0];
    const firstWord = localPart.split(/[._0-9-]/)[0] || localPart;
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  };

  const triggerTranslation = (langCode: string) => {
    if (!document.getElementById('google_translate_script')) {
      const script = document.createElement('script');
      script.id = 'google_translate_script';
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en', includedLanguages: 'hi,en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false
        }, 'google_translate_element');
      };
      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) { select.value = langCode; select.dispatchEvent(new Event('change')); }
      }, 1000);
    } else {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) { select.value = langCode; select.dispatchEvent(new Event('change')); }
    }
    setLangDropdownOpen(false);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* ========================================================= */}
      {/* INFO POPUP MODAL (Detailed Scrollable Content)            */}
      {/* ========================================================= */}
      {infoModalContent && (
        <div className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                {infoModalContent === 'features' && <><span className="text-amber-600">🚀</span> Core Features</>}
                {infoModalContent === 'privacy' && <><span className="text-indigo-600">🛡️</span> Data Privacy & Security</>}
                {infoModalContent === 'support' && <><span className="text-emerald-600">☎️</span> Help & Support</>}
              </h3>
              <button onClick={() => setInfoModalContent(null)} className="text-slate-500 hover:text-slate-900 transition p-1.5 bg-white rounded-full shadow-sm hover:shadow-md border border-slate-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto text-slate-700 text-sm leading-relaxed space-y-6">
              
              {/* FEATURE DETAILS */}
              {infoModalContent === 'features' && (
                <>
                  <p className="text-base font-semibold text-slate-900">Digi Saraswati Live is a next-generation Collective Digital Campus Directory and Academic ERP platform designed to seamlessly connect institutes, faculty, and students.</p>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 border-l-4 border-amber-500 pl-3">🏫 Aggregated Institute Network</h4>
                    <p className="pl-4">A unified portal where multiple schools and colleges can register, creating a massive digital directory. Users can search for any campus globally and access their specific portals instantly.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 border-l-4 border-amber-500 pl-3">⏱️ Real-Time Smart Attendance</h4>
                    <p className="pl-4">Faculty can mark period-wise attendance on the go via mobile or desktop. Data synchronizes instantly with the master database, ensuring complete transparency for students and administration.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 border-l-4 border-amber-500 pl-3">📊 Automated Academic Analytics</h4>
                    <p className="pl-4">Streamlined evaluation system capable of generating instant 6-subject marksheets. The system automatically calculates percentages, aggregates grades, and determines class ranks with zero manual error.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 border-l-4 border-amber-500 pl-3">🔐 Role-Based Architecture</h4>
                    <p className="pl-4">Three distinct, secure dashboard experiences customized for Super Admins (Platform Owners), Institute Admins, Faculty members, and Students.</p>
                  </div>
                </>
              )}

              {/* PRIVACY DETAILS */}
              {infoModalContent === 'privacy' && (
                <>
                  <p className="text-base font-semibold text-slate-900">At Digi Saraswati Live, safeguarding institutional and student data is our highest priority. Our architecture ensures enterprise-grade security at every layer.</p>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 border-l-4 border-indigo-500 pl-3">End-to-End Encryption</h4>
                    <p className="pl-4">All data transmitted between your device and our servers is protected using industry-standard SSL/TLS encryption. Sensitive credentials, including passwords, are hashed and never stored in plain text.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 border-l-4 border-indigo-500 pl-3">Row Level Security (RLS)</h4>
                    <p className="pl-4">Powered by Supabase and PostgreSQL, our database employs strict Row Level Security policies. This guarantees that students can only view their own academic records, and faculty can only modify data for their assigned classes.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 border-l-4 border-indigo-500 pl-3">Isolated Campus Data</h4>
                    <p className="pl-4">Despite being a collective directory, data from different institutes is strictly isolated. Administrative staff from one college cannot access or interact with the database of another college under any circumstances.</p>
                  </div>
                </>
              )}

              {/* SUPPORT DETAILS */}
              {infoModalContent === 'support' && (
                <>
                  <p className="text-base font-semibold text-slate-900">We are committed to providing exceptional support to ensure a smooth digital transition for your campus.</p>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-2">Campus Onboarding & Registration</h4>
                    <p className="mb-3">If you are an institute director or principal looking to list your school on Digi Saraswati Live, our onboarding team is ready to assist you with database setup and faculty training.</p>
                    <a href="mailto:support.digisaraswati@gmail.com" className="text-amber-600 font-bold hover:underline flex items-center gap-1">Contact Onboarding Team <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-4">
                    <h4 className="font-bold text-slate-900 mb-2">Technical Support</h4>
                    <p className="mb-3">Encountering an issue with attendance syncing, marksheet generation, or account recovery? Please reach out to your respective Institute Admin first. For platform-wide bugs, contact our technical desk.</p>
                    <p className="font-medium text-slate-800">Support Email: <span className="text-indigo-600 font-bold ml-1">support.Digi Saraswati@gmail.com</span></p>
                  </div>
                </>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-right">
              <button 
                onClick={() => setInfoModalContent(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-8 py-2.5 rounded-lg transition shadow-md hover:shadow-lg"
              >
                Close & Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GLOBAL SIDEBAR DRAWER ("ALL" Menu)                        */}
      {/* ========================================================= */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-white z-[110] transform transition-transform duration-300 shadow-2xl flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="bg-[#131921] px-6 py-5 flex items-center justify-between">
           <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-amber-600 font-bold flex items-center justify-center shadow-md">
                {userEmail ? getFirstNameFromEmail(userEmail)[0] : 'S'}
              </div>
              <div>
                 <p className="text-sm font-bold">Hello, {userEmail ? getFirstNameFromEmail(userEmail) : 'Guest'}</p>
                 <p className="text-[10px] text-slate-300">Welcome to Digi Saraswati</p>
              </div>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white transition p-1">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
         </div>

         <div className="flex-1 overflow-y-auto py-4">
            <div className="px-6 pb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Global Directory</h3>
              <ul className="space-y-1">
                 <li><button onClick={() => { setIsSidebarOpen(false); navigate('/onboarding'); }} className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition flex items-center gap-3"><span>🏫</span> Browse Institutes</button></li>
                 <li><button onClick={() => { setIsSidebarOpen(false); navigate('/onboarding'); }} className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition flex items-center gap-3"><span>➕</span> Register New Campus</button></li>
              </ul>
            </div>
            
            <hr className="border-slate-100 my-2" />

            <div className="px-6 py-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Platform Information</h3>
              <ul className="space-y-1">
                 <li>
                   {/* Ye button ab infoModalContent ko 'features' par set karega jisse popup khulega */}
                   <button onClick={() => { setIsSidebarOpen(false); setInfoModalContent('features'); }} className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition flex items-center gap-3">
                     <span>🚀</span> Core Features
                   </button>
                 </li>
                 <li>
                   {/* Ye button ab infoModalContent ko 'privacy' par set karega */}
                   <button onClick={() => { setIsSidebarOpen(false); setInfoModalContent('privacy'); }} className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition flex items-center gap-3">
                     <span>🛡️</span> Data Privacy & Security
                   </button>
                 </li>
                 <li>
                   {/* Ye button ab infoModalContent ko 'support' par set karega */}
                   <button onClick={() => { setIsSidebarOpen(false); setInfoModalContent('support'); }} className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition flex items-center gap-3">
                     <span>☎️</span> Help & Support
                   </button>
                 </li>
              </ul>
            </div>
         </div>
      </div>


      {/* ========================================================= */}
      {/* TIER 1: MAIN HEADER BANDS                                 */}
      {/* ========================================================= */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isHome ? 'bg-black/40 backdrop-blur-md text-white border-b border-white/10' : 'bg-[#131921] text-white shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 md:gap-6">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
      <img 
  src="/favicon.svg" 
  alt="Digi Saraswati Logo" 
  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain"
/>
            <span className="text-lg font-black tracking-tight hidden sm:block">
              Digi Saraswati <span className="text-amber-500">Live</span>
            </span>
          </Link>

          {userEmail && isDashboard && (
            <div className="hidden lg:flex items-center gap-1 cursor-pointer hover:border-white border border-transparent p-1 rounded transition mr-auto">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-slate-300">Viewing Campus</span>
                <span className="text-xs font-bold font-sans">Active Portal</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto">
            <div className="relative" ref={langRef}>
              <button onClick={() => setLangDropdownOpen(!langDropdownOpen)} className="flex items-center gap-1 hover:border-white border border-transparent p-1.5 rounded transition">
                <span className="text-lg">🇮🇳</span>
                <span className="text-xs font-bold hidden sm:block text-slate-100">EN</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-xl border border-slate-200 py-1 text-slate-800 z-50">
                  <button onClick={() => triggerTranslation('en')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-100">🇺🇸 English</button>
                  <button onClick={() => triggerTranslation('hi')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-100">🇮🇳 हिन्दी (Hindi)</button>
                </div>
              )}
            </div>

            {userEmail ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex flex-col leading-tight hover:border-white border border-transparent p-1 rounded transition text-left">
                  <span className="text-[10px] text-slate-300">Hello, {getFirstNameFromEmail(userEmail)}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold font-sans">Account & Roles</span>
                    <span className="text-[10px] text-slate-400">▼</span>
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-base font-extrabold text-slate-900">{getFirstNameFromEmail(userEmail)}</p>
                      <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                      {activeRole && isDashboard && (
                        <span className="mt-1 inline-block bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{activeRole} Mode</span>
                      )}
                    </div>
                    
                    <div className="py-2 px-2 space-y-1">
                      {userEmail === 'shubhyadu5@gmail.com' && (
                        <button onClick={() => { setDropdownOpen(false); navigate('/super-admin'); }} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition flex items-center gap-2">
                           <span>⚡</span> Super Admin Panel
                        </button>
                      )}
                      
                      {isDashboard && (
                        <button onClick={() => { setDropdownOpen(false); navigate('/onboarding'); }} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition flex items-center gap-2">
                          <span>🌍</span> Exit to Global Directory
                        </button>
                      )}

                      {!isDashboard && (
                         <>
                            <button onClick={() => { setDropdownOpen(false); navigate('/onboarding'); }} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2">
                               <span>🔍</span> Search Institutes
                            </button>
                            <button onClick={() => { setDropdownOpen(false); navigate('/onboarding'); }} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2">
                               <span>➕</span> Register New Campus
                            </button>
                         </>
                      )}
                      
                      <button onClick={() => { setDropdownOpen(false); alert('Global Settings feature coming soon!'); }} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2">
                         <span>⚙️</span> Account Settings
                      </button>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-2">
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="text-xs font-bold hover:underline">Sign In</button>
            )}

            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)} 
                className={`flex items-center cursor-pointer hover:border-white border p-1 rounded transition ${isNotificationOpen ? 'border-white bg-white/10' : 'border-transparent'}`}
              >
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                 <span className="absolute -top-1 -right-1 bg-[#f3a847] text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">{globalNotifications.length}</span>
              </button>
              
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden">
                   <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900">Global Alerts</h4>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">{globalNotifications.length} New</span>
                   </div>
                   <div className="max-h-80 overflow-y-auto">
                     {globalNotifications.map((notif) => (
                       <div key={notif.id} className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                          <h5 className="text-xs font-bold text-slate-900 mb-0.5">{notif.title}</h5>
                          <p className="text-xs text-slate-600 leading-tight">{notif.desc}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                       </div>
                     ))}
                   </div>
                   <div className="px-4 py-2 text-center border-t border-slate-100 bg-slate-50">
                      <button onClick={() => setIsNotificationOpen(false)} className="text-xs font-bold text-indigo-600 hover:underline">Close</button>
                   </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* TIER 2: AMAZON-STYLE SUB-NAV                              */}
        {/* ========================================================= */}
        <div className={`flex items-center gap-4 px-4 py-1.5 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar border-t ${
          isHome ? 'bg-black/30 text-slate-200 border-white/10' : 'bg-[#232f3e] text-slate-300 border-slate-700'
        }`}>
          <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-1 hover:text-white shrink-0 cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            All
          </button>
          {!isDashboard && (
            <>
              <Link to="/" className="hover:text-white shrink-0">Overview</Link>
              <Link to="/onboarding" className="hover:text-white shrink-0">Institute Directory</Link>
              {userEmail === 'shubhyadu5@gmail.com' && <Link to="/super-admin" className="text-amber-400 hover:text-amber-300 shrink-0">⚡ Approvals</Link>}
            </>
          )}
          {isDashboard && activeRole === 'student' && (
            <>
              <button onClick={() => navigate('/dashboard?tab=profile')} className={`shrink-0 hover:text-white ${currentTab === 'profile' || currentTab === 'overview' ? 'text-white border-b-2 border-amber-500 pb-0.5' : ''}`}>Profile</button>
              <button onClick={() => navigate('/dashboard?tab=attendance')} className={`shrink-0 hover:text-white ${currentTab === 'attendance' ? 'text-white border-b-2 border-amber-500 pb-0.5' : ''}`}>Attendance History</button>
              <button onClick={() => navigate('/dashboard?tab=results')} className={`shrink-0 hover:text-white ${currentTab === 'results' ? 'text-white border-b-2 border-amber-500 pb-0.5' : ''}`}>Results</button>
            </>
          )}
          {isDashboard && activeRole === 'teacher' && (
            <>
              <button onClick={() => navigate('/dashboard?tab=attendance')} className={`shrink-0 hover:text-white ${currentTab === 'attendance' || currentTab === 'overview' ? 'text-white border-b-2 border-amber-500 pb-0.5' : ''}`}>Class & Attendance</button>
              <button onClick={() => navigate('/dashboard?tab=results')} className={`shrink-0 hover:text-white ${currentTab === 'results' ? 'text-white border-b-2 border-amber-500 pb-0.5' : ''}`}>Upload Marksheets</button>
              <button onClick={() => navigate('/dashboard?tab=profile')} className={`shrink-0 hover:text-white ${currentTab === 'profile' ? 'text-white border-b-2 border-amber-500 pb-0.5' : ''}`}>My Profile</button>
            </>
          )}
          {isDashboard && activeRole === 'admin' && (
            <>
              <button onClick={() => navigate('/dashboard?tab=students')} className={`shrink-0 hover:text-white ${currentTab === 'students' || currentTab === 'overview' ? 'text-white border-b-2 border-amber-500 pb-0.5' : ''}`}>Manage Students</button>
              <button onClick={() => navigate('/dashboard?tab=teachers')} className={`shrink-0 hover:text-white ${currentTab === 'teachers' ? 'text-white border-b-2 border-amber-500 pb-0.5' : ''}`}>Time-Table & Staff</button>
              <button onClick={() => navigate('/dashboard?tab=results')} className={`shrink-0 hover:text-white ${currentTab === 'results' ? 'text-white border-b-2 border-amber-500 pb-0.5' : ''}`}>Publish Results</button>
              <button onClick={() => navigate('/dashboard?tab=notices')} className={`shrink-0 hover:text-white ${currentTab === 'notices' ? 'text-white border-b-2 border-amber-500 pb-0.5' : ''}`}>Announcements</button>
            </>
          )}
        </div>
      </header>

      <div className={`w-full ${isHome ? 'h-0' : 'h-24 sm:h-24'}`}></div>
    </>
  );
}