import React, { useState, useEffect } from 'react';
import {
  Crown, Shield, Key, Copy, CheckCircle2, ChevronDown, ChevronRight,
  Plus, Trash2, Mail, Sparkles, Lock, Zap, RefreshCw, Eye, EyeOff,
  Building2, Users, AlertTriangle, X, ClipboardCopy, History, Download
} from 'lucide-react';
import { generateLicenseToken } from '../../lib/crypto/tokenEngine.js';

// ─── ALL SOFTWARE PERMISSIONS (matches RoleManagementModule) ────────────────
const ALL_PERMISSIONS = [
  { key: 'view_dashboard',           label: 'Dashboard',                 category: 'General',    icon: '🏠' },
  { key: 'manage_settings',          label: 'Settings',                  category: 'General',    icon: '⚙️' },
  { key: 'students_list',            label: 'Students List',             category: 'Students',   icon: '🎓' },
  { key: 'students_admission',       label: 'Admission / New Student',   category: 'Students',   icon: '📋' },
  { key: 'students_profile',         label: 'Student Profile',           category: 'Students',   icon: '👤' },
  { key: 'students_promotion',       label: 'Class Promotion',           category: 'Students',   icon: '⬆️' },
  { key: 'students_tc',              label: 'TC / Documents',            category: 'Students',   icon: '📄' },
  { key: 'fees_overview',            label: 'Fees Overview',             category: 'Fees',       icon: '💰' },
  { key: 'fees_structures',          label: 'Fee Structures',            category: 'Fees',       icon: '📐' },
  { key: 'fees_student_ledgers',     label: 'Student Ledgers',           category: 'Fees',       icon: '📒' },
  { key: 'fees_directory',           label: 'Fees Directory',            category: 'Fees',       icon: '📂' },
  { key: 'fees_collect',             label: 'Collect Payment',           category: 'Fees',       icon: '💳' },
  { key: 'fees_receipt',             label: 'Fee Receipt / Print',       category: 'Fees',       icon: '🧾' },
  { key: 'attendance_board',         label: 'Class Board',               category: 'Attendance', icon: '🏫' },
  { key: 'attendance_registry',      label: 'Daily Registry',            category: 'Attendance', icon: '📅' },
  { key: 'attendance_calendar',      label: 'Monthly Calendar',          category: 'Attendance', icon: '📆' },
  { key: 'academic_school_profile',  label: 'School Profile',            category: 'School Setup',   icon: '🏛️' },
  { key: 'academic_sessions',        label: 'Academic Years',            category: 'School Setup',   icon: '📅' },
  { key: 'academic_holidays',        label: 'Holiday Planner',           category: 'School Setup',   icon: '🎉' },
  { key: 'academic_classes',         label: 'Classes & Sections',        category: 'School Setup',   icon: '📚' },
  { key: 'academic_staff',           label: 'Staff & Teachers',          category: 'School Setup',   icon: '👨‍🏫' },
  { key: 'academic_master_subjects', label: 'Master Subjects',           category: 'School Setup',   icon: '📖' },
  { key: 'academic_manage_class',    label: 'Manage Class (Timetable)',  category: 'School Setup',   icon: '🗓️' },
  { key: 'exam_dashboard',           label: 'Exam Dashboard',            category: 'Exams',      icon: '📊' },
  { key: 'exam_setup',               label: 'Exam Setup',                category: 'Exams',      icon: '⚙️' },
  { key: 'exam_paper_preparation',   label: 'Paper Preparation',         category: 'Exams',      icon: '📝' },
  { key: 'exam_invigilation',        label: 'Invigilation',              category: 'Exams',      icon: '👁️' },
  { key: 'exam_evaluation',          label: 'Evaluation Tracker',        category: 'Exams',      icon: '✅' },
  { key: 'exam_grading',             label: 'Student Grading',           category: 'Exams',      icon: '🏆' },
  { key: 'exam_report_cards',        label: 'Report Cards',              category: 'Exams',      icon: '📄' },
  { key: 'payroll_overview',         label: 'Payroll Overview',          category: 'HR',         icon: '💼' },
  { key: 'payroll_salary_settings',  label: 'Salary Settings',           category: 'HR',         icon: '💵' },
  { key: 'payroll_process',          label: 'Process Payroll',           category: 'HR',         icon: '🏦' },
  { key: 'manage_library',           label: 'Library',                   category: 'Facility',   icon: '📚' },
  { key: 'manage_transport',         label: 'Transport',                 category: 'Facility',   icon: '🚌' },
  { key: 'manage_hostel',            label: 'Hostel',                    category: 'Facility',   icon: '🏠' },
  { key: 'manage_inventory',         label: 'Inventory',                 category: 'Facility',   icon: '📦' },
  { key: 'manage_visitors',          label: 'Visitor Log',               category: 'Facility',   icon: '👋' },
  { key: 'reports_financial',        label: 'Financial Reports',         category: 'Reports',    icon: '📊' },
  { key: 'reports_academic',         label: 'Academic Reports',          category: 'Reports',    icon: '📈' },
  { key: 'reports_examination',      label: 'Examination Reports',       category: 'Reports',    icon: '📋' },
  { key: 'reports_hr_payroll',       label: 'HR & Payroll Reports',      category: 'Reports',    icon: '📉' },
  { key: 'verification_export',      label: 'Export Profile & Certificate', category: 'Network', icon: '📤' },
  { key: 'verification_import',      label: 'Import from Network',       category: 'Network',    icon: '📥' },
  { key: 'manage_parents',           label: 'Parent Portal',             category: 'Parents',    icon: '👨‍👩‍👧' },
  { key: 'manage_roles_basic',       label: 'Role Management (Basic)',   category: 'Admin',      icon: '🔐' },
  { key: 'manage_roles',             label: 'Role Management',           category: 'Admin',      icon: '🔐' },
];

