import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, GraduationCap, IndianRupee, BookOpen, Clock, FileText, CheckCircle2, 
  Bus, Home, Activity, CreditCard, UserPlus, ShieldAlert, X, Send, Bell, 
  Mail, MessageSquare, Megaphone, Briefcase, Lock 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useGlobalContext } from '../context/GlobalContext';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
  <div className="glass-panel p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer border border-black/5 dark:border-white/5 premium-shadow hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br from-background to-background hover:to-primary/5">
    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-20 group-hover:opacity-40 transition-all duration-700 ${colorClass}`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-muted-foreground font-semibold mb-2 uppercase tracking-wider text-xs truncate">{title}</p>
        <h3 className="text-4xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300 truncate">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center premium-shadow bg-background border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform duration-500 flex-shrink-0 ${colorClass}`}>
        <Icon className="w-7 h-7" />
      </div>
    </div>
    <div className="mt-6 flex items-center gap-3 relative z-10">
      <span className={`text-sm font-bold flex items-center gap-1 px-3 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
        {trend >= 0 ? '+' : ''}{trend}%
      </span>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">vs last month</span>
    </div>
  </div>
);

const LockedOverlay = ({ label }) => (
  <div className="absolute inset-0 bg-background/50 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-4 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-2xl">
    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/5 mb-3 animate-pulse">
      <Lock className="w-6 h-6" />
    </div>
    <p className="text-sm font-extrabold text-foreground uppercase tracking-wider">{label} Locked</p>
    <p className="text-[11px] text-muted-foreground font-semibold mt-1">Enable this module in Settings</p>
  </div>
);

export default function Dashboard() {
  const { settings } = useGlobalContext();
  
  const isLocked = (moduleLabel) => {
    if (!moduleLabel) return false;
    const key = moduleLabel.toLowerCase();
    if (settings.moduleLocks && settings.moduleLocks[key] !== undefined) {
      return settings.moduleLocks[key];
    }
    const defaultLocks = {
      'transport': true,
      'hostel': true,
      'visitor': true,
      'library': true,
      'inventory': true
    };
    return !!defaultLocks[key];
  };

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({
    audience: 'Everyone',
    channels: {
      push: true,
      email: false,
      sms: false,
      portal: true,
    },
    title: '',
    message: '',
  });
  const [sendingState, setSendingState] = useState('idle');
  const [sendingProgress, setSendingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const handleQuickAction = (actionLabel) => {
    if (actionLabel === 'New Admission') {
      navigate('/students', { state: { openAdmissionModal: true } });
    } else if (actionLabel === 'Collect Fee') {
      navigate('/fees', { state: { openCollectFee: true } });
    } else if (actionLabel === 'Mark Attendance') {
      navigate('/attendance');
    } else if (actionLabel === 'Send Alert') {
      setAlertForm({
        audience: 'Everyone',
        title: '',
        message: '',
        channels: {
          push: true,
          email: false,
          sms: false,
          portal: true
        }
      });
      setSendingState('idle');
      setSendingProgress(0);
      setIsAlertModalOpen(true);
    }
  };

  const startBroadcast = () => {
    if (!alertForm.title.trim() || !alertForm.message.trim()) {
      alert("Please fill in both title and message.");
      return;
    }
    
    setSendingState('validating');
    setSendingProgress(5);
    setCurrentStep(0);
  };

  useEffect(() => {
    let timer;
    if (sendingState === 'validating') {
      timer = setTimeout(() => {
        setSendingState('sending');
        setSendingProgress(30);
        setCurrentStep(1);
      }, 1000);
    } else if (sendingState === 'sending') {
      const interval = setInterval(() => {
        setSendingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            setSendingState('completed');
            setCurrentStep(2);
            return 100;
          }
          return prev + 15;
        });
      }, 300);
      return () => clearInterval(interval);
    }
    return () => clearTimeout(timer);
  }, [sendingState]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('http://localhost:1422/api/dashboard/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 rounded-2xl premium-shadow border border-white/10 text-foreground min-w-[150px]">
          <p className="font-bold mb-3 border-b border-white/10 pb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">{entry.name}:</span>
              <span className="font-bold" style={{ color: entry.color || entry.fill }}>
                {entry.name === 'Present' || entry.name === 'Absent' || entry.name === 'Late' || entry.name === 'Half Day' 
                  ? entry.value 
                  : entry.name === 'students' ? `${entry.value} Students`
                  : entry.name === 'avg' ? `${entry.value}% Avg Score`
                  : `₹${entry.value.toLocaleString('en-IN')}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-bold text-sm">Gathering school metrics...</p>
      </div>
    );
  }

  // Fallback charts arrays if SQLite tables are empty (preserving original structures)
  const chartData = stats?.financialTrends && stats.financialTrends.some(t => t.income > 0 || t.expense > 0)
    ? stats.financialTrends
    : [
        { name: 'Jan', income: 400000, expense: 240000 },
        { name: 'Feb', income: 300000, expense: 139800 },
        { name: 'Mar', income: 500000, expense: 380000 },
        { name: 'Apr', income: 800000, expense: 390800 },
        { name: 'May', income: 600000, expense: 480000 },
        { name: 'Jun', income: 900000, expense: 380000 },
      ];

  const attendanceData = stats?.attendanceStats && stats.attendanceStats.some(a => a.value > 0)
    ? stats.attendanceStats
    : [
        { name: 'Present', value: 2450, color: '#10b981' },
        { name: 'Absent', value: 200, color: '#ef4444' },
        { name: 'Late', value: 150, color: '#f59e0b' },
        { name: 'Half Day', value: 45, color: '#6366f1' },
      ];

  const classEnrollmentData = stats?.classEnrollment && stats.classEnrollment.length > 0
    ? stats.classEnrollment
    : [
        { name: 'Class 1', students: 120 },
        { name: 'Class 2', students: 135 },
        { name: 'Class 3', students: 150 },
        { name: 'Class 4', students: 140 },
        { name: 'Class 5', students: 180 },
        { name: 'Class 6', students: 195 },
      ];

  // Dummy performance data remains same as user wanted graphs and icons same
  const performanceData = [
    { month: 'Jan', avg: 72 },
    { month: 'Feb', avg: 75 },
    { month: 'Mar', avg: 73 },
    { month: 'Apr', avg: 78 },
    { month: 'May', avg: 82 },
    { month: 'Jun', avg: 85 },
  ];  // Activities list resolving
  const activities = stats?.activities && stats.activities.length > 0
    ? stats.activities.map(a => {
        // Map icon and color
        let icon = Users;
        let color = 'text-blue-500 bg-blue-500/10';
        let lockKey = 'students';
        if (a.type === 'fee') {
          icon = IndianRupee;
          color = 'text-emerald-500 bg-emerald-500/10';
          lockKey = 'fees & finance';
        } else if (a.type === 'visitor') {
          icon = BookOpen;
          color = 'text-amber-500 bg-amber-500/10';
          lockKey = 'visitor';
        }
        
        // Calculate relative time or formatted timestamp
        const timeDiff = new Date() - new Date(a.time);
        const mins = Math.floor(timeDiff / 60000);
        const hours = Math.floor(mins / 60);
        let timeStr = new Date(a.time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        if (mins < 60) {
          timeStr = `${mins <= 0 ? 'Just' : mins} mins ago`;
        } else if (hours < 24) {
          timeStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }

        return {
          title: a.title,
          time: timeStr,
          icon,
          color,
          lockKey
        };
      })
    : [
        { title: 'New admission recorded', time: '10 mins ago', icon: Users, color: 'text-blue-500 bg-blue-500/10', lockKey: 'students' },
        { title: 'Fee payment of ₹45,000', time: '1 hour ago', icon: IndianRupee, color: 'text-emerald-500 bg-emerald-500/10', lockKey: 'fees & finance' },
        { title: 'Library book issued', time: '2 hours ago', icon: BookOpen, color: 'text-amber-500 bg-amber-500/10', lockKey: 'library' },
        { title: 'Exam schedule updated', time: '5 hours ago', icon: FileText, color: 'text-purple-500 bg-purple-500/10', lockKey: 'exams' },
        { title: 'Staff payroll processed', time: '1 day ago', icon: CheckCircle2, color: 'text-indigo-500 bg-indigo-500/10', lockKey: 'payroll' },
      ];
  const formatRevenue = (val) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-sans">Overview</h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">Welcome back to {localStorage.getItem('gdl_school_name') || settings.schoolName} {localStorage.getItem('gdl_current_role') || 'Admin'}.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden rounded-[2rem]">
          <StatCard title="Total Students" value={stats?.studentsCount?.toLocaleString('en-IN') || '0'} icon={Users} trend={4.2} colorClass="text-blue-500 bg-blue-500/20" />
          {isLocked('students') && <LockedOverlay label="Students" />}
        </div>
        <div className="relative overflow-hidden rounded-[2rem]">
          <StatCard title="Total Staff" value={stats?.staffCount?.toLocaleString('en-IN') || '0'} icon={GraduationCap} trend={1.1} colorClass="text-purple-500 bg-purple-500/20" />
          {isLocked('school setup') && <LockedOverlay label="Staff" />}
        </div>
        <div className="relative overflow-hidden rounded-[2rem]">
          <StatCard title="Revenue (MTD)" value={formatRevenue(stats?.revenueMtd || 0)} icon={IndianRupee} trend={stats?.revenueTrend || 0} colorClass="text-emerald-500 bg-emerald-500/20" />
          {isLocked('fees & finance') && <LockedOverlay label="Finance" />}
        </div>
        <div className="relative overflow-hidden rounded-[2rem]">
          <StatCard title="Active Vehicles" value={stats?.activeVehiclesCount?.toLocaleString('en-IN') || '0'} icon={Bus} trend={0} colorClass="text-amber-500 bg-amber-500/20" />
          {isLocked('transport') && <LockedOverlay label="Transport" />}
        </div>
      </div>
      
      {/* Primary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Income vs Expense Area Chart */}
        <div className="lg:col-span-2 glass-panel rounded-[2rem] p-8 flex flex-col border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-all duration-700"></div>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-xl font-bold text-foreground">Financial Overview (Income vs Expense)</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Income</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold"><div className="w-3 h-3 rounded-full bg-red-500"></div> Expense</div>
            </div>
          </div>
          <div className="flex-1 w-full relative z-10 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} tickFormatter={(val) => val >= 100000 ? `₹${val/100000}L` : `₹${val}`} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }} />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 8, fill: '#ef4444', stroke: '#fff', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {isLocked('fees & finance') && <LockedOverlay label="Financial Overview" />}
        </div>
        
        {/* Today's Attendance Pie Chart */}
        <div className="glass-panel rounded-[2rem] p-8 flex flex-col border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mt-20 group-hover:bg-emerald-500/10 transition-all duration-700"></div>
          <h3 className="text-xl font-bold mb-2 text-foreground relative z-10">Today's Attendance</h3>
          <p className="text-sm text-muted-foreground relative z-10 mb-6 font-medium">Across all classes and sections</p>
          
          <div className="flex-1 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <span className="text-3xl font-extrabold text-foreground">{stats?.attendanceRate || 86}%</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Present</span>
            </div>
          </div>
          {isLocked('attendance') && <LockedOverlay label="Attendance" />}
        </div>
      </div>

      {/* Secondary Dashboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions Panel */}
        <div className="glass-panel rounded-[2rem] p-8 border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden">
          <h3 className="text-xl font-bold mb-6 text-foreground relative z-10">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {[
              { label: 'New Admission', icon: UserPlus, color: 'text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white', action: () => handleQuickAction('New Admission'), lockKey: 'students' },
              { label: 'Collect Fee', icon: CreditCard, color: 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white', action: () => handleQuickAction('Collect Fee'), lockKey: 'fees & finance' },
              { label: 'Mark Attendance', icon: Activity, color: 'text-blue-500 bg-blue-500/10 hover:bg-blue-500 hover:text-white', action: () => handleQuickAction('Mark Attendance'), lockKey: 'attendance' },
              { label: 'Send Alert', icon: ShieldAlert, color: 'text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white', action: () => handleQuickAction('Send Alert'), lockKey: 'reports' },
            ].map((action, i) => {
              const locked = isLocked(action.lockKey);
              return (
                <button 
                  key={i} 
                  onClick={locked ? undefined : action.action}
                  disabled={locked}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 border border-transparent relative overflow-hidden ${
                    locked 
                      ? 'bg-black/5 dark:bg-white/5 text-muted-foreground/30 cursor-not-allowed opacity-50' 
                      : `hover:scale-105 ${action.color}`
                  }`}
                >
                  {locked ? <Lock className="w-8 h-8 mb-3 text-amber-500" /> : <action.icon className="w-8 h-8 mb-3" />}
                  <span className="text-sm font-semibold text-center">{action.label}</span>
                  {locked && <div className="absolute top-2 right-2"><Lock className="w-3 h-3 text-amber-500" /></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modules Overview */}
        <div className="glass-panel rounded-[2rem] p-8 border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden">
           <h3 className="text-xl font-bold mb-6 text-foreground relative z-10">System Highlights</h3>
           <div className="space-y-4 relative z-10 font-sans">
            {[
              { label: 'Library', sub: '0 Books Overdue', icon: BookOpen, color: 'purple', lockKey: 'library', path: '/library' },
              { label: 'Transport', sub: '0 Vehicles Maintenance', icon: Bus, color: 'amber', lockKey: 'transport', path: '/transport' },
              { label: 'Hostel', sub: '0 Beds Available', icon: Home, color: 'blue', lockKey: 'hostel', path: '/hostel' },
              { label: 'Payroll', sub: stats?.payrollStats?.unpaidCount > 0 ? `${stats.payrollStats.unpaidCount} Salaries Pending` : stats?.payrollStats?.totalCount > 0 ? 'All Salaries Disbursed' : 'No Payroll Generated', icon: Briefcase, color: 'emerald', lockKey: 'payroll', path: '/payroll' }
            ].map((row, i) => {
              const locked = isLocked(row.lockKey);
              const colorClasses = {
                purple: 'bg-purple-500/20 text-purple-500',
                amber: 'bg-amber-500/20 text-amber-500',
                blue: 'bg-blue-500/20 text-blue-500',
                emerald: 'bg-emerald-500/20 text-emerald-500'
              }[row.color];

              return (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 relative overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${locked ? 'bg-amber-500/10 text-amber-500/80 border border-amber-500/10' : colorClasses}`}>
                      {locked ? <Lock className="w-5 h-5" /> : <row.icon className="w-6 h-6" />}
                    </div>
                    <div className="text-left font-sans">
                      <p className="font-bold text-sm">{row.label}</p>
                      <p className="text-xs text-muted-foreground font-semibold">{locked ? 'Module Locked' : row.sub}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => !locked && navigate(row.path)} 
                    disabled={locked}
                    className={`text-xs font-black ${locked ? 'text-muted-foreground/45 cursor-not-allowed' : 'text-primary hover:underline'}`}
                  >
                    {locked ? 'Locked' : 'View'}
                  </button>
                </div>
              );
            })}
           </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-panel rounded-[2rem] p-8 flex flex-col border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mt-20 group-hover:bg-emerald-500/10 transition-all duration-700"></div>
          <h3 className="text-xl font-bold mb-6 text-foreground relative z-10">Recent Activities</h3>
          <div className="flex-1 overflow-auto relative z-10 pr-2 space-y-6">
            {activities.map((activity, i) => {
              const locked = isLocked(activity.lockKey);
              return (
                <div key={i} className={`flex gap-4 text-left relative overflow-hidden transition-all duration-300 ${locked ? 'opacity-35 select-none' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${locked ? 'bg-amber-500/10 text-amber-500' : activity.color}`}>
                    {locked ? <Lock className="w-5 h-5" /> : <activity.icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{locked ? 'Activity Hidden (Locked)' : activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Tertiary Analytics Row (Bar & Line Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[350px]">
        {/* Bar Chart: Class-wise Enrollments */}
        <div className="glass-panel rounded-[2rem] p-8 flex flex-col border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-500/10 transition-all duration-700"></div>
          <h3 className="text-xl font-bold mb-6 text-foreground relative z-10">Class-wise Enrollments</h3>
          <div className="flex-1 w-full relative z-10 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classEnrollmentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="students" name="students" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30}>
                  {classEnrollmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {isLocked('students') && <LockedOverlay label="Enrollments" />}
        </div>

        {/* Line Chart: Academic Performance */}
        <div className="glass-panel rounded-[2rem] p-8 flex flex-col border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-20 -mt-20 group-hover:bg-purple-500/10 transition-all duration-700"></div>
          <h3 className="text-xl font-bold mb-6 text-foreground relative z-10">School Academic Performance (Avg %)</h3>
          <div className="flex-1 w-full relative z-10 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} domain={[50, 100]} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avg" name="avg" stroke="#a855f7" strokeWidth={4} dot={{ r: 6, fill: '#a855f7', strokeWidth: 2, stroke: 'var(--background)' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {isLocked('exams') && <LockedOverlay label="Academic Performance" />}
        </div>
      </div>

      {/* Send Alert Modal */}
      <AnimatePresence>
        {isAlertModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-3xl overflow-y-auto rounded-[2.5rem] premium-shadow border border-white/10 hide-scrollbar relative flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-xl">
                <div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <ShieldAlert className="w-7 h-7 text-red-500 animate-pulse" />
                    Send Broadcast Alert
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">Broadcast announcements to parents, students, or staff across multiple channels.</p>
                </div>
                <button 
                  onClick={() => setIsAlertModalOpen(false)} 
                  disabled={sendingState === 'validating' || sendingState === 'sending'}
                  className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-8 text-left">
                {sendingState === 'idle' ? (
                  <>
                    {/* Audience Selector */}
                    <div className="space-y-3">
                      <label className="block text-xs font-black uppercase tracking-widest text-indigo-500/80">Target Audience</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { key: 'Everyone', label: 'Everyone', count: (stats?.studentsCount || 0) + (stats?.staffCount || 0) },
                          { key: 'Students', label: 'Students', count: stats?.studentsCount || 0 },
                          { key: 'Parents', label: 'Parents', count: stats?.studentsCount || 0 },
                          { key: 'Staff & Teachers', label: 'Staff & Teachers', count: stats?.staffCount || 0 }
                        ].map(aud => {
                          const isSelected = alertForm.audience === aud.key;
                          return (
                            <button
                              key={aud.key}
                              type="button"
                              onClick={() => setAlertForm(prev => ({ ...prev, audience: aud.key }))}
                              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-500 scale-105 font-bold shadow-lg shadow-indigo-500/10' 
                                  : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 font-semibold'
                              }`}
                            >
                              <span className="text-sm">{aud.label}</span>
                              <span className="text-xs text-muted-foreground/60 mt-1">({aud.count} recipients)</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Channels Selection */}
                    <div className="space-y-3">
                      <label className="block text-xs font-black uppercase tracking-widest text-emerald-500/80">Delivery Channels</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { key: 'push', label: 'App Push', icon: Bell },
                          { key: 'email', label: 'Email', icon: Mail },
                          { key: 'sms', label: 'SMS', icon: MessageSquare },
                          { key: 'portal', label: 'Portal Board', icon: Megaphone }
                        ].map(ch => {
                          const Icon = ch.icon;
                          const isSelected = alertForm.channels[ch.key];
                          return (
                            <button
                              key={ch.key}
                              type="button"
                              onClick={() => setAlertForm(prev => ({
                                ...prev,
                                channels: { ...prev.channels, [ch.key]: !prev.channels[ch.key] }
                              }))}
                              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 scale-105 font-bold shadow-lg shadow-emerald-500/10' 
                                  : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 font-semibold'
                              }`}
                            >
                              <Icon className="w-6 h-6 mb-2" />
                              <span className="text-xs">{ch.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Title and Message */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-widest text-blue-500/80">Alert Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Emergency Holiday Announcement"
                          value={alertForm.title}
                          onChange={e => setAlertForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-blue-500/50 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-blue-500/20 text-foreground transition-all font-semibold placeholder:text-muted-foreground/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-widest text-purple-500/80">Alert Message</label>
                        <textarea
                          rows={4}
                          placeholder="Type your broadcast message here. Keep it descriptive and clear..."
                          value={alertForm.message}
                          onChange={e => setAlertForm(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-purple-500/50 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-purple-500/20 text-foreground transition-all font-semibold placeholder:text-muted-foreground/30 resize-none"
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4 justify-end pt-4 border-t border-black/5 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsAlertModalOpen(false)}
                        className="px-6 py-3 rounded-2xl font-bold border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={startBroadcast}
                        className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      >
                        <Send className="w-4 h-4" /> Start Broadcast
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-8">
                    {sendingState === 'completed' ? (
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center premium-shadow border border-emerald-500/20 animate-bounce">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                    ) : (
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <ShieldAlert className="w-8 h-8 text-primary animate-pulse" />
                      </div>
                    )}

                    <div className="space-y-2 max-w-md">
                      <h3 className="text-2xl font-bold text-foreground animate-pulse">
                        {sendingState === 'validating' && 'Validating Recipients...'}
                        {sendingState === 'sending' && 'Broadcasting Messages...'}
                        {sendingState === 'completed' && 'Broadcast Successful!'}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {sendingState === 'validating' && 'Checking network nodes, verifying contact database and active channels...'}
                        {sendingState === 'sending' && `Delivering to ${alertForm.audience} recipients via ${Object.entries(alertForm.channels).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ')}...`}
                        {sendingState === 'completed' && `Successfully delivered your message to all verified recipients.`}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md space-y-2">
                      <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/10 p-[1px]">
                        <motion.div 
                          className="h-full rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-emerald-500" 
                          initial={{ width: 0 }}
                          animate={{ width: `${sendingProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground font-mono">
                        <span>Progress</span>
                        <span>{sendingProgress}%</span>
                      </div>
                    </div>

                    {/* Interactive Live Logs */}
                    <div className="w-full max-w-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-2xl text-left space-y-3 font-mono text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-emerald-500 font-bold">✓</span> Database scan complete.
                      </div>
                      {sendingProgress >= 30 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-emerald-500 font-bold">✓</span> Channels initialized.
                        </div>
                      )}
                      {sendingProgress >= 60 && (
                        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                          <span className="text-emerald-500 font-bold">✓</span> Dispatching alert templates.
                        </div>
                      )}
                      {sendingState === 'completed' && (
                        <div className="flex items-center gap-2 text-emerald-500 font-bold">
                          <span>✓</span> Delivery reports registered in ledger log.
                        </div>
                      )}
                    </div>

                    {sendingState === 'completed' && (
                      <button
                        type="button"
                        onClick={() => setIsAlertModalOpen(false)}
                        className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-600 hover:scale-105 transition-all premium-shadow"
                      >
                        Dismiss Window
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
