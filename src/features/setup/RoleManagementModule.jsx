import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Plus, Trash2, Edit2, Users, Lock, Save, X,
  UserPlus, Eye, EyeOff, RefreshCw, ChevronDown, ChevronRight,
  Star, AlertCircle, CheckCircle, Building2, Sparkles, Crown,
  Zap, Key, Shield
} from 'lucide-react';
import { getStoredPermissions } from '../../lib/crypto/tokenEngine.js';
import Modal from '../../components/ui/Modal';
const API = 'http://localhost:1422';

const ALL_PERMISSIONS = [
  // ─── GENERAL ────────────────────────────────────────────────
  { key: 'view_dashboard',              label: 'Dashboard',                    category: 'General',     icon: '🏠' },
  { key: 'manage_settings',             label: 'Settings',                     category: 'General',     icon: '⚙️' },

  // ─── STUDENT MODULE ──────────────────────────────────────────
  { key: 'students_list',               label: 'Students List',                category: 'Students',    icon: '🎓' },
  { key: 'students_admission',          label: 'Admission / New Student',      category: 'Students',    icon: '📋' },
  { key: 'students_profile',            label: 'Student Profile',              category: 'Students',    icon: '👤' },
  { key: 'students_promotion',          label: 'Class Promotion',              category: 'Students',    icon: '⬆️' },
  { key: 'students_tc',                 label: 'TC / Documents',               category: 'Students',    icon: '📄' },

  // ─── FEES MODULE ─────────────────────────────────────────────
  { key: 'fees_overview',               label: 'Fees Overview',                category: 'Fees',        icon: '💰' },
  { key: 'fees_structures',             label: 'Fee Structures',               category: 'Fees',        icon: '📐' },
  { key: 'fees_student_ledgers',        label: 'Student Ledgers',              category: 'Fees',        icon: '📒' },
  { key: 'fees_directory',              label: 'Fees Directory',               category: 'Fees',        icon: '📂' },
  { key: 'fees_collect',                label: 'Collect Payment',              category: 'Fees',        icon: '💳' },
  { key: 'fees_receipt',                label: 'Fee Receipt / Print',          category: 'Fees',        icon: '🧾' },

  // ─── ATTENDANCE MODULE ───────────────────────────────────────
  { key: 'attendance_board',            label: 'Class Board',                  category: 'Attendance',  icon: '🏫' },
  { key: 'attendance_registry',         label: 'Daily Registry',               category: 'Attendance',  icon: '📅' },
  { key: 'attendance_calendar',         label: 'Monthly Calendar',             category: 'Attendance',  icon: '📆' },

  // ─── SCHOOL SETUP MODULE ───────────────────────────────────
  { key: 'academic_school_profile',     label: 'School Profile',               category: 'School Setup',    icon: '🏛️' },
  { key: 'academic_sessions',           label: 'Academic Years / Sessions',    category: 'School Setup',    icon: '📅' },
  { key: 'academic_holidays',           label: 'Holiday Planner',              category: 'School Setup',    icon: '🎉' },
  { key: 'academic_classes',            label: 'Classes & Sections',           category: 'School Setup',    icon: '📚' },
  { key: 'academic_staff',              label: 'Staff & Teachers',             category: 'School Setup',    icon: '👨‍🏫' },
  { key: 'academic_master_subjects',    label: 'Master Subjects',              category: 'School Setup',    icon: '📖' },
  { key: 'academic_manage_class',       label: 'Manage Class (Timetable)',     category: 'School Setup',    icon: '🗓️' },

  // ─── EXAM MODULE ─────────────────────────────────────────────
  { key: 'exam_dashboard',              label: 'Exam Dashboard',               category: 'Exams',       icon: '📊' },
  { key: 'exam_setup',                  label: 'Exam Setup',                   category: 'Exams',       icon: '⚙️' },
  { key: 'exam_paper_preparation',      label: 'Paper Preparation',            category: 'Exams',       icon: '📝' },
  { key: 'exam_invigilation',           label: 'Invigilation',                 category: 'Exams',       icon: '👁️' },
  { key: 'exam_evaluation',             label: 'Evaluation Tracker',           category: 'Exams',       icon: '✅' },
  { key: 'exam_grading',                label: 'Student Grading',              category: 'Exams',       icon: '🏆' },
  { key: 'exam_report_cards',           label: 'Report Cards',                 category: 'Exams',       icon: '📄' },

  // ─── HR & PAYROLL MODULE ─────────────────────────────────────
  { key: 'payroll_overview',            label: 'Payroll Overview',             category: 'HR',          icon: '💼' },
  { key: 'payroll_salary_settings',     label: 'Salary Settings',              category: 'HR',          icon: '💵' },
  { key: 'payroll_process',             label: 'Process Payroll',              category: 'HR',          icon: '🏦' },

  // ─── FACILITY MODULES ────────────────────────────────────────
  { key: 'manage_library',              label: 'Library',                      category: 'Facility',    icon: '📚' },
  { key: 'manage_transport',            label: 'Transport',                    category: 'Facility',    icon: '🚌' },
  { key: 'manage_hostel',               label: 'Hostel',                       category: 'Facility',    icon: '🏠' },
  { key: 'manage_inventory',            label: 'Inventory',                    category: 'Facility',    icon: '📦' },
  { key: 'manage_visitors',             label: 'Visitor Log',                  category: 'Facility',    icon: '👋' },

  // ─── REPORTS MODULE ──────────────────────────────────────────
  { key: 'reports_financial',           label: 'Financial Reports',            category: 'Reports',     icon: '📊' },
  { key: 'reports_academic',            label: 'Academic Reports',             category: 'Reports',     icon: '📈' },
  { key: 'reports_examination',         label: 'Examination Reports',          category: 'Reports',     icon: '📋' },
  { key: 'reports_hr_payroll',          label: 'HR & Payroll Reports',         category: 'Reports',     icon: '📉' },

  // ─── VERIFICATION / NETWORK MODULE ──────────────────────────
  { key: 'verification_export',         label: 'Export Profile & Certificate', category: 'Network',     icon: '📤' },
  { key: 'verification_import',         label: 'Import from Network',          category: 'Network',     icon: '📥' },

  // ─── PARENT MODULE ───────────────────────────────────────────
  { key: 'manage_parents',              label: 'Parent Portal',                category: 'Parents',     icon: '👨‍👩‍👧' },

  // ─── ADMIN MODULE ────────────────────────────────────────────
  { key: 'manage_roles_basic',          label: 'Role Management (Basic)',      category: 'Admin',       icon: '🔐' },
  { key: 'manage_roles',                label: 'Role Management',              category: 'Admin',       icon: '🔐' },
];