const CATEGORIES = ['General', 'Students', 'Fees', 'Attendance', 'School Setup', 'Exams', 'HR', 'Facility', 'Reports', 'Network', 'Parents', 'Admin'];

const CAT_CFG = {
  General:    { color: 'from-blue-500 to-cyan-500',      text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30'    },
  Students:   { color: 'from-emerald-500 to-teal-500',   text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  Fees:       { color: 'from-amber-500 to-orange-500',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30'   },
  Attendance: { color: 'from-cyan-500 to-sky-500',       text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30'    },
  'School Setup': { color: 'from-indigo-500 to-purple-500',  text: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30'  },
  Exams:      { color: 'from-orange-500 to-rose-500',    text: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30'  },
  HR:         { color: 'from-teal-500 to-green-500',     text: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/30'    },
  Facility:   { color: 'from-purple-500 to-pink-500',    text: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30'  },
  Reports:    { color: 'from-rose-500 to-pink-500',      text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30'    },
  Network:    { color: 'from-sky-500 to-blue-500',       text: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/30'     },
  Parents:    { color: 'from-fuchsia-500 to-purple-500', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' },
  Admin:      { color: 'from-red-500 to-rose-500',       text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30'     },
};

const PRESET_PLANS = [
  { name: 'Basic Plan', icon: '🥉', perms: ['view_dashboard','students_list','students_admission','students_profile','students_promotion','students_tc','fees_overview','fees_structures','fees_student_ledgers','fees_directory','fees_collect','fees_receipt','attendance_board','attendance_registry','academic_school_profile','academic_classes','manage_roles_basic'] },
  { name: 'Standard Plan', icon: '🥈', perms: ['view_dashboard','students_list','students_admission','students_profile','students_promotion','students_tc','fees_overview','fees_structures','fees_student_ledgers','fees_directory','fees_collect','fees_receipt','attendance_board','attendance_registry','attendance_calendar','academic_school_profile','academic_sessions','academic_classes','academic_staff','academic_master_subjects','academic_manage_class','exam_dashboard','exam_setup','exam_grading','exam_report_cards','manage_roles'] },
  { name: 'Premium Plan', icon: '🥇', perms: ALL_PERMISSIONS.map(p => p.key) },
];

function formatTimeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SuperAdminModule() {
  const [tab, setTab] = useState('generate');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [expandedCats, setExpandedCats] = useState({});
  const [generating, setGenerating] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:1422/api';

  // Load token history from API
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch(`${API_BASE}/superadmin/tokens`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error('Failed to fetch tokens', err);
      }
    };
    fetchTokens();
  }, []);

  const saveHistory = async (entry) => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        const saved = await res.json();
        setHistory(prev => {
          const exists = prev.find(h => h.id === saved.id);
          if (exists) {
             return prev.map(h => h.id === saved.id ? saved : h);
          }
          return [saved, ...prev];
        });
      }
    } catch (err) {
      console.error('Failed to save token to DB', err);
    }
  };

  const togglePerm = (key) => {
    setSelectedPerms(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key]);
  };

  const toggleCat = (cat) => {
    const catKeys = ALL_PERMISSIONS.filter(p => p.category === cat).map(p => p.key);
    const allSelected = catKeys.every(k => selectedPerms.includes(k));
    if (allSelected) {
      setSelectedPerms(p => p.filter(k => !catKeys.includes(k)));
    } else {
      setSelectedPerms(p => [...new Set([...p, ...catKeys])]);
    }
  };

  const applyPreset = (preset) => {
    setSelectedPerms(preset.perms);
  };

  const handleGenerate = async () => {
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Valid email address required');
      return;
    }
    if (selectedPerms.length === 0) {
      setError('Select at least one permission');
      return;
    }
    setGenerating(true);
    try {
      const token = await generateLicenseToken(
        email.trim().toLowerCase(), 
        selectedPerms, 
        schoolName.trim() || 'Unknown School'
      );
      setGeneratedToken(token);
      saveHistory({
        email: email.trim().toLowerCase(),
        schoolName: schoolName.trim() || 'Unknown School',
        permissions: [...selectedPerms],
        tokenString: token
      });
    } catch (e) {
      setError('Token generation failed: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedToken) return;
    try {
      await navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = generatedToken;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const clearForm = () => {
    setEmail('');
    setSchoolName('');
    setSelectedPerms([]);
    setGeneratedToken('');
    setError('');
  };

  const deleteHistory = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/tokens/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(h => h.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete token', err);
    }
  };

  const updatePermissions = async (id, email, newPerms) => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/tokens/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPerms })
      });
      if (res.ok) {
        const updated = await res.json();
        setHistory(prev => prev.map(h => h.id === id ? updated : h));
        // Update local cache to immediately apply for the school admin on this PC
        const data = { permissions: newPerms, activatedAt: Date.now() };
        localStorage.setItem(`gdl_lic_${btoa(email)}`, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to update permissions', err);
    }
  };

  const [editingToken, setEditingToken] = useState(null);

  return (
    <div className="space-y-6 pb-20 w-full text-left">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-amber-500/20"
        style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.04) 50%, rgba(234,88,12,0.06) 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}>
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444)' }}>
              Super Admin Console
            </h1>
            <p className="text-muted-foreground mt-1 font-medium">
              Generate encrypted license tokens for your school clients
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest">GDLSofts Owner</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl w-fit">
        {[
          { id: 'generate', label: 'Generate Token', icon: Key },
          { id: 'history', label: `History (${history.length})`, icon: History },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t.id
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── GENERATE TAB ─── */}
      {tab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Config */}
          <div className="space-y-5">
            {/* School Info */}
            <div className="bg-card rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-sm">
              <h3 className="font-black text-foreground flex items-center gap-2 mb-5">
                <div className="p-2 bg-amber-500/10 rounded-xl"><Building2 className="w-4 h-4 text-amber-500" /></div>
                School / Client Info
              </h3>
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-amber-500 transition-colors">
                    Admin Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@xyzschool.com"
                      className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/15 outline-none text-foreground transition-all font-medium placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-amber-500 transition-colors">
                    School Name <span className="text-muted-foreground font-normal">(for your records)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="text"
                      value={schoolName}
                      onChange={e => setSchoolName(e.target.value)}
                      placeholder="XYZ International School"
                      className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/15 outline-none text-foreground transition-all font-medium placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preset Plans */}
            <div className="bg-card rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-sm">
              <h3 className="font-black text-foreground flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-xl"><Sparkles className="w-4 h-4 text-purple-500" /></div>
                Quick Plans
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_PLANS.map(plan => {
                  const isSelected = plan.perms.length === selectedPerms.length && plan.perms.every(p => selectedPerms.includes(p));
                  return (
                    <button key={plan.name} type="button" onClick={() => applyPreset(plan)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group ${
                        isSelected 
                          ? 'bg-purple-500/10 border-purple-500 shadow-sm shadow-purple-500/20' 
                          : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-purple-500/30 hover:bg-purple-500/5'
                      }`}>
                      <span className="text-2xl">{plan.icon}</span>
                      <span className={`text-[11px] font-black transition-colors text-center ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground group-hover:text-foreground'}`}>{plan.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-purple-500/70' : 'text-muted-foreground'}`}>{plan.perms.length} perms</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Permissions selector */}
            <div className="bg-card rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-foreground flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-xl"><Shield className="w-4 h-4 text-indigo-500" /></div>
                  Permissions
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedPerms(ALL_PERMISSIONS.map(p => p.key))}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all">
                    All
                  </button>
                  <button onClick={() => setSelectedPerms([])}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold text-muted-foreground bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 transition-all">
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {CATEGORIES.map(cat => {
                  const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat);
                  const cfg = CAT_CFG[cat];
                  const allSel = catPerms.every(p => selectedPerms.includes(p.key));
                  const somesel = catPerms.some(p => selectedPerms.includes(p.key));
                  const expanded = expandedCats[cat] ?? false;
                  const selCount = catPerms.filter(p => selectedPerms.includes(p.key)).length;
                  return (
                    <div key={cat} className={`rounded-2xl overflow-hidden border bg-card ${cfg.border}`}>
                      <button onClick={() => setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }))}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-all hover:opacity-90 ${cfg.bg}`}>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={allSel} ref={el => { if (el) el.indeterminate = somesel && !allSel; }}
                            onChange={() => toggleCat(cat)} onClick={e => e.stopPropagation()}
                            className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: '#f59e0b' }} />
                          <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${cfg.color}`} />
                          <span className={`font-bold text-sm ${cfg.text}`}>{cat}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>{selCount}/{catPerms.length}</span>
                        </div>
                        {expanded ? <ChevronDown className={`w-4 h-4 ${cfg.text} opacity-60`} /> : <ChevronRight className={`w-4 h-4 ${cfg.text} opacity-60`} />}
                      </button>
                      {expanded && (
                        <div className="grid grid-cols-2 gap-1.5 p-3">
                          {catPerms.map(perm => {
                            const checked = selectedPerms.includes(perm.key);
                            return (
                              <label key={perm.key}
                                className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all border text-xs ${
                                  checked ? `${cfg.bg} ${cfg.border}` : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                                }`}>
                                <input type="checkbox" checked={checked} onChange={() => togglePerm(perm.key)}
                                  className="w-3.5 h-3.5 rounded cursor-pointer flex-shrink-0" style={{ accentColor: '#f59e0b' }} />
                                <span>{perm.icon}</span>
                                <span className={`truncate font-semibold ${checked ? cfg.text : 'text-muted-foreground'}`}>{perm.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">
                  {selectedPerms.length} of {ALL_PERMISSIONS.length} selected
                </span>
              </div>
            </div>
          </div>

          {/* Right: Generate & Token Output */}
          <div className="space-y-5">
            {/* Summary card */}
            <div className="bg-card rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-sm">
              <h3 className="font-black text-foreground flex items-center gap-2 mb-5">
                <div className="p-2 bg-green-500/10 rounded-xl"><Zap className="w-4 h-4 text-green-500" /></div>
                Token Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <span className="text-sm font-bold text-muted-foreground">For email</span>
                  <span className="text-sm font-black text-foreground truncate max-w-[200px]">{email || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <span className="text-sm font-bold text-muted-foreground">School</span>
                  <span className="text-sm font-black text-foreground truncate max-w-[200px]">{schoolName || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <span className="text-sm font-bold text-muted-foreground">Permissions</span>
                  <span className="text-sm font-black text-amber-500">{selectedPerms.length} granted</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <span className="text-sm font-bold text-muted-foreground">Encryption</span>
                  <span className="text-sm font-black text-green-500">AES-256-GCM ✓</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <span className="text-sm font-bold text-muted-foreground">Email-tied</span>
                  <span className="text-sm font-black text-green-500">Non-transferable ✓</span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={generating}
              className="w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444)', boxShadow: '0 8px 30px rgba(245,158,11,0.35)' }}>
              {generating ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Generating Secure Token...</>
              ) : (
                <><Key className="w-5 h-5" /> Generate License Token</>
              )}
            </button>

            {/* Generated Token display */}
            {generatedToken && (
              <div className="bg-card rounded-3xl border border-green-500/30 overflow-hidden shadow-lg"
                style={{ boxShadow: '0 0 40px rgba(34,197,94,0.08)' }}>
                <div className="flex items-center gap-3 p-4 border-b border-green-500/20 bg-green-500/5">
                  <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-green-500 text-sm">Token Generated Successfully!</p>
                    <p className="text-xs text-muted-foreground">Share this with the school admin</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 font-mono text-xs text-foreground break-all leading-relaxed border border-black/10 dark:border-white/10 max-h-40 overflow-y-auto custom-scrollbar">
                    {generatedToken}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${
                        copied
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                          : 'bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10'
                      }`}>
                      {copied ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><ClipboardCopy className="w-4 h-4" /> Copy Token</>}
                    </button>
                    <button onClick={clearForm}
                      className="px-5 py-3 rounded-2xl font-bold text-sm text-muted-foreground hover:text-foreground bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    This token is encrypted with AES-256-GCM and bound to <strong className="mx-1">{email}</strong>. 
                    Only that email can activate it.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── HISTORY TAB ─── */}
      {tab === 'history' && (
        <div className="bg-card rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden">
          <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-black text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" /> Token Management
            </h3>
          </div>
          {history.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">No tokens found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/5 dark:bg-white/5 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 rounded-tl-2xl">School</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Permissions</th>
                    <th className="p-4">Generated</th>
                    <th className="p-4 text-center">Token</th>
                    <th className="p-4 text-right rounded-tr-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {history.map(h => (
                    <tr key={h.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-black text-foreground text-sm">{h.schoolName}</td>
                      <td className="p-4 text-xs font-medium text-muted-foreground">{h.email}</td>
                      <td className="p-4">
                        <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                          {h.permissions.length} perms
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-muted-foreground">
                        {new Date(h.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => {
                          navigator.clipboard.writeText(h.tokenString);
                          alert('Token Copied!');
                        }} className="font-mono text-[10px] text-muted-foreground bg-black/5 dark:bg-white/5 hover:bg-amber-500/10 hover:text-amber-500 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer">
                          <Key className="w-3 h-3" /> {h.tokenString.slice(0, 10)}...
                        </button>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button onClick={() => setEditingToken(h)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all">
                          Edit Perms
                        </button>
                        <button onClick={() => deleteHistory(h.id)}
                          className="p-1.5 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EDIT PERMISSIONS MODAL */}
      {editingToken && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl">Edit Permissions</h3>
                <p className="text-muted-foreground text-sm font-medium">Modifying permissions for <span className="text-amber-500 font-bold">{editingToken.schoolName}</span> ({editingToken.email})</p>
              </div>
              <button onClick={() => setEditingToken(null)} className="p-2 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['General', 'Academic', 'Finance & HR', 'Operations'].map(cat => {
                  const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat);
                  const isCatSelected = catPerms.every(p => editingToken.permissions.includes(p.key));
                  return (
                    <div key={cat} className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5">
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/5 dark:border-white/5">
                        <h4 className="font-black text-sm text-muted-foreground uppercase">{cat}</h4>
                        <button onClick={() => {
                          let newPerms;
                          if (isCatSelected) {
                            newPerms = editingToken.permissions.filter(k => !catPerms.map(p => p.key).includes(k));
                          } else {
                            newPerms = [...new Set([...editingToken.permissions, ...catPerms.map(p => p.key)])];
                          }
                          setEditingToken({ ...editingToken, permissions: newPerms });
                        }} className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors">
                          {isCatSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {catPerms.map(p => {
                          const isSelected = editingToken.permissions.includes(p.key);
                          return (
                            <label key={p.key} className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group">
                              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'bg-amber-500 border-amber-500 shadow-sm' : 'border-black/20 dark:border-white/20 group-hover:border-amber-500/50'
                              }`}>
                                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                  {p.label}
                                </p>
                                <p className="text-[10px] font-medium text-muted-foreground/70">{p.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground">
                <span className="text-amber-500 text-lg font-black">{editingToken.permissions.length}</span> / {ALL_PERMISSIONS.length} Permissions Selected
              </span>
              <div className="flex gap-3">
                <button onClick={() => setEditingToken(null)} className="px-6 py-3 rounded-2xl font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={() => {
                  updatePermissions(editingToken.id, editingToken.email, editingToken.permissions);
                  setEditingToken(null);
                }} className="px-8 py-3 rounded-2xl font-bold bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
