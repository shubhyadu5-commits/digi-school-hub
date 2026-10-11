import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();

  // Mode: Sign In vs Sign Up
  const [isSignUp, setIsSignUp] = useState(false);
  // Method: Email vs Mobile OTP
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Email & Password States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Mobile OTP States
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // =========================================================================
  // 1. GOOGLE OAUTH LOGIN / SIGNUP HANDLER
  // =========================================================================
  const handleGoogleLogin = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/onboarding',
        },
      });
      if (error) {
        setMessage({ type: 'error', text: 'Google Auth Error: ' + error.message });
        setLoading(false);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to start Google sign in.' });
      setLoading(false);
    }
  };

  // =========================================================================
  // 2. EMAIL + PASSWORD (+ CONFIRM PASSWORD ON SIGNUP) HANDLER
  // =========================================================================
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim() || !password) {
      setMessage({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    // Confirm Password Check on Sign Up
    if (isSignUp && password !== confirmPassword) {
      setMessage({ type: 'error', text: '❌ Passwords do not match! Please check Confirm Password.' });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin + '/onboarding',
          },
        });

        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else if (data.session) {
          setMessage({ type: 'success', text: '🎉 Account created successfully! Redirecting...' });
          setTimeout(() => navigate('/onboarding'), 700);
        } else {
          setMessage({
            type: 'success',
            text: '✅ Account registered! Check your email inbox/spam for confirmation, OR turn OFF "Confirm email" in Supabase -> Authentication -> Providers -> Email for instant login.',
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setMessage({
              type: 'error',
              text: '⚠️ Email not confirmed! Please turn OFF "Confirm email" in Supabase -> Authentication -> Providers -> Email.',
            });
          } else {
            setMessage({ type: 'error', text: error.message });
          }
        } else {
          navigate('/onboarding');
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication failed.' });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 3. MOBILE NUMBER SMS OTP HANDLERS
  // =========================================================================
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanedPhone}`;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhoneNumber });
      if (error) {
        setMessage({ type: 'error', text: `SMS Error: ${error.message}` });
      } else {
        setOtpSent(true);
        setMessage({ type: 'success', text: `📲 6-digit OTP sent to ${fullPhoneNumber}!` });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send OTP.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const cleanedPhone = phone.replace(/\D/g, '');
    const fullPhoneNumber = `${countryCode}${cleanedPhone}`;

    if (otp.trim().length < 6) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit OTP.' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: otp.trim(),
        type: 'sms',
      });

      if (error) {
        setMessage({ type: 'error', text: '❌ Invalid OTP: ' + error.message });
      } else if (data.session) {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'OTP verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#eef4fb] via-[#e3effd] to-[#dbeafe] p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 max-w-md w-full p-6 sm:p-8">
        
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md mx-auto mb-3">
            D
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Digi School Hub — Official Institutional ERP Portal
          </p>
        </div>

        {/* MAIN SWITCH: SIGN IN vs SIGN UP */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl mb-5 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setMessage(null);
            }}
            className={`py-2.5 rounded-xl transition cursor-pointer ${
              !isSignUp ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔑 Sign In (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setMessage(null);
            }}
            className={`py-2.5 rounded-xl transition cursor-pointer ${
              isSignUp ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ Sign Up (Register)
          </button>
        </div>

        {/* ================================================================= */}
        {/* GOOGLE LOGO BUTTON (ENABLED FOR BOTH SIGN IN & SIGN UP)           */}
        {/* ================================================================= */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-4 flex items-center justify-center gap-3 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-extrabold text-sm py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-blue-400 shadow-xs transition cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative flex py-1.5 items-center mb-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] font-extrabold uppercase text-slate-400">
            OR CONTINUE WITH
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Sub-Selector: Email vs Mobile SMS OTP */}
        <div className="grid grid-cols-2 bg-slate-50 border border-slate-200/80 p-1 rounded-xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setMessage(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              authMethod === 'email' ? 'bg-white text-blue-950 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            📧 Email & Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setMessage(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              authMethod === 'phone' ? 'bg-white text-blue-950 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            📱 Mobile SMS OTP
          </button>
        </div>

        {/* Error / Success Message Box */}
        {message && (
          <div
            className={`mb-5 p-3.5 rounded-2xl text-xs font-bold leading-relaxed border ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ================================================================= */}
        {/* EMAIL + PASSWORD + CONFIRM PASSWORD FORM                          */}
        {/* ================================================================= */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {showPassword ? '🙈 Hide' : '👁️ Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* CONFIRM PASSWORD FIELD (SHOWN DURING SIGN UP) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                      : confirmPassword && password === confirmPassword
                      ? 'border-emerald-400 bg-emerald-50/30 focus:ring-emerald-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">
                    ✗ Passwords do not match yet
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-1">
                    ✓ Passwords match!
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading
                ? 'Please wait...'
                : isSignUp
                ? '✨ Create Account'
                : '🔑 Sign In to Portal'}
            </button>
          </form>
        )}

        {/* ================================================================= */}
        {/* MOBILE NUMBER + SMS OTP FORM                                      */}
        {/* ================================================================= */}
        {authMethod === 'phone' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                    Mobile Number (SMS OTP) *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-extrabold text-slate-800 bg-slate-50"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending OTP...' : '📲 Send 6-Digit SMS OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-950">
                    📱 {countryCode} {phone}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setMessage(null);
                    }}
                    className="text-blue-600 font-extrabold underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                    Enter 6-Digit OTP *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full border-2 border-emerald-500 rounded-xl px-4 py-3 text-center text-xl font-black tracking-[0.5em] text-slate-900 bg-emerald-50/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition cursor-pointer"
                >
                  {loading ? 'Verifying...' : '✅ Verify OTP & Continue'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}