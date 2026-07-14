import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, Plus, X, CheckCircle2, Edit3, Search, Hash, User, Building, 
  Calendar, DollarSign, ArrowUpDown, Filter, ChevronLeft, ChevronRight,
  TrendingUp, Wallet, Coins, Percent, AlertCircle, Save, Printer, Banknote, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useGlobalContext } from '../../context/GlobalContext';

const apiBase = 'http://localhost:1422/api';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'];

const getMonthsInSession = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const list = [];
  
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  
  let limit = 0;
  while (current <= last && limit < 100) {
    list.push({
      month: current.getMonth() + 1,
      year: current.getFullYear(),
      label: current.toLocaleString('default', { month: 'long', year: 'numeric' })
    });
    current.setMonth(current.getMonth() + 1);
    limit++;
  }
  return list;
};

export default function PayrollModule() {
  const { settings } = useGlobalContext();

  const [activeTab, setActiveTab] = useState('Overview');
  const [employees, setEmployees] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionPeriods, setSessionPeriods] = useState([]);

  // Filters & Selected Month/Year
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Overview Filters
  const [overviewSearch, setOverviewSearch] = useState('');
  const [overviewDept, setOverviewDept] = useState('All');
  const [overviewStatus, setOverviewStatus] = useState('All');
  
  // Settings Tab Search & Filter
  const [settingsSearch, setSettingsSearch] = useState('');
  const [settingsDept, setSettingsDept] = useState('All');
  const [settingsPage, setSettingsPage] = useState(1);
  const settingsItemsPerPage = 6;

  // Process Tab Search & Filter
  const [processSearch, setProcessSearch] = useState('');
  const [processDept, setProcessDept] = useState('All');
  const [processStatus, setProcessStatus] = useState('All');

  // Edit Base Salary Modal
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryForm, setSalaryForm] = useState({ baseSalary: '', currency: '₹' });
  const [savingSalary, setSavingSalary] = useState(false);

  // Printable Payslip Modal
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Temporary local values for allowance/deduction inputs to prevent state lag
  const [localSlipEdits, setLocalSlipEdits] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'Overview' || activeTab === 'Process Payroll') {
      fetchPayslips();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch Academic Sessions
      const sessRes = await fetch(`${apiBase}/setup/sessions`);
      let activeSess = null;
      let periods = [];
      if (sessRes.ok) {
        const sessionsData = await sessRes.json();
        setSessions(sessionsData);
        activeSess = sessionsData.find(s => s.isActive);
        if (activeSess) {
          setActiveSession(activeSess);
          periods = getMonthsInSession(activeSess.startDate, activeSess.endDate);
          setSessionPeriods(periods);
        }
      }

      // Fetch Employees
      const empRes = await fetch(`${apiBase}/hr/employees`);
      if (empRes.ok) {
        setEmployees(await empRes.json());
      }

      // Set initial month/year based on periods
      if (periods.length > 0) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const hasCurrent = periods.find(p => p.month === currentMonth && p.year === currentYear);
        
        if (hasCurrent) {
          setSelectedMonth(currentMonth);
          setSelectedYear(currentYear);
        } else {
          setSelectedMonth(periods[0].month);
          setSelectedYear(periods[0].year);
        }
      }
    } catch (err) {
      console.error('Failed to fetch initial payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayslips = async () => {
    try {
      const res = await fetch(`${apiBase}/payroll/payslips?month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setPayslips(data);
        // Reset local edits
        const edits = {};
        data.forEach(p => {
          edits[p.id] = {
            allowances: p.allowances,
            deductions: p.deductions
          };
        });
        setLocalSlipEdits(edits);
      }
    } catch (err) {
      console.error('Failed to fetch payslips:', err);
    }
  };

  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setSavingSalary(true);
    try {
      const updatedData = {
        ...selectedEmployee,
        baseSalary: parseFloat(salaryForm.baseSalary || 0),
        currency: salaryForm.currency
      };
      const res = await fetch(`${apiBase}/hr/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setIsSalaryModalOpen(false);
        fetchInitialData();
      } else {
        alert('Failed to update salary configuration.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating salary settings.');
    } finally {
      setSavingSalary(false);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/payroll/payslips/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear })
      });
      if (res.ok) {
        const result = await res.json();
        await fetchPayslips();
        alert(`Payroll generated successfully! Created ${result.count} new payslips.`);
      } else {
        alert('Failed to generate payroll.');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating payroll records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSlipEdits = async (slipId) => {
    const edits = localSlipEdits[slipId];
    if (!edits) return;
    const slip = payslips.find(p => p.id === slipId);
    if (!slip) return;

    const basicPay = slip.basicPay;
    const allowances = parseFloat(edits.allowances ?? 0);
    const deductions = parseFloat(edits.deductions ?? 0);
    const netPay = basicPay + allowances - deductions;

    try {
      const res = await fetch(`${apiBase}/payroll/payslips/${slipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basicPay,
          allowances,
          deductions,
          netPay,
          status: slip.status
        })
      });
      if (res.ok) {
        fetchPayslips();
        alert('Payslip values updated successfully.');
      } else {
        alert('Failed to update payslip.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving payslip edits.');
    }
  };

  const handlePaySalary = async (slipId) => {
    const slip = payslips.find(p => p.id === slipId);
    if (!slip) return;
    try {
      const res = await fetch(`${apiBase}/payroll/payslips/${slipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...slip,
          status: 'Paid'
        })
      });
      if (res.ok) {
        fetchPayslips();
      } else {
        alert('Failed to record salary payout.');
      }
    } catch (err) {
      console.error(err);
      alert('Error recording payment.');
    }
  };

  const handlePayAll = async () => {
    if (!window.confirm(`Are you sure you want to mark all Unpaid generated salaries for ${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear} as PAID?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/payroll/payslips/pay-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear })
      });
      if (res.ok) {
        const result = await res.json();
        await fetchPayslips();
        alert(`Successfully marked ${result.count} payslips as Paid.`);
      } else {
        alert('Failed to execute bulk payout.');
      }
    } catch (err) {
      console.error(err);
      alert('Error executing bulk salary payouts.');
    } finally {
      setLoading(false);
    }
  };

  // --- Calculations for Overview ---
  const overviewTableData = useMemo(() => {
    return employees.map(emp => {
      const slip = payslips.find(p => p.employeeId === emp.id);
      if (slip) {
        return {
          id: emp.id,
          employeeId: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: emp.designation,
          department: emp.department,
          basicPay: slip.basicPay,
          allowances: slip.allowances,
          deductions: slip.deductions,
          netPay: slip.netPay,
          status: slip.status, // 'Paid' or 'Generated' (Unpaid/Pending)
          slipId: slip.id
        };
      } else {
        return {
          id: emp.id,
          employeeId: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: emp.designation,
          department: emp.department,
          basicPay: emp.baseSalary || 0,
          allowances: 0,
          deductions: 0,
          netPay: emp.baseSalary || 0,
          status: 'Not Generated',
          slipId: null
        };
      }
    });
  }, [employees, payslips]);

  const filteredOverviewData = useMemo(() => {
    let result = [...overviewTableData];
    if (overviewSearch) {
      const q = overviewSearch.toLowerCase();
      result = result.filter(x => 
        x.name.toLowerCase().includes(q) ||
        x.employeeId.toLowerCase().includes(q) ||
        x.role.toLowerCase().includes(q)
      );
    }
    if (overviewDept !== 'All') {
      result = result.filter(x => x.department === overviewDept);
    }
    if (overviewStatus !== 'All') {
      result = result.filter(x => x.status === overviewStatus);
    }
    return result;
  }, [overviewTableData, overviewSearch, overviewDept, overviewStatus]);

  const overviewMetrics = useMemo(() => {
    const totalStaff = employees.length;
    let totalCost = 0;
    let totalPaid = 0;
    let totalDues = 0;
    let totalNotGenerated = 0;

    employees.forEach(emp => {
      const slip = payslips.find(p => p.employeeId === emp.id);
      if (slip) {
        totalCost += slip.netPay;
        if (slip.status === 'Paid') {
          totalPaid += slip.netPay;
        } else {
          totalDues += slip.netPay;
        }
      } else {
        const estPay = emp.baseSalary || 0;
        totalCost += estPay;
        totalNotGenerated += estPay;
      }
    });

    const paidRate = totalCost > 0 ? Math.round((totalPaid / totalCost) * 100) : 0;
    return { totalStaff, totalCost, totalPaid, totalDues, totalNotGenerated, paidRate };
  }, [employees, payslips]);

  const disbursementPieData = useMemo(() => {
    const paidCount = overviewTableData.filter(x => x.status === 'Paid').length;
    const pendingCount = overviewTableData.filter(x => x.status === 'Generated').length;
    const notGenCount = overviewTableData.filter(x => x.status === 'Not Generated').length;

    return [
      { 
        name: 'Paid', 
        value: overviewMetrics.totalPaid, 
        count: paidCount, 
        color: '#10b981' 
      },
      { 
        name: 'Pending', 
        value: overviewMetrics.totalDues, 
        count: pendingCount, 
        color: '#f59e0b' 
      },
      { 
        name: 'Unprocessed', 
        value: overviewMetrics.totalNotGenerated, 
        count: notGenCount, 
        color: '#94a3b8' 
      }
    ].filter(item => item.value > 0 || item.count > 0);
  }, [overviewMetrics, overviewTableData]);

  const monthlyBarData = useMemo(() => {
    const data = [];
    const baseVal = employees.reduce((sum, emp) => sum + (emp.baseSalary || 0), 0);

    // For the selected month — use actual payslip breakdown
    const selectedPaid = payslips.filter(s => s.status === 'Paid').reduce((sum, s) => sum + s.netPay, 0);
    const selectedPending = payslips.filter(s => s.status === 'Generated').reduce((sum, s) => sum + s.netPay, 0);
    const selectedNotGen = employees
      .filter(emp => !payslips.find(p => p.employeeId === emp.id))
      .reduce((sum, emp) => sum + (emp.baseSalary || 0), 0);
    const selectedTotal = selectedPaid + selectedPending + selectedNotGen;

    if (sessionPeriods.length > 0) {
      const selectedIndex = sessionPeriods.findIndex(p => p.month === selectedMonth && p.year === selectedYear);
      const startIdx = Math.max(0, Math.min(selectedIndex - 2, sessionPeriods.length - 6));
      const activeSlice = sessionPeriods.slice(startIdx, startIdx + 6);

      activeSlice.forEach(p => {
        const isSelected = p.month === selectedMonth && p.year === selectedYear;
        const label = p.label.split(' ')[0].substring(0, 3) + ' ' + String(p.year).substring(2);

        if (isSelected) {
          data.push({
            name: label,
            'Total Expense': Math.round(selectedTotal),
            'Paid': Math.round(selectedPaid),
            'Pending': Math.round(selectedPending + selectedNotGen),
            isSelected: true
          });
        } else {
          // Estimate only — no payslip data for other months
          const estTotal = Math.round(baseVal * (0.93 + Math.abs(Math.sin(p.month * 1.3)) * 0.07));
          data.push({
            name: label,
            'Total Expense': estTotal,
            'Paid': 0,
            'Pending': 0,
            isSelected: false
          });
        }
      });
    } else {
      const current = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
        const mLabel = d.toLocaleString('default', { month: 'short' });
        const isSelectedMonth = (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
        if (isSelectedMonth) {
          data.push({
            name: mLabel,
            'Total Expense': Math.round(selectedTotal),
            'Paid': Math.round(selectedPaid),
            'Pending': Math.round(selectedPending + selectedNotGen),
            isSelected: true
          });
        } else {
          const estTotal = Math.round(baseVal * (0.9 + Math.abs(Math.sin(i * 1.7)) * 0.1));
          data.push({ name: mLabel, 'Total Expense': estTotal, 'Paid': 0, 'Pending': 0, isSelected: false });
        }
      }
    }
    return data;
  }, [selectedMonth, selectedYear, payslips, employees, sessionPeriods]);

  // --- Filtering / Sorting for Settings Tab ---
  const filteredEmployees = useMemo(() => {
    let result = [...employees];
    if (settingsSearch) {
      const q = settingsSearch.toLowerCase();
      result = result.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q)
      );
    }
    if (settingsDept !== 'All') {
      result = result.filter(emp => emp.department === settingsDept);
    }
    return result;
  }, [employees, settingsSearch, settingsDept]);

  const totalSettingsPages = Math.ceil(filteredEmployees.length / settingsItemsPerPage) || 1;
  const currentSettingsEmployees = useMemo(() => {
    const start = (settingsPage - 1) * settingsItemsPerPage;
    return filteredEmployees.slice(start, start + settingsItemsPerPage);
  }, [filteredEmployees, settingsPage]);

  useEffect(() => {
    setSettingsPage(1);
  }, [settingsSearch, settingsDept]);

  // --- Filtering / Sorting for Monthly Processing Tab ---
  const filteredPayslips = useMemo(() => {
    let result = [...payslips];
    if (processSearch) {
      const q = processSearch.toLowerCase();
      result = result.filter(p => 
        `${p.employee?.firstName} ${p.employee?.lastName}`.toLowerCase().includes(q) ||
        p.employee?.employeeId.toLowerCase().includes(q) ||
        p.employee?.designation.toLowerCase().includes(q)
      );
    }
    if (processDept !== 'All') {
      result = result.filter(p => p.employee?.department === processDept);
    }
    if (processStatus !== 'All') {
      result = result.filter(p => p.status === processStatus);
    }
    return result;
  }, [payslips, processSearch, processDept, processStatus]);

  // --- Formatting Helpers ---
  const formatAmount = (val) => {
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const handlePrintPayslip = (slip) => {
    setSelectedPayslip(slip);
  };

  const executePrint = () => {
    const printContent = document.getElementById('payslip-print-section').innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Open print window
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Payslip Print</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { font-family: sans-serif; background: #white; color: #000; padding: 20px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="max-w-3xl mx-auto border-2 border-black/10 p-8 rounded-3xl bg-white shadow-sm mt-10">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  if (loading && employees.length === 0) {
    return (
      <div className="py-40 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-bold text-sm">Syncing staff ledger & payroll indices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full overflow-auto pb-20 w-full text-left px-2">
      
      {/* Header */}
      <div className="w-full text-left mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-indigo-600 text-left inline-block">Staff Payroll & Salary Setup</h1>
        <p className="text-muted-foreground mt-2 text-lg text-left">Manage base salaries, calculate allowances/deductions, and process monthly bank payments.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 pt-4 px-1 custom-scrollbar w-full snap-x">
        {[
          { id: 'Overview', label: 'Overview', icon: TrendingUp, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)]', border: 'border-blue-500', text: 'text-blue-500', iconBg: 'bg-blue-500/10' },
          { id: 'Salary Settings', label: 'Salary Settings', icon: Wallet, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]', border: 'border-emerald-500', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
          { id: 'Process Payroll', label: 'Process Payroll', icon: Banknote, color: 'from-orange-500 to-rose-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)]', border: 'border-orange-500', text: 'text-orange-500', iconBg: 'bg-orange-500/10' }
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

      {/* Overview Dashboard Tab */}
      {activeTab === 'Overview' && (
        <div className="space-y-8">
          {/* Filters Bar */}
          <div className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center gap-4 justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
            <h4 className="font-extrabold text-foreground relative z-10">Payroll Period Selection</h4>
            <div className="flex gap-4 relative z-10">
              {sessionPeriods.length > 0 ? (
                <select
                  value={`${selectedMonth}-${selectedYear}`}
                  onChange={e => {
                    const [m, y] = e.target.value.split('-');
                    setSelectedMonth(parseInt(m));
                    setSelectedYear(parseInt(y));
                  }}
                  className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-500/20 text-foreground font-bold cursor-pointer"
                >
                  {sessionPeriods.map(p => (
                    <option key={`${p.month}-${p.year}`} value={`${p.month}-${p.year}`}>{p.label}</option>
                  ))}
                </select>
              ) : (
                <>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(parseInt(e.target.value))}
                    className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-500/20 text-foreground font-bold cursor-pointer"
                  >
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                    className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-500/20 text-foreground font-bold cursor-pointer"
                  >
                    {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </>
              )}
            </div>
          </div>
 
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-[2rem] border border-black/5 dark:border-white/5 premium-shadow hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs mb-2">Total Staff</p>
                  <h3 className="text-3xl font-extrabold text-foreground">{overviewMetrics.totalStaff}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><Briefcase className="w-6 h-6"/></div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-medium">Active payroll profiles configured</p>
            </div>
 
            <div className="glass-panel p-6 rounded-[2rem] border border-black/5 dark:border-white/5 premium-shadow hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs mb-2">Total Payroll</p>
                  <h3 className="text-3xl font-extrabold text-foreground">{formatAmount(overviewMetrics.totalCost)}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"><Wallet className="w-6 h-6"/></div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-medium">Billed for period {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
            </div>
 
            <div className="glass-panel p-6 rounded-[2rem] border border-black/5 dark:border-white/5 premium-shadow hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs mb-2">Paid Salaries</p>
                  <h3 className="text-3xl font-extrabold text-foreground">{formatAmount(overviewMetrics.totalPaid)}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Coins className="w-6 h-6"/></div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">{overviewMetrics.paidRate}% disbursed</span>
              </div>
            </div>
 
            <div className="glass-panel p-6 rounded-[2rem] border border-black/5 dark:border-white/5 premium-shadow hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs mb-2">Outstanding & Dues</p>
                  <h3 className="text-3xl font-extrabold text-foreground">{formatAmount(overviewMetrics.totalDues + overviewMetrics.totalNotGenerated)}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center"><AlertCircle className="w-6 h-6"/></div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-medium">
                {formatAmount(overviewMetrics.totalDues)} Pending | {formatAmount(overviewMetrics.totalNotGenerated)} Unprocessed
              </p>
            </div>
          </div>
 
          {/* Visual Analytics Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
            {/* Trend Bar Chart */}
            <div className="lg:col-span-2 glass-panel rounded-[2rem] p-8 flex flex-col border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Payroll Expenses Trend</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Selected month shows live breakdown · other months show total estimate</p>
                </div>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mb-4 relative z-10">
                {[
                  { color: '#6366f1', label: 'Total Expense' },
                  { color: '#10b981', label: 'Paid' },
                  { color: '#f59e0b', label: 'Remaining (Pending + Unprocessed)' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 w-full relative z-10 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyBarData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }} barCategoryGap="30%" barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }} tickFormatter={val => val >= 100000 ? `₹${(val/100000).toFixed(1)}L` : val >= 1000 ? `₹${(val/1000).toFixed(0)}K` : `₹${val}`} dx={-8} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 8 }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const isSelectedPeriod = monthlyBarData.find(d => d.name === label)?.isSelected;
                        return (
                          <div className="glass-panel p-4 rounded-2xl border border-black/10 dark:border-white/10 text-xs shadow-xl min-w-[180px]">
                            <p className="font-extrabold text-foreground mb-2.5 flex items-center gap-1.5">
                              {label}
                              {isSelectedPeriod && <span className="bg-indigo-500/15 text-indigo-500 text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">Live</span>}
                            </p>
                            {payload.map((entry, i) => (
                              <div key={i} className="flex items-center justify-between gap-4 mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-sm" style={{ background: entry.fill }} />
                                  <span className="text-muted-foreground">{entry.name}</span>
                                </div>
                                <span className="font-bold text-foreground font-mono">
                                  {entry.value > 0 ? `₹${Number(entry.value).toLocaleString('en-IN')}` : isSelectedPeriod ? '₹0' : '—'}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="Total Expense" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={18} />
                    <Bar dataKey="Paid" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
                    <Bar dataKey="Pending" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
 
            {/* Disbursement Donut Chart */}
            <div className="glass-panel rounded-[2rem] p-8 flex flex-col border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <h3 className="text-xl font-bold mb-2 text-foreground relative z-10">Disbursement Status</h3>
              <p className="text-sm text-muted-foreground relative z-10 mb-6 font-medium">Monthly payout share distribution</p>
              
              <div className="flex-1 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-1/2 h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={disbursementPieData} 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={4} 
                        dataKey="value" 
                        stroke="none"
                      >
                        {disbursementPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatAmount(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center text showing summary */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                    <span className="text-2xl font-extrabold text-foreground">
                      {Math.round(overviewMetrics.paidRate)}%
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Disbursed</span>
                  </div>
                </div>
                
                {/* Custom Legend */}
                <div className="w-full sm:w-1/2 space-y-3 text-xs">
                  {disbursementPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="font-bold text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.count} Staff</p>
                        </div>
                      </div>
                      <p className="font-mono font-bold text-foreground text-right">{formatAmount(item.value)}</p>
                    </div>
                  ))}
                  {disbursementPieData.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No payroll data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Employee Payout Summary Roll */}
          <div className="relative glass-panel p-1 rounded-[2.5rem] group overflow-hidden shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-indigo-500/5 blur-3xl opacity-50 pointer-events-none" />
            
            <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-black/5 dark:border-white/5">
                <div>
                  <h4 className="font-extrabold text-foreground text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" /> Employee Payout Summary Roll
                  </h4>
                  <p className="text-muted-foreground text-xs mt-1">Detailed list of employee salaries and payment statuses for the selected month.</p>
                </div>
                <div className="text-xs bg-black/5 dark:bg-white/5 px-4 py-2 rounded-2xl font-bold text-muted-foreground">
                  Total Staff: <span className="text-foreground font-extrabold">{overviewMetrics.totalStaff}</span>
                </div>
              </div>

              {/* Table Filters */}
              <div className="relative mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group/search">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search staff by name, ID, or designation..." 
                    value={overviewSearch}
                    onChange={e => setOverviewSearch(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-emerald-500/50 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-4 focus:ring-emerald-500/20 text-foreground transition-all font-medium text-sm"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <select 
                    value={overviewDept}
                    onChange={(e) => setOverviewDept(e.target.value)}
                    className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 outline-none text-foreground font-bold cursor-pointer text-xs"
                  >
                    <option value="All">All Departments</option>
                    <option value="Teaching">Teaching</option>
                    <option value="Administration">Administration</option>
                    <option value="Finance">Finance</option>
                    <option value="Transport">Transport</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>

                  <select 
                    value={overviewStatus}
                    onChange={(e) => setOverviewStatus(e.target.value)}
                    className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 outline-none text-foreground font-bold cursor-pointer text-xs"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Generated">Pending Payout</option>
                    <option value="Not Generated">Not Generated</option>
                  </select>
                </div>
              </div>

              {/* Table List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      <th className="py-4 px-4">Staff Member</th>
                      <th className="py-4 px-4">Role / Department</th>
                      <th className="py-4 px-4 text-right">Base Salary</th>
                      <th className="py-4 px-4 text-center">Allowances (+)</th>
                      <th className="py-4 px-4 text-center">Deductions (-)</th>
                      <th className="py-4 px-4 text-right">Net Payout</th>
                      <th className="py-4 px-4 text-center">Payment Status</th>
                      <th className="py-4 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm font-semibold">
                    {filteredOverviewData.map(row => {
                      return (
                        <tr key={row.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                                {row.firstName[0]}{row.lastName[0]}
                              </div>
                              <div>
                                <p className="font-bold text-foreground">{row.name}</p>
                                <span className="text-[9px] font-mono text-muted-foreground bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">{row.employeeId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs">
                            <p className="font-bold text-foreground">{row.role}</p>
                            <p className="text-muted-foreground">{row.department}</p>
                          </td>
                          <td className="py-4 px-4 text-right font-mono text-foreground">
                            {formatAmount(row.basicPay)}
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-emerald-500">
                            {row.status === 'Not Generated' ? '—' : `+${formatAmount(row.allowances)}`}
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-red-500">
                            {row.status === 'Not Generated' ? '—' : `-${formatAmount(row.deductions)}`}
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-black text-foreground">
                            {formatAmount(row.netPay)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {row.status === 'Paid' ? (
                              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold inline-block">
                                Paid
                              </span>
                            ) : row.status === 'Generated' ? (
                              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold inline-block">
                                Pending Payout
                              </span>
                            ) : (
                              <span className="bg-slate-500/10 text-slate-500 border border-slate-500/20 px-3 py-1 rounded-full text-xs font-bold inline-block">
                                Not Generated
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {row.status === 'Not Generated' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      setLoading(true);
                                      const res = await fetch(`${apiBase}/payroll/payslips/generate`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ month: selectedMonth, year: selectedYear })
                                      });
                                      if (res.ok) {
                                        await fetchPayslips();
                                        alert('Payslip generated successfully for this period.');
                                      } else {
                                        alert('Failed to generate payslip.');
                                      }
                                    } catch (err) {
                                      console.error(err);
                                      alert('Error generating payslip.');
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-md shadow-indigo-500/20"
                                >
                                  Generate
                                </button>
                              )}
                              {row.status === 'Generated' && (
                                <>
                                  <button
                                    onClick={() => handlePaySalary(row.slipId)}
                                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg hover:scale-105 transition-all shadow-md shadow-emerald-500/20"
                                    title="Mark Paid"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handlePrintPayslip(payslips.find(p => p.id === row.slipId))}
                                    className="p-1.5 bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                    title="Print Slip"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {row.status === 'Paid' && (
                                <button
                                  onClick={() => handlePrintPayslip(payslips.find(p => p.id === row.slipId))}
                                  className="p-1.5 bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                  title="Print Slip"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOverviewData.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-muted-foreground font-bold">
                          No employees matching the search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Salary Settings Tab */}
      {activeTab === 'Salary Settings' && (
        <div className="relative glass-panel p-1 rounded-[2.5rem] group overflow-hidden shadow-xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/10 blur-3xl opacity-50 pointer-events-none" />
          
          <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
            <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs border-b border-black/5 dark:border-white/5 pb-4 mb-8 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-500" /> Employee Salary Configuration
            </h4>

            {/* Filter Search Bar */}
            <div className="relative mb-8 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group/search">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-emerald-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search staff by name, ID, or designation..." 
                  value={settingsSearch}
                  onChange={e => setSettingsSearch(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-emerald-500/50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-emerald-500/20 text-foreground transition-all font-medium"
                />
              </div>

              <div className="relative min-w-[180px] flex items-center bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-emerald-500/50 transition-all focus-within:ring-4 focus-within:ring-emerald-500/20">
                <Filter className="w-4 h-4 absolute left-4 text-muted-foreground pointer-events-none" />
                <select 
                  value={settingsDept}
                  onChange={(e) => setSettingsDept(e.target.value)}
                  className="w-full bg-transparent pl-10 pr-2 py-4 outline-none text-foreground font-bold appearance-none cursor-pointer flex-1"
                >
                  <option value="All">All Departments</option>
                  <option value="Teaching">Teaching</option>
                  <option value="Administration">Administration</option>
                  <option value="Finance">Finance</option>
                  <option value="Transport">Transport</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>
            </div>

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSettingsEmployees.map(emp => (
                <div key={emp.id} className="group relative overflow-hidden rounded-3xl bg-card border border-black/5 dark:border-white/10 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-foreground text-md">{emp.firstName} {emp.lastName}</h4>
                          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md mt-1 inline-block">{emp.employeeId}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setSalaryForm({ baseSalary: emp.baseSalary || 0, currency: emp.currency || '₹' });
                          setIsSalaryModalOpen(true);
                        }}
                        className="p-2 bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-emerald-500 rounded-xl transition-all"
                      >
                        <Edit3 className="w-4 h-4"/>
                      </button>
                    </div>

                    <div className="space-y-2 mt-4 text-xs font-semibold text-muted-foreground">
                      <div className="flex justify-between"><span className="opacity-60">Department</span><span className="text-foreground">{emp.department}</span></div>
                      <div className="flex justify-between"><span className="opacity-60">Designation</span><span className="text-foreground">{emp.designation}</span></div>
                      <div className="flex justify-between"><span className="opacity-60">Join Date</span><span className="text-foreground">{new Date(emp.joinDate).toLocaleDateString()}</span></div>
                    </div>
                  </div>

                  <div className="border-t border-black/5 dark:border-white/5 pt-4 mt-6 flex justify-between items-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Configured Base</span>
                    <span className="font-extrabold text-emerald-500 text-lg">{emp.currency || '₹'} {Number(emp.baseSalary || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalSettingsPages > 1 && (
              <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">
                  Showing <span className="font-bold text-foreground">{(settingsPage - 1) * settingsItemsPerPage + 1}</span> to <span className="font-bold text-foreground">{Math.min(settingsPage * settingsItemsPerPage, filteredEmployees.length)}</span> of <span className="font-bold text-foreground">{filteredEmployees.length}</span> staff
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={settingsPage === 1}
                    onClick={() => setSettingsPage(p => Math.max(1, p - 1))}
                    className="p-2 border border-black/5 dark:border-white/5 bg-card hover:bg-black/5 rounded-xl disabled:opacity-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                  <button
                    disabled={settingsPage === totalSettingsPages}
                    onClick={() => setSettingsPage(p => Math.min(totalSettingsPages, p + 1))}
                    className="p-2 border border-black/5 dark:border-white/5 bg-card hover:bg-black/5 rounded-xl disabled:opacity-50 transition-all"
                  >
                    <ChevronRight className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Process Payroll Registry Tab */}
      {activeTab === 'Process Payroll' && (
        <div className="space-y-6">
          
          {/* Period Selector Panel & Bulk Actions */}
          <div className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
            <div className="flex flex-col sm:flex-row gap-4 items-center relative z-10 w-full md:w-auto">
              <h4 className="font-extrabold text-foreground shrink-0">Processing Period:</h4>
              <div className="flex gap-3 w-full sm:w-auto">
                {sessionPeriods.length > 0 ? (
                  <select
                    value={`${selectedMonth}-${selectedYear}`}
                    onChange={e => {
                      const [m, y] = e.target.value.split('-');
                      setSelectedMonth(parseInt(m));
                      setSelectedYear(parseInt(y));
                    }}
                    className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3.5 outline-none text-foreground font-bold cursor-pointer flex-1 sm:flex-initial"
                  >
                    {sessionPeriods.map(p => (
                      <option key={`${p.month}-${p.year}`} value={`${p.month}-${p.year}`}>{p.label}</option>
                    ))}
                  </select>
                ) : (
                  <>
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(parseInt(e.target.value))}
                      className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 outline-none text-foreground font-bold cursor-pointer flex-1 sm:flex-initial"
                    >
                      {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={e => setSelectedYear(parseInt(e.target.value))}
                      className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 outline-none text-foreground font-bold cursor-pointer flex-1 sm:flex-initial"
                    >
                      {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-end relative z-10">
              {payslips.length > 0 && payslips.some(p => p.status === 'Generated') && (
                <button
                  onClick={handlePayAll}
                  className="bg-gradient-to-r from-emerald-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2.5 hover:scale-105 transition-all premium-shadow"
                >
                  <Banknote className="w-4 h-4"/> Mark All as Paid
                </button>
              )}
              {payslips.length === 0 && (
                <button
                  onClick={handleGeneratePayroll}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2.5 hover:scale-105 transition-all premium-shadow shadow-indigo-500/20"
                >
                  <Calendar className="w-4 h-4" /> Run Payroll Generator
                </button>
              )}
            </div>
          </div>

          {/* Registry Sheet */}
          {payslips.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-[2.5rem] border border-black/5 dark:border-white/5 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center"><AlertCircle className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-foreground">No Payroll Records for this Period</h3>
              <p className="text-muted-foreground text-sm max-w-sm">Salaries have not been generated yet for {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}.</p>
              <button 
                onClick={handleGeneratePayroll} 
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold transition-all premium-shadow mt-4"
              >
                Generate Monthly Payslips
              </button>
            </div>
          ) : (
            <div className="relative glass-panel p-1 rounded-[2.5rem] group overflow-hidden shadow-xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 blur-3xl opacity-50 pointer-events-none" />
              
              <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
                {/* Internal Filters */}
                <div className="relative mb-8 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 group/search">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Filter by name, designation, or ID..." 
                      value={processSearch}
                      onChange={e => setProcessSearch(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-indigo-500/50 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/20 text-foreground transition-all font-medium"
                    />
                  </div>

                  <div className="flex gap-4">
                    <select 
                      value={processDept}
                      onChange={(e) => setProcessDept(e.target.value)}
                      className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3.5 outline-none text-foreground font-bold cursor-pointer"
                    >
                      <option value="All">All Departments</option>
                      <option value="Teaching">Teaching</option>
                      <option value="Administration">Administration</option>
                      <option value="Finance">Finance</option>
                      <option value="Transport">Transport</option>
                      <option value="Support Staff">Support Staff</option>
                    </select>

                    <select 
                      value={processStatus}
                      onChange={(e) => setProcessStatus(e.target.value)}
                      className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3.5 outline-none text-foreground font-bold cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Generated">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <th className="py-4 px-4">Staff Member</th>
                        <th className="py-4 px-4">Dept / Desig</th>
                        <th className="py-4 px-4 text-right">Basic Pay</th>
                        <th className="py-4 px-4 text-center">Allowances (+)</th>
                        <th className="py-4 px-4 text-center">Deductions (-)</th>
                        <th className="py-4 px-4 text-right">Net Payout</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm font-semibold">
                      {filteredPayslips.map(slip => {
                        const edits = localSlipEdits[slip.id] || { allowances: slip.allowances, deductions: slip.deductions };
                        const allowances = parseFloat(edits.allowances ?? 0);
                        const deductions = parseFloat(edits.deductions ?? 0);
                        const netPay = slip.basicPay + allowances - deductions;

                        const hasChanges = allowances !== slip.allowances || deductions !== slip.deductions;
                        const isPaid = slip.status === 'Paid';

                        return (
                          <tr key={slip.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                                  {slip.employee?.firstName[0]}{slip.employee?.lastName[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-foreground">{slip.employee?.firstName} {slip.employee?.lastName}</p>
                                  <span className="text-[10px] font-mono text-muted-foreground bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">{slip.employee?.employeeId}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-xs">
                              <p className="font-bold text-foreground">{slip.employee?.designation}</p>
                              <p className="text-muted-foreground">{slip.employee?.department}</p>
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-bold text-foreground">
                              {formatAmount(slip.basicPay)}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="inline-flex items-center bg-black/5 dark:bg-white/5 rounded-xl border border-transparent focus-within:border-emerald-500/30 w-24">
                                <span className="pl-2.5 text-xs text-muted-foreground font-bold">₹</span>
                                <input
                                  type="number"
                                  disabled={isPaid}
                                  value={edits.allowances}
                                  onChange={e => setLocalSlipEdits(prev => ({
                                    ...prev,
                                    [slip.id]: { ...prev[slip.id], allowances: e.target.value }
                                  }))}
                                  className="w-full bg-transparent border-none outline-none py-2 px-1 font-mono font-bold text-center text-foreground disabled:opacity-60"
                                />
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="inline-flex items-center bg-black/5 dark:bg-white/5 rounded-xl border border-transparent focus-within:border-red-500/30 w-24">
                                <span className="pl-2.5 text-xs text-muted-foreground font-bold">₹</span>
                                <input
                                  type="number"
                                  disabled={isPaid}
                                  value={edits.deductions}
                                  onChange={e => setLocalSlipEdits(prev => ({
                                    ...prev,
                                    [slip.id]: { ...prev[slip.id], deductions: e.target.value }
                                  }))}
                                  className="w-full bg-transparent border-none outline-none py-2 px-1 font-mono font-bold text-center text-foreground disabled:opacity-60"
                                />
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-black text-foreground">
                              {formatAmount(netPay)}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {isPaid ? (
                                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold inline-block">
                                  Paid
                                </span>
                              ) : (
                                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold inline-block">
                                  Unpaid
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {!isPaid && (
                                  <>
                                    <button
                                      disabled={!hasChanges}
                                      onClick={() => handleSaveSlipEdits(slip.id)}
                                      className={`p-2 rounded-xl transition-all ${
                                        hasChanges 
                                          ? 'bg-emerald-500 text-white hover:scale-105 shadow-md shadow-emerald-500/20' 
                                          : 'bg-black/5 dark:bg-white/5 text-muted-foreground cursor-not-allowed opacity-50'
                                      }`}
                                      title="Save adjustments"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handlePaySalary(slip.id)}
                                      className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl hover:scale-105 transition-all shadow-md shadow-indigo-500/20"
                                      title="Record payout"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handlePrintPayslip(slip)}
                                  className="p-2 bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground rounded-xl transition-colors"
                                  title="Print payslip"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Salary Modal */}
      <AnimatePresence>
        {isSalaryModalOpen && selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md overflow-hidden rounded-[2.5rem] premium-shadow border border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Configure Salary Settings</h3>
                  <p className="text-muted-foreground text-xs mt-1">Set monthly basic pay details.</p>
                </div>
                <button onClick={() => setIsSalaryModalOpen(false)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <form onSubmit={handleUpdateSalary} className="p-6 space-y-6 text-left">
                <div className="space-y-4">
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                      {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                      <p className="text-xs text-muted-foreground font-semibold">{selectedEmployee.designation} • {selectedEmployee.department}</p>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-emerald-500 transition-colors">Base Salary (Monthly) *</label>
                    <div className="relative flex rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-emerald-500/20 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-emerald-500/50 transition-all">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors pointer-events-none z-10"><DollarSign className="w-5 h-5"/></div>
                      <select 
                        value={salaryForm.currency} 
                        onChange={e => setSalaryForm({...salaryForm, currency: e.target.value})}
                        className="w-24 shrink-0 pl-11 pr-2 py-3 bg-transparent outline-none font-bold text-foreground border-r border-black/10 dark:border-white/10 appearance-none cursor-pointer text-xs"
                      >
                        <option value="₹">₹ INR</option>
                        <option value="$">$ USD</option>
                        <option value="€">€ EUR</option>
                        <option value="£">£ GBP</option>
                        <option value="د.إ">د.إ AED</option>
                      </select>
                      <input 
                        required
                        type="number" 
                        placeholder="e.g. 50000"
                        value={salaryForm.baseSalary} 
                        onChange={e => setSalaryForm({...salaryForm, baseSalary: e.target.value})} 
                        className="flex-1 w-full pl-4 pr-5 py-3 bg-transparent outline-none text-foreground font-bold" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-black/5 dark:border-white/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsSalaryModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={savingSalary} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 premium-shadow hover:scale-105 transition-all disabled:opacity-50">
                    {savingSalary ? 'Saving...' : 'Update Settings'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Printable Payslip Modal */}
      <AnimatePresence>
        {selectedPayslip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-2xl overflow-y-auto rounded-[2.5rem] premium-shadow border border-white/10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-xl">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Print Salary Slip</h3>
                  <p className="text-muted-foreground text-xs mt-1">Review printable format.</p>
                </div>
                <button onClick={() => setSelectedPayslip(null)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              {/* Printable Area */}
              <div className="p-8 overflow-y-auto flex-1 text-foreground" id="payslip-print-section">
                
                {/* School Header */}
                <div className="text-center pb-6 border-b-2 border-black/10 dark:border-white/10">
                  <h2 className="text-2xl font-black tracking-tight">{settings.schoolName}</h2>
                  {settings.schoolAddress && <p className="text-xs text-muted-foreground mt-1 font-medium">{settings.schoolAddress}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">Contact: {settings.contactPhone || 'N/A'} | Email: {settings.contactEmail || 'N/A'}</p>
                  <div className="bg-black/5 dark:bg-white/5 py-1.5 px-4 rounded-xl inline-block mt-4 text-xs font-black uppercase tracking-wider text-indigo-500">
                    Salary Slip — {MONTHS.find(m => m.value === selectedPayslip.month)?.label} {selectedPayslip.year}
                  </div>
                </div>

                {/* Employee Info Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 py-6 border-b border-black/5 dark:border-white/5 text-xs">
                  <div>
                    <p className="font-semibold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Employee Name</p>
                    <p className="font-extrabold text-sm">{selectedPayslip.employee?.firstName} {selectedPayslip.employee?.lastName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Employee ID</p>
                    <p className="font-mono font-bold text-sm">{selectedPayslip.employee?.employeeId}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Department</p>
                    <p className="font-bold">{selectedPayslip.employee?.department}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Designation</p>
                    <p className="font-bold">{selectedPayslip.employee?.designation}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Join Date</p>
                    <p className="font-bold">{new Date(selectedPayslip.employee?.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Payment Status</p>
                    <p className="font-bold uppercase text-emerald-500">{selectedPayslip.status}</p>
                  </div>
                </div>

                {/* Earnings & Deductions Table */}
                <div className="grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 py-6 border-b border-black/5 dark:border-white/5 text-xs gap-6">
                  {/* Earnings */}
                  <div className="space-y-4 pr-3">
                    <h5 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest pb-2 border-b border-black/5">Earnings</h5>
                    <div className="flex justify-between font-semibold"><span className="opacity-70">Basic Salary</span><span className="font-mono">{formatAmount(selectedPayslip.basicPay)}</span></div>
                    <div className="flex justify-between font-semibold text-emerald-500"><span className="opacity-70">Allowances</span><span className="font-mono">(+) {formatAmount(selectedPayslip.allowances)}</span></div>
                    <div className="flex justify-between font-extrabold text-foreground pt-4 border-t border-black/5"><span className="uppercase text-[9px] tracking-wider">Gross Earnings</span><span className="font-mono">{formatAmount(selectedPayslip.basicPay + selectedPayslip.allowances)}</span></div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-4 pl-6">
                    <h5 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest pb-2 border-b border-black/5">Deductions</h5>
                    <div className="flex justify-between font-semibold text-red-500"><span className="opacity-70">General Deductions</span><span className="font-mono">(-) {formatAmount(selectedPayslip.deductions)}</span></div>
                    <div className="flex justify-between font-extrabold text-foreground pt-4 border-t border-black/5 mt-auto"><span className="uppercase text-[9px] tracking-wider">Total Deductions</span><span className="font-mono">{formatAmount(selectedPayslip.deductions)}</span></div>
                  </div>
                </div>

                {/* Net Payout Summary */}
                <div className="bg-black/5 dark:bg-white/5 p-6 rounded-2xl flex justify-between items-center my-6 text-sm">
                  <div className="text-left">
                    <h5 className="font-black uppercase tracking-wider text-[10px] text-muted-foreground">Net Payout (Take Home)</h5>
                    <p className="text-xs text-muted-foreground mt-1">Sum of Earnings minus Deductions</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-black text-emerald-500 font-mono">{formatAmount(selectedPayslip.netPay)}</h3>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-6 pt-16 text-center text-xs font-semibold text-muted-foreground/80">
                  <div className="space-y-2">
                    <div className="border-t border-black/20 dark:border-white/20 pt-2 w-3/4 mx-auto"></div>
                    <p>Employee Signature</p>
                  </div>
                  <div className="space-y-2">
                    <div className="border-t border-black/20 dark:border-white/20 pt-2 w-3/4 mx-auto"></div>
                    <p>Authorized Signatory</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/5 dark:bg-white/5">
                <button type="button" onClick={() => setSelectedPayslip(null)} className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Close Preview
                </button>
                <button type="button" onClick={executePrint} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold flex items-center gap-2 premium-shadow hover:scale-105 transition-all">
                  <Printer className="w-4.5 h-4.5" /> Print Payslip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
