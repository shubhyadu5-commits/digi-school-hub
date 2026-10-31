import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Onboarding from './pages/Onboarding';
import CampusHome from './pages/CampusHome';
import SuperAdmin from './pages/SuperAdmin'; 

const AppLayout = () => {
  const location = useLocation();

  // 1. SCROLL FIX: Har page par jate hi top par scroll karega
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 2. FOOTER LOGIC: Path ko lowercase karke check kar rahe hain
  const currentPath = location.pathname.toLowerCase();
  
  const isInternalPage = 
    currentPath.includes('/dashboard') || 
    currentPath.includes('/campus') || 
    currentPath.includes('/super-admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#eef4fb] font-sans">
      <Navbar />
      
      {/* Main Page Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/campus/:id" element={<ProtectedRoute><CampusHome /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/super-admin" element={<ProtectedRoute><SuperAdmin /></ProtectedRoute>} />
        </Routes>
      </div>

      {/* 3. SMART FOOTER DISPLAY */}
      {!isInternalPage ? (
        <Footer /> // Bahar ke pages par bada footer
      ) : (
        // Andar ke pages (Dashboard/Campus) par ek chota sa footer
        <footer className="bg-slate-900 text-slate-400 py-3 text-center text-xs font-semibold tracking-wide border-t border-slate-800 mt-auto">
          SchoolWeave Live © {new Date().getFullYear()} • Developed by Shubham Yadav
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}