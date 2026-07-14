import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalContext } from '../context/GlobalContext';
import { getStoredPermissions } from '../lib/crypto/tokenEngine.js';
import SettingsModule from '../features/settings/SettingsModule';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Wallet, 
  BookOpen, 
  Settings, 
  LogOut,
  Bell,
  Search,
  CalendarCheck,
  Briefcase,
  FileSpreadsheet,
  FileBarChart,
  Bus,
  Home,
  Package,
  UserCheck,
  Menu,
  HeartHandshake,
  Sun,
  Moon,
  CreditCard,
  Lock,
  Award,
  ShieldCheck,
  X,
  Crown,
  Key
} from 'lucide-react';

const MENU_GROUPS = [
  {
    group: "Overview",
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/', color: 'text-indigo-500', bg: 'bg-indigo-500/10', defaultLocked: false, requiredPerm: ['view_dashboard'] },
    ]
  },
  {
    group: "Master Config & Staff",
    items: [
      { icon: GraduationCap, label: 'School Setup', path: '/academics', color: 'text-purple-500', bg: 'bg-purple-500/10', defaultLocked: false, requiredPerm: ['academic_school_profile'] },
    ]
  },
  {
    group: "Admissions",
    items: [
      { icon: Users, label: 'Students', path: '/students', color: 'text-blue-500', bg: 'bg-blue-500/10', defaultLocked: false, requiredPerm: ['students_list', 'students_admission'] },
      { icon: HeartHandshake, label: 'Parents', path: '/parents', color: 'text-pink-500', bg: 'bg-pink-500/10', defaultLocked: false, requiredPerm: ['manage_parents'] },
      { icon: CreditCard, label: 'Fees & Finance', path: '/fees', color: 'text-emerald-500', bg: 'bg-emerald-500/10', defaultLocked: false, requiredPerm: ['fees_overview'] },
    ]
  },
  {
    group: "Daily Operations",
    items: [
      { icon: CalendarCheck, label: 'Attendance', path: '/attendance', color: 'text-emerald-500', bg: 'bg-emerald-500/10', defaultLocked: false, requiredPerm: ['attendance_board', 'attendance_registry'] },
      { icon: Bus, label: 'Transport', path: '/transport', color: 'text-yellow-500', bg: 'bg-yellow-500/10', defaultLocked: true, requiredPerm: ['manage_transport'] },
      { icon: Home, label: 'Hostel', path: '/hostel', color: 'text-teal-500', bg: 'bg-teal-500/10', defaultLocked: true, requiredPerm: ['manage_hostel'] },
      { icon: UserCheck, label: 'Visitor', path: '/visitor', color: 'text-sky-500', bg: 'bg-sky-500/10', defaultLocked: true, requiredPerm: ['manage_visitors'] },
      { icon: BookOpen, label: 'Library', path: '/library', color: 'text-rose-500', bg: 'bg-rose-500/10', defaultLocked: true, requiredPerm: ['manage_library'] },
      { icon: Package, label: 'Inventory', path: '/inventory', color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', defaultLocked: true, requiredPerm: ['manage_inventory'] },
    ]
  },
  {
    group: "Finance & Exams",
    items: [
      { icon: Briefcase, label: 'Payroll', path: '/payroll', color: 'text-emerald-500', bg: 'bg-emerald-500/10', defaultLocked: false, requiredPerm: ['payroll_overview'] },
      { icon: FileSpreadsheet, label: 'Exams', path: '/exams', color: 'text-orange-500', bg: 'bg-orange-500/10', defaultLocked: false, requiredPerm: ['exam_dashboard', 'exam_setup'] },
    ]
  },
  {
    group: "System & Reports",
    items: [
      { icon: Award, label: 'Verification Net', path: '/verification', color: 'text-sky-500', bg: 'bg-sky-500/10', defaultLocked: false, requiredPerm: ['verification_export'] },
      { icon: FileBarChart, label: 'Reports', path: '/reports', color: 'text-red-500', bg: 'bg-red-500/10', defaultLocked: false, requiredPerm: ['reports_academic', 'reports_financial'] },
      { icon: ShieldCheck, label: 'Role Management', path: '/roles', color: 'text-purple-500', bg: 'bg-purple-500/10', defaultLocked: false, roles: ['Admin', 'Super Admin'], requiredPerm: ['manage_roles', 'manage_roles_basic'] },
      { icon: Crown, label: 'Super Admin', path: '/superadmin', color: 'text-amber-500', bg: 'bg-amber-500/10', defaultLocked: false, roles: ['Super Admin'] },
      { icon: Settings, label: 'Settings', path: '/settings', color: 'text-slate-500', bg: 'bg-slate-500/10', defaultLocked: false },
    ]
  }
];

