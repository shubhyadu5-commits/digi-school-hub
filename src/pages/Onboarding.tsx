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
    <div className="min-h-[calc(100vh-64px)] bg-[#dce8f5] p-3 sm:p-6 md:p-8">
      
      {/* WIX-STYLE WHITE OUTER FRAME */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-4 sm:p-8 shadow-xl border border-slate-100 space-y-10">
        
        {/* Sub-Navbar inside Frame (Like Wix "Domains" bar) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">Campus Directory</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500">
            <a href="#directory" className="hover:text-blue-600 transition">Verified Campuses ({institutes.length})</a>
            <button onClick={() => setShowForm(true)} className="hover:text-blue-600 transition">Register College</button>
            <button onClick={() => navigate('/super-admin')} className="hover:text-amber-600 transition">⚡ Super Admin Approvals</button>
          </div>

          <button 
            onClick={() => {
              setShowForm(true);
              setTimeout(() => document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition"
          >
            Create a Campus
          </button>
        </div>

        {/* ========================================================= */}
        {/* 1. WIX-STYLE 3-COLUMN BENTO HERO SECTION                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Column: 2 Stacked Visual Cards */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="relative flex-1 rounded-3xl overflow-hidden shadow-sm min-h-[190px] group bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=700&q=80" 
                alt="College Campus" 
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full w-fit mb-1.5">
                  Digital ERP
                </span>
                <p className="font-bold text-base leading-tight">Smart Attendance & Records</p>
              </div>
            </div>

            {/* Pastel Purple Pill Card (Like Wix bottom-left card) */}
            <div className="flex-1 rounded-3xl bg-gradient-to-b from-[#ede9fe] via-[#f3e8ff] to-[#e0e7ff] p-5 flex flex-col items-center justify-center text-center border border-purple-200/60 min-h-[170px]">
              <span className="text-[11px] font-bold text-purple-400 tracking-widest uppercase mb-2">portal.campus.edu</span>
              <div className="bg-white px-5 py-2.5 rounded-full shadow-md border border-purple-100 text-slate-800 font-extrabold text-xs sm:text-sm mb-2">
                🎓 Student • Faculty • Admin
              </div>
              <span className="text-[11px] text-purple-500 font-semibold">100% Verified Access</span>
            </div>
          </div>

          {/* Center Column: Sky-Blue Hero Card with Pill Search Bar */}
          <div className="lg:col-span-6 rounded-3xl bg-gradient-to-b from-[#e4f0fe] via-[#cde3fe] to-[#b5d5ff] p-8 sm:p-12 flex flex-col items-center justify-center text-center border border-blue-200/70 shadow-inner min-h-[390px]">
            <h1 className="text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-[1.12] mb-4">
              Find your perfect <br className="hidden sm:block" /> digital campus
            </h1>
            <p className="text-slate-700 text-xs sm:text-sm max-w-md mb-8 leading-relaxed font-medium">
              Search and select your institution to access live 6-lecture attendance sheets, student academic reports, and official notices.
            </p>

            {/* WIX PILL SEARCH INPUT */}
            <div className="w-full max-w-lg bg-white p-1.5 pl-5 rounded-full shadow-lg border border-blue-200 flex items-center justify-between focus-within:ring-4 focus-within:ring-blue-500/20 transition">
              <input 
                type="text" 
                placeholder="Type the institute name you want..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <a 
                href="#directory"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-full flex items-center gap-1.5 shrink-0 shadow-md transition"
              >
                <span>Search</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Right Column: Tall Lifestyle Image Card */}
          <div className="lg:col-span-3 rounded-3xl overflow-hidden relative shadow-sm group min-h-[340px] bg-slate-900">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80" 
              alt="Students" 
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/20 to-transparent p-6 flex flex-col justify-end text-white">
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full w-fit mb-2">
                ● Live Portals
              </span>
              <h3 className="text-lg font-extrabold leading-snug">
                Connect with your teachers & classmates
              </h3>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 2. APPROVED INSTITUTES DIRECTORY CARDS                    */}
        {/* ========================================================= */}
        <div id="directory" className="pt-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Verified Digital Campuses ({filteredInstitutes.length})
              </h2>
              <p className="text-xs text-slate-500">Select your institute below to open its portal</p>
            </div>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-blue-600 font-bold hover:underline">
                Clear Search ("{searchQuery}")
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 text-blue-900 font-bold">
              Loading campuses...
            </div>
          ) : filteredInstitutes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInstitutes.map(inst => (
                <div 
                  key={inst.id} 
                  onClick={() => navigate(`/campus/${inst.id}`)}
                  className="flex justify-between items-center p-5 border border-slate-200/90 rounded-2xl bg-gradient-to-r from-white to-slate-50/70 hover:to-blue-50/50 hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {inst.image_url ? (
                      <img src={inst.image_url} alt={inst.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-white" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-900 flex items-center justify-center font-black text-xl border border-blue-200 shrink-0">
                        {inst.name[0]}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition truncate">
                          {inst.name}
                        </p>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                          ✓ Verified
                        </span>
                      </div>
                      {inst.board && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Affiliated to: <span className="font-semibold text-slate-700">{inst.board}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs bg-blue-950 group-hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold transition shadow-xs shrink-0 ml-2">
                    Visit Campus →
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-600 font-semibold">No institute found matching "{searchQuery}".</p>
              <button 
                onClick={() => setShowForm(true)} 
                className="mt-3 text-xs bg-blue-600 text-white font-bold px-5 py-2 rounded-full"
              >
                + Register "{searchQuery || 'New Institute'}" Below
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. CREATE CAMPUS SECTION FOR ADMINS                       */}
        {/* ========================================================= */}
        <div id="register-section" className="rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-8 sm:p-10 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full">
                Are you a College Admin?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">Create Your Digital Campus</h2>
              <p className="text-blue-200 text-sm mt-1">
                Register your institute on CampusConnect with complete details for verification.
              </p>
            </div>
            
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                className="bg-white text-blue-950 font-extrabold text-sm py-3 px-7 rounded-full hover:bg-blue-50 transition shadow-md shrink-0"
              >
                + Register New Institute
              </button>
            )}
          </div>
          
          {showForm && (
            <form onSubmit={handleRegisterInstitute} className="mt-8 max-w-2xl mx-auto space-y-4 text-left bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Institute Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., National Institute of Technology"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Recognition Board / Affiliation *</label>
                  <select 
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="" disabled>Select Recognition Board / University</option>
                    <option value="UGC">UGC (University Grants Commission)</option>
                    <option value="AICTE">AICTE</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State University">State University / Board</option>
                    <option value="Autonomous / Deemed">Autonomous / Deemed University</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Official Email ID *</label>
                  <input 
                    type="email" 
                    placeholder="admin@college.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Contact Mobile No. *</label>
                  <input 
                    type="tel" 
                    placeholder="+91 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">College Logo / Campus Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/college-logo.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-3 rounded-xl text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="bg-transparent border border-blue-300 text-blue-100 py-2.5 px-5 rounded-full text-sm font-bold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-emerald-500 text-white font-bold py-2.5 px-7 rounded-full text-sm hover:bg-emerald-600 transition disabled:opacity-50 shadow-md"
                >
                  {submitting ? 'Submitting...' : 'Submit for Approval →'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}