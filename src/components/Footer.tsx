import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type ModalType = 'about' | 'guide' | 'privacy' | 'terms' | 'security' | null;

export default function Footer() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <footer className="bg-white border-t border-slate-200/80 text-slate-600 mt-12 relative">
      
      {/* Top Pre-Footer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
        <div className="rounded-3xl bg-gradient-to-r from-[#e3effd] via-[#cbe2fc] to-[#b3d4ff] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-200/70 shadow-xs">
          <div className="text-center md:text-left">
            <span className="bg-white/80 text-blue-700 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
              🚀 Welcome to Digi School Hub
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2 tracking-tight">
              Launch your digital school or college portal in minutes.
            </h3>
            <p className="text-slate-700 text-xs sm:text-sm mt-1 font-medium">
              Complete with Master Time-Table Grid, live period attendance (P/A), and 6-subject student marksheets.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/onboarding')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-md transition"
            >
              Find Your School →
            </button>
            <button
              onClick={() => setActiveModal('guide')}
              className="bg-white hover:bg-slate-50 text-blue-950 border border-blue-200 font-extrabold text-sm px-5 py-3 rounded-full shadow-2xs transition"
            >
              📘 How to Use & Help Guide
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Column 1: Brand Info */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
              D
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Digi <span className="text-blue-600">School Hub</span>
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
            <strong>Digi School Hub</strong> is a next-generation institutional ERP & digital school platform designed & developed by <strong className="text-slate-800">Shubham Yadav</strong> to connect Administrators, Faculty, and Students in real time.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All Digi School Hub Systems Operational
          </div>
        </div>

        {/* Column 2: Platform Navigation */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4">
            Platform
          </h4>
          <ul className="space-y-2.5 text-sm font-medium text-slate-500">
            <li><Link to="/" className="hover:text-blue-600 transition">Overview & Home</Link></li>
            <li><Link to="/onboarding" className="hover:text-blue-600 transition">School & College Directory</Link></li>
            <li><Link to="/onboarding" className="hover:text-blue-600 transition">Register New Institute</Link></li>
            <li><Link to="/dashboard" className="hover:text-blue-600 transition">Live ERP Dashboard</Link></li>
          </ul>
        </div>

        {/* Column 3: Role Portals */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4">
            Role Portals
          </h4>
          <ul className="space-y-2.5 text-sm font-medium text-slate-500">
            <li><Link to="/onboarding" className="hover:text-blue-600 transition">🎓 Student Read-Only Portal</Link></li>
            <li><Link to="/onboarding" className="hover:text-blue-600 transition">👨‍🏫 Faculty Period Attendance</Link></li>
            <li><Link to="/onboarding" className="hover:text-blue-600 transition">🔒 Administrator ERP</Link></li>
            <li><Link to="/super-admin" className="hover:text-amber-600 transition">⚡ Super Admin Control</Link></li>
          </ul>
        </div>

        {/* Column 4: Help Guide, About & Legal */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4">
            Help & Legal
          </h4>
          <ul className="space-y-2.5 text-sm font-medium text-slate-500">
            <li>
              <button onClick={() => setActiveModal('guide')} className="text-blue-600 font-bold hover:underline transition text-left">
                📘 User & Troubleshooting Guide
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal('about')} className="hover:text-blue-600 transition text-left">
                👨‍💻 About Us & Developer
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal('privacy')} className="hover:text-blue-600 transition text-left">
                🛡️ Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal('terms')} className="hover:text-blue-600 transition text-left">
                📜 Terms of Service
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal('security')} className="hover:text-blue-600 transition text-left">
                🔐 Security & Verification
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>
            © {new Date().getFullYear()} <strong>Digi School Hub</strong> • Built by{' '}
            <button onClick={() => setActiveModal('about')} className="text-blue-600 font-bold hover:underline">
              Shubham Yadav
            </button>
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => setActiveModal('guide')} className="text-blue-600 font-bold hover:underline cursor-pointer transition">
              📘 Help Guide
            </button>
            <button onClick={() => setActiveModal('about')} className="hover:text-blue-600 font-semibold cursor-pointer transition">
              About Us
            </button>
            <button onClick={() => setActiveModal('privacy')} className="hover:text-blue-600 font-semibold cursor-pointer transition">
              Privacy Policy
            </button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-blue-600 font-semibold cursor-pointer transition">
              Terms of Service
            </button>
            <button onClick={() => setActiveModal('security')} className="hover:text-blue-600 font-semibold cursor-pointer transition">
              Security & Verification
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* POPUP MODALS FOR GUIDE, ABOUT, PRIVACY, TERMS & SECURITY          */}
      {/* ================================================================= */}
      {activeModal && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5"
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
                      📘 Digi School Hub — How to Use & Troubleshoot
                    </h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <div className="p-4 bg-slate-50 rounded-2xl border space-y-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">1. 🏫 Register & Approve a School/College</h4>
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
                    <h4 className="font-extrabold text-blue-950 text-sm">🛠️ Quick Troubleshooting Tips</h4>
                    <p>• <strong>Student/Teacher Login Not Found?</strong> Ensure the Admin has added the Student (in that exact Class) or Teacher ID first.</p>
                    <p>• <strong>0 Students Showing in Teacher Attendance?</strong> Check that students are added under the exact same Class Name that you clicked in the Time-Table.</p>
                    <p>• <strong>Want to Switch Role or Reset Password?</strong> Click your profile avatar in the top-right corner of the navbar!</p>
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
                      About Digi School Hub & Creator
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      Empowering Digital Schools & Campuses
                    </h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
                </div>

                <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                  <p>
                    <strong>Digi School Hub</strong> is a comprehensive, multi-institutional digital school and college ERP platform built to bring educational institutions onto a single modern cloud ecosystem.
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
                      🛡️ Privacy Policy — Digi School Hub
                    </h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
                </div>

                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  <p>
                    At <strong>Digi School Hub</strong> (developed by <strong>Shubham Yadav</strong>), we take institutional and student privacy seriously:
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
                      📜 Terms of Service — Digi School Hub
                    </h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
                </div>

                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  <p>
                    By registering or accessing an institution on <strong>Digi School Hub</strong>, you agree to the following terms:
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
                    <strong>Digi School Hub</strong> uses a multi-layered verification system engineered by <strong>Shubham Yadav</strong> to keep every digital school & college safe:
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