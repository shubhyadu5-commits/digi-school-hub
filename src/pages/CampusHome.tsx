import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Institute {
  id: number;
  name: string;
  board?: string;
  mobile?: string;
  email?: string;
  image_url?: string;
  admin_id?: string;
  admin_code?: string;
  admin_username?: string;
  admin_password?: string;
  co_admins?: string[];
}

const DEFAULT_CLASSES = [
  'B.Tech CS 1st Year',
  'B.Tech CS 2nd Year',
  'B.Tech CS 3rd Year',
  'B.Tech CS 4th Year',
  'BCA 1st Year',
  'MCA 1st Year',
  'Class 10 - Section A',
  'Class 12 - Section A'
];

export default function CampusHome() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [institute, setInstitute] = useState<Institute | null>(null);
  const [availableClasses, setAvailableClasses] = useState<string[]>(DEFAULT_CLASSES);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const [activeModal, setActiveModal] = useState<'admin' | 'teacher' | 'student' | null>(null);

  // Admin Login Form States
  const [loginUserOrId, setLoginUserOrId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Teacher Login Form States
  const [teacherIdInput, setTeacherIdInput] = useState('');
  const [teacherPassInput, setTeacherPassInput] = useState('');

  // Student Login Form States
  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentRollInput, setStudentRollInput] = useState('');
  const [studentClassInput, setStudentClassInput] = useState('');

  useEffect(() => {
    const fetchInstituteDetails = async () => {
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setInstitute(data);

      const { data: classData } = await supabase
        .from('campus_classes')
        .select('class_name')
        .eq('institute_id', data.id);

      if (classData && classData.length > 0) {
        const dbClasses = classData.map(c => c.class_name);
        setAvailableClasses(Array.from(new Set([...dbClasses, ...DEFAULT_CLASSES])));
      }

      const verifyToken = searchParams.get('verify');
      if (verifyToken && data.admin_code && verifyToken === data.admin_code) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert([{
            id: user.id,
            email: user.email,
            institute_id: data.id,
            institute_name: data.name,
            role: 'admin'
          }]);
          localStorage.setItem('campus_active_session', JSON.stringify({
            role: 'admin',
            institute_id: data.id,
            institute_name: data.name,
            member_name: 'Administrator',
            member_code: data.admin_code
          }));
          alert('Email Verification Successful! Welcome to Admin Dashboard.');
          navigate('/dashboard');
          return;
        }
      }

      setLoading(false);
    };

    fetchInstituteDetails();
  }, [id, searchParams, navigate]);

  // 1. VERIFY TEACHER LOGIN
  const handleVerifyTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;
    setJoining(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to your account first!');
      navigate('/login');
      return;
    }

    const { data: teacherRecord, error } = await supabase
      .from('campus_teachers')
      .select('*')
      .eq('institute_id', institute.id)
      .ilike('unique_id', teacherIdInput.trim())
      .eq('password', teacherPassInput.trim())
      .maybeSingle();

    if (error || !teacherRecord) {
      alert('❌ Invalid Teacher Unique ID or Password! Make sure you added this teacher in Admin panel first.');
      setJoining(false);
      return;
    }

    await supabase.from('profiles').upsert([{
      id: user.id,
      email: user.email,
      institute_id: institute.id,
      institute_name: institute.name,
      role: 'teacher'
    }]);

    // Browser me pakka save karein ki abhi Teacher login hua hai
    localStorage.setItem('campus_active_session', JSON.stringify({
      role: 'teacher',
      institute_id: institute.id,
      institute_name: institute.name,
      member_name: teacherRecord.name,
      class_name: teacherRecord.assigned_class,
      member_code: teacherRecord.unique_id
    }));

    setJoining(false);
    setActiveModal(null);
    navigate('/dashboard');
  };

  // 2. VERIFY STUDENT LOGIN
  const handleVerifyStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;
    setJoining(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to your account first!');
      navigate('/login');
      return;
    }

    const { data: studentRecord, error } = await supabase
      .from('campus_students')
      .select('*')
      .eq('institute_id', institute.id)
      .ilike('roll_number', studentRollInput.trim())
      .ilike('name', studentNameInput.trim())
      .eq('class_name', studentClassInput)
      .maybeSingle();

    if (error || !studentRecord) {
      alert('❌ Student Record Not Found! Make sure Name, Roll No, and Class match what Admin entered.');
      setJoining(false);
      return;
    }

    await supabase.from('profiles').upsert([{
      id: user.id,
      email: user.email,
      institute_id: institute.id,
      institute_name: institute.name,
      role: 'student'
    }]);

    // Browser me pakka save karein ki abhi Student login hua hai
    localStorage.setItem('campus_active_session', JSON.stringify({
      role: 'student',
      institute_id: institute.id,
      institute_name: institute.name,
      member_name: studentRecord.name,
      class_name: studentRecord.class_name,
      member_code: studentRecord.roll_number
    }));

    setJoining(false);
    setActiveModal(null);
    navigate('/dashboard');
  };

  // 3. VERIFY ADMIN LOGIN
  const handleAdminButtonClick = async () => {
    if (!institute) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');

    if (institute.co_admins?.includes(user.email || '')) {
      if (window.confirm(`Welcome Co-Admin (${user.email})! Enter Administrator Dashboard?`)) {
        await supabase.from('profiles').upsert([{
          id: user.id,
          email: user.email,
          institute_id: institute.id,
          institute_name: institute.name,
          role: 'admin'
        }]);
        localStorage.setItem('campus_active_session', JSON.stringify({
          role: 'admin',
          institute_id: institute.id,
          institute_name: institute.name,
          member_name: 'Co-Admin',
          member_code: institute.admin_code
        }));
        navigate('/dashboard');
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
      const isUserMatch = loginUserOrId.trim() === institute.admin_username || loginUserOrId.trim() === institute.admin_code;
      const isPassMatch = loginPassword === institute.admin_password;

      if (!isUserMatch || !isPassMatch) {
        alert('❌ Access Denied! Incorrect Admin Username/ID or Password.');
        return;
      }
    } else {
      if (loginUserOrId.trim() !== institute.admin_code) {
        alert('❌ Invalid Admin ID!');
        return;
      }
    }

    setJoining(true);
    await supabase.from('profiles').upsert([{
      id: user.id,
      email: user.email,
      institute_id: institute.id,
      institute_name: institute.name,
      role: 'admin'
    }]);

    localStorage.setItem('campus_active_session', JSON.stringify({
      role: 'admin',
      institute_id: institute.id,
      institute_name: institute.name,
      member_name: institute.admin_username || 'Administrator',
      member_code: institute.admin_code
    }));

    setJoining(false);
    setActiveModal(null);
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-blue-900 font-bold text-lg">Loading Digital Campus...</div>;
  }

  if (!institute) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Institute Not Found</h2>
        <button onClick={() => navigate('/onboarding')} className="mt-4 bg-blue-900 text-white px-6 py-2 rounded">
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white py-12 px-4 shadow-md">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/onboarding')} className="text-blue-200 hover:text-white text-sm mb-6 flex items-center gap-1">
            ← Back to Institute Search
          </button>

          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {institute.image_url ? (
              <img src={institute.image_url} alt={institute.name} className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-white shadow-xl bg-white" />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-white text-blue-900 flex items-center justify-center font-extrabold text-5xl shadow-xl border-4 border-blue-100">
                {institute.name[0]}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                <span className="bg-blue-700/80 border border-blue-500 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full uppercase">
                  {institute.board || 'Recognized Institute'}
                </span>
                <span className="bg-green-500/20 border border-green-400 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                  ✓ Verified Digital Campus
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{institute.name}</h1>
              <p className="text-blue-200 mt-2 text-sm md:text-base">
                Official Digital Campus Portal • Connect, Learn & Grow Together
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">About the Institute</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to the official digital campus of <strong>{institute.name}</strong>. 
              Affiliated with <strong>{institute.board || 'a recognized education board'}</strong>, our institution is dedicated to academic excellence, innovation, and holistic student development.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Contact & Official Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-lg border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Official Email ID</p>
                <p className="font-semibold text-gray-800 break-all">{institute.email || 'Not Provided'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Helpline / Mobile</p>
                <p className="font-semibold text-gray-800">{institute.mobile || 'Not Provided'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-900">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Campus Portal Login</h2>
            <p className="text-xs text-gray-500 mb-6">Select your role and verify your campus credentials</p>

            <div className="space-y-3">
              <button
                onClick={() => setActiveModal('student')}
                className="w-full p-4 rounded-xl border-2 border-blue-100 bg-blue-50/50 hover:bg-blue-900 hover:text-white transition group flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-blue-950 group-hover:text-white text-base">🎓 Login as Student</p>
                  <p className="text-xs text-gray-500 group-hover:text-blue-200">Enter using Roll No, Name & Class</p>
                </div>
                <span className="text-xl font-bold text-blue-900 group-hover:text-white">→</span>
              </button>

              <button
                onClick={() => setActiveModal('teacher')}
                className="w-full p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-700 hover:text-white transition group flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-emerald-950 group-hover:text-white text-base">👨‍🏫 Login as Teacher</p>
                  <p className="text-xs text-gray-500 group-hover:text-emerald-100">Enter using Teacher ID & Password</p>
                </div>
                <span className="text-xl font-bold text-emerald-800 group-hover:text-white">→</span>
              </button>

              <button
                onClick={handleAdminButtonClick}
                className="w-full p-4 rounded-xl border-2 border-amber-100 bg-amber-50/50 hover:bg-amber-600 hover:text-white transition group flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-amber-950 group-hover:text-white text-base">🔒 Login as Administrator</p>
                  <p className="text-xs text-gray-500 group-hover:text-amber-100">Protected by Admin ID & Password</p>
                </div>
                <span className="text-xl font-bold text-amber-800 group-hover:text-white">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT MODAL */}
      {activeModal === 'student' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-t-4 border-blue-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-extrabold text-blue-950">🎓 Student Portal Login</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-700 font-bold text-xl">×</button>
            </div>
            <form onSubmit={handleVerifyStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Student Full Name *</label>
                <input type="text" required placeholder="e.g. Rahul Sharma" value={studentNameInput} onChange={(e) => setStudentNameInput(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Roll Number *</label>
                <input type="text" required placeholder="e.g. 240101" value={studentRollInput} onChange={(e) => setStudentRollInput(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Select Your Class *</label>
                <select required value={studentClassInput} onChange={(e) => setStudentClassInput(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm bg-white">
                  <option value="" disabled>-- Choose Class --</option>
                  {availableClasses.map((cls, idx) => <option key={idx} value={cls}>{cls}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={joining} className="bg-blue-900 text-white font-bold px-6 py-2 rounded-lg text-sm">{joining ? 'Checking...' : 'Enter Campus'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER MODAL */}
      {activeModal === 'teacher' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-t-4 border-emerald-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-extrabold text-emerald-950">👨‍🏫 Teacher Portal Login</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-700 font-bold text-xl">×</button>
            </div>
            <form onSubmit={handleVerifyTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Teacher Unique ID *</label>
                <input type="text" required placeholder="e.g. TCH-101" value={teacherIdInput} onChange={(e) => setTeacherIdInput(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Password *</label>
                <input type="password" required placeholder="Enter your password" value={teacherPassInput} onChange={(e) => setTeacherPassInput(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={joining} className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg text-sm">{joining ? 'Verifying...' : 'Login as Teacher'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN MODAL */}
      {activeModal === 'admin' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-t-4 border-amber-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-extrabold text-gray-900">🔒 Administrator Verification</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-700 font-bold text-xl">×</button>
            </div>
            <form onSubmit={handleVerifyAdminCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  {institute.admin_username ? 'Admin Username or Admin ID *' : 'Verification Admin ID (e.g. ADM-1234) *'}
                </label>
                <input type="text" required placeholder={institute.admin_username ? 'Enter username or ADM-XXXX' : 'ADM-1234'} value={loginUserOrId} onChange={(e) => setLoginUserOrId(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm" />
              </div>
              {institute.admin_username && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Admin Password *</label>
                  <input type="password" required placeholder="Enter admin password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={joining} className="bg-amber-500 text-white font-bold px-6 py-2 rounded-lg text-sm">{joining ? 'Verifying...' : 'Verify & Enter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}