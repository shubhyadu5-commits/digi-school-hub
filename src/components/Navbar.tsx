import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFirstNameFromEmail = (email: string | null) => {
    if (!email) return 'User';
    const localPart = email.split('@')[0];
    const firstWord = localPart.split(/[._0-9-]/)[0] || localPart;
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  };

  const handleResetPassword = async () => {
    setDropdownOpen(false);
    const newPassword = window.prompt('🔑 Enter your new account password (minimum 6 characters):');
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      alert('Error updating password: ' + error.message);
    } else {
      alert('✅ Your password has been reset successfully!');
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    localStorage.removeItem('campus_active_session');
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isDashboard = location.pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand "Digi School Hub" & Dynamic Role Navigation */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition">
              D
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Digi <span className="text-blue-600">School Hub</span>
            </span>
          </Link>

          {/* STUDENT NAVBAR TABS */}
          {isDashboard && activeRole === 'student' && (
            <nav className="flex items-center gap-1 sm:gap-2 border-l border-slate-200 pl-4 text-xs sm:text-sm font-bold">
              <button
                onClick={() => navigate('/dashboard?tab=profile')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'profile' || currentTab === 'overview'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=attendance')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'attendance'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📅 Attendance
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=results')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'results'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📊 Results
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=notices')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'notices'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📢 Announcements
              </button>
            </nav>
          )}

          {/* TEACHER NAVBAR TABS */}
          {isDashboard && activeRole === 'teacher' && (
            <nav className="flex items-center gap-1 sm:gap-2 border-l border-slate-200 pl-4 text-xs sm:text-sm font-bold">
              <button
                onClick={() => navigate('/dashboard?tab=attendance')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'attendance' || currentTab === 'overview'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🗓️ My Class Schedule & Attendance
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=results')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'results'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📊 Result Marksheet
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=profile')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'profile'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                👨‍🏫 Teacher Profile
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=notices')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'notices'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📢 Announcements
              </button>
            </nav>
          )}

          {/* ADMIN NAVBAR TABS */}
          {isDashboard && activeRole === 'admin' && (
            <nav className="flex items-center gap-1 sm:gap-2 border-l border-slate-200 pl-4 text-xs sm:text-sm font-bold">
              <button
                onClick={() => navigate('/dashboard?tab=students')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'students' || currentTab === 'overview'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🎓 Class-Wise Students
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=teachers')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'teachers'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                👨‍🏫 Teachers & Time-Table Sheet
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=results')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'results'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📊 Result Marksheet
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=security')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'security'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🔐 Admin Profile
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=notices')}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  currentTab === 'notices'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📢 Notices
              </button>
            </nav>
          )}

          {!isDashboard && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 border-l border-slate-200 pl-6">
              <Link to="/" className={`hover:text-blue-600 transition ${location.pathname === '/' ? 'text-blue-600 font-bold' : ''}`}>
                Overview
              </Link>
              <Link to="/onboarding" className={`hover:text-blue-600 transition ${location.pathname === '/onboarding' ? 'text-blue-600 font-bold' : ''}`}>
                Find Schools & Colleges
              </Link>
              <Link to="/dashboard" className={`hover:text-blue-600 transition ${location.pathname === '/dashboard' ? 'text-blue-600 font-bold' : ''}`}>
                ERP Portal
              </Link>
              {/* 🔥 YAHAN STRICT CHECK LAGAYA HAI 🔥 */}
              {userEmail === 'shubhyadu5@gmail.com' && (
                <Link to="/super-admin" className={`hover:text-amber-600 transition flex items-center gap-1 ${location.pathname === '/super-admin' ? 'text-amber-600 font-bold' : ''}`}>
                  <span>⚡</span> Approvals
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right: Clickable User Profile Logo with Dropdown */}
        <div className="flex items-center gap-3 shrink-0" ref={dropdownRef}>
          {userEmail ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-200 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-950 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {getFirstNameFromEmail(userEmail)[0]}
                </div>
                <span className="hidden sm:inline text-xs font-extrabold text-slate-800">
                  {getFirstNameFromEmail(userEmail)}
                </span>
                <span className="text-[10px] text-slate-500">▼</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Signed in as</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      {getFirstNameFromEmail(userEmail)}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
                  </div>

                  <div className="py-1.5 px-2 space-y-1">
                    {/* 🔥 DROPDOWN ME BHI SUPER ADMIN BUTTON SIRF AAPKE LIYE 🔥 */}
                    {userEmail === 'shubhyadu5@gmail.com' && (
                      <button
                        onClick={() => { setDropdownOpen(false); navigate('/super-admin'); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-2.5 transition"
                      >
                        <span>⚡</span> Super Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/dashboard?tab=profile'); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition"
                    >
                      <span>🖥️</span> My ERP Dashboard
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/onboarding'); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition"
                    >
                      <span>🏫</span> Switch School / Campus
                    </button>
                    <button
                      onClick={handleResetPassword}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 transition"
                    >
                      <span>🔑</span> Reset Password
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1.5 px-2 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition"
                    >
                      <span>🚪</span> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold px-5 py-2 rounded-lg shadow-sm transition"
            >
              Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
}