const getColorClasses = (colorName) => {
  const mapping = {
    indigo: {
      containerActive: 'bg-gradient-to-r from-indigo-500/20 via-indigo-500/5 to-transparent text-indigo-600 dark:text-indigo-400',
      containerInactive: 'hover:bg-indigo-500/[0.04] text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400',
      indicator: 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]',
      iconActive: 'bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-500/15',
      iconInactive: 'bg-indigo-500/5 text-indigo-500/70 dark:text-indigo-400/70 border border-indigo-500/10 group-hover:bg-indigo-500/15 group-hover:text-indigo-500 group-hover:border-indigo-500/20',
      textActive: 'text-indigo-600 dark:text-indigo-400 font-extrabold',
      textInactive: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-semibold'
    },
    purple: {
      containerActive: 'bg-gradient-to-r from-purple-500/20 via-purple-500/5 to-transparent text-purple-600 dark:text-purple-400',
      containerInactive: 'hover:bg-purple-500/[0.04] text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400',
      indicator: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]',
      iconActive: 'bg-purple-500/25 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-md shadow-purple-500/15',
      iconInactive: 'bg-purple-500/5 text-purple-500/70 dark:text-purple-400/70 border border-purple-500/10 group-hover:bg-purple-500/15 group-hover:text-purple-500 group-hover:border-purple-500/20',
      textActive: 'text-purple-600 dark:text-purple-400 font-extrabold',
      textInactive: 'group-hover:text-purple-600 dark:group-hover:text-purple-400 font-semibold'
    },
    blue: {
      containerActive: 'bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-transparent text-blue-600 dark:text-blue-400',
      containerInactive: 'hover:bg-blue-500/[0.04] text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400',
      indicator: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]',
      iconActive: 'bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/15',
      iconInactive: 'bg-blue-500/5 text-blue-500/70 dark:text-blue-400/70 border border-blue-500/10 group-hover:bg-blue-500/15 group-hover:text-blue-500 group-hover:border-blue-500/20',
      textActive: 'text-blue-600 dark:text-blue-400 font-extrabold',
      textInactive: 'group-hover:text-blue-600 dark:group-hover:text-blue-400 font-semibold'
    },
    pink: {
      containerActive: 'bg-gradient-to-r from-pink-500/20 via-pink-500/5 to-transparent text-pink-600 dark:text-pink-400',
      containerInactive: 'hover:bg-pink-500/[0.04] text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400',
      indicator: 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.6)]',
      iconActive: 'bg-pink-500/25 text-pink-600 dark:text-pink-400 border border-pink-500/30 shadow-md shadow-pink-500/15',
      iconInactive: 'bg-pink-500/5 text-pink-500/70 dark:text-pink-400/70 border border-pink-500/10 group-hover:bg-pink-500/15 group-hover:text-pink-500 group-hover:border-pink-500/20',
      textActive: 'text-pink-600 dark:text-pink-400 font-extrabold',
      textInactive: 'group-hover:text-pink-600 dark:group-hover:text-pink-400 font-semibold'
    },
    emerald: {
      containerActive: 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/5 to-transparent text-emerald-600 dark:text-emerald-400',
      containerInactive: 'hover:bg-emerald-500/[0.04] text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400',
      indicator: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]',
      iconActive: 'bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/15',
      iconInactive: 'bg-emerald-500/5 text-emerald-500/70 dark:text-emerald-400/70 border border-emerald-500/10 group-hover:bg-emerald-500/15 group-hover:text-emerald-500 group-hover:border-emerald-500/20',
      textActive: 'text-emerald-600 dark:text-emerald-400 font-extrabold',
      textInactive: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-semibold'
    },
    yellow: {
      containerActive: 'bg-gradient-to-r from-yellow-500/20 via-yellow-500/5 to-transparent text-yellow-600 dark:text-yellow-400',
      containerInactive: 'hover:bg-yellow-500/[0.04] text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-400',
      indicator: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]',
      iconActive: 'bg-yellow-500/25 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 shadow-md shadow-yellow-500/15',
      iconInactive: 'bg-yellow-500/5 text-yellow-500/70 dark:text-yellow-400/70 border border-yellow-500/10 group-hover:bg-yellow-500/15 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 group-hover:border-yellow-500/20',
      textActive: 'text-yellow-600 dark:text-yellow-400 font-extrabold',
      textInactive: 'group-hover:text-yellow-600 dark:group-hover:text-yellow-400 font-semibold'
    },
    teal: {
      containerActive: 'bg-gradient-to-r from-teal-500/20 via-teal-500/5 to-transparent text-teal-600 dark:text-teal-400',
      containerInactive: 'hover:bg-teal-500/[0.04] text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400',
      indicator: 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)]',
      iconActive: 'bg-teal-500/25 text-teal-600 dark:text-teal-400 border border-teal-500/30 shadow-md shadow-teal-500/15',
      iconInactive: 'bg-teal-500/5 text-teal-500/70 dark:text-teal-400/70 border border-teal-500/10 group-hover:bg-teal-500/15 group-hover:text-teal-500 group-hover:border-teal-500/20',
      textActive: 'text-teal-600 dark:text-teal-400 font-extrabold',
      textInactive: 'group-hover:text-teal-600 dark:group-hover:text-teal-400 font-semibold'
    },
    sky: {
      containerActive: 'bg-gradient-to-r from-sky-500/20 via-sky-500/5 to-transparent text-sky-600 dark:text-sky-400',
      containerInactive: 'hover:bg-sky-500/[0.04] text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400',
      indicator: 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.6)]',
      iconActive: 'bg-sky-500/25 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-md shadow-sky-500/15',
      iconInactive: 'bg-sky-500/5 text-sky-500/70 dark:text-sky-400/70 border border-sky-500/10 group-hover:bg-sky-500/15 group-hover:text-sky-500 group-hover:border-sky-500/20',
      textActive: 'text-sky-600 dark:text-sky-400 font-extrabold',
      textInactive: 'group-hover:text-sky-600 dark:group-hover:text-sky-400 font-semibold'
    },
    rose: {
      containerActive: 'bg-gradient-to-r from-rose-500/20 via-rose-500/5 to-transparent text-rose-600 dark:text-rose-400',
      containerInactive: 'hover:bg-rose-500/[0.04] text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400',
      indicator: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]',
      iconActive: 'bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-md shadow-rose-500/15',
      iconInactive: 'bg-rose-500/5 text-rose-500/70 dark:text-rose-400/70 border border-rose-500/10 group-hover:bg-rose-500/15 group-hover:text-rose-500 group-hover:border-rose-500/20',
      textActive: 'text-rose-600 dark:text-rose-400 font-extrabold',
      textInactive: 'group-hover:text-rose-600 dark:group-hover:text-rose-400 font-semibold'
    },
    fuchsia: {
      containerActive: 'bg-gradient-to-r from-fuchsia-500/20 via-fuchsia-500/5 to-transparent text-fuchsia-600 dark:text-fuchsia-400',
      containerInactive: 'hover:bg-fuchsia-500/[0.04] text-muted-foreground hover:text-fuchsia-600 dark:hover:text-fuchsia-400',
      indicator: 'bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.6)]',
      iconActive: 'bg-fuchsia-500/25 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/30 shadow-md shadow-fuchsia-500/15',
      iconInactive: 'bg-fuchsia-500/5 text-fuchsia-500/70 dark:text-fuchsia-400/70 border border-fuchsia-500/10 group-hover:bg-fuchsia-500/15 group-hover:text-fuchsia-500 group-hover:border-fuchsia-500/20',
      textActive: 'text-fuchsia-600 dark:text-fuchsia-400 font-extrabold',
      textInactive: 'group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 font-semibold'
    },
    orange: {
      containerActive: 'bg-gradient-to-r from-orange-500/20 via-orange-500/5 to-transparent text-orange-600 dark:text-orange-400',
      containerInactive: 'hover:bg-orange-500/[0.04] text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400',
      indicator: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]',
      iconActive: 'bg-orange-500/25 text-orange-600 dark:text-orange-400 border border-orange-500/30 shadow-md shadow-orange-500/15',
      iconInactive: 'bg-orange-500/5 text-orange-500/70 dark:text-orange-400/70 border border-orange-500/10 group-hover:bg-orange-500/15 group-hover:text-orange-500 group-hover:border-orange-500/20',
      textActive: 'text-orange-600 dark:text-orange-400 font-extrabold',
      textInactive: 'group-hover:text-orange-600 dark:group-hover:text-orange-400 font-semibold'
    },
    red: {
      containerActive: 'bg-gradient-to-r from-red-500/20 via-red-500/5 to-transparent text-red-600 dark:text-red-400',
      containerInactive: 'hover:bg-red-500/[0.04] text-muted-foreground hover:text-red-600 dark:hover:text-red-400',
      indicator: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]',
      iconActive: 'bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/30 shadow-md shadow-red-500/15',
      iconInactive: 'bg-red-500/5 text-red-500/70 dark:text-red-400/70 border border-red-500/10 group-hover:bg-red-500/15 group-hover:text-red-500 group-hover:border-red-500/20',
      textActive: 'text-red-600 dark:text-red-400 font-extrabold',
      textInactive: 'group-hover:text-red-600 dark:group-hover:text-red-400 font-semibold'
    },
    slate: {
      containerActive: 'bg-gradient-to-r from-slate-500/20 via-slate-500/5 to-transparent text-slate-600 dark:text-slate-400',
      containerInactive: 'hover:bg-slate-500/[0.04] text-muted-foreground hover:text-slate-600 dark:hover:text-slate-400',
      indicator: 'bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.6)]',
      iconActive: 'bg-slate-500/25 text-slate-600 dark:text-slate-400 border border-slate-500/30 shadow-md shadow-slate-500/15',
      iconInactive: 'bg-slate-500/5 text-slate-500/70 dark:text-slate-400/70 border border-slate-500/10 group-hover:bg-slate-500/15 group-hover:text-slate-500 group-hover:border-slate-500/20',
      textActive: 'text-slate-600 dark:text-slate-400 font-extrabold',
      textInactive: 'group-hover:text-slate-600 dark:group-hover:text-slate-400 font-semibold'
    }
  };

  return mapping[colorName] || mapping.indigo;
};

