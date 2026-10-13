import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Institute {
  id: number;
  name: string;
  board?: string;
  mobile?: string;
  email?: string;
  admin_code?: string;
  admin_username?: string;
  is_approved: boolean;
}

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 NAYA SECURITY STATE 🔥
  const [isAuthorized, setIsAuthorized] = useState(false);

  // =========================================================================
  // 1. STRICT SECURITY LOCK: CHECK IF USER IS shubhyadu5@gmail.com
  // =========================================================================
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || session.user.email !== 'shubhyadu5@gmail.com') {
        alert('🚫 Access Denied! Sirf Main Administrator ise access kar sakte hain.');
        navigate('/dashboard'); // Unauthorized user ko bahar fek do
      } else {
        setIsAuthorized(true); // Aapko permission mil gayi
      }
    };
    checkAdminAccess();
  }, [navigate]);

  // =========================================================================
  // 2. FETCH ALL INSTITUTES (Sirf tabhi chalega jab permission mil jayegi)
  // =========================================================================
  const fetchAllInstitutes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('institutes')
      .select('*')
      .order('id', { ascending: false });

    if (data) setInstitutes(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchAllInstitutes();
    }
  }, [isAuthorized]);

  // =========================================================================
  // 3. APPROVAL & EMAIL LOGIC
  // =========================================================================
  const handleApproveCampus = async (inst: Institute) => {
    const generatedAdminCode = inst.admin_code || `ADM-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase
      .from('institutes')
      .update({ 
        is_approved: true,
        admin_code: generatedAdminCode 
      })
      .eq('id', inst.id);

    if (error) {
      alert('Error approving: ' + error.message);
      return;
    }

    setInstitutes(institutes.map(item => 
      item.id === inst.id ? { ...item, is_approved: true, admin_code: generatedAdminCode } : item
    ));

    const verificationLink = `${window.location.origin}/campus/${inst.id}?verify=${generatedAdminCode}`;
    const subject = encodeURIComponent(`Action Required: Verify & Setup Admin Account for ${inst.name}`);
    
    const body = encodeURIComponent(
      `Congratulations!\n\nYour digital campus "${inst.name}" has been approved on Digi School Hub.\n\nYour Readable Admin ID:\n${generatedAdminCode}\n\nClick this Verification Link to open your Admin Page and set your Admin Username & Password:\n${verificationLink}\n\n(Note: Keep this link private. Once you set your username and password, you can log in anytime from your campus portal.)\n\nTeam Digi School Hub`
    );

    if (window.confirm(`Campus Approved!\n\nVerification Link generated:\n${verificationLink}\n\nClick OK to send this verification link to ${inst.email} via Gmail/Email.`)) {
      window.open(`mailto:${inst.email}?subject=${subject}&body=${body}`);
    }
  };

  const handleRevoke = async (id: number) => {
    await supabase.from('institutes').update({ is_approved: false }).eq('id', id);
    fetchAllInstitutes();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this institute request permanently?')) return;
    await supabase.from('institutes').delete().eq('id', id);
    setInstitutes(institutes.filter(i => i.id !== id));
  };

  // Jab tak security check ho raha hai, tab tak ye screen dikhegi
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-blue-900 font-extrabold text-xl animate-pulse">
          Checking Admin Permissions... 🔐
        </div>
      </div>
    );
  }

  const pendingList = institutes.filter(i => !i.is_approved);
  const approvedList = institutes.filter(i => i.is_approved);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
          <div>
            <h1 className="text-2xl font-extrabold text-blue-950">⚡ Super Admin Control Center</h1>
            <p className="text-gray-500 text-sm">Approve colleges & send them their Admin Verification Link.</p>
          </div>
          <button onClick={() => navigate('/onboarding')} className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
            ← Back to Search
          </button>
        </div>

        {loading ? (
          <p className="text-center py-10 font-bold text-blue-900">Loading requests...</p>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-200">
              <h2 className="text-lg font-bold text-amber-900 mb-4">⏳ Pending Verification Requests ({pendingList.length})</h2>
              {pendingList.length === 0 ? <p className="text-gray-400 text-sm">No pending requests.</p> : (
                <div className="space-y-4">
                  {pendingList.map(inst => (
                    <div key={inst.id} className="p-4 rounded-lg border border-amber-100 bg-amber-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {inst.name} <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded ml-1">{inst.board}</span>
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">📧 {inst.email} &nbsp;|&nbsp; 📞 {inst.mobile}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveCampus(inst)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
                        >
                          ✓ Approve & Send Verification Link
                        </button>
                        <button
                          onClick={() => handleDelete(inst.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold px-3 py-2 rounded-lg transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-200">
              <h2 className="text-lg font-bold text-green-800 mb-4">✅ Live Approved Campuses ({approvedList.length})</h2>
              <div className="space-y-3">
                {approvedList.map(inst => (
                  <div key={inst.id} className="p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-sm transition">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{inst.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Email: {inst.email} • <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Admin ID: {inst.admin_code}</span>
                      </p>
                      <p className="text-[11px] text-blue-600 mt-1.5 bg-blue-50/50 p-2 rounded border border-blue-100 break-all">
                        🔗 Verification Link: {`${window.location.origin}/campus/${inst.id}?verify=${inst.admin_code}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button 
                        onClick={() => navigate(`/campus/${inst.id}?verify=${inst.admin_code}`)} 
                        className="text-xs bg-amber-100 text-amber-900 px-3 py-1.5 rounded font-bold hover:bg-amber-200 transition cursor-pointer"
                      >
                        Test Verify Link
                      </button>
                      <button 
                        onClick={() => navigate(`/campus/${inst.id}`)} 
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 px-3 py-1.5 rounded font-semibold transition cursor-pointer"
                      >
                        Visit Campus
                      </button>
                      <button 
                        onClick={() => handleRevoke(inst.id)} 
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded font-semibold transition cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}