import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, X, CheckCircle2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';

export default function StudentModule() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', admissionNo: '', rollNumber: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    api.getStudents()
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching students:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.addStudent(formData);
      setModalOpen(false);
      setFormData({ firstName: '', lastName: '', admissionNo: '', rollNumber: '' });
      fetchStudents(); // Refresh table
    } catch (err) {
      console.error(err);
      alert('Error saving student: ' + err.message + '\n\nDid you restart the terminal (`npm run dev`)?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.deleteStudent(id);
      fetchStudents(); // Refresh table
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Error deleting student: ' + err.message);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative overflow-y-auto pr-2 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full text-left">
        <div className="flex-1 text-left w-full">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 text-left">Student Directory</h1>
          <p className="text-muted-foreground mt-2 text-lg text-left">Manage all student records, admissions, and academic histories.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-primary-foreground px-8 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all premium-shadow hover:scale-105 duration-300 flex-shrink-0"
        >
          <div className="bg-white/20 p-1.5 rounded-full"><Plus className="w-4 h-4" /></div>
          New Admission
        </button>
      </div>

      <div className="glass-panel p-5 rounded-3xl flex gap-4 items-center border border-black/10 dark:border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name, admission no, or phone..." 
            className="pl-12 pr-4 py-3 w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/50 rounded-2xl focus:ring-2 focus:ring-primary/20 text-foreground text-sm outline-none transition-all"
          />
        </div>
        <button className="px-5 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl flex items-center gap-2 transition-colors border border-black/5 dark:border-white/5 text-foreground font-medium">
          <Filter className="w-5 h-5" />
          Advanced Filters
        </button>
      </div>

      <div className="glass-panel rounded-3xl flex-1 overflow-hidden flex flex-col border border-black/10 dark:border-white/5">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                <th className="px-8 py-5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admission No</th>
                <th className="px-8 py-5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Student Name</th>
                <th className="px-8 py-5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Class & Sec</th>
                <th className="px-8 py-5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Roll No</th>
                <th className="px-8 py-5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-sm font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12 text-muted-foreground animate-pulse">Loading secure student data...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-muted-foreground">No students found. Click New Admission to add.</td></tr>
              ) : students.map(student => (
                <tr key={student.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5 font-medium text-muted-foreground">{student.admissionNumber}</td>
                  <td className="px-8 py-5 font-bold text-foreground flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary flex items-center justify-center font-extrabold text-lg premium-shadow relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 bg-white/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative z-10">{student.firstName[0]}{student.lastName[0]}</span>
                    </div>
                    <div>
                      <p className="text-base group-hover:text-primary transition-colors">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Enrolled: 2024</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-gradient-to-r from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 px-4 py-2 rounded-xl text-sm font-bold text-foreground premium-shadow border border-black/5 dark:border-white/5 inline-flex items-center gap-2 group-hover:border-primary/20 transition-colors">
                      <BookOpen className="w-4 h-4 text-primary" />
                      {student.class ? student.class.name : 'N/A'} - {student.section ? student.section.name : 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-muted-foreground font-medium">{student.rollNumber || '-'}</td>
                  <td className="px-8 py-5">
                    <span className="text-emerald-500 font-bold text-sm flex items-center gap-2 bg-emerald-500/10 w-max px-3 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteStudent(student.id)} className="p-2 hover:bg-rose-500/10 rounded-xl text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-muted-foreground transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-sm text-muted-foreground font-medium">
          <p>Showing {students.length} of {students.length} entries</p>
          <div className="flex gap-2">
            <button className="px-5 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 transition-colors" disabled>Previous</button>
            <button className="px-5 py-2 rounded-xl bg-primary/20 text-primary font-bold">1</button>
            <button className="px-5 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Premium Framer Motion Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/40 dark:bg-black/60 transition-all"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[2rem] premium-shadow overflow-hidden z-10"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">New Admission</h2>
                  <p className="text-muted-foreground text-sm mt-1">Enter the student's details to enroll them into the system.</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-8 space-y-6 bg-background/50">
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">First Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Aarav"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        pattern="[A-Za-z\s]{2,50}"
                        title="First name should contain only alphabets and be at least 2 characters long"
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-primary/50 focus:invalid:border-red-500 focus:invalid:ring-red-500/20 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/20 text-foreground transition-all placeholder:text-muted-foreground/50 font-medium" 
                      />
                      <p className="mt-1.5 text-xs text-red-500 font-medium opacity-0 peer-invalid:peer-focus:opacity-100 transition-opacity absolute -bottom-5 left-1">Please enter a valid name (letters only).</p>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 group-focus-within:text-purple-500 transition-colors">Last Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Sharma"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        pattern="[A-Za-z\s]{2,50}"
                        title="Last name should contain only alphabets and be at least 2 characters long"
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-purple-500/50 focus:invalid:border-red-500 focus:invalid:ring-red-500/20 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-purple-500/20 text-foreground transition-all placeholder:text-muted-foreground/50 font-medium" 
                      />
                      <p className="mt-1.5 text-xs text-red-500 font-medium opacity-0 peer-invalid:peer-focus:opacity-100 transition-opacity absolute -bottom-5 left-1">Please enter a valid name (letters only).</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 group-focus-within:text-emerald-500 transition-colors">Admission Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. ADM-001"
                        value={formData.admissionNo}
                        onChange={e => setFormData({...formData, admissionNo: e.target.value.toUpperCase()})}
                        pattern="^[A-Za-z0-9-]+$"
                        title="Only letters, numbers, and hyphens are allowed"
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-emerald-500/50 focus:invalid:border-red-500 focus:invalid:ring-red-500/20 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-emerald-500/20 text-foreground transition-all font-mono font-bold tracking-widest placeholder:text-muted-foreground/30 placeholder:font-sans" 
                      />
                      <p className="mt-1.5 text-xs text-red-500 font-medium opacity-0 peer-invalid:peer-focus:opacity-100 transition-opacity absolute -bottom-5 left-1">Invalid format (e.g. ADM-001).</p>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 group-focus-within:text-amber-500 transition-colors">Roll Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. 12"
                        value={formData.rollNumber}
                        onChange={e => setFormData({...formData, rollNumber: e.target.value})}
                        pattern="^[A-Za-z0-9]+$"
                        title="Only alphanumeric characters allowed"
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-amber-500/50 focus:invalid:border-red-500 focus:invalid:ring-red-500/20 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-amber-500/20 text-foreground transition-all font-mono font-bold tracking-widest placeholder:text-muted-foreground/30 placeholder:font-sans" 
                      />
                      <p className="mt-1.5 text-xs text-red-500 font-medium opacity-0 peer-invalid:peer-focus:opacity-100 transition-opacity absolute -bottom-5 left-1">Only numbers/letters allowed.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-8 border-t border-black/5 dark:border-white/10 flex justify-end gap-4 bg-background p-4 rounded-b-[2rem] -mx-8 -mb-8">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3.5 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-2xl font-bold flex items-center gap-3 premium-shadow hover:scale-105 transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    {isSubmitting ? 'Saving...' : <><div className="bg-white/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4" /></div> Confirm Admission</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
