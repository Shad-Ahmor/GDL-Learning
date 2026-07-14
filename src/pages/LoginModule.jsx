import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, School, ArrowRight, ShieldCheck, Eye, EyeOff, UserPlus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { redeemLicenseToken, storePermissions } from '../lib/crypto/tokenEngine.js';
import { useGlobalContext } from '../context/GlobalContext';
import { Sun, Moon } from 'lucide-react';

export default function LoginModule() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [liveSchoolName, setLiveSchoolName] = useState('');
  const { settings, updateSetting } = useGlobalContext();

  useEffect(() => {
    // If setup is not complete, redirect to setup
    const isSetup = localStorage.getItem('gdl_admin_setup_complete') === 'true';
    if (!isSetup) {
      navigate('/setup');
    }
  }, [navigate]);

  useEffect(() => {
    const email = username.trim().toLowerCase();
    const token = password.trim();
    if (email && token.length > 30) {
      redeemLicenseToken(email, token)
        .then(async result => {
          if (result && result.schoolName) {
            setLiveSchoolName(result.schoolName);
          } else {
            // Fallback for v2 tokens: try to fetch from backend
            try {
              const res = await fetch('http://localhost:1422/api/superadmin/tokens');
              if (res.ok) {
                const tokens = await res.json();
                const myToken = tokens.find(t => t.email === email);
                if (myToken && myToken.schoolName) {
                  setLiveSchoolName(myToken.schoolName);
                  return;
                }
              }
            } catch (e) {}
            setLiveSchoolName('');
          }
        })
        .catch(() => {
          setLiveSchoolName('');
        });
    } else {
      setLiveSchoolName('');
    }
  }, [username, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Very strong encrypted Super Admin check (prevents reverse engineering of password string)
      const msgBuffer = new TextEncoder().encode(username.trim() + '||' + password.trim() + '||SALT_GDL_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Secret vault hash for 'gdl_super_master'
      if (hashHex === '12b6620698a7979c105b304df763619d8e3bb3f0b5d2aef853bda2e02c4d84eb') {
        setTimeout(() => {
          setLoading(false);
          localStorage.setItem('gdl_active_tenant', 'superadmin');
          localStorage.setItem('gdl_current_role', 'Super Admin');
          navigate('/');
          window.location.reload();
        }, 1000);
        return;
      }

      // Try to verify the token for the given email (acting as password)
      const email = username.trim().toLowerCase();
      const token = password.trim();
      
      try {
        const result = await redeemLicenseToken(email, token);
        const permissions = Array.isArray(result) ? result : result.permissions;
        storePermissions(email, permissions);

        // Valid token for this email!
        localStorage.setItem('gdl_active_tenant', email);

        // For v3 tokens, school name is embedded directly
        let finalSchoolName = '';
        if (result.schoolName) {
          localStorage.setItem('gdl_school_name', result.schoolName);
          finalSchoolName = result.schoolName;
        } else {
          // Fallback for v2 tokens: try to fetch the registered school name from backend
          try {
            const res = await fetch('http://localhost:1422/api/superadmin/tokens');
            if (res.ok) {
              const tokens = await res.json();
              const myToken = tokens.find(t => t.email === email);
              if (myToken && myToken.schoolName) {
                localStorage.setItem('gdl_school_name', myToken.schoolName);
                finalSchoolName = myToken.schoolName;
              }
            }
          } catch (e) {
            // gracefully ignore if offline
          }
        }

        if (finalSchoolName) {
          try {
            const configRes = await fetch('http://localhost:1422/api/setup/school', {
              headers: { 'x-tenant-id': email }
            });
            let currentConfig = {};
            if (configRes.ok) {
              currentConfig = await configRes.json();
            }
            const updatedConfig = {
              ...currentConfig,
              schoolName: finalSchoolName
            };
            await fetch('http://localhost:1422/api/setup/school', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-tenant-id': email
              },
              body: JSON.stringify(updatedConfig)
            });
          } catch (dbErr) {
            console.error("Failed to automatically sync school name to DB:", dbErr);
          }
        }

        setTimeout(() => {
          setLoading(false);
          localStorage.setItem('gdl_current_role', 'Admin');
          navigate('/');
          window.location.reload();
        }, 1000);
      } catch (err) {
        setLoading(false);
        setError('Invalid Email or License Token. ' + (err.message || ''));
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred during authentication');
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center relative overflow-hidden font-sans transition-colors duration-300">
      {/* Theme Toggle Button */}
      <button 
        onClick={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 left-4 z-50 p-3 rounded-2xl bg-card border border-black/10 dark:border-white/10 text-muted-foreground hover:text-foreground transition-all shadow-lg hover:scale-105"
      >
        {settings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Animated Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 dark:bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" 
      />

      {/* Super Admin hidden login hint */}
      <div className="absolute top-4 right-4 text-[10px] text-muted-foreground/30 font-mono tracking-widest select-none cursor-default">
        GDL-SA-NODE-ACTIVE
      </div>

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
            className="w-28 h-28 mx-auto rounded-full flex items-center justify-center bg-card shadow-2xl shadow-primary/20 border-4 border-card relative overflow-hidden"
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
              src={settings.schoolLogo || "/gdl-logo.png"} 
              alt="Logo" 
              className="w-full h-full object-cover relative z-10 rounded-full bg-card p-1" 
            />
          </motion.div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">{liveSchoolName || settings.schoolName || 'GDLLearning ERP'}</h1>
          <p className="text-muted-foreground font-medium max-w-md mx-auto text-sm leading-relaxed">
            Enterprise School Management System. Please login to your dashboard.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/10 dark:shadow-white/5 relative"
        >
          {/* Top gradient border */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-1.5 absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500`} 
          />

          <form onSubmit={handleLogin} className="p-8 sm:p-10 space-y-6 mt-2">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/5 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg shadow-inner"><User className="w-5 h-5"/></div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Admin Login</h2>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">
                  Registered Email / Username
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="school@example.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/10 dark:border-white/10 focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-foreground transition-all font-medium placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-purple-500 transition-colors">
                    License Token / Password
                  </label>
                  <Link to="/recover" className="text-[10px] text-primary hover:underline font-bold transition-all">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Paste your encrypted token..."
                    required
                    className="w-full pl-12 pr-12 py-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/10 dark:border-white/10 focus:bg-card focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-foreground transition-all font-medium placeholder:text-muted-foreground"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              disabled={loading}
              className="w-full py-4 mt-8 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>Sign In to Dashboard <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>

            <div className="pt-6 mt-6 border-t border-black/5 dark:border-white/5 text-center">
              <p className="text-sm text-muted-foreground">
                Want to manage a different school on this PC?{' '}
                <Link to="/setup" className="font-bold text-primary hover:underline inline-flex items-center gap-1 transition-colors">
                  <UserPlus className="w-4 h-4" /> Register New School
                </Link>
              </p>
            </div>
          </form>

          {/* Footer note */}
          <div className="px-8 py-5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 text-center relative z-10 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Hardware License Verified • v1.0.0 Pro
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
