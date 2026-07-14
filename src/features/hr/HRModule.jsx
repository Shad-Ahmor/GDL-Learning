import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, X, CheckCircle2, Edit3, Trash2, Mail, Phone, MapPin, Search, Hash, User, Building, UserCircle, Calendar, DollarSign, GraduationCap, ArrowUpDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedDatePicker from '../../components/ui/AnimatedDatePicker';

const apiBase = 'http://localhost:1422/api';

export default function HRModule() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtering, Sorting & Pagination State
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Employee Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    employeeId: '',
    firstName: '',
    lastName: '',
    designation: '',
    department: '',
    joinDate: '',
    dob: '',
    gender: 'Male',
    countryCode: '+91',
    mobileNumber: '',
    email: '',
    address: '',
    baseSalary: '',
    currency: '₹',
    qualifications: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiBase}/hr/employees`);
      if(res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = form.id ? `${apiBase}/hr/employees/${form.id}` : `${apiBase}/hr/employees`;
      const method = form.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save employee');
      
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error saving employee. Did you update server.js with HR routes and restart backend?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (emp) => {
    setForm({
      id: emp.id,
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      designation: emp.designation,
      department: emp.department,
      joinDate: new Date(emp.joinDate).toISOString().split('T')[0],
      dob: new Date(emp.dob).toISOString().split('T')[0],
      gender: emp.gender,
      countryCode: emp.countryCode || '+91',
      mobileNumber: emp.mobileNumber,
      email: emp.email || '',
      address: emp.address || '',
      baseSalary: emp.baseSalary || '',
      currency: emp.currency || '₹',
      qualifications: emp.qualifications || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if(!window.confirm(`Are you sure you want to delete employee "${name}"?`)) return;
    try {
      const res = await fetch(`${apiBase}/hr/employees/${id}`, { method: 'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error deleting employee.");
    }
  };

  // --- Data Processing (Filter, Sort, Paginate) ---
  let processedEmployees = [...employees];

  // 1. Filter by Department
  if (filterDepartment !== 'All') {
    processedEmployees = processedEmployees.filter(e => e.department === filterDepartment);
  }

  // 2. Filter by Search Term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    processedEmployees = processedEmployees.filter(e => 
      (e.firstName + ' ' + e.lastName).toLowerCase().includes(term) ||
      e.employeeId.toLowerCase().includes(term) ||
      e.designation.toLowerCase().includes(term)
    );
  }

  // 3. Sort
  processedEmployees.sort((a, b) => {
    let aVal, bVal;
    if (sortBy === 'name') {
      aVal = (a.firstName + ' ' + a.lastName).toLowerCase();
      bVal = (b.firstName + ' ' + b.lastName).toLowerCase();
    } else if (sortBy === 'salary') {
      aVal = Number(a.baseSalary || 0);
      bVal = Number(b.baseSalary || 0);
    } else if (sortBy === 'joinedDate') {
      aVal = new Date(a.joinDate).getTime();
      bVal = new Date(b.joinDate).getTime();
    } else if (sortBy === 'department') {
      aVal = a.department.toLowerCase();
      bVal = b.department.toLowerCase();
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 4. Paginate
  const totalPages = Math.max(1, Math.ceil(processedEmployees.length / itemsPerPage));
  const currentEmployees = processedEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, sortBy, sortOrder]);
  // ------------------------------------------------

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse font-medium">Loading HR data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left mb-2">
        <h3 className="text-2xl font-black flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-500"><Briefcase className="w-7 h-7" /></div> Staff & Teachers
        </h3>
        <button onClick={() => {
          setForm({
            id: null, employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`, firstName: '', lastName: '', designation: '', department: 'Teaching', joinDate: new Date().toISOString().split('T')[0], dob: '', gender: 'Male', mobileNumber: '', email: '', address: '', baseSalary: ''
          });
          setModalOpen(true);
        }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Add Employee
        </button>
      </div>

      <div className="relative glass-panel p-1 rounded-[2.5rem] group overflow-hidden shadow-xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 blur-3xl opacity-50 pointer-events-none" />
        
        <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
      <div className="relative mb-8 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 group/search">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-cyan-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or designation..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-500/50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all font-medium"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex gap-4">
          <div className="relative min-w-[160px] group/filter">
            <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/filter:text-cyan-500 transition-colors" />
            <select 
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cyan-500/50 rounded-2xl pl-11 pr-4 py-4 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Teaching">Teaching</option>
              <option value="Administration">Administration</option>
              <option value="Finance">Finance</option>
              <option value="Transport">Transport</option>
              <option value="Support Staff">Support Staff</option>
            </select>
          </div>
          
          <div className="relative min-w-[160px] flex items-center bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-cyan-500/50 transition-all focus-within:ring-4 focus-within:ring-cyan-500/20">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-transparent pl-4 pr-2 py-4 outline-none text-foreground font-bold appearance-none cursor-pointer flex-1"
            >
              <option value="name">Sort by Name</option>
              <option value="salary">Sort by Salary</option>
              <option value="joinedDate">Sort by Joined</option>
              <option value="department">Sort by Dept</option>
            </select>
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
              className="px-3 hover:text-cyan-500 transition-colors border-l border-black/10 dark:border-white/10 h-full flex items-center justify-center text-muted-foreground"
              title={`Toggle sorting order (current: ${sortOrder})`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEmployees.map(emp => (
          <div key={emp.id} className="group relative overflow-hidden rounded-3xl bg-card border border-black/5 dark:border-white/10 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
            {/* Top Banner */}
            <div className="h-20 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button onClick={() => handleEdit(emp)} className="p-2 bg-card/80 backdrop-blur-md text-indigo-500 hover:text-indigo-400 hover:bg-card rounded-xl transition-all shadow-sm">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(emp.id, emp.firstName)} className="p-2 bg-card/80 backdrop-blur-md text-red-500 hover:text-red-400 hover:bg-card rounded-xl transition-all shadow-sm">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="px-6 relative pb-6 flex-1 flex flex-col">
              {/* Avatar overlaying the banner */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl premium-shadow absolute -top-8 border-4 border-card">
                {emp.firstName[0]}{emp.lastName[0]}
              </div>
              
              <div className="mt-10 mb-6">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="text-xl font-black text-foreground">{emp.firstName} {emp.lastName}</h4>
                  <span className="bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">{emp.employeeId}</span>
                </div>
                <p className="text-sm font-bold text-muted-foreground">{emp.designation} <span className="opacity-50">•</span> {emp.department}</p>
              </div>

              <div className="space-y-3 bg-black/5 dark:bg-white/5 p-4 rounded-2xl mb-auto">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500"><Phone className="w-4 h-4" /></div>
                  <span className="font-bold text-foreground">{emp.countryCode || '+91'} {emp.mobileNumber}</span>
                </div>
                {emp.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500"><Mail className="w-4 h-4" /></div>
                    <span className="font-medium text-foreground truncate">{emp.email}</span>
                  </div>
                )}
                {emp.qualifications && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500"><GraduationCap className="w-4 h-4" /></div>
                    <span className="font-medium text-foreground line-clamp-1" title={emp.qualifications}>{emp.qualifications}</span>
                  </div>
                )}
              </div>
              
              {(emp.baseSalary > 0 || emp.baseSalary) && (
                <div className="mt-5 flex items-center justify-between border-t border-black/5 dark:border-white/10 pt-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Base Salary</span>
                  <span className="font-black text-foreground bg-green-500/10 text-green-500 px-3 py-1.5 rounded-xl text-sm">{emp.currency || '₹'} {Number(emp.baseSalary).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {currentEmployees.length === 0 && (
          <div className="col-span-full text-center p-12 glass-panel rounded-[2rem] border border-black/5 dark:border-white/5">
             <div className="bg-black/5 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Briefcase className="w-10 h-10 text-muted-foreground" />
             </div>
             <h3 className="text-xl font-bold mb-2 text-foreground">No Employees Found</h3>
             <p className="text-muted-foreground">Adjust your filters or search term.</p>
           </div>
          )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-between items-center bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-white/5">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2.5 rounded-xl font-bold text-foreground bg-card shadow-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          
          <span className="text-sm font-black tracking-widest uppercase text-muted-foreground">
            Page <span className="text-cyan-500">{currentPage}</span> of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2.5 rounded-xl font-bold text-foreground bg-card shadow-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      </div>
    </div>

      {/* Employee Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="relative w-full max-w-3xl max-h-[calc(100vh-4rem)] bg-card border border-white/10 rounded-[2.5rem] premium-shadow overflow-hidden text-left flex flex-col z-10"
            >
              <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5 shrink-0">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">{form.id ? 'Edit Employee' : 'Register Employee'}</h2>
                  <p className="text-muted-foreground text-xs md:text-sm mt-1">Fill in the staff details.</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5 md:w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-left bg-background/30">
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Employee ID <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Hash className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors" />
                      <input 
                        required type="text" 
                        value={form.employeeId} 
                        onChange={e => setForm({...form, employeeId: e.target.value})} 
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all font-mono font-bold focus:invalid:border-red-500 focus:invalid:ring-red-500/20" 
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">First Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors" />
                      <input 
                        required type="text" 
                        placeholder="e.g. John"
                        value={form.firstName} 
                        onChange={e => setForm({...form, firstName: e.target.value})} 
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all font-bold focus:invalid:border-red-500 focus:invalid:ring-red-500/20" 
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Last Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors" />
                      <input 
                        required type="text" 
                        placeholder="e.g. Doe"
                        value={form.lastName} 
                        onChange={e => setForm({...form, lastName: e.target.value})} 
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all font-bold focus:invalid:border-red-500 focus:invalid:ring-red-500/20" 
                      />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Department <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Building className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors pointer-events-none" />
                      <select 
                        required 
                        value={form.department} 
                        onChange={e => setForm({...form, department: e.target.value})} 
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all font-bold appearance-none"
                      >
                        <option>Teaching</option>
                        <option>Administration</option>
                        <option>Finance</option>
                        <option>Transport</option>
                        <option>Support Staff</option>
                      </select>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Designation <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Briefcase className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors" />
                      <input 
                        required type="text" 
                        placeholder="e.g. Senior Teacher" 
                        value={form.designation} 
                        onChange={e => setForm({...form, designation: e.target.value})} 
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all font-bold focus:invalid:border-red-500 focus:invalid:ring-red-500/20" 
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Gender <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <UserCircle className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors pointer-events-none" />
                      <select 
                        required 
                        value={form.gender} 
                        onChange={e => setForm({...form, gender: e.target.value})} 
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all font-bold appearance-none"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Date of Birth <span className="text-red-500">*</span></label>
                    <AnimatedDatePicker
                      value={form.dob}
                      onChange={(val) => setForm({...form, dob: val})}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Join Date <span className="text-red-500">*</span></label>
                    <AnimatedDatePicker
                      value={form.joinDate}
                      onChange={(val) => setForm({...form, joinDate: val})}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Base Salary (Monthly)</label>
                    <div className="relative flex rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-cyan-500/20 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 transition-all">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors pointer-events-none z-10"><DollarSign className="w-5 h-5"/></div>
                      <select 
                        value={form.currency} 
                        onChange={e => setForm({...form, currency: e.target.value})}
                        className="w-28 shrink-0 pl-11 pr-2 py-3.5 bg-transparent outline-none font-bold text-foreground border-r border-black/10 dark:border-white/10 appearance-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs text-center"
                      >
                        <option value="₹">₹ INR</option>
                        <option value="$">$ USD</option>
                        <option value="€">€ EUR</option>
                        <option value="£">£ GBP</option>
                        <option value="د.إ">د.إ AED</option>
                      </select>
                      <input 
                        type="number" 
                        placeholder="e.g. 50000"
                        value={form.baseSalary} 
                        onChange={e => setForm({...form, baseSalary: e.target.value})} 
                        className="flex-1 w-full pl-4 pr-5 py-3.5 bg-transparent outline-none text-foreground font-bold" 
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Mobile Number <span className="text-red-500">*</span></label>
                    <div className="relative flex rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-cyan-500/20 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 transition-all">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors pointer-events-none z-10"><Phone className="w-5 h-5"/></div>
                      <select 
                        value={form.countryCode} 
                        onChange={e => setForm({...form, countryCode: e.target.value})}
                        className="w-28 shrink-0 pl-11 pr-2 py-3.5 bg-transparent outline-none font-bold text-foreground border-r border-black/10 dark:border-white/10 appearance-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US/CA)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+971">+971 (UAE)</option>
                      </select>
                      <input 
                        required 
                        type="tel" 
                        pattern="[0-9]{10}"
                        title="10-digit mobile number"
                        placeholder="e.g. 9876543210"
                        value={form.mobileNumber} 
                        onChange={e => setForm({...form, mobileNumber: e.target.value.replace(/\D/g,'').slice(0,10)})} 
                        className="flex-1 w-full pl-4 pr-5 py-3.5 bg-transparent outline-none text-foreground font-bold peer focus:invalid:text-red-500" 
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Email Address</label>
                    <div className="relative group/input hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 rounded-2xl">
                      <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors z-10" />
                      <input 
                        type="email" 
                        pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                        title="Enter a valid email address"
                        placeholder="employee@school.com"
                        value={form.email} 
                        onChange={e => setForm({...form, email: e.target.value})} 
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all duration-300 font-bold focus:invalid:border-red-500 focus:invalid:ring-red-500/20 hover:bg-black/10 dark:hover:bg-white/10 focus:-translate-y-1" 
                      />
                      <p className="mt-1.5 text-xs text-red-500 font-medium opacity-0 peer-invalid:peer-focus:opacity-100 transition-opacity absolute -bottom-5 left-1">Please enter a valid email.</p>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-cyan-500 transition-colors">Qualifications</label>
                    <div className="relative">
                      <GraduationCap className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="e.g. M.Sc. Mathematics, B.Ed."
                        value={form.qualifications} 
                        onChange={e => setForm({...form, qualifications: e.target.value})} 
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all font-bold focus:invalid:border-red-500 focus:invalid:ring-red-500/20" 
                      />
                    </div>
                  </div>
                </div>

                </div>

                <div className="p-6 md:p-8 border-t border-black/5 dark:border-white/10 flex justify-end gap-3 bg-background shrink-0 rounded-b-[2.5rem]">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-2xl font-bold text-xs text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-xs flex items-center gap-2 premium-shadow hover:scale-105 transition-all disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : <><div className="bg-white/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4" /></div> {form.id ? 'Update' : 'Register'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
