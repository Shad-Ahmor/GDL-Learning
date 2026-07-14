import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, Plus, X, CheckCircle2, Edit3, Trash2, Search, UserCircle, Phone, 
  MapPin, Clock, Calendar, BookOpen, GraduationCap, ArrowUpDown, Filter,
  ChevronLeft, ChevronRight, Eye, Briefcase, Hash, User, Download, FileCheck, Upload, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import Modal from '../../components/ui/Modal';
import * as XLSX from 'xlsx';

const apiBase = 'http://localhost:1422/api';

const countryCodes = [
  { code: '+91', label: 'IN (+91)' },
  { code: '+1', label: 'US (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+61', label: 'AU (+61)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+81', label: 'JP (+81)' },
];

export default function StudentModule() {
  const location = useLocation();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [schoolConfig, setSchoolConfig] = useState(null);
  
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('firstName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterClass, setFilterClass] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // View Profile State
  const [viewStudent, setViewStudent] = useState(null);

  // Admission Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    sessionId: '',
    admissionNumber: '',
    enrollmentNumber: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    admissionDate: '',
    classId: '',
    sectionId: '',
    mobileNumber: '',
    mobileCountryCode: '+91',
    fatherName: '',
    primaryPhone: '',
    primaryCountryCode: '+91'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [importClassId, setImportClassId] = useState('');
  const [importSectionId, setImportSectionId] = useState('');
  const [importSections, setImportSections] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importMessage, setImportMessage] = useState('');
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stuRes, clsRes, subRes, msRes, tRes, sessRes, schoolRes] = await Promise.all([
        fetch(`${apiBase}/students`),
        fetch(`${apiBase}/setup/classes`),
        fetch(`${apiBase}/setup/subjects`),
        fetch(`${apiBase}/setup/master-subjects`),
        fetch(`${apiBase}/hr/employees`),
        fetch(`${apiBase}/setup/sessions`),
        fetch(`${apiBase}/setup/school`)
      ]);
      if(stuRes.ok) setStudents(await stuRes.json());
      if(clsRes.ok) setClasses(await clsRes.json());
      if(subRes.ok) setSubjects(await subRes.json());
      if(msRes.ok) setMasterSubjects(await msRes.json());
      if(tRes.ok) setTeachers(await tRes.json());
      if(sessRes.ok) setSessions(await sessRes.json());
      if(schoolRes.ok) setSchoolConfig(await schoolRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.openAdmissionModal && sessions.length > 0) {
      const activeSession = sessions.find(s => s.isActive)?.id || '';
      setForm({
        id: null,
        sessionId: activeSession,
        admissionNumber: `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        enrollmentNumber: '',
        firstName: '',
        lastName: '',
        dob: '',
        gender: 'Male',
        admissionDate: new Date().toISOString().split('T')[0],
        classId: '',
        sectionId: '',
        mobileCountryCode: '+91',
        mobileNumber: '',
        fatherName: '',
        motherName: '',
        primaryCountryCode: '+91',
        primaryPhone: ''
      });
      setModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, sessions]);

  useEffect(() => {
    if (form.classId) {
      const cls = classes.find(c => c.id === form.classId);
      setSections(cls ? cls.sections : []);
    } else {
      setSections([]);
    }
  }, [form.classId, classes]);

  useEffect(() => {
    if (importClassId) {
      const cls = classes.find(c => c.id === importClassId);
      setImportSections(cls ? cls.sections : []);
      setImportSectionId(cls && cls.sections.length > 0 ? cls.sections[0].id : '');
    } else {
      setImportSections([]);
      setImportSectionId('');
    }
  }, [importClassId, classes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = form.id ? `${apiBase}/students/${form.id}` : `${apiBase}/students/admission`;
      const method = form.id ? 'PUT' : 'POST';

      const payload = {
        ...form,
        mobileNumber: form.mobileNumber ? `${form.mobileCountryCode} ${form.mobileNumber}` : '',
        primaryPhone: form.primaryPhone ? `${form.primaryCountryCode} ${form.primaryPhone}` : ''
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save student');
      }
      
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(`Error saving student: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (stu) => {
    // Parse mobile number: supports "+91 9876543210" or "9876543210" or "+919876543210"
    const mRaw = stu.mobileNumber || '';
    const mMatch = mRaw.match(/^(\+\d{1,4})\s*(.+)$/);
    const mCode = mMatch ? mMatch[1] : '+91';
    const mNum  = mMatch ? mMatch[2].trim() : mRaw.replace(/^\+\d{1,4}\s*/, '');

    // Parse parent phone similarly
    const pRaw = stu.parent?.primaryPhone || '';
    const pMatch = pRaw.match(/^(\+\d{1,4})\s*(.+)$/);
    const pCode = pMatch ? pMatch[1] : '+91';
    const pNum  = pMatch ? pMatch[2].trim() : pRaw.replace(/^\+\d{1,4}\s*/, '');

    setForm({
      id: stu.id,
      // sessionId lives on the class, not directly on student
      sessionId: stu.class?.sessionId || '',
      admissionNumber: stu.admissionNumber,
      enrollmentNumber: stu.enrollmentNumber || '',
      firstName: stu.firstName,
      lastName: stu.lastName,
      dob: new Date(stu.dob).toISOString().split('T')[0],
      gender: stu.gender,
      admissionDate: new Date(stu.admissionDate).toISOString().split('T')[0],
      classId: stu.classId,
      sectionId: stu.sectionId,
      mobileCountryCode: mCode,
      mobileNumber: mNum,
      fatherName: stu.parent?.fatherName || '',
      motherName: stu.parent?.motherName || '',
      primaryCountryCode: pCode,
      primaryPhone: pNum
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if(!window.confirm(`Are you sure you want to delete the student "${name}"?\nThis deletes all their data.`)) return;
    try {
      const res = await fetch(`${apiBase}/students/${id}`, { method: 'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error deleting student.");
    }
  };

  let processedStudents = [...students];

  if (filterClass !== 'all') {
    processedStudents = processedStudents.filter(s => s.classId === filterClass);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    processedStudents = processedStudents.filter(s => 
      (s.firstName + ' ' + s.lastName).toLowerCase().includes(term) ||
      s.admissionNumber.toLowerCase().includes(term) ||
      s.parent?.primaryPhone?.includes(term)
    );
  }

  processedStudents.sort((a, b) => {
    let aVal, bVal;
    if (sortBy === 'firstName') {
      aVal = a.firstName.toLowerCase();
      bVal = b.firstName.toLowerCase();
    } else if (sortBy === 'admissionNumber') {
      aVal = a.admissionNumber.toLowerCase();
      bVal = b.admissionNumber.toLowerCase();
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(processedStudents.length / itemsPerPage));
  const currentStudents = processedStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, filterClass]);

  const getStudentSchedule = (classId, sectionId) => {
    if (!classId || !sectionId) return [];
    
    return subjects.filter(s => s.classId === classId && s.sectionId === sectionId).map(sub => {
      const ms = masterSubjects.find(m => m.id === sub.masterSubjectId);
      const teacher = sub.teacher || teachers.find(t => t.id === sub.teacherId);
      return {
        ...sub,
        masterSubject: ms,
        teacher: teacher
      };
    }).sort((a, b) => {
      const aTime = a.startTime || '99:99';
      const bTime = b.startTime || '99:99';
      if (aTime < bTime) return -1;
      if (aTime > bTime) return 1;
      return 0;
    });
  };

  const handleExportToExcel = () => {
    const exportData = processedStudents.map(stu => ({
      'Admission No': stu.admissionNumber,
      'Enrollment No': stu.enrollmentNumber || 'N/A',
      'First Name': stu.firstName,
      'Last Name': stu.lastName,
      'Class': stu.class?.name || 'N/A',
      'Section': stu.section?.name || 'N/A',
      'Gender': stu.gender,
      'Date of Birth': new Date(stu.dob).toLocaleDateString(),
      'Mobile Number': stu.mobileNumber || 'N/A',
      'Father Name': stu.parent?.fatherName || 'N/A',
      'Mother Name': stu.parent?.motherName || 'N/A',
      'Parent Phone': stu.parent?.primaryPhone || 'N/A',
      'Admission Date': new Date(stu.admissionDate).toLocaleDateString(),
      'Status': stu.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    const columnWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 10 }, 
      { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, 
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
    ];
    XLSX.writeFile(workbook, `Students_Directory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'First Name': 'Rahul',
        'Last Name': 'Kumar',
        'Admission Number': 'ADM-2026-101',
        'Enrollment Number': 'ENR-2026-101',
        'Date of Birth (YYYY-MM-DD)': '2018-05-15',
        'Gender (Male/Female)': 'Male',
        'Father Name': 'Suresh Kumar',
        'Mother Name': 'Sunita Devi',
        'Mobile Number': '9876543210',
        'Parent Phone': '9876543210'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 25 },
      { wch: 22 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
    ];
    XLSX.writeFile(wb, 'student_import_template.xlsx');
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!importClassId || !importSectionId) {
      alert('Please select both Class and Section');
      return;
    }
    if (!importFile) {
      alert('Please select an Excel file to import');
      return;
    }

    setIsImporting(true);
    setImportMessage('Reading Excel file...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert('No student data found in the Excel file.');
          setIsImporting(false);
          setImportMessage('');
          return;
        }

        setImportMessage(`Importing ${jsonData.length} students... Please wait.`);

        let successCount = 0;
        let failCount = 0;
        const activeSession = sessions.find(s => s.isActive)?.id || '';

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const firstName = row['First Name'] || row['firstName'];
          const lastName = row['Last Name'] || row['lastName'] || '';

          if (!firstName) {
            failCount++;
            continue;
          }

          let dob = row['Date of Birth (YYYY-MM-DD)'] || row['dob'] || '';
          if (typeof dob === 'number') {
            const date = new Date((dob - 25569) * 86400 * 1000);
            dob = date.toISOString().split('T')[0];
          } else if (dob) {
            const dateParsed = new Date(dob);
            if (!isNaN(dateParsed.getTime())) {
              dob = dateParsed.toISOString().split('T')[0];
            } else {
              dob = '';
            }
          }

          const payload = {
            sessionId: activeSession,
            classId: importClassId,
            sectionId: importSectionId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            admissionNumber: row['Admission Number'] || `ADM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
            enrollmentNumber: row['Enrollment Number'] || '',
            dob: dob || new Date().toISOString().split('T')[0],
            gender: row['Gender (Male/Female)'] || row['gender'] || 'Male',
            admissionDate: new Date().toISOString().split('T')[0],
            mobileCountryCode: '+91',
            mobileNumber: row['Mobile Number'] || '',
            fatherName: row['Father Name'] || '',
            motherName: row['Mother Name'] || '',
            primaryCountryCode: '+91',
            primaryPhone: row['Parent Phone'] || ''
          };

          setImportMessage(`Importing student ${i + 1} of ${jsonData.length}...`);

          try {
            const res = await fetch(`${apiBase}/students/admission`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (err) {
            failCount++;
          }
        }

        alert(`Import process complete!\nSuccessfully imported: ${successCount} students.\nFailed: ${failCount}`);
        setImportModalOpen(false);
        setImportFile(null);
        fetchData();
      } catch (err) {
        alert('Error parsing Excel file: ' + err.message);
      } finally {
        setIsImporting(false);
        setImportMessage('');
      }
    };
    reader.onerror = () => {
      alert('Failed to read the file.');
      setIsImporting(false);
      setImportMessage('');
    };
    reader.readAsArrayBuffer(importFile);
  };

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse font-medium">Loading Student data...</div>;

  return (
    <div className="space-y-8 h-full overflow-auto pb-20 w-full text-left px-2">
      <div className="w-full text-left flex flex-col xl:flex-row xl:justify-between xl:items-start xl:items-center gap-4 bg-card/40 dark:bg-white/[0.02] p-6 rounded-3xl border border-black/5 dark:border-white/5 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-left inline-block">Student Directory</h1>
            <p className="text-muted-foreground mt-1 text-sm text-left">Manage admissions, profiles, and academic associations.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center xl:justify-end">
            <button onClick={handleExportToExcel} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-500/20 hover:scale-105 transition-all whitespace-nowrap">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button onClick={() => setImportModalOpen(true)} className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-500/20 hover:scale-105 transition-all whitespace-nowrap">
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <button onClick={() => navigate('/students/promotion')} className="bg-card text-foreground px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-all premium-shadow border border-black/5 dark:border-white/10 whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5" /> Promotion
            </button>
            
            {/* Primary Action Group */}
            <div className="flex items-center gap-2">
              <button onClick={() => setUpgradeModalOpen(true)} className="bg-sky-500/10 text-sky-600 dark:text-sky-400 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-sky-500/20 hover:scale-105 transition-all whitespace-nowrap">
                <FileCheck className="w-3.5 h-3.5" /> Transfer Cert.
              </button>
              <button onClick={() => {
                const activeSession = sessions.find(s => s.isActive)?.id || '';
                setForm({
                  id: null, sessionId: activeSession, admissionNumber: `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`, enrollmentNumber: '', firstName: '', lastName: '', dob: '', gender: 'Male', admissionDate: new Date().toISOString().split('T')[0], classId: '', sectionId: '', mobileCountryCode: '+91', mobileNumber: '', fatherName: '', motherName: '', primaryCountryCode: '+91', primaryPhone: ''
                });
                setModalOpen(true);
              }} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] whitespace-nowrap">
                <Plus className="w-3.5 h-3.5" /> New Admission
              </button>
            </div>
          </div>
        </div>

      <div className="relative glass-panel p-1 rounded-[2.5rem] group overflow-hidden shadow-xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 blur-3xl opacity-50 pointer-events-none" />
        
        <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
          <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs border-b border-black/5 dark:border-white/5 pb-4 mb-8 flex items-center gap-2">
            <Users className="w-4 h-4" /> Registered Students
          </h4>
        
          {/* Search, Filter and Sort Bar */}
          <div className="relative mb-8 flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1 group/search">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search students by name, admission no, or parent phone..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-blue-500/50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-blue-500/20 text-foreground transition-all font-medium"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative min-w-[160px] flex items-center bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-blue-500/50 transition-all focus-within:ring-4 focus-within:ring-blue-500/20">
                <Filter className="w-4 h-4 absolute left-4 text-muted-foreground pointer-events-none" />
                <select 
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full bg-transparent pl-10 pr-2 py-4 outline-none text-foreground font-bold appearance-none cursor-pointer flex-1"
                >
                  <option value="all">All Classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="relative min-w-[160px] flex items-center bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-blue-500/50 transition-all focus-within:ring-4 focus-within:ring-blue-500/20">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-transparent pl-4 pr-2 py-4 outline-none text-foreground font-bold appearance-none cursor-pointer flex-1"
                >
                  <option value="firstName">Sort by Name</option>
                  <option value="admissionNumber">Sort by Adm No</option>
                </select>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
                  className="px-3 hover:text-blue-500 transition-colors border-l border-black/10 dark:border-white/10 h-full flex items-center justify-center text-muted-foreground"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {processedStudents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-medium border-2 border-dashed border-blue-500/20 dark:border-blue-500/20 rounded-3xl bg-blue-500/5 dark:bg-blue-500/5 flex flex-col items-center justify-center gap-4">
              <div className="p-4 bg-blue-500/10 rounded-full"><Users className="w-8 h-8 text-blue-500" /></div>
              <p className="text-lg">No students found. Enroll a student to begin.</p>
            </div>
          ) : currentStudents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-medium border-2 border-dashed border-blue-500/20 dark:border-blue-500/20 rounded-3xl bg-blue-500/5 dark:bg-blue-500/5 flex flex-col items-center justify-center gap-4">
              <Search className="w-8 h-8 text-blue-500 opacity-50" />
              <p className="text-lg">No students match your search/filter criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStudents.map(stu => (
                  <div key={stu.id} className="group relative overflow-hidden rounded-3xl bg-card border border-black/5 dark:border-white/10 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="h-20 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 relative">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                      <div className="absolute top-3 right-3 flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={() => setViewStudent(stu)} className="p-2 bg-card/80 backdrop-blur-md text-emerald-500 hover:text-emerald-400 hover:bg-card rounded-xl transition-all shadow-sm">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(stu)} className="p-2 bg-card/80 backdrop-blur-md text-indigo-500 hover:text-indigo-400 hover:bg-card rounded-xl transition-all shadow-sm">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(stu.id, stu.firstName)} className="p-2 bg-card/80 backdrop-blur-md text-red-500 hover:text-red-400 hover:bg-card rounded-xl transition-all shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="px-6 relative pb-6 flex-1 flex flex-col">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold premium-shadow absolute -top-8 border-4 border-card">
                        {stu.firstName[0]}{stu.lastName[0]}
                      </div>
                      
                      <div className="mt-10 mb-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-xl font-black text-foreground">{stu.firstName} {stu.lastName}</h4>
                          <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">{stu.admissionNumber}</span>
                        </div>
                      </div>

                      <div className="space-y-3 bg-black/5 dark:bg-white/5 p-4 rounded-2xl mb-auto">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                            <BookOpen className="w-3.5 h-3.5" /> Class
                          </div>
                          <span className="font-bold text-foreground">Class {stu.class?.name || 'N/A'} <span className="text-muted-foreground font-normal">Sec {stu.section?.name || 'N/A'}</span></span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                            <Phone className="w-3.5 h-3.5" /> Parent Phone
                          </div>
                          <span className="font-mono font-bold text-blue-500">{stu.parent?.primaryPhone || stu.mobileNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground text-center sm:text-left">
                    Showing <span className="font-black text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-black text-foreground">{Math.min(currentPage * itemsPerPage, processedStudents.length)}</span> of <span className="font-black text-foreground">{processedStudents.length}</span> students
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-3 rounded-xl border border-black/5 dark:border-white/5 bg-card hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-card transition-all text-foreground premium-shadow disabled:shadow-none"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-xl border border-black/5 dark:border-white/5 bg-card hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-card transition-all text-foreground premium-shadow disabled:shadow-none"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Profile Modal */}
      <AnimatePresence>
        {viewStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-5xl max-h-[calc(100%-2rem)] flex flex-col rounded-[2.5rem] premium-shadow border border-white/10 overflow-hidden relative"
            >
              {/* Profile Header */}
              <div className="p-6 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5 shrink-0 relative">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black premium-shadow border-4 border-card">
                    {viewStudent.firstName[0]}{viewStudent.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">{viewStudent.firstName} {viewStudent.lastName}</h2>
                    <div className="flex gap-2.5 mt-2 items-center flex-wrap">
                      <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> {viewStudent.admissionNumber}</span>
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(viewStudent.admissionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewStudent(null)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-background/50 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Details */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-black/5 dark:bg-white/5 p-6 rounded-[2rem] border border-black/5 dark:border-white/5">
                      <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs mb-6 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3"><User className="w-4 h-4" /> Personal</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Date of Birth</p>
                          <p className="font-medium">{new Date(viewStudent.dob).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Gender</p>
                          <p className="font-medium">{viewStudent.gender}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Student Mobile</p>
                          <p className="font-medium">{viewStudent.mobileNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 p-6 rounded-[2rem] border border-black/5 dark:border-white/5">
                      <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs mb-6 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3"><Users className="w-4 h-4" /> Parent Details</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Father's Name</p>
                          <p className="font-medium">{viewStudent.parent?.fatherName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Mother's Name</p>
                          <p className="font-medium">{viewStudent.parent?.motherName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Primary Phone</p>
                          <p className="font-medium text-blue-500 font-mono">{viewStudent.parent?.primaryPhone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Academic Setup */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] text-white premium-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                          <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-indigo-100 text-sm font-bold tracking-widest uppercase">Currently Enrolled</p>
                          <h3 className="text-3xl font-black">Class {viewStudent.class?.name} <span className="font-normal text-white/70">Section {viewStudent.section?.name}</span></h3>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-6 bg-black/20 p-4 rounded-2xl backdrop-blur-md">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-widest mb-1">Academic Session</p>
                          <p className="font-bold">{sessions.find(s => s.id === viewStudent.sessionId)?.name || 'N/A'}</p>
                        </div>
                        <div className="w-px bg-white/20"></div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-widest mb-1">School Timings</p>
                          <p className="font-bold">{schoolConfig?.schoolStartTime || '--:--'} - {schoolConfig?.schoolEndTime || '--:--'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-black/5 dark:border-white/5 p-6 rounded-[2rem]">
                      <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs mb-6 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3"><BookOpen className="w-4 h-4" /> Auto-Resolved Academic Schedule</h4>
                      
                      {getStudentSchedule(viewStudent.classId, viewStudent.sectionId).length === 0 ? (
                        <div className="text-center py-10 bg-black/5 dark:bg-white/5 rounded-2xl">
                          <p className="text-muted-foreground font-medium">No subjects have been assigned to this class and section yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {getStudentSchedule(viewStudent.classId, viewStudent.sectionId).map((sub, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl gap-4 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center font-black">
                                  {sub.startTime ? sub.startTime.split(':')[0] : '--'}
                                </div>
                                <div>
                                  <h5 className="font-black text-foreground">{sub.masterSubject?.name || 'Unknown'} {sub.masterSubject?.code && <span className="text-[10px] font-bold text-muted-foreground bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded ml-2">{sub.masterSubject.code}</span>}</h5>
                                  <div className="flex items-center gap-3 mt-1 text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {sub.teacher ? `${sub.teacher.firstName} ${sub.teacher.lastName}` : 'Unassigned'}</span>
                                    <span className="flex items-center gap-1 text-emerald-500"><Clock className="w-3 h-3" /> {sub.startTime || '--:--'} - {sub.endTime || '--:--'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="sm:text-right">
                                <span className="bg-pink-500/10 text-pink-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block text-center min-w-[100px]">
                                  {sub.daysOfWeek ? sub.daysOfWeek.split(',').join(', ') : 'All Days'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Students"
        icon={Upload}
        maxWidth="max-w-md"
        noPadding={true}
      >
        <form onSubmit={handleImportExcel} className="flex-1 flex flex-col overflow-hidden text-left h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                  {/* File Upload */}
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 group-focus-within:text-purple-500 transition-colors">Select Excel File (.xlsx, .xls) <span className="text-red-500">*</span></label>
                    <input 
                      required
                      type="file" 
                      accept=".xlsx, .xls"
                      onChange={e => setImportFile(e.target.files[0])}
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-purple-500/50 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-purple-500/20 text-foreground transition-all font-bold text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-muted-foreground space-y-1">
                    <p className="font-extrabold uppercase tracking-widest text-slate-400 text-[10px] mb-1">Required Columns Format:</p>
                    <p>Excel must contain these exact headers (with asterisk `*` where required):</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 bg-black/5 dark:bg-white/5 rounded-2xl font-mono text-[9px] font-bold text-indigo-500 dark:text-indigo-400 mt-1">
                      <div>Academic Year *</div>
                      <div>Class *</div>
                      <div>Section *</div>
                      <div>Admission No *</div>
                      <div>First Name *</div>
                      <div>Last Name *</div>
                      <div>Date of Birth *</div>
                      <div>Gender *</div>
                      <div>Father Name *</div>
                      <div>Mother Name *</div>
                      <div>Primary Phone *</div>
                      <div className="text-slate-400 font-medium">Enrollment No</div>
                      <div className="text-slate-400 font-medium col-span-2">Student Mobile (Optional)</div>
                    </div>
                    <button type="button" onClick={handleDownloadTemplate} className="text-indigo-500 font-bold hover:underline self-start flex items-center gap-1.5 mt-3">
                      <Download className="w-3.5 h-3.5" /> Download Sample Excel Template
                    </button>
                  </div>

                  {importMessage && (
                    <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-2xl text-xs font-semibold flex items-center gap-3 animate-pulse">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                      {importMessage}
                    </div>
                  )}
                </div>

                {/* Footer (Fixed) */}
                <div className="p-6 border-t border-black/5 dark:border-white/10 flex justify-end gap-3 bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
                  <button type="button" onClick={() => setImportModalOpen(false)} className="px-5 py-3 rounded-xl font-bold text-xs text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isImporting} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 premium-shadow hover:scale-105 transition-all disabled:opacity-50">
                    <Upload className="w-4 h-4" /> {isImporting ? 'Importing...' : 'Upload & Import'}
                  </button>
                </div>
              </form>
      </Modal>

      {/* Admission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Edit Student' : 'New Admission'}
        icon={FileCheck}
        maxWidth="max-w-4xl"
        noPadding={true}
      >
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-left relative bg-background/50 h-full">
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                {/* Academic Details */}
                <div className="relative p-6 rounded-3xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/10">
                  <div className="absolute -left-[1px] top-10 w-1 h-12 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    <div className="p-2 bg-blue-500/10 rounded-xl"><GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                    Academic & Enrollment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group md:col-span-1">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500/80 mb-2 transition-colors group-focus-within:text-indigo-500">Academic Year *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-indigo-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-indigo-500"><Calendar className="w-5 h-5" /></div>
                        <select required value={form.sessionId} onChange={e => setForm({...form, sessionId: e.target.value})} className="w-full bg-transparent px-2 py-3.5 outline-none font-bold appearance-none cursor-pointer">
                          <option value="" disabled>Select Session</option>
                          {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="group md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-blue-500/80 mb-2 transition-colors group-focus-within:text-blue-500">Admission Date *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-blue-500"><Clock className="w-5 h-5" /></div>
                        <input required type="date" value={form.admissionDate} onChange={e => setForm({...form, admissionDate: e.target.value})} className="w-full bg-transparent px-2 py-3.5 outline-none font-bold cursor-pointer" />
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-2 transition-colors group-focus-within:text-emerald-500">Admission No *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-emerald-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-emerald-500"><Hash className="w-5 h-5" /></div>
                        <input required type="text" value={form.admissionNumber} onChange={e => setForm({...form, admissionNumber: e.target.value})} className="w-full bg-transparent px-2 py-3.5 outline-none font-mono font-bold text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-orange-500/80 mb-2 transition-colors group-focus-within:text-orange-500">Enrollment No</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-orange-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-orange-500"><Hash className="w-5 h-5" /></div>
                        <input type="text" value={form.enrollmentNumber} onChange={e => setForm({...form, enrollmentNumber: e.target.value})} placeholder="Optional" className="w-full bg-transparent px-2 py-3.5 outline-none font-mono font-bold text-orange-500 dark:text-orange-400 placeholder:text-muted-foreground/40 placeholder:font-normal" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-purple-500/80 mb-2 transition-colors group-focus-within:text-purple-500">Class *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-purple-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-purple-500"><BookOpen className="w-5 h-5" /></div>
                        <select required value={form.classId} onChange={e => setForm({...form, classId: e.target.value, sectionId: ''})} className="w-full bg-transparent px-2 py-3.5 outline-none font-bold appearance-none cursor-pointer">
                          <option value="" disabled>Select Class</option>
                          {classes.filter(c => c.sessionId === form.sessionId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-pink-500/80 mb-2 transition-colors group-focus-within:text-pink-500">Section *</label>
                      <div className={`relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden transition-all duration-300 ${form.classId ? 'group-focus-within:ring-2 group-focus-within:ring-pink-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.3)] group-focus-within:-translate-y-1' : 'opacity-50'}`}>
                        <div className="pl-4 pr-2 text-pink-500"><Users className="w-5 h-5" /></div>
                        <select required value={form.sectionId} onChange={e => setForm({...form, sectionId: e.target.value})} className="w-full bg-transparent px-2 py-3.5 outline-none font-bold appearance-none cursor-pointer" disabled={!form.classId}>
                          <option value="" disabled>Select Section</option>
                          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Class Info Mini Card */}
                  <AnimatePresence>
                    {form.classId && form.sectionId && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex gap-4 overflow-x-auto hide-scrollbar snap-x backdrop-blur-xl">
                          {getStudentSchedule(form.classId, form.sectionId).length === 0 ? (
                            <p className="text-sm text-indigo-500/80 font-bold italic px-2">No subjects assigned to this class yet.</p>
                          ) : (
                            getStudentSchedule(form.classId, form.sectionId).map((sub, i) => (
                              <div key={i} className="shrink-0 snap-start bg-card/90 backdrop-blur-sm border border-indigo-500/10 rounded-xl p-4 min-w-[170px] max-w-[200px] flex flex-col justify-between hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-default">
                                <div>
                                  <h5 className="font-extrabold text-[15px] text-foreground truncate">{sub.masterSubject?.name || 'Unknown'}</h5>
                                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-2 truncate font-medium">
                                    <User className="w-3.5 h-3.5 shrink-0 text-indigo-400" /> {sub.teacher ? `${sub.teacher.firstName} ${sub.teacher.lastName}` : 'Unassigned'}
                                  </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-indigo-500/10 flex items-center justify-between text-[10px] font-bold">
                                  <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md flex items-center gap-1.5"><Clock className="w-3 h-3" /> {sub.startTime || '--'}</span>
                                  <div className="flex text-[11px]">
                                    {sub.daysOfWeek ? sub.daysOfWeek.split(',').map((d, i, arr) => {
                                      const dTrim = d.trim();
                                      const shortDay = {'Mon':'M','Tue':'T','Wed':'W','Thu':'Th','Fri':'F','Sat':'Sa','Sun':'Su'}[dTrim] || dTrim;
                                      const colorClass = {'Mon':'text-rose-500','Tue':'text-blue-500','Wed':'text-emerald-500','Thu':'text-amber-500','Fri':'text-purple-500','Sat':'text-pink-500','Sun':'text-indigo-500'}[dTrim] || 'text-muted-foreground';
                                      return (
                                        <span key={i} className="flex items-center">
                                          <span className={`${colorClass} font-black`}>{shortDay}</span>
                                          {i < arr.length - 1 && <span className="text-muted-foreground/30 mx-0.5">,</span>}
                                        </span>
                                      );
                                    }) : <span className="text-muted-foreground">All Days</span>}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Personal Details */}
                <div className="relative p-6 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 mt-8">
                  <div className="absolute -left-[1px] top-10 w-1 h-12 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                    <div className="p-2 bg-emerald-500/10 rounded-xl"><UserCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-2 transition-colors group-focus-within:text-emerald-500">First Name *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-emerald-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-emerald-500"><User className="w-5 h-5" /></div>
                        <input required type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full bg-transparent px-2 py-3.5 outline-none font-bold" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-teal-500/80 mb-2 transition-colors group-focus-within:text-teal-500">Last Name *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-teal-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(20,184,166,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-teal-500"><User className="w-5 h-5" /></div>
                        <input required type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full bg-transparent px-2 py-3.5 outline-none font-bold" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-cyan-500/80 mb-2 transition-colors group-focus-within:text-cyan-500">Date of Birth *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-cyan-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(6,182,212,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-cyan-500"><Calendar className="w-5 h-5" /></div>
                        <input required type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="w-full bg-transparent px-2 py-3.5 outline-none font-bold cursor-pointer" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-rose-500/80 mb-2 transition-colors group-focus-within:text-rose-500">Gender *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-rose-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(244,63,94,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-rose-500"><Users className="w-5 h-5" /></div>
                        <select required value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full bg-transparent px-2 py-3.5 outline-none font-bold appearance-none cursor-pointer">
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="group md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-amber-500/80 mb-2 transition-colors group-focus-within:text-amber-500">Student Mobile (Optional)</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-amber-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-amber-500"><Phone className="w-5 h-5" /></div>
                        <select value={form.mobileCountryCode} onChange={e => setForm({...form, mobileCountryCode: e.target.value})} className="px-2 py-3.5 border-r border-black/5 dark:border-white/10 font-bold text-amber-600 dark:text-amber-400 bg-black/5 dark:bg-white/5 outline-none appearance-none cursor-pointer">
                          {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                        <input type="tel" pattern="[0-9]{10}" maxLength="10" title="Please enter a valid 10-digit mobile number" value={form.mobileNumber} onChange={e => setForm({...form, mobileNumber: e.target.value.replace(/\D/g, '')})} className="w-full bg-transparent px-4 py-3.5 outline-none font-bold text-foreground placeholder:text-muted-foreground/30" placeholder="00000 00000" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parent Details */}
                <div className="relative p-6 rounded-3xl bg-gradient-to-br from-orange-500/5 to-rose-500/5 border border-orange-500/10 mt-8">
                  <div className="absolute -left-[1px] top-10 w-1 h-12 bg-gradient-to-b from-orange-500 to-rose-500 rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600 dark:from-orange-400 dark:to-rose-400">
                    <div className="p-2 bg-orange-500/10 rounded-xl"><UserCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
                    Parent Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-orange-500/80 mb-2 transition-colors group-focus-within:text-orange-500">Father Name *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-orange-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-orange-500"><User className="w-5 h-5" /></div>
                        <input required type="text" value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} className="w-full bg-transparent px-2 py-3.5 outline-none font-bold" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-rose-500/80 mb-2 transition-colors group-focus-within:text-rose-500">Mother Name *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-rose-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(244,63,94,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-rose-500"><User className="w-5 h-5" /></div>
                        <input required type="text" value={form.motherName} onChange={e => setForm({...form, motherName: e.target.value})} className="w-full bg-transparent px-2 py-3.5 outline-none font-bold" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500/80 mb-2 transition-colors group-focus-within:text-indigo-500">Primary Phone *</label>
                      <div className="relative flex items-center bg-card/50 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group-focus-within:ring-2 group-focus-within:ring-indigo-500/50 group-focus-within:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.3)] group-focus-within:-translate-y-1 transition-all duration-300">
                        <div className="pl-4 pr-2 text-indigo-500"><Phone className="w-5 h-5" /></div>
                        <select value={form.primaryCountryCode} onChange={e => setForm({...form, primaryCountryCode: e.target.value})} className="px-2 py-3.5 border-r border-black/5 dark:border-white/10 font-bold text-indigo-600 dark:text-indigo-400 bg-black/5 dark:bg-white/5 outline-none appearance-none cursor-pointer">
                          {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                        <input required type="tel" pattern="[0-9]{10}" maxLength="10" title="Please enter exactly 10 digits" value={form.primaryPhone} onChange={e => setForm({...form, primaryPhone: e.target.value.replace(/\D/g, '')})} className="w-full bg-transparent px-4 py-3.5 outline-none font-bold text-foreground placeholder:text-muted-foreground/30" placeholder="00000 00000" />
                      </div>
                    </div>
                  </div>
                </div>

                </div>

                {/* Sticky Footer */}
                <div className="p-6 border-t border-black/5 dark:border-white/10 flex justify-end gap-3 bg-background shrink-0 rounded-b-[2.5rem]">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-xs text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 premium-shadow disabled:opacity-50">
                    {isSubmitting ? (
                       <span className="flex items-center gap-2">
                         <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...
                       </span>
                    ) : (
                      <><div className="bg-white/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4" /></div> {form.id ? 'Update Admission' : 'Admit Student'}</>
                    )}
                  </button>
                </div>
        </form>
      </Modal>

      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Upgrade Plan Required"
        icon={Crown}
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col text-center relative">
              {/* Crown Icon / Visual Indicator */}
              <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 shrink-0">
                <Crown className="w-7 h-7 animate-pulse" />
              </div>

              {/* Title */}
              <h2 className="text-xl font-black text-foreground tracking-tight">Upgrade Plan Required</h2>
              
              {/* Description */}
              <p className="text-muted-foreground text-xs mt-3 px-2 leading-relaxed">
                The <strong className="text-amber-500 font-bold">Transfer Certificate</strong> generation feature is not included in your current <strong className="text-foreground font-bold">Basic Plan</strong>. 
                <br /><br />
                Please upgrade your school subscription to a Standard or Premium plan to unlock Transfer Certificate generation, student promotion tools, and more!
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2 shrink-0">
                <button 
                  onClick={() => {
                    setUpgradeModalOpen(false);
                    alert("Please contact support at gdlsofts@gmail.com to request a plan upgrade.");
                  }} 
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-black text-xs hover:scale-[1.02] transition-all premium-shadow flex items-center justify-center gap-2"
                >
                  Contact Support to Upgrade
                </button>
                <button 
                  type="button" 
                  onClick={() => setUpgradeModalOpen(false)} 
                  className="w-full py-3 rounded-xl font-bold text-xs text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        </div>
      );
    }