const CATEGORIES = ['General', 'Students', 'Fees', 'Attendance', 'School Setup', 'Exams', 'HR', 'Facility', 'Reports', 'Network', 'Parents', 'Admin'];

const CATEGORY_CONFIG = {
  General:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/30',    gradient: 'from-blue-500 to-cyan-500',       glow: 'shadow-blue-500/20'    },
  Students:   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-teal-500',    glow: 'shadow-emerald-500/20' },
  Fees:       { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30',   gradient: 'from-amber-500 to-orange-500',    glow: 'shadow-amber-500/20'   },
  Attendance: { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/30',    gradient: 'from-cyan-500 to-sky-500',        glow: 'shadow-cyan-500/20'    },
  'School Setup': { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/30',  gradient: 'from-indigo-500 to-purple-500',   glow: 'shadow-indigo-500/20'  },
  Exams:      { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/30',  gradient: 'from-orange-500 to-rose-500',     glow: 'shadow-orange-500/20'  },
  HR:         { bg: 'bg-teal-500/10',    text: 'text-teal-400',    border: 'border-teal-500/30',    gradient: 'from-teal-500 to-green-500',      glow: 'shadow-teal-500/20'    },
  Facility:   { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/30',  gradient: 'from-purple-500 to-pink-500',     glow: 'shadow-purple-500/20'  },
  Reports:    { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/30',    gradient: 'from-rose-500 to-pink-500',       glow: 'shadow-rose-500/20'    },
  Network:    { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/30',     gradient: 'from-sky-500 to-blue-500',        glow: 'shadow-sky-500/20'     },
  Parents:    { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', gradient: 'from-fuchsia-500 to-purple-500',  glow: 'shadow-fuchsia-500/20' },
  Admin:      { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/30',     gradient: 'from-red-500 to-rose-500',        glow: 'shadow-red-500/20'     },
};


const ROLE_ROLE_STYLES = {
  'Super Admin': { gradient: 'from-amber-400 via-orange-400 to-yellow-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: '0 0 30px rgba(251,191,36,0.15)', icon: Crown, iconColor: 'text-amber-400' },
  'Admin':       { gradient: 'from-indigo-400 via-purple-400 to-blue-400',  bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: '0 0 30px rgba(99,102,241,0.15)', icon: Building2, iconColor: 'text-indigo-400' },
  default:       { gradient: 'from-slate-400 via-slate-300 to-slate-400',   bg: 'bg-slate-700/50',  border: 'border-slate-600/50',  glow: '0 0 30px rgba(148,163,184,0.1)', icon: ShieldCheck, iconColor: 'text-slate-400' },
};

const ROLE_TEMPLATES = {
  accountant: {
    name: 'Accountant',
    description: 'Manages school finances and fee collection',
    permissions: ['fees_overview', 'fees_structures', 'fees_student_ledgers', 'fees_directory', 'fees_collect', 'fees_receipt', 'reports_financial', 'payroll_overview', 'payroll_process', 'students_promotion', 'students_tc']
  },
  teacher: {
    name: 'Teacher',
    description: 'Manages classroom attendance and academics',
    permissions: ['view_dashboard', 'attendance_board', 'attendance_registry', 'students_list', 'students_profile', 'exam_evaluation', 'exam_grading', 'students_promotion', 'students_tc', 'fees_structures', 'fees_student_ledgers', 'fees_directory']
  },
  librarian: {
    name: 'Librarian',
    description: 'Manages library and book inventory',
    permissions: ['view_dashboard', 'manage_library', 'manage_inventory', 'students_promotion', 'students_tc', 'fees_structures', 'fees_student_ledgers', 'fees_directory']
  },
  hr_manager: {
    name: 'HR Manager',
    description: 'Manages staff payroll and attendance',
    permissions: ['view_dashboard', 'academic_staff', 'payroll_overview', 'payroll_salary_settings', 'payroll_process', 'reports_hr_payroll', 'students_promotion', 'students_tc', 'fees_structures', 'fees_student_ledgers', 'fees_directory']
  }
};

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

export default function RoleManagementModule() {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const currentRole = localStorage.getItem('gdl_current_role') || 'Admin';
  
  // Basic plan role restrictions
  const activeTenant = localStorage.getItem('gdl_active_tenant') || '';
  const systemPerms = getStoredPermissions(activeTenant) || [];
  const isBasicRolePlan = systemPerms.includes('manage_roles_basic') && !systemPerms.includes('manage_roles');
  
  const availableTemplates = Object.keys(ROLE_TEMPLATES).filter(k => !roles.some(r => r.name === ROLE_TEMPLATES[k].name));
  const canAddNewRole = !isBasicRolePlan || availableTemplates.length > 0;
  const [toast, setToast] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '', roleId: '', editingId: null });
  const [showPassword, setShowPassword] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({ General: true, Students: true, Fees: true, Attendance: true, 'School Setup': true, Exams: true, HR: true, Facility: true, Reports: true, Network: true, Parents: true, Admin: true });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([fetch(`${API}/api/roles`), fetch(`${API}/api/users`)]);
      const rolesData = await rolesRes.json();
      const usersData = await usersRes.json();
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch { showToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  }, []);

  const seedRoles = async () => {
    await fetch(`${API}/api/roles/seed`, { method: 'POST' });
    fetchData();
    showToast('System roles initialized successfully!');
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNewRole = () => { setEditingRole(null); setRoleForm({ name: '', description: '', permissions: [] }); setShowRoleForm(true); };
  const openEditRole = (role) => { setEditingRole(role); setRoleForm({ name: role.name, description: role.description || '', permissions: [...role.permissions] }); setShowRoleForm(true); };
  
  const applyTemplate = (templateKey) => {
    if (!templateKey) return;
    const template = ROLE_TEMPLATES[templateKey];
    if (template) {
      setRoleForm(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        permissions: template.permissions
      }));
      showToast(`Applied ${template.name} template!`);
    }
  };

  const togglePermission = (key) => setRoleForm(prev => ({ ...prev, permissions: prev.permissions.includes(key) ? prev.permissions.filter(p => p !== key) : [...prev.permissions, key] }));
  const selectCategory = (cat) => {
    const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat).map(p => p.key);
    const allSelected = catPerms.every(p => roleForm.permissions.includes(p));
    setRoleForm(prev => ({ ...prev, permissions: allSelected ? prev.permissions.filter(p => !catPerms.includes(p)) : [...new Set([...prev.permissions, ...catPerms])] }));
  };

  const saveRole = async () => {
    if (!roleForm.name.trim()) return showToast('Role name is required.', 'error');
    try {
      const method = editingRole ? 'PUT' : 'POST';
      const url = editingRole ? `${API}/api/roles/${editingRole.id}` : `${API}/api/roles`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(roleForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editingRole ? 'Role updated successfully!' : 'New role created!');
      setShowRoleForm(false); fetchData();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const deleteRole = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      const res = await fetch(`${API}/api/roles/${role.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Role deleted.'); fetchData();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const openNewUser = () => { setUserForm({ username: '', password: '', roleId: roles[0]?.id || '', editingId: null }); setShowPassword(false); setShowUserForm(true); };
  const openEditUser = (user) => { setUserForm({ username: user.username, password: '', roleId: user.roleId || '', editingId: user.id }); setShowPassword(false); setShowUserForm(true); };

  const saveUser = async () => {
    try {
      if (userForm.editingId) {
        const data = { roleId: userForm.roleId };
        if (userForm.password) data.passwordHash = simpleHash(userForm.password);
        const res = await fetch(`${API}/api/users/${userForm.editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        showToast('User updated!');
      } else {
        if (!userForm.username.trim() || !userForm.password) return showToast('Username and password required.', 'error');
        const res = await fetch(`${API}/api/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: userForm.username, passwordHash: simpleHash(userForm.password), roleId: userForm.roleId || null }) });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        showToast('User account created!');
      }
      setShowUserForm(false); fetchData();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const toggleUserActive = async (user) => {
    const res = await fetch(`${API}/api/users/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !user.isActive }) });
    if (res.ok) { showToast(user.isActive ? 'User deactivated.' : 'User activated.'); fetchData(); }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    const res = await fetch(`${API}/api/users/${user.id}`, { method: 'DELETE' });
    if (res.ok) { showToast('User deleted.'); fetchData(); }
  };

  const availablePermissions = (currentRole === 'Super Admin' || localStorage.getItem('gdl_active_tenant') === 'superadmin')
    ? ALL_PERMISSIONS.map(p => p.key)
    : (systemPerms.length > 0 ? systemPerms : ALL_PERMISSIONS.map(p => p.key));

  const getRoleStyle = (role) => ROLE_ROLE_STYLES[role.name] || ROLE_ROLE_STYLES.default;

  if (currentRole !== 'Super Admin' && currentRole !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
          <Shield className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground font-medium">You do not have permission to view or manage roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(60px)' }} />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm border transition-all ${
          toast.type === 'error'
            ? 'bg-gradient-to-r from-red-600 to-rose-600 border-red-500/50 shadow-red-500/30'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-500/50 shadow-emerald-500/30'
        }`} style={{ boxShadow: toast.type === 'error' ? '0 0 30px rgba(239,68,68,0.3)' : '0 0 30px rgba(16,185,129,0.3)' }}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-purple-500/20"
        style={{ background: 'linear-gradient(135deg, rgba(88,28,135,0.4) 0%, rgba(67,56,202,0.3) 50%, rgba(15,23,42,0.8) 100%)', boxShadow: '0 0 60px rgba(139,92,246,0.1)' }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', filter: 'blur(30px)' }} />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 opacity-10" style={{ background: 'radial-gradient(circle, #818cf8, transparent)', filter: 'blur(30px)' }} />
        <div className="absolute top-4 right-4 opacity-5">
          <Shield className="w-32 h-32 text-purple-300" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}>
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-black text-white">Role Management</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> RBAC
                </span>
              </div>
              <p className="text-purple-200/70 text-sm">Define roles and control who can access what across the school system</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>{roles.length} Roles</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{users.length} Users</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ALL_PERMISSIONS.length} Permissions</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={seedRoles}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-purple-300 text-sm font-semibold transition-all hover:scale-105 border border-purple-500/30 hover:border-purple-400/50"
              style={{ background: 'rgba(88,28,135,0.3)', backdropFilter: 'blur(10px)' }}>
              <Zap className="w-4 h-4" /> Init System Roles
            </button>
            <button onClick={fetchData}
              className="p-2.5 rounded-xl text-slate-300 transition-all hover:scale-105 border border-slate-600/50 hover:border-slate-500"
              style={{ background: 'rgba(30,41,59,0.5)' }}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit bg-black/5 dark:bg-slate-900/80 border border-black/10 dark:border-white/10">
        {[['roles', ShieldCheck, 'Roles & Permissions'], ['users', Users, 'User Accounts']].map(([tab, Icon, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab
                ? 'text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={activeTab === tab ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' } : {}}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ===== ROLES TAB ===== */}
      {activeTab === 'roles' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button onClick={openNewRole} disabled={!canAddNewRole}
              className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold text-sm transition-all ${
                canAddNewRole 
                  ? 'hover:scale-105 active:scale-95' 
                  : 'opacity-50 cursor-not-allowed grayscale'
              }`}
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 20px rgba(79,70,229,0.4)' }}>
              <Plus className="w-4 h-4" /> {isBasicRolePlan ? 'Add Default Role' : 'New Custom Role'}
            </button>
          </div>

          {roles.length === 0 && !loading && (
            <div className="text-center py-24 rounded-3xl border border-dashed border-black/10 dark:border-slate-700/60 bg-black/5 dark:bg-slate-900/50">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.2))' }}>
                <ShieldCheck className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-foreground font-bold text-lg mb-2">No Roles Configured</h3>
              <p className="text-muted-foreground text-sm mb-6">Start by initializing the default system roles</p>
              <button onClick={seedRoles}
                className="px-8 py-3 text-white font-bold rounded-xl hover:scale-105 transition-all inline-flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                <Zap className="w-4 h-4" /> Initialize System Roles
              </button>
            </div>
          )}

          <div className="grid gap-4">
            {roles.map((role, idx) => {
              const style = getRoleStyle(role);
              const RoleIcon = style.icon;
              const totalPerms = ALL_PERMISSIONS.length;
              const rolePerms = role.permissions.length;
              const pct = Math.round((rolePerms / totalPerms) * 100);

              return (
                <div key={role.id} className={`rounded-3xl p-6 border bg-card transition-all hover:scale-[1.005] group border-black/8 dark:border-white/8`}
                  style={{ boxShadow: style.glow }}>
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon + Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${style.bg} border ${style.border}`}>
                        <RoleIcon className={`w-7 h-7 ${style.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-foreground font-black text-xl">{role.name}</h3>
                          {role.name === 'Super Admin' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              <Crown className="w-3 h-3" /> Owner
                            </span>
                          )}
                          {role.isSystem && role.name !== 'Super Admin' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{role.description || 'No description provided'}</p>

                        {/* Permission progress bar */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${role.name === 'Super Admin' ? '#f59e0b, #ef4444' : '#6366f1, #8b5cf6'})` }} />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">{rolePerms}/{totalPerms} permissions</span>
                        </div>

                        {/* Permission category badges */}
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.length === 0 && <span className="text-muted-foreground text-xs italic">No permissions assigned</span>}
                          {CATEGORIES.map(cat => {
                            const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat && role.permissions.includes(p.key));
                            if (catPerms.length === 0) return null;
                            const cfg = CATEGORY_CONFIG[cat];
                            const total = ALL_PERMISSIONS.filter(p => p.category === cat).length;
                            const full = catPerms.length === total;
                            return (
                              <span key={cat} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                {full && <CheckCircle className="w-3 h-3" />}
                                {cat} {full ? '✓' : `${catPerms.length}/${total}`}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-black/5 dark:bg-slate-800/80 border border-black/10 dark:border-white/10">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground">{role._count?.users || 0}</span>
                        <span className="text-muted-foreground text-xs">users</span>
                      </div>
                      {role.name !== 'Super Admin' && (
                        <div className="flex gap-2">
                          <button onClick={() => openEditRole(role)}
                            className="p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all hover:scale-110 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!role.isSystem && (
                            <button onClick={() => deleteRole(role)}
                              className="p-2.5 rounded-xl text-red-500 hover:text-white hover:bg-red-600 transition-all hover:scale-110 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== USERS TAB ===== */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button onClick={openNewUser}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', boxShadow: '0 4px 20px rgba(5,150,105,0.4)' }}>
              <UserPlus className="w-4 h-4" /> New User Account
            </button>
          </div>

          <div className="grid gap-3">
            {users.map(user => (
              <div key={user.id}
                className="flex items-center gap-4 p-4 rounded-2xl border bg-card border-black/8 dark:border-white/8 transition-all hover:shadow-lg group">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
                  {user.username[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground font-bold">{user.username}</span>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${user.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className={`text-xs font-semibold ${user.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.role ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {user.role.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">No role assigned</span>
                    )}
                    {user.employeeId && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                        Employee Linked
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => toggleUserActive(user)}
                    className={`p-2 rounded-xl transition-all hover:scale-110 ${user.isActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                    style={{ background: user.isActive ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${user.isActive ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                    {user.isActive ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEditUser(user)}
                    className="p-2 rounded-xl text-indigo-400 hover:text-indigo-300 transition-all hover:scale-110"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteUser(user)}
                    className="p-2 rounded-xl text-red-400 hover:text-red-300 transition-all hover:scale-110"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-20 rounded-3xl border border-dashed border-black/10 dark:border-slate-700/60">
                <Users className="w-14 h-14 text-black/20 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-muted-foreground">No user accounts found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ROLE FORM MODAL ===== */}
      <Modal
        isOpen={showRoleForm}
        onClose={() => setShowRoleForm(false)}
        title={editingRole ? `Edit: ${editingRole.name}` : 'Create New Role'}
        icon={ShieldCheck}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
              {/* Role Templates Suggestion (Only for new roles) */}
              {!editingRole && (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-bold text-sm text-indigo-400">Recommended Templates</h4>
                  </div>
                  <select 
                    onChange={(e) => applyTemplate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-foreground bg-black/10 dark:bg-slate-900/50 border border-black/10 dark:border-white/10 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
                  >
                    {Object.entries(ROLE_TEMPLATES)
                      .filter(([key, tpl]) => !isBasicRolePlan || !roles.some(r => r.name === tpl.name))
                      .map(([key, tpl]) => (
                      <option key={key} value={key}>{tpl.name} ({tpl.permissions.length} permissions)</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name & Desc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Role Name *</label>
                  <input value={roleForm.name} onChange={e => setRoleForm(p => ({ ...p, name: e.target.value }))}
                    disabled={editingRole?.isSystem || isBasicRolePlan}
                    placeholder={isBasicRolePlan ? "Select a template above" : "e.g., Accountant"}
                    className="w-full px-4 py-3 rounded-xl text-foreground bg-black/5 dark:bg-white/5 placeholder-slate-400 dark:placeholder-slate-600 border border-black/10 dark:border-white/10 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
                  <input value={roleForm.description} onChange={e => setRoleForm(p => ({ ...p, description: e.target.value }))}
                    disabled={isBasicRolePlan}
                    placeholder="Brief description"
                    className="w-full px-4 py-3 rounded-xl text-foreground bg-black/5 dark:bg-white/5 placeholder-slate-400 dark:placeholder-slate-600 border border-black/10 dark:border-white/10 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all" />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-sm font-bold text-foreground uppercase tracking-wider">Permissions</label>
                    <p className="text-muted-foreground text-xs mt-0.5">{roleForm.permissions.length} of {availablePermissions.length} selected</p>
                  </div>
                  <div className="flex gap-2">
                    {!isBasicRolePlan && (
                      <>
                        <button onClick={() => setRoleForm(p => ({ ...p, permissions: [...availablePermissions] }))}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold text-indigo-600 dark:text-indigo-300 hover:text-white hover:bg-indigo-600 transition-all bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30">
                          Select All
                        </button>
                        <button onClick={() => setRoleForm(p => ({ ...p, permissions: [] }))}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-all">
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {CATEGORIES.map(cat => {
                    const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat && availablePermissions.includes(p.key));
                    if (catPerms.length === 0) return null;
                    const cfg = CATEGORY_CONFIG[cat];
                    const allCatSelected = catPerms.every(p => roleForm.permissions.includes(p.key));
                    const expanded = expandedCategories[cat];
                    const selectedCount = catPerms.filter(p => roleForm.permissions.includes(p.key)).length;

                    return (
                      <div key={cat} className={`rounded-2xl overflow-hidden border bg-card ${cfg.border}`}>
                        <button onClick={() => setExpandedCategories(p => ({ ...p, [cat]: !p[cat] }))}
                          className={`w-full flex items-center justify-between px-4 py-3.5 transition-all hover:opacity-90 ${cfg.bg}`}>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={allCatSelected}
                              disabled={isBasicRolePlan}
                              onChange={() => selectCategory(cat)}
                              onClick={e => e.stopPropagation()}
                              className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: '#8b5cf6' }} />
                            <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${cfg.gradient}`} />
                            <span className={`font-bold text-sm ${cfg.text}`}>{cat}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{selectedCount}/{catPerms.length}</span>
                          </div>
                          {expanded ? <ChevronDown className={`w-4 h-4 ${cfg.text} opacity-60`} /> : <ChevronRight className={`w-4 h-4 ${cfg.text} opacity-60`} />}
                        </button>
                        {expanded && (
                          <div className="grid grid-cols-2 gap-2 p-3">
                            {catPerms.map(perm => {
                              const checked = roleForm.permissions.includes(perm.key);
                              return (
                                <label key={perm.key}
                                  className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer transition-all border ${
                                    checked
                                      ? `${cfg.bg} ${cfg.border}`
                                      : 'border-transparent hover:border-black/10 dark:hover:border-slate-600/50 hover:bg-black/5 dark:hover:bg-white/5'
                                  }`}>
                                  <input type="checkbox" checked={checked} onChange={() => togglePermission(perm.key)}
                                    disabled={isBasicRolePlan}
                                    className="w-4 h-4 rounded cursor-pointer flex-shrink-0" style={{ accentColor: '#8b5cf6' }} />
                                  <span className="text-base">{perm.icon}</span>
                                  <span className={`text-sm font-semibold truncate ${checked ? cfg.text : 'text-muted-foreground'}`}>
                                    {perm.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowRoleForm(false)}
                  className="flex-1 px-5 py-3 rounded-xl text-muted-foreground font-bold hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-all">
                  Cancel
                </button>
                <button onClick={saveRole}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl text-white font-black hover:scale-105 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
                  <Save className="w-4 h-4" /> Save Role
                </button>
              </div>
        </div>
      </Modal>

      {/* ===== USER FORM MODAL ===== */}
      <Modal
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        title={userForm.editingId ? 'Edit Account' : 'New User Account'}
        icon={UserPlus}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Username *</label>
                <input value={userForm.username} onChange={e => setUserForm(p => ({ ...p, username: e.target.value }))}
                  disabled={!!userForm.editingId} placeholder="e.g., john.doe"
                  className="w-full px-4 py-3 rounded-xl text-foreground bg-black/5 dark:bg-white/5 placeholder-slate-400 dark:placeholder-slate-600 border border-black/10 dark:border-white/10 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {userForm.editingId ? 'New Password (blank = keep current)' : 'Password *'}
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={userForm.password}
                    onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-xl text-foreground bg-black/5 dark:bg-white/5 placeholder-slate-400 dark:placeholder-slate-600 border border-black/10 dark:border-white/10 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all pr-12" />
                  <button onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Assign Role</label>
                <select value={userForm.roleId} onChange={e => setUserForm(p => ({ ...p, roleId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-foreground bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all">
                  <option value="">-- No Role --</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUserForm(false)}
                  className="flex-1 px-5 py-3 rounded-xl text-muted-foreground font-bold hover:text-foreground bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-all">
                  Cancel
                </button>
                <button onClick={saveUser}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl text-white font-black hover:scale-105 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', boxShadow: '0 4px 20px rgba(5,150,105,0.4)' }}>
                  <Save className="w-4 h-4" /> Save User
                </button>
              </div>
        </div>
      </Modal>
    </div>
  );
}
