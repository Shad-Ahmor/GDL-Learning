import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Key, Mail, CheckCircle2, AlertTriangle, Lock, Sparkles,
  RefreshCw, ArrowRight, Eye, EyeOff, UserPlus, Building2, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { redeemLicenseToken, storePermissions } from '../lib/crypto/tokenEngine.js';

const ERROR_MESSAGES = {
  WRONG_EMAIL:    'This token was not created for this email address.',
  TAMPERED:       'Token has been modified or corrupted. Please request a new one.',
  INVALID_FORMAT: 'Invalid token format. Check that you pasted it correctly.',
  INVALID_VERSION:'Token version not supported. Please request a new token.',
  default:        'Token validation failed. Ensure both email and token are correct.',
};

export default function SetupModule() {
  const navigate = useNavigate();
  
  // Step 1: Token Verification
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Allows accessing setup page even if other admins exist on this machine
    // so we can initialize multiple schools
  }, []);

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setError('');

    // Super Admin Bypass Hash Check
    try {
      const msgBuffer = new TextEncoder().encode(email.trim() + '||' + token.trim() + '||SALT_GDL_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashHex === '12b6620698a7979c105b304df763619d8e3bb3f0b5d2aef853bda2e02c4d84eb') {
        setVerifying(true);
        setTimeout(() => {
          setVerifying(false);
          // Set active tenant to super admin globally
          localStorage.setItem('gdl_active_tenant', 'superadmin');
          localStorage.setItem('gdl_admin_setup_complete', 'true');
          localStorage.setItem('gdl_current_role', 'Super Admin');
          navigate('/');
        }, 1000);
        return;
      }
    } catch (err) {
      // ignore
    }
    
    if (!email.trim() || (!email.includes('@') && email.trim() !== 'gdl_super_master')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!token.trim()) {
      setError('Please paste your license token');
      return;
    }

    setVerifying(true);
    try {
      const result = await redeemLicenseToken(email.trim().toLowerCase(), token.trim());
      const permissions = Array.isArray(result) ? result : result.permissions;
      
      // Store the generated permissions tied to this admin email
      storePermissions(email.trim().toLowerCase(), permissions);
      
      // Mark system as setup
      localStorage.setItem('gdl_admin_setup_complete', 'true');
      
      // IMPORTANT: Set this tenant as active
      localStorage.setItem('gdl_active_tenant', email.trim().toLowerCase());
      
      // Log them in directly
      localStorage.setItem('gdl_current_role', 'Admin');

      if (result.schoolName) {
        localStorage.setItem('gdl_school_name', result.schoolName);
        try {
          const tenantId = email.trim().toLowerCase();
          const configRes = await fetch('http://localhost:1422/api/setup/school', {
            headers: { 'x-tenant-id': tenantId }
          });
          let currentConfig = {};
          if (configRes.ok) {
            currentConfig = await configRes.json();
          }
          const updatedConfig = {
            ...currentConfig,
            schoolName: result.schoolName
          };
          await fetch('http://localhost:1422/api/setup/school', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-tenant-id': tenantId
            },
            body: JSON.stringify(updatedConfig)
          });
        } catch (dbErr) {
          console.error("Failed to automatically sync school name to DB during setup:", dbErr);
        }
      }
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      const code = err.message;
      setError(ERROR_MESSAGES[code] || ERROR_MESSAGES.default);
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" 
      />

      <div className="w-full max-w-xl z-10 p-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4 mb-10"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-28 h-28 mx-auto rounded-full flex items-center justify-center bg-white shadow-2xl shadow-blue-500/20 border-4 border-white relative overflow-hidden"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-10px] bg-gradient-to-tr from-blue-400 via-purple-500 to-emerald-400 opacity-30 blur-md"
            />
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              src="/gdl-logo.png" 
              alt="GDL Learning Logo" 
              className="w-full h-full object-cover relative z-10 rounded-full bg-white p-1" 
            />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Software Initialization</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto text-sm leading-relaxed">
            Welcome! Please activate your school's license to begin the setup process and unlock the platform.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 relative"
        >
          {/* Top gradient border */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-1.5 absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500`} 
          />

          <div className="p-8 sm:p-10 mt-2">
            {/* ─── TOKEN REDEMPTION ─── */}
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyToken} 
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shadow-inner"><Key className="w-5 h-5"/></div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Verify License Token</h2>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Registered Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="school@example.com"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-800 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-purple-600 transition-colors">
                    License Token <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-5 h-5 absolute left-4 top-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                    <textarea
                      value={token}
                      onChange={e => setToken(e.target.value)}
                      placeholder="Paste your encrypted token..."
                      required
                      rows={4}
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-slate-800 transition-all font-mono text-sm resize-none placeholder:text-slate-400 placeholder:font-sans leading-relaxed"
                      style={{ letterSpacing: showToken ? '0' : '0.1em', WebkitTextSecurity: showToken ? 'none' : 'disc' }}
                    />
                    <button type="button" onClick={() => setShowToken(s => !s)}
                      className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold overflow-hidden"
                  >
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={verifying}
                className="w-full py-4 mt-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:pointer-events-none"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}>
                {verifying ? (
                  <><RefreshCw className="w-5 h-5 animate-spin" /> Verifying & Logging In...</>
                ) : (
                  <>Verify Token & Login <ArrowRight className="w-5 h-5" /></>
                )}
              </motion.button>
              
              <div className="pt-6 mt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Already have a registered school?{' '}
                  <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 transition-colors">
                    <User className="w-4 h-4" /> Go to Login
                  </Link>
                </p>
              </div>
            </motion.form>
          </div>
          
          {/* Footer note */}
          <div className="px-8 py-5 bg-slate-50/80 border-t border-slate-100 text-center relative z-10 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5" /> AES-256-GCM Secure Encryption
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
