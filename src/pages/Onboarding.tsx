import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Institute {
  id: number;
  name: string;
  board?: string;
  image_url?: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [collegeName, setCollegeName] = useState('');
  const [board, setBoard] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchInstitutes = async () => {
      const { data, error } = await supabase
        .from('institutes')
        .select('id, name, board, image_url')
        .eq('is_approved', true);

      if (error) {
        console.error('Error fetching institutes:', error.message);
      } else if (data) {
        setInstitutes(data);
      }
      setLoading(false);
    };

    fetchInstitutes();
  }, []);

  const handleRegisterInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to register an institute!');
      setSubmitting(false);
      return;
    }

    const generatedAdminCode = `ADM-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase
      .from('institutes')
      .insert([
        { 
          name: collegeName,
          board: board,
          mobile: mobile,
          email: email,
          image_url: imageUrl,
          admin_id: user.id,
          admin_code: generatedAdminCode,
          is_approved: false 
        }
      ]);

    setSubmitting(false);

    if (error) {
      alert('Error registering institute: ' + error.message);
    } else {
      alert(`Institute details submitted successfully! Go to Super Admin (/super-admin) to approve it.\nGenerated Admin ID: ${generatedAdminCode}`);
      setCollegeName('');
      setBoard('');
      setMobile('');
      setEmail('');
      setImageUrl('');
      setShowForm(false);
    }
  };

  const filteredInstitutes = institutes.filter(inst => 
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inst.board && inst.board.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fdfbf7] p-4 sm:p-8 font-sans selection:bg-indigo-100">
      
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* ========================================================= */}
        {/* 1. ELEGANT HERO & SEARCH SECTION                          */}
        {/* ========================================================= */}
        <div className="text-center pt-10 sm:pt-16 pb-8">
          <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
            SchoolWeave Live Directory
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Find your digital <span className="text-indigo-600 relative inline-block">campus<svg className="absolute -bottom-2 w-full h-3 text-indigo-200" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg></span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Search for your institution below to access your secure portal. Mark attendance, check results, and stay connected with your campus ecosystem.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-indigo-400 opacity-20 rounded-[2rem] blur-xl group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white p-2 rounded-[2rem] shadow-xl border border-slate-200/60 flex items-center">
              <div className="pl-6 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search by college name or university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
              <button 
                onClick={() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-[1.5rem] shadow-md transition-all active:scale-95 shrink-0"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. VERIFIED INSTITUTES GRID                               */}
        {/* ========================================================= */}
        <div id="directory" className="pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-black text-slate-800">
              Verified Campuses <span className="text-slate-400 font-medium text-lg ml-2">({filteredInstitutes.length})</span>
            </h2>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* ⚡ Yahan wapas lagaya hai SUPER ADMIN Link */}
              <button onClick={() => navigate('/super-admin')} className="text-sm font-bold text-amber-600 hover:text-amber-700 transition">
                ⚡ Super Admin Approvals
              </button>
              
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-sm text-indigo-600 font-bold hover:underline transition">
                  Clear Search
                </button>
              )}
              
              <button 
                onClick={() => {
                  setShowForm(true);
                  setTimeout(() => document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
                className="bg-white border-2 border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 font-bold px-5 py-2 rounded-xl text-sm shadow-sm transition"
              >
                + Register New Campus
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl p-6 h-32 border border-slate-100 shadow-sm animate-pulse flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredInstitutes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstitutes.map(inst => (
                <div 
                  key={inst.id} 
                  onClick={() => navigate(`/campus/${inst.id}`)}
                  className="group bg-white rounded-3xl p-6 border-2 border-slate-100 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start gap-5">
                    {inst.image_url ? (
                      <img src={inst.image_url} alt={inst.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl shrink-0">
                        {inst.name[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-indigo-700 transition">
                        {inst.name}
                      </h3>
                      {inst.board && (
                        <p className="text-sm text-slate-500 mt-1.5 font-medium line-clamp-1">
                          {inst.board}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified
                    </span>
                    <span className="text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                      Visit Portal →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No campus found</h3>
              <p className="text-slate-500 text-sm mb-6">We couldn't find any institution matching "{searchQuery}".</p>
              <button 
                onClick={() => {
                  setShowForm(true);
                  setTimeout(() => document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
                className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md hover:bg-indigo-700 transition"
              >
                Register it now
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. REGISTER NEW CAMPUS SECTION                            */}
        {/* ========================================================= */}
        <div id="register-section" className="pb-16">
          {showForm && (
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-slate-200/60 max-w-4xl mx-auto relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="text-center mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full mb-4 inline-block">
                  Admin Registration
                </span>
                <h2 className="text-3xl font-black text-slate-900 mb-3">Onboard your institution</h2>
                <p className="text-slate-500 text-sm">Join the platform to get your secure digital campus portal.</p>
              </div>

              <form onSubmit={handleRegisterInstitute} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">Institute Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Delhi Public School"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">Recognition Board / University *</label>
                    <select 
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition appearance-none"
                    >
                      <option value="" disabled>Select Affiliation...</option>
                      <option value="UGC">UGC (University Grants Commission)</option>
                      <option value="AICTE">AICTE</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board / University</option>
                      <option value="Autonomous">Autonomous / Deemed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">Official Email ID *</label>
                    <input 
                      type="email" 
                      placeholder="admin@institute.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">Contact Number *</label>
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">College Logo URL (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/logo.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">You can directly upload images from your Admin Dashboard later.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 mt-6 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-2xl text-sm shadow-xl shadow-slate-900/20 transition disabled:opacity-70 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Processing Request...' : 'Submit for Verification'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}