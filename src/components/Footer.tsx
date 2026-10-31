import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// TypeScript ko batane ke liye ki window object par ye properties aa sakti hain
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

type ModalType = 'about' | 'guide' | 'privacy' | 'terms' | 'security' | null;

export default function Footer() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Function to handle Google Translate for Hindi
  const handleTranslateHindi = () => {
    if (!document.getElementById('google_translate_script')) {
      const script = document.createElement('script');
      script.id = 'google_translate_script';
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'hi,en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      };

      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
          select.value = 'hi';
          select.dispatchEvent(new Event('change'));
        }
      }, 1000);
    } else {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = 'hi';
        select.dispatchEvent(new Event('change'));
      }
    }
  };

  // Function to handle English translation reset
  const handleTranslateEnglish = () => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = 'en'; 
        select.dispatchEvent(new Event('change'));
      }
  };

  // Function to handle Restricted Links (Role Portals)
  const handleRestrictedLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Please select your college first and then login to access your portal.');
    navigate('/onboarding');
  };

  return (
    <footer className="bg-[#050e14] text-slate-300 font-sans border-t-4 border-amber-700 mt-12 relative z-40">
      
      {/* Hidden div for Google Translate widget */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* ================================================================= */}
      {/* MAIN FOOTER GRID (IIT KANPUR DARK STYLE)                          */}
      {/* ================================================================= */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          
          {/* COLUMN 1: Brand Info & Developer */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-4 group w-fit">
              <div className="w-12 h-12 bg-transparent border-2 border-white/20 rounded-full flex items-center justify-center shrink-0 group-hover:border-amber-500 transition-colors">
                <span className="text-white font-black text-xl">S</span>
              </div>
              <div>
                 <h3 className="text-white text-sm font-bold uppercase tracking-widest">SchoolWeave Live</h3>
                 <p className="text-xs text-slate-400 mt-1">Digital Campus Portal</p>
              </div>
            </Link>

            <div className="text-sm space-y-4 text-slate-400">
              <p>
                Designed & Developed by<br/>
                <button onClick={() => setActiveModal('about')} className="text-slate-200 font-bold hover:text-amber-500 transition-colors mt-1">
                  Shubham Yadav
                </button><br/>
                Uttar pradesh , India
              </p>
              
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-3 py-1.5 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                All Systems Operational
              </div>
            </div>
          </div>

          {/* COLUMN 2: Platform Links */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-amber-500 transition-colors">Overview & Home</Link></li>
              <li><Link to="/onboarding" className="hover:text-amber-500 transition-colors">School & College Directory</Link></li>
              <li><Link to="/onboarding" className="hover:text-amber-500 transition-colors">Register New Institute</Link></li>
              <li><button onClick={handleRestrictedLinkClick} className="hover:text-amber-500 transition-colors text-left w-full">Live ERP Dashboard</button></li>
            </ul>
          </div>

          {/* COLUMN 3: Role Portals */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Role Portals</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={handleRestrictedLinkClick} className="hover:text-amber-500 transition-colors text-left w-full">🎓 Student Portal</button></li>
              <li><button onClick={handleRestrictedLinkClick} className="hover:text-amber-500 transition-colors text-left w-full">👨‍🏫 Faculty Attendance</button></li>
              <li><button onClick={handleRestrictedLinkClick} className="hover:text-amber-500 transition-colors text-left w-full">🔒 Administrator ERP</button></li>
              <li><Link to="/super-admin" className="text-amber-500 hover:text-amber-400 font-bold transition-colors">⚡ Super Admin Control</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: Help Guide & Legal Modals */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Help & Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => setActiveModal('guide')} className="hover:text-amber-500 transition-colors text-left">📘 User & Troubleshooting Guide</button></li>
              <li><button onClick={() => setActiveModal('about')} className="hover:text-amber-500 transition-colors text-left">👨‍💻 About Us & Developer</button></li>
              <li><button onClick={() => setActiveModal('privacy')} className="hover:text-amber-500 transition-colors text-left">🛡️ Privacy Policy</button></li>
              <li><button onClick={() => setActiveModal('terms')} className="hover:text-amber-500 transition-colors text-left">📜 Terms of Service</button></li>
              <li><button onClick={() => setActiveModal('security')} className="hover:text-amber-500 transition-colors text-left">🔐 Security & Verification</button></li>
            </ul>
          </div>

        </div>
      </div>

      {/* ================================================================= */}
      {/* BOTTOM COPYRIGHT BAR                                              */}
      {/* ================================================================= */}
      <div className="bg-[#03080b] py-6 px-6 sm:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Social Icons (Actual Links to be updated by you) */}
          <div className="flex items-center gap-4 text-slate-400">
            {/* INSTAGRAM LINK */}
            <a href="https://www.instagram.com/shubhamyadav__072025?xtok=MTBjbTNkdGRhZ3Z0dA==" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            {/* TWITTER (X) LINK */}
            <a href="https://twitter.com/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            {/* LINKEDIN LINK */}
            <a href="https://www.linkedin.com/in/shubham-yadav-209080420?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            {/* FACEBOOK LINK */}
            <a href="https://facebook.com/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>
            </a>
          </div>

          <div className="text-xs text-slate-500 flex flex-col md:flex-row items-center gap-2 md:gap-8 text-center">
             <p>© {new Date().getFullYear()} SchoolWeave Live. Built by <button onClick={() => setActiveModal('about')} className="text-slate-300 font-bold hover:text-amber-500 transition">Shubham Yadav</button></p>
             <div className="flex gap-4">
                 <button onClick={handleTranslateEnglish} className="hover:text-white transition cursor-pointer">English</button>
                 <button onClick={handleTranslateHindi} className="hover:text-white transition cursor-pointer">हिन्दी</button>
             </div>
          </div>

          {/* Scroll to Top Arrow */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-400 hover:text-white p-2 border border-slate-700 hover:border-slate-500 rounded transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </button>
          
        </div>
      </div>

      {/* ================================================================= */}
      {/* POPUP MODALS FOR GUIDE, ABOUT, PRIVACY, TERMS & SECURITY          */}
      {/* ================================================================= */}
      {activeModal && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 text-slate-800"
          >
            {/* 0. COMPLETE USER & TROUBLESHOOTING GUIDE */}
            {activeModal === 'guide' && (
              <>
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      Interactive Documentation
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      📘 SchoolWeave Live — How to Use & Troubleshoot
                    </h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <div className="p-4 bg-slate-50 rounded-2xl border space-y-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">🏫 1. Register & Approve a School/College</h4>
                    <p>Go to <strong>Find Schools & Colleges</strong>, click <strong>+ Register New Institute</strong>, and submit details. Then visit the <strong>⚡ Approvals</strong> tab in the navbar to approve the campus so it goes live.</p>
                  </div>

                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                    <h4 className="font-extrabold text-amber-950 text-sm">2. 🔒 Administrator Workflow</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Class-Wise Students:</strong> Select a Class Card first, then add students (Name, Roll No, Section) inside that class.</li>
                      <li><strong>Teachers & Master Time-Table:</strong> Register teachers with Unique IDs (e.g. <code>T1</code>, <code>T2</code>) and click any Period cell in the dark Master Time-Table Grid to assign them classes.</li>
                      <li><strong>6-Subject Marksheet:</strong> Open <code>📊 Result Marksheet</code>, pick Class ➡️ Student, type 6 subjects & marks, and save! Grand Total & Percentage calculate automatically.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                    <h4 className="font-extrabold text-emerald-950 text-sm">3. 👨‍🏫 Teacher & 🎓 Student Workflow</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Teacher:</strong> Log in with Teacher ID & Password. Click any assigned period in the Master Time-Table Grid to open that class's student list, mark <strong>P</strong> or <strong>A</strong>, and click <strong>Save Attendance</strong> at the bottom.</li>
                      <li><strong>Student:</strong> Log in with Name, Roll No & Class to view read-only Attendance History (since admission), 6-Subject Result Marksheet, and Official Notices.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-1.5">
                    <h4 className="font-extrabold text-blue-950 text-sm">4. 🛠️ Quick Troubleshooting Tips</h4>
                    <p><strong>Student/Teacher Login Not Found?</strong> Ensure the Admin has added the Student (in that exact Class) or Teacher ID first.</p>
                    <p><strong>0 Students Showing in Teacher Attendance?</strong> Check that students are added under the exact same Class Name that you clicked in the Time-Table.</p>
                    <p><strong>Want to Switch Role or Reset Password?</strong> Click your profile avatar in the top-right corner of the navbar!</p>
                  </div>
                </div>
              </>
            )}

            {/* 1. ABOUT US & CREATOR */}
            {activeModal === 'about' && (
              <>
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      About SchoolWeave Live & Creator
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      Empowering Digital Schools & Campuses
                    </h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
                </div>

                <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                  <p>
                    <strong>SchoolWeave Live</strong> is a comprehensive, multi-institutional digital school and college ERP platform built to bring educational institutions onto a single modern cloud ecosystem.
                  </p>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                    <p className="text-xs font-extrabold uppercase text-blue-700 mb-1">👨‍💻 Designed & Developed By</p>
                    <h4 className="text-lg font-black text-slate-900">Shubham Yadav</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Full-Stack Developer & B.Tech Engineering Student • Passionate about building scalable EdTech, AI, and Cloud ERP solutions using React, TypeScript, Tailwind CSS, and Supabase.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border">
                      <p className="font-extrabold text-slate-900">🎯 Our Mission</p>
                      <p className="text-slate-500 mt-0.5">Paperless period attendance registers, instant 6-subject marksheets, and transparent student tracking.</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border">
                      <p className="font-extrabold text-slate-900">⚡ Tech Stack</p>
                      <p className="text-slate-500 mt-0.5">React + Vite, Tailwind CSS Bento UI, and Supabase Real-Time PostgreSQL Database.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 2. PRIVACY POLICY */}
            {activeModal === 'privacy' && (
              <>
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                      Data Protection
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      🛡️ Privacy Policy — SchoolWeave Live
                    </h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
                </div>

                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  <p>
                    At <strong>SchoolWeave Live</strong> (developed by <strong>Shubham Yadav</strong>), we take institutional and student privacy seriously:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                    <li><strong>Strict Role Isolation:</strong> Students can only view their own read-only attendance and marksheet records using their verified Roll Number, Name, and Class.</li>
                    <li><strong>Faculty & Admin Access:</strong> Only authorized Teachers (with unique Teacher IDs) and School Administrators can mark attendance or publish results.</li>
                    <li><strong>Zero Third-Party Sharing:</strong> Institutional emails, phone numbers, and academic records are stored securely in our encrypted database and are never sold or shared with third parties.</li>
                  </ul>
                </div>
              </>
            )}

            {/* 3. TERMS OF SERVICE */}
            {activeModal === 'terms' && (
              <>
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                      Platform Guidelines
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      📜 Terms of Service — SchoolWeave Live
                    </h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
                </div>

                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  <p>
                    By registering or accessing an institution on <strong>SchoolWeave Live</strong>, you agree to the following terms:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                    <li><strong>Authentic Institutional Registration:</strong> Only authorized Principals, Directors, or HODs should register a new school/college for Super Admin approval.</li>
                    <li><strong>Credential Responsibility:</strong> Administrators are responsible for safeguarding their unique Admin ID (<code>ADM-XXXX</code>) and assigning Co-Admins or Teachers responsibly.</li>
                    <li><strong>Academic Integrity:</strong> Attendance logs (<code>P</code> / <code>A</code>) and 6-subject marksheets published on the portal serve as official digital campus records.</li>
                  </ul>
                </div>
              </>
            )}

            {/* 4. SECURITY & VERIFICATION */}
            {activeModal === 'security' && (
              <>
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full">
                      3-Tier Verification Architecture
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      🔐 Security & Verification System
                    </h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
                </div>

                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  <p>
                    <strong>SchoolWeave Live</strong> uses a multi-layered verification system engineered by <strong>Shubham Yadav</strong> to keep every digital school & college safe:
                  </p>
                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="p-3 bg-slate-50 rounded-xl border">
                      <strong className="text-slate-900">1. Super Admin Approval:</strong> Newly registered institutes remain hidden until verified and approved by the Super Admin.
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border">
                      <strong className="text-slate-900">2. Protected Admin & Co-Admin Portal:</strong> Admin access requires a unique <code>ADM-XXXX</code> verification ID, custom credentials, or WhatsApp-style Co-Admin email authorization.
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border">
                      <strong className="text-slate-900">3. Verified Faculty & Student Login:</strong> Teachers log in via Admin-issued Unique IDs (<code>T1</code>, <code>TCH-101</code>), and Students are verified against their exact Name, Roll Number, and Class.
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-sm transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}