import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Institute {
  id: number;
  name: string;
  board?: string;
  mobile?: string;
  email?: string;
  image_url?: string; // Used for LOGO
  background_url?: string; // Used for CAMPUS BACKGROUND
  admin_id?: string;
  admin_code?: string;
  admin_username?: string;
  admin_password?: string;
  co_admins?: string[];
}

export default function CampusHome() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [institute, setInstitute] = useState<Institute | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const [activeModal, setActiveModal] = useState<'admin' | 'teacher' | 'student' | null>(null);

  const [loginUserOrId, setLoginUserOrId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [teacherIdInput, setTeacherIdInput] = useState('');
  const [teacherPassInput, setTeacherPassInput] = useState('');
  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentUniqueIdInput, setStudentUniqueIdInput] = useState('');

  useEffect(() => {
    const fetchInstituteDetails = async () => {
      const { data, error } = await supabase.from('institutes').select('*').eq('id', id).single();
      if (error || !data) {
        setLoading(false);
        return;
      }
      setInstitute(data);

      const verifyToken = searchParams.get('verify');
      if (verifyToken && data.admin_code && verifyToken === data.admin_code) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert([{
            id: user.id, email: user.email, institute_id: data.id, institute_name: data.name, role: 'admin'
          }]);
          localStorage.setItem('campus_active_session', JSON.stringify({
            role: 'admin', institute_id: data.id, institute_name: data.name, member_name: 'Administrator', member_code: data.admin_code
          }));
          navigate('/dashboard?tab=overview');
          return;
        }
      }
      setLoading(false);
    };
    fetchInstituteDetails();
  }, [id, searchParams, navigate]);

  const handleVerifyTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;
    setJoining(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Please log in first!'); navigate('/login'); return; }

    const { data: teacherRecord, error } = await supabase
      .from('campus_teachers').select('*').eq('institute_id', institute.id).ilike('unique_id', teacherIdInput.trim()).eq('password', teacherPassInput.trim()).maybeSingle();

    if (error || !teacherRecord) {
      alert('❌ Invalid Teacher ID or Password!'); setJoining(false); return;
    }

    await supabase.from('profiles').upsert([{ id: user.id, email: user.email, institute_id: institute.id, institute_name: institute.name, role: 'teacher' }]);
    localStorage.setItem('campus_active_session', JSON.stringify({ role: 'teacher', institute_id: institute.id, institute_name: institute.name, member_name: teacherRecord.name, class_name: teacherRecord.assigned_class, member_code: teacherRecord.unique_id }));
    setJoining(false); setActiveModal(null); navigate('/dashboard?tab=overview');
  };

  const handleVerifyStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;
    setJoining(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Please log in first!'); navigate('/login'); return; }

    const { data: studentRecord, error } = await supabase
      .from('campus_students').select('*').eq('institute_id', institute.id).ilike('unique_id', studentUniqueIdInput.trim()).ilike('name', studentNameInput.trim()).maybeSingle();

    if (error || !studentRecord) {
      alert('❌ Incorrect Name or Unique ID!'); setJoining(false); return;
    }

    await supabase.from('profiles').upsert([{ id: user.id, email: user.email, institute_id: institute.id, institute_name: institute.name, role: 'student' }]);
    localStorage.setItem('campus_active_session', JSON.stringify({ role: 'student', institute_id: institute.id, institute_name: institute.name, member_name: studentRecord.name, class_name: studentRecord.class_name, member_code: studentRecord.unique_id }));
    setJoining(false); setActiveModal(null); navigate('/dashboard?tab=overview');
  };

  const handleAdminButtonClick = async () => {
    if (!institute) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');

    if (institute.co_admins?.includes(user.email || '')) {
      if (window.confirm(`Welcome Co-Admin! Enter Dashboard?`)) {
        await supabase.from('profiles').upsert([{ id: user.id, email: user.email, institute_id: institute.id, institute_name: institute.name, role: 'admin' }]);
        localStorage.setItem('campus_active_session', JSON.stringify({ role: 'admin', institute_id: institute.id, institute_name: institute.name, member_name: 'Co-Admin', member_code: institute.admin_code }));
        navigate('/dashboard?tab=overview');
      }
      return;
    }
    setActiveModal('admin');
  };

  const handleVerifyAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (institute.admin_username && institute.admin_password) {
      if ((loginUserOrId.trim() !== institute.admin_username && loginUserOrId.trim() !== institute.admin_code) || loginPassword !== institute.admin_password) {
        alert('❌ Access Denied!'); return;
      }
    } else {
      if (loginUserOrId.trim() !== institute.admin_code) { alert('❌ Invalid Admin ID!'); return; }
    }

    setJoining(true);
    await supabase.from('profiles').upsert([{ id: user.id, email: user.email, institute_id: institute.id, institute_name: institute.name, role: 'admin' }]);
    localStorage.setItem('campus_active_session', JSON.stringify({ role: 'admin', institute_id: institute.id, institute_name: institute.name, member_name: institute.admin_username || 'Administrator', member_code: institute.admin_code }));
    setJoining(false); setActiveModal(null); navigate('/dashboard?tab=overview');
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#fdfbf7] text-indigo-900 font-extrabold text-xl animate-pulse">Loading Digital Campus...</div>;
  if (!institute) return <div className="text-center py-20 bg-[#fdfbf7] min-h-screen"><h2>Institute Not Found 🏚️</h2></div>;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans">

      {/* 🏫 CAMPUS HERO SECTION (Dynamic Background) */}
      <div 
        className="relative pt-12 pb-32 px-4 border-b-[6px] border-indigo-950 bg-cover bg-center"
        style={{
          backgroundImage: institute.background_url 
            ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.95)), url('${institute.background_url}')` 
            : 'linear-gradient(to right, #1e3a8a, #312e81)'
        }}
      >
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <button onClick={() => navigate('/onboarding')} className="absolute -top-6 left-0 text-white/80 hover:text-white font-bold text-sm flex items-center gap-1 transition-transform hover:-translate-x-1">
            ← Back to Main Gate
          </button>
          
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="relative">
              {/* Dynamic Logo Image */}
              {institute.image_url ? (
                <img src={institute.image_url} alt="Logo" className="w-32 h-32 rounded-full object-cover border-[6px] border-white shadow-xl z-10 relative bg-white" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white text-indigo-900 flex items-center justify-center font-black text-5xl shadow-xl border-[6px] border-indigo-100 z-10 relative">
                  {institute.name[0]}
                </div>
              )}
            </div>

            <div className="mt-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-emerald-400/30 backdrop-blur-sm">
                🏫 Verified Digital Campus
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white mt-5 tracking-tight drop-shadow-md">
                {institute.name}
              </h1>
              <p className="text-indigo-200 mt-3 font-medium text-lg max-w-xl mx-auto">
                Welcome to your secure digital campus. Choose your identity to step inside!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 INTERACTIVE ROLE CARDS */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* STUDENT CARD */}
          <div 
            onClick={() => setActiveModal('student')}
            className="group cursor-pointer bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border-2 border-slate-100 hover:border-blue-400 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              🎒
            </div>
            <h3 className="text-2xl font-black text-slate-800">Student</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">Access your classes, marks, and attendance records.</p>
            <span className="mt-6 text-blue-600 font-extrabold text-sm bg-blue-50 px-5 py-2.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
              Enter Portal →
            </span>
          </div>

          {/* TEACHER CARD */}
          <div 
            onClick={() => setActiveModal('teacher')}
            className="group cursor-pointer bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border-2 border-slate-100 hover:border-emerald-400 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              👩‍🏫
            </div>
            <h3 className="text-2xl font-black text-slate-800">Faculty</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">Manage period attendance, student results & notices.</p>
            <span className="mt-6 text-emerald-600 font-extrabold text-sm bg-emerald-50 px-5 py-2.5 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              Enter Staff Room →
            </span>
          </div>

          {/* ADMIN CARD */}
          <div 
            onClick={handleAdminButtonClick}
            className="group cursor-pointer bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border-2 border-slate-100 hover:border-amber-400 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              💼
            </div>
            <h3 className="text-2xl font-black text-slate-800">Admin</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">Control and monitor the entire campus ecosystem.</p>
            <span className="mt-6 text-amber-600 font-extrabold text-sm bg-amber-50 px-5 py-2.5 rounded-full group-hover:bg-amber-600 group-hover:text-white transition-colors">
              Enter Office →
            </span>
          </div>

        </div>
      </div>

      {/* 📖 ABOUT & CONTACT SECTION (Restored to detailed version) */}
      <div className="max-w-5xl mx-auto mt-16 mb-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* About Institute */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">About the Institute</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Welcome to the official digital campus of <strong>{institute.name}</strong>. 
              Affiliated with <strong>{institute.board || 'a recognized education board'}</strong>, our institution is dedicated to academic excellence, innovation, and holistic student development. 
              <br/><br/>
              Our portal provides a secure, real-time connected ecosystem for our students, faculty, and administrators to thrive and manage daily operations efficiently.
            </p>
          </div>

          {/* Contact Details */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">Contact & Official Details</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Official Email ID</p>
                <p className="font-bold text-slate-800 break-all text-lg">{institute.email || 'Not Provided'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Helpline / Mobile</p>
                <p className="font-bold text-slate-800 text-lg">{institute.mobile || 'Not Provided'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================= */}
      {/* MODALS */}
      {/* ========================================= */}

      {/* STUDENT MODAL */}
      {activeModal === 'student' && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">🎒</div>
              <h3 className="text-2xl font-black text-slate-800">Hello Student!</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Show your ID to enter.</p>
            </div>
            <form onSubmit={handleVerifyStudent} className="space-y-4">
              <div>
                <input type="text" required placeholder="Your Full Name" value={studentNameInput} onChange={(e) => setStudentNameInput(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-colors" />
              </div>
              <div>
                <input type="text" required placeholder="Unique ID (e.g. S01001)" value={studentUniqueIdInput} onChange={(e) => setStudentUniqueIdInput(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 outline-none transition-colors" />
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button type="submit" disabled={joining} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl shadow-md transition-all active:scale-95">{joining ? 'Opening Gates...' : 'Step Inside ✨'}</button>
                <button type="button" onClick={() => setActiveModal(null)} className="w-full py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Wait, go back</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER MODAL */}
      {activeModal === 'teacher' && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">👩‍🏫</div>
              <h3 className="text-2xl font-black text-slate-800">Welcome Faculty</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Ready for the next lecture?</p>
            </div>
            <form onSubmit={handleVerifyTeacher} className="space-y-4">
              <div>
                <input type="text" required placeholder="Teacher ID (e.g. TXXXXX)" value={teacherIdInput} onChange={(e) => setTeacherIdInput(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 outline-none transition-colors" />
              </div>
              <div>
                <input type="password" required placeholder="Password" value={teacherPassInput} onChange={(e) => setTeacherPassInput(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-colors" />
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button type="submit" disabled={joining} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl shadow-md transition-all active:scale-95">{joining ? 'Verifying...' : 'Enter Staff Room 📚'}</button>
                <button type="button" onClick={() => setActiveModal(null)} className="w-full py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Wait, go back</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN MODAL */}
      {activeModal === 'admin' && (
        <div className="fixed inset-0 bg-amber-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">💼</div>
              <h3 className="text-2xl font-black text-slate-800">Admin Office</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Authorized personnel only.</p>
            </div>
            <form onSubmit={handleVerifyAdminCredentials} className="space-y-4">
              <div>
                <input type="text" required placeholder={institute.admin_username ? 'Admin Username or ADM-ID' : 'Verification ID (ADM-XXXX)'} value={loginUserOrId} onChange={(e) => setLoginUserOrId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-colors" />
              </div>
              {institute.admin_username && (
                <div>
                  <input type="password" required placeholder="Admin Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-colors" />
                </div>
              )}
              <div className="pt-2 flex flex-col gap-2">
                <button type="submit" disabled={joining} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 rounded-xl shadow-md transition-all active:scale-95">{joining ? 'Unlocking...' : 'Open Office 🗝️'}</button>
                <button type="button" onClick={() => setActiveModal(null)} className="w-full py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Wait, go back</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}