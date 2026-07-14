import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Key, Mail, AlertTriangle, Lock, ShieldCheck,
  RefreshCw, ArrowRight, Eye, EyeOff, ArrowLeft
} from 'lucide-react';
import { redeemLicenseToken } from '../lib/crypto/tokenEngine.js';

const ERROR_MESSAGES = {
  WRONG_EMAIL:    'This token was not created for this email address.',
  TAMPERED:       'Token has been modified or corrupted. Please contact support.',
  INVALID_FORMAT: 'Invalid token format. Check that you pasted it correctly.',
  INVALID_VERSION:'Token version not supported. Please request a new token.',
  default:        'Token validation failed. Ensure both email and token are correct.',
};

export default function RecoveryModule() {
  const navigate = useNavigate();
  
  // Step 1: Token Verification
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  
  // Step 2: New Password
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!token.trim()) {
      setError('Please paste your license token');
      return;
    }

    // Verify if the email matches the registered admin email
    const registeredEmail = localStorage.getItem('gdl_admin_email');
    if (registeredEmail && email.trim().toLowerCase() !== registeredEmail) {
      setError('This email does not match the registered system admin email.');
      return;
    }

    setVerifying(true);
    try {
      // If redemption works, it proves they have the master key token for this email
      await redeemLicenseToken(email.trim().toLowerCase(), token.trim());
      setIsVerified(true);
    } catch (err) {
      const code = err.message;
      setError(ERROR_MESSAGES[code] || ERROR_MESSAGES.default);
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPass.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Passwords do not match');
      return;
    }

    setResetting(true);
    try {
      // Update local storage password mock
      localStorage.setItem('gdl_local_admin_pass_mock', btoa(newPass.trim()));
      
      // Navigate back to login
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError('Failed to reset password. Please try again.');
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center relative overflow-hidden dark">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 p-4">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Password Recovery</h1>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto">
            {!isVerified 
              ? "Enter your registered email and license token to recover your account."
              : "Identity verified. Please create a new secure password."}
          </p>
        </div>

        <div className="bg-card rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
          {/* Top gradient border */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${!isVerified ? 'from-amber-500 to-orange-500' : 'from-emerald-400 to-teal-500'}`} />

          <div className="p-8 sm:p-10">
            {/* ─── STEP 1: TOKEN VERIFICATION ─── */}
            {!isVerified ? (
              <form onSubmit={handleVerifyToken} className="space-y-6">
                <div className="space-y-5">
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-amber-500 transition-colors">
                      Admin Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-amber-500 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="school@example.com"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-black/10 dark:bg-white/5 rounded-2xl border border-transparent focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/15 outline-none text-foreground transition-all font-medium placeholder:text-muted-foreground/40"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-orange-500 transition-colors">
                      Master License Token <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Key className="w-5 h-5 absolute left-4 top-4 text-muted-foreground/50 group-focus-within:text-orange-500 transition-colors" />
                      <textarea
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        placeholder="Paste your encrypted token..."
                        required
                        rows={4}
                        className="w-full pl-12 pr-12 py-4 bg-black/10 dark:bg-white/5 rounded-2xl border border-transparent focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/15 outline-none text-foreground transition-all font-mono text-sm resize-none placeholder:text-muted-foreground/40 placeholder:font-sans"
                        style={{ letterSpacing: showToken ? '0' : '0.1em', WebkitTextSecurity: showToken ? 'none' : 'disc' }}
                      />
                      <button type="button" onClick={() => setShowToken(s => !s)}
                        className="absolute right-4 top-4 p-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                        {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-semibold">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <button type="submit" disabled={verifying}
                    className="w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 8px 30px rgba(245,158,11,0.3)' }}>
                    {verifying ? (
                      <><RefreshCw className="w-5 h-5 animate-spin" /> Verifying Token...</>
                    ) : (
                      <>Verify Identity <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                  <Link to="/login" className="text-center text-sm font-bold text-muted-foreground hover:text-foreground transition-all">
                    Cancel and return to Login
                  </Link>
                </div>
              </form>
            ) : (
              /* ─── STEP 2: RESET PASSWORD ─── */
              <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Secure Recovery</h2>
                    <p className="text-sm text-emerald-500 font-semibold">Token verified for {email}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-emerald-500 transition-colors">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-12 pr-12 py-4 bg-black/10 dark:bg-white/5 rounded-2xl border border-transparent focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/15 outline-none text-foreground transition-all font-medium"
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-emerald-500 transition-colors">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={confirmPass}
                        onChange={e => setConfirmPass(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-black/10 dark:bg-white/5 rounded-2xl border border-transparent focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/15 outline-none text-foreground transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-semibold">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={resetting}
                  className="w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}>
                  {resetting ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Updating Password...</>
                  ) : (
                    <>Save New Password</>
                  )}
                </button>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
