import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Onboarding from './pages/Onboarding';
import CampusHome from './pages/CampusHome';
import SuperAdmin from './pages/SuperAdmin'; // SuperAdmin इम्पोर्ट

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#eef4fb] font-sans">
        <Navbar />
        
        {/* मुख्य पेज का हिस्सा */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            
            {/* हर कॉलेज का अलग होमपेज रूट */}
            <Route path="/campus/:id" element={<ProtectedRoute><CampusHome /></ProtectedRoute>} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Super Admin कंट्रोल पैनल का रूट */}
            <Route path="/super-admin" element={<ProtectedRoute><SuperAdmin /></ProtectedRoute>} />
          </Routes>
        </div>

        {/* नीचे नया आकर्षक Footer */}
        <Footer />
      </div>
    </Router>
  );
}