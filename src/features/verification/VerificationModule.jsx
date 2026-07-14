import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Search, Download, Upload, UserCheck, 
  AlertTriangle, Star, Clock, FileText, CheckCircle2, User, ChevronRight, X, Users, UserCircle, Phone
} from 'lucide-react';

const apiBase = 'http://localhost:1422/api';

const GRADIENT_PALETTE = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
];

export default function VerificationModule() {
  const [activeTab, setActiveTab] = useState('export'); // 'export' or 'import'
  
  // Export State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('STUDENT'); // STUDENT or EMPLOYEE
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [behaviors, setBehaviors] = useState([]);
  const [exportToken, setExportToken] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  
  // Import State
  const [importTokenStr, setImportTokenStr] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [importError, setImportError] = useState('');

  // Add Behavior Modal State
  const [showAddBehavior, setShowAddBehavior] = useState(false);
  const [newBehavior, setNewBehavior] = useState({
    recordType: 'REMARK',
    title: '',
    description: '',
    points: 0,
    reportedBy: 'System Admin'
  });
  
  // Import Assignment Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [importAssignment, setImportAssignment] = useState({
    admissionNumber: '',
    classId: '',
    sectionId: '',
    employeeId: '',
    department: '',
    designation: ''
  });

  // Active session context
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    fetchActiveSession();
    fetchClasses();
    fetchAllPeople();
  }, []);

  const fetchAllPeople = async () => {
    try {
      const [resStu, resEmp] = await Promise.all([
        fetch(`${apiBase}/students`),
        fetch(`${apiBase}/hr/employees`)
      ]);
      setAllStudents(await resStu.json());
      setAllEmployees(await resEmp.json());
    } catch(e) {
      console.error(e);
    }
  };

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const sq = searchQuery.toLowerCase();
    const source = searchType === 'STUDENT' ? allStudents : allEmployees;
    return source.filter(p => {
      const fn = p.firstName?.toLowerCase() || '';
      const ln = p.lastName?.toLowerCase() || '';
      const id = (p.admissionNumber || p.employeeId || '').toLowerCase();
      return fn.includes(sq) || ln.includes(sq) || id.includes(sq);
    }).slice(0, 15);
  }, [searchQuery, searchType, allStudents, allEmployees]);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${apiBase}/setup/classes?includeSections=true`);
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const res = await fetch(`${apiBase}/academic/sessions`);
      const data = await res.json();
      const active = data.find(s => s.isActive);
      setActiveSession(active);
    } catch (err) {
      console.error(err);
    }
  };

  const selectPersonForExport = async (person) => {
    setSelectedPerson(person);
    setSearchQuery(`${person.firstName} ${person.lastName}`);
    setIsDropdownOpen(false);
    setExportToken(null);
    try {
      const res = await fetch(`${apiBase}/behavioral/${searchType}/${person.id}`);
      if (res.ok) {
        setBehaviors(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBehavior = async (e) => {
    e.preventDefault();
    if (!activeSession || !selectedPerson) return;
    
    try {
      const payload = {
        personType: searchType,
        personId: selectedPerson.id,
        sessionId: activeSession.id,
        ...newBehavior
      };
      
      const res = await fetch(`${apiBase}/behavioral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowAddBehavior(false);
        setNewBehavior({ recordType: 'REMARK', title: '', description: '', points: 0, reportedBy: 'System Admin' });
        selectPersonForExport(selectedPerson); // refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateExportToken = async () => {
    if (!selectedPerson) return;
    try {
      const res = await fetch(`${apiBase}/verification/export/${searchType}/${selectedPerson.id}`);
      const data = await res.json();
      if (data.token) {
        setExportToken(data.token);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreviewImport = async () => {
    setImportError('');
    setPreviewData(null);
    try {
      const res = await fetch(`${apiBase}/verification/import/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: importTokenStr })
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewData(data);
      } else {
        setImportError(data.error || 'Failed to parse token');
      }
    } catch (err) {
      setImportError('Invalid Token String');
    }
  };

  const executeImport = () => {
    if (!previewData || !activeSession) return;
    setImportAssignment({
      admissionNumber: '',
      classId: '',
      sectionId: '',
      employeeId: '',
      department: '',
      designation: ''
    });
    setShowImportModal(true);
  };

  const confirmImport = async (e) => {
    e.preventDefault();
    if (!activeSession) return;

    try {
      const res = await fetch(`${apiBase}/verification/import/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: importTokenStr,
          assignmentData: importAssignment,
          sessionId: activeSession.id
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Import successful! The profile and behavioral history have been integrated into your database.");
        setShowImportModal(false);
        setImportTokenStr('');
        setPreviewData(null);
        setActiveTab('export');
      } else {
        alert(data.error || 'Failed to import profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred during import.');
    }
  };

  return (
    <div className="space-y-6 relative px-2 lg:px-8 pb-20">
      {/* Header */}
      <div className="no-print">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-sky-500" />
          Global Verification Network
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Transfer student and staff behavioral histories securely between institutions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 pt-4 px-1 custom-scrollbar w-full snap-x">
        {[
          { id: 'export', label: 'Export Profile & Certificate', icon: Download, color: 'from-sky-500 to-blue-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(14,165,233,0.5)]', border: 'border-sky-500', text: 'text-sky-500', iconBg: 'bg-sky-500/10' },
          { id: 'import', label: 'Import from Network', icon: Upload, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]', border: 'border-emerald-500', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
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


      <AnimatePresence mode="wait">
        {activeTab === 'export' ? (
          <motion.div key="export" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ── LEFT PANEL: Search ── */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-5">
              <div className="bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center">1</div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select Person</label>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Person Type *</span>
                  <select 
                    value={searchType} 
                    onChange={e => {
                      setSearchType(e.target.value);
                      setSearchQuery('');
                      setSelectedPerson(null);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full bg-black/5 dark:bg-white/5 px-4 py-3 rounded-2xl outline-none border border-black/5 dark:border-white/10 font-bold text-sm appearance-none cursor-pointer text-foreground"
                  >
                    <option value="STUDENT" className="bg-card text-foreground">Student</option>
                    <option value="EMPLOYEE" className="bg-card text-foreground">Staff / Employee</option>
                  </select>
                </div>
                
                <div className="space-y-1 relative">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Person Name *</span>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder={`Search ${searchType.toLowerCase()} name...`}
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        if (selectedPerson) setSelectedPerson(null);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="w-full pl-10 pr-10 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl outline-none font-bold text-sm text-foreground"
                    />
                    {selectedPerson && (
                      <button onClick={() => { setSelectedPerson(null); setSearchQuery(''); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {isDropdownOpen && searchQuery.length > 0 && !selectedPerson && (
                    <div className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-card border border-black/5 dark:border-white/5 rounded-2xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
                      {searchResults.length > 0 ? searchResults.map(p => (
                        <div key={p.id}
                          onClick={() => {
                            selectPersonForExport(p);
                            setIsDropdownOpen(false);
                            setSearchQuery(`${p.firstName} ${p.lastName}`);
                          }}
                          className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${GRADIENT_PALETTE[(p.firstName?.[0] || 'A').charCodeAt(0) % GRADIENT_PALETTE.length]} text-white flex items-center justify-center font-black text-xs shrink-0`}>
                            {p.firstName?.[0] || ''}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm truncate text-foreground">{p.firstName} {p.lastName}</p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">ID: {p.admissionNumber || p.employeeId}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="p-4 text-center text-xs text-muted-foreground">No matches found.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL: Dashboard ── */}
            <div className="lg:col-span-7 xl:col-span-8">
              {!selectedPerson ? (
                <div className="bg-card rounded-3xl border border-black/5 dark:border-white/5 p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                  <div className="w-24 h-24 bg-sky-500/10 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-sky-500 opacity-50" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Select a Person</h3>
                  <p className="text-muted-foreground">Use the Person Type and Person Name fields on the left to pull up verifiable records.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile & Controls */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-card p-6 rounded-3xl border border-black/5 dark:border-white/10 premium-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {selectedPerson.firstName?.[0] || ''}{selectedPerson.lastName?.[0] || ''}
                        </div>
                        <button onClick={() => setSelectedPerson(null)} className="p-2 rounded-full hover:bg-black/10 text-muted-foreground"><X className="w-4 h-4"/></button>
                      </div>
                      <h3 className="text-xl font-black">{selectedPerson.firstName} {selectedPerson.lastName}</h3>
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                        {searchType} • ID: {selectedPerson.admissionNumber || selectedPerson.employeeId}
                      </p>
                      <div className="space-y-2 text-sm font-medium">
                        <div className="flex justify-between bg-black/5 p-2 rounded-lg">
                          <span className="text-muted-foreground">Contact</span>
                          <span>{selectedPerson.primaryPhone || selectedPerson.mobileNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between bg-black/5 p-2 rounded-lg">
                          <span className="text-muted-foreground">Joined</span>
                          <span>{new Date(selectedPerson.joinDate || selectedPerson.admissionDate || selectedPerson.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-sky-500 to-blue-700 p-6 rounded-3xl text-white premium-shadow">
                      <h3 className="font-black mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> Generate Verification</h3>
                      <p className="text-xs text-sky-100 mb-6 leading-relaxed">
                        Create a secure, portable token containing the complete behavioral and academic history to share with another institution.
                      </p>
                      <button 
                        onClick={generateExportToken}
                        className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg"
                      >
                        Generate Transfer Token
                      </button>

                      {exportToken && (
                        <div className="mt-4 p-4 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10">
                          <p className="text-[10px] uppercase font-bold text-sky-200 mb-1">Transfer Token (Copy this)</p>
                          <div className="font-mono text-xs break-all select-all opacity-80 h-20 overflow-y-auto custom-scrollbar">
                            {exportToken}
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(exportToken);
                              alert("Token copied to clipboard!");
                            }}
                            className="mt-3 w-full py-2 bg-black/30 hover:bg-black/40 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Copy Token
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Behavior Log */}
                  <div className="bg-card p-6 rounded-3xl border border-black/5 dark:border-white/10 premium-shadow">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-lg font-black">Behavioral & Character Log</h2>
                        <p className="text-xs text-muted-foreground font-bold">Lifetime records mapped to {activeSession?.name}</p>
                      </div>
                      <button 
                        onClick={() => setShowAddBehavior(true)}
                        className="px-4 py-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl font-bold text-sm transition-colors"
                      >
                        + Add Record
                      </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-3 pr-2">
                      {behaviors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-50">
                          <Clock className="w-12 h-12 mb-2" />
                          <p className="font-bold">No behavioral records found.</p>
                        </div>
                      ) : (
                        behaviors.map(b => {
                          let Icon = FileText;
                          let colorClass = 'text-slate-500 bg-slate-500/10 border-slate-500/20';
                          if (b.recordType === 'ACHIEVEMENT') { Icon = Star; colorClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'; }
                          if (b.recordType === 'COMPLAINT') { Icon = AlertTriangle; colorClass = 'text-rose-500 bg-rose-500/10 border-rose-500/20'; }
                          if (b.recordType === 'WARNING') { Icon = AlertTriangle; colorClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20'; }

                          return (
                            <div key={b.id} className="p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${colorClass}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-sm">{b.title}</h4>
                                  <span className="text-[10px] font-black text-muted-foreground uppercase bg-black/5 px-2 py-0.5 rounded">
                                    {new Date(b.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{b.description}</p>
                                <div className="mt-3 flex gap-2">
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${colorClass}`}>
                                    {b.recordType}
                                  </span>
                                  {b.points !== 0 && (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border bg-black/5 text-foreground">
                                      {b.points > 0 ? '+' : ''}{b.points} Points
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="import" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl mx-auto space-y-6">
            
            <div className="bg-card p-8 rounded-3xl border border-black/5 dark:border-white/10 premium-shadow text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/20">
                <Upload className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black mb-2">Import Verification Token</h2>
              <p className="text-muted-foreground text-sm font-medium mb-8">
                Paste a token generated by another school using this software to preview their verified history.
              </p>

              <textarea 
                value={importTokenStr}
                onChange={e => setImportTokenStr(e.target.value)}
                placeholder="Paste the Base64 transfer token here..."
                className="w-full h-32 bg-black/5 dark:bg-white/5 rounded-2xl p-4 font-mono text-xs border-none outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-4"
              />
              
              {importError && (
                <div className="text-rose-500 text-xs font-bold bg-rose-500/10 py-2 rounded-lg mb-4">
                  {importError}
                </div>
              )}

              <button 
                onClick={handlePreviewImport}
                disabled={!importTokenStr}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
Decode & Preview
              </button>
            </div>

            {previewData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* Authentic Paper Character Certificate Layout */}
                <div id="transfer-certificate-print" className="bg-white border-8 border-double border-slate-300 shadow-2xl mx-auto max-w-[800px] p-12 relative overflow-hidden print:shadow-none print:border-none print:w-full print:p-0 min-h-[1020px] print:min-h-[1020px] flex flex-col font-serif text-slate-900">
                  
                  {/* Background Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden">
                    <div className="w-[600px] h-[600px] border-[12px] border-slate-900 rounded-full flex items-center justify-center p-4 -rotate-12">
                      <div className="w-full h-full border-4 border-slate-900 border-dashed rounded-full flex flex-col items-center justify-center text-slate-900 text-center">
                        <ShieldCheck className="w-48 h-48 mb-4" />
                        <span className="text-6xl uppercase font-black tracking-tighter leading-none mt-2">Verified<br/>Network</span>
                      </div>
                    </div>
                  </div>

                  {/* Header Row */}
                  <div className="flex justify-center items-center mb-6 border-b-2 border-double border-slate-300 pb-6 text-center">
                    <div className="flex flex-col items-center w-full">
                      <h1 className="text-4xl font-bold text-green-800 tracking-tight mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                        {previewData.originatingSchool || 'GLOBAL DIGITAL ACADEMY'}
                      </h1>
                      <p className="text-sm text-slate-700 font-bold mb-1 uppercase tracking-wide">
                        {previewData.schoolAddress || 'Verified Network Institution'}
                      </p>
                      <p className="text-xs text-slate-600 font-mono">
                        Phone: {previewData.contactPhone || '+91-0000000000'} | E-mail: {previewData.contactEmail || 'admin@school.com'}
                      </p>
                    </div>
                  </div>

                  {/* Meta Details Row */}
                  <div className="flex justify-between text-base mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-wider">Serial No. :</span> 
                      <span className="font-mono font-bold text-lg">{previewData.timestamp.toString().slice(-4)}</span>
                    </div>
                    
                    <div className="text-right flex flex-col gap-4">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold tracking-wider">Registration No. :</span> 
                        <span className="inline-block border-b border-black w-48 text-center font-mono font-bold">GVN/{previewData.timestamp.toString().slice(-8)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold tracking-wider">Admission No. :</span> 
                        <span className="inline-block border-b border-black w-48 text-center font-mono font-bold">{previewData.profile.admissionNumber || previewData.profile.employeeId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Title & Seal */}
                  <div className="relative text-center mt-6 mb-10 flex flex-col items-center">
                    
                    <h2 className="text-5xl font-bold text-slate-900 tracking-widest" style={{ fontFamily: '"Old English Text MT", "Blackadder ITC", "Times New Roman", serif', textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>
                      Character Certificate
                    </h2>
                    
                    <div className="flex justify-center mt-3 opacity-80 items-center">
                      <div className="w-24 border-t-2 border-red-700 mx-2"></div>
                      <div className="w-3 h-3 border-2 border-red-700 rounded-full"></div>
                      <div className="w-24 border-t-2 border-red-700 mx-2"></div>
                    </div>
                  </div>

                  {/* Body Paragraph */}
                  <div className="text-[22px] leading-[2] italic mt-8 px-8 flex-1" style={{ fontFamily: 'Georgia, serif' }}>
                    <p className="mb-8">
                      This is to certify that Mr./Ms. 
                      <span className="inline-block border-b border-black w-64 text-center font-bold px-4 uppercase font-sans not-italic tracking-wider text-slate-800 mx-2">
                        {previewData.profile.firstName} {previewData.profile.lastName}
                      </span>
                      has been a bonafide {previewData.type.toLowerCase()} of this institution.
                    </p>

                    <p className="mb-8">
                      {previewData.behaviors && previewData.behaviors.length > 0 ? (
                        <span>
                          His/Her behavioral record contains <strong>{previewData.behaviors.length}</strong> official logs on the verification network, which must be reviewed by the receiving principal.
                        </span>
                      ) : (
                        <span>
                          His/Her conduct during the tenure of schooling has been good. He/She bears a good moral character.
                        </span>
                      )}
                    </p>

                    <p className="mb-8">
                      His/Her date of birth according to our school register is 
                      <span className="inline-block border-b border-black w-48 text-center font-bold px-4 font-sans not-italic mx-2 tracking-widest text-slate-800">
                        {previewData.profile.dob ? new Date(previewData.profile.dob).toLocaleDateString('en-GB').replace(/\//g, '-') : '______________'}
                      </span>.
                    </p>

                    <p className="mt-12 text-center font-semibold">
                      We wish him/her success in all his/her future endeavors.
                    </p>
                  </div>

                  {/* Footer / Signatures */}
                  <div className="mt-auto flex justify-between items-end px-4 pb-4">
                    {/* Date of Issue */}
                    <div className="italic text-lg pb-2 flex-1 flex flex-col items-start justify-end h-16">
                      <div>
                        <span className="font-bold mr-2">Date of Issue :</span> 
                        <span className="inline-block border-b border-black border-dashed w-32 text-center font-bold font-sans not-italic">
                          {new Date(previewData.timestamp).toLocaleDateString('en-GB').replace(/\//g, '-')}
                        </span>
                      </div>
                    </div>

                    {/* Manager Signature Block */}
                    <div className="text-center relative flex-1 flex flex-col items-center">
                      <div className="relative flex flex-col items-center justify-end h-16 mb-2 w-64">
                        {/* Signature Text */}
                        <div className="relative z-10 w-full border-b border-black pb-1">
                           <span className="text-3xl font-medium text-blue-900 absolute bottom-1 left-1/2 -translate-x-1/2 w-full -rotate-2 whitespace-nowrap" style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive', textShadow: '1px 1px 0px rgba(0,0,255,0.05)' }}>
                             {previewData.managerName || 'System Generated'}
                           </span>
                        </div>
                      </div>
                      <p className="font-bold uppercase tracking-widest text-sm text-slate-900 mt-1">Manager</p>
                      <p className="text-[10px] uppercase text-slate-600 mt-1 max-w-[200px] mx-auto leading-tight">
                        {previewData.originatingSchool || 'Verified Institution'}
                      </p>
                    </div>

                    {/* Principal Signature & Stamp Block */}
                    <div className="text-center relative flex-1 flex flex-col items-end">
                      <div className="relative flex flex-col items-center justify-end h-16 mb-2 w-64">
                        
                        {/* Signature Text (under the stamp) */}
                        <div className="relative z-10 w-full border-b border-black pb-1">
                           <span className="text-3xl font-medium text-blue-900 absolute bottom-1 left-1/2 -translate-x-1/2 w-full -rotate-3 whitespace-nowrap" style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive', textShadow: '1px 1px 0px rgba(0,0,255,0.05)' }}>
                             {previewData.principalName || 'System Generated'}
                           </span>
                        </div>

                        {/* Auto Generated SVG School Stamp (OVER the signature) */}
                        <div className="absolute top-2 right-2 w-32 h-32 opacity-80 -rotate-[15deg] mix-blend-multiply pointer-events-none z-20">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-700 animate-pulse" style={{ animationDuration: '4s' }}>
                            <defs>
                              <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                            </defs>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" />
                            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
                            <text fontSize="7" fontWeight="bold" fill="currentColor" letterSpacing="1">
                              <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                                ★ {previewData.originatingSchool?.substring(0, 35).toUpperCase() || 'VERIFIED INSTITUTION'} ★
                              </textPath>
                            </text>
                            <path d="M 40,50 L 48,58 L 60,40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="w-64 text-center">
                        <p className="font-bold uppercase tracking-widest text-sm text-slate-900 mt-1">Principal</p>
                        <p className="text-[10px] uppercase text-slate-600 mt-1 max-w-[200px] mx-auto leading-tight">
                          {previewData.originatingSchool || 'Verified Institution'}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 no-print">
                  <button 
                    onClick={() => {
                      const printContent = document.getElementById('transfer-certificate-print');
                      const originalContents = document.body.innerHTML;
                      document.body.innerHTML = printContent.outerHTML;
                      window.print();
                      document.body.innerHTML = originalContents;
                      window.location.reload();
                    }}
                    className="flex-1 py-4 bg-white dark:bg-card border-2 border-slate-200 dark:border-white/10 hover:border-slate-300 hover:bg-slate-50 text-foreground font-black text-lg rounded-2xl transition-colors premium-shadow flex justify-center items-center gap-2"
                  >
                    <Download className="w-6 h-6"/> Print Certificate
                  </button>

                  <button 
                    onClick={executeImport}
                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl transition-colors premium-shadow flex justify-center items-center gap-2"
                  >
                    <UserCheck className="w-6 h-6"/> Admit & Add to System
                  </button>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Behavior Modal */}
      <AnimatePresence>
        {showAddBehavior && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-3xl premium-shadow overflow-hidden border border-white/10">
              <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5">
                <h3 className="font-black text-lg">New Behavioral Record</h3>
                <button onClick={() => setShowAddBehavior(false)} className="p-2 hover:bg-black/10 rounded-full"><X className="w-4 h-4"/></button>
              </div>
              <form onSubmit={handleAddBehavior} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">Record Type</label>
                  <select 
                    value={newBehavior.recordType} 
                    onChange={e => setNewBehavior({...newBehavior, recordType: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none"
                  >
                    <option value="REMARK">Remark (Neutral)</option>
                    <option value="ACHIEVEMENT">Achievement (Positive)</option>
                    <option value="WARNING">Warning (Negative)</option>
                    <option value="COMPLAINT">Complaint (Severe Negative)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">Title</label>
                  <input required type="text" value={newBehavior.title} onChange={e => setNewBehavior({...newBehavior, title: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none"/>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">Description</label>
                  <textarea required value={newBehavior.description} onChange={e => setNewBehavior({...newBehavior, description: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none resize-none h-24"/>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">Impact Points</label>
                    <input type="number" value={newBehavior.points} onChange={e => setNewBehavior({...newBehavior, points: parseInt(e.target.value)})}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none"/>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">Reported By</label>
                    <input required type="text" value={newBehavior.reportedBy} onChange={e => setNewBehavior({...newBehavior, reportedBy: e.target.value})}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none"/>
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-foreground text-background font-black rounded-xl mt-4 hover:scale-[1.02] transition-transform">
                  Save Record
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Assignment Modal */}
      <AnimatePresence>
        {showImportModal && previewData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-3xl premium-shadow overflow-hidden border border-white/10">
              <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5">
                <h3 className="font-black text-lg">Assign Imported {previewData.type === 'STUDENT' ? 'Student' : 'Staff'}</h3>
                <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-black/10 rounded-full"><X className="w-4 h-4"/></button>
              </div>
              <form onSubmit={confirmImport} className="p-6 space-y-4">
                <p className="text-xs text-muted-foreground font-bold mb-4">
                  Please assign required details for the imported profile in your local database.
                </p>

                {previewData.type === 'STUDENT' ? (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">New Admission Number</label>
                      <input required type="text" value={importAssignment.admissionNumber} onChange={e => setImportAssignment({...importAssignment, admissionNumber: e.target.value})}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">Assign Class</label>
                      <select required value={importAssignment.classId} onChange={e => setImportAssignment({...importAssignment, classId: e.target.value, sectionId: ''})}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none">
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">Assign Section</label>
                      <select required value={importAssignment.sectionId} onChange={e => setImportAssignment({...importAssignment, sectionId: e.target.value})} disabled={!importAssignment.classId}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none disabled:opacity-50">
                        <option value="">Select Section</option>
                        {classes.find(c => c.id === importAssignment.classId)?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">New Employee ID</label>
                      <input required type="text" value={importAssignment.employeeId} onChange={e => setImportAssignment({...importAssignment, employeeId: e.target.value})}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">Department</label>
                      <input required type="text" value={importAssignment.department} onChange={e => setImportAssignment({...importAssignment, department: e.target.value})}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1.5">Designation</label>
                      <input required type="text" value={importAssignment.designation} onChange={e => setImportAssignment({...importAssignment, designation: e.target.value})}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl px-4 py-2.5 font-bold outline-none"/>
                    </div>
                  </>
                )}
                
                <button type="submit" className="w-full py-3 bg-emerald-500 text-white font-black rounded-xl mt-4 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4"/> Confirm Import
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
