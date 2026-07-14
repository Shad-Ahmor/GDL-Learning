import React, { useState } from 'react';
import { 
  Building, GraduationCap, DollarSign, Users, Unlock, Monitor, Shield, Sparkles,
  UploadCloud, Mail, Smartphone, MapPin, Sun, Moon, DownloadCloud, ShieldCheck, Briefcase,
  Calendar, FileText, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalContext } from '../../context/GlobalContext';
import { getStoredPermissions } from '../../lib/crypto/tokenEngine';
export default function SettingsModule({ closeSettings }) {
  const { settings, updateSetting, activeSession } = useGlobalContext();
  
  const currentRole = localStorage.getItem('gdl_current_role') || 'Admin';
  const activeTenant = localStorage.getItem('gdl_active_tenant');
  const storedPerms = activeTenant && activeTenant !== 'superadmin' ? getStoredPermissions(activeTenant) : null;
  
  const isSuperUser = currentRole === 'Super Admin' || activeTenant === 'superadmin';

  const hasPerm = (perms) => {
    if (isSuperUser) return true;
    if (!perms || perms.length === 0) return true;
    if (!storedPerms) return true;
    return perms.some(p => storedPerms.includes(p));
  };

  const availableTabs = [
    { id: 'profile', icon: Building, label: 'School Identity', perms: ['academic_school_profile'] },
    { id: 'academics', icon: GraduationCap, label: 'Academics & Exams', perms: ['exam_setup', 'academic_master_subjects'] },
    { id: 'finance', icon: DollarSign, label: 'Finance & Billing', perms: ['fees_overview'] },
    { id: 'payroll', icon: Users, label: 'HR & Payroll', perms: ['payroll_overview'] },
    { id: 'modules', icon: Unlock, label: 'Module Controller', isSuperAdminOnly: true },
    { id: 'appearance', icon: Monitor, label: 'Theme & Layout', perms: [] },
    { id: 'system', icon: Shield, label: 'Security & Backup', perms: ['verification_export'] },
    { id: 'about', icon: Sparkles, label: 'Developer & About', perms: [] }
  ].filter(tab => {
    if (tab.isSuperAdminOnly && !isSuperUser) return false;
    return hasPerm(tab.perms);
  });

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || 'appearance');
  const [savedMessage, setSavedMessage] = useState('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  const [selectedExportModules, setSelectedExportModules] = useState({
    setup: true,
    students: true,
    finance: true,
    attendance: true,
    payroll: true,
    exams: true
  });

  const [selectedRestoreModules, setSelectedRestoreModules] = useState({
    setup: true,
    students: true,
    finance: true,
    attendance: true,
    payroll: true,
    exams: true
  });

  const modulesList = [
    { key: 'setup', label: 'School Setup', desc: 'Identity, grading templates, and configs', icon: Building },
    { key: 'students', label: 'Students & Parents', desc: 'Admission tables and family directories', icon: GraduationCap },
    { key: 'finance', label: 'Fees & Invoicing', desc: 'Fee groups, structure plans, and invoices', icon: DollarSign },
    { key: 'attendance', label: 'Attendance logs', desc: 'Daily logs and subject attendance schedules', icon: Calendar },
    { key: 'payroll', label: 'Staff & Payroll', desc: 'Teacher profiles, working shifts, and payroll', icon: Users },
    { key: 'exams', label: 'Exams & Marks', desc: 'Mark entries, grade reports, and exams', icon: FileText }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMessage('Settings successfully saved across the platform.');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="h-full flex flex-col space-y-6 w-full text-left">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 inline-block mb-1">
            Platform Settings
          </h1>
          <p className="text-muted-foreground text-sm">Configure school information, academics, fees, HR payroll, and unlock modules.</p>
        </div>
        {closeSettings && (
          <button 
            type="button"
            onClick={closeSettings}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95 font-bold text-xs uppercase tracking-wider select-none shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Close Settings</span>
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0 relative">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-1.5 p-2.5 bg-black/[0.015] dark:bg-white/[0.015] rounded-[24px] border border-black/5 dark:border-white/5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar relative">
          {availableTabs.map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-[18px] text-xs transition-all text-left outline-none border-none relative bg-transparent cursor-pointer select-none ${
                  isTabActive 
                    ? 'text-primary-foreground font-extrabold shadow-sm scale-[1.02]' 
                    : 'text-muted-foreground hover:text-foreground font-semibold hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {isTabActive && (
                  <motion.div 
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/85 rounded-[18px] shadow-md shadow-primary/10 -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <tab.icon className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${isTabActive ? 'text-primary-foreground scale-105' : 'text-muted-foreground group-hover:text-primary'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="flex-1 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar pr-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Tab 1: Profile */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 space-y-6">
                  <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4 mb-6">
                    <div>
                      <h3 className="text-xl font-black text-foreground">School Identity</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Customize global branding and document header metadata.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-center bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/10 dark:border-white/10">
                    <div className="w-20 h-20 rounded-2xl bg-black/5 dark:bg-white/5 border-2 border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 premium-shadow relative group cursor-pointer">
                      {settings.schoolLogo ? (
                        <img src={settings.schoolLogo} alt="Logo Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      ) : (
                        <Building className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadCloud className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Institution Logo</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updateSetting('schoolLogo', reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary file:text-white hover:file:bg-primary/90 file:transition-colors cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">School Name</label>
                      <input 
                        type="text" 
                        required
                        value={settings.schoolName || ''}
                        onChange={(e) => updateSetting('schoolName', e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Tagline / Motto</label>
                      <input 
                        type="text" 
                        value={settings.schoolTitle || ''}
                        onChange={(e) => updateSetting('schoolTitle', e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Contact Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="email" 
                          value={settings.schoolEmail || 'admin@gdlsofts.com'}
                          onChange={(e) => updateSetting('schoolEmail', e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Contact Phone</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="text" 
                          value={settings.schoolPhone || '+91 98765 43210'}
                          onChange={(e) => updateSetting('schoolPhone', e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Institution Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="text" 
                          value={settings.schoolLocation || ''}
                          onChange={(e) => updateSetting('schoolLocation', e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Principal In-Charge</label>
                      <input 
                        type="text" 
                        value={settings.schoolPrincipal || 'Dr. Shadahmor Ahmed'}
                        onChange={(e) => updateSetting('schoolPrincipal', e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Affiliation Number / Code</label>
                      <input 
                        type="text" 
                        value={settings.schoolAffiliation || 'CBSE-REG-88204'}
                        onChange={(e) => updateSetting('schoolAffiliation', e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                    <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-transform duration-300">
                      Save Identity
                    </button>
                    {savedMessage && <span className="text-emerald-500 font-bold text-sm">{savedMessage}</span>}
                  </div>
                </form>
              )}

              {/* Tab 2: Academics */}
              {activeTab === 'academics' && (
                <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-foreground">Academics & Exams</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Control passing thresholds, grading methodologies, and scheduling behaviors.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Default Passing Marks (%)</label>
                      <input 
                        type="number" 
                        min="1"
                        max="100"
                        value={settings.minPassMarks || 33}
                        onChange={(e) => updateSetting('minPassMarks', parseInt(e.target.value))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Grace Marks Limit (Points)</label>
                      <input 
                        type="number" 
                        min="0"
                        max="10"
                        value={settings.graceMarksLimit || 5}
                        onChange={(e) => updateSetting('graceMarksLimit', parseInt(e.target.value))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Grading System</label>
                      <select 
                        value={settings.gradingSystem || 'cbse'}
                        onChange={(e) => updateSetting('gradingSystem', e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold text-sm appearance-none"
                      >
                        <option value="cbse">CBSE Standard (A1 to E)</option>
                        <option value="letter">Letter Grades (A+ to F)</option>
                        <option value="gpa">10.0 Grade Point Scale</option>
                        <option value="percentage">Percentage Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Attendance Tracking Mode</label>
                      <select 
                        value={settings.attendanceMode || 'daily'}
                        onChange={(e) => updateSetting('attendanceMode', e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold text-sm appearance-none"
                      >
                        <option value="daily">Daily Attendance (Once Per Student)</option>
                        <option value="subject">Subject-wise Attendance (Per Lecture)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Invigilation Assignment Strategy</label>
                      <select 
                        value={settings.invigilationStrategy || 'balance'}
                        onChange={(e) => updateSetting('invigilationStrategy', e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold text-sm appearance-none"
                      >
                        <option value="balance">Equal Workload Balance (Fair Share)</option>
                        <option value="random">Dynamic Random Scheduling</option>
                        <option value="seniority">Senior Staff Waiver Allocation</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                    <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-transform duration-300">
                      Save Academic Rules
                    </button>
                    {savedMessage && <span className="text-emerald-500 font-bold text-sm">{savedMessage}</span>}
                  </div>
                </form>
              )}

              {/* Tab 3: Finance */}
              {activeTab === 'finance' && (
                <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-foreground">Finance & Billing</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Define currency symbols, invoicing structures, tax rates, and late fee policies.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Currency Display Symbol</label>
                      <input 
                        type="text" 
                        value={settings.currencySymbol || '₹'}
                        onChange={(e) => updateSetting('currencySymbol', e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Fee Receipt Prefix</label>
                      <input 
                        type="text" 
                        value={settings.invoicePrefix || 'GDL/REC/'}
                        onChange={(e) => updateSetting('invoicePrefix', e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Late Payment Fine (Rate / Day)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={settings.fineRate || 50}
                        onChange={(e) => updateSetting('fineRate', parseInt(e.target.value))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Tax Rate (GST / VAT %)</label>
                      <input 
                        type="number" 
                        min="0"
                        max="30"
                        value={settings.taxRate || 18}
                        onChange={(e) => updateSetting('taxRate', parseInt(e.target.value))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Accepted Payment Gateways</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['UPI QR Code', 'Credit/Debit Card', 'Bank Wire', 'Cash Desk'].map((gw) => {
                          const gwKey = `gw_${gw.replace(/\s+/g, '').toLowerCase()}`;
                          const isEnabled = settings[gwKey] !== false;
                          return (
                            <button
                              type="button"
                              key={gw}
                              onClick={() => updateSetting(gwKey, !isEnabled)}
                              className={`p-3.5 rounded-xl border text-xs font-bold transition-all ${
                                isEnabled 
                                  ? 'bg-primary/10 border-primary text-primary' 
                                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
                              }`}
                            >
                              {gw}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                    <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-transform duration-300">
                      Save Billing Config
                    </button>
                    {savedMessage && <span className="text-emerald-500 font-bold text-sm">{savedMessage}</span>}
                  </div>
                </form>
              )}

              {/* Tab 4: HR & Payroll */}
              {activeTab === 'payroll' && (
                <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-foreground">HR & Payroll Settings</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Configure employment parameters, working limits, PF deductions, and leave policies.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Standard Monthly Working Days</label>
                      <input 
                        type="number" 
                        min="20"
                        max="31"
                        value={settings.payrollDays || 26}
                        onChange={(e) => updateSetting('payrollDays', parseInt(e.target.value))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Daily Shift Hours Limit</label>
                      <input 
                        type="number" 
                        min="4"
                        max="16"
                        value={settings.payrollShiftHours || 8}
                        onChange={(e) => updateSetting('payrollShiftHours', parseInt(e.target.value))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Standard Casual Leaves / Month</label>
                      <input 
                        type="number" 
                        step="0.5"
                        min="0"
                        max="5"
                        value={settings.monthlyLeaves || 1.5}
                        onChange={(e) => updateSetting('monthlyLeaves', parseFloat(e.target.value))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">PF Deductions Rate (%)</label>
                      <input 
                        type="number" 
                        min="0"
                        max="20"
                        value={settings.providentFundRate || 12}
                        onChange={(e) => updateSetting('providentFundRate', parseInt(e.target.value))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Overtime Pay Rate (Amount / Hour)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={settings.overtimePayRate || 250}
                        onChange={(e) => updateSetting('overtimePayRate', parseInt(e.target.value))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all" 
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                    <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-transform duration-300">
                      Save HR Rules
                    </button>
                    {savedMessage && <span className="text-emerald-500 font-bold text-sm">{savedMessage}</span>}
                  </div>
                </form>
              )}

              {/* Tab 5: Module Controller */}
              {activeTab === 'modules' && (
                <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-foreground">Module Controller</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Toggle active states of premium enterprise features to lock/unlock them dynamically.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { name: 'School Setup', defaultLocked: false },
                      { name: 'Students', defaultLocked: false },
                      { name: 'Parents', defaultLocked: false },
                      { name: 'Fees & Finance', defaultLocked: false },
                      { name: 'Attendance', defaultLocked: false },
                      { name: 'Transport', defaultLocked: true },
                      { name: 'Hostel', defaultLocked: true },
                      { name: 'Visitor', defaultLocked: true },
                      { name: 'Library', defaultLocked: true },
                      { name: 'Inventory', defaultLocked: true },
                      { name: 'Payroll', defaultLocked: false },
                      { name: 'Exams', defaultLocked: false },
                      { name: 'Reports', defaultLocked: false }
                    ].map((mod) => {
                      const modKey = mod.name.toLowerCase();
                      const isLocked = settings.moduleLocks && settings.moduleLocks[modKey] !== undefined
                        ? settings.moduleLocks[modKey]
                        : mod.defaultLocked;
                      return (
                        <div 
                          key={mod.name}
                          className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10"
                        >
                          <div>
                            <span className="font-extrabold text-sm text-foreground">{mod.name}</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {isLocked ? '🔒 Currently locked (restricted)' : '🔓 Accessible to administrators'}
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const currentLocks = settings.moduleLocks || {};
                              const updated = {
                                ...currentLocks,
                                [modKey]: !isLocked
                              };
                              updateSetting('moduleLocks', updated);
                            }}
                            className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer bg-transparent border ${
                              isLocked 
                                ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10' 
                                : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                            }`}
                          >
                            {isLocked ? 'Locked' : 'Unlocked'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* License Input */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 rounded-2xl border border-amber-500/20 space-y-4">
                    <div>
                      <span className="font-black text-xs text-amber-500 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> Enterprise Activation Key</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Enter your licensing key from GDLSOFTWARE to unlock all features instantly.</p>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="GDL-xxxx-xxxx-xxxx"
                        value={licenseKeyInput}
                        onChange={(e) => setLicenseKeyInput(e.target.value)}
                        className="flex-1 bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-xs text-foreground uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (licenseKeyInput.toUpperCase() === 'GDL-SOFT-LICENSE-2026') {
                            updateSetting('moduleLocks', {
                              'school setup': false,
                              students: false,
                              parents: false,
                              'fees & finance': false,
                              attendance: false,
                              transport: false,
                              hostel: false,
                              visitor: false,
                              library: false,
                              inventory: false,
                              payroll: false,
                              exams: false,
                              reports: false
                            });
                            setLicenseKeyInput('');
                            alert("Congratulations! All platform modules successfully unlocked with the Activation License.");
                          } else {
                            alert("Invalid Activation Key. Please contact GDLSOFTWARE (www.gdlsofts.com) to purchase a license key.");
                          }
                        }}
                        className="px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl text-xs hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                      >
                        Activate All
                      </button>
                    </div>
                    <p className="text-[9px] text-muted-foreground italic">
                      Tip: Use Key <span className="font-mono bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-amber-500 select-all font-bold">GDL-SOFT-LICENSE-2026</span> to unlock premium features for demo evaluation.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 6: Theme & Layout */}
              {activeTab === 'appearance' && (
                <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-foreground">Theme Settings</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Customize default color preferences and responsive layout structures.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div 
                      onClick={() => updateSetting('theme', 'light')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        settings.theme === 'light' ? 'border-primary bg-primary/5' : 'border-black/5 dark:border-white/5 hover:border-primary/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                        <Sun className="w-6 h-6" />
                      </div>
                      <span className="font-extrabold text-sm text-foreground block">Light Mode</span>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Bright theme for lit workspaces.</p>
                    </div>

                    <div 
                      onClick={() => updateSetting('theme', 'dark')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        settings.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-black/5 dark:border-white/5 hover:border-primary/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                        <Moon className="w-6 h-6" />
                      </div>
                      <span className="font-extrabold text-sm text-foreground block">Dark Mode</span>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Low glare theme suited for night use.</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
                    <div>
                      <span className="font-black text-xs text-foreground block">Theme Highlight Accent Color</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Choose your primary aesthetic color across buttons and cards.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Orange', class: 'bg-orange-500', key: 'orange' },
                        { name: 'Blue', class: 'bg-blue-500', key: 'blue' },
                        { name: 'Emerald', class: 'bg-emerald-500', key: 'emerald' },
                        { name: 'Purple', class: 'bg-purple-500', key: 'purple' },
                        { name: 'Rose', class: 'bg-rose-500', key: 'rose' }
                      ].map((color) => {
                        const isSelected = settings.themeColor === color.key || (!settings.themeColor && color.key === 'blue');
                        return (
                          <button
                            type="button"
                            key={color.key}
                            onClick={() => {
                              updateSetting('themeColor', color.key);
                            }}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-foreground text-foreground bg-black/5 dark:bg-white/5 shadow-sm' 
                                : 'border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/5 hover:dark:bg-white/5'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full ${color.class} inline-block`}></span>
                            {color.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 7: Security & Backup */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-foreground">Security & Backups</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Secure your database records and schedule automated platform backups.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Selective Export Card */}
                      <div className="p-6 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3 mb-3">
                            <span className="font-extrabold text-base text-foreground flex items-center gap-2">
                              <DownloadCloud className="w-5 h-5 text-emerald-500" /> Selective Export
                            </span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">
                              {Object.values(selectedExportModules).filter(Boolean).length} Selected
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                            Select the specific database modules to backup. Only the selected datasets will be bundled.
                          </p>

                          {/* Quick selectors */}
                          <div className="flex items-center justify-between mb-3 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl border border-black/5 dark:border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Database Sections</span>
                            <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => setSelectedExportModules({ setup: true, students: true, finance: true, attendance: true, payroll: true, exams: true })}
                                className="text-[9px] font-extrabold text-primary hover:underline bg-transparent border-none outline-none cursor-pointer"
                              >
                                Select All
                              </button>
                              <span className="text-[9px] text-muted-foreground">•</span>
                              <button 
                                type="button" 
                                onClick={() => setSelectedExportModules({ setup: false, students: false, finance: false, attendance: false, payroll: false, exams: false })}
                                className="text-[9px] font-extrabold text-muted-foreground hover:underline bg-transparent border-none outline-none cursor-pointer"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>

                          {/* Grid selectors */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {modulesList.map((m) => {
                              const isSelected = selectedExportModules[m.key];
                              const Icon = m.icon;
                              return (
                                <div 
                                  key={m.key}
                                  onClick={() => setSelectedExportModules(prev => ({ ...prev, [m.key]: !isSelected }))}
                                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                                    isSelected 
                                      ? 'bg-primary/10 border-primary/30 text-foreground shadow-sm' 
                                      : 'bg-black/[0.015] dark:bg-white/[0.015] border-black/5 dark:border-white/5 text-muted-foreground hover:bg-black/5 hover:dark:bg-white/5'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-black/5 dark:bg-white/5 text-muted-foreground'}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-extrabold text-[11px] block text-foreground leading-tight">{m.label}</span>
                                    <p className="text-[9px] text-muted-foreground leading-tight mt-0.5 truncate">{m.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <button 
                          onClick={async () => {
                            const selectedKeys = Object.entries(selectedExportModules)
                              .filter(([_, isSel]) => isSel)
                              .map(([k]) => modulesList.find(m => m.key === k)?.label || k);
                            
                            if (selectedKeys.length === 0) {
                              alert("Please select at least one module to export.");
                              return;
                            }
                            
                            try {
                              const response = await fetch('http://localhost:1422/api/system/backup/export', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ selectedModules: selectedExportModules })
                              });
                              
                              if (!response.ok) throw new Error("Failed to generate backup");
                              
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `gdl_backup_selective_${new Date().toISOString().split('T')[0]}.db`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error(err);
                              alert("Error exporting backup: " + err.message);
                            }
                          }}
                          className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 transition-all cursor-pointer shadow-md mt-4"
                        >
                          Export Selected ({Object.values(selectedExportModules).filter(Boolean).length}) Modules
                        </button>
                      </div>

                      {/* Selective Restore Card */}
                      <div className="p-6 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3 mb-3">
                            <span className="font-extrabold text-base text-foreground flex items-center gap-2">
                              <UploadCloud className="w-5 h-5 text-amber-500" /> Selective Restore
                            </span>
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full">
                              {Object.values(selectedRestoreModules).filter(Boolean).length} Selected
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                            Select the database modules to overwrite from backup. Other modules will remain unaffected.
                          </p>

                          {/* Quick selectors */}
                          <div className="flex items-center justify-between mb-3 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl border border-black/5 dark:border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Database Sections</span>
                            <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => setSelectedRestoreModules({ setup: true, students: true, finance: true, attendance: true, payroll: true, exams: true })}
                                className="text-[9px] font-extrabold text-amber-500 hover:underline bg-transparent border-none outline-none cursor-pointer"
                              >
                                Select All
                              </button>
                              <span className="text-[9px] text-muted-foreground">•</span>
                              <button 
                                type="button" 
                                onClick={() => setSelectedRestoreModules({ setup: false, students: false, finance: false, attendance: false, payroll: false, exams: false })}
                                className="text-[9px] font-extrabold text-muted-foreground hover:underline bg-transparent border-none outline-none cursor-pointer"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>

                          {/* Grid selectors */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {modulesList.map((m) => {
                              const isSelected = selectedRestoreModules[m.key];
                              const Icon = m.icon;
                              return (
                                <div 
                                  key={m.key}
                                  onClick={() => setSelectedRestoreModules(prev => ({ ...prev, [m.key]: !isSelected }))}
                                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                                    isSelected 
                                      ? 'bg-amber-500/10 border-amber-500/30 text-foreground shadow-sm' 
                                      : 'bg-black/[0.015] dark:bg-white/[0.015] border-black/5 dark:border-white/5 text-muted-foreground hover:bg-black/5 hover:dark:bg-white/5'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-amber-500 text-white' : 'bg-black/5 dark:bg-white/5 text-muted-foreground'}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-extrabold text-[11px] block text-foreground leading-tight">{m.label}</span>
                                    <p className="text-[9px] text-muted-foreground leading-tight mt-0.5 truncate">{m.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-3 mt-4">
                          <p className="text-[10px] text-red-500 bg-red-500/10 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 border border-red-500/20">
                            ⚠️ Restoring data replaces current database values for the selected modules.
                          </p>
                          <button 
                            onClick={() => {
                              const selectedKeys = Object.entries(selectedRestoreModules)
                                .filter(([_, isSel]) => isSel)
                                .map(([k]) => modulesList.find(m => m.key === k)?.label || k);
                              
                              if (selectedKeys.length === 0) {
                                alert("Please select at least one module to restore.");
                                return;
                              }
                              
                              const confirmed = window.confirm(
                                "⚠️ DANGER: Restoring data will overwrite all current entries in:\n" +
                                selectedKeys.map(k => "• " + k).join("\n") + "\n\n" +
                                "Do you want to proceed and select the .db snapshot file?"
                              );
                              
                              if (!confirmed) return;

                              // Create a temporary file input
                              const fileInput = document.createElement('input');
                              fileInput.type = 'file';
                              fileInput.accept = '.db';
                              
                              fileInput.onchange = async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                
                                try {
                                  const fileData = await file.arrayBuffer();
                                  const response = await fetch('http://localhost:1422/api/system/backup/restore', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/octet-stream',
                                      'x-selected-modules': JSON.stringify(selectedRestoreModules)
                                    },
                                    body: fileData
                                  });
                                  
                                  const result = await response.json();
                                  if (!response.ok) throw new Error(result.error || "Failed to restore backup");
                                  
                                  alert("Database successfully restored for selected modules. The page will now reload.");
                                  window.location.reload();
                                } catch (err) {
                                  console.error(err);
                                  alert("Error restoring backup: " + err.message);
                                }
                              };
                              
                              fileInput.click();
                            }}
                            className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl text-xs hover:bg-amber-600 transition-all cursor-pointer shadow-md"
                          >
                            Select & Restore ({Object.values(selectedRestoreModules).filter(Boolean).length}) Modules
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="glass-panel p-8 rounded-3xl border border-red-500/20 bg-red-500/[0.02] space-y-6">
                    <div>
                      <span className="text-red-500 font-black text-sm flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-red-500"/> Danger Zone</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Critical operations that permanently erase database tables or reset global cache configurations.</p>
                    </div>

                    <div className="p-4 bg-red-500/[0.03] rounded-xl border border-red-500/10 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-extrabold text-xs text-foreground block">Reset Platform Cache</span>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Clear local caching structures and reset settings properties back to defaults.</p>
                      </div>
                      <button 
                        onClick={() => setResetConfirmOpen(true)}
                        className="px-5 py-2.5 bg-red-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-red-600 transition-all cursor-pointer"
                      >
                        Reset Cache
                      </button>
                    </div>

                    {/* Reset Confirmation Modal */}
                    <AnimatePresence>
                      {resetConfirmOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card w-full max-w-sm rounded-[2rem] p-8 border border-red-500/20 text-center premium-shadow"
                          >
                            <span className="text-red-500 font-black text-lg block mb-2">Are you absolutely sure?</span>
                            <p className="text-muted-foreground text-xs font-semibold leading-relaxed mb-6">
                              This operation will immediately wipe your local settings, session states, and restore default parameters. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => setResetConfirmOpen(false)}
                                className="flex-1 py-2.5 bg-black/5 dark:bg-white/5 text-muted-foreground font-bold rounded-xl text-xs hover:bg-black/10 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => {
                                  localStorage.clear();
                                  window.location.reload();
                                }}
                                className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-xs hover:bg-red-600 transition-colors"
                              >
                                Yes, Reset Settings
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Tab 8: About */}
              {activeTab === 'about' && (
                <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Briefcase className="w-64 h-64" />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <div>
                      <h2 className="text-3xl font-black text-foreground">GDLLearning ERP</h2>
                      <p className="text-primary font-bold text-sm mt-0.5">Professional Enterprise Suite (v1.0.0)</p>
                    </div>
                    
                    <div className="space-y-6 max-w-2xl text-left">
                      <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 space-y-4">
                        <div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Designed & Engineered By</span>
                          <p className="text-xl font-black text-foreground">GDLSOFTWARE</p>
                          <a href="https://www.gdlsofts.com" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-xs inline-block">www.gdlsofts.com</a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-black/5 dark:border-white/5">
                          <div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Company Owner</span>
                            <span className="text-sm font-extrabold text-foreground">Goodluck</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Company Location</span>
                            <span className="text-sm font-extrabold text-foreground">Mumbai, Maharashtra, India</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 font-semibold text-sm">
                        <div className="flex justify-between items-center py-3 border-b border-black/5 dark:border-white/5">
                          <span className="text-muted-foreground font-semibold text-xs">Enterprise License Status</span>
                          <span className="text-emerald-500 font-bold bg-emerald-500/10 px-3.5 py-1 rounded-full text-xs">Active (Lifetime Plan)</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-black/5 dark:border-white/5">
                          <span className="text-muted-foreground font-semibold text-xs">Active Academic Term</span>
                          <span className="font-bold text-foreground text-xs">{activeSession?.name || 'Academic Session 2025-2026'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-black/5 dark:border-white/5">
                          <span className="text-muted-foreground font-semibold text-xs">Hardware Fingerprint ID</span>
                          <span className="font-mono bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1 rounded-lg text-xs text-foreground">A8B4-9F22-CC01-19B4</span>
                        </div>
                        {isSuperUser && (
                          <div className="flex justify-between items-center py-3">
                            <span className="text-muted-foreground font-semibold text-xs">Core Technology Stack</span>
                            <span className="font-bold text-foreground text-xs">Tauri v2 + Node Sidecar + SQLite + Prisma + React</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