export default function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [lockedFeatureModal, setLockedFeatureModal] = useState(null);
  const location = useLocation();
  const { settings, updateSetting } = useGlobalContext();

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'exam':
        return { icon: FileSpreadsheet, color: 'text-purple-500', bg: 'bg-purple-500/10' };
      case 'academic':
        return { icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'finance':
        return { icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'attendance':
        return { icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      default:
        return { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-500/10' };
    }
  };

  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New Exam Created: Semester Exam is now scheduled.", time: "10 mins ago", read: false, type: 'exam' },
    { id: 2, text: "Marks Entered: Grade entries for Class 1-A Maths completed.", time: "1 hr ago", read: false, type: 'academic' },
    { id: 3, text: "Fee Bill Generated: June tuition invoices generated.", time: "3 hrs ago", read: false, type: 'finance' },
    { id: 4, text: "Attendance Checked: Daily attendance summary sent to principal.", time: "5 hrs ago", read: true, type: 'attendance' }
  ]);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to extract initials for small sidebar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden transition-colors duration-300">
      
      {/* Sidebar */}
      <motion.aside 
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="h-full glass border-r flex flex-col justify-between relative z-20"
      >
        <div>
          <div className="h-20 flex items-center justify-center border-b border-black/5 dark:border-white/5 p-4 overflow-hidden bg-black/[0.01] dark:bg-white/[0.01]">
            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.div 
                  key="open-logo"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3 w-full"
                >
                  {settings.schoolLogo && (
                    <motion.img 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      src={settings.schoolLogo} 
                      alt="Logo" 
                      className="w-10 h-10 object-cover rounded-full flex-shrink-0 premium-shadow border-2 border-primary/20" 
                    />
                  )}
                  <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-indigo-400 truncate flex-1 tracking-tight">
                    {settings.schoolName}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="closed-logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex justify-center items-center w-full"
                >
                  {settings.schoolLogo ? (
                    <motion.img 
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      src={settings.schoolLogo} 
                      alt="Logo" 
                      className="w-11 h-11 object-cover rounded-full premium-shadow border-2 border-primary/20" 
                    />
                  ) : (
                    <span className="text-2xl font-black text-primary tracking-tight">{getInitials(settings.schoolName)}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <nav className="p-4 space-y-6 mt-2 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
            {MENU_GROUPS.map((group, idx) => {
              // Mock current role (would typically come from context)
              const currentRole = localStorage.getItem('gdl_current_role') || 'Admin';
              const activeTenant = localStorage.getItem('gdl_active_tenant');
              const storedPerms = activeTenant && activeTenant !== 'superadmin' ? getStoredPermissions(activeTenant) : null;
              
              const filteredItems = group.items.filter(item => {
                if (currentRole === 'Super Admin') {
                  // Super admin only needs specific system-level tabs
                  if (item.path === '/' || item.path === '/settings' || (item.roles && item.roles.includes('Super Admin'))) {
                    return true;
                  }
                  return false;
                } else {
                  // Regular Admins see everything not explicitly restricted
                  if (!item.roles) return true;
                  return item.roles.includes(currentRole);
                }
              });
              
              if (filteredItems.length === 0) return null;

              return (
              <div key={idx} className="space-y-1">
                <AnimatePresence mode="wait">
                  {isSidebarOpen ? (
                    <motion.div 
                      key="open-group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/45 mb-2 mt-4 flex items-center gap-2 select-none"
                    >
                      <span>{group.group}</span>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-muted-foreground/15 to-transparent"></div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="closed-group"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="my-3 border-t border-black/5 dark:border-white/5 w-full"
                    />
                  )}
                </AnimatePresence>
                {filteredItems.map((item) => {
                  const isActive = item.path === '/settings' 
                    ? isSettingsOpen 
                    : (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)));
                  
                  const isPlanLocked = storedPerms && item.requiredPerm && !item.requiredPerm.some(perm => storedPerms.includes(perm));
                  
                  const isItemLocked = isPlanLocked || (item.path !== '/' && item.path !== '/settings' && (
                    settings.moduleLocks && settings.moduleLocks[item.label.toLowerCase()] !== undefined
                      ? settings.moduleLocks[item.label.toLowerCase()]
                      : !!item.defaultLocked
                  ));
                  
                  const colorName = item.color.replace('text-', '').replace('-500', '');
                  const cls = getColorClasses(colorName);

                  const ItemContent = (
                    <div className={`flex items-center px-3 py-2 rounded-xl transition-all duration-300 group relative select-none ${
                      isActive 
                        ? cls.containerActive 
                        : cls.containerInactive
                    }`}>
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${cls.indicator}`} 
                        />
                      )}
                      
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                        isActive 
                          ? cls.iconActive 
                          : cls.iconInactive
                      }`}>
                        <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                      </div>

                      <AnimatePresence mode="wait">
                        {isSidebarOpen && (
                          <motion.span 
                            initial={{ opacity: 0, x: -10, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: "auto" }}
                            exit={{ opacity: 0, x: -10, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`ml-3 text-sm flex-1 truncate transition-colors ${isActive ? cls.textActive : cls.textInactive}`}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {isItemLocked && (
                        <motion.div 
                          whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
                          className={`absolute ${isSidebarOpen ? 'right-3' : 'bottom-1 right-1 bg-background/80 dark:bg-background/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm border border-black/5 dark:border-white/5'}`}
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                        </motion.div>
                      )}
                    </div>
                  );

                  if (item.path === '/settings') {
                    return (
                      <button 
                        key={item.path} 
                        onClick={() => setSettingsOpen(true)} 
                        className="w-full text-left outline-none bg-transparent border-none p-0 cursor-pointer"
                      >
                        {ItemContent}
                      </button>
                    );
                  }

                  return isItemLocked ? (
                    <button key={item.path} onClick={() => setLockedFeatureModal(item)} className="w-full text-left outline-none bg-transparent border-none p-0 cursor-pointer">
                      {ItemContent}
                    </button>
                  ) : (
                    <Link key={item.path} to={item.path}>
                      {ItemContent}
                    </Link>
                  );
                })}
              </div>
            )})}
          </nav>
        </div>

        <div className="p-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
          {/* Role Indicator */}
          <div className="flex items-center gap-3 px-3 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
              {localStorage.getItem('gdl_current_role') === 'Super Admin' ? 'SA' : 'AD'}
            </div>
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <h4 className="text-xs font-black truncate text-foreground">
                    {localStorage.getItem('gdl_active_tenant') === 'superadmin' ? 'Super Admin' : (localStorage.getItem('gdl_school_name') || settings.schoolName || 'Admin')}
                  </h4>
                  <p className="text-[9px] uppercase tracking-widest font-extrabold text-primary truncate mt-0.5">
                    {localStorage.getItem('gdl_current_role') || 'Admin'} Profile
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => {
              localStorage.removeItem('gdl_current_role');
              localStorage.removeItem('gdl_active_tenant');
              window.location.href = '#/login';
              window.location.reload();
            }}
            className="flex w-full items-center px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 hover:scale-[1.02] transition-all bg-transparent border-none cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-red-500/20">
              <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-transform group-hover:scale-110" />
            </div>
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 text-sm font-semibold flex-1 text-left truncate"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Topbar */}
        <header className="h-20 glass border-b flex items-center justify-between px-8 relative z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary/10 to-indigo-500/10 hover:from-primary/20 hover:to-indigo-500/20 text-primary transition-all premium-shadow hover:scale-105"
            >
              <motion.div animate={{ rotate: isSidebarOpen ? 0 : 90, scale: isSidebarOpen ? 1 : 0.9 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                <Menu className="w-5 h-5" />
              </motion.div>
            </button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search everywhere (Ctrl+K)..." 
                className="pl-10 pr-4 py-2 w-80 bg-black/5 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-sm outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors bg-transparent border-none animate-pulse"
              title="Toggle Theme"
            >
              {settings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Header Logout Button */}
            <button 
              onClick={() => {
                localStorage.removeItem('gdl_current_role');
                localStorage.removeItem('gdl_active_tenant');
                window.location.href = '#/login';
                window.location.reload();
              }}
              className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
            
            {/* Notifications Bell */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 relative text-muted-foreground transition-colors bg-transparent border-none cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                )}
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-[350px] max-w-[350px] bg-card border border-black/10 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden text-left premium-shadow"
                  >
                    <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center gap-4 bg-black/[0.02] dark:bg-white/[0.02]">
                      <h4 className="font-extrabold text-foreground text-sm truncate flex-1 min-w-0">Notifications</h4>
                      {notifications.some(n => !n.read) && (
                        <button 
                          onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                          className="text-[10px] uppercase tracking-wider font-black text-primary hover:underline bg-transparent border-none p-0 cursor-pointer shrink-0 whitespace-nowrap"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar p-2.5 space-y-1.5">
                      <AnimatePresence initial={false}>
                        {notifications.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-8 text-center text-xs text-muted-foreground font-medium flex flex-col items-center gap-2"
                          >
                            <Bell className="w-8 h-8 text-muted-foreground/30 animate-pulse" />
                            <span>No new notifications</span>
                          </motion.div>
                        ) : (
                          notifications.map(n => {
                            const styles = getNotificationStyles(n.type);
                            const Icon = styles.icon;
                            return (
                              <motion.div 
                                key={n.id} 
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                onClick={() => {
                                  setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
                                }}
                                className={`group p-3 rounded-2xl cursor-pointer transition-all flex gap-3 relative border text-left ${
                                  !n.read 
                                    ? 'bg-primary/[0.03] border-primary/10 dark:border-primary/5 hover:bg-primary/[0.06]' 
                                    : 'bg-black/[0.015] dark:bg-white/[0.015] border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/5'
                                }`}
                              >
                                {/* Left Icon Badge */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${styles.bg} ${styles.color} transition-transform group-hover:scale-105`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0 pr-4">
                                  <p className={`text-[11px] text-foreground leading-relaxed ${!n.read ? 'font-black' : 'font-semibold'}`}>
                                    {n.text}
                                  </p>
                                  <span className="text-[9px] text-muted-foreground font-black mt-1 inline-block uppercase tracking-wider">{n.time}</span>
                                </div>

                                {/* Read/Unread state dot indicator */}
                                {!n.read && (
                                  <span className="absolute top-4 right-3.5 w-2 h-2 bg-primary rounded-full ring-4 ring-primary/20 animate-pulse"></span>
                                )}

                                {/* Individual Dismiss/Close Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNotifications(notifications.filter(item => item.id !== n.id));
                                  }}
                                  className="absolute right-2 bottom-2 w-5 h-5 rounded-lg bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border-none transition-all cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </motion.div>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-black/5 dark:border-white/5 text-center">
                        <button 
                          onClick={() => setNotifications([])}
                          className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors bg-transparent border-none cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => {
                  if (localStorage.getItem('gdl_active_tenant') === 'superadmin') {
                    const r = localStorage.getItem('gdl_current_role') === 'Super Admin' ? 'Admin' : 'Super Admin';
                    localStorage.setItem('gdl_current_role', r);
                    window.location.reload();
                  } else {
                    setProfileOpen(!isProfileOpen);
                  }
                }}
                className={`w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white font-bold cursor-pointer shadow-lg hover:scale-105 transition-transform ${localStorage.getItem('gdl_active_tenant') !== 'superadmin' ? 'cursor-pointer' : ''}`}
                title={localStorage.getItem('gdl_active_tenant') === 'superadmin' ? "Click to toggle Super Admin / Admin role" : "Profile"}
              >
                {localStorage.getItem('gdl_current_role') === 'Super Admin' ? 'SA' : 'AD'}
              </div>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-card border border-black/10 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden text-left premium-shadow p-2"
                  >
                    <div className="p-3 border-b border-black/5 dark:border-white/5 mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {localStorage.getItem('gdl_current_role') === 'Super Admin' ? 'SA' : 'AD'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-foreground text-sm">{localStorage.getItem('gdl_active_tenant') === 'superadmin' ? 'Super Admin' : settings.schoolName || 'Admin'}</h4>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{localStorage.getItem('gdl_active_tenant')}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <button 
                        onClick={() => {
                          setProfileOpen(false);
                          setSettingsOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all text-left bg-transparent border-none cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        Platform Settings
                      </button>
                      <button 
                        onClick={() => {
                          setProfileOpen(false);
                          alert("Tauri Diagnostics:\n- OS: macOS (Architecture: ARM64)\n- Core Engine: Tauri Rust v2.0\n- Frontend: React v19\n- Database: SQLite via Prisma\n- App Version: 0.1.0 (Professional Edition)");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all text-left bg-transparent border-none cursor-pointer"
                      >
                        <Briefcase className="w-4 h-4 text-emerald-500" />
                        Diagnostics
                      </button>
                      <button 
                        onClick={() => {
                          setProfileOpen(false);
                          alert("Password Reset feature will send a reset link to admin@gdlsofts.com.");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all text-left bg-transparent border-none cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-amber-500" />
                        Change Password
                      </button>
                      
                      <div className="border-t border-black/5 dark:border-white/5 my-1"></div>
                      
                      <button 
                        onClick={() => {
                          setProfileOpen(false);
                          localStorage.removeItem('gdl_current_role');
                          localStorage.removeItem('gdl_active_tenant');
                          window.location.href = '#/login';
                          window.location.reload();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-xs font-bold text-red-500 transition-all text-left bg-transparent border-none cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Logout Session
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </div>
        
      </main>

      {/* Premium Feature Locked Modal */}
      <AnimatePresence>
        {lockedFeatureModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-md rounded-[2rem] premium-shadow overflow-hidden border border-white/10 relative">
              
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-amber-500/20 to-orange-600/10"></div>
              
              <div className="p-8 relative pt-12 flex flex-col items-center text-center">
                <button onClick={() => setLockedFeatureModal(null)} className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 rounded-full transition-colors text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>

                <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full flex items-center justify-center premium-shadow mb-5 border-4 border-background">
                  <Award className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                
                <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Premium Feature</h3>
                <p className="text-muted-foreground font-medium text-[13px] mb-8 leading-relaxed max-w-[90%]">
                  The <span className="font-bold text-amber-500 px-1">"{lockedFeatureModal.label}"</span> module is locked in your current plan. To access this powerful feature and streamline your operations, please contact GDLSofts owners to request an upgrade.
                </p>
                
                <div className="flex gap-3 w-full">
                  <button onClick={() => setLockedFeatureModal(null)} className="flex-1 py-3 bg-black/5 dark:bg-white/5 text-muted-foreground font-bold rounded-2xl hover:bg-black/10 transition-colors">
                    Maybe Later
                  </button>
                  <button onClick={() => setLockedFeatureModal(null)} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-amber-500/25">
                    Request Upgrade
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Platform Settings Full-Screen Modal Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-0 bg-background/95 backdrop-blur-xl select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full h-full p-6 md:p-10 overflow-y-auto"
            >
              <div className="w-full h-full">
                <SettingsModule closeSettings={() => setSettingsOpen(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
