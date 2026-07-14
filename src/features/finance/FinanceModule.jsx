import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet, Plus, X, TrendingUp, TrendingDown, IndianRupee, Search, Filter,
  ArrowUpRight, ArrowDownRight, BarChart3, FileText, ChevronDown, Trash2,
  RefreshCw, BadgeIndianRupee, Layers, CircleDollarSign, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';

const apiBase = 'http://localhost:1422/api';
import Modal from '../../components/ui/Modal';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#06b6d4'];

const formatAmount = (val = 0) => `₹${Number(val).toLocaleString('en-IN')}`;

const getBadgeStyle = (type) => {
  if (type === 'Income') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
};

const getSourceColor = (source) => {
  const map = {
    'Fee Collection': '#10b981',
    'Staff Payroll': '#f59e0b',
    'Manual': '#6366f1',
  };
  return map[source] || '#94a3b8';
};

export default function FinanceModule() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // Manual Entry Modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'Income',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    referenceNo: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (silent = false) => {
    try {
      if (!silent) setLoading(true); else setRefreshing(true);
      const res = await fetch(`${apiBase}/finance/transactions`);
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/finance/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) })
      });
      if (!res.ok) throw new Error('Failed');
      setModalOpen(false);
      setForm({ type: 'Income', category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '', referenceNo: '' });
      fetchTransactions(true);
    } catch (err) {
      alert('Error adding transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction entry?')) return;
    try {
      await fetch(`${apiBase}/finance/transactions/${id}`, { method: 'DELETE' });
      fetchTransactions(true);
    } catch (err) {
      alert('Error deleting transaction.');
    }
  };

  // --- Computed Analytics ---
  const metrics = useMemo(() => {
    const income = transactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
    const netBalance = income - expense;
    const feeIncome = transactions.filter(t => t.source === 'Fee Collection').reduce((s, t) => s + t.amount, 0);
    const payrollExpense = transactions.filter(t => t.source === 'Staff Payroll').reduce((s, t) => s + t.amount, 0);
    const manualIncome = transactions.filter(t => t.source === 'Manual' && t.type === 'Income').reduce((s, t) => s + t.amount, 0);
    const manualExpense = transactions.filter(t => t.source === 'Manual' && t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, netBalance, feeIncome, payrollExpense, manualIncome, manualExpense };
  }, [transactions]);

  // Monthly trend chart — income vs expense by month in selected year
  const monthlyTrend = useMemo(() => {
    const data = MONTHS.map((label, idx) => ({
      name: label,
      Income: 0,
      Expense: 0
    }));
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === filterYear) {
        const mi = d.getMonth();
        if (t.type === 'Income') data[mi].Income += t.amount;
        else data[mi].Expense += t.amount;
      }
    });
    return data;
  }, [transactions, filterYear]);

  // Source distribution pie chart
  const sourcePie = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const key = t.source;
      if (!map[key]) map[key] = 0;
      map[key] += t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    years.add(new Date().getFullYear());
    return [...years].sort((a, b) => b - a);
  }, [transactions]);

  // Filtered transaction list
  const filteredTxs = useMemo(() => {
    let result = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.referenceNo?.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'All') result = result.filter(t => t.type === filterType);
    if (filterSource !== 'All') result = result.filter(t => t.source === filterSource);
    if (filterMonth !== 'All') {
      result = result.filter(t => new Date(t.date).getMonth() === parseInt(filterMonth));
    }
    result = result.filter(t => new Date(t.date).getFullYear() === filterYear);
    return result;
  }, [transactions, search, filterType, filterSource, filterMonth, filterYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterSource, filterMonth, filterYear]);

  const totalPages = Math.ceil(filteredTxs.length / ITEMS_PER_PAGE);
  const currentTxs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTxs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTxs, currentPage]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="glass-panel p-4 rounded-2xl border border-black/5 dark:border-white/5 text-sm shadow-xl">
          <p className="font-extrabold text-foreground mb-2">{label}</p>
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-bold text-foreground">{formatAmount(entry.value)}</span>
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
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-bold text-sm">Loading financial records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full overflow-auto pb-20 w-full text-left px-2">

      {/* Header */}
      <div className="w-full flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-600 text-left inline-block">
            School Financial Ledger
          </h1>
          <p className="text-muted-foreground mt-2 text-lg text-left">
            Consolidated income, expenses, payroll, and manual transactions across the school.
          </p>
        </div>
        <div className="flex gap-3 self-start md:self-end">
          <button
            onClick={() => fetchTransactions(true)}
            disabled={refreshing}
            className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-all text-muted-foreground hover:text-foreground"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2.5 hover:scale-105 transition-all premium-shadow"
          >
            <Plus className="w-4 h-4" /> Add Manual Entry
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Income',
            value: formatAmount(metrics.income),
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            glow: 'bg-emerald-500/5',
            sub: `Fees: ${formatAmount(metrics.feeIncome)} | Other: ${formatAmount(metrics.manualIncome)}`
          },
          {
            label: 'Total Expenses',
            value: formatAmount(metrics.expense),
            icon: <TrendingDown className="w-6 h-6" />,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            glow: 'bg-rose-500/5',
            sub: `Payroll: ${formatAmount(metrics.payrollExpense)} | Other: ${formatAmount(metrics.manualExpense)}`
          },
          {
            label: 'Net Balance',
            value: formatAmount(metrics.netBalance),
            icon: <CircleDollarSign className="w-6 h-6" />,
            color: metrics.netBalance >= 0 ? 'text-indigo-500' : 'text-amber-500',
            bg: metrics.netBalance >= 0 ? 'bg-indigo-500/10' : 'bg-amber-500/10',
            glow: metrics.netBalance >= 0 ? 'bg-indigo-500/5' : 'bg-amber-500/5',
            sub: metrics.netBalance >= 0 ? 'School is in surplus' : 'School is in deficit'
          },
          {
            label: 'Transactions',
            value: transactions.length,
            icon: <Layers className="w-6 h-6" />,
            color: 'text-sky-500',
            bg: 'bg-sky-500/10',
            glow: 'bg-sky-500/5',
            sub: `${transactions.filter(t => t.type === 'Income').length} income · ${transactions.filter(t => t.type === 'Expense').length} expense`
          }
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-panel p-6 rounded-[2rem] border border-black/5 dark:border-white/5 premium-shadow hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-28 h-28 ${card.glow} rounded-full blur-2xl group-hover:scale-110 transition-transform`} />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs mb-2">{card.label}</p>
                <h3 className="text-2xl font-extrabold text-foreground">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 font-medium relative z-10">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Trend Chart */}
        <div className="lg:col-span-2 glass-panel rounded-[2rem] p-8 flex flex-col border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-xl font-bold text-foreground">Monthly Income vs Expenses</h3>
            <select
              value={filterYear}
              onChange={e => setFilterYear(parseInt(e.target.value))}
              className="bg-black/5 dark:bg-white/5 border-0 rounded-xl px-3 py-2 text-sm font-bold text-foreground outline-none cursor-pointer"
            >
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex-1 w-full min-h-[240px] relative z-10">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }} tickFormatter={v => v >= 100000 ? `₹${v / 100000}L` : `₹${v}`} dx={-6} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} />
                <Area type="monotone" dataKey="Expense" stroke="#f43f5e" strokeWidth={2.5} fill="url(#expenseGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <div className="w-3 h-1 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <div className="w-3 h-1 rounded-full bg-rose-500" />
                <span className="text-muted-foreground">Expenses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Source Pie Chart */}
        <div className="glass-panel rounded-[2rem] p-8 flex flex-col border border-black/5 dark:border-white/5 premium-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-xl font-bold text-foreground mb-2 relative z-10">Volume by Source</h3>
          <p className="text-sm text-muted-foreground relative z-10 mb-4 font-medium">Where money flows from/to</p>

          <div className="flex-1 relative z-10 flex flex-col items-center justify-center gap-6">
            {sourcePie.length > 0 ? (
              <>
                <div className="w-full h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourcePie}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {sourcePie.map((entry, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={v => formatAmount(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-2">
                  {sourcePie.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="text-muted-foreground font-semibold">{item.name}</span>
                      </div>
                      <span className="font-bold text-foreground">{formatAmount(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No transactions recorded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="relative glass-panel p-1 rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-teal-500/5 blur-3xl opacity-50 pointer-events-none" />

        <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">

          {/* Table Header + Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-black/5 dark:border-white/5">
            <div>
              <h4 className="font-extrabold text-foreground text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" /> Financial Ledger
              </h4>
              <p className="text-muted-foreground text-xs mt-1">All income & expense entries — fees, payroll, and manual.</p>
            </div>
            <div className="text-xs bg-black/5 dark:bg-white/5 px-4 py-2 rounded-2xl font-bold text-muted-foreground">
              {filteredTxs.length} entries shown
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[180px] group/search">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-green-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by description, category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-green-500/50 rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-4 focus:ring-green-500/20 text-sm text-foreground transition-all font-medium"
              />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-2.5 text-sm font-bold text-foreground outline-none cursor-pointer border border-transparent">
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
            <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
              className="bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-2.5 text-sm font-bold text-foreground outline-none cursor-pointer border border-transparent">
              <option value="All">All Sources</option>
              <option value="Fee Collection">Fee Collection</option>
              <option value="Staff Payroll">Staff Payroll</option>
              <option value="Manual">Manual</option>
            </select>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              className="bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-2.5 text-sm font-bold text-foreground outline-none cursor-pointer border border-transparent">
              <option value="All">All Months</option>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))}
              className="bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-2.5 text-sm font-bold text-foreground outline-none cursor-pointer border border-transparent">
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 text-center">Source</th>
                  <th className="py-4 px-4 text-center">Type</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4 text-center">Ref No.</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm font-semibold">
                {currentTxs.map((tx, idx) => (
                  <tr key={`${tx.id}-${idx}`} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="font-bold text-foreground truncate" title={tx.description}>{tx.description || '—'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">{tx.category}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: getSourceColor(tx.source) + '18', color: getSourceColor(tx.source) }}>
                        {tx.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 border text-[10px] font-bold px-2.5 py-1 rounded-full ${getBadgeStyle(tx.type)}`}>
                        {tx.type === 'Income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono font-black ${tx.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.type === 'Income' ? '+' : '-'}{formatAmount(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-mono text-muted-foreground">
                      {tx.referenceNo || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {tx.source === 'Manual' ? (
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Delete manual entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[9px] text-muted-foreground/40 font-semibold">Auto</span>
                      )}
                    </td>
                  </tr>
                ))}
                {currentTxs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground font-bold">
                      No transactions match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary for filtered results */}
          {filteredTxs.length > 0 && (
            <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-6 text-sm font-bold">
              <div>
                <span className="text-muted-foreground font-medium mr-2">Filtered Income:</span>
                <span className="text-emerald-500">{formatAmount(filteredTxs.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0))}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium mr-2">Filtered Expenses:</span>
                <span className="text-rose-500">{formatAmount(filteredTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0))}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium mr-2">Net for Filter:</span>
                <span className={
                  filteredTxs.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0) -
                  filteredTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0) >= 0
                    ? 'text-indigo-500' : 'text-amber-500'
                }>
                  {formatAmount(
                    filteredTxs.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0) -
                    filteredTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8 pb-4">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl bg-card border border-black/5 dark:border-white/5 text-muted-foreground hover:bg-green-500 hover:text-white disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-md px-2 py-2">
                {(() => {
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

                  return pages.map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-muted-foreground font-black">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 shrink-0 rounded-xl font-black transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-tr from-green-500 to-teal-600 text-white shadow-lg shadow-green-500/30 scale-110'
                            : 'bg-card border border-black/5 dark:border-white/5 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ));
                })()}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl bg-card border border-black/5 dark:border-white/5 text-muted-foreground hover:bg-green-500 hover:text-white disabled:opacity-50 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Manual Transaction"
        icon={Wallet}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddTransaction} className="space-y-5 text-left">
          {/* Type Toggle */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Transaction Type *</label>
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
              {['Income', 'Expense'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
                    form.type === t
                      ? t === 'Income'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'bg-rose-500 text-white shadow'
                      : 'text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Category *</label>
                    <input required type="text" placeholder="e.g. Rent, Donation..."
                      value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500/50 border border-transparent text-foreground font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Amount (₹) *</label>
                    <input required type="number" min="1" step="0.01" placeholder="e.g. 10000"
                      value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500/50 border border-transparent text-foreground font-bold font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Date *</label>
                    <input required type="date"
                      value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-500/20 border border-transparent text-foreground font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Reference No.</label>
                    <input type="text" placeholder="Optional ref number"
                      value={form.referenceNo} onChange={e => setForm({ ...form, referenceNo: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-500/20 border border-transparent text-foreground font-medium text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</label>
                  <textarea rows={2} placeholder="Brief description of the transaction..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-500/20 border border-transparent text-foreground font-medium text-sm resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold flex items-center gap-2 premium-shadow hover:scale-105 transition-all disabled:opacity-50">
                    {submitting ? 'Saving...' : 'Add Entry'}
                  </button>
                </div>
        </form>
      </Modal>
    </div>
  );
}
