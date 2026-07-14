import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  CreditCard, Plus, CheckCircle2, User, BookOpen, Clock, X, Search, IndianRupee,
  Calendar, TrendingUp, TrendingDown, AlertCircle, Check, Smartphone, Banknote, Hash,
  GraduationCap, Users, ArrowRight, RotateCcw, ChevronRight, ChevronDown, Info, Printer, Trash2, Edit3,
  ArrowUpRight, ArrowDownRight, RefreshCw, Layers, CircleDollarSign, Wallet, BarChart3, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const apiBase = 'http://localhost:1422/api';
import Modal from '../../components/ui/Modal';

const DEFAULT_FEE_TYPES = [
  "Tuition Fee", "Admission Fee", "Registration Fee", "Development Fee",
  "Exam Fee", "Library Fee", "Transport Fee", "Hostel Fee",
  "Sports Fee", "Laboratory Fee", "Computer/IT Fee", "Uniform Fee",
  "Books & Stationery", "Activity/Co-curricular", "Smart Class Fee",
  "Maintenance Fee", "Picnic/Excursion Fee", "Miscellaneous"
];

const FEE_TYPE_DETAILS = {
  "Tuition Fee": { icon: "📖", color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  "Admission Fee": { icon: "🎒", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  "Registration Fee": { icon: "🪪", color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  "Development Fee": { icon: "🏗️", color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  "Exam Fee": { icon: "✍️", color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  "Library Fee": { icon: "📚", color: "from-cyan-500/10 to-sky-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
  "Transport Fee": { icon: "🚌", color: "from-yellow-500/10 to-amber-500/10 text-yellow-600 dark:text-amber-400 border-yellow-500/20" },
  "Hostel Fee": { icon: "🏢", color: "from-purple-500/10 to-fuchsia-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  "Sports Fee": { icon: "⚽", color: "from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
  "Laboratory Fee": { icon: "🧪", color: "from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  "Computer/IT Fee": { icon: "💻", color: "from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  "Uniform Fee": { icon: "👕", color: "from-lime-500/10 to-green-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20" },
  "Books & Stationery": { icon: "📓", color: "from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
  "Activity/Co-curricular": { icon: "🎨", color: "from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20" },
  "Smart Class Fee": { icon: "📺", color: "from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  "Maintenance Fee": { icon: "🛠️", color: "from-slate-500/10 to-zinc-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  "Picnic/Excursion Fee": { icon: "🏕️", color: "from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-green-400 border-emerald-500/20" },
  "Miscellaneous": { icon: "⚙️", color: "from-slate-500/10 to-zinc-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" }
};

const GRADIENT_PALETTE = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
];

const GRADIENTS_INLINE = [
  'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
  'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)',
];

const BILLING_MODES = [
  {
    key: 'Monthly',
    label: 'Monthly',
    desc: 'One bill per month',
    icon: '📅',
    color: 'from-blue-500 to-indigo-600',
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
  },
  {
    key: 'Quarterly',
    label: 'Quarterly',
    desc: '3 months at once',
    icon: '🗓️',
    color: 'from-violet-500 to-purple-600',
    textColor: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500',
  },
  {
    key: 'Half-Yearly',
    label: 'Half Yearly',
    desc: '6 months at once',
    icon: '📆',
    color: 'from-orange-500 to-amber-600',
    textColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500',
  },
  {
    key: 'Yearly',
    label: 'Annual',
    desc: 'Full year (12 months)',
    icon: '🏆',
    color: 'from-emerald-500 to-teal-600',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500',
  },
  {
    key: 'One-Time',
    label: 'One-Time',
    desc: 'Single charge (e.g. Admission)',
    icon: '⚡',
    color: 'from-rose-500 to-pink-600',
    textColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500',
  },
];

// Helper to get formatted date string for today (local time)
export function todayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// Generate billing slots based on starting date and billing mode
function generateSlotsForMode(startDateStr, mode, activeSession = null) {
  let startDate = new Date(startDateStr);
  let endDate = null;

  if (activeSession && activeSession.startDate && activeSession.endDate) {
    startDate = new Date(activeSession.startDate);
    endDate = new Date(activeSession.endDate);
  }

  const slots = [];
  
  if (mode === 'Monthly') {
    if (endDate) {
      let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endLimit = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      let i = 0;
      while (current <= endLimit) {
        const label = current.toLocaleString('default', { month: 'long', year: 'numeric' });
        const dateVal = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')}`;
        slots.push({ id: `monthly_${i}`, label, date: dateVal, frequency: 'Monthly' });
        current.setMonth(current.getMonth() + 1);
        i++;
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
        const dateVal = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        slots.push({ id: `monthly_${i}`, label, date: dateVal, frequency: 'Monthly' });
      }
    }
  } else if (mode === 'Quarterly') {
    if (endDate) {
      let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      let i = 0;
      while (current <= endDate) {
        const nextQ = new Date(current.getFullYear(), current.getMonth() + 3, 1);
        const endD = new Date(current.getFullYear(), current.getMonth() + 2, 1);
        const label = `Quarter ${i + 1} (${current.toLocaleString('default', { month: 'short' })} - ${endD.toLocaleString('default', { month: 'short' })} ${current.getFullYear()})`;
        const dateVal = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')}`;
        slots.push({ id: `quarterly_${i}`, label, date: dateVal, frequency: 'Quarterly' });
        current = nextQ;
        i++;
      }
    } else {
      for (let i = 0; i < 4; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() + i * 3, 1);
        const endD = new Date(d.getFullYear(), d.getMonth() + 2, 1);
        const label = `Quarter ${i + 1} (${d.toLocaleString('default', { month: 'short' })} - ${endD.toLocaleString('default', { month: 'short' })} ${d.getFullYear()})`;
        const dateVal = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        slots.push({ id: `quarterly_${i}`, label, date: dateVal, frequency: 'Quarterly' });
      }
    }
  } else if (mode === 'Half-Yearly') {
    if (endDate) {
      let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      let i = 0;
      while (current <= endDate) {
        const nextH = new Date(current.getFullYear(), current.getMonth() + 6, 1);
        const endD = new Date(current.getFullYear(), current.getMonth() + 5, 1);
        const label = `Half ${i + 1} (${current.toLocaleString('default', { month: 'short' })} - ${endD.toLocaleString('default', { month: 'short' })} ${current.getFullYear()})`;
        const dateVal = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')}`;
        slots.push({ id: `half_yearly_${i}`, label, date: dateVal, frequency: 'Half-Yearly' });
        current = nextH;
        i++;
      }
    } else {
      for (let i = 0; i < 2; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() + i * 6, 1);
        const endD = new Date(d.getFullYear(), d.getMonth() + 5, 1);
        const label = `Half ${i + 1} (${d.toLocaleString('default', { month: 'short' })} - ${endD.toLocaleString('default', { month: 'short' })} ${d.getFullYear()})`;
        const dateVal = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        slots.push({ id: `half_yearly_${i}`, label, date: dateVal, frequency: 'Half-Yearly' });
      }
    }
  } else if (mode === 'Yearly') {
    const label = activeSession ? `Annual / Full Year (${activeSession.name})` : `Annual / Full Year (${startDate.getFullYear()} - ${startDate.getFullYear() + 1})`;
    const dateVal = `${startDate.getFullYear()}-${String(startDate.getMonth()+1).padStart(2,'0')}-${String(startDate.getDate()).padStart(2,'0')}`;
    slots.push({ id: `yearly_0`, label, date: dateVal, frequency: 'Yearly' });
  } else if (mode === 'One-Time') {
    const label = `One-Time Charge (${startDate.toLocaleDateString()})`;
    const dateVal = `${startDate.getFullYear()}-${String(startDate.getMonth()+1).padStart(2,'0')}-${String(startDate.getDate()).padStart(2,'0')}`;
    slots.push({ id: `one_time_0`, label, date: dateVal, frequency: 'One-Time' });
  }
  
  return slots;
}

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-black/10 dark:border-white/10 p-3.5 rounded-2xl shadow-xl backdrop-blur-md">
        <p className="font-extrabold text-xs text-foreground mb-2 border-b border-black/5 pb-1">{label}</p>
        {payload.map((p, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-xs font-bold py-0.5" style={{ color: p.color }}>
            <span className="opacity-80">{p.name}:</span>
            <span>₹{Number(p.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

class FeesErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-3xl text-red-600 dark:text-red-400">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <AlertCircle className="w-8 h-8" /> 
            Module Crashed
          </h2>
          <p className="font-bold mb-4">Please screenshot this error and send it to the AI:</p>
          <div className="bg-white dark:bg-black/50 p-4 rounded-xl overflow-auto text-xs font-mono max-h-[60vh] whitespace-pre-wrap">
            <span className="text-lg font-black block mb-2">{this.state.error && this.state.error.toString()}</span>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
            {'\n\n'}
            {this.state.error && this.state.error.stack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) pages.push('...');
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/5 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Previous
      </button>
      {pages.map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground font-black text-xs">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-xl font-bold text-xs transition-all border ${
              currentPage === page
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-md shadow-emerald-500/20 scale-110 z-10 relative'
                : 'bg-black/5 dark:bg-white/5 border-black/5 text-muted-foreground hover:bg-black/10'
            }`}
          >
            {page}
          </button>
        )
      ))}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/5 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Next
      </button>
    </div>
  );
};

const PrintableReceipt = ({ receipt, student, stuClass, copyType, schoolConfig }) => {
  const schoolName = schoolConfig?.schoolName || localStorage.getItem('gdl_school_name') || 'GDLLearning Academy';
  const schoolAddress = schoolConfig?.schoolAddress || 'Varanasi, UP';
  const schoolContact = schoolConfig?.contactPhone || '';
  const schoolEmail = schoolConfig?.contactEmail || 'support@gdllearning.com';

  return (
    <div className="w-full border-2 border-gray-900 p-6 rounded-xl bg-white text-black">
      <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-4">
         <div>
           <h2 className="text-2xl font-black uppercase tracking-tighter">{schoolName}</h2>
           <p className="text-xs font-bold text-gray-600">
             {schoolAddress} {schoolContact ? `• Contact: ${schoolContact}` : ''} {schoolEmail ? `• Email: ${schoolEmail}` : ''}
           </p>
         </div>
         <div className="text-right">
           <div className="border border-gray-900 px-3 py-1 rounded font-bold text-[10px] uppercase mb-1 inline-block bg-gray-100">{copyType}</div>
           <h3 className="font-black text-lg">FEE RECEIPT</h3>
         </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-6 text-xs border-b border-gray-300 pb-4">
        <div className="space-y-1 text-left">
          <div>
            <span className="text-[10px] font-black text-gray-500 uppercase">Receipt No:</span>
            <span className="font-bold text-gray-900 ml-1">{receipt.receiptNumber}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-500 uppercase">Date & Time:</span>
            <span className="font-bold text-gray-900 ml-1">{new Date(receipt.paymentDate).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-500 uppercase">Admission No:</span>
            <span className="font-bold text-gray-900 ml-1">{student.admissionNumber || 'N/A'}</span>
          </div>
        </div>
        <div className="space-y-1 text-left">
          <div>
            <span className="text-[10px] font-black text-gray-500 uppercase">Student Name:</span>
            <span className="font-bold text-gray-900 ml-1 uppercase">{student.firstName} {student.lastName}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-500 uppercase">Father's Name:</span>
            <span className="font-bold text-gray-900 ml-1 uppercase">{student.parent?.fatherName || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-500 uppercase">Class (Roll No):</span>
            <span className="font-bold text-gray-900 ml-1">{stuClass?.name || 'N/A'} (Roll: {student.rollNumber || 'N/A'})</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-500 uppercase">Contact Number:</span>
            <span className="font-bold text-gray-900 ml-1">{student.mobileNumber || student.parent?.primaryPhone || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-500 uppercase">Address:</span>
            <span className="font-bold text-gray-900 ml-1">{student.address || student.parent?.address || 'N/A'}</span>
          </div>
        </div>
      </div>

      <table className="w-full text-sm text-left mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-100 border-y-2 border-gray-900">
            <th className="py-2 px-2 border-x-2 border-gray-900 text-left">Fee Item</th>
            <th className="py-2 px-2 border-x-2 border-gray-900 text-right">Amount Paid</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b-2 border-gray-900">
            <td className="py-4 px-2 font-bold border-x-2 border-gray-900">{receipt.categoryName} - {new Date(receipt.dueDate).toLocaleString('default', { month: 'short', year: 'numeric' })}</td>
            <td className="py-4 px-2 text-right font-black text-lg border-x-2 border-gray-900">₹{receipt.amount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between items-end mt-8">
         <div>
           <span className="text-[10px] font-bold text-gray-500 uppercase block">Payment Method</span>
           <span className="font-bold">{receipt.paymentMode}</span>
         </div>
         <div className="text-center">
           <div className="w-32 border-b-2 border-gray-900 mb-2"></div>
           <span className="text-[10px] font-bold text-gray-600 uppercase">Authorized Signature</span>
         </div>
      </div>
    </div>
  );
};

const PrintableStatement = ({ stu, stuClass, activeSession, stuLedgers, totalDue, totalPaid, remaining, copyType, schoolConfig }) => {
  const schoolName = schoolConfig?.schoolName || localStorage.getItem('gdl_school_name') || 'GDLLearning Academy';
  const schoolAddress = schoolConfig?.schoolAddress || 'Varanasi, UP';
  const schoolContact = schoolConfig?.contactPhone || '';
  const schoolEmail = schoolConfig?.contactEmail || 'support@gdllearning.com';

  return (
    <div className="w-full border-2 border-gray-900 p-6 rounded-xl bg-white text-black">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">{schoolName}</h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            {schoolAddress} {schoolContact ? `• Contact: ${schoolContact}` : ''} {schoolEmail ? `• Email: ${schoolEmail}` : ''}
          </p>
          <p className="text-sm font-bold text-gray-600 mt-1">Comprehensive Fee Statement</p>
        </div>
        <div className="text-right">
          <div className="border border-gray-900 px-3 py-1 rounded font-bold text-[10px] uppercase mb-1 inline-block bg-gray-100">{copyType}</div>
          <p className="text-sm font-bold">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">Academic Year: {activeSession?.name || 'Current'}</p>
        </div>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6">
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-500">Student Name</p>
          <p className="font-black text-lg uppercase">{stu.firstName} {stu.lastName}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-500">Class & Section</p>
          <p className="font-bold text-base">{stuClass?.name || 'N/A'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-500">Roll Number</p>
          <p className="font-bold text-base">{stu.rollNumber || 'N/A'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-500">Outstanding Dues</p>
          <p className="font-black text-lg text-rose-600">₹{remaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Ledgers Breakdown */}
      <table className="w-full text-xs text-left mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-100 border-y-2 border-gray-900">
            <th className="py-2 px-2 border-x-2 border-gray-900">Date Due</th>
            <th className="py-2 px-2 border-x-2 border-gray-900">Fee Category</th>
            <th className="py-2 px-2 border-x-2 border-gray-900 text-right">Amount Due</th>
            <th className="py-2 px-2 border-x-2 border-gray-900 text-right">Amount Paid</th>
            <th className="py-2 px-2 border-x-2 border-gray-900 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {stuLedgers.length === 0 ? (
            <tr className="border-b border-gray-900">
              <td colSpan="5" className="py-4 text-center text-gray-500 font-bold border-x-2 border-gray-900">No ledgers planned for this student.</td>
            </tr>
          ) : (
            stuLedgers.map((l) => {
              const due = l.amountDue ?? 0;
              const paid = l.amountPaid ?? 0;
              const bal = due - paid;
              return (
                <tr key={l.id} className="border-b border-gray-900 font-medium">
                  <td className="py-2 px-2 border-x-2 border-gray-900">{new Date(l.dueDate).toLocaleDateString()}</td>
                  <td className="py-2 px-2 border-x-2 border-gray-900 font-bold">{l.categoryName}</td>
                  <td className="py-2 px-2 border-x-2 border-gray-900 text-right">₹{due.toLocaleString()}</td>
                  <td className="py-2 px-2 border-x-2 border-gray-900 text-right text-emerald-600">₹{paid.toLocaleString()}</td>
                  <td className="py-2 px-2 border-x-2 border-gray-900 text-right font-bold text-rose-600">₹{bal.toLocaleString()}</td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-black text-gray-900 border-b-2 border-gray-900">
            <td className="py-3 px-2 border-x-2 border-gray-900 text-right">TOTAL</td>
            <td className="py-3 px-2 border-x-2 border-gray-900 text-right">₹{totalDue.toLocaleString()}</td>
            <td className="py-3 px-2 border-x-2 border-gray-900 text-right text-emerald-600">₹{totalPaid.toLocaleString()}</td>
            <td className="py-3 px-2 border-x-2 border-gray-900 text-right text-rose-600">₹{remaining.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      {/* Footer Stamp */}
      <div className="flex justify-between items-end mt-8">
        <div className="text-[10px] text-gray-500 font-bold">
          System Generated Fee Statement.<br />Please contact the finance office for discrepancies.
        </div>
        <div className="text-center">
          <div className="w-32 border-b-2 border-gray-900 mb-2"></div>
          <span className="text-[10px] uppercase font-bold text-gray-600">Authorized Signatory</span>
        </div>
      </div>
    </div>
  );
};

export default function StudentFeesModuleWrapper(props) {
  return (
    <FeesErrorBoundary>
      <StudentFeesModule {...props} />
    </FeesErrorBoundary>
  );
}

function StudentFeesModule() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Overview');
  const [printReceiptData, setPrintReceiptData] = useState(null);
  const [printStatementData, setPrintStatementData] = useState(null);
  const [schoolConfig, setSchoolConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('gdl_school_config');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (printReceiptData) {
      setTimeout(() => {
        window.print();
        setPrintReceiptData(null);
      }, 500);
    }
  }, [printReceiptData]);

  useEffect(() => {
    if (printStatementData) {
      setTimeout(() => {
        window.print();
        setPrintStatementData(null);
      }, 500);
    }
  }, [printStatementData]);

  const [rightSubTab, setRightSubTab] = useState('ledger'); // 'ledger', 'history'

  useEffect(() => {
    if (location.state?.openCollectFee) {
      setActiveTab('Student Ledgers');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Data
  const [feeCategories, setFeeCategories] = useState([]);
  const [students, setStudents] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [summaryDetailStudent, setSummaryDetailStudent] = useState(null);
  const [directoryItemsPerPage] = useState(5);
  const [directoryViewMode, setDirectoryViewMode] = useState('grid');
  const [overviewPage, setOverviewPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [groupedLedgerPage, setGroupedLedgerPage] = useState(1);
  const [ledgerItemsPerPage] = useState(5);
  const [overviewItemsPerPage] = useState(5);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [summarySearch, setSummarySearch] = useState('');
  const [summaryClassId, setSummaryClassId] = useState('All');
  const [summarySectionId, setSummarySectionId] = useState('All');
  const [summaryStatus, setSummaryStatus] = useState('All');
  const [summarySortBy, setSummarySortBy] = useState('name-asc');

  // Dashboard & Timeline Filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [selectedTimelineMonth, setSelectedTimelineMonth] = useState('Full Session');
  const [expandedClassId, setExpandedClassId] = useState(null);

  // UI
  const [isLoading, setIsLoading] = useState(true);

  // Class Selection for Config (Tab 2)
  const [selectedConfigClassId, setSelectedConfigClassId] = useState('');

  // Structured Student Search (Tab 3)
  const [searchClassId, setSearchClassId] = useState('');
  const [searchSectionId, setSearchSectionId] = useState('');
  const [searchStudentId, setSearchStudentId] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isStudentDropdownOpen, setStudentDropdownOpen] = useState(false);

  // Modals
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isClassSetupModalOpen, setClassSetupModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isCollectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Forms & Setup Rows
  const [categoryForm, setCategoryForm] = useState({ name: '', amount: '', frequency: 'Monthly', classIds: '', isCustom: false, isCommon: false });
  const [editingCategory, setEditingCategory] = useState(null);
  const [setupRows, setSetupRows] = useState([]);
  const [deletedCategoryIds, setDeletedCategoryIds] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  // Search, Filter, Sort & Pagination for Fee Categories configuration
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFrequency, setFilterFrequency] = useState('All');
  const [filterScope, setFilterScope] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fees Directory Tab States
  const [allLedgers, setAllLedgers] = useState([]);
  const [isAllLedgersLoading, setIsAllLedgersLoading] = useState(false);
  const [selectedDirectoryStudentId, setSelectedDirectoryStudentId] = useState(null);

  const ledgersList = useMemo(() => Array.isArray(ledgers) ? ledgers : [], [ledgers]);
  const allLedgersList = useMemo(() => Array.isArray(allLedgers) ? allLedgers : [], [allLedgers]);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryClassId, setDirectoryClassId] = useState('All');
  const [directorySectionId, setDirectorySectionId] = useState('All');
  const [directoryStatus, setDirectoryStatus] = useState('All');
  const [directorySortBy, setDirectorySortBy] = useState('name-asc');
  const [directoryPage, setDirectoryPage] = useState(1);

  const [paymentForm, setPaymentForm] = useState({
    ledgerId: '', amountPaying: '', paymentMode: 'Cash', isOnline: false, transactionNumber: '', paymentDate: todayDateStr()
  });

  // Collect Multi-Fees Modal Forms
  const [collectPayments, setCollectPayments] = useState({}); // ledgerId -> amount paying
  const [collectPaymentForm, setCollectPaymentForm] = useState({
    paymentMode: 'Cash', isOnline: false, transactionNumber: '', paymentDate: todayDateStr()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Plan Fees Setup
  const [billingModes, setBillingModes] = useState([]); // Selected billing frequencies
  const [selectedSlots, setSelectedSlots] = useState([]); // Selected slots inside those frequencies
  const [selectedPlanChips, setSelectedPlanChips] = useState([]); // Selected fee categories
  const [planStartDate, setPlanStartDate] = useState(todayDateStr()); // Auto today
  const [initialPayments, setInitialPayments] = useState({}); // slotId_categoryId -> amount paid now

  const [planPayment, setPlanPayment] = useState({
    hasPayment: false,
    paymentMode: 'Cash',
    isOnline: false,
    transactionNumber: '',
    paymentDate: todayDateStr()
  });

  // Selected Data
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const searchRef = useRef(null);

  // ─── School Ledger State ───────────────────────────────────────────────
  const LEDGER_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const LEDGER_PIE_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#06b6d4'];

  const [finTxs, setFinTxs] = useState([]);
  const [finLoading, setFinLoading] = useState(false);
  const [finRefreshing, setFinRefreshing] = useState(false);
  const [finSearch, setFinSearch] = useState('');
  const [finFilterType, setFinFilterType] = useState('All');
  const [finFilterSource, setFinFilterSource] = useState('All');
  const [finFilterMonth, setFinFilterMonth] = useState('All');
  const [finFilterYear, setFinFilterYear] = useState(new Date().getFullYear());
  const [consolidatedLedgerPage, setConsolidatedLedgerPage] = useState(1);
  const [isLedgerModalOpen, setLedgerModalOpen] = useState(false);
  const [finForm, setFinForm] = useState({
    type: 'Income', category: '', amount: '',
    date: todayDateStr(), description: '', referenceNo: ''
  });
  const [finSubmitting, setFinSubmitting] = useState(false);

  const fetchFinTxs = async (silent = false) => {
    try {
      if (!silent) setFinLoading(true); else setFinRefreshing(true);
      const res = await fetch(`${apiBase}/finance/transactions`);
      if (res.ok) setFinTxs(await res.json());
    } catch (err) { console.error(err); }
    finally { setFinLoading(false); setFinRefreshing(false); }
  };

  useEffect(() => { fetchInitialData(); }, []);


  // Fetch student ledgers and reset selections when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchLedgers(selectedStudent.id);
    } else {
      setLedgers([]);
      setBillingModes([]);
      setSelectedPlanChips([]);
      setSelectedSlots([]);
      setPlanStartDate(todayDateStr());
      setPlanPayment({ hasPayment: false, paymentMode: 'Cash', isOnline: false, transactionNumber: '', paymentDate: todayDateStr() });
    }
  }, [selectedStudent]);

  // Auto-assign student's class fee structure when ledgers or student changes
  useEffect(() => {
    if (selectedStudent && ledgersList.length >= 0) {
      // Find all categories matching student's class
      const studentCats = feeCategories.filter(cat => {
        if (!cat.classIds) return true; // Common/All-Class fee
        try {
          const parsed = JSON.parse(cat.classIds);
          return Array.isArray(parsed) && parsed.includes(selectedStudent.classId);
        } catch (e) {
          return false;
        }
      });

      // Filter out categories that are already fully paid
      const unbilledCats = studentCats.filter(cat => {
        const existing = ledgersList.filter(l => l.feeCategoryId === cat.id);
        if (existing.length === 0) return true;
        return !existing.some(l => l.status === 'Paid');
      });

      const uniqFreqs = Array.from(new Set(unbilledCats.map(c => c.frequency)));
      setBillingModes(uniqFreqs);
      setSelectedPlanChips(unbilledCats);
    }
  }, [ledgersList, selectedStudent, feeCategories]);

  // Reset section and student when class changes in structured search
  useEffect(() => {
    setSearchSectionId('');
    setSearchStudentId('');
    setSelectedStudent(null);
  }, [searchClassId]);

  // Reset student when section changes in structured search
  useEffect(() => {
    setSearchStudentId('');
    setSelectedStudent(null);
  }, [searchSectionId]);

  // Handle selected student object from dropdown selection
  useEffect(() => {
    if (searchStudentId) {
      const stu = students.find(s => s.id === searchStudentId);
      if (stu) setSelectedStudent(stu);
    } else {
      setSelectedStudent(null);
    }
  }, [searchStudentId, students]);

  // Generate available slots based on selected modes & start date
  const allAvailableSlots = useMemo(() => {
    let slots = [];
    billingModes.forEach(mode => {
      slots = [...slots, ...generateSlotsForMode(planStartDate, mode, activeSession)];
    });
    return slots;
  }, [billingModes, planStartDate, activeSession]);

  // Sync selected slots when available slots change
  useEffect(() => {
    setSelectedSlots(allAvailableSlots.map(s => s.id));
  }, [allAvailableSlots]);

  // Grouped billing slots under each frequency for dynamic list selections
  const groupedAvailableSlots = useMemo(() => {
    const groups = {};
    allAvailableSlots.forEach(s => {
      if (!groups[s.frequency]) groups[s.frequency] = [];
      groups[s.frequency].push(s);
    });
    return groups;
  }, [allAvailableSlots]);

  // Plan items calculation: pairs of selected slots and categories
  const planItems = useMemo(() => {
    const items = [];
    allAvailableSlots.filter(s => selectedSlots.includes(s.id)).forEach(slot => {
      selectedPlanChips.forEach(cat => {
        if (cat.frequency === slot.frequency) {
          items.push({
            slot,
            category: cat,
            amount: cat.amount,
            key: `${slot.id}_${cat.id}`
          });
        }
      });
    });
    return items;
  }, [allAvailableSlots, selectedSlots, selectedPlanChips]);

  // Calculate Plan Totals
  const grandTotal = useMemo(() => {
    return planItems.reduce((acc, item) => acc + item.amount, 0);
  }, [planItems]);

  // Initialize initial payments mapping when plan items change
  useEffect(() => {
    const newPayments = {};
    planItems.forEach(item => {
      newPayments[item.key] = initialPayments[item.key] !== undefined ? initialPayments[item.key] : item.amount;
    });
    setInitialPayments(newPayments);
  }, [planItems]);

  const totalInitialPayment = useMemo(() => {
    if (!planPayment.hasPayment) return 0;
    return Object.values(initialPayments).reduce((a, b) => a + b, 0);
  }, [planPayment.hasPayment, initialPayments]);

  useEffect(() => {
    const fn = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setStudentDropdownOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const fetchInitialData = async (keepClassId = null) => {
    try {
      setIsLoading(true);
      const [catRes, stuRes, clsRes, sessRes, schoolRes] = await Promise.all([
        fetch(`${apiBase}/finance/fee-categories`),
        fetch(`${apiBase}/students`),
        fetch(`${apiBase}/setup/classes`),
        fetch(`${apiBase}/setup/sessions`),
        fetch(`${apiBase}/setup/school`)
      ]);
      const categoriesData = await catRes.json();
      setFeeCategories(categoriesData);
      setStudents(await stuRes.json());
      
      const classesData = await clsRes.json();
      setClasses(classesData);
      if (classesData.length > 0) {
        const targetId = keepClassId || selectedConfigClassId;
        const exists = classesData.some(c => c.id === targetId);
        setSelectedConfigClassId(exists ? targetId : classesData[0].id);
      }

      const sessionsData = await sessRes.json();
      setSessions(sessionsData);
      const activeSess = Array.isArray(sessionsData) ? sessionsData.find(s => s.isActive) : null;
      setActiveSession(activeSess || null);
      if (activeSess) {
        setSelectedSessionId(activeSess.id);
      } else if (sessionsData.length > 0) {
        setSelectedSessionId(sessionsData[0].id);
      }

      if (schoolRes.ok) {
        const sData = await schoolRes.json();
        setSchoolConfig(sData);
        localStorage.setItem('gdl_school_config', JSON.stringify(sData));
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const fetchLedgers = async (studentId) => {
    try {
      const res = await fetch(`${apiBase}/finance/ledgers?studentId=${studentId}`);
      const data = await res.json();
      setLedgers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLedgers([]);
    }
  };

  // Fees Directory Effects & Selectors
  const fetchAllLedgers = async () => {
    try {
      setIsAllLedgersLoading(true);
      const res = await fetch(`${apiBase}/finance/ledgers`);
      const data = await res.json();
      setAllLedgers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAllLedgers([]);
    } finally {
      setIsAllLedgersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Fees Directory' || activeTab === 'Overview') {
      fetchAllLedgers();
    }
    if (activeTab === 'Overview') {
      fetchFinTxs();
    }
    setSelectedDirectoryStudentId(null);
  }, [activeTab]);

  useEffect(() => {
    setDirectoryPage(1);
  }, [directorySearch, directoryClassId, directorySectionId, directoryStatus, directorySortBy]);

  const directorySectionsList = useMemo(() => {
    if (directoryClassId === 'All') {
      const names = new Set();
      classes.forEach(c => {
        if (Array.isArray(c.sections)) {
          c.sections.forEach(sec => {
            if (sec.name) names.add(sec.name);
          });
        }
      });
      return Array.from(names).sort().map(name => ({ id: name, name: `Section ${name}` }));
    }
    const cls = classes.find(c => c.id === directoryClassId);
    return cls && Array.isArray(cls.sections) ? cls.sections.map(s => ({ id: s.id, name: `Section ${s.name}` })) : [];
  }, [classes, directoryClassId]);

  useEffect(() => {
    setDirectorySectionId('All');
  }, [directoryClassId]);

  // ── DASHBOARD HELPERS ──
  const sessionMonths = useMemo(() => {
    if (!activeSession) return [];
    const months = [];
    let start = new Date(activeSession.startDate);
    const end = new Date(activeSession.endDate);
    while (start <= end) {
      const year = start.getFullYear();
      const month = start.getMonth();
      const label = start.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.push({
        label,
        year,
        month,
        startDateStr: new Date(year, month, 1).toISOString().split('T')[0],
        endDateStr: new Date(year, month + 1, 0).toISOString().split('T')[0]
      });
      start.setMonth(start.getMonth() + 1);
    }
    return months;
  }, [activeSession]);

  useEffect(() => {
    if (activeSession) {
      const start = new Date(activeSession.startDate).toISOString().split('T')[0];
      const end = new Date(activeSession.endDate).toISOString().split('T')[0];
      setFilterStartDate(start);
      setFilterEndDate(end);
      setSelectedTimelineMonth('Full Session');
    } else {
      const year = new Date().getFullYear();
      setFilterStartDate(`${year}-04-01`);
      setFilterEndDate(`${year + 1}-03-31`);
      setSelectedTimelineMonth('Full Session');
    }
  }, [activeSession]);

  const dashboardMetrics = useMemo(() => {
    let invoiced = 0;
    let collected = 0;
    let pending = 0;

    const start = filterStartDate ? new Date(filterStartDate + 'T00:00:00') : null;
    const end = filterEndDate ? new Date(filterEndDate + 'T23:59:59') : null;

    allLedgersList.forEach(l => {
      const dueD = new Date(l.dueDate);
      if ((!start || dueD >= start) && (!end || dueD <= end)) {
        invoiced += Number(l.amountDue ?? 0);
        pending += Math.max(0, Number(l.amountDue ?? 0) - Number(l.amountPaid ?? 0));
      }

      const receipts = Array.isArray(l.receipts) ? l.receipts : [];
      receipts.forEach(r => {
        const payD = new Date(r.paymentDate);
        if ((!start || payD >= start) && (!end || payD <= end)) {
          collected += Number(r.amount ?? 0);
        }
      });
    });

    const rate = invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0;

    return { invoiced, collected, pending, rate };
  }, [allLedgersList, filterStartDate, filterEndDate]);

  const monthlyTimelineData = useMemo(() => {
    const monthsData = {};
    const start = filterStartDate ? new Date(filterStartDate + 'T00:00:00') : new Date();
    const end = filterEndDate ? new Date(filterEndDate + 'T23:59:59') : new Date();

    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const stop = new Date(end.getFullYear(), end.getMonth(), 1);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const getFastLabel = (dateObj) => `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    while (current <= stop) {
      const label = getFastLabel(current);
      monthsData[label] = { monthLabel: label, invoiced: 0, collected: 0, pending: 0, key: current.getTime() };
      current.setMonth(current.getMonth() + 1);
    }

    allLedgersList.forEach(l => {
      const d = new Date(l.dueDate);
      const label = getFastLabel(d);
      if (monthsData[label]) {
        monthsData[label].invoiced += Number(l.amountDue ?? 0);
        monthsData[label].pending += Math.max(0, Number(l.amountDue ?? 0) - Number(l.amountPaid ?? 0));
      }
    });

    allLedgersList.forEach(l => {
      const receipts = Array.isArray(l.receipts) ? l.receipts : [];
      receipts.forEach(r => {
        const d = new Date(r.paymentDate);
        const label = getFastLabel(d);
        if (monthsData[label]) {
          monthsData[label].collected += Number(r.amount ?? 0);
        }
      });
    });

    return Object.values(monthsData).sort((a, b) => a.key - b.key);
  }, [allLedgersList, filterStartDate, filterEndDate]);

  const classWiseStats = useMemo(() => {
    const classMap = {};
    const start = filterStartDate ? new Date(filterStartDate + 'T00:00:00') : null;
    const end = filterEndDate ? new Date(filterEndDate + 'T23:59:59') : null;

    classes.forEach(c => {
      classMap[c.id] = {
        id: c.id,
        name: c.name,
        studentCount: 0,
        invoiced: 0,
        collected: 0,
        pending: 0,
        sections: {}
      };

      if (Array.isArray(c.sections)) {
        c.sections.forEach(sec => {
          classMap[c.id].sections[sec.id] = {
            id: sec.id,
            name: sec.name,
            invoiced: 0,
            collected: 0,
            pending: 0,
            studentCount: 0
          };
        });
      }
    });

    students.forEach(stu => {
      if (classMap[stu.classId]) {
        classMap[stu.classId].studentCount += 1;
        if (classMap[stu.classId].sections[stu.sectionId]) {
          classMap[stu.classId].sections[stu.sectionId].studentCount += 1;
        }
      }
    });

    const studentsMap = {};
    if (Array.isArray(students)) {
      students.forEach(s => { studentsMap[s.id] = s; });
    }

    if (Array.isArray(allLedgersList)) {
      allLedgersList.forEach(l => {
        const student = studentsMap[l.studentId];
        if (!student) return;
        
        const cStats = classMap[student.classId];
        if (!cStats) return;

        const dueD = new Date(l.dueDate);
        if ((!start || dueD >= start) && (!end || dueD <= end)) {
          const amtDue = Number(l.amountDue ?? 0);
          const amtPaid = Number(l.amountPaid ?? 0);
          const pending = Math.max(0, amtDue - amtPaid);
          
          cStats.invoiced += amtDue;
          cStats.pending += pending;
          
          const secStats = cStats.sections[student.sectionId];
          if (secStats) {
            secStats.invoiced += amtDue;
            secStats.pending += pending;
          }
        }

        const receipts = Array.isArray(l.receipts) ? l.receipts : [];
        receipts.forEach(r => {
          const payD = new Date(r.paymentDate);
          if ((!start || payD >= start) && (!end || payD <= end)) {
            const rAmt = Number(r.amount ?? 0);
            cStats.collected += rAmt;
            const secStats = cStats.sections[student.sectionId];
            if (secStats) {
              secStats.collected += rAmt;
            }
          }
        });
      });
    }

    return Object.values(classMap);
  }, [classes, students, allLedgersList, filterStartDate, filterEndDate]);

  const overviewTotalPages = Math.ceil(classWiseStats.length / overviewItemsPerPage);
  const paginatedClassWiseStats = useMemo(() => {
    const startIndex = (overviewPage - 1) * overviewItemsPerPage;
    return classWiseStats.slice(startIndex, startIndex + overviewItemsPerPage);
  }, [classWiseStats, overviewPage, overviewItemsPerPage]);

  const activeFeeNames = useMemo(() => {
    const namesSet = new Set();
    if (Array.isArray(feeCategories)) {
      feeCategories.forEach(cat => {
        if (cat?.name && typeof cat.name === 'string') namesSet.add(cat.name.trim());
      });
    }
    if (Array.isArray(allLedgersList)) {
      allLedgersList.forEach(l => {
        const catName = l?.category?.name;
        if (catName && typeof catName === 'string') namesSet.add(catName.trim());
      });
    }
    return Array.from(namesSet).sort();
  }, [feeCategories, allLedgersList]);

  const feeFrequencies = useMemo(() => {
    const freqMap = {};
    if (Array.isArray(feeCategories)) {
      feeCategories.forEach(cat => {
        if (cat?.name && typeof cat.name === 'string' && cat?.frequency && typeof cat.frequency === 'string') {
          freqMap[cat.name.trim()] = cat.frequency.trim();
        }
      });
    }
    if (Array.isArray(allLedgersList)) {
      allLedgersList.forEach(l => {
        const catName = l?.category?.name;
        const catFreq = l?.category?.frequency;
        if (catName && typeof catName === 'string' && catFreq && typeof catFreq === 'string' && !freqMap[catName.trim()]) {
          freqMap[catName.trim()] = catFreq.trim();
        }
      });
    }
    return freqMap;
  }, [feeCategories, allLedgersList]);

  const processedStudentFees = useMemo(() => {
    const studentsArr = Array.isArray(students) ? students : [];
    
    const ledgersByStudent = {};
    allLedgersList.forEach(l => {
      if (!ledgersByStudent[l.studentId]) ledgersByStudent[l.studentId] = [];
      ledgersByStudent[l.studentId].push(l);
    });

    const classesMap = {};
    classes.forEach(c => { classesMap[c.id] = c; });

    const categoriesMap = {};
    feeCategories.forEach(c => { categoriesMap[c.id] = c; });

    return studentsArr.map(stu => {
      const stuLedgers = ledgersByStudent[stu.id] || [];
      
      const categoryBreakdown = {};
      activeFeeNames.forEach(name => {
        categoryBreakdown[name] = { billed: 0, paid: 0 };
      });

      stuLedgers.forEach(l => {
        const cat = categoriesMap[l.feeCategoryId];
        const catName = cat?.name || l.category?.name;
        if (catName && categoryBreakdown[catName]) {
          categoryBreakdown[catName].billed += Number(l.amountDue ?? 0);
          categoryBreakdown[catName].paid += Number(l.amountPaid ?? 0);
        }
      });

      const totalBilled = stuLedgers.reduce((acc, l) => acc + Number(l.amountDue ?? 0), 0);
      const totalPaid = stuLedgers.reduce((acc, l) => acc + Number(l.amountPaid ?? 0), 0);
      const totalDue = Math.max(0, totalBilled - totalPaid);
      
      let status = 'No Invoices';
      if (totalBilled > 0) {
        if (totalDue === 0) status = 'Fully Paid';
        else if (totalPaid === 0) status = 'Unpaid';
        else status = 'Partial';
      }

      const clsObj = classesMap[stu.classId];
      const secObj = clsObj?.sections?.find(s => s.id === stu.sectionId);

      return {
        ...stu,
        totalBilled,
        totalPaid,
        totalDue,
        status,
        categoryBreakdown,
        className: clsObj?.name || 'N/A',
        sectionName: secObj?.name || 'N/A'
      };
    });
  }, [students, allLedgersList, classes, activeFeeNames, feeCategories]);

  const filteredAndSortedDirectory = useMemo(() => {
    let result = [...processedStudentFees];

    if (directorySearch) {
      const q = directorySearch.toLowerCase();
      result = result.filter(stu => 
        `${stu.firstName} ${stu.lastName}`.toLowerCase().includes(q) ||
        stu.admissionNumber?.toLowerCase().includes(q)
      );
    }

    if (directoryClassId !== 'All') {
      result = result.filter(stu => stu.classId === directoryClassId);
    }

    if (directorySectionId !== 'All') {
      if (directoryClassId === 'All') {
        result = result.filter(stu => stu.sectionName === directorySectionId);
      } else {
        result = result.filter(stu => stu.sectionId === directorySectionId);
      }
    }

    if (directoryStatus !== 'All') {
      result = result.filter(stu => {
        if (directoryStatus === 'Due Pending') {
          return stu.status === 'Unpaid' || stu.status === 'Partial';
        }
        return stu.status === directoryStatus;
      });
    }

    if (directorySortBy === 'name-asc') {
      result.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (directorySortBy === 'name-desc') {
      result.sort((a, b) => b.firstName.localeCompare(a.firstName));
    } else if (directorySortBy === 'due-desc') {
      result.sort((a, b) => b.totalDue - a.totalDue);
    } else if (directorySortBy === 'due-asc') {
      result.sort((a, b) => a.totalDue - b.totalDue);
    }

    return result;
  }, [processedStudentFees, directorySearch, directoryClassId, directorySectionId, directoryStatus, directorySortBy]);

  const paginatedDirectory = useMemo(() => {
    const startIndex = (directoryPage - 1) * directoryItemsPerPage;
    return filteredAndSortedDirectory.slice(startIndex, startIndex + directoryItemsPerPage);
  }, [filteredAndSortedDirectory, directoryPage]);

  const directoryTotalPages = Math.ceil(filteredAndSortedDirectory.length / directoryItemsPerPage);



  const exportDirectoryToCSV = () => {
    if (filteredAndSortedDirectory.length === 0) return;
    
    const headers = [
      'Admission No',
      'Student Name',
      'Class',
      'Section',
      'Status',
      'Total Billed (INR)',
      'Total Paid (INR)',
      'Remaining Balance (INR)',
      ...activeFeeNames.map(name => `${name} Billed (INR)`),
      ...activeFeeNames.map(name => `${name} Paid (INR)`)
    ];

    const rows = filteredAndSortedDirectory.map(stu => [
      stu.admissionNumber || '',
      `${stu.firstName} ${stu.lastName}`,
      stu.className,
      stu.sectionName,
      stu.status,
      stu.totalBilled,
      stu.totalPaid,
      stu.totalDue,
      ...activeFeeNames.map(name => stu.categoryBreakdown[name]?.billed || 0),
      ...activeFeeNames.map(name => stu.categoryBreakdown[name]?.paid || 0)
    ]);

    const csvRows = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    const sessionName = sessions.find(s => s.id === selectedSessionId)?.name || 'Session';
    link.setAttribute("href", url);
    link.setAttribute("download", `Fees_Directory_Summary_${sessionName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewLedger = (stu) => {
    setSearchClassId(stu.classId);
    setSearchSectionId(stu.sectionId);
    setSearchStudentId(stu.id);
    setSelectedStudent(stu);
    setActiveTab('Student Ledgers');
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      // Check for duplicate names for this class
      const sameNameExists = categoriesForConfigClass.some(cat => {
        if (editingCategory && cat.id === editingCategory.id) return false;
        return cat.name.trim().toLowerCase() === categoryForm.name.trim().toLowerCase();
      });
      if (sameNameExists) {
        alert(`The fee name "${categoryForm.name}" is already configured for this class. Please use a different name.`);
        return;
      }

      const payload = {
        name: categoryForm.name,
        amount: parseFloat(categoryForm.amount),
        frequency: categoryForm.frequency,
        classIds: categoryForm.isCommon ? null : JSON.stringify([selectedConfigClassId])
      };

      if (editingCategory) {
        const res = await fetch(`${apiBase}/finance/fee-categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setFeeCategories(prev => prev.map(c => c.id === editingCategory.id ? data : c));
      } else {
        const res = await fetch(`${apiBase}/finance/fee-categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setFeeCategories(prev => [...prev, data]);
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', amount: '', frequency: 'Monthly', classIds: '', isCustom: false, isCommon: false });
    } catch (err) { console.error(err); }
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    const isCustom = !DEFAULT_FEE_TYPES.includes(cat.name);
    const isCommon = !cat.classIds;
    let classIdVal = '';
    if (cat.classIds) {
      try {
        const parsed = JSON.parse(cat.classIds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          classIdVal = parsed[0];
        }
      } catch (e) {
        classIdVal = cat.classIds;
      }
    }
    setCategoryForm({
      name: cat.name,
      amount: cat.amount.toString(),
      frequency: cat.frequency,
      classIds: classIdVal,
      isCustom,
      isCommon
    });
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (cat) => {
    if (window.confirm(`Are you sure you want to delete "${cat.name}"?`)) {
      try {
        const res = await fetch(`${apiBase}/finance/fee-categories/${cat.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setFeeCategories(prev => prev.filter(c => c.id !== cat.id));
        } else {
          alert("Failed to delete fee category.");
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting fee category.");
      }
    }
  };

  // Class Setup Modal handlers
  const openClassSetupModal = () => {
    const classSpecificCats = feeCategories.filter(cat => {
      if (!cat.classIds) return false;
      try {
        const parsed = JSON.parse(cat.classIds);
        return Array.isArray(parsed) && parsed.includes(selectedConfigClassId);
      } catch (e) {
        return false;
      }
    });

    const mapped = classSpecificCats.map(c => ({
      id: c.id,
      name: c.name,
      amount: c.amount,
      frequency: c.frequency,
      isCommon: false,
      isCustom: !DEFAULT_FEE_TYPES.includes(c.name)
    }));

    setSetupRows(mapped.length > 0 ? mapped : [{ id: null, name: 'Tuition Fee', amount: '', frequency: 'Monthly', isCommon: false, isCustom: false }]);
    setDeletedCategoryIds([]);
    setOpenDropdownIndex(null);
    setClassSetupModalOpen(true);
  };

  const addSetupRow = () => {
    console.log("Adding new setup row...");
    setSetupRows(prev => {
      const next = [...prev, { id: null, name: '', amount: '', frequency: 'Monthly', isCommon: false, isCustom: false }];
      console.log("New setup rows state:", next);
      return next;
    });
  };

  const removeSetupRow = (index, rowId) => {
    if (rowId) {
      setDeletedCategoryIds(prev => [...prev, rowId]);
    }
    setSetupRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClassSetupSave = async (e) => {
    e.preventDefault();
    
    // Check for duplicate names inside the setupRows
    const names = setupRows.map(r => r.name.trim().toLowerCase());
    const duplicates = names.filter((name, idx) => names.indexOf(name) !== idx && name !== "");
    if (duplicates.length > 0) {
      alert(`Duplicate fee names are not allowed: "${duplicates[0]}". Please remove or change the duplicate fee type.`);
      return;
    }

    // Check for duplicates against existing DB categories for this class
    for (const row of setupRows) {
      const isDuplicateInDb = feeCategories.some(cat => {
        if (cat.id === row.id) return false;
        if (cat.name.trim().toLowerCase() !== row.name.trim().toLowerCase()) return false;
        
        let applies = false;
        if (!cat.classIds) {
          applies = true; // Common fee applies to all classes
        } else {
          try {
            const parsed = JSON.parse(cat.classIds);
            if (Array.isArray(parsed) && parsed.includes(selectedConfigClassId)) {
              applies = true;
            }
          } catch (e) {}
        }
        return applies;
      });
      if (isDuplicateInDb) {
        alert(`The fee name "${row.name}" is already configured for this class (either as a class-specific fee or a common fee). Please use a different name.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Handle deleted categories
      for (const delId of deletedCategoryIds) {
        await fetch(`${apiBase}/finance/fee-categories/${delId}`, { method: 'DELETE' });
      }

      // 2. Format categories to submit
      const payloadCats = setupRows.map(row => ({
        id: row.id || undefined,
        name: row.name,
        amount: parseFloat(row.amount) || 0,
        frequency: row.frequency,
        classIds: row.isCommon ? null : JSON.stringify([selectedConfigClassId])
      }));

      // 3. Post bulk setup
      const res = await fetch(`${apiBase}/finance/fee-categories/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: payloadCats })
      });

      if (res.ok) {
        setClassSetupModalOpen(false);
        fetchInitialData(selectedConfigClassId);
      } else {
        alert("Failed to save class fee structure.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving class structure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBillingMode = (key) => {
    setBillingModes(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleSlotSelection = (slotId) => {
    setSelectedSlots(prev =>
      prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]
    );
  };

  const handleGeneratePlan = async () => {
    if (!selectedStudent || planItems.length === 0 || isGenerating) return;
    setIsGenerating(true);
    try {
      const fullMode = planPayment.isOnline
        ? `Online (${planPayment.paymentMode})${planPayment.transactionNumber ? ' | TXN: ' + planPayment.transactionNumber : ''}`
        : planPayment.paymentMode;

      // Create ledger and optional payment record for each planned item
      for (const item of planItems) {
        const res = await fetch(`${apiBase}/finance/ledgers`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            feeCategoryId: item.category.id,
            dueDate: item.slot.date,
            amountDue: item.amount
          })
        });
        const ledger = await res.json();

        const paidNow = planPayment.hasPayment ? (initialPayments[item.key] || 0) : 0;
        if (paidNow > 0) {
          await fetch(`${apiBase}/finance/receipts`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ledgerId: ledger.id,
              amount: paidNow,
              paymentMode: fullMode,
              paymentDate: planPayment.paymentDate
            })
          });
        }
      }

      // Reset planning form
      setSelectedPlanChips([]);
      setBillingModes([]);
      setSelectedSlots([]);
      setPlanPayment({ hasPayment: false, paymentMode: 'Cash', isOnline: false, transactionNumber: '', paymentDate: todayDateStr() });
      fetchLedgers(selectedStudent.id);
    } catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ledgerId: paymentForm.ledgerId,
        amount: paymentForm.amountPaying,
        paymentMode: paymentForm.isOnline ? `Online (${paymentForm.paymentMode})` : paymentForm.paymentMode,
        transactionNumber: paymentForm.isOnline ? paymentForm.transactionNumber : null,
        paymentDate: paymentForm.paymentDate
      };
      await fetch(`${apiBase}/finance/receipts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      setPaymentModalOpen(false);
      if (selectedStudent) fetchLedgers(selectedStudent.id);
    } catch (err) { console.error(err); }
  };

  // Collect Multi-Fees Submission
  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullMode = collectPaymentForm.isOnline
        ? `Online (${collectPaymentForm.paymentMode})`
        : collectPaymentForm.paymentMode;
      const txn = collectPaymentForm.isOnline ? collectPaymentForm.transactionNumber : null;

      // Submit payment for each non-zero payment amount
      for (const [ledgerId, amount] of Object.entries(collectPayments)) {
        const amt = parseFloat(amount) || 0;
        if (amt > 0) {
          await fetch(`${apiBase}/finance/receipts`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ledgerId,
              amount: amt,
              paymentMode: txn ? `${fullMode} | TXN: ${txn}` : fullMode,
              paymentDate: collectPaymentForm.paymentDate
            })
          });
        }
      }
      setCollectModalOpen(false);
      fetchLedgers(selectedStudent.id);
    } catch (err) {
      console.error(err);
      alert("Error collecting payments.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCollectModal = () => {
    const initialCollect = {};
    ledgersList.forEach(l => {
      if (l.status !== 'Paid') {
        initialCollect[l.id] = (l.amountDue ?? 0) - (l.amountPaid ?? 0);
      }
    });
    setCollectPayments(initialCollect);
    setCollectPaymentForm({
      paymentMode: 'Cash',
      isOnline: false,
      transactionNumber: '',
      paymentDate: todayDateStr()
    });
    setCollectModalOpen(true);
  };

  const openPaymentModal = (ledger) => {
    const remaining = (ledger.amountDue ?? 0) - (ledger.amountPaid ?? 0);
    setSelectedLedger(ledger);
    setPaymentForm({ ledgerId: ledger.id, amountPaying: remaining, paymentMode: 'Cash', isOnline: false, transactionNumber: '', paymentDate: todayDateStr() });
    setPaymentModalOpen(true);
  };

  const togglePlanChip = (cat) => {
    setSelectedPlanChips(prev =>
      prev.find(c => c.id === cat.id) ? prev.filter(c => c.id !== cat.id) : [...prev, cat]
    );
  };

  // Smart checking if student already has a billed and paid ledger for a category
  const getCategoryBilledStatus = (cat) => {
    const existing = ledgersList.filter(l => l.feeCategoryId === cat.id);
    if (existing.length === 0) return 'none'; // Not billed
    if (existing.some(l => l.status === 'Paid')) return 'paid'; // Billed & fully paid
    if (existing.some(l => l.status === 'Unpaid' || l.status === 'Partial')) return 'due'; // Has dues
    return 'none';
  };

  // Class & Section dropdown details
  const selectedClassObj = useMemo(() => {
    return classes.find(c => c.id === searchClassId);
  }, [classes, searchClassId]);

  const sectionsList = useMemo(() => {
    return selectedClassObj ? selectedClassObj.sections : [];
  }, [selectedClassObj]);

  const filteredStudentsForSearch = useMemo(() => {
    if (!searchClassId || !searchSectionId) return [];
    return students.filter(s =>
      s.classId === searchClassId &&
      s.sectionId === searchSectionId &&
      (`${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
       s.admissionNumber?.toLowerCase().includes(studentSearchQuery.toLowerCase()))
    );
  }, [students, searchClassId, searchSectionId, studentSearchQuery]);

  // Categories filtered by selected class configuration
  const categoriesForConfigClass = useMemo(() => {
    if (!selectedConfigClassId) return [];
    return feeCategories.filter(c => {
      if (!c.classIds) return true; // Common/All-Class fee
      try {
        const parsed = JSON.parse(c.classIds);
        return Array.isArray(parsed) && parsed.includes(selectedConfigClassId);
      } catch (e) {
        return false;
      }
    });
  }, [feeCategories, selectedConfigClassId]);

  // Filter, search, sort, and paginated fee categories for config viewer
  const filteredAndSortedCategories = useMemo(() => {
    let result = [...categoriesForConfigClass];

    // Search query
    if (searchQuery) {
      result = result.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by Frequency
    if (filterFrequency !== 'All') {
      result = result.filter(cat => cat.frequency === filterFrequency);
    }

    // Filter by Scope
    if (filterScope !== 'All') {
      result = result.filter(cat => {
        const isCommon = !cat.classIds;
        return filterScope === 'Common' ? isCommon : !isCommon;
      });
    }

    // Sort
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'amount-asc') {
      result.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === 'amount-desc') {
      result.sort((a, b) => b.amount - a.amount);
    }

    return result;
  }, [categoriesForConfigClass, searchQuery, filterFrequency, filterScope, sortBy]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCategories, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage);

  // Reset page when filter/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterFrequency, filterScope, sortBy, selectedConfigClassId]);

  // Categories filtered by student's class (for Step 4 display)
  const categoriesForStudentClass = useMemo(() => {
    if (!selectedStudent) return [];
    return feeCategories.filter(c => {
      if (!c.classIds) return true; // Common fee
      try {
        const parsed = JSON.parse(c.classIds);
        return Array.isArray(parsed) && parsed.includes(selectedStudent.classId);
      } catch (e) {
        return false;
      }
    });
  }, [selectedStudent, feeCategories]);

  // Categories filtered by selected billing modes (frequencies)
  const categoriesForMode = useMemo(() => {
    if (billingModes.length === 0) return [];
    return categoriesForStudentClass.filter(c => billingModes.includes(c.frequency));
  }, [billingModes, categoriesForStudentClass]);

  // Group ledgers by Month-Year for Billing Date display
  const groupedLedgers = useMemo(() => {
    const groups = {};
    ledgersList.forEach(l => {
      const d = new Date(l.dueDate);
      const key = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = { ledgers: [], sortDate: d.getTime(), totalDue: 0, totalPaid: 0 };
      groups[key].ledgers.push(l);
      groups[key].totalDue += Number(l.amountDue ?? 0);
      groups[key].totalPaid += Number(l.amountPaid ?? 0);
    });
    return Object.entries(groups).sort((a, b) => a[1].sortDate - b[1].sortDate);
  }, [ledgersList]);

  const groupedLedgersTotalPages = Math.ceil(groupedLedgers.length / ledgerItemsPerPage);
  const paginatedGroupedLedgers = useMemo(() => {
    const startIndex = (groupedLedgerPage - 1) * ledgerItemsPerPage;
    return groupedLedgers.slice(startIndex, startIndex + ledgerItemsPerPage);
  }, [groupedLedgers, groupedLedgerPage, ledgerItemsPerPage]);

  // PhonePe Transaction History Extraction
  const transactionHistory = useMemo(() => {
    const txs = [];
    ledgersList.forEach(ledger => {
      const receiptsList = Array.isArray(ledger.receipts) ? ledger.receipts : [];
      if (receiptsList.length > 0) {
        receiptsList.forEach(receipt => {
          txs.push({
            ...receipt,
            categoryName: ledger.category?.name || 'Fee Collection',
            dueDate: ledger.dueDate,
            ledger
          });
        });
      }
    });
    // Sort latest transactions first
    return txs.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [ledgersList]);

  const ledgerTotalPages = Math.ceil(transactionHistory.length / ledgerItemsPerPage);
  const paginatedTransactionHistory = useMemo(() => {
    const startIndex = (ledgerPage - 1) * ledgerItemsPerPage;
    return transactionHistory.slice(startIndex, startIndex + ledgerItemsPerPage);
  }, [transactionHistory, ledgerPage, ledgerItemsPerPage]);

  const totalBilledAll = ledgersList.reduce((acc, l) => acc + Number(l.amountDue ?? 0), 0);
  const totalDueAll = ledgersList.reduce((acc, l) => acc + Math.max(0, Number(l.amountDue ?? 0) - Number(l.amountPaid ?? 0)), 0);
  const totalPaidAll = ledgersList.reduce((acc, l) => acc + Number(l.amountPaid ?? 0), 0);

  const feeStructureChips = DEFAULT_FEE_TYPES.map(type => {
    const saved = feeCategories.find(c => c.name.toLowerCase() === type.toLowerCase());
    return { name: type, saved: !!saved, data: saved };
  });

  const studentClass = selectedStudent ? classes.find(c => c.id === selectedStudent.classId) : null;
  const studentGradient = selectedStudent ? GRADIENT_PALETTE[selectedStudent.firstName.charCodeAt(0) % GRADIENT_PALETTE.length] : '';

  const singleRemaining = selectedLedger ? (selectedLedger.amountDue ?? 0) - (selectedLedger.amountPaid ?? 0) : 0;
  const singleAmountAfterPayment = singleRemaining - (parseFloat(paymentForm.amountPaying) || 0);

  // Multi-Collect calculations
  const totalCollectingAmount = useMemo(() => {
    return Object.values(collectPayments).reduce((a, b) => a + (parseFloat(b) || 0), 0);
  }, [collectPayments]);

  const totalUnpaidRemaining = useMemo(() => {
    let sum = 0;
    ledgersList.forEach(l => {
      if (l.status !== 'Paid') {
        const remaining = (l.amountDue ?? 0) - (l.amountPaid ?? 0);
        const paying = parseFloat(collectPayments[l.id]) || 0;
        sum += Math.max(0, remaining - paying);
      }
    });
    return sum;
  }, [ledgersList, collectPayments]);

  return (
    <div className="space-y-8 relative px-2 lg:px-8 pb-20">
      {/* Printable Receipt Overlay Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-receipt-modal, #print-receipt-modal *,
          #printable-summary-table, #printable-summary-table * {
            visibility: visible !important;
          }
          #print-receipt-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          #printable-summary-table {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @keyframes bubbleFloat {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes bubbleFloatDelayed {
          0% { transform: translateY(0px) scale(1.05); }
          50% { transform: translateY(8px) scale(0.95); }
          100% { transform: translateY(0px) scale(1.05); }
        }
        .bubble-float {
          animation: bubbleFloat 4s ease-in-out infinite;
        }
        .bubble-float-delayed {
          animation: bubbleFloatDelayed 5s ease-in-out infinite;
        }
        /* Hide number input spinners */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Header */}
      <div className="no-print">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <CreditCard className="w-10 h-10 text-emerald-500" />
          Fees &amp; Finance
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Configure fee schedules, manage student ledgers, collect payments, and track school-wide financial transactions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 pt-4 px-1 custom-scrollbar w-full snap-x">
        {[
          { id: 'Overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)]', border: 'border-blue-500', text: 'text-blue-500', iconBg: 'bg-blue-500/10' },
          { id: 'Fee Structures', label: 'Fee Structures', icon: Layers, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]', border: 'border-emerald-500', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
          { id: 'Student Ledgers', label: 'Student Ledgers', icon: Wallet, color: 'from-purple-500 to-indigo-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)]', border: 'border-purple-500', text: 'text-purple-500', iconBg: 'bg-purple-500/10' },
          { id: 'Fees Directory', label: 'Fees Directory', icon: BookOpen, color: 'from-orange-500 to-amber-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)]', border: 'border-orange-500', text: 'text-orange-500', iconBg: 'bg-orange-500/10' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 snap-center border hover:scale-[1.02] min-w-max relative overflow-hidden group ${
              activeTab === tab.id 
                ? `bg-gradient-to-r ${tab.color} text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] border-transparent z-10 scale-[1.02]` 
                : `bg-card ${tab.text} ${tab.border} ${tab.shadow} hover:bg-black/5 dark:hover:bg-white/5`
            }`}
          >
            {activeTab === tab.id && (
              <>
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-50 pointer-events-none mix-blend-overlay"></div>
                <div className={`absolute inset-0 rounded-2xl border-2 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.4)] pointer-events-none`}></div>
              </>
            )}
            <div className={`p-2 rounded-xl relative z-10 ${activeTab === tab.id ? 'bg-white/20' : tab.iconBg}`}>
              <tab.icon className="w-4 h-4" />
            </div>
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center no-print">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div key={activeTab} className="no-print animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* ── OVERVIEW ───────────────────────────────────────────────── */}
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                {/* 1. Academic Timeline Filters */}
                <div className="bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-3">
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-500" /> Academic Timeline Filters
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                        Select a month in the academic session timeline or set custom dates to filter analytics
                      </p>
                    </div>
                    {activeSession && (
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        Active Session: {activeSession.name}
                      </span>
                    )}
                  </div>

                  {/* Months Horizontal Timeline */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Month Slot</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 pr-1 custom-scrollbar scroll-smooth">
                      {/* Full Session Option */}
                      <button
                        onClick={() => {
                          setSelectedTimelineMonth('Full Session');
                          if (activeSession) {
                            setFilterStartDate(new Date(activeSession.startDate).toISOString().split('T')[0]);
                            setFilterEndDate(new Date(activeSession.endDate).toISOString().split('T')[0]);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 border-2 transition-all flex items-center gap-1.5 ${
                          selectedTimelineMonth === 'Full Session'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10'
                            : 'border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground'
                        }`}
                      >
                        📅 Full Academic Session
                      </button>

                      {/* Dynamic Month Timeline list */}
                      {sessionMonths.map(month => {
                        const isSelected = selectedTimelineMonth === month.label;
                        return (
                          <button
                            key={month.label}
                            onClick={() => {
                              setSelectedTimelineMonth(month.label);
                              setFilterStartDate(month.startDateStr);
                              setFilterEndDate(month.endDateStr);
                            }}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 border-2 transition-all ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10'
                                : 'border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground'
                            }`}
                          >
                            {month.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual Date Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Start Date</label>
                      <input
                        type="date"
                        value={filterStartDate}
                        min={activeSession ? new Date(activeSession.startDate).toISOString().split('T')[0] : undefined}
                        max={activeSession ? new Date(activeSession.endDate).toISOString().split('T')[0] : undefined}
                        onChange={e => {
                          setFilterStartDate(e.target.value);
                          setSelectedTimelineMonth('Custom Range');
                        }}
                        className="w-full bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl outline-none border border-black/5 dark:border-white/10 font-bold text-xs text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">End Date</label>
                      <input
                        type="date"
                        value={filterEndDate}
                        min={activeSession ? new Date(activeSession.startDate).toISOString().split('T')[0] : undefined}
                        max={activeSession ? new Date(activeSession.endDate).toISOString().split('T')[0] : undefined}
                        onChange={e => {
                          setFilterEndDate(e.target.value);
                          setSelectedTimelineMonth('Custom Range');
                        }}
                        className="w-full bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl outline-none border border-black/5 dark:border-white/10 font-bold text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { gradient: 'from-blue-500 to-indigo-600', icon: CreditCard, label: 'Total Invoiced (Fees Demanded)', value: `₹${dashboardMetrics.invoiced.toLocaleString()}`, sub: 'Sum of all issued fee bills' },
                    { gradient: 'from-emerald-500 to-teal-600', icon: IndianRupee, label: 'Total Collected (Revenue)', value: `₹${dashboardMetrics.collected.toLocaleString()}`, sub: 'Successful payment receipts' },
                    { gradient: 'from-rose-500 to-pink-600', icon: AlertCircle, label: 'Pending Dues (Loss/Outstanding)', value: `₹${dashboardMetrics.pending.toLocaleString()}`, sub: 'Dues remaining from students' },
                    { gradient: 'from-violet-500 to-purple-600', icon: TrendingUp, label: 'Collection Rate', value: `${dashboardMetrics.rate}%`, sub: 'Fees collection efficiency' },
                  ].map((card, i) => (
                    <div key={i} className={`bg-gradient-to-br ${card.gradient} p-6 rounded-3xl text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                      <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-full group-hover:scale-110 transition-transform" />
                      <card.icon className="w-8 h-8 mb-4 opacity-80" />
                      <p className="font-bold opacity-80 text-xs mb-1 uppercase tracking-wider">{card.label}</p>
                      <h3 className="text-3xl font-black">{card.value}</h3>
                      <p className="text-[10px] opacity-70 mt-2">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* 3. Recharts Graphics Section */}
                {allLedgersList.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Timeline Chart */}
                    <div className="bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow space-y-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">Monthly Billing & Collection Trends</h4>
                        <p className="text-[11px] text-muted-foreground font-medium">Monthly collection cashflow vs invoiced demand</p>
                      </div>
                      <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-[0.05]" />
                            <XAxis dataKey="monthLabel" tickLine={false} tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 10, fontWeight: 'bold' }} />
                            <YAxis tickLine={false} tickFormatter={v => `₹${v}`} tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 10, fontWeight: 'bold' }} />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                            <Area name="Collected Amount" type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                            <Area name="Pending Dues" type="monotone" dataKey="pending" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorPending)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Class Wise Stats Chart */}
                    <div className="bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow space-y-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">Fees Collection vs Dues by Class</h4>
                        <p className="text-[11px] text-muted-foreground font-medium">Pending outstanding dues compared against collections</p>
                      </div>
                      <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={classWiseStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-[0.05]" />
                            <XAxis dataKey="name" tickLine={false} tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 10, fontWeight: 'bold' }} />
                            <YAxis tickLine={false} tickFormatter={v => `₹${v}`} tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 10, fontWeight: 'bold' }} />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                            <Bar name="Collected" dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar name="Dues Pending" dataKey="pending" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-card border border-black/5 dark:border-white/5 rounded-3xl">
                    <p className="font-black text-lg text-muted-foreground">No ledgers parsed. Generating bills will populate dashboard graphs.</p>
                  </div>
                )}

                {/* 4. Interactive Class & Section Breakdown */}
                <div className="bg-card p-6 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow space-y-4">
                  <div className="border-b border-black/5 dark:border-white/5 pb-3">
                    <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap className="w-5 h-5 text-emerald-500" /> Class & Section Financial Breakdowns
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      Click on any class card to expand section-wise details and student strengths
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {paginatedClassWiseStats.map(cStats => {
                      const hasStudents = cStats.studentCount > 0;
                      const isExpanded = expandedClassId === cStats.id;
                      const collectionRate = cStats.invoiced > 0 ? Math.round((cStats.collected / cStats.invoiced) * 100) : 0;
                      
                      return (
                        <div key={cStats.id} className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
                          {/* Class Header Row */}
                          <div 
                            onClick={() => hasStudents && setExpandedClassId(isExpanded ? null : cStats.id)}
                            className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all ${
                              isExpanded ? 'bg-black/5 dark:bg-white/5 border-b border-black/5' : ''
                            }`}
                          >
                            {/* Class Name & Strength */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <GraduationCap className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-foreground">{cStats.name}</h4>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mt-0.5">
                                  {cStats.studentCount} Student{cStats.studentCount !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>

                            {/* Financial Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center sm:text-right flex-1 max-w-lg">
                              <div className="text-left sm:text-right">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">Invoiced</span>
                                <span className="text-xs font-black text-foreground">₹{cStats.invoiced.toLocaleString()}</span>
                              </div>
                              <div className="text-left sm:text-right">
                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Collected</span>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">₹{cStats.collected.toLocaleString()}</span>
                              </div>
                              <div className="text-left sm:text-right">
                                <span className={`text-[9px] font-black uppercase tracking-wider block ${cStats.pending > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>Pending</span>
                                <span className={`text-xs font-black ${cStats.pending > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>₹{cStats.pending.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Progress & Expansion Indicator */}
                            <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                              <div className="flex items-center gap-1.5">
                                <div className="w-16 bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, collectionRate)}%` }} />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{collectionRate}%</span>
                              </div>
                              {hasStudents ? (
                                isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <span className="text-[8px] font-black uppercase text-muted-foreground bg-black/5 px-2 py-0.5 rounded border border-black/5">No Students</span>
                              )}
                            </div>
                          </div>

                          {/* Expanded Section breakdown list */}
                          {isExpanded && (
                            <div className="bg-card/50 p-4 border-t border-black/5 dark:border-white/10 space-y-3">
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Section Breakdown</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.values(cStats.sections).map(sec => {
                                  const secRate = sec.invoiced > 0 ? Math.round((sec.collected / sec.invoiced) * 100) : 0;
                                  return (
                                    <div key={sec.id} className="bg-black/5 dark:bg-white/5 p-3.5 rounded-xl border border-black/5 dark:border-white/10 flex flex-col justify-between gap-2.5">
                                      <div className="flex justify-between items-center">
                                        <span className="font-extrabold text-xs text-foreground">Section {sec.name}</span>
                                        <span className="text-[9px] font-black text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                          {sec.studentCount} Student{sec.studentCount !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-muted-foreground">
                                        <div className="bg-card p-1.5 rounded-lg border border-black/5 dark:border-white/10">
                                          <p className="text-[8px] font-black uppercase opacity-75 mb-0.5">Invoiced</p>
                                          <p className="font-black text-foreground">₹{sec.invoiced.toLocaleString()}</p>
                                        </div>
                                        
                                        <div className="bg-card p-1.5 rounded-lg border border-black/5 dark:border-white/10">
                                          <p className="text-[8px] font-black uppercase opacity-75 mb-0.5">Collected</p>
                                          <p className="font-black text-emerald-600 dark:text-emerald-400">₹{sec.collected.toLocaleString()}</p>
                                        </div>
                                        
                                        <div className="bg-card p-1.5 rounded-lg border border-black/5 dark:border-white/10">
                                          <p className="text-[8px] font-black uppercase opacity-75 mb-0.5">Pending</p>
                                          <p className={`font-black ${sec.pending > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>₹{sec.pending.toLocaleString()}</p>
                                        </div>
                                      </div>

                                      {/* Section Collection Rate */}
                                      <div className="flex items-center gap-2 pt-1">
                                        <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, secRate)}%` }} />
                                        </div>
                                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 shrink-0">{secRate}% Collected</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Overview Pagination Controls */}
                  {overviewTotalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                      <span className="text-xs text-muted-foreground font-bold">
                        Showing {(overviewPage - 1) * overviewItemsPerPage + 1} - {Math.min(overviewPage * overviewItemsPerPage, classWiseStats.length)} of {classWiseStats.length} classes
                      </span>
                      <PaginationControls currentPage={overviewPage} totalPages={overviewTotalPages} onPageChange={setOverviewPage} />
                    </div>
                  )}

                </div>

                {/* ─── SCHOOL FINANCIAL LEDGER (merged into Overview) ─── */}
                {(() => {
                  const finAvailableYears = (() => {
                    const years = new Set(finTxs.map(t => new Date(t.date).getFullYear()));
                    years.add(new Date().getFullYear());
                    return [...years].sort((a, b) => b - a);
                  })();

                  const finMetrics = (() => {
                    const income = finTxs.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
                    const expense = finTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
                    const feeIncome = finTxs.filter(t => t.source === 'Fee Collection').reduce((s, t) => s + t.amount, 0);
                    const payrollExpense = finTxs.filter(t => t.source === 'Staff Payroll').reduce((s, t) => s + t.amount, 0);
                    return { income, expense, netBalance: income - expense, feeIncome, payrollExpense };
                  })();

                  const finMonthlyTrend = LEDGER_MONTHS.map((label, idx) => {
                    let Inc = 0, Exp = 0;
                    finTxs.forEach(t => {
                      const d = new Date(t.date);
                      if (d.getFullYear() === finFilterYear && d.getMonth() === idx) {
                        if (t.type === 'Income') Inc += t.amount;
                        else Exp += t.amount;
                      }
                    });
                    return { name: label, Income: Inc, Expense: Exp };
                  });

                  const sourcePie = (() => {
                    const map = {};
                    finTxs.forEach(t => { map[t.source] = (map[t.source] || 0) + t.amount; });
                    return Object.entries(map).map(([name, value]) => ({ name, value }));
                  })();

                  const filteredFinTxs = finTxs.filter(t => {
                    const q = finSearch.toLowerCase();
                    const matchSearch = !finSearch || t.description?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q) || t.referenceNo?.toLowerCase().includes(q);
                    const matchType = finFilterType === 'All' || t.type === finFilterType;
                    const matchSource = finFilterSource === 'All' || t.source === finFilterSource;
                    const d = new Date(t.date);
                    const matchMonth = finFilterMonth === 'All' || d.getMonth() === parseInt(finFilterMonth);
                    const matchYear = d.getFullYear() === finFilterYear;
                    return matchSearch && matchType && matchSource && matchMonth && matchYear;
                  });

                  const finIncome = filteredFinTxs.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
                  const finExpense = filteredFinTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
                  const fmtAmt = (v = 0) => `₹${Number(v).toLocaleString('en-IN')}`;
                  const getBadge = (type) => type === 'Income' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20';
                  const getSrcColor = (src) => ({ 'Fee Collection': '#10b981', 'Staff Payroll': '#f59e0b', 'Manual': '#6366f1' }[src] || '#94a3b8');

                  const finTotalPages = Math.ceil(filteredFinTxs.length / ledgerItemsPerPage);
                  const paginatedFinTxs = filteredFinTxs.slice((consolidatedLedgerPage - 1) * ledgerItemsPerPage, consolidatedLedgerPage * ledgerItemsPerPage);

                  const handleAddFinTx = async (e) => {
                    e.preventDefault();
                    setFinSubmitting(true);
                    try {
                      const res = await fetch(`${apiBase}/finance/transactions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...finForm, amount: parseFloat(finForm.amount) })
                      });
                      if (!res.ok) throw new Error('Failed');
                      setLedgerModalOpen(false);
                      setFinForm({ type: 'Income', category: '', amount: '', date: todayDateStr(), description: '', referenceNo: '' });
                      fetchFinTxs(true);
                    } catch (err) { alert('Error adding transaction.'); }
                    finally { setFinSubmitting(false); }
                  };

                  const handleDelFinTx = async (id) => {
                    if (!window.confirm('Delete this manual entry?')) return;
                    try {
                      await fetch(`${apiBase}/finance/transactions/${id}`, { method: 'DELETE' });
                      fetchFinTxs(true);
                    } catch (err) { alert('Error deleting.'); }
                  };

                  return (
                    <>
                      {/* Divider */}
                      <div className="border-t-2 border-dashed border-black/5 dark:border-white/5 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-green-500" />
                            <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground">School Financial Ledger</h3>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => fetchFinTxs(true)} disabled={finRefreshing}
                              className="p-2 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 transition-all text-muted-foreground hover:text-foreground" title="Refresh">
                              <RefreshCw className={`w-4 h-4 ${finRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button onClick={() => setLedgerModalOpen(true)}
                              className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 hover:scale-105 transition-all premium-shadow text-xs">
                              <Plus className="w-3.5 h-3.5" /> Add Manual Entry
                            </button>
                          </div>
                        </div>
                      </div>

                      {finLoading ? (
                        <div className="py-12 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          {/* Ledger Summary Cards */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                              { label: 'Total Income', value: fmtAmt(finMetrics.income), icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: `Fees: ${fmtAmt(finMetrics.feeIncome)}` },
                              { label: 'Total Expenses', value: fmtAmt(finMetrics.expense), icon: <TrendingDown className="w-5 h-5" />, color: 'text-rose-500', bg: 'bg-rose-500/10', sub: `Payroll: ${fmtAmt(finMetrics.payrollExpense)}` },
                              { label: 'Net Balance', value: fmtAmt(finMetrics.netBalance), icon: <CircleDollarSign className="w-5 h-5" />, color: finMetrics.netBalance >= 0 ? 'text-indigo-500' : 'text-amber-500', bg: finMetrics.netBalance >= 0 ? 'bg-indigo-500/10' : 'bg-amber-500/10', sub: finMetrics.netBalance >= 0 ? 'School is in Surplus' : 'School is in Deficit' },
                              { label: 'Transactions', value: finTxs.length, icon: <Layers className="w-5 h-5" />, color: 'text-sky-500', bg: 'bg-sky-500/10', sub: `${finTxs.filter(t => t.type === 'Income').length} income · ${finTxs.filter(t => t.type === 'Expense').length} expense` },
                            ].map((card, i) => (
                              <div key={i} className="glass-panel p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] mb-1">{card.label}</p>
                                    <h3 className="text-xl font-extrabold text-foreground">{card.value}</h3>
                                  </div>
                                  <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>{card.icon}</div>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-3 font-medium">{card.sub}</p>
                              </div>
                            ))}
                          </div>

                          {/* Ledger Charts */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow flex flex-col">
                              <div className="flex justify-between items-center mb-4">
                                <div>
                                  <h4 className="font-extrabold text-sm text-foreground">Monthly Income vs Expenses</h4>
                                  <p className="text-[11px] text-muted-foreground font-medium">School-wide financial cashflow trend</p>
                                </div>
                                <select value={finFilterYear} onChange={e => setFinFilterYear(parseInt(e.target.value))}
                                  className="bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer">
                                  {finAvailableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </div>
                              <div className="flex-1 min-h-[200px]">
                                <ResponsiveContainer width="100%" height={200}>
                                  <AreaChart data={finMonthlyTrend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id="fIncG2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                      </linearGradient>
                                      <linearGradient id="fExpG2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-[0.05]" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 10 }} tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`} width={50} />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} fill="url(#fIncG2)" dot={false} />
                                    <Area type="monotone" dataKey="Expense" stroke="#f43f5e" strokeWidth={2} fill="url(#fExpG2)" dot={false} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="flex gap-6 mt-2">
                                {[['#10b981', 'Income'], ['#f43f5e', 'Expenses']].map(([c, l]) => (
                                  <div key={l} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                    <div className="w-3 h-1 rounded-full" style={{ background: c }} />{l}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow flex flex-col">
                              <h4 className="font-extrabold text-sm text-foreground mb-1">Volume by Source</h4>
                              <p className="text-[11px] text-muted-foreground mb-4 font-medium">Total transaction share</p>
                              {sourcePie.length > 0 ? (
                                <>
                                  <ResponsiveContainer width="100%" height={140}>
                                    <PieChart>
                                      <Pie data={sourcePie} innerRadius={45} outerRadius={62} paddingAngle={4} dataKey="value" stroke="none">
                                        {sourcePie.map((_, idx) => <Cell key={idx} fill={LEDGER_PIE_COLORS[idx % LEDGER_PIE_COLORS.length]} />)}
                                      </Pie>
                                      <Tooltip content={<CustomChartTooltip />} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                  <div className="space-y-2 mt-2">
                                    {sourcePie.map((item, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: LEDGER_PIE_COLORS[idx % LEDGER_PIE_COLORS.length] }} />
                                          <span className="text-muted-foreground font-semibold">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-foreground">{fmtAmt(item.value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <p className="text-muted-foreground text-sm text-center py-8">No transactions yet</p>
                              )}
                            </div>
                          </div>

                          {/* Transaction Ledger Table */}
                          <div className="bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                              <div>
                                <h4 className="font-extrabold text-sm text-foreground">Consolidated Transaction Ledger</h4>
                                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">All income & expenses — fee receipts, salary payouts, manual entries</p>
                              </div>
                              <span className="text-xs bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl font-bold text-muted-foreground">{filteredFinTxs.length} entries</span>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-3">
                              <div className="relative flex-1 min-w-[160px]">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input type="text" placeholder="Search..." value={finSearch} onChange={e => setFinSearch(e.target.value)}
                                  className="w-full bg-black/5 dark:bg-white/5 rounded-2xl pl-9 pr-3 py-2.5 outline-none text-sm text-foreground font-medium border border-black/5 dark:border-white/10 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10" />
                              </div>
                              {[
                                { val: finFilterType, set: setFinFilterType, opts: [['All','All Types'],['Income','Income'],['Expense','Expense']] },
                                { val: finFilterSource, set: setFinFilterSource, opts: [['All','All Sources'],['Fee Collection','Fee Collection'],['Staff Payroll','Staff Payroll'],['Manual','Manual']] },
                                { val: finFilterMonth, set: setFinFilterMonth, opts: [['All','All Months'],...LEDGER_MONTHS.map((m, i) => [String(i), m])] },
                              ].map((f, i) => (
                                <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
                                  className="bg-black/5 dark:bg-white/5 rounded-2xl px-3 py-2.5 text-sm font-bold text-foreground outline-none cursor-pointer border border-black/5 dark:border-white/10">
                                  {f.opts.map(([v, l]) => <option key={v} value={v} className="bg-card text-foreground">{l}</option>)}
                                </select>
                              ))}
                              <select value={finFilterYear} onChange={e => setFinFilterYear(parseInt(e.target.value))}
                                className="bg-black/5 dark:bg-white/5 rounded-2xl px-3 py-2.5 text-sm font-bold text-foreground outline-none cursor-pointer border border-black/5 dark:border-white/10">
                                {finAvailableYears.map(y => <option key={y} value={y} className="bg-card text-foreground">{y}</option>)}
                              </select>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    <th className="py-3 px-3">Date</th>
                                    <th className="py-3 px-3">Description</th>
                                    <th className="py-3 px-3">Category</th>
                                    <th className="py-3 px-3 text-center">Source</th>
                                    <th className="py-3 px-3 text-center">Type</th>
                                    <th className="py-3 px-3 text-right">Amount</th>
                                    <th className="py-3 px-3 text-center">Ref</th>
                                    <th className="py-3 px-3 text-center">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs font-semibold">
                                  {paginatedFinTxs.map((tx, idx) => (
                                    <tr key={`${tx.id}-${idx}`} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      </td>
                                      <td className="py-3 px-3 max-w-[200px]">
                                        <p className="font-bold text-foreground truncate" title={tx.description}>{tx.description || '—'}</p>
                                      </td>
                                      <td className="py-3 px-3 text-muted-foreground">{tx.category}</td>
                                      <td className="py-3 px-3 text-center">
                                        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
                                          style={{ background: getSrcColor(tx.source) + '18', color: getSrcColor(tx.source) }}>
                                          {tx.source}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3 text-center">
                                        <span className={`inline-flex items-center gap-0.5 border text-[10px] font-bold px-2 py-0.5 rounded-full ${getBadge(tx.type)}`}>
                                          {tx.type === 'Income' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                                          {tx.type}
                                        </span>
                                      </td>
                                      <td className={`py-3 px-3 text-right font-mono font-black ${tx.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {tx.type === 'Income' ? '+' : '-'}{fmtAmt(tx.amount)}
                                      </td>
                                      <td className="py-3 px-3 text-center text-muted-foreground font-mono">{tx.referenceNo || '—'}</td>
                                      <td className="py-3 px-3 text-center">
                                        {tx.source === 'Manual'
                                          ? <button onClick={() => handleDelFinTx(tx.id)} className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 className="w-3 h-3" /></button>
                                          : <span className="text-[9px] text-muted-foreground/40">Auto</span>}
                                      </td>
                                    </tr>
                                  ))}
                                  {filteredFinTxs.length === 0 && (
                                    <tr><td colSpan={8} className="py-10 text-center text-muted-foreground font-bold">No transactions match the current filters.</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Consolidated Ledger Pagination Controls */}
                            {finTotalPages > 1 && (
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                                <span className="text-xs text-muted-foreground font-bold">
                                  Showing {(consolidatedLedgerPage - 1) * ledgerItemsPerPage + 1} - {Math.min(consolidatedLedgerPage * ledgerItemsPerPage, filteredFinTxs.length)} of {filteredFinTxs.length} entries
                                </span>
                                <PaginationControls currentPage={consolidatedLedgerPage} totalPages={finTotalPages} onPageChange={setConsolidatedLedgerPage} />
                              </div>
                            )}

                            {filteredFinTxs.length > 0 && (
                              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-6 text-sm font-bold">
                                <span><span className="text-muted-foreground font-medium mr-1">Filtered Income:</span><span className="text-emerald-500">{fmtAmt(finIncome)}</span></span>
                                <span><span className="text-muted-foreground font-medium mr-1">Filtered Expenses:</span><span className="text-rose-500">{fmtAmt(finExpense)}</span></span>
                                <span><span className="text-muted-foreground font-medium mr-1">Net:</span><span className={finIncome - finExpense >= 0 ? 'text-indigo-500' : 'text-amber-500'}>{fmtAmt(finIncome - finExpense)}</span></span>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Add Manual Transaction Modal */}
                      <AnimatePresence>
                        {isLedgerModalOpen && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                              className="bg-card w-full max-w-lg rounded-[2.5rem] premium-shadow border border-white/10">
                              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                                <div>
                                  <h3 className="text-xl font-bold text-foreground">Add Manual Transaction</h3>
                                  <p className="text-xs text-muted-foreground mt-1">Record a manual income or expense entry.</p>
                                </div>
                                <button onClick={() => setLedgerModalOpen(false)} className="p-2 rounded-full hover:bg-black/10 transition-colors text-muted-foreground"><X className="w-5 h-5" /></button>
                              </div>
                              <form onSubmit={handleAddFinTx} className="p-6 space-y-4 text-left">
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Transaction Type *</label>
                                  <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                                    {['Income', 'Expense'].map(t => (
                                      <button key={t} type="button" onClick={() => setFinForm({ ...finForm, type: t })}
                                        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${finForm.type === t ? (t === 'Income' ? 'bg-emerald-500 text-white shadow' : 'bg-rose-500 text-white shadow') : 'text-muted-foreground'}`}>
                                        {t}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Category *</label>
                                    <input required type="text" placeholder="e.g. Rent, Donation..." value={finForm.category} onChange={e => setFinForm({ ...finForm, category: e.target.value })}
                                      className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-500/20 border border-transparent text-foreground font-medium text-sm" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Amount (₹) *</label>
                                    <input required type="number" min="1" step="0.01" placeholder="e.g. 10000" value={finForm.amount} onChange={e => setFinForm({ ...finForm, amount: e.target.value })}
                                      className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-500/20 border border-transparent text-foreground font-bold font-mono text-sm" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Date *</label>
                                    <input required type="date" value={finForm.date} onChange={e => setFinForm({ ...finForm, date: e.target.value })}
                                      className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none border border-transparent text-foreground font-medium text-sm" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Ref No.</label>
                                    <input type="text" placeholder="Optional" value={finForm.referenceNo} onChange={e => setFinForm({ ...finForm, referenceNo: e.target.value })}
                                      className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none border border-transparent text-foreground font-medium text-sm" />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</label>
                                  <textarea rows={2} placeholder="Brief description..." value={finForm.description} onChange={e => setFinForm({ ...finForm, description: e.target.value })}
                                    className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none border border-transparent text-foreground font-medium text-sm resize-none" />
                                </div>
                                <div className="pt-4 border-t border-black/5 flex justify-end gap-3">
                                  <button type="button" onClick={() => setLedgerModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-black/5 transition-colors">Cancel</button>
                                  <button type="submit" disabled={finSubmitting}
                                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold flex items-center gap-2 premium-shadow hover:scale-105 transition-all disabled:opacity-50">
                                    {finSubmitting ? 'Saving...' : 'Add Entry'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })()}
              </div>
            )}



            {/* ── FEE STRUCTURES ─────────────────────────────────────────── */}
            {activeTab === 'Fee Structures' && (
              <div className="space-y-8">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">Class-Wise structures</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      Configure different fees (Tuition, Admission) per class. Common fees like Hostel or Transport will show up across all classes. Click **Add Fee Item** below to define a new fee, or hover/tap any card below to **Edit** or **Delete** existing ones.
                    </p>
                  </div>
                </div>

                {/* Class filter config & Setup button */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-card p-6 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-wider block">Class Fee Structure Viewer</label>
                    <select value={selectedConfigClassId} onChange={e => setSelectedConfigClassId(e.target.value)}
                      className="bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm min-w-[200px] text-foreground">
                      {classes.map(c => <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>)}
                    </select>
                  </div>
                  
                  <button onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', amount: '', frequency: 'Monthly', classIds: selectedConfigClassId || '', isCustom: false, isCommon: false });
                    setCategoryModalOpen(true);
                  }}
                  disabled={!selectedConfigClassId}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Plus className="w-4 h-4" /> Add Fee Item
                  </button>
                </div>

                {/* Categories display for the selected class */}
                {selectedConfigClassId && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-lg font-black text-foreground uppercase tracking-wider">
                        Fee Structure for {classes.find(c => c.id === selectedConfigClassId)?.name}
                      </h3>
                      {categoriesForConfigClass.length > 0 && (
                        <span className="text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-black/5">
                          Total: {categoriesForConfigClass.length} items
                        </span>
                      )}
                    </div>
                    
                    {categoriesForConfigClass.length > 0 ? (
                      <div className="space-y-6">
                        {/* Search, Sort, and Filter Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow">
                          {/* Search bar */}
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Search fee by name..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-sm text-foreground"
                            />
                          </div>

                          {/* Filter by Frequency */}
                          <div className="relative">
                            <select
                              value={filterFrequency}
                              onChange={e => setFilterFrequency(e.target.value)}
                              className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm cursor-pointer text-foreground"
                            >
                              <option value="All" className="bg-card text-foreground">All Frequencies</option>
                              {BILLING_MODES.map(mode => (
                                <option key={mode.key} value={mode.key} className="bg-card text-foreground">{mode.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Filter by Scope */}
                          <div className="relative">
                            <select
                              value={filterScope}
                              onChange={e => setFilterScope(e.target.value)}
                              className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm cursor-pointer text-foreground"
                            >
                              <option value="All" className="bg-card text-foreground">All Scopes</option>
                              <option value="Specific" className="bg-card text-foreground">Class Specific</option>
                              <option value="Common" className="bg-card text-foreground">Common Fees</option>
                            </select>
                          </div>

                          {/* Sort By */}
                          <div className="relative">
                            <select
                              value={sortBy}
                              onChange={e => setSortBy(e.target.value)}
                              className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm cursor-pointer text-foreground"
                            >
                              <option value="name-asc" className="bg-card text-foreground">Name (A to Z)</option>
                              <option value="name-desc" className="bg-card text-foreground">Name (Z to A)</option>
                              <option value="amount-asc" className="bg-card text-foreground">Amount (Low to High)</option>
                              <option value="amount-desc" className="bg-card text-foreground">Amount (High to Low)</option>
                            </select>
                          </div>
                        </div>

                        {filteredAndSortedCategories.length > 0 ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {paginatedCategories.map((cat, idx) => {
                                const isCommon = !cat.classIds;
                                
                                // Determine applicable classes names
                                let applicableClassNames = "Common (All Classes)";
                                let sectionNamesText = "All Sections";
                                if (!isCommon) {
                                  try {
                                    const parsed = JSON.parse(cat.classIds);
                                    if (Array.isArray(parsed)) {
                                      applicableClassNames = parsed.map(cid => classes.find(c => c.id === cid)?.name).filter(Boolean).join(', ');
                                      
                                      // Get all section names
                                      const secNames = [];
                                      parsed.forEach(cid => {
                                        const cls = classes.find(c => c.id === cid);
                                        if (cls && cls.sections) {
                                          cls.sections.forEach(s => secNames.push(s.name));
                                        }
                                      });
                                      // Remove duplicates
                                      const uniqueSections = [...new Set(secNames)];
                                      sectionNamesText = uniqueSections.length > 0 ? uniqueSections.join(', ') : "No Sections";
                                    }
                                  } catch (e) {}
                                } else {
                                  // Common fee applies to all classes, let's collect all sections from all classes
                                  const secNames = [];
                                  classes.forEach(cls => {
                                    if (cls.sections) {
                                      cls.sections.forEach(s => secNames.push(s.name));
                                    }
                                  });
                                  const uniqueSections = [...new Set(secNames)];
                                  sectionNamesText = uniqueSections.length > 0 ? uniqueSections.join(', ') : "All Sections";
                                }

                                const details = FEE_TYPE_DETAILS[cat.name] || { icon: "💰", color: "from-white/10 to-white/20 text-white" };

                                return (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    key={cat.id}
                                    style={{ backgroundImage: GRADIENTS_INLINE[idx % GRADIENTS_INLINE.length] }}
                                    className="p-6 rounded-[2rem] text-white shadow-xl hover:shadow-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 min-h-[180px] flex flex-col justify-between"
                                  >
                                    {/* Actions: Edit & Delete */}
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-20">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditCategory(cat);
                                        }}
                                        className="p-2 bg-white/20 hover:bg-white/35 backdrop-blur-md rounded-xl border border-white/25 hover:scale-105 transition-all text-white"
                                        title="Edit Item"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCategory(cat);
                                        }}
                                        className="p-2 bg-red-500/25 hover:bg-red-500/40 backdrop-blur-md rounded-xl border border-red-500/35 hover:scale-105 transition-all text-white"
                                        title="Delete Item"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Glowing Background Glows */}
                                    <div className="absolute top-[-10%] left-[-10%] w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute bottom-[-15%] right-[-10%] w-36 h-36 rounded-full bg-black/15 blur-xl pointer-events-none" />

                                    {/* Animation Floating Bubbles */}
                                    <div className="absolute top-[15%] right-[30%] w-8 h-8 rounded-full bg-white/10 backdrop-blur-[2px] pointer-events-none bubble-float border border-white/10 shadow-inner" />
                                    <div className="absolute bottom-[20%] left-[30%] w-6 h-6 rounded-full bg-white/5 backdrop-blur-[1px] pointer-events-none bubble-float-delayed border border-white/5" />
                                    <div className="absolute top-[60%] left-[10%] w-3 h-3 rounded-full bg-white/10 pointer-events-none bubble-float border border-white/15" />

                                    {/* Grid Layout to split Left & Right */}
                                    <div className="grid grid-cols-12 gap-4 relative z-10 w-full items-center">
                                      
                                      {/* LEFT SIDE: Name, Amount, Frequency */}
                                      <div className="col-span-12 md:col-span-7 space-y-4">
                                        <div className="flex items-center gap-3">
                                          {/* Glowing Icon Box */}
                                          <div className="w-10 h-10 bg-white/25 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/30 shrink-0 group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                                            <span className="text-xl">{details.icon}</span>
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="font-extrabold text-base leading-tight tracking-wide drop-shadow-sm truncate">{cat.name}</h4>
                                            <span className="inline-block bg-black/20 text-white/90 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase border border-white/5 mt-1">
                                              {cat.frequency}
                                            </span>
                                          </div>
                                        </div>

                                        <p className="text-3xl font-black tracking-tight flex items-baseline gap-1">
                                          <span className="text-2xl opacity-90">₹</span>
                                          <span>{cat.amount.toLocaleString()}</span>
                                        </p>
                                      </div>

                                      {/* RIGHT SIDE: Class and Sections details (Glassmorphic box) */}
                                      <div className="col-span-12 md:col-span-5 bg-black/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-center space-y-2.5 h-full min-h-[100px]">
                                        <span className="text-[8px] font-black text-white/55 tracking-widest uppercase block mb-0.5">Applies To</span>
                                        
                                        <div className="flex items-center gap-2 text-white text-xs min-w-0">
                                          <GraduationCap className="w-4 h-4 shrink-0 text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.6)]" />
                                          <span className="truncate font-bold">
                                            {applicableClassNames}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-white/90 text-xs min-w-0">
                                          <Users className="w-4 h-4 shrink-0 text-cyan-300 drop-shadow-[0_0_6px_rgba(103,232,249,0.6)]" />
                                          <span className="truncate font-bold text-white/80">
                                            Sec: {sectionNamesText}
                                          </span>
                                        </div>

                                        <div className="pt-1.5 border-t border-white/10 flex justify-between items-center">
                                          <span className="text-[8px] font-black text-white/55 tracking-wider uppercase">Scope</span>
                                          <span className="text-[8px] font-black uppercase bg-white/25 text-white px-2 py-0.5 rounded-md border border-white/10">
                                            {isCommon ? 'Common' : 'Specific'}
                                          </span>
                                        </div>
                                      </div>

                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/5 dark:border-white/5">
                                <span className="text-xs text-muted-foreground font-bold">
                                  Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedCategories.length)} of {filteredAndSortedCategories.length} items
                                </span>
                                
                                <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-black/10 dark:border-white/10 text-muted-foreground font-semibold">
                            No matching fee items found for your active search/filter criteria.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-black/10 dark:border-white/10 text-muted-foreground font-semibold">
                        No fees configured for this class yet. Click "Add Fee Item" to configure.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── STUDENT LEDGERS ─────────────────────────────────────────── */}
            {activeTab === 'Student Ledgers' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ── LEFT PANEL: Search & Planner ── */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-5">

                  {/* STEP 1: Hierarchical Search (Class -> Section -> Student) */}
                  <div className="bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow space-y-4" ref={searchRef}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center">1</div>
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select Student</label>
                    </div>

                    {/* Class selection */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Class *</span>
                      <select value={searchClassId} onChange={e => setSearchClassId(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl outline-none border border-black/5 dark:border-white/10 font-bold text-sm appearance-none cursor-pointer text-foreground">
                        <option value="" className="bg-card text-foreground">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>)}
                      </select>
                    </div>

                    {/* Section selection */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Section *</span>
                      <select value={searchSectionId} onChange={e => setSearchSectionId(e.target.value)}
                        disabled={!searchClassId}
                        className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl outline-none border border-black/5 dark:border-white/10 font-bold text-sm appearance-none cursor-pointer disabled:opacity-50 text-foreground">
                        <option value="" className="bg-card text-foreground">Select Section</option>
                        {sectionsList.map(sec => <option key={sec.id} value={sec.id} className="bg-card text-foreground">{sec.name}</option>)}
                      </select>
                    </div>

                    {/* Student Selection Combobox */}
                    {searchClassId && searchSectionId && (
                      <div className="space-y-1 relative">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Student Name *</span>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" placeholder="Search student name..."
                            value={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : studentSearchQuery}
                            onChange={e => {
                              setStudentSearchQuery(e.target.value);
                              if (selectedStudent) setSelectedStudent(null);
                              setStudentDropdownOpen(true);
                            }}
                            onFocus={() => setStudentDropdownOpen(true)}
                            className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl outline-none font-bold text-sm text-foreground" />
                          {selectedStudent && (
                            <button onClick={() => { setSelectedStudent(null); setSearchStudentId(''); setStudentSearchQuery(''); }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {isStudentDropdownOpen && (
                          <div className="absolute z-20 left-0 right-0 top-[calc(100%+4px)] bg-card border border-black/5 dark:border-white/5 rounded-2xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                            {filteredStudentsForSearch.length > 0 ? filteredStudentsForSearch.map(stu => (
                              <div key={stu.id}
                                onClick={() => {
                                  setSearchStudentId(stu.id);
                                  setStudentDropdownOpen(false);
                                  setStudentSearchQuery('');
                                }}
                                className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${GRADIENT_PALETTE[stu.firstName.charCodeAt(0) % GRADIENT_PALETTE.length]} text-white flex items-center justify-center font-black text-xs shrink-0`}>
                                  {stu.firstName[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-sm truncate">{stu.firstName} {stu.lastName}</p>
                                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Adm No: {stu.admissionNumber}</p>
                                </div>
                              </div>
                            )) : <div className="p-4 text-center text-xs text-muted-foreground">No students found in this section.</div>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Student Info Card */}
                  <AnimatePresence>
                    {selectedStudent && (
                      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className={`bg-gradient-to-br ${studentGradient} p-6 rounded-3xl text-white shadow-xl relative overflow-hidden`}>
                        <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full animate-pulse" />
                        <div className="absolute -left-4 -bottom-6 w-20 h-20 bg-black/10 rounded-full" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-black border-2 border-white/30 shadow-lg">
                            {selectedStudent.firstName[0]}
                          </div>
                          <div>
                            <h3 className="text-xl font-black tracking-tight">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                            <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider">Adm No: {selectedStudent.admissionNumber}</p>
                            <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider">Roll: {selectedStudent.rollNumber || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 relative z-10 mt-2">
                          <div className="bg-white/10 rounded-2xl p-2.5 text-center backdrop-blur-md border border-white/5">
                            <p className="text-[9px] font-bold uppercase opacity-75 mb-0.5">Student Class</p>
                            <p className="font-black text-sm truncate">{studentClass?.name || 'N/A'}</p>
                          </div>
                          <div className="bg-white/10 rounded-2xl p-2.5 text-center backdrop-blur-md border border-white/5">
                            <p className="text-[9px] font-bold uppercase opacity-75 mb-0.5">Total Paid</p>
                            <p className="font-black text-sm">₹{totalPaidAll.toLocaleString()}</p>
                          </div>
                          <div className="bg-white/10 rounded-2xl p-2.5 text-center backdrop-blur-md border border-white/5">
                            <p className="text-[9px] font-bold uppercase opacity-75 mb-0.5">Dues Pending</p>
                            <p className="font-black text-sm text-red-200">₹{totalDueAll.toLocaleString()}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* STEP 2: Billing Frequency — Multi-Select */}
                  <AnimatePresence>
                    {selectedStudent && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center">2</div>
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Billing Frequencies</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium mb-3 ml-8">Select multiple to plan student fee schedule</p>
                        <div className="grid grid-cols-1 gap-2">
                          {BILLING_MODES.map(mode => {
                            const isSelected = billingModes.includes(mode.key);
                            return (
                              <button key={mode.key}
                                onClick={() => toggleBillingMode(mode.key)}
                                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${isSelected ? `${mode.bgColor} ${mode.borderColor} shadow-md` : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                <span className="text-xl">{mode.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-black text-sm ${isSelected ? mode.textColor : ''}`}>{mode.label}</p>
                                  <p className="text-[10px] text-muted-foreground font-medium">{mode.desc}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? `${mode.borderColor} bg-current` : 'border-black/20 dark:border-white/20'}`}
                                  style={isSelected ? { backgroundColor: 'currentColor' } : {}}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* STEP 3: Select Slots Grid */}
                  <AnimatePresence>
                    {selectedStudent && billingModes.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center">3</div>
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select Billing Date Slots</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium ml-8 -mt-2">Customize dates to generate invoices for</p>

                        <div className="space-y-4 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                          {Object.entries(groupedAvailableSlots).map(([freq, slots]) => {
                            const modeCfg = BILLING_MODES.find(m => m.key === freq) || BILLING_MODES[0];
                            return (
                              <div key={freq} className="space-y-2">
                                <p className={`text-xs font-black uppercase ${modeCfg.textColor} flex items-center gap-1.5`}>
                                  <span>{modeCfg.icon}</span> {freq} slots
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {slots.map(s => {
                                    const isSel = selectedSlots.includes(s.id);
                                    return (
                                      <button key={s.id} onClick={() => toggleSlotSelection(s.id)}
                                        className={`p-2.5 rounded-xl border text-xs font-bold text-left truncate flex items-center justify-between transition-all ${
                                          isSel ? `${modeCfg.bgColor} ${modeCfg.borderColor} border-2` : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5'
                                        }`}>
                                        <span className="truncate">{s.label}</span>
                                        <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center ${isSel ? 'bg-current border-transparent' : 'border-muted-foreground/30'}`}
                                          style={isSel ? { backgroundColor: 'currentColor' } : {}}>
                                          {isSel && <Check className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* STEP 4: Select Categories (filtered by student class) */}
                  <AnimatePresence>
                    {selectedStudent && billingModes.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-black flex items-center justify-center">4</div>
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select Fee Categories</p>
                        </div>

                        {categoriesForMode.length > 0 ? (
                          <div className="space-y-2">
                            {categoriesForMode.map(cat => {
                              const isSel = selectedPlanChips.find(c => c.id === cat.id);
                              const catModeCfg = BILLING_MODES.find(m => m.key === cat.frequency) || BILLING_MODES[0];
                              const status = getCategoryBilledStatus(cat);
                              const isPaidAlready = status === 'paid';
                              const hasDue = status === 'due';

                              return (
                                <button key={cat.id}
                                  onClick={() => !isPaidAlready && togglePlanChip(cat)}
                                  disabled={isPaidAlready}
                                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${isPaidAlready
                                    ? 'opacity-50 cursor-not-allowed border-transparent bg-emerald-500/5'
                                    : isSel
                                      ? `${catModeCfg.bgColor} ${catModeCfg.borderColor} shadow-md`
                                      : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 bg-black/5 dark:bg-white/5'
                                    }`}>
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSel ? catModeCfg.bgColor : 'bg-card'}`}>
                                    {isPaidAlready ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <BookOpen className={`w-5 h-5 ${isSel ? catModeCfg.textColor : 'text-muted-foreground'}`} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className={`font-black text-sm ${isSel ? catModeCfg.textColor : ''}`}>{cat.name}</p>
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${catModeCfg.bgColor} ${catModeCfg.textColor}`}>{catModeCfg.icon}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground font-medium">
                                      ₹{cat.amount}
                                      {isPaidAlready && <span className="text-emerald-500 font-bold ml-2">• Paid</span>}
                                      {hasDue && <span className="text-rose-500 font-bold ml-2">• Remaining dues pending</span>}
                                    </p>
                                  </div>
                                  {isSel && !isPaidAlready && <Check className={`w-4 h-4 ${catModeCfg.textColor} shrink-0`} />}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-black/5 dark:bg-white/5 rounded-2xl">
                            <p className="text-sm font-bold text-muted-foreground">No matching categories saved.</p>
                            <button onClick={() => { setActiveTab('Fee Structures'); }}
                              className="text-xs text-emerald-500 font-bold mt-2 hover:underline">
                              → Add class structure categories
                            </button>
                          </div>
                        )}

                        {/* STEP 5 & 6: Auto Date + Summary + Dynamic Inputs */}
                        {selectedPlanChips.length > 0 && planItems.length > 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                            {/* Billing Date (Defaults to Today) */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center">5</div>
                                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Billing date</p>
                                </div>
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                  Auto Today
                                </span>
                              </div>
                              <input type="date" value={planStartDate} onChange={e => setPlanStartDate(e.target.value)}
                                className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 border border-black/5 dark:border-white/10 font-bold text-sm text-foreground" />
                            </div>

                            {/* Summary */}
                            <div className="rounded-2xl p-4 border bg-emerald-500/5 border-emerald-500/20 space-y-2">
                              <p className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Total Billed Preview</p>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between font-bold text-muted-foreground border-b border-black/5 pb-1">
                                  <span>Item Details</span>
                                  <span>Slot Date</span>
                                  <span>Amount</span>
                                </div>
                                {planItems.map(item => (
                                  <div key={item.key} className="flex justify-between py-0.5 text-muted-foreground">
                                    <span className="truncate max-w-[120px] font-semibold">{item.category.name}</span>
                                    <span>{new Date(item.slot.date).toLocaleDateString('default', { month: 'short', year: 'numeric' })}</span>
                                    <span className="font-bold">₹{item.amount}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between pt-2 border-t border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-black">
                                  <span>Grand Total</span>
                                  <span>₹{grandTotal.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Collect Initial Payment Toggler */}
                            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center">6</div>
                                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Collect payment now?</p>
                                </div>
                                <button type="button"
                                  onClick={() => setPlanPayment(p => ({ ...p, hasPayment: !p.hasPayment }))}
                                  className={`relative w-11 h-6 rounded-full transition-colors ${planPayment.hasPayment ? 'bg-emerald-500' : 'bg-black/20 dark:bg-white/20'}`}>
                                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${planPayment.hasPayment ? 'translate-x-5' : ''}`} />
                                </button>
                              </div>

                              {/* Dynamic Inputs for Payments */}
                              {planPayment.hasPayment && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden pt-2">
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Adjust Paid Amounts</p>
                                    <div className="space-y-3">
                                      {planItems.map(item => {
                                        const paidNow = initialPayments[item.key] !== undefined ? initialPayments[item.key] : item.amount;
                                        const remainingDue = Math.max(0, item.amount - paidNow);
                                        const details = FEE_TYPE_DETAILS[item.category.name] || { icon: "💰", color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/20" };

                                        return (
                                          <div key={item.key} className="bg-card p-4 rounded-2xl border border-black/5 dark:border-white/5 premium-shadow hover:shadow-md transition-all flex flex-col gap-3">
                                            {/* Top row: Fee name and icon, and slot badge */}
                                            <div className="flex items-center justify-between gap-2 min-w-0">
                                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-base shrink-0">
                                                  {details.icon}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                  <p className="font-extrabold text-xs text-foreground truncate">{item.category.name}</p>
                                                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider truncate">{item.slot.label}</p>
                                                </div>
                                              </div>
                                              <span 
                                                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                                                className="text-[10px] font-black px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 text-muted-foreground uppercase tracking-wider shrink-0"
                                              >
                                                {`Total:\u00a0₹${(item.amount ?? 0).toLocaleString()}`}
                                              </span>
                                            </div>

                                            {/* Bottom row: Paid Input and Due calculation */}
                                            <div className="flex items-center justify-between gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                                              {/* Paid Input */}
                                              <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Paid Now:</span>
                                                <div className="relative flex items-center bg-card border border-black/10 dark:border-white/10 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 transition-all duration-300 shadow-inner w-36 overflow-hidden h-9">
                                                  {/* Currency Addon prefix */}
                                                  <label
                                                    htmlFor={`paid-${item.key}`}
                                                    onClick={() => {
                                                      const el = document.getElementById(`paid-${item.key}`);
                                                      if (el) el.focus();
                                                    }}
                                                    className="h-full px-2.5 bg-black/5 dark:bg-white/5 border-r border-black/10 dark:border-white/10 flex items-center justify-center text-xs font-black text-muted-foreground select-none shrink-0 cursor-pointer"
                                                  >
                                                    ₹
                                                  </label>
                                                  {/* Input addon suffix */}
                                                  <input
                                                    id={`paid-${item.key}`}
                                                    type="number"
                                                    min={0}
                                                    max={item.amount}
                                                    placeholder="0"
                                                    value={initialPayments[item.key] !== undefined ? initialPayments[item.key] : ''}
                                                    onChange={e => {
                                                      const val = parseFloat(e.target.value) || 0;
                                                      setInitialPayments(prev => ({ ...prev, [item.key]: Math.min(val, item.amount) }));
                                                    }}
                                                    style={{
                                                      border: 'none',
                                                      background: 'transparent',
                                                      boxShadow: 'none',
                                                      padding: '0 8px',
                                                      borderRadius: 0,
                                                      margin: 0,
                                                      outline: 'none',
                                                      width: '100%',
                                                      height: '100%'
                                                    }}
                                                    className="w-full bg-transparent outline-none border-none font-black text-xs text-emerald-600 dark:text-emerald-400 px-2 m-0 h-full"
                                                  />
                                                </div>
                                              </div>

                                              {/* Due calculation badge */}
                                              <div className="text-right">
                                                {remainingDue > 0 ? (
                                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shadow-sm">
                                                    Due: ₹{remainingDue.toLocaleString()}
                                                  </span>
                                                ) : (
                                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shadow-sm">
                                                    ✓ Fully Paid
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-2.5">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Adjusted Totals Summary</p>
                                    
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-muted-foreground">
                                      <div className="bg-card p-2 rounded-xl border border-black/5">
                                        <p className="text-[8px] font-black uppercase opacity-75 mb-0.5">Total Billed</p>
                                        <p className="font-black text-sm text-foreground">₹{grandTotal.toLocaleString()}</p>
                                      </div>
                                      
                                      <div className="bg-card p-2 rounded-xl border border-black/5">
                                        <p className="text-[8px] font-black uppercase opacity-75 mb-0.5">Total Paid</p>
                                        <p className="font-black text-sm text-emerald-600 dark:text-emerald-400">₹{totalInitialPayment.toLocaleString()}</p>
                                      </div>
                                      
                                      <div className="bg-card p-2 rounded-xl border border-black/5">
                                        <p className="text-[8px] font-black uppercase opacity-75 mb-0.5">Total Due</p>
                                        <p className="font-black text-sm text-rose-500">₹{(grandTotal - totalInitialPayment).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Custom receipt date picker */}
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Collection Date</label>
                                    <input type="date" value={planPayment.paymentDate}
                                      onChange={e => setPlanPayment(p => ({ ...p, paymentDate: e.target.value }))}
                                      className="w-full bg-card px-3 py-2 rounded-xl outline-none border border-black/5 dark:border-white/10 font-bold text-xs text-foreground" />
                                  </div>

                                  {/* Online vs Offline */}
                                  <div className="grid grid-cols-2 gap-2 pt-1">
                                    {[
                                      { online: false, icon: '💵', label: 'Cash / Offline' },
                                      { online: true, icon: '📱', label: 'Online / UPI' },
                                    ].map(opt => (
                                      <button type="button" key={String(opt.online)}
                                        onClick={() => setPlanPayment(p => ({ ...p, isOnline: opt.online }))}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                          planPayment.isOnline === opt.online
                                            ? opt.online ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                            : 'border-transparent bg-card hover:bg-black/5 text-muted-foreground'
                                        }`}>
                                        <span>{opt.icon}</span> {opt.label}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Mode selector */}
                                  <select value={planPayment.paymentMode}
                                    onChange={e => setPlanPayment(p => ({ ...p, paymentMode: e.target.value }))}
                                    className="w-full bg-card px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-xs appearance-none border border-black/5 dark:border-white/10 text-foreground">
                                    {planPayment.isOnline
                                      ? ['UPI', 'Net Banking', 'Card', 'NEFT/RTGS'].map(o => <option key={o} className="bg-card text-foreground">{o}</option>)
                                      : ['Cash', 'Cheque', 'Bank Transfer', 'Demand Draft'].map(o => <option key={o} className="bg-card text-foreground">{o}</option>)
                                    }
                                  </select>

                                  {/* Transaction details */}
                                  {planPayment.isOnline && (
                                    <div className="relative flex items-center bg-card rounded-xl border border-black/5 dark:border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50">
                                      <Hash className="w-4 h-4 ml-3 text-blue-500 shrink-0" />
                                      <input type="text" value={planPayment.transactionNumber}
                                        onChange={e => setPlanPayment(p => ({ ...p, transactionNumber: e.target.value }))}
                                        placeholder="UTR / Transaction No."
                                        className="w-full bg-transparent px-2 py-2 outline-none font-mono font-bold text-xs text-foreground" />
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </div>

                            <button onClick={handleGeneratePlan}
                              disabled={isGenerating}
                              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm">
                              {isGenerating
                                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                                : <>Issue Invoices <ArrowRight className="w-4 h-4" /></>}
                            </button>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── RIGHT PANEL: Ledgers / Transaction History ── */}
                <div className="lg:col-span-7 xl:col-span-8">
                  {selectedStudent ? (
                    <div className="space-y-4 pb-12">
                      {/* Sub-tabs Header */}
                      <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
                        <div className="flex gap-2">
                          <button onClick={() => setRightSubTab('ledger')}
                            className={`pb-2 px-4 font-bold transition-all border-b-2 text-sm ${rightSubTab === 'ledger' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            Fee Ledger Accounts
                          </button>
                          <button onClick={() => setRightSubTab('history')}
                            className={`pb-2 px-4 font-bold transition-all border-b-2 text-sm ${rightSubTab === 'history' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            Payments & Receipts
                          </button>
                        </div>

                        <div className="flex gap-2 items-center">
                           {selectedStudent && (
                             <div className="flex gap-2 no-print">
                               <motion.button 
                                 whileHover={{ scale: 1.05, y: -1 }}
                                 whileTap={{ scale: 0.95 }}
                                 onClick={() => setPrintStatementData({ mode: 'single', student: selectedStudent, class: studentClass, ledgers: ledgersList.map(l => ({ ...l, categoryName: l.category?.name || l.categoryName || 'Fee Category' })), totalDue: totalBilledAll, totalPaid: totalPaidAll, remaining: totalDueAll })}
                                 className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-muted-foreground hover:text-foreground px-3.5 py-2 rounded-xl font-extrabold text-xs shadow-sm transition-colors flex items-center gap-2">
                                 <Printer className="w-3.5 h-3.5" /> Print
                               </motion.button>
                               <motion.button 
                                 whileHover={{ scale: 1.05, y: -1 }}
                                 whileTap={{ scale: 0.95 }}
                                 onClick={() => setPrintStatementData({ mode: 'duplicate', student: selectedStudent, class: studentClass, ledgers: ledgersList.map(l => ({ ...l, categoryName: l.category?.name || l.categoryName || 'Fee Category' })), totalDue: totalBilledAll, totalPaid: totalPaidAll, remaining: totalDueAll })}
                                 className="bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white px-3.5 py-2 rounded-xl font-black text-xs shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2">
                                 <Printer className="w-3.5 h-3.5" /> Duplicate (A4)
                                </motion.button>
                             </div>
                           )}
                          {rightSubTab === 'ledger' && ledgersList.some(l => l.status !== 'Paid') && (
                            <button onClick={openCollectModal}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-1">
                              <Plus className="w-3.5 h-3.5" /> Collect Payments
                            </button>
                          )}
                        </div>
                      </div>

                      {/* LEDGER TAB */}
                      {rightSubTab === 'ledger' && (
                        <div className="space-y-4">
                          {groupedLedgers.length > 0 ? (
                            <>
                              <div className="space-y-4">
                                {paginatedGroupedLedgers.map(([month, data]) => {
                                  const isFullyPaid = data.totalDue <= data.totalPaid;
                                  const dueBalance = data.totalDue - data.totalPaid;
                                  return (
                                    <motion.div key={month} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                      className="bg-card border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden premium-shadow transition-all duration-300 hover:shadow-lg">
                                      <div className={`px-5 py-4 flex justify-between items-center border-b border-black/5 dark:border-white/5 ${isFullyPaid ? 'bg-emerald-500/[0.03]' : 'bg-black/[0.02] dark:bg-white/[0.02]'}`}>
                                        <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFullyPaid ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                            <Calendar className={`w-5 h-5 ${isFullyPaid ? 'text-emerald-500' : 'text-rose-500'}`} />
                                          </div>
                                          <div>
                                            <h4 className="font-extrabold text-sm text-foreground">{month}</h4>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                                              {data.ledgers.length} Invoice{data.ledgers.length !== 1 ? 's' : ''}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <div className="flex items-center gap-1 no-print">
                                            <button onClick={(e) => { e.stopPropagation(); setPrintStatementData({ mode: 'single', student: selectedStudent, class: studentClass, ledgers: data.ledgers.map(l => ({ ...l, categoryName: l.category?.name || l.categoryName || 'Fee Category' })), totalDue: data.totalDue, totalPaid: data.totalPaid, remaining: dueBalance }); }}
                                              title="Print Month Script"
                                              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                                              <Printer className="w-4 h-4" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setPrintStatementData({ mode: 'duplicate', student: selectedStudent, class: studentClass, ledgers: data.ledgers.map(l => ({ ...l, categoryName: l.category?.name || l.categoryName || 'Fee Category' })), totalDue: data.totalDue, totalPaid: data.totalPaid, remaining: dueBalance }); }}
                                              title="Print Month Duplicate Script"
                                              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center">
                                              <div className="relative">
                                                <Printer className="w-4 h-4" />
                                                <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white font-extrabold text-[7px] w-3 h-3 rounded-full flex items-center justify-center border border-card shadow-sm">2</span>
                                              </div>
                                            </button>
                                          </div>
                                          <div className="text-right">
                                            {isFullyPaid ? (
                                              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                                <Check className="w-3.5 h-3.5" /> Fully Paid
                                              </span>
                                            ) : (
                                              <div>
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Month Dues</p>
                                                <p className="text-xs font-black mt-0.5">
                                                  <span className="text-emerald-600 dark:text-emerald-400">₹{data.totalPaid.toLocaleString()} Paid</span>
                                                  <span className="text-muted-foreground mx-1.5">•</span>
                                                  <span className="text-rose-500">₹{dueBalance.toLocaleString()} Due</span>
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="p-3 space-y-1">
                                        {data.ledgers.map(ledger => {
                                          const lDue = (ledger.amountDue ?? 0) - (ledger.amountPaid ?? 0);
                                          return (
                                            <div key={ledger.id} className="flex items-center justify-between p-3.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors group">
                                              <div className="flex items-center gap-3.5 min-w-0">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                                  ledger.status === 'Paid' 
                                                    ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-500' 
                                                    : ledger.status === 'Partial' 
                                                      ? 'bg-amber-500/10 border-amber-500/10 text-amber-500' 
                                                      : 'bg-rose-500/10 border-rose-500/10 text-rose-500'
                                                }`}>
                                                  {ledger.status === 'Paid' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="font-extrabold text-sm text-foreground truncate">{ledger.category?.name || 'Fee Category'}</p>
                                                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mt-0.5">
                                                    Invoiced: <span className="text-foreground">₹{ledger.amountDue}</span>
                                                    {ledger.amountPaid > 0 && (
                                                      <>
                                                        <span className="text-muted-foreground mx-1.5">•</span>
                                                        Paid: <span className="text-emerald-600 dark:text-emerald-400">₹{ledger.amountPaid}</span>
                                                      </>
                                                    )}
                                                  </p>
                                                  <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Invoice Date: {new Date(ledger.dueDate).toLocaleDateString()}</p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3 shrink-0">
                                                <span className={`font-extrabold text-xs px-2.5 py-1 rounded-full border transition-all ${
                                                  ledger.status === 'Paid' 
                                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                                    : ledger.status === 'Partial' 
                                                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' 
                                                      : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
                                                }`}>
                                                  {ledger.status === 'Paid' ? '✓ Paid' : `₹${lDue.toLocaleString()} Due`}
                                                </span>
                                                {ledger.status !== 'Paid' && (
                                                  <button onClick={() => openPaymentModal(ledger)}
                                                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl font-bold text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all shadow-md shadow-emerald-500/20 hover:scale-105">
                                                    Collect
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>

                              {/* Due Ledgers Pagination Controls */}
                              {groupedLedgersTotalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                                  <span className="text-xs text-muted-foreground font-bold">
                                    Showing {(groupedLedgerPage - 1) * ledgerItemsPerPage + 1} - {Math.min(groupedLedgerPage * ledgerItemsPerPage, groupedLedgers.length)} of {groupedLedgers.length} billing months
                                  </span>
                                  <PaginationControls currentPage={groupedLedgerPage} totalPages={groupedLedgersTotalPages} onPageChange={setGroupedLedgerPage} />
                                </div>
                              )}

                              {/* LEDGER TAB BOTTOM FINANCIAL SUMMARY CARD */}
                              <div className="mt-6 bg-card border border-black/5 dark:border-white/5 rounded-3xl p-5 premium-shadow space-y-4 bg-gradient-to-br from-emerald-500/[0.02] to-teal-500/[0.02] hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
                                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                                  <h3 className="font-black text-xs uppercase tracking-wider text-muted-foreground">Ledger Financial Summary</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {/* Total Invoiced */}
                                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 flex flex-col justify-between">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Total Fees Invoiced</span>
                                    <span className="text-xl font-black text-foreground mt-2">₹{totalBilledAll.toLocaleString()}</span>
                                    <span className="text-[9px] text-muted-foreground mt-1">Total demanded charges</span>
                                  </div>
                                  {/* Total Paid */}
                                  <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex flex-col justify-between">
                                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Total Fees Paid</span>
                                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2">₹{totalPaidAll.toLocaleString()}</span>
                                    <span className="text-[9px] text-emerald-500/70 mt-1">Total successful collections</span>
                                  </div>
                                  {/* Total Remaining Due */}
                                  <div className={`${totalDueAll > 0 ? 'bg-rose-500/5 border-rose-500/10' : 'bg-emerald-500/5 border-emerald-500/10'} p-4 rounded-2xl border flex flex-col justify-between`}>
                                    <span className={`text-[10px] font-black uppercase ${totalDueAll > 0 ? 'text-rose-500' : 'text-emerald-500'} tracking-wider`}>Remaining Dues</span>
                                    <span className={`text-xl font-black ${totalDueAll > 0 ? 'text-rose-500' : 'text-emerald-500'} mt-2`}>₹{totalDueAll.toLocaleString()}</span>
                                    <span className={`text-[9px] ${totalDueAll > 0 ? 'text-rose-500/70' : 'text-emerald-500/70'} mt-1`}>
                                      {totalDueAll > 0 ? 'Outstanding balance' : 'No balance pending'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-20 bg-card border border-black/5 dark:border-white/5 rounded-3xl">
                              <p className="font-black text-lg text-muted-foreground">No Bills Generated Yet</p>
                              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Use the planner on the left to select frequencies and generate student fee schedules.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PHONEPE TRANSACTION HISTORY TAB */}
                      {rightSubTab === 'history' && (
                        <div className="space-y-4">
                          {transactionHistory.length > 0 ? (
                            <>
                              <div className="space-y-3">
                                {paginatedTransactionHistory.map(tx => {
                                  const isOnline = tx.paymentMode.toLowerCase().includes('online') || tx.paymentMode.toLowerCase().includes('upi');
                                  return (
                                    <div key={tx.id}
                                      onClick={() => setSelectedReceipt(tx)}
                                      className="bg-card border border-black/5 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer hover:shadow-md transition-all group duration-300">
                                      <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${
                                          isOnline 
                                            ? 'bg-blue-500/10 border-blue-500/10 text-blue-500' 
                                            : 'bg-emerald-500/10 border-emerald-500/10 text-emerald-500'
                                        }`}>
                                          {isOnline ? <Smartphone className="w-5.5 h-5.5" /> : <Banknote className="w-5.5 h-5.5" />}
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="font-extrabold text-sm text-foreground truncate group-hover:text-emerald-500 transition-colors">Receipt for {tx.categoryName}</h4>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                              isOnline 
                                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' 
                                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                            }`}>
                                              {tx.paymentMode}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-semibold">
                                              Received on {new Date(tx.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(tx.paymentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="font-black text-emerald-600 dark:text-emerald-400 text-base">₹{tx.amount.toLocaleString()}</p>
                                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 mt-1.5">
                                          ✓ Successful
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {/* Ledger Pagination Controls */}
                              {ledgerTotalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                                  <span className="text-xs text-muted-foreground font-bold">
                                    Showing {(ledgerPage - 1) * ledgerItemsPerPage + 1} - {Math.min(ledgerPage * ledgerItemsPerPage, transactionHistory.length)} of {transactionHistory.length} receipts
                                  </span>
                                  <PaginationControls currentPage={ledgerPage} totalPages={ledgerTotalPages} onPageChange={setLedgerPage} />
                                </div>
                              )}

                              {/* TRANSACTION TAB BOTTOM SUMMARY CARD */}
                              <div className="mt-6 bg-card border border-black/5 dark:border-white/5 rounded-3xl p-5 premium-shadow space-y-4 bg-gradient-to-br from-emerald-500/[0.02] to-teal-500/[0.02] hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
                                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                                  <h3 className="font-black text-xs uppercase tracking-wider text-muted-foreground">Receipts & Payments Summary</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* Total Transactions */}
                                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 flex flex-col justify-between">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Total Transactions</span>
                                    <span className="text-xl font-black text-foreground mt-2">{transactionHistory.length} Receipt{transactionHistory.length !== 1 ? 's' : ''}</span>
                                    <span className="text-[9px] text-muted-foreground mt-1">Count of recorded payments</span>
                                  </div>
                                  {/* Total Money Collected */}
                                  <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex flex-col justify-between">
                                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Total Received Amount</span>
                                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2">₹{transactionHistory.reduce((acc, tx) => acc + Number(tx.amount ?? 0), 0).toLocaleString()}</span>
                                    <span className="text-[9px] text-emerald-500/70 mt-1">Sum of all successful receipts</span>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-20 bg-card border border-black/5 dark:border-white/5 rounded-3xl">
                              <p className="font-black text-lg text-muted-foreground">No Transactions Recorded Yet</p>
                              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Collect payments on invoice dues to view receipts history here.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-card border border-black/5 dark:border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-[550px]">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full flex items-center justify-center mb-6">
                        <Users className="w-12 h-12 text-emerald-500/40" />
                      </div>
                      <h3 className="text-2xl font-black mb-2">Select a Student</h3>
                      <p className="text-muted-foreground font-medium max-w-sm">Use the Class, Section, and Student name fields on the left to pull up student ledgers.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ── FEES DIRECTORY ─────────────────────────────────────────── */}
            {activeTab === 'Fees Directory' && (
              <div className="space-y-6">
                {/* Search, Filters, Sort Control panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow">
                  {/* Search by name/adm */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search student..."
                      value={directorySearch}
                      onChange={e => setDirectorySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-sm text-foreground"
                    />
                  </div>

                  {/* Class Filter */}
                  <div className="relative">
                    <select
                      value={directoryClassId}
                      onChange={e => setDirectoryClassId(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm cursor-pointer text-foreground"
                    >
                      <option value="All" className="bg-card text-foreground">All Classes</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section Filter */}
                  <div className="relative">
                    <select
                      value={directorySectionId}
                      onChange={e => setDirectorySectionId(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm cursor-pointer text-foreground"
                    >
                      <option value="All" className="bg-card text-foreground">All Sections</option>
                      {directorySectionsList.map(sec => (
                        <option key={sec.id} value={sec.id} className="bg-card text-foreground">{sec.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={directoryStatus}
                      onChange={e => setDirectoryStatus(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm cursor-pointer text-foreground"
                    >
                      <option value="All" className="bg-card text-foreground">All Statuses</option>
                      <option value="Fully Paid" className="bg-card text-foreground">Fully Paid</option>
                      <option value="Due Pending" className="bg-card text-foreground">Due Pending</option>
                      <option value="No Invoices" className="bg-card text-foreground">No Invoices</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="relative">
                    <select
                      value={directorySortBy}
                      onChange={e => setDirectorySortBy(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm cursor-pointer text-foreground"
                    >
                      <option value="name-asc" className="bg-card text-foreground">Name (A to Z)</option>
                      <option value="name-desc" className="bg-card text-foreground">Name (Z to A)</option>
                      <option value="due-desc" className="bg-card text-foreground">Due (High to Low)</option>
                      <option value="due-asc" className="bg-card text-foreground">Due (Low to High)</option>
                    </select>
                  </div>
                </div>

                {/* Actions row with View Toggle */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/40 p-4 rounded-2xl border border-black/5 dark:border-white/10">
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <span>Found <span className="text-foreground font-black text-sm">{filteredAndSortedDirectory.length}</span> students.</span>
                    <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                      <button onClick={() => setDirectoryViewMode('grid')} className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${directoryViewMode === 'grid' ? 'bg-orange-500 text-white shadow' : 'text-muted-foreground hover:bg-black/5'}`}>Grid View</button>
                      <button onClick={() => setDirectoryViewMode('table')} className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${directoryViewMode === 'table' ? 'bg-orange-500 text-white shadow' : 'text-muted-foreground hover:bg-black/5'}`}>Table View</button>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={exportDirectoryToCSV}
                      disabled={filteredAndSortedDirectory.length === 0}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:hover:scale-100 font-bold"
                    >
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                    {selectedDirectoryStudentId ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            const stu = filteredAndSortedDirectory.find(s => s.id === selectedDirectoryStudentId);
                            if (stu) {
                              const studentObject = students.find(s => s.id === stu.id);
                              const classObject = classes.find(c => c.id === studentObject?.classId);
                              const studentLedgers = allLedgers.filter(l => l.studentId === stu.id).map(l => ({ ...l, categoryName: l.category?.name || l.categoryName || 'Fee Category' }));
                              setPrintStatementData({
                                mode: 'single',
                                student: studentObject || stu,
                                class: classObject || { name: stu.className },
                                ledgers: studentLedgers,
                                totalDue: stu.totalBilled,
                                totalPaid: stu.totalPaid,
                                remaining: stu.totalDue
                              });
                            }
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
                        >
                          <Printer className="w-4 h-4" /> Print Selected
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            const stu = filteredAndSortedDirectory.find(s => s.id === selectedDirectoryStudentId);
                            if (stu) {
                              const studentObject = students.find(s => s.id === stu.id);
                              const classObject = classes.find(c => c.id === studentObject?.classId);
                              const studentLedgers = allLedgers.filter(l => l.studentId === stu.id).map(l => ({ ...l, categoryName: l.category?.name || l.categoryName || 'Fee Category' }));
                              setPrintStatementData({
                                mode: 'duplicate',
                                student: studentObject || stu,
                                class: classObject || { name: stu.className },
                                ledgers: studentLedgers,
                                totalDue: stu.totalBilled,
                                totalPaid: stu.totalPaid,
                                remaining: stu.totalDue
                              });
                            }
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
                        >
                          <Printer className="w-4 h-4" /> Duplicate (A4)
                        </motion.button>
                        <button
                          onClick={() => setSelectedDirectoryStudentId(null)}
                          className="px-3.5 py-2.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl font-bold text-xs text-muted-foreground transition-colors"
                        >
                          Clear
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Loading state / Grid Display */}
                {isAllLedgersLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredAndSortedDirectory.length > 0 ? (
                  <div className="space-y-6">
                    {directoryViewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {paginatedDirectory.map((stu, idx) => {
                        const bgGradient = GRADIENT_PALETTE[stu.firstName.charCodeAt(0) % GRADIENT_PALETTE.length];
                        const isFullyPaid = stu.status === 'Fully Paid';
                        const isPartial = stu.status === 'Partial';
                        
                        // Status badge colors
                        let dotColor = 'bg-slate-400';
                        let textColor = 'text-slate-600 dark:text-slate-400';
                        let bgColor = 'bg-slate-500/10 border-slate-500/20';
                        if (isFullyPaid) {
                          dotColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
                          textColor = 'text-emerald-600 dark:text-emerald-400';
                          bgColor = 'bg-emerald-500/10 border-emerald-500/20';
                        } else if (isPartial) {
                          dotColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
                          textColor = 'text-amber-600 dark:text-amber-400';
                          bgColor = 'bg-amber-500/10 border-amber-500/20';
                        } else if (stu.status === 'Unpaid') {
                          dotColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
                          textColor = 'text-rose-600 dark:text-rose-400';
                          bgColor = 'bg-rose-500/10 border-rose-500/20';
                        }

                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.03 }}
                            key={stu.id}
                            onClick={() => setSelectedDirectoryStudentId(selectedDirectoryStudentId === stu.id ? null : stu.id)}
                            className={`relative bg-card p-5 rounded-[2rem] premium-shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer border-2 ${
                              selectedDirectoryStudentId === stu.id 
                                ? 'border-orange-500 ring-4 ring-orange-500/10 shadow-lg shadow-orange-500/5' 
                                : 'border-black/5 dark:border-white/10'
                            }`}
                          >
                            {selectedDirectoryStudentId === stu.id && (
                              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/30 z-10">
                                ✓
                              </div>
                            )}
                            {/* Card Top: Avatar and details */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bgGradient} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md`}>
                                  {stu.firstName[0]}{stu.lastName[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-extrabold text-sm text-foreground truncate">{stu.firstName} {stu.lastName}</h4>
                                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Adm: {stu.admissionNumber}</p>
                                </div>
                              </div>

                              {/* Class & Section Details */}
                              <div className="flex gap-1.5 flex-wrap">
                                <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border border-blue-500/20">
                                  Class {stu.className}
                                </span>
                                <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border border-indigo-500/20">
                                  Sec {stu.sectionName}
                                </span>
                              </div>

                              {/* Ledger summary list */}
                              <div className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 space-y-2 text-xs">
                                <div className="flex justify-between items-center text-muted-foreground">
                                  <span className="font-medium">Total Invoiced:</span>
                                  <span className="font-black text-foreground">₹{stu.totalBilled.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                  <span className="font-medium">Total Collected:</span>
                                  <span className="font-black text-emerald-600 dark:text-emerald-400">₹{stu.totalPaid.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1.5 border-t border-black/10 dark:border-white/10 font-bold text-foreground">
                                  <span>Dues Outstanding:</span>
                                  <span className={stu.totalDue > 0 ? "font-black text-rose-500" : "font-black text-muted-foreground"}>
                                    ₹{stu.totalDue.toLocaleString()}
                                  </span>
                                </div>
                                {/* Detailed Category Breakdown */}
                                {activeFeeNames.length > 0 && (
                                  <div className="pt-2 mt-2 border-t border-black/10 dark:border-white/10">
                                    <div className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1.5">Fee Breakdown (Paid)</div>
                                    <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                      {activeFeeNames.map(name => {
                                        const amount = stu.categoryBreakdown?.[name];
                                        if (!amount || (amount.billed === 0 && amount.paid === 0)) return null;
                                        return (
                                          <div key={name} className="flex justify-between items-center text-[9.5px] font-bold">
                                            <span className="text-muted-foreground truncate mr-2 flex items-center gap-1">
                                              <span>{name}</span>
                                              {feeFrequencies[name] && <span className="opacity-60 text-[8px] border border-current px-1 rounded-sm uppercase tracking-wider">{feeFrequencies[name]}</span>}
                                            </span>
                                            <span className="text-foreground">₹{amount.paid.toLocaleString()}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Card Footer: Status and Action button */}
                            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                              {/* Status badge with animated pulse dot */}
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border shrink-0 whitespace-nowrap ${bgColor} ${textColor}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                {stu.status}
                              </span>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleViewLedger(stu); }}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-[10px] shadow-sm hover:scale-105 transition-transform flex items-center gap-1 shrink-0"
                                >
                                  View Ledger
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    ) : (
                      <div id="printable-summary-table" className="overflow-x-auto rounded-[2rem] border border-black/5 dark:border-white/10 premium-shadow bg-card custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-max">
                          <thead>
                            <tr className="border-b border-black/5 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-black/[0.02] dark:bg-white/[0.02]">
                              <th className="py-4 px-4 sticky left-0 bg-card z-10 border-r border-black/5 dark:border-white/10">Student Info</th>
                              <th className="py-4 px-4">Class/Sec</th>
                              <th className="py-4 px-4 text-center font-bold">Status</th>
                              <th className="py-4 px-4 text-right">Total Billed</th>
                              <th className="py-4 px-4 text-right">Total Paid</th>
                              <th className="py-4 px-4 text-right">Remaining Due</th>
                              {activeFeeNames.map(name => (
                                <th key={name} className="py-4 px-4 text-center border-l border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01]">
                                  <div className="flex flex-col items-center justify-center gap-0.5">
                                    <span>{name}</span>
                                    {feeFrequencies[name] && <span className="text-[8px] opacity-60 font-black uppercase tracking-wider border border-current px-1 rounded-sm">{feeFrequencies[name]}</span>}
                                  </div>
                                </th>
                              ))}
                              <th className="py-4 px-4 text-center border-l border-black/5 dark:border-white/10 z-10 no-print">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5 dark:divide-white/10 text-xs font-semibold">
                            {paginatedDirectory.map((stu, idx) => {
                              let badgeBg = 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400';
                              if (stu.status === 'Fully Paid') badgeBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
                              else if (stu.status === 'Partial') badgeBg = 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
                              else if (stu.status === 'Unpaid') badgeBg = 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
                              
                              const isSelected = selectedDirectoryStudentId === stu.id;
                              return (
                                <tr key={stu.id} 
                                  onClick={() => setSelectedDirectoryStudentId(isSelected ? null : stu.id)}
                                  className={`transition-colors cursor-pointer border-l-4 ${
                                    isSelected 
                                      ? 'bg-orange-500/5 hover:bg-orange-500/10 border-orange-500' 
                                      : 'hover:bg-black/5 dark:hover:bg-white/5 border-transparent'
                                  }`}
                                >
                                  {/* Student info */}
                                  <td className={`py-3.5 px-4 sticky left-0 backdrop-blur-md z-10 border-r border-black/5 dark:border-white/10 ${isSelected ? 'bg-orange-500/5 dark:bg-orange-950/20' : 'bg-card/90'}`}>
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center font-black text-xs">
                                        {stu.firstName[0]}{stu.lastName[0]}
                                      </div>
                                      <div>
                                        <p className="font-extrabold text-foreground">{stu.firstName} {stu.lastName}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Adm: {stu.admissionNumber}</p>
                                        <button
                                          onClick={() => handleViewLedger(stu)}
                                          className="text-[9px] text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 font-bold uppercase tracking-wider flex items-center gap-0.5 mt-1 hover:underline text-left"
                                        >
                                          🔍 View Fee History
                                        </button>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Class/Sec */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex gap-1">
                                      <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-blue-500/20">{stu.className}</span>
                                      <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-indigo-500/20">{stu.sectionName}</span>
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="py-3.5 px-4 text-center">
                                    <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${badgeBg}`}>
                                      {stu.status}
                                    </span>
                                  </td>

                                  {/* Total Billed */}
                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                                    ₹{stu.totalBilled.toLocaleString()}
                                  </td>

                                  {/* Total Paid */}
                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    ₹{stu.totalPaid.toLocaleString()}
                                  </td>

                                  {/* Remaining Due */}
                                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                                    <span className={stu.totalDue > 0 ? "text-rose-500" : "text-muted-foreground"}>
                                      ₹{stu.totalDue.toLocaleString()}
                                    </span>
                                  </td>

                                  {/* Dynamic Fee Columns */}
                                  {activeFeeNames.map(name => {
                                    const feeData = stu.categoryBreakdown[name];
                                    const billed = feeData?.billed || 0;
                                    const paid = feeData?.paid || 0;
                                    const remains = billed - paid;

                                    if (billed === 0) {
                                      return (
                                        <td key={name} className="py-3.5 px-4 text-center text-muted-foreground/30 font-bold border-l border-black/5 dark:border-white/10">
                                          —
                                        </td>
                                      );
                                    }

                                    let valColor = "text-rose-500";
                                    let subLabel = `of ₹${billed.toLocaleString()}`;
                                    let cellBg = "bg-rose-500/[0.01] dark:bg-rose-500/[0.005]";

                                    if (remains === 0) {
                                      valColor = "text-emerald-600 dark:text-emerald-400";
                                      subLabel = "Cleared";
                                      cellBg = "bg-emerald-500/[0.01] dark:bg-emerald-500/[0.005]";
                                    } else if (paid > 0) {
                                      valColor = "text-amber-500";
                                      cellBg = "bg-amber-500/[0.01] dark:bg-amber-500/[0.005]";
                                    }

                                    return (
                                      <td key={name} className={`py-3.5 px-4 text-center border-l border-black/5 dark:border-white/10 ${cellBg}`}>
                                        <div className="font-extrabold text-xs">
                                          <span className={valColor}>₹{paid.toLocaleString()}</span>
                                        </div>
                                        <div className="text-[9px] text-muted-foreground/80 font-bold mt-0.5">
                                          {subLabel}
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Pagination Directory */}
                    {directoryTotalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/5 dark:border-white/5">
                        <span className="text-xs text-muted-foreground font-bold">
                          Showing {(directoryPage - 1) * directoryItemsPerPage + 1} - {Math.min(directoryPage * directoryItemsPerPage, filteredAndSortedDirectory.length)} of {filteredAndSortedDirectory.length} students
                        </span>
                        
                        <PaginationControls currentPage={directoryPage} totalPages={directoryTotalPages} onPageChange={setDirectoryPage} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-black/10 dark:border-white/10 text-muted-foreground font-semibold">
                    No student records found matching active filter/search inputs.
                  </div>
                )}
              </div>
            )}
          </div>
      )}

      {/* MODAL: Configure Single Category (Old setup option, kept for legacy support) */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-3xl overflow-hidden premium-shadow">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <h2 className="text-xl font-bold">{editingCategory ? "Edit Fee Category" : "Configure Fee Category"}</h2>
                <button onClick={() => { setCategoryModalOpen(false); setEditingCategory(null); }} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Fee Name</label>
                  <select
                    required
                    value={categoryForm.isCustom ? 'Custom' : categoryForm.name}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'Custom') {
                        setCategoryForm({ ...categoryForm, name: '', isCustom: true });
                      } else {
                        setCategoryForm({ ...categoryForm, name: val, isCustom: false });
                      }
                    }}
                    className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-xl border border-black/5 dark:border-white/10 font-bold text-sm cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/50 text-foreground"
                  >
                    <option value="" disabled className="bg-card text-foreground">Select Fee Type</option>
                    {DEFAULT_FEE_TYPES.map(type => {
                      const isAlreadyAdded = categoriesForConfigClass.some(cat => {
                        if (editingCategory && cat.id === editingCategory.id) return false;
                        return cat.name.toLowerCase() === type.toLowerCase();
                      });
                      return (
                        <option key={type} value={type} disabled={isAlreadyAdded} className="bg-card text-foreground">
                          {type} {isAlreadyAdded ? ' (Already Added)' : ''}
                        </option>
                      );
                    })}
                    <option value="Custom" className="bg-card text-foreground">✏️ Custom / Add Other...</option>
                  </select>

                  {/* Custom Fee Name Input */}
                  {categoryForm.isCustom && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                      <input
                        required
                        type="text"
                        placeholder="Enter custom fee name..."
                        value={categoryForm.name}
                        onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-sm text-foreground"
                      />
                    </motion.div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Amount (₹)</label>
                  <input required type="number" min={0} value={categoryForm.amount} onChange={e => setCategoryForm({ ...categoryForm, amount: e.target.value })} placeholder="2000" className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-xl outline-none border border-black/5 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/50 font-bold text-foreground" />
                </div>
                
                {/* Common Fee Toggle (replaces Link to Specific Class dropdown) */}
                <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/10">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Common Fee</span>
                    <span className="text-[10px] text-muted-foreground block">Applies to all classes</span>
                  </div>
                  <button type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, isCommon: !categoryForm.isCommon })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${categoryForm.isCommon ? 'bg-emerald-500' : 'bg-black/20 dark:bg-white/20'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${categoryForm.isCommon ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Frequency</label>
                  <select
                    value={categoryForm.frequency}
                    onChange={e => setCategoryForm({ ...categoryForm, frequency: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 px-4 py-3.5 rounded-xl border border-black/5 dark:border-white/10 font-bold text-sm cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/50 text-foreground"
                  >
                    {BILLING_MODES.map(mode => (
                      <option key={mode.key} value={mode.key} className="bg-card text-foreground">
                        {mode.icon} {mode.label} ({mode.desc})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform">
                  {editingCategory ? "Update Category" : "Save Category"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Class-wise Fee Structure Builder (Single Config Screen) */}
      <AnimatePresence>
        {isClassSetupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-4xl rounded-[2.5rem] overflow-hidden premium-shadow border border-emerald-500/20">
              <div className="p-6 border-b border-emerald-500/10 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                <div>
                  <h2 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    Fee Structure Builder — {classes.find(c => c.id === selectedConfigClassId)?.name || ''}
                  </h2>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    Set up or edit the entire fee structure line-by-line for {classes.find(c => c.id === selectedConfigClassId)?.name || 'this class'}.
                  </p>
                </div>
                <button type="button" onClick={() => setClassSetupModalOpen(false)} className="p-2 rounded-full hover:bg-black/10">
                  <X className="w-6 h-6" />
                </button>
              </div>
 
              <form onSubmit={handleClassSetupSave} className="p-6 space-y-6">
 
                {/* Items List Rows */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                  <div className="hidden md:grid md:grid-cols-12 gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-wider px-2">
                    <div className="col-span-4">Fee Name / Type</div>
                    <div className="col-span-3">Amount (₹)</div>
                    <div className="col-span-3">Frequency</div>
                    <div className="col-span-2 text-center">Type</div>
                  </div>
 
                  {setupRows.map((row, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-black/5 dark:bg-white/5 p-4 md:p-3 rounded-2xl border border-black/5 items-center relative group">
                      
                      {/* Name with predefined types and custom typing */}
                      <div className="col-span-4 space-y-1.5">
                        <div className="relative">
                          <select
                            disabled={row.id !== null}
                            value={row.isCustom ? 'Custom' : row.name}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === 'Custom') {
                                setSetupRows(prev => prev.map((r, i) => i === index ? { ...r, name: '', isCustom: true } : r));
                              } else {
                                setSetupRows(prev => prev.map((r, i) => i === index ? { ...r, name: val, isCustom: false } : r));
                              }
                            }}
                            className="w-full bg-card hover:bg-black/5 dark:hover:bg-white/5 px-4 py-3.5 rounded-xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm cursor-pointer transition-all duration-200 appearance-none pr-10 disabled:opacity-80 disabled:cursor-not-allowed disabled:bg-black/5 dark:disabled:bg-white/5 text-foreground"
                            required
                          >
                            <option value="" disabled className="bg-card text-foreground">Select Fee Type</option>
                            {DEFAULT_FEE_TYPES.map(type => {
                              const details = FEE_TYPE_DETAILS[type] || { icon: "💰" };
                              const isAlreadySelected = setupRows.some((r, idx) => idx !== index && !r.isCustom && r.name.trim().toLowerCase() === type.trim().toLowerCase()) ||
                                                        feeCategories.some(cat => {
                                                          if (cat.name.trim().toLowerCase() !== type.trim().toLowerCase()) return false;
                                                          if (row.id === cat.id) return false;
                                                          
                                                          let applies = false;
                                                          if (!cat.classIds) {
                                                            applies = true; // Common fee
                                                          } else {
                                                            try {
                                                              const parsed = JSON.parse(cat.classIds);
                                                              if (Array.isArray(parsed) && parsed.includes(selectedConfigClassId)) {
                                                                applies = true;
                                                              }
                                                            } catch (e) {}
                                                          }
                                                          return applies;
                                                        });
                              return (
                                <option key={type} value={type} disabled={isAlreadySelected} className="bg-card text-foreground">
                                  {details.icon} {type} {isAlreadySelected ? ' (Already Added)' : ''}
                                </option>
                              );
                            })}
                            <option value="Custom" className="bg-card text-foreground">✏️ Custom / Add Other...</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            {row.id !== null ? (
                              <span className="text-xs opacity-60">🔒</span>
                            ) : (
                              <ChevronDown className="w-4.5 h-4.5" />
                            )}
                          </div>
                        </div>

                        {/* Custom Input Field */}
                        {row.isCustom && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2"
                          >
                            <input
                              required
                              type="text"
                              placeholder="Enter custom fee name..."
                              value={row.name}
                              onChange={e => {
                                const val = e.target.value;
                                setSetupRows(prev => prev.map((r, i) => i === index ? { ...r, name: val } : r));
                              }}
                              className="w-full bg-card px-3.5 py-2.5 rounded-xl border border-black/5 dark:border-white/10 outline-none font-bold text-xs focus:ring-1 focus:ring-emerald-500 text-foreground"
                            />
                          </motion.div>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="col-span-3">
                        <input required type="number" placeholder="2000" min={0} value={row.amount}
                          onChange={e => {
                            const val = e.target.value;
                            setSetupRows(prev => prev.map((r, i) => i === index ? { ...r, amount: val } : r));
                          }}
                          className="w-full bg-card px-3 py-2.5 rounded-xl border border-black/5 dark:border-white/10 outline-none font-black text-sm text-foreground" />
                      </div>

                      {/* Frequency */}
                      <div className="col-span-3">
                        <select value={row.frequency}
                          onChange={e => {
                            const val = e.target.value;
                            setSetupRows(prev => prev.map((r, i) => i === index ? { ...r, frequency: val } : r));
                          }}
                          className="w-full bg-card px-3 py-2.5 rounded-xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm text-foreground">
                          {BILLING_MODES.map(o => <option key={o.key} value={o.key} className="bg-card text-foreground">{o.label}</option>)}
                        </select>
                      </div>

                      {/* Common Fee Toggle */}
                      <div className="col-span-2 flex items-center justify-between gap-2">
                        <button type="button"
                          onClick={() => {
                            setSetupRows(prev => prev.map((r, i) => i === index ? { ...r, isCommon: !r.isCommon } : r));
                          }}
                          className={`w-full py-2.5 rounded-xl border font-bold text-xs transition-colors text-center ${
                            row.isCommon
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                              : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                          }`}>
                          {row.isCommon ? 'Common' : 'Specific'}
                        </button>
                        
                        {/* Remove Row Button */}
                        <button type="button" onClick={() => removeSetupRow(index, row.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-black/5">
                  <button type="button" onClick={addSetupRow}
                    className="border border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-6 py-3 rounded-2xl font-black text-sm hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Fee Item
                  </button>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setClassSetupModalOpen(false)}
                      className="border border-black/10 dark:border-white/10 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-black/5 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-2 text-sm disabled:opacity-50">
                      {isSubmitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                      ) : (
                        'Save Class Structure'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Collect Payment for Single Ledger */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedLedger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-3xl overflow-hidden premium-shadow border border-emerald-500/20">
              <div className="p-5 border-b border-emerald-500/10 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                <div>
                  <h2 className="text-xl font-black text-emerald-600 dark:text-emerald-400">Collect Payment</h2>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    {selectedLedger.category?.name} • Billing date: {new Date(selectedLedger.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => setPaymentModalOpen(false)} className="p-2 rounded-full hover:bg-black/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handlePayment} className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Total Billed', value: `₹${selectedLedger.amountDue}`, color: 'text-foreground' },
                    { label: 'Already Paid', value: `₹${selectedLedger.amountPaid}`, color: 'text-emerald-500' },
                    { label: 'Remaining', value: `₹${singleRemaining}`, color: 'text-rose-500' },
                  ].map((item, i) => (
                    <div key={i} className="bg-black/5 dark:bg-white/5 rounded-2xl p-3 text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                      <p className={`font-black text-base ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Collection Date</label>
                  <input type="date" value={paymentForm.paymentDate}
                    onChange={e => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
                    className="w-full bg-black/5 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-black/5 dark:border-white/10 font-bold text-xs text-foreground" />
                </div>

                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { online: false, icon: Banknote, label: 'Offline / Cash', activeClass: 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' },
                      { online: true, icon: Smartphone, label: 'Online / UPI', activeClass: 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' },
                    ].map(opt => (
                      <button type="button" key={String(opt.online)}
                        onClick={() => setPaymentForm(p => ({ ...p, isOnline: opt.online }))}
                        className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${paymentForm.isOnline === opt.online ? opt.activeClass : 'border-black/10 dark:border-white/10 text-muted-foreground hover:border-black/20'}`}>
                        <opt.icon className="w-5 h-5" />
                        <span className="font-bold text-xs">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                    {paymentForm.isOnline ? 'Online Mode' : 'Payment Mode'}
                  </label>
                  <select value={paymentForm.paymentMode}
                    onChange={e => setPaymentForm(p => ({ ...p, paymentMode: e.target.value }))}
                    className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold border border-black/5 dark:border-white/10 text-foreground">
                    {paymentForm.isOnline ? (
                      <>{['UPI', 'Net Banking', 'Card', 'NEFT/RTGS'].map(o => <option key={o} className="bg-card text-foreground">{o}</option>)}</>
                    ) : (
                      <>{['Cash', 'Cheque', 'Bank Transfer', 'Demand Draft'].map(o => <option key={o} className="bg-card text-foreground">{o}</option>)}</>
                    )}
                  </select>
                </div>

                {paymentForm.isOnline && (
                  <div>
                    <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2 block">Transaction / UTR Number *</label>
                    <div className="relative flex items-center bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50">
                      <Hash className="w-5 h-5 ml-4 text-blue-500 shrink-0" />
                      <input required={paymentForm.isOnline} type="text" value={paymentForm.transactionNumber}
                        onChange={e => setPaymentForm(p => ({ ...p, transactionNumber: e.target.value }))}
                        placeholder="e.g. TXN123456789" className="w-full bg-transparent px-3 py-3 outline-none font-mono font-bold text-foreground text-sm" />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Paying Amount (₹)</label>
                    <button type="button" onClick={() => setPaymentForm(p => ({ ...p, amountPaying: singleRemaining }))}
                      className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Pay Full
                    </button>
                  </div>
                  <input required type="number" min={1} max={singleRemaining} value={paymentForm.amountPaying}
                    onChange={e => setPaymentForm(p => ({ ...p, amountPaying: e.target.value }))}
                    className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 border border-black/5 dark:border-white/10 font-black text-2xl text-foreground" />
                  {parseFloat(paymentForm.amountPaying) > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`mt-2 flex justify-between px-4 py-2 rounded-xl text-sm font-bold ${singleAmountAfterPayment <= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                      <span>{singleAmountAfterPayment <= 0 ? '✓ Fully Cleared' : 'Remaining after:'}</span>
                      <span>{singleAmountAfterPayment <= 0 ? 'Balance = ₹0' : `₹${singleAmountAfterPayment.toLocaleString()}`}</span>
                    </motion.div>
                  )}
                </div>

                <button type="submit"
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-black shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform flex justify-center items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Confirm Payment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Collect Payments for Multiple Ledgers (Multi-Collect) */}
      <AnimatePresence>
        {isCollectModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-2xl rounded-3xl overflow-hidden premium-shadow border border-emerald-500/20">
              <div className="p-5 border-b border-emerald-500/10 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                <div>
                  <h2 className="text-xl font-black text-emerald-600 dark:text-emerald-400">Add Transaction / Collect Fees</h2>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    Student: {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                </div>
                <button onClick={() => setCollectModalOpen(false)} className="p-2 rounded-full hover:bg-black/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCollectSubmit} className="p-5 space-y-6">
                
                {/* List of unpaid invoices */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Unpaid Dues Breakdown</p>
                  {ledgersList.filter(l => l.status !== 'Paid').map(l => {
                    const remaining = (l.amountDue ?? 0) - (l.amountPaid ?? 0);
                    return (
                      <div key={l.id} className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/10 gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-sm truncate">{l.category?.name}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold">Billing date: {new Date(l.dueDate).toLocaleDateString()}</p>
                          <p className="text-[10px] text-muted-foreground">Due: ₹{remaining.toLocaleString()} (Billed: ₹{l.amountDue})</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-semibold">₹</span>
                          <input type="number" min={0} max={remaining}
                            value={collectPayments[l.id] !== undefined ? collectPayments[l.id] : ''}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setCollectPayments(prev => ({ ...prev, [l.id]: Math.min(val, remaining) }));
                            }}
                            className="w-20 px-2 py-1.5 bg-card rounded-xl border border-black/5 dark:border-white/10 outline-none font-black text-right text-sm text-foreground" />
                          <button type="button" onClick={() => setCollectPayments(prev => ({ ...prev, [l.id]: remaining }))}
                            className="text-[9px] font-bold text-blue-500 hover:underline">Full</button>
                          <button type="button" onClick={() => setCollectPayments(prev => ({ ...prev, [l.id]: 0 }))}
                            className="text-[9px] font-bold text-red-500 hover:underline">Clear</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Collected calculations summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl border border-emerald-500/10 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5">Total Collecting Now</p>
                    <p className="text-2xl font-black">₹{totalCollectingAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-amber-500/5 text-amber-600 dark:text-amber-400 p-4 rounded-2xl border border-amber-500/10 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5">Total Remaining Balance</p>
                    <p className="text-2xl font-black">₹{totalUnpaidRemaining.toLocaleString()}</p>
                  </div>
                </div>

                {/* Date Picker & Payment details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { online: false, icon: Banknote, label: 'Offline / Cash', activeClass: 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' },
                      { online: true, icon: Smartphone, label: 'Online / UPI', activeClass: 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' },
                    ].map(opt => (
                      <button type="button" key={String(opt.online)}
                        onClick={() => setCollectPaymentForm(p => ({ ...p, isOnline: opt.online }))}
                        className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${collectPaymentForm.isOnline === opt.online ? opt.activeClass : 'border-black/10 dark:border-white/10 text-muted-foreground hover:border-black/20'}`}>
                        <opt.icon className="w-5 h-5" />
                        <span className="font-bold text-xs">{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Collection Date</label>
                      <input type="date" value={collectPaymentForm.paymentDate}
                        onChange={e => setCollectPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-white/5 px-4 py-3.5 rounded-2xl border border-black/5 dark:border-white/10 font-bold text-sm text-foreground" />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">Payment Mode</label>
                      <select value={collectPaymentForm.paymentMode}
                        onChange={e => setCollectPaymentForm(p => ({ ...p, paymentMode: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-white/5 px-4 py-3.5 rounded-2xl border border-black/5 dark:border-white/10 outline-none font-bold text-sm appearance-none cursor-pointer text-foreground">
                        {collectPaymentForm.isOnline ? (
                          <>{['UPI', 'Net Banking', 'Card', 'NEFT/RTGS'].map(o => <option key={o} className="bg-card text-foreground">{o}</option>)}</>
                        ) : (
                          <>{['Cash', 'Cheque', 'Bank Transfer', 'Demand Draft'].map(o => <option key={o} className="bg-card text-foreground">{o}</option>)}</>
                        )}
                      </select>
                    </div>

                    {collectPaymentForm.isOnline ? (
                      <div>
                        <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 tracking-widest mb-1.5 block">Transaction / UTR *</label>
                        <div className="relative flex items-center bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50">
                          <Hash className="w-5 h-5 ml-4 text-blue-500 shrink-0" />
                          <input required={collectPaymentForm.isOnline} type="text" value={collectPaymentForm.transactionNumber}
                            onChange={e => setCollectPaymentForm(p => ({ ...p, transactionNumber: e.target.value }))}
                            placeholder="e.g. UTR Number" className="w-full bg-transparent px-3 py-3 outline-none font-mono font-bold text-sm text-foreground" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting || totalCollectingAmount <= 0}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform flex justify-center items-center gap-2 text-sm disabled:opacity-50 disabled:hover:scale-100">
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Recording...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> Confirm Receipt Collection of ₹{totalCollectingAmount.toLocaleString()}</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PhonePe Digital Receipt Details Voucher */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        noPadding={true}
        maxWidth="max-w-md"
      >
        {selectedReceipt && (
          <div id="print-receipt-modal" className="bg-card w-full rounded-[2.5rem] overflow-hidden premium-shadow relative">
              
              {/* Receipt Tear Graphic Top */}
              <div className="bg-emerald-600 dark:bg-emerald-500 text-white p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <button onClick={() => setSelectedReceipt(null)}
                  className="absolute right-4 top-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors no-print">
                  <X className="w-5 h-5" />
                </button>

                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30 shadow-lg">
                  <Check className="w-8 h-8 text-white stroke-[3.5]" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Payment Successful</h3>
                <p className="text-xs opacity-75 font-semibold mt-1">Receipt Issued on {new Date(selectedReceipt.paymentDate).toLocaleDateString()}</p>
                <div className="text-4xl font-extrabold mt-3">₹{selectedReceipt.amount.toLocaleString()}</div>
              </div>

              {/* Receipt Details Body */}
              <div className="p-8 space-y-6 text-sm text-left">
                {/* School Details */}
                <div className="text-center border-b border-black/5 dark:border-white/5 pb-4">
                  <h4 className="font-extrabold text-base uppercase text-foreground">
                    {schoolConfig?.schoolName || localStorage.getItem('gdl_school_name') || 'GDLLearning Academy'}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                    {schoolConfig?.schoolAddress || 'Varanasi, Uttar Pradesh'} 
                    {schoolConfig?.contactPhone ? ` • Contact: ${schoolConfig.contactPhone}` : ''}
                    {schoolConfig?.contactEmail ? ` • Email: ${schoolConfig.contactEmail}` : ''}
                  </p>
                </div>

                {/* Receipt Metadata Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-b border-black/5 dark:border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Receipt Number</span>
                    <span className="font-bold font-mono text-xs text-foreground">{selectedReceipt.receiptNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Transaction Date</span>
                    <span className="font-bold text-xs text-foreground">{new Date(selectedReceipt.paymentDate).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Student Name</span>
                    <span className="font-bold text-xs text-foreground uppercase">{selectedStudent.firstName} {selectedStudent.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Admission No</span>
                    <span className="font-bold text-xs text-foreground">{selectedStudent.admissionNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Class (Roll No)</span>
                    <span className="font-bold text-xs text-foreground">{studentClass?.name || 'N/A'} (Roll: {selectedStudent.rollNumber || 'N/A'})</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Father's Name</span>
                    <span className="font-bold text-xs text-foreground uppercase">{selectedStudent.parent?.fatherName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Contact Number</span>
                    <span className="font-bold text-xs text-foreground">{selectedStudent.mobileNumber || selectedStudent.parent?.primaryPhone || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Address</span>
                    <span className="font-bold text-xs text-foreground">{selectedStudent.address || selectedStudent.parent?.address || 'N/A'}</span>
                  </div>
                </div>

                {/* Breakdown */}
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Payment Details</span>
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl space-y-2 border border-black/5">
                    <div className="flex justify-between font-bold text-[10px] text-muted-foreground uppercase border-b border-black/5 pb-1">
                      <span>Fee Item</span>
                      <span>Billed Month</span>
                      <span>Amount</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="truncate">{selectedReceipt.categoryName}</span>
                      <span>{new Date(selectedReceipt.dueDate).toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                      <span className="font-bold">₹{selectedReceipt.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-black/5 pt-2 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      <span>Amount Paid</span>
                      <span>₹{selectedReceipt.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Mode & UTR */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Payment Method</span>
                    <span className="font-bold text-xs text-foreground mt-0.5 block">{selectedReceipt.paymentMode}</span>
                  </div>
                  <span className="text-2xl">
                    {selectedReceipt.paymentMode.toLowerCase().includes('online') || selectedReceipt.paymentMode.toLowerCase().includes('upi') ? '📱' : '💵'}
                  </span>
                </div>

                {/* Sign Stamp mock */}
                <div className="flex justify-between items-end pt-4 border-t border-dashed border-black/10 dark:border-white/10">
                  <div className="text-[10px] text-muted-foreground font-semibold">
                    * Computer Generated Receipt.<br />No Signature Required.
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 rounded-full flex items-center justify-center font-bold text-emerald-500/50 text-[9px] uppercase tracking-widest -rotate-12 border-double mx-auto mb-1">
                      PAID
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">Authorized Seal</span>
                  </div>
                </div>

                {/* Print button */}
                <div className="flex justify-center gap-2 pt-2 no-print">
                  <button onClick={() => setPrintReceiptData({ mode: 'single', receipt: selectedReceipt, student: selectedStudent, class: studentClass })}
                    className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:scale-105 transition-all">
                    <Printer className="w-4 h-4" /> Single Copy
                  </button>
                  <button onClick={() => setPrintReceiptData({ mode: 'duplicate', receipt: selectedReceipt, student: selectedStudent, class: studentClass })}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:scale-105 transition-all">
                    <Printer className="w-4 h-4" /> Duplicate (A4)
                  </button>
                  <button onClick={() => setSelectedReceipt(null)}
                    className="border border-black/10 dark:border-white/10 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-black/5 transition-colors">
                    Close
                  </button>
                </div>
              </div>
        </div>
        )}
      </Modal>
      {/* MODAL: Student Fee History Details */}
      <Modal
        isOpen={!!summaryDetailStudent}
        onClose={() => setSummaryDetailStudent(null)}
        noPadding={true}
        maxWidth="max-w-3xl"
      >
        {summaryDetailStudent && (() => {
          const stu = summaryDetailStudent;
          const stuLedgers = sessionLedgers.filter(l => l.studentId === stu.id);
          const stuReceipts = [];
          stuLedgers.forEach(l => {
            if (Array.isArray(l.receipts)) {
              l.receipts.forEach(r => {
                stuReceipts.push({
                  ...r,
                  categoryName: l.category?.name || feeCategories.find(c => c.id === l.feeCategoryId)?.name || 'Fee Category',
                  dueDate: l.dueDate
                });
              });
            }
          });
          stuReceipts.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

          return (
            <div className="bg-card w-full rounded-[2.5rem] overflow-hidden premium-shadow relative h-full flex flex-col">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-pink-500/10 flex justify-between items-center bg-gradient-to-r from-pink-500/10 to-rose-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-500 flex items-center justify-center font-black text-lg">
                      {stu.firstName[0]}{stu.lastName[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-pink-600 dark:text-pink-400">
                        Fee History &amp; Details
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5 font-bold">
                        {stu.firstName} {stu.lastName} • Class {stu.className} (Sec {stu.sectionName}) • Adm: {stu.admissionNumber}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSummaryDetailStudent(null)} className="p-2 rounded-full hover:bg-black/10 text-muted-foreground">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {/* Financial Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/10">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Total Billed</span>
                      <span className="text-lg font-black text-foreground mt-1 block">₹{stu.totalBilled.toLocaleString()}</span>
                    </div>
                    <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                      <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">Total Paid</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">₹{stu.totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
                      <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider block">Remaining Due</span>
                      <span className="text-lg font-black text-rose-500 mt-1 block">₹{stu.totalDue.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Invoices Detailed Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Invoiced Items Ledger</h3>
                    <div className="border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10 font-bold text-muted-foreground text-[10px] uppercase">
                            <th className="py-2.5 px-3.5">Due Date</th>
                            <th className="py-2.5 px-3.5">Fee Category</th>
                            <th className="py-2.5 px-3.5 text-right">Billed</th>
                            <th className="py-2.5 px-3.5 text-right">Paid</th>
                            <th className="py-2.5 px-3.5 text-right">Remaining</th>
                            <th className="py-2.5 px-3.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-foreground">
                          {stuLedgers.map(l => {
                            const remaining = (l.amountDue ?? 0) - (l.amountPaid ?? 0);
                            let statusColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
                            if (l.status === 'Paid') statusColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                            else if (l.status === 'Partial') statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';

                            return (
                              <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="py-2.5 px-3.5 text-muted-foreground">
                                  {new Date(l.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-2.5 px-3.5 font-bold">
                                  {l.category?.name || feeCategories.find(c => c.id === l.feeCategoryId)?.name || 'Fee Category'}
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-mono">₹{l.amountDue.toLocaleString()}</td>
                                <td className="py-2.5 px-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400">₹{l.amountPaid.toLocaleString()}</td>
                                <td className="py-2.5 px-3.5 text-right font-mono text-rose-500">₹{remaining.toLocaleString()}</td>
                                <td className="py-2.5 px-3.5 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] uppercase border ${statusColor}`}>
                                    {l.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {stuLedgers.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-muted-foreground">No invoices generated for this student.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Receipts Detailed Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Receipts / Payment Payouts</h3>
                    <div className="border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10 font-bold text-muted-foreground text-[10px] uppercase">
                            <th className="py-2.5 px-3.5">Payment Date</th>
                            <th className="py-2.5 px-3.5">Receipt No</th>
                            <th className="py-2.5 px-3.5">Fee Category</th>
                            <th className="py-2.5 px-3.5">Method</th>
                            <th className="py-2.5 px-3.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-foreground">
                          {stuReceipts.map(r => (
                            <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <td className="py-2.5 px-3.5 text-muted-foreground">
                                {new Date(r.paymentDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-2.5 px-3.5 font-mono text-[10px]">{r.receiptNumber}</td>
                              <td className="py-2.5 px-3.5">{r.categoryName}</td>
                              <td className="py-2.5 px-3.5 text-muted-foreground">{r.paymentMode}</td>
                              <td className="py-2.5 px-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">₹{r.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                          {stuReceipts.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-muted-foreground">No payment records found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-black/5 flex justify-end gap-3 bg-black/5 dark:bg-white/5">
                  <button onClick={() => setSummaryDetailStudent(null)} className="px-6 py-2.5 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-xl font-bold text-muted-foreground text-xs transition-colors">
                    Close History
                  </button>
                </div>
            </div>
          );
        })()}
      </Modal>

      {/* RECEIPT PRINT VIEW CONTAINER */}
      {printReceiptData && createPortal(
        <div className="print-view-container print-only-portal">
          <div className="print-page w-full max-w-4xl mx-auto bg-white text-black p-8 flex flex-col justify-start">
            <PrintableReceipt receipt={printReceiptData.receipt} student={printReceiptData.student} stuClass={printReceiptData.class} copyType={printReceiptData.mode === 'duplicate' ? "School Copy" : "Student Copy"} schoolConfig={schoolConfig} />
            
            {printReceiptData.mode === 'duplicate' && (
              <>
                <div className="w-full border-t-[3px] border-dashed border-gray-400 my-10 relative">
                   <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-4 text-xs font-bold text-gray-400 flex items-center gap-2 font-mono">✂️ Tear Here</div>
                </div>
                <PrintableReceipt receipt={printReceiptData.receipt} student={printReceiptData.student} stuClass={printReceiptData.class} copyType="Student Copy" schoolConfig={schoolConfig} />
              </>
            )}
          </div>
        </div>,
        document.body
      )}
      {/* STATEMENT PRINT VIEW CONTAINER */}
      {printStatementData && createPortal(
        <div className="print-view-container print-only-portal">
          <div className="print-page w-full max-w-4xl mx-auto bg-white text-black p-8 flex flex-col justify-start">
            <PrintableStatement
              stu={printStatementData.student}
              stuClass={printStatementData.class}
              activeSession={activeSession}
              stuLedgers={printStatementData.ledgers}
              totalDue={printStatementData.totalDue}
              totalPaid={printStatementData.totalPaid}
              remaining={printStatementData.remaining}
              copyType={printStatementData.mode === 'duplicate' ? "School Copy" : "Student Copy"}
              schoolConfig={schoolConfig}
            />
            {printStatementData.mode === 'duplicate' && (
              <>
                <div className="w-full border-t-[3px] border-dashed border-gray-400 my-10 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-4 text-xs font-bold text-gray-400 flex items-center gap-2 font-mono">✂️ Tear Here</div>
                </div>
                <PrintableStatement
                  stu={printStatementData.student}
                  stuClass={printStatementData.class}
                  activeSession={activeSession}
                  stuLedgers={printStatementData.ledgers}
                  totalDue={printStatementData.totalDue}
                  totalPaid={printStatementData.totalPaid}
                  remaining={printStatementData.remaining}
                  copyType="Student Copy"
                  schoolConfig={schoolConfig}
                />
              </>
            )}
          </div>
        </div>,
        document.body
      )}
      {/* Global Print Styles */}
      <style>{`
        .print-only-portal {
            display: none;
        }
        @media print {
          html, body {
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            background: white !important;
            color: black !important;
            visibility: visible !important;
          }
          #root, .no-print, header, nav, aside, footer {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
            visibility: hidden !important;
          }
          .print-only-portal, .print-only-portal * {
            visibility: visible !important;
          }
          .print-only-portal {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            z-index: 9999999 !important;
          }
          .print-page {
            page-break-after: always !important;
            break-after: always !important;
            margin: 0 !important;
            padding: 20px !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
