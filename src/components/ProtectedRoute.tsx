import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // चेक करें कि क्या यूज़र का कोई एक्टिव सेशन है
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // अगर यूज़र लॉगिन/लॉगआउट करता है, तो उसे ट्रैक करें
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // जब तक चेक हो रहा है, तब तक लोडिंग दिखाएँ
  if (isAuthenticated === null) {
    return <div className="flex justify-center items-center h-screen text-blue-900 font-bold">Loading...</div>;
  }

  // अगर लॉगिन नहीं है, तो वापस लॉगिन पेज पर भेजें
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // अगर लॉगिन है, तो पेज (Dashboard) दिखा दें
  return <>{children}</>;
}