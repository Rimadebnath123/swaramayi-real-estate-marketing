import React, { useState, useEffect } from 'react';
import { 
  Key, Lock, Mail, CheckCircle2, AlertCircle, Eye, EyeOff, 
  ArrowLeft, Shield, Sun, Moon, Check, RefreshCw, Send, Sparkles
} from 'lucide-react';

interface ForgotPasswordViewProps {
  users: any[];
  onUpdateUsers: (updatedUsers: any[]) => Promise<void> | void;
  onBackToLogin: (prefilledEmail?: string) => void;
  themeMode: 'light' | 'dark';
  setThemeMode?: (mode: 'light' | 'dark') => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  users,
  onUpdateUsers,
  onBackToLogin,
  themeMode,
  setThemeMode
}) => {
  const isLight = themeMode === 'light';
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const [emailInput, setEmailInput] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [step, setStep] = useState<'ENTER_EMAIL' | 'VERIFY_OTP' | 'RESET_PASSWORD' | 'SUCCESS'>('ENTER_EMAIL');
  const [matchedUser, setMatchedUser] = useState<any>(null);

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resendSeconds, setResendSeconds] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendSeconds > 0) {
      const timer = setTimeout(() => setResendSeconds(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendSeconds]);

  const getBackendApiUrl = (endpoint: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://localhost:5000${endpoint}`;
      }
    }
    return endpoint;
  };

  // STEP 1: Dispatch 6-digit OTP to user's Gmail using Google SMTP backend
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = emailInput.trim().toLowerCase();

    if (!query) {
      setErrorMsg('⚠️ Please enter your registered corporate email or User ID.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Check local users database
      const localUser = users.find(u => 
        (u.email && u.email.trim().toLowerCase() === query) ||
        (u.username && u.username.trim().toLowerCase() === query) ||
        (u.id && u.id.trim().toLowerCase() === query)
      );

      const apiUrl = getBackendApiUrl('/api/v1/auth/forgot-password/send-otp');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: query })
      });

      const data = await response.json();

      if (!response.ok || data.status === 'ERROR') {
        throw new Error(data.message || 'Failed to dispatch email verification code.');
      }

      setMatchedUser(localUser || {
        id: data.user_id || 'USR-01',
        email: data.email || query,
        full_name: 'Verified Enterprise Staff',
        role: 'STAFF'
      });

      setSuccessMsg(`✅ 6-Digit OTP code dispatched to ${data.email || query} via Google Mail!`);
      setResendSeconds(60);
      setStep('VERIFY_OTP');
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setErrorMsg(`❌ ${err.message || 'Could not connect to authentication mail server.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify the 6-digit OTP code entered by the user
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpInput.trim();

    if (!code || code.length < 6) {
      setErrorMsg('⚠️ Please enter the complete 6-digit verification code from your email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const apiUrl = getBackendApiUrl('/api/v1/auth/forgot-password/verify-otp');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: matchedUser?.email || emailInput.trim(),
          otp: code
        })
      });

      const data = await response.json();

      if (!response.ok || data.status === 'ERROR') {
        throw new Error(data.message || 'Invalid or expired verification code.');
      }

      setSuccessMsg('✅ Verification successful! Enter your new corporate password.');
      setStep('RESET_PASSWORD');
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setErrorMsg(`❌ ${err.message || 'Invalid verification code.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: Reset password and commit changes directly to MongoDB Atlas
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || newPassword.trim().length < 6) {
      setErrorMsg('⚠️ Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('❌ Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const targetEmail = matchedUser?.email || emailInput.trim();

      // 1. Reset password via backend endpoint (verifies OTP + saves directly to MongoDB Atlas)
      const apiUrl = getBackendApiUrl('/api/v1/auth/forgot-password/reset');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          otp: otpInput.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || data.status === 'ERROR') {
        throw new Error(data.message || 'Failed to update password in MongoDB Atlas.');
      }

      // 2. Synchronize frontend React users state
      const updatedUsers = users.map(u => {
        const isMatch = (matchedUser?.id && u.id === matchedUser.id) ||
                        (u.email && u.email.trim().toLowerCase() === targetEmail.toLowerCase());
        if (isMatch) {
          return {
            ...u,
            password: newPassword.trim(),
            updatedAt: new Date().toISOString()
          };
        }
        return u;
      });

      await onUpdateUsers(updatedUsers);

      // 3. Update clean local cache (ensuring no profile images in localStorage)
      try {
        const cleanUsers = updatedUsers.map((u: any) => {
          const c = { ...u };
          delete c.profileImage;
          delete c.avatar;
          return c;
        });
        localStorage.setItem('swaramayi_enterprise_users_v8', JSON.stringify(cleanUsers));
      } catch (e) {}

      setSuccessMsg('✅ Password successfully reset and saved to MongoDB Atlas!');
      setStep('SUCCESS');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMsg(`❌ Failed to update password: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: isLight 
        ? 'radial-gradient(circle at 50% 20%, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)' 
        : 'radial-gradient(circle at 50% 20%, #0f172a 0%, #090d16 50%, #020617 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '1050px', 
        display: 'grid', 
        gridTemplateColumns: windowWidth <= 850 ? '1fr' : '1.1fr 1fr', 
        background: isLight ? '#ffffff' : '#1e293b', 
        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', 
        borderRadius: '24px', 
        overflow: 'hidden',
        boxShadow: isLight ? '0 25px 50px -12px rgba(2, 132, 199, 0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>

        {/* LEFT COLUMN: BRAND HERO & GOOGLE AUTHENTICATION GOVERNANCE */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #075985 100%)', 
          padding: windowWidth <= 640 ? '30px 20px' : '44px 36px', 
          color: '#ffffff', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <img 
                src="/swaramayi-logo.png" 
                alt="Swaramayi Real Estate Marketing Logo" 
                style={{ height: '64px', background: '#ffffff', padding: '6px 14px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)', objectFit: 'contain' }} 
              />
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.5px', color: '#ffffff', margin: 0 }}>
                  SWARAMAYI REAL ESTATE MARKETING
                </h1>
                <span style={{ fontSize: '0.75rem', color: '#bae6fd', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Enterprise BI Control Center & Automated Real Estate Operating System
                </span>
              </div>
            </div>

            <div style={{ marginTop: '24px', background: 'rgba(0, 0, 0, 0.15)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Shield size={22} color="#bae6fd" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
                  Google Gmail SMTP Authentication
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#e0f2fe', lineHeight: '1.5', margin: 0 }}>
                High-security password recovery powered by Google's secure mail infrastructure. 
                A unique 6-digit cryptographic OTP is delivered directly to your inbox.
              </p>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#bae6fd' }}>
                  <Check size={16} color="#38bdf8" /> Google SMTP 256-Bit SSL Encrypted Delivery
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#bae6fd' }}>
                  <Check size={16} color="#38bdf8" /> Direct Real-Time MongoDB Atlas Synchronization
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#bae6fd' }}>
                  <Check size={16} color="#38bdf8" /> Time-Limited 10-Minute Expiring Security Token
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#bae6fd', fontWeight: '700' }}>🔒 Google Enterprise Mail Gateway</span>
            <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: '800', background: 'rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: '20px' }}>v4.2 Production</span>
          </div>
        </div>

        {/* RIGHT COLUMN: RECOVERY PROCESS CARDS */}
        <div style={{ padding: windowWidth <= 640 ? '28px 20px' : '44px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: isLight ? '#ffffff' : '#1e293b' }}>
          <div>
            {/* TOP BAR: BACK BUTTON & THEME TOGGLE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <button 
                type="button"
                onClick={() => onBackToLogin(matchedUser?.email || emailInput)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#0284c7', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.84rem', 
                  fontWeight: '800',
                  padding: 0
                }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>

              {setThemeMode && (
                <button 
                  type="button"
                  onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                  title="Toggle Light / Dark mode"
                  style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700' }}
                >
                  {themeMode === 'dark' ? <Sun size={14} color="#fbbf24" /> : <Moon size={14} color="#0284c7" />}
                </button>
              )}
            </div>

            {/* HEADER */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                {step === 'ENTER_EMAIL' && 'Reset Account Password'}
                {step === 'VERIFY_OTP' && 'Enter Verification Code'}
                {step === 'RESET_PASSWORD' && 'Create New Password'}
                {step === 'SUCCESS' && 'Password Reset Complete'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                {step === 'ENTER_EMAIL' && 'Step 1 of 3: Enter your corporate email to receive a verification OTP'}
                {step === 'VERIFY_OTP' && 'Step 2 of 3: Enter the 6-digit code sent to your email'}
                {step === 'RESET_PASSWORD' && 'Step 3 of 3: Set a new password and sync to MongoDB Atlas'}
                {step === 'SUCCESS' && 'Your credentials have been securely updated in MongoDB Atlas'}
              </p>
            </div>

            {/* ERROR NOTIFICATION BANNER */}
            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '12px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: '1.4' }}>
                <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SUCCESS BANNER */}
            {successMsg && (
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#4ade80', padding: '12px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: '1.4' }}>
                <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* STEP 1: ENTER EMAIL */}
            {step === 'ENTER_EMAIL' && (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#475569' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                    Registered Corporate Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email" 
                      value={emailInput} 
                      onChange={(e) => { setEmailInput(e.target.value); setErrorMsg(''); }}
                      placeholder="e.g. chayankundu33@gmail.com" 
                      required 
                      autoFocus
                      style={{ 
                        width: '100%', 
                        background: isLight ? '#f8fafc' : '#0f172a', 
                        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', 
                        color: isLight ? '#0f172a' : '#ffffff', 
                        padding: '12px 14px', 
                        paddingLeft: '38px', 
                        borderRadius: '10px', 
                        fontSize: '0.88rem', 
                        fontWeight: '700', 
                        outline: 'none' 
                      }} 
                    />
                    <Mail size={16} color="#0284c7" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '6px', display: 'block' }}>
                    A 6-digit verification code will be sent via Google Gmail Authentication.
                  </span>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ 
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    color: '#ffffff', 
                    border: 'none', 
                    padding: '14px', 
                    borderRadius: '10px', 
                    fontWeight: '900', 
                    fontSize: '0.95rem', 
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)', 
                    marginTop: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    opacity: isSubmitting ? 0.75 : 1
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> DISPATCHING CODE VIA GOOGLE MAIL...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> SEND 6-DIGIT VERIFICATION CODE
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: VERIFY OTP */}
            {step === 'VERIFY_OTP' && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* EMAIL INFO BANNER */}
                <div style={{ 
                  background: isLight ? '#f1f5f9' : '#0f172a', 
                  border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', 
                  borderRadius: '12px', 
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={18} color="#0284c7" />
                    <div>
                      <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Code sent to:</span>
                      <strong style={{ fontSize: '0.85rem', color: isLight ? '#0f172a' : '#ffffff' }}>
                        {matchedUser?.email || emailInput}
                      </strong>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setStep('ENTER_EMAIL'); setErrorMsg(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.76rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Change
                  </button>
                </div>

                {/* 6-DIGIT OTP INPUT */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#475569' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                    Enter 6-Digit Verification Code
                  </label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otpInput} 
                    onChange={(e) => { 
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setOtpInput(val); 
                      setErrorMsg(''); 
                    }}
                    placeholder="• • • • • •" 
                    required 
                    autoFocus
                    style={{ 
                      width: '100%', 
                      background: isLight ? '#f8fafc' : '#0f172a', 
                      border: isLight ? '2px solid #0284c7' : '2px solid #0284c7', 
                      color: isLight ? '#0f172a' : '#ffffff', 
                      padding: '14px', 
                      borderRadius: '10px', 
                      fontSize: '1.4rem', 
                      fontWeight: '900', 
                      textAlign: 'center',
                      letterSpacing: '8px',
                      outline: 'none',
                      fontFamily: 'monospace'
                    }} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      Check your Gmail inbox or spam folder
                    </span>
                    <button
                      type="button"
                      disabled={resendSeconds > 0 || isSubmitting}
                      onClick={() => handleSendOtp()}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: resendSeconds > 0 ? (isLight ? '#94a3b8' : '#64748b') : '#0284c7', 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        cursor: resendSeconds > 0 ? 'not-allowed' : 'pointer' 
                      }}
                    >
                      {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend Code Now'}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || otpInput.length < 6}
                  style={{ 
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    color: '#ffffff', 
                    border: 'none', 
                    padding: '14px', 
                    borderRadius: '10px', 
                    fontWeight: '900', 
                    fontSize: '0.95rem', 
                    cursor: (isSubmitting || otpInput.length < 6) ? 'not-allowed' : 'pointer', 
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    opacity: (isSubmitting || otpInput.length < 6) ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> VERIFYING CODE...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> VERIFY 6-DIGIT CODE
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 'RESET_PASSWORD' && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* VERIFIED BADGE */}
                <div style={{ 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  border: '1px solid #22c55e', 
                  borderRadius: '12px', 
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: isLight ? '#15803d' : '#86efac', fontWeight: '800' }}>
                    Identity Verified: {matchedUser?.email || emailInput}
                  </span>
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#475569' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                    New Password (Min 6 Characters)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showNewPassword ? 'text' : 'password'} 
                      value={newPassword} 
                      onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
                      placeholder="Enter new password" 
                      required 
                      autoFocus
                      autoComplete="new-password"
                      style={{ 
                        width: '100%', 
                        background: isLight ? '#f8fafc' : '#0f172a', 
                        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', 
                        color: isLight ? '#0f172a' : '#ffffff', 
                        padding: '12px 14px', 
                        paddingLeft: '38px', 
                        paddingRight: '40px', 
                        borderRadius: '10px', 
                        fontSize: '0.88rem', 
                        fontWeight: '700', 
                        outline: 'none' 
                      }} 
                    />
                    <Lock size={16} color="#0284c7" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {showNewPassword ? <EyeOff size={16} color="#0284c7" /> : <Eye size={16} color={isLight ? '#64748b' : '#94a3b8'} />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#475569' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      value={confirmPassword} 
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                      placeholder="Re-enter new password" 
                      required 
                      autoComplete="new-password"
                      style={{ 
                        width: '100%', 
                        background: isLight ? '#f8fafc' : '#0f172a', 
                        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', 
                        color: isLight ? '#0f172a' : '#ffffff', 
                        padding: '12px 14px', 
                        paddingLeft: '38px', 
                        paddingRight: '40px', 
                        borderRadius: '10px', 
                        fontSize: '0.88rem', 
                        fontWeight: '700', 
                        outline: 'none' 
                      }} 
                    />
                    <Lock size={16} color="#0284c7" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} color="#0284c7" /> : <Eye size={16} color={isLight ? '#64748b' : '#94a3b8'} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ 
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    color: '#ffffff', 
                    border: 'none', 
                    padding: '14px', 
                    borderRadius: '10px', 
                    fontWeight: '900', 
                    fontSize: '0.95rem', 
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)', 
                    marginTop: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> SAVING TO MONGODB ATLAS...
                    </>
                  ) : (
                    <>
                      <Key size={18} /> SAVE NEW PASSWORD & UPDATE MONGODB
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'SUCCESS' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'rgba(34, 197, 94, 0.15)', 
                  border: '2px solid #22c55e',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 16px auto' 
                }}>
                  <CheckCircle2 size={36} color="#22c55e" />
                </div>

                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: '0 0 8px 0' }}>
                  Password Reset Successfully!
                </h4>

                <p style={{ fontSize: '0.84rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: '1.5', maxWidth: '360px', margin: '0 auto 24px auto' }}>
                  Your password for <strong>{matchedUser?.email || emailInput}</strong> has been securely updated and synced directly to <strong>MongoDB Atlas</strong>.
                </p>

                <button 
                  type="button" 
                  onClick={() => onBackToLogin(matchedUser?.email || emailInput)}
                  style={{ 
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    color: '#ffffff', 
                    border: 'none', 
                    padding: '14px 28px', 
                    borderRadius: '10px', 
                    fontWeight: '900', 
                    fontSize: '0.95rem', 
                    cursor: 'pointer', 
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}
                >
                  <Key size={18} /> PROCEED TO ENTERPRISE SIGN IN
                </button>
              </div>
            )}

          </div>

          {/* FOOTER */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: isLight ? '#94a3b8' : '#64748b' }}>
              Protected by Swaramayi Enterprise RBAC Security Framework
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
