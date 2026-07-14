import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Book, Users, User, TrendingUp, Save, Clock, MapPin, Phone, Mail, Building, Plus, X, CheckCircle2, AlertTriangle, Calendar, Trash2, Edit3, Hash, BookOpen, GraduationCap, Trophy, Microscope, Pencil, Palette, Compass, Atom, Library, Briefcase, Sun, Coffee, UserCheck, ArrowUpDown, Filter, ChevronLeft, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HRModule from '../hr/HRModule';
import Modal from '../../components/ui/Modal';

const apiBase = 'http://localhost:1422/api';

export default function AcademicModule() {
  const modalScrollRef = useRef(null);
  const [activeTab, setActiveTab] = useState('school');
  const [schoolConfig, setSchoolConfig] = useState(null);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditingSchoolProfile, setIsEditingSchoolProfile] = useState(false);

  // Class Modal State
  const [isClassModalOpen, setClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState({ id: null, name: '', maxCapacity: '40', orderIndex: '1', periodDuration: '45', sections: 'A, B' });
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);

  // Session Modal State
  const [isSessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({ id: null, name: '', startDate: '', endDate: '', makeActive: false });
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  // Master Subject Modal State
  const [isMasterSubjectModalOpen, setMasterSubjectModalOpen] = useState(false);
  const [masterSubjectForm, setMasterSubjectForm] = useState({ id: null, name: '', code: '' });
  const [isSubmittingMasterSubject, setIsSubmittingMasterSubject] = useState(false);

  // Subject Modal State
  const [isSubjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ id: null, masterSubjectId: '', classId: '', sectionId: '', isOptional: false, teacherId: '', startTime: '', endTime: '', daysOfWeek: [] });
  const [isSubmittingSubject, setIsSubmittingSubject] = useState(false);
  const [isPeriodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [isTeacherDropdownOpen, setTeacherDropdownOpen] = useState(false);

  // Timetable Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [previewClassId, setPreviewClassId] = useState('');
  const [previewSectionId, setPreviewSectionId] = useState('');

  useEffect(() => {
    if (isSubjectModalOpen && modalScrollRef.current) {
      setTimeout(() => {
        if (modalScrollRef.current) {
          modalScrollRef.current.scrollTo({
            top: modalScrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  }, [isSubjectModalOpen]);

  // Holiday Planner state hooks
  const [holidaysList, setHolidaysList] = useState([]);


  const [isHolidayModalOpen, setHolidayModalOpen] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    id: null,
    name: '',
    startDate: '',
    endDate: '',
    scope: 'All', // 'All' | 'ClassSpecific'
    classIds: [],
    category: 'Custom', // 'Custom' | 'SummerVacation' | 'WinterVacation' | 'PrepLeave'
    allowAttendance: false
  });
  const [holidayCalendarYear, setHolidayCalendarYear] = useState(new Date().getFullYear());
  const [holidayCalendarMonth, setHolidayCalendarMonth] = useState(new Date().getMonth() + 1);
  const [holidaySearchQuery, setHolidaySearchQuery] = useState('');
  const [holidayAlert, setHolidayAlert] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }

  // Sync calendar month/year with active session when loaded
  useEffect(() => {
    const active = sessions.find(s => s.isActive);
    if (active) {
      const start = new Date(active.startDate);
      setHolidayCalendarYear(start.getFullYear());
      setHolidayCalendarMonth(start.getMonth() + 1);
      
      try {
        const saved = localStorage.getItem(`school_holidays_${active.id}`);
        if (saved) {
          setHolidaysList(JSON.parse(saved));
        } else {
          const defaultIndianHolidays = [
            { id: 'ind_h4', name: 'Good Friday', startDate: `${start.getFullYear()}-04-03`, endDate: `${start.getFullYear()}-04-03`, scope: 'All', classIds: [], category: 'Custom', allowAttendance: false },
            { id: 'ind_h5', name: 'Eid-ul-Fitr', startDate: `${start.getFullYear()}-04-20`, endDate: `${start.getFullYear()}-04-20`, scope: 'All', classIds: [], category: 'Custom', allowAttendance: false },
            { id: 'ind_h6', name: 'Summer Vacation', startDate: `${start.getFullYear()}-05-15`, endDate: `${start.getFullYear()}-06-30`, scope: 'All', classIds: [], category: 'SummerVacation', allowAttendance: false },
            { id: 'ind_h7', name: 'Independence Day', startDate: `${start.getFullYear()}-08-15`, endDate: `${start.getFullYear()}-08-15`, scope: 'All', classIds: [], category: 'Custom', allowAttendance: false },
            { id: 'ind_h8', name: 'Gandhi Jayanti', startDate: `${start.getFullYear()}-10-02`, endDate: `${start.getFullYear()}-10-02`, scope: 'All', classIds: [], category: 'Custom', allowAttendance: false },
            { id: 'ind_h9', name: 'Dussehra', startDate: `${start.getFullYear()}-10-19`, endDate: `${start.getFullYear()}-10-21`, scope: 'All', classIds: [], category: 'Custom', allowAttendance: false },
            { id: 'ind_h10', name: 'Diwali Break', startDate: `${start.getFullYear()}-11-08`, endDate: `${start.getFullYear()}-11-12`, scope: 'All', classIds: [], category: 'Custom', allowAttendance: false },
            { id: 'ind_h11', name: 'Christmas', startDate: `${start.getFullYear()}-12-25`, endDate: `${start.getFullYear()}-12-25`, scope: 'All', classIds: [], category: 'WinterVacation', allowAttendance: false },
            { id: 'ind_h12', name: 'Winter Break', startDate: `${start.getFullYear()}-12-30`, endDate: `${start.getFullYear() + 1}-01-05`, scope: 'All', classIds: [], category: 'WinterVacation', allowAttendance: false },
            { id: 'ind_h1', name: 'Republic Day', startDate: `${start.getFullYear() + 1}-01-26`, endDate: `${start.getFullYear() + 1}-01-26`, scope: 'All', classIds: [], category: 'Custom', allowAttendance: false },
            { id: 'ind_h2', name: 'Maha Shivaratri', startDate: `${start.getFullYear() + 1}-02-14`, endDate: `${start.getFullYear() + 1}-02-14`, scope: 'All', classIds: [], category: 'Custom', allowAttendance: false },
            { id: 'ind_h3', name: 'Holi', startDate: `${start.getFullYear() + 1}-03-03`, endDate: `${start.getFullYear() + 1}-03-04`, scope: 'All', classIds: [], category: 'Custom', allowAttendance: false }
          ];
          setHolidaysList(defaultIndianHolidays);
          localStorage.setItem(`school_holidays_${active.id}`, JSON.stringify(defaultIndianHolidays));
        }
      } catch {
        setHolidaysList([]);
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (holidayAlert) {
      const t = setTimeout(() => setHolidayAlert(null), 3500);
      return () => clearTimeout(t);
    }
  }, [holidayAlert]);

  // Helper to load/sync holidays registry
  const syncHolidays = (list) => {
    setHolidaysList(list);
    const active = sessions.find(s => s.isActive);
    if (active) {
      localStorage.setItem(`school_holidays_${active.id}`, JSON.stringify(list));
    }
  };

  const handleHolidaySubmit = (e) => {
    e.preventDefault();
    if (!holidayForm.name.trim() || !holidayForm.startDate || !holidayForm.endDate) return;

    // Date validation: lock changes to past dates
    const todayStr = new Date().toISOString().split('T')[0];
    if (holidayForm.startDate < todayStr) {
      setHolidayAlert({ type: 'error', message: 'Holidays cannot be scheduled in the past. Date must be today or in the future!' });
      return;
    }

    if (holidayForm.endDate < holidayForm.startDate) {
      setHolidayAlert({ type: 'error', message: 'End date must be on or after start date.' });
      return;
    }

    let newList = [...holidaysList];
    if (holidayForm.id) {
      newList = newList.map(h => h.id === holidayForm.id ? { ...holidayForm } : h);
      setHolidayAlert({ type: 'success', message: 'Holiday schedule updated!' });
    } else {
      const newHoliday = {
        ...holidayForm,
        id: 'hol_' + Date.now()
      };
      newList.push(newHoliday);
      setHolidayAlert({ type: 'success', message: 'Holiday schedule registered!' });
    }

    syncHolidays(newList);
    setHolidayModalOpen(false);
    setHolidayForm({ id: null, name: '', startDate: '', endDate: '', scope: 'All', classIds: [], category: 'Custom', allowAttendance: false });
  };

  const handleDeleteHoliday = (id) => {
    const item = holidaysList.find(h => h.id === id);
    if (!item) return;

    const todayStr = new Date().toISOString().split('T')[0];
    if (item.startDate < todayStr) {
      if (!window.confirm('WARNING: You are deleting a past holiday. This might alter historic attendance registry records. Do you wish to proceed?')) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete the holiday "${item.name}"?`)) return;
    }

    const newList = holidaysList.filter(h => h.id !== id);
    syncHolidays(newList);
    setHolidayAlert({ type: 'info', message: 'Holiday deleted.' });
  };

  const applyHolidayPreset = (type) => {
    const active = sessions.find(s => s.isActive);
    if (!active) {
      alert('Please activate an Academic Session first.');
      return;
    }

    const startYear = new Date(active.startDate).getFullYear();
    
    if (type === 'Summer') {
      setHolidayForm({
        id: null,
        name: 'Summer Vacation',
        startDate: `${startYear}-06-01`,
        endDate: `${startYear}-06-30`,
        scope: 'All',
        classIds: [],
        category: 'SummerVacation',
        allowAttendance: false
      });
    } else if (type === 'Winter') {
      setHolidayForm({
        id: null,
        name: 'Winter Vacation',
        startDate: `${startYear}-12-25`,
        endDate: `${startYear + (new Date(active.endDate).getFullYear() > startYear ? 1 : 0)}-01-05`,
        scope: 'All',
        classIds: [],
        category: 'WinterVacation',
        allowAttendance: false
      });
    }
    setHolidayModalOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const configRes = await fetch(`${apiBase}/setup/school`);
      const configData = await configRes.json();
      setSchoolConfig(configData);

      const [clsRes, sessRes, mSubjRes, subjRes, empRes] = await Promise.all([
        fetch(`${apiBase}/setup/classes`),
        fetch(`${apiBase}/setup/sessions`),
        fetch(`${apiBase}/setup/master-subjects`),
        fetch(`${apiBase}/setup/subjects`),
        fetch(`${apiBase}/hr/employees`)
      ]);
      const clsData = await clsRes.json();
      const sessData = await sessRes.json();
      const mSubjData = await mSubjRes.json();
      const subjData = await subjRes.json();
      const empData = await empRes.json();
      setClasses(clsData);
      setSessions(sessData);
      setMasterSubjects(mSubjData);
      setSubjects(subjData);
      
      // Filter out non-teaching staff (like IT, Admin, Security, Transport)
      const teachingStaff = empData.filter(emp => {
        const dep = emp.department ? emp.department.toLowerCase() : '';
        const des = emp.designation ? emp.designation.toLowerCase() : '';
        return (
          dep.includes('academic') || 
          dep.includes('sport') || 
          dep.includes('art') || 
          dep.includes('library') ||
          des.includes('teach') || 
          des.includes('coach') || 
          des.includes('hod') || 
          des.includes('librarian') ||
          des.includes('principal')
        );
      });
      setTeachers(teachingStaff);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    };
  };

  const handleSchoolSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/setup/school`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolConfig)
      });
      if (res.ok) {
        setIsEditingSchoolProfile(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingClass(true);
    try {
      const payload = {
        name: classForm.name.startsWith('Class ') ? classForm.name : `Class ${classForm.name.trim()}`,
        maxCapacity: classForm.maxCapacity,
        orderIndex: classForm.orderIndex,
        periodDuration: classForm.periodDuration,
        sections: classForm.sections.split(',').map(s => s.trim()).filter(s => s !== '')
      };
      
      const url = classForm.id ? `${apiBase}/setup/classes/${classForm.id}` : `${apiBase}/setup/classes`;
      const method = classForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save class');
      
      setClassModalOpen(false);
      setClassForm({ id: null, name: '', maxCapacity: '40', orderIndex: '1', periodDuration: '45', sections: 'A, B' });
      fetchData(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert('Error saving class. Did you restart the backend?');
    } finally {
      setIsSubmittingClass(false);
    }
  };

  const handleEditClass = (cls) => {
    setClassForm({
      id: cls.id,
      name: cls.name.replace(/^Class\s*/i, ''),
      maxCapacity: cls.maxCapacity,
      orderIndex: cls.orderIndex,
      periodDuration: cls.periodDuration?.toString() || '45',
      sections: cls.sections ? cls.sections.map(s => s.name).join(', ') : ''
    });
    setClassModalOpen(true);
  };

  const handleDeleteClass = async (id, name) => {
    if(!window.confirm(`Warning: Are you sure you want to completely delete ${name}?\n\nThis will instantly CASCADE DELETE all related students, sections, timetables, and subjects forever.`)) return;
    
    try {
      const res = await fetch(`${apiBase}/setup/classes/${id}`, { method: 'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error deleting class. Try restarting the backend.");
    }
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingSession(true);
    try {
      const url = sessionForm.id ? `${apiBase}/setup/sessions/${sessionForm.id}` : `${apiBase}/setup/sessions`;
      const method = sessionForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionForm)
      });
      if (!res.ok) throw new Error('Failed to save session');
      
      setSessionModalOpen(false);
      setSessionForm({ id: null, name: '', startDate: '', endDate: '', makeActive: false });
      fetchData(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert('Error saving session. Did you restart the backend?');
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handleEditSession = (session) => {
    setSessionForm({
      id: session.id,
      name: session.name,
      startDate: new Date(session.startDate).toISOString().split('T')[0],
      endDate: new Date(session.endDate).toISOString().split('T')[0],
      makeActive: session.isActive
    });
    setSessionModalOpen(true);
  };

  const handleDeleteSession = async (id, name) => {
    if(!window.confirm(`CRITICAL WARNING: Are you sure you want to delete the academic session "${name}"?\n\nThis will permanently DELETE ALL DATA tied to this session, including ALL Classes, Sections, Students, Exams, Marks, and Attendance records for this entire year!\n\nThis action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`${apiBase}/setup/sessions/${id}`, { method: 'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error deleting session. Try restarting the backend.");
    }
  };

  const handleMasterSubjectSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingMasterSubject(true);
    try {
      const url = masterSubjectForm.id ? `${apiBase}/setup/master-subjects/${masterSubjectForm.id}` : `${apiBase}/setup/master-subjects`;
      const method = masterSubjectForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(masterSubjectForm)
      });
      if (!res.ok) throw new Error('Failed to save master subject');
      
      setMasterSubjectModalOpen(false);
      setMasterSubjectForm({ id: null, name: '', code: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error saving master subject.');
    } finally {
      setIsSubmittingMasterSubject(false);
    }
  };

  const handleEditMasterSubject = (ms) => {
    setMasterSubjectForm({
      id: ms.id,
      name: ms.name,
      code: ms.code || ''
    });
    setMasterSubjectModalOpen(true);
  };

  const handleDeleteMasterSubject = async (id, name) => {
    if(!window.confirm(`Are you sure you want to delete the master subject "${name}"?\n\nThis will remove it from all classes using it.`)) return;
    try {
      const res = await fetch(`${apiBase}/setup/master-subjects/${id}`, { method: 'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      fetchData();
    } catch(err) {
      console.error(err);
      alert("Error deleting master subject.");
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    
    // Time Validation Logic
    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const sStart = parseTime(schoolConfig.schoolStartTime);
    const sEnd = parseTime(schoolConfig.schoolEndTime);
    const lStart = parseTime(schoolConfig.lunchStartTime);
    const lEnd = parseTime(schoolConfig.lunchEndTime);
    
    const finalStartTime = subjectForm.startTime || schoolConfig.schoolStartTime;
    const finalEndTime = subjectForm.endTime || schoolConfig.schoolEndTime;
    
    const subStart = parseTime(finalStartTime);
    const subEnd = parseTime(finalEndTime);

    if (subStart < sStart || subEnd > sEnd) {
      alert(`Subject timing must be within Operational Hours (${schoolConfig.schoolStartTime || 'N/A'} - ${schoolConfig.schoolEndTime || 'N/A'})`);
      return;
    }

    if (subStart >= subEnd) {
      alert("Start time must be before end time.");
      return;
    }

    // Check lunch overlap (Overlap occurs if subStart < lEnd && subEnd > lStart)
    if (schoolConfig.lunchStartTime && schoolConfig.lunchEndTime && subStart < lEnd && subEnd > lStart) {
      alert(`Subject cannot overlap with Lunch Break (${schoolConfig.lunchStartTime} - ${schoolConfig.lunchEndTime})`);
      return;
    }

    // Prevent duplicate master subjects in the same section ON THE SAME DAY
    const formDays = subjectForm.daysOfWeek || [];
    const isDuplicate = subjects.some(s => {
      if (s.id === subjectForm.id) return false;
      if (s.classId !== subjectForm.classId || s.sectionId !== subjectForm.sectionId) return false;
      if (s.masterSubjectId !== subjectForm.masterSubjectId) return false;
      
      const sDays = s.daysOfWeek ? s.daysOfWeek.split(',') : [];
      if (formDays.length === 0 || sDays.length === 0) return true; // Empty means all days
      return formDays.some(d => sDays.includes(d));
    });

    if (isDuplicate) {
      const masterName = masterSubjects.find(m => m.id === subjectForm.masterSubjectId)?.name || 'This subject';
      alert(`${masterName} is already assigned to this section. You cannot assign the same subject twice.`);
      return;
    }

    // --------------------------------------------------------------------------------
    // TEACHER SCHEDULE CLASH VALIDATION
    // --------------------------------------------------------------------------------
    if (subjectForm.teacherId) {
      const teacherSubjects = subjects.filter(s => s.teacherId === subjectForm.teacherId && s.id !== subjectForm.id);
      
      const hasClash = teacherSubjects.some(s => {
        const sDays = s.daysOfWeek ? s.daysOfWeek.split(',') : [];
        const daysOverlap = formDays.length === 0 || sDays.length === 0 || formDays.some(d => sDays.includes(d));
        if (!daysOverlap) return false;

        const tsStart = parseTime(s.startTime);
        const tsEnd = parseTime(s.endTime);
        // Overlap condition: start1 < end2 && end1 > start2
        return (subStart < tsEnd && subEnd > tsStart);
      });

      if (hasClash) {
        alert("Teacher is already assigned to another class during this time. Schedule clashes are not allowed.");
        return;
      }

      // MAX PERIODS VALIDATION (Max 8 periods per day)
      const daysToCheck = formDays.length > 0 ? formDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (const day of daysToCheck) {
        const periodsOnDay = teacherSubjects.filter(s => {
           const sDays = s.daysOfWeek ? s.daysOfWeek.split(',') : [];
           return sDays.length === 0 || sDays.includes(day);
        }).length;

        if (periodsOnDay >= 8) {
          alert(`Teacher already has maximum allowed periods (8) on ${day}. Cannot assign more periods.`);
          return;
        }
      }
    }

    setIsSubmittingSubject(true);
    try {
      const url = subjectForm.id ? `${apiBase}/setup/subjects/${subjectForm.id}` : `${apiBase}/setup/subjects`;
      const method = subjectForm.id ? 'PUT' : 'POST';

      const payload = {
        ...subjectForm,
        startTime: finalStartTime,
        endTime: finalEndTime,
        daysOfWeek: subjectForm.daysOfWeek.join(',')
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save subject');
      
      setSubjectModalOpen(false);
      setSubjectForm({ id: null, masterSubjectId: '', classId: '', sectionId: '', isOptional: false, teacherId: '', startTime: schoolConfig?.schoolStartTime || '', endTime: schoolConfig?.schoolEndTime || '', daysOfWeek: [] });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error saving subject. Did you restart the backend?');
    } finally {
      setIsSubmittingSubject(false);
    }
  };

  const handleEditSubject = (subject) => {
    setSubjectForm({
      id: subject.id,
      masterSubjectId: subject.masterSubjectId,
      classId: subject.classId,
      sectionId: subject.sectionId || '',
      isOptional: subject.isOptional,
      teacherId: subject.teacherId || '',
      startTime: subject.startTime || '',
      endTime: subject.endTime || '',
      daysOfWeek: subject.daysOfWeek ? subject.daysOfWeek.split(',') : []
    });
    setSubjectModalOpen(true);
  };

  const handleDeleteSubject = async (id, name) => {
    if(!window.confirm(`Are you sure you want to delete the subject "${name}"?\n\nThis will remove it from the assigned class.`)) return;
    try {
      const res = await fetch(`${apiBase}/setup/subjects/${id}`, { method: 'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error deleting subject.");
    }
  };
  // --- Master Subjects Processing (Filter, Sort, Paginate) ---
  const [msSearchTerm, setMsSearchTerm] = useState('');
  const [msSortBy, setMsSortBy] = useState('name');
  const [msSortOrder, setMsSortOrder] = useState('asc');
  const [msCurrentPage, setMsCurrentPage] = useState(1);
  const msItemsPerPage = 20;

  let processedMasterSubjects = [...masterSubjects];

  if (msSearchTerm) {
    const term = msSearchTerm.toLowerCase();
    processedMasterSubjects = processedMasterSubjects.filter(s => 
      s.name.toLowerCase().includes(term) ||
      (s.code && s.code.toLowerCase().includes(term))
    );
  }

  processedMasterSubjects.sort((a, b) => {
    let aVal = a[msSortBy]?.toLowerCase() || '';
    let bVal = b[msSortBy]?.toLowerCase() || '';
    
    if (aVal < bVal) return msSortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return msSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const msTotalPages = Math.max(1, Math.ceil(processedMasterSubjects.length / msItemsPerPage));
  const currentMasterSubjects = processedMasterSubjects.slice((msCurrentPage - 1) * msItemsPerPage, msCurrentPage * msItemsPerPage);

  useEffect(() => {
    setMsCurrentPage(1);
  }, [msSearchTerm, msSortBy, msSortOrder]);
  // --- Classes Processing (Filter, Sort, Paginate) ---
  const [clsSearchTerm, setClsSearchTerm] = useState('');
  const [clsSortBy, setClsSortBy] = useState('orderIndex');
  const [clsSortOrder, setClsSortOrder] = useState('asc');
  const [clsCurrentPage, setClsCurrentPage] = useState(1);
  const clsItemsPerPage = 6;

  let processedClasses = [...classes];

  if (clsSearchTerm) {
    const term = clsSearchTerm.toLowerCase();
    processedClasses = processedClasses.filter(c => 
      c.name.toLowerCase().includes(term)
    );
  }

  processedClasses.sort((a, b) => {
    let aVal = a[clsSortBy];
    let bVal = b[clsSortBy];
    
    if (clsSortBy === 'orderIndex' || clsSortBy === 'maxCapacity') {
      aVal = Number(aVal || 0);
      bVal = Number(bVal || 0);
    } else {
      aVal = aVal?.toString().toLowerCase() || '';
      bVal = bVal?.toString().toLowerCase() || '';
    }
    
    if (aVal < bVal) return clsSortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return clsSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const clsTotalPages = Math.max(1, Math.ceil(processedClasses.length / clsItemsPerPage));
  const currentClasses = processedClasses.slice((clsCurrentPage - 1) * clsItemsPerPage, clsCurrentPage * clsItemsPerPage);

  useEffect(() => {
    setClsCurrentPage(1);
  }, [clsSearchTerm, clsSortBy, clsSortOrder]);
  // -----------------------------------------------------------

  // --- Subjects Processing (Filter, Sort, Paginate) ---
  const [subSearchTerm, setSubSearchTerm] = useState('');
  const [subSortBy, setSubSortBy] = useState('startTime');
  const [subSortOrder, setSubSortOrder] = useState('asc');
  const [subFilterStatus, setSubFilterStatus] = useState('all'); // 'all', 'mandatory', 'optional'
  const [subCurrentPage, setSubCurrentPage] = useState(1);
  const subItemsPerPage = 9;

  let currentSectionSubjects = subjects.filter(s => s.classId === selectedClassId && s.sectionId === selectedSectionId);

  if (subFilterStatus === 'mandatory') {
    currentSectionSubjects = currentSectionSubjects.filter(s => !s.isOptional);
  } else if (subFilterStatus === 'optional') {
    currentSectionSubjects = currentSectionSubjects.filter(s => s.isOptional);
  }

  if (subSearchTerm) {
    const term = subSearchTerm.toLowerCase();
    currentSectionSubjects = currentSectionSubjects.filter(s => 
      s.masterSubject?.name?.toLowerCase().includes(term) ||
      s.masterSubject?.code?.toLowerCase().includes(term) ||
      s.teacher?.firstName?.toLowerCase().includes(term) ||
      s.teacher?.lastName?.toLowerCase().includes(term)
    );
  }

  currentSectionSubjects.sort((a, b) => {
    let aVal, bVal;
    
    if (subSortBy === 'startTime') {
      aVal = a.startTime || '99:99';
      bVal = b.startTime || '99:99';
    } else if (subSortBy === 'name') {
      aVal = a.masterSubject?.name?.toLowerCase() || '';
      bVal = b.masterSubject?.name?.toLowerCase() || '';
    } else if (subSortBy === 'teacher') {
      aVal = a.teacher?.firstName?.toLowerCase() || '';
      bVal = b.teacher?.firstName?.toLowerCase() || '';
    }
    
    if (aVal < bVal) return subSortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return subSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const subTotalPages = Math.max(1, Math.ceil(currentSectionSubjects.length / subItemsPerPage));
  const currentSubjects = currentSectionSubjects.slice((subCurrentPage - 1) * subItemsPerPage, subCurrentPage * subItemsPerPage);

  useEffect(() => {
    setSubCurrentPage(1);
  }, [subSearchTerm, subSortBy, subSortOrder, subFilterStatus, selectedClassId, selectedSectionId]);
  // -----------------------------------------------------------

  const generatePeriodOptions = () => {
    if (!schoolConfig?.schoolStartTime || !schoolConfig?.schoolEndTime) return [];
    
    const cls = classes.find(c => c.id === subjectForm.classId);
    const duration = cls?.periodDuration || 45;

    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const formatTime = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };
    
    const format24h = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const startMins = parseTime(schoolConfig.schoolStartTime);
    const endMins = parseTime(schoolConfig.schoolEndTime);
    const lunchStart = parseTime(schoolConfig.lunchStartTime);
    const lunchEnd = parseTime(schoolConfig.lunchEndTime);

    const periods = [];
    let currentMins = startMins;
    let periodIndex = 1;

    while (currentMins + duration <= endMins) {
      const pStart = currentMins;
      const pEnd = currentMins + duration;

      if (lunchStart > 0 && lunchEnd > 0) {
        if ((pStart < lunchEnd && pEnd > lunchStart)) {
          if (!periods.some(p => p.isLunch)) {
             periods.push({
               id: 'lunch_break',
               isLunch: true,
               label: `🍕 LUNCH BREAK (${formatTime(lunchStart)} - ${formatTime(lunchEnd)})`
             });
          }
          currentMins = lunchEnd;
          continue;
        }
      }

      periods.push({
        id: `Period ${periodIndex}`,
        value: `${format24h(pStart)}|${format24h(pEnd)}`,
        label: `Period ${periodIndex} (${formatTime(pStart)} - ${formatTime(pEnd)})`
      });
      
      currentMins += duration;
      periodIndex++;
    }

    return periods;
  };
  
  const periodOptions = isSubjectModalOpen ? generatePeriodOptions() : [];

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse font-medium">Loading academic configuration...</div>;

  return (
    <div className="space-y-8 h-full overflow-auto pb-20 w-full text-left px-2">
      <div className="w-full text-left">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 text-left inline-block">School Setup & Academics</h1>
        <p className="text-muted-foreground mt-2 text-lg text-left">Configure core school rules, classes, and promotions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 pt-4 px-1 custom-scrollbar w-full snap-x">
        {[
          { id: 'school', label: 'School Profile', icon: Building, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)]', border: 'border-blue-500', text: 'text-blue-500', iconBg: 'bg-blue-500/10' },
          { id: 'sessions', label: 'Academic Years', icon: Calendar, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]', border: 'border-emerald-500', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
          { id: 'holidays', label: 'Holiday Planner', icon: Trophy, color: 'from-amber-500 to-orange-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)]', border: 'border-amber-500', text: 'text-amber-500', iconBg: 'bg-amber-500/10' },
          { id: 'classes', label: 'Classes & Sections', icon: Book, color: 'from-orange-500 to-rose-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)]', border: 'border-orange-500', text: 'text-orange-500', iconBg: 'bg-orange-500/10' },
          { id: 'staff', label: 'Staff & Teachers', icon: Briefcase, color: 'from-cyan-500 to-blue-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(6,182,212,0.5)]', border: 'border-cyan-500', text: 'text-cyan-500', iconBg: 'bg-cyan-500/10' },
          { id: 'master-subjects', label: 'Master Subjects', icon: Library, color: 'from-pink-500 to-rose-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(244,63,94,0.5)]', border: 'border-pink-500', text: 'text-pink-500', iconBg: 'bg-pink-500/10' },
          { id: 'subjects', label: 'Manage Class', icon: BookOpen, color: 'from-purple-500 to-indigo-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)]', border: 'border-purple-500', text: 'text-purple-500', iconBg: 'bg-purple-500/10' }
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

      {activeTab === 'school' && schoolConfig && (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-left mb-2">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500"><Building className="w-7 h-7" /></div> School Profile
            </h3>
            {schoolConfig.id && (
              <button 
                onClick={() => setIsEditingSchoolProfile(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow shadow-blue-500/20"
              >
                <div className="bg-white/20 p-1 rounded-full"><Edit3 className="w-4 h-4" /></div> Edit Profile
              </button>
            )}
          </div>

          {schoolConfig.id ? (
            /* Beautiful View Mode */
            <div className="relative glass-panel p-1 rounded-[2.5rem] group overflow-hidden shadow-xl transition-all duration-500">
              {/* Dynamic Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 blur-3xl opacity-50 pointer-events-none" />
              
              <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4 mb-8">
                  <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs flex items-center gap-2">
                    <Building className="w-4 h-4" /> Active Configuration
                  </h4>
                  <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1 w-max">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 relative">
                  {/* Timing Card */}
                  <div className="relative rounded-[2rem] p-[1px] group/card hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 z-10 hover:z-20">
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br opacity-50 group-hover/card:opacity-100 transition-opacity duration-500 from-blue-400 to-indigo-600 blur-[2px]" />
                    <div className="relative h-full bg-card/90 dark:bg-card/80 backdrop-blur-xl p-6 rounded-[2rem] flex flex-col overflow-hidden">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg transform group-hover/card:scale-110 group-hover/card:rotate-[-5deg] transition-all duration-500 bg-gradient-to-br from-blue-400 to-indigo-600 text-white">
                          <Clock className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-black text-foreground">Operational Hours</h4>
                      </div>
                        <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-black/5 dark:border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><div className="p-1.5 bg-blue-500/10 rounded-md"><Sun className="w-3.5 h-3.5 text-blue-500"/></div> School</span>
                            <span className="text-lg font-black text-blue-600 dark:text-blue-400">{schoolConfig.schoolStartTime} - {schoolConfig.schoolEndTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-orange-500/80 uppercase tracking-widest flex items-center gap-2"><div className="p-1.5 bg-orange-500/10 rounded-md"><Coffee className="w-3.5 h-3.5 text-orange-500"/></div> Lunch</span>
                            <span className="text-lg font-black text-orange-500">{schoolConfig.lunchStartTime} - {schoolConfig.lunchEndTime}</span>
                          </div>
                        </div>
                    </div>
                  </div>

                  {/* Hierarchy Card */}
                  <div className="relative rounded-[2rem] p-[1px] group/card hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 z-10 hover:z-20">
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br opacity-50 group-hover/card:opacity-100 transition-opacity duration-500 from-purple-400 to-pink-600 blur-[2px]" />
                    <div className="relative h-full bg-card/90 dark:bg-card/80 backdrop-blur-xl p-6 rounded-[2rem] flex flex-col overflow-hidden">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg transform group-hover/card:scale-110 group-hover/card:rotate-[-5deg] transition-all duration-500 bg-gradient-to-br from-purple-400 to-pink-600 text-white">
                          <Users className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-black text-foreground">Leadership</h4>
                      </div>
                      <div className="space-y-4 mt-auto pt-6 border-t border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/10 rounded-lg"><UserCheck className="w-4 h-4 text-purple-500"/></div>
                          <div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Principal</span>
                            <p className="text-base font-black text-foreground">{schoolConfig.principalName}</p>
                          </div>
                        </div>
                        {schoolConfig.managerName && (
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-500/10 rounded-lg"><Briefcase className="w-4 h-4 text-pink-500"/></div>
                            <div>
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Manager</span>
                              <p className="text-base font-black text-foreground">{schoolConfig.managerName}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Card */}
                  <div className="relative rounded-[2rem] p-[1px] group/card hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 z-10 hover:z-20">
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br opacity-50 group-hover/card:opacity-100 transition-opacity duration-500 from-emerald-400 to-teal-600 blur-[2px]" />
                    <div className="relative h-full bg-card/90 dark:bg-card/80 backdrop-blur-xl p-6 rounded-[2rem] flex flex-col overflow-hidden">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg transform group-hover/card:scale-110 group-hover/card:rotate-[-5deg] transition-all duration-500 bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
                          <Phone className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-black text-foreground">Contact Hub</h4>
                      </div>
                      <div className="space-y-4 mt-auto pt-6 border-t border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg"><Mail className="w-4 h-4 text-emerald-500" /></div>
                          <span className="font-bold text-sm text-foreground truncate">{schoolConfig.contactEmail}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg"><Phone className="w-4 h-4 text-emerald-500" /></div>
                          <span className="font-bold text-sm text-foreground font-mono">{schoolConfig.contactPhone}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg"><MapPin className="w-4 h-4 text-emerald-500 shrink-0" /></div>
                          <span className="text-xs font-bold text-muted-foreground leading-relaxed flex-1">{schoolConfig.schoolAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* First-time configure placeholder */
            <div className="glass-panel p-12 rounded-[2.5rem] text-center space-y-6 border border-dashed border-blue-500/30 bg-card text-left">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500"><Building className="w-8 h-8" /></div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-foreground">No School Configuration Found</h4>
                <p className="text-muted-foreground text-sm mt-1">Please configure your school timings and details to get started.</p>
              </div>
              <div className="flex justify-center">
                <button onClick={() => setIsEditingSchoolProfile(true)} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold">
                  Configure School Setup
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'classes' && (
        <div className="space-y-6">

          <div className="flex justify-between items-center text-left mb-2">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500"><Book className="w-7 h-7" /></div> Class & Section Hierarchy
            </h3>
            <button onClick={() => {
              setClassForm({ id: null, name: '', maxCapacity: '40', orderIndex: '1', periodDuration: '45', sections: 'A, B' });
              setClassModalOpen(true);
            }} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Add Class
            </button>
          </div>

          <div className="relative glass-panel p-1 rounded-[2.5rem] group overflow-hidden shadow-xl transition-all duration-500">
            {/* Dynamic Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-rose-500/10 blur-3xl opacity-50 pointer-events-none" />
            
            <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
              <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs border-b border-black/5 dark:border-white/5 pb-4 mb-8 flex items-center gap-2">
                <Book className="w-4 h-4" /> Directory of Classes
              </h4>

              {/* Search and Sort Bar */}
              <div className="relative mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group/search">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-orange-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search classes by name..." 
                    value={clsSearchTerm}
                    onChange={e => setClsSearchTerm(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-orange-500/50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-orange-500/20 text-foreground transition-all font-medium"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="relative min-w-[160px] flex items-center bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-orange-500/50 transition-all focus-within:ring-4 focus-within:ring-orange-500/20">
                    <select 
                      value={clsSortBy}
                      onChange={(e) => setClsSortBy(e.target.value)}
                      className="w-full bg-transparent pl-4 pr-2 py-4 outline-none text-foreground font-bold appearance-none cursor-pointer flex-1"
                    >
                      <option value="orderIndex">Sort by Order</option>
                      <option value="name">Sort by Name</option>
                      <option value="maxCapacity">Sort by Capacity</option>
                    </select>
                    <button 
                      onClick={() => setClsSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
                      className="px-3 hover:text-orange-500 transition-colors border-l border-black/10 dark:border-white/10 h-full flex items-center justify-center text-muted-foreground"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {currentClasses.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground font-medium border-2 border-dashed border-orange-500/20 dark:border-orange-500/20 rounded-3xl bg-orange-500/5 dark:bg-orange-500/5 flex flex-col items-center justify-center gap-4">
                  <div className="p-4 bg-orange-500/10 rounded-full"><Book className="w-8 h-8 text-orange-500" /></div>
                  <p className="text-lg">No classes found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentClasses.map((cls, idx) => {
                const colors = [
                  'from-purple-500 to-indigo-500',
                  'from-emerald-500 to-teal-500',
                  'from-orange-500 to-rose-500',
                  'from-blue-500 to-cyan-500',
                  'from-pink-500 to-rose-400'
                ];
                const icons = [GraduationCap, BookOpen, Trophy, Microscope, Palette, Compass, Atom, Library, Pencil];
                const shapes = ['rounded-2xl', 'rounded-full', 'rounded-[10px] rounded-br-3xl', 'rounded-[28px] rounded-tl-md'];
                const glowPositions = ['-top-24 -right-24', '-bottom-24 -left-24', 'top-10 -left-20', '-bottom-10 -right-10'];
                
                const bgGradient = colors[idx % colors.length];
                const CardIcon = icons[idx % icons.length];
                const iconShape = shapes[idx % shapes.length];
                const glowPos = glowPositions[idx % glowPositions.length];

                return (
                  <div key={cls.id} className="relative rounded-[2rem] p-[1px] group hover:-translate-y-2 transition-all duration-500">
                    {/* Dynamic Glowing Border Wrapper */}
                    <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${bgGradient} opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                    <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${bgGradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Main Card Content */}
                    <div className="relative h-full bg-card/90 dark:bg-card/80 backdrop-blur-3xl p-6 rounded-[2rem] flex flex-col justify-between overflow-hidden shadow-2xl">
                      
                      {/* Subtle Inner Glow */}
                      <div className={`absolute ${glowPos} w-48 h-48 bg-gradient-to-br ${bgGradient} rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`} />

                      {/* Action Buttons (Absolute Top-Right for responsiveness) */}
                      <div className="absolute top-4 right-4 flex gap-1 z-20 bg-background/50 backdrop-blur-md rounded-xl p-1.5 shadow-sm border border-black/5 dark:border-white/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClass(cls)} className="p-1.5 text-indigo-500 hover:bg-white dark:hover:bg-black rounded-lg transition-all">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteClass(cls.id, cls.name)} className="p-1.5 text-red-500 hover:bg-white dark:hover:bg-black rounded-lg transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4 z-10 pr-16">
                            <div className={`w-14 h-14 md:w-16 md:h-16 ${iconShape} bg-gradient-to-br ${bgGradient} text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.2)] transform group-hover:scale-110 group-hover:rotate-[5deg] transition-all duration-500 flex-shrink-0`}>
                              <CardIcon className="w-6 h-6 md:w-8 h-8" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xl md:text-2xl font-black text-foreground tracking-tight drop-shadow-sm truncate">{cls.name}</h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-black/5 dark:bg-white/10 text-muted-foreground border border-black/5 dark:border-white/5">
                                  Order {cls.orderIndex}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-black/5 dark:bg-white/10 text-muted-foreground border border-black/5 dark:border-white/5 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {cls.periodDuration || 45} Mins
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-5 z-10 relative">
                          {/* Premium Capacity Block */}
                          <div className={`p-4 rounded-2xl border border-black/5 dark:border-white/5 flex justify-between items-center transition-colors bg-gradient-to-r from-black/5 to-transparent dark:from-white/5 dark:to-transparent`}>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <div className="p-2 rounded-xl bg-background shadow-sm border border-black/5 dark:border-white/5">
                                <Users className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-widest">Max Capacity</span>
                            </div>
                            <span className={`font-black text-2xl bg-gradient-to-br ${bgGradient} text-transparent bg-clip-text drop-shadow-sm`}>
                              {cls.maxCapacity}
                            </span>
                          </div>

                          {/* Premium Sections Block */}
                          <div>
                            <div className="flex items-center gap-2 mb-3 px-1">
                              <Hash className="w-4 h-4 text-muted-foreground/60" />
                              <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Sections ({cls.sections?.length || 0})</span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                              {cls.sections?.map(sec => (
                                <span key={sec.id} className="relative overflow-hidden bg-background px-4 py-2 rounded-xl text-sm font-bold border border-black/5 dark:border-white/5 shadow-sm group-hover:shadow-md transition-all flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${bgGradient} animate-pulse`}></span>
                                  {sec.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Promotion Block */}
                      {cls.nextClass && (
                        <div className="pt-5 mt-6 border-t border-black/5 dark:border-white/5 z-10 relative">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 px-1">Promotes To</span>
                          <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${bgGradient} text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md group-hover:shadow-lg transition-all`}>
                            <TrendingUp className="w-4 h-4" /> {cls.nextClass.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {clsTotalPages > 1 && (
            <div className="mt-8 flex justify-between items-center bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-white/5">
              <button 
                onClick={() => setClsCurrentPage(p => Math.max(1, p - 1))}
                disabled={clsCurrentPage === 1}
                className="px-4 py-2.5 rounded-xl font-bold text-foreground bg-card shadow-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              
              <span className="text-sm font-black tracking-widest uppercase text-muted-foreground">
                Page <span className="text-orange-500">{clsCurrentPage}</span> of {clsTotalPages}
              </span>
              
              <button 
                onClick={() => setClsCurrentPage(p => Math.min(clsTotalPages, p + 1))}
                disabled={clsCurrentPage === clsTotalPages}
                className="px-4 py-2.5 rounded-xl font-bold text-foreground bg-card shadow-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-6">

          <div className="flex justify-between items-center text-left mb-2">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500"><Calendar className="w-7 h-7" /></div> Session History
            </h3>
            <button onClick={() => {
              setSessionForm({ id: null, name: '', startDate: '', endDate: '', makeActive: false });
              setSessionModalOpen(true);
            }} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> New Session
            </button>
          </div>

          <div className="relative glass-panel p-1 rounded-[2.5rem] group overflow-hidden shadow-xl transition-all duration-500">
            {/* Dynamic Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 blur-3xl opacity-50 pointer-events-none" />
            
            <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
              <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs border-b border-black/5 dark:border-white/5 pb-4 mb-8 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Timeline of Academic Years
              </h4>
              
              {sessions.length === 0 ? (
                 <div className="text-center py-16 text-muted-foreground font-medium border-2 border-dashed border-emerald-500/20 dark:border-emerald-500/20 rounded-3xl bg-emerald-500/5 dark:bg-emerald-500/5 flex flex-col items-center justify-center gap-4">
                   <div className="p-4 bg-emerald-500/10 rounded-full"><Calendar className="w-8 h-8 text-emerald-500" /></div>
                   <p className="text-lg">No academic sessions found. Create your first session!</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.map((session, idx) => {
                    const isFuture = new Date(session.startDate) > new Date();
                    const isPast = new Date(session.endDate) < new Date() && !session.isActive;

                    return (
                      <div key={session.id} className={`relative rounded-[2rem] p-[1px] group/card hover:-translate-y-2 transition-all duration-500 ${session.isActive ? 'shadow-2xl shadow-emerald-500/20 z-10 scale-105' : 'hover:shadow-xl'}`}>
                        {/* Border Gradient Wrapper */}
                        <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br opacity-50 group-hover/card:opacity-100 transition-opacity duration-500 ${session.isActive ? 'from-emerald-400 to-teal-600 blur-[2px]' : 'from-black/10 to-transparent dark:from-white/10 dark:to-transparent'}`} />
                        
                        {/* Card Content */}
                        <div className="relative h-full bg-card/90 dark:bg-card/80 backdrop-blur-xl p-6 rounded-[2rem] flex flex-col justify-between overflow-hidden">
                          
                          {/* Inner Glow for Active */}
                          {session.isActive && <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500 rounded-full blur-[60px] opacity-20 pointer-events-none" />}

                          <div>
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4 z-10">
                                <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg transform group-hover/card:scale-110 group-hover/card:rotate-[-5deg] transition-all duration-500 ${session.isActive ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white' : 'bg-black/5 dark:bg-white/5 text-muted-foreground group-hover/card:bg-black/10 dark:group-hover/card:bg-white/10'}`}>
                                  {session.isActive ? <CheckCircle2 className="w-7 h-7" /> : <Calendar className="w-6 h-6" />}
                                </div>
                                <div>
                                  <h4 className={`text-2xl font-black tracking-tight drop-shadow-sm ${session.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>{session.name}</h4>
                                  <div className="mt-1">
                                    {session.isActive ? (
                                      <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1 w-max">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Year
                                      </span>
                                    ) : isFuture ? (
                                      <span className="bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Upcoming</span>
                                    ) : (
                                      <span className="bg-black/5 dark:bg-white/5 text-muted-foreground px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5">Archived</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-1 z-10 opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 transition-opacity bg-background/50 backdrop-blur-md rounded-xl p-1 shadow-sm border border-black/5 dark:border-white/5">
                                <button onClick={() => handleEditSession(session)} className="p-2 text-indigo-500 hover:bg-white dark:hover:bg-black rounded-lg transition-all">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteSession(session.id, session.name)} className="p-2 text-red-500 hover:bg-white dark:hover:bg-black rounded-lg transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Dates Timeline */}
                            <div className="mt-8 space-y-3 z-10 relative">
                              <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Starts</span>
                                <span className="font-bold text-sm text-foreground">{new Date(session.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ends</span>
                                <span className="font-bold text-sm text-foreground">{new Date(session.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Holiday Planner Tab */}
      {activeTab === 'holidays' && (
        <div className="space-y-6">
          {/* Toast Notification */}
          <AnimatePresence>
            {holidayAlert && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-bold backdrop-blur-md ${
                  holidayAlert.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : holidayAlert.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                }`}
              >
                {holidayAlert.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : holidayAlert.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <Info className="w-5 h-5 text-blue-500" />
                )}
                <span>{holidayAlert.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center text-left mb-4 gap-4">
            <div>
              <h3 className="text-2xl font-black flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500"><Trophy className="w-7 h-7" /></div>
                School Holiday Calendar
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Plan summer/winter vacations and class-specific exam prep leaves.</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => applyHolidayPreset('Summer')}
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 px-4 py-2.5 rounded-2xl font-bold text-xs border border-amber-500/15 cursor-pointer transition-all flex items-center gap-1.5"
              >
                ☀️ Summer Vacation Preset
              </button>
              <button 
                onClick={() => applyHolidayPreset('Winter')}
                className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 px-4 py-2.5 rounded-2xl font-bold text-xs border border-blue-500/15 cursor-pointer transition-all flex items-center gap-1.5"
              >
                ❄️ Winter Vacation Preset
              </button>
              <button 
                onClick={() => {
                  setHolidayForm({ id: null, name: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], scope: 'All', classIds: [], category: 'Custom', allowAttendance: false });
                  setHolidayModalOpen(true);
                }} 
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-2xl font-bold text-xs hover:scale-105 active:scale-95 transition-all premium-shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Declare Holiday
              </button>
            </div>
          </div>

          {!sessions.find(s => s.isActive) ? (
            <div className="text-center py-16 bg-card border border-black/5 dark:border-white/5 rounded-3xl premium-shadow space-y-4">
              <Calendar className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
              <h4 className="text-xl font-black">No Active Academic Year Session</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto animate-pulse">
                Before you can schedule holidays or configure school profiles, please define and activate an Academic Year under the "Academic Years" tab.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Calendar Grid panel (LHS) */}
              <div className="lg:col-span-7 bg-card border border-black/5 dark:border-white/5 rounded-[2rem] p-6 premium-shadow space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 gap-4">
                  <div>
                    {/* Render current month label */}
                    {(() => {
                      const activeSess = sessions.find(s => s.isActive);
                      const startSess = activeSess ? new Date(activeSess.startDate) : null;
                      const endSess = activeSess ? new Date(activeSess.endDate) : null;

                      // Years list
                      const yearsList = [];
                      if (startSess && endSess) {
                        for (let y = startSess.getFullYear(); y <= endSess.getFullYear(); y++) {
                          yearsList.push(y);
                        }
                      } else {
                        const curY = new Date().getFullYear();
                        yearsList.push(curY - 1, curY, curY + 1);
                      }

                      // Months list for selected year
                      const monthsList = [];
                      if (startSess && endSess && activeSess) {
                        const startM = holidayCalendarYear === startSess.getFullYear() ? startSess.getMonth() : 0;
                        const endM = holidayCalendarYear === endSess.getFullYear() ? endSess.getMonth() : 11;
                        for (let m = startM; m <= endM; m++) {
                          monthsList.push({
                            value: m + 1,
                            label: new Date(holidayCalendarYear, m, 1).toLocaleString('en-IN', { month: 'long' })
                          });
                        }
                      } else {
                        for (let m = 0; m < 12; m++) {
                          monthsList.push({
                            value: m + 1,
                            label: new Date(2000, m, 1).toLocaleString('en-IN', { month: 'long' })
                          });
                        }
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <select
                            value={holidayCalendarMonth}
                            onChange={e => setHolidayCalendarMonth(parseInt(e.target.value))}
                            className="bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-black/5 text-xs font-black cursor-pointer"
                          >
                            {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                          <select
                            value={holidayCalendarYear}
                            onChange={e => setHolidayCalendarYear(parseInt(e.target.value))}
                            className="bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-black/5 text-xs font-black cursor-pointer"
                          >
                            {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">★ School Holiday</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15">◈ Class Specific</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2.5 text-center">
                  {/* Calendar day titles */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
                    <div 
                      key={d} 
                      className={`text-[9px] font-black uppercase tracking-wider pb-1.5 border-b border-black/5 ${
                        index === 0 ? 'text-rose-500' : 'text-muted-foreground'
                      }`}
                    >
                      {d}
                    </div>
                  ))}

                  {/* Calendar cell offsets */}
                  {(() => {
                    const firstDayIdx = new Date(holidayCalendarYear, holidayCalendarMonth - 1, 1).getDay();
                    return Array.from({ length: firstDayIdx }).map((_, i) => (
                      <div key={`offset-${i}`} className="bg-black/[0.01] rounded-xl aspect-square border border-transparent" />
                    ));
                  })()}

                  {/* Calendar cell days */}
                  {(() => {
                    const daysInMonth = new Date(holidayCalendarYear, holidayCalendarMonth, 0).getDate();
                    const activeSess = sessions.find(s => s.isActive);
                    const todayStr = new Date().toISOString().split('T')[0];

                    return Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const dateStr = `${holidayCalendarYear}-${String(holidayCalendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const cellDate = new Date(Date.UTC(holidayCalendarYear, holidayCalendarMonth - 1, day, 0, 0, 0, 0));
                      
                      const isOutOfSession = activeSess && (
                        cellDate < new Date(activeSess.startDate) ||
                        cellDate > new Date(activeSess.endDate)
                      );

                      const isSun = cellDate.getUTCDay() === 0;
                      const isPast = dateStr < todayStr;

                      // Check for scheduled holidays
                      const targetD = new Date(dateStr);
                      targetD.setHours(0,0,0,0);
                      const matched = holidaysList.find(h => {
                        const s = new Date(h.startDate);
                        s.setHours(0,0,0,0);
                        const e = new Date(h.endDate);
                        e.setHours(0,0,0,0);
                        return targetD >= s && targetD <= e;
                      });

                      const isHoliday = !!matched;

                      return (
                        <button
                          key={day}
                          disabled={isOutOfSession || isPast}
                          onClick={() => {
                            setHolidayForm({
                              id: null,
                              name: '',
                              startDate: dateStr,
                              endDate: dateStr,
                              scope: 'All',
                              classIds: [],
                              category: 'Custom',
                              allowAttendance: false
                            });
                            setHolidayModalOpen(true);
                          }}
                          className={`p-2.5 rounded-xl flex flex-col justify-between items-start aspect-square border text-left transition-all relative group ${
                            isOutOfSession
                              ? 'opacity-20 bg-black/5 border-transparent cursor-not-allowed'
                              : isPast
                                ? 'bg-black/[0.02] border-black/5 dark:border-white/5 opacity-50 cursor-not-allowed'
                                : isHoliday
                                  ? matched.allowAttendance
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-pointer shadow-sm hover:bg-emerald-500/20'
                                    : matched.scope === 'All'
                                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 cursor-pointer shadow-sm hover:bg-amber-500/20'
                                      : 'bg-blue-500/5 border-dashed border-blue-500/30 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-500/10'
                                  : isSun
                                    ? 'bg-black/5 border-transparent text-muted-foreground/50 cursor-pointer hover:bg-black/10'
                                    : 'bg-card border-black/5 hover:border-amber-500/30 cursor-pointer'
                          }`}
                        >
                          <span className="text-xs font-black">{day}</span>
                          <span className="text-[8px] font-black uppercase leading-tight w-full truncate">
                            {isOutOfSession ? (
                              'Inactive'
                            ) : isHoliday ? (
                              matched.allowAttendance
                                ? '⚡ ' + matched.name
                                : matched.scope === 'All' ? '★ ' + matched.name : '◈ ' + matched.name
                            ) : isSun ? (
                              'Sun'
                            ) : isPast ? (
                              'Past'
                            ) : (
                              <span className="text-transparent group-hover:text-amber-500/50 transition-colors">+ Add</span>
                            )}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Holiday list overview (RHS) */}
              <div className="lg:col-span-5 bg-card border border-black/5 dark:border-white/5 rounded-[2rem] p-6 premium-shadow space-y-6">
                <div className="space-y-3">
                  <h4 className="font-black text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> Active Holidays list
                  </h4>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text"
                      placeholder="Search holiday by name..."
                      value={holidaySearchQuery}
                      onChange={e => setHolidaySearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-black/5 dark:bg-white/5 border border-black/5 rounded-xl outline-none font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Holiday card lists */}
                {(() => {
                  let filtered = holidaysList.filter(h => {
                    const matchesQuery = h.name.toLowerCase().includes(holidaySearchQuery.toLowerCase());
                    const startYear = new Date(h.startDate).getFullYear();
                    const endYear = new Date(h.endDate).getFullYear();
                    const matchesYear = startYear === holidayCalendarYear || endYear === holidayCalendarYear;
                    return matchesQuery && matchesYear;
                  });
                  
                  // Sort chronologically by startDate
                  filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 border border-dashed border-black/10 dark:border-white/10 rounded-2xl text-muted-foreground text-xs font-bold">
                        No holidays matched active search.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3 max-h-[520px] overflow-auto custom-scrollbar pr-1">
                      {filtered.map(holiday => {
                        const isSummer = holiday.category === 'SummerVacation';
                        const isWinter = holiday.category === 'WinterVacation';
                        const isPrep = holiday.category === 'PrepLeave';

                        return (
                          <div 
                            key={holiday.id}
                            className={`p-4 rounded-2xl border text-left flex justify-between items-start gap-3 transition-all hover:shadow-sm ${
                              isSummer 
                                ? 'bg-amber-500/5 border-amber-500/10'
                                : isWinter
                                  ? 'bg-blue-500/5 border-blue-500/10'
                                  : isPrep
                                    ? 'bg-purple-500/5 border-purple-500/10'
                                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/10'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <h5 className="font-extrabold text-sm text-foreground truncate">{holiday.name}</h5>
                              
                              <div className="flex flex-wrap gap-1.5 items-center pt-0.5">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${
                                  holiday.scope === 'All'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                                }`}>
                                  {holiday.scope === 'All' ? 'All Classes' : 'Class Specific'}
                                </span>
                                
                                <span className="bg-black/5 text-muted-foreground border border-black/5 px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono">
                                  {new Date(holiday.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  {holiday.startDate !== holiday.endDate && ` - ${new Date(holiday.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                                </span>

                                {holiday.allowAttendance && (
                                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[8px] font-black uppercase">
                                    ⚡ Working Day
                                  </span>
                                )}
                              </div>

                              {holiday.scope === 'ClassSpecific' && holiday.classIds && (
                                <p className="text-[9px] text-muted-foreground font-black truncate max-w-xs pt-1">
                                  Classes: {holiday.classIds.map(cid => classes.find(c => c.id === cid)?.name || cid).join(', ')}
                                </p>
                              )}
                            </div>

                            <button 
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              className="p-1.5 text-muted-foreground hover:text-red-500 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 border border-transparent rounded-lg cursor-pointer transition-all shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Holiday Declare Modal Editor */}
          <AnimatePresence>
            {isHolidayModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setHolidayModalOpen(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.98 }}
                  className="relative bg-card border border-black/5 dark:border-white/10 w-full max-w-lg rounded-3xl premium-shadow shadow-2xl overflow-hidden text-left z-10"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
                  
                  <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                    <h4 className="text-lg font-black text-foreground flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      {holidayForm.id ? 'Modify Scheduled Holiday' : 'Declare New Holiday'}
                    </h4>
                    <button 
                      onClick={() => setHolidayModalOpen(false)}
                      className="p-1 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleHolidaySubmit} className="p-6 space-y-5">
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Holiday Title / Label *</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Diwali Holiday, Guru Nanak Jayanti"
                        value={holidayForm.name}
                        onChange={e => setHolidayForm({ ...holidayForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/50 font-bold text-sm text-left"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Start Date *</label>
                        <input 
                          required
                          type="date"
                          value={holidayForm.startDate}
                          onChange={e => setHolidayForm({ ...holidayForm, startDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/50 font-bold font-mono text-xs"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">End Date *</label>
                        <input 
                          required
                          type="date"
                          value={holidayForm.endDate}
                          onChange={e => setHolidayForm({ ...holidayForm, endDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/50 font-bold font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Holiday Category</label>
                        <select
                          value={holidayForm.category}
                          onChange={e => setHolidayForm({ ...holidayForm, category: e.target.value })}
                          className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/50 font-bold text-xs cursor-pointer"
                        >
                          <option value="Custom">Custom Holiday</option>
                          <option value="SummerVacation">Summer Vacation</option>
                          <option value="WinterVacation">Winter Vacation</option>
                          <option value="PrepLeave">Exam Prep Leave</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Scope / Audience</label>
                        <select
                          value={holidayForm.scope}
                          onChange={e => setHolidayForm({ ...holidayForm, scope: e.target.value, classIds: e.target.value === 'All' ? [] : holidayForm.classIds })}
                          className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/50 font-bold text-xs cursor-pointer"
                        >
                          <option value="All">Whole School (All Classes)</option>
                          <option value="ClassSpecific">Class Specific (Exam leaves)</option>
                        </select>
                      </div>
                    </div>

                    {/* Force Enable Attendance Toggle */}
                    <div className="pt-2">
                      <label className="flex items-start gap-3 bg-black/5 dark:bg-white/5 border border-black/5 p-4 rounded-2xl cursor-pointer hover:bg-black/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={holidayForm.allowAttendance || false}
                          onChange={e => setHolidayForm({ ...holidayForm, allowAttendance: e.target.checked })}
                          className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="text-left">
                          <span className="block text-xs font-black text-foreground">Force Enable Attendance (Working Day)</span>
                          <span className="block text-[9px] text-muted-foreground font-medium mt-0.5">
                            Keep attendance marking enabled on this holiday (e.g., for Sunday sessions or special event attendance).
                          </span>
                        </div>
                      </label>
                    </div>

                    {holidayForm.scope === 'ClassSpecific' && (
                      <div className="space-y-2 animate-fadeIn">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Classes Affected *</label>
                        <div className="grid grid-cols-3 gap-2.5 max-h-[140px] overflow-auto custom-scrollbar p-1">
                          {classes.map(c => {
                            const checked = holidayForm.classIds.includes(c.id);
                            return (
                              <label key={c.id} className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-black/5 p-2 rounded-xl cursor-pointer hover:bg-black/10 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    const ids = checked 
                                      ? holidayForm.classIds.filter(id => id !== c.id)
                                      : [...holidayForm.classIds, c.id];
                                    setHolidayForm({ ...holidayForm, classIds: ids });
                                  }}
                                  className="rounded text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span className="text-[10px] font-black text-foreground truncate">{c.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-black/5 dark:border-white/5 flex justify-end gap-3">
                      <button 
                        type="button"
                        onClick={() => setHolidayModalOpen(false)}
                        className="px-5 py-3 bg-black/5 hover:bg-black/10 text-muted-foreground rounded-2xl font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                      >
                        Schedule Holiday
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Manage Staff/Teachers Tab */}
      {activeTab === 'staff' && (
        <HRModule />
      )}

      {activeTab === 'master-subjects' && (
        <div className="space-y-6">

          <div className="flex justify-between items-center text-left mb-2">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-500"><Library className="w-7 h-7" /></div> Master Subjects
            </h3>
            <button onClick={() => {
              setMasterSubjectForm({ id: null, name: '', code: '' });
              setMasterSubjectModalOpen(true);
            }} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Add Master Subject
            </button>
          </div>

          <div className="relative glass-panel p-1 rounded-[2.5rem] group overflow-hidden shadow-xl transition-all duration-500">
            {/* Dynamic Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-rose-500/10 blur-3xl opacity-50 pointer-events-none" />
            
            <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
              <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs border-b border-black/5 dark:border-white/5 pb-4 mb-8 flex items-center gap-2">
                <Library className="w-4 h-4" /> Global Subject List
              </h4>

              <div className="relative mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group/search">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-pink-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search master subjects by name or code..." 
                    value={msSearchTerm}
                    onChange={e => setMsSearchTerm(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-pink-500/50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-pink-500/20 text-foreground transition-all font-medium"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="relative min-w-[160px] flex items-center bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-pink-500/50 transition-all focus-within:ring-4 focus-within:ring-pink-500/20">
                    <select 
                      value={msSortBy}
                      onChange={(e) => setMsSortBy(e.target.value)}
                      className="w-full bg-transparent pl-4 pr-2 py-4 outline-none text-foreground font-bold appearance-none cursor-pointer flex-1"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="code">Sort by Code</option>
                    </select>
                    <button 
                      onClick={() => setMsSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
                      className="px-3 hover:text-pink-500 transition-colors border-l border-black/10 dark:border-white/10 h-full flex items-center justify-center text-muted-foreground"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            
              {currentMasterSubjects.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground font-medium border-2 border-dashed border-pink-500/20 dark:border-pink-500/20 rounded-3xl bg-pink-500/5 dark:bg-pink-500/5 flex flex-col items-center justify-center gap-4">
                  <div className="p-4 bg-pink-500/10 rounded-full"><Library className="w-8 h-8 text-pink-500" /></div>
                  <p className="text-lg">No master subjects found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {currentMasterSubjects.map(sub => (
                  <div key={sub.id} className="group relative overflow-hidden rounded-2xl bg-card border border-black/5 dark:border-white/10 hover:shadow-xl hover:shadow-pink-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    {/* Top Banner */}
                    <div className="h-10 bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-red-500/20 relative">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                      {/* Action Buttons */}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={() => handleEditMasterSubject(sub)} className="p-1.5 bg-card/80 backdrop-blur-md text-indigo-500 hover:text-indigo-400 hover:bg-card rounded-lg transition-all shadow-sm">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteMasterSubject(sub.id, sub.name)} className="p-1.5 bg-card/80 backdrop-blur-md text-red-500 hover:text-red-400 hover:bg-card rounded-lg transition-all shadow-sm">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="px-4 relative pb-4 flex-1 flex flex-col">
                      {/* Avatar overlaying the banner */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white font-black text-lg premium-shadow absolute -top-5 border-[3px] border-card">
                        <Library className="w-5 h-5" />
                      </div>
                      
                      <div className="mt-7 flex flex-col gap-1">
                        <h4 className="text-base font-black text-foreground truncate" title={sub.name}>{sub.name}</h4>
                        {sub.code && <span className="bg-pink-500/10 text-pink-500 px-2 py-0.5 w-max rounded-md text-[9px] font-black uppercase tracking-wider">{sub.code}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}

              {/* Pagination */}
              {msTotalPages > 1 && (
                <div className="mt-8 flex justify-between items-center bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setMsCurrentPage(p => Math.max(1, p - 1))}
                    disabled={msCurrentPage === 1}
                    className="px-4 py-2.5 rounded-xl font-bold text-foreground bg-card shadow-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  
                  <span className="text-sm font-black tracking-widest uppercase text-muted-foreground">
                    Page <span className="text-pink-500">{msCurrentPage}</span> of {msTotalPages}
                  </span>
                  
                  <button 
                    onClick={() => setMsCurrentPage(p => Math.min(msTotalPages, p + 1))}
                    disabled={msCurrentPage === msTotalPages}
                    className="px-4 py-2.5 rounded-xl font-bold text-foreground bg-card shadow-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="space-y-6">

          <div className="flex justify-between items-center text-left mb-2">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500"><BookOpen className="w-7 h-7" /></div> Manage Class
            </h3>
          </div>

          {/* QUICK MANAGE SHORTCUT */}
          <div className="bg-card p-6 rounded-[2rem] border border-black/5 dark:border-white/5 mb-6">
            <label className="block text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 text-left">Select a Class to Manage <span className="text-red-500">*</span></label>
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                value={selectedClassId}
                onChange={e => {
                  setSelectedClassId(e.target.value);
                  setSelectedSectionId('');
                }}
                className="flex-1 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-purple-500/20 text-foreground transition-all font-bold appearance-none text-lg cursor-pointer"
              >
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {selectedClassId && (
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 items-center">
                  {classes.find(c => c.id === selectedClassId)?.sections?.map(sec => (
                    <button 
                      key={sec.id}
                      onClick={() => {
                        setSelectedSectionId(sec.id);
                        setIsEditPlanModalOpen(true);
                      }}
                      className={`px-6 py-3.5 rounded-xl font-bold transition-all whitespace-nowrap bg-purple-500/10 hover:bg-purple-500 text-purple-600 dark:text-purple-400 hover:text-white`}
                    >
                      Section {sec.name}
                    </button>
                  ))}
                  {(!classes.find(c => c.id === selectedClassId)?.sections || classes.find(c => c.id === selectedClassId).sections.length === 0) && (
                    <span className="text-amber-500 font-bold text-sm bg-amber-500/10 px-4 py-2 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> No sections found. Please add a section first.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MASTER PLAN OVERVIEW */}
          <div className="space-y-6">
            {(() => {
              const pairs = [];
              (selectedClassId ? classes.filter(c => c.id === selectedClassId) : classes).forEach(c => {
                if (!c.sections || c.sections.length === 0) {
                  pairs.push({ c, sec: null, assignedCount: 0 });
                } else {
                  c.sections.forEach(sec => {
                    const assignedCount = subjects.filter(s => s.classId === c.id && s.sectionId === sec.id).length;
                    pairs.push({ c, sec, assignedCount });
                  });
                }
              });

              const unplanned = pairs.filter(p => p.assignedCount === 0);
              const planned = pairs.filter(p => p.assignedCount > 0);

              return (
                <>
                  {/* UNPLANNED TABLE */}
                  <div className="bg-card p-6 rounded-[2rem] border border-amber-500/20 dark:border-amber-500/20 mb-6 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <h4 className="font-black text-foreground uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" /> Pending Planning
                    </h4>
                    <div className="overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
                      <table className="w-full text-left border-collapse relative">
                        <thead className="sticky top-0 bg-card z-10 shadow-sm">
                          <tr className="border-b border-black/10 dark:border-white/10 text-muted-foreground text-[11px] uppercase tracking-widest">
                            <th className="p-3 font-bold">Class</th>
                            <th className="p-3 font-bold">Section</th>
                            <th className="p-3 font-bold">Status</th>
                            <th className="p-3 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-foreground">
                          {unplanned.map(({c, sec}) => {
                            if (!sec) {
                              return (
                                <tr key={`unplanned-no-sec-${c.id}`} className="border-b border-black/5 dark:border-white/5">
                                  <td className="p-3 font-black text-purple-500">{c.name}</td>
                                  <td colSpan="3" className="p-3 text-amber-500 font-bold bg-amber-500/5">
                                    This class has no sections. Go to "Classes & Sections" to add one.
                                  </td>
                                </tr>
                              );
                            }
                            return (
                              <tr key={`unplanned-${c.id}-${sec.id}`} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="p-3 font-black text-purple-500">{c.name}</td>
                                <td className="p-3">Section {sec.name}</td>
                                <td className="p-3">
                                  <span className="text-amber-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"><AlertTriangle className="w-4 h-4"/> Not Planned</span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedClassId(c.id);
                                      setSelectedSectionId(sec.id);
                                      setIsEditPlanModalOpen(true);
                                    }}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-sm hover:scale-105"
                                  >
                                    Add Plan
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {unplanned.length === 0 && (
                            <tr>
                              <td colSpan="4" className="p-6 text-center text-emerald-500 font-bold bg-emerald-500/5 rounded-xl">
                                <CheckCircle2 className="w-6 h-6 mx-auto mb-2" /> All classes and sections are fully planned!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PLANNED TABLE */}
                  {planned.length > 0 && (
                    <div className="bg-card p-6 rounded-[2rem] border border-black/5 dark:border-white/5 mb-6 overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                      <h4 className="font-black text-foreground uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-500" /> Planned Classes Overview
                      </h4>
                      <div className="overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
                        <table className="w-full text-left border-collapse relative">
                          <thead className="sticky top-0 bg-card z-10 shadow-sm">
                            <tr className="border-b border-black/10 dark:border-white/10 text-muted-foreground text-[11px] uppercase tracking-widest">
                              <th className="p-3 font-bold">Class</th>
                              <th className="p-3 font-bold">Section</th>
                              <th className="p-3 font-bold">Subjects Planned</th>
                              <th className="p-3 font-bold">Status</th>
                              <th className="p-3 font-bold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-medium text-foreground">
                            {planned.map(({c, sec, assignedCount}) => (
                              <tr key={`planned-${c.id}-${sec.id}`} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="p-3 font-black text-purple-500">{c.name}</td>
                                <td className="p-3">Section {sec.name}</td>
                                <td className="p-3">
                                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold">{assignedCount} Subjects</span>
                                </td>
                                <td className="p-3">
                                  {assignedCount >= 5 ? 
                                    <span className="text-emerald-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"><CheckCircle2 className="w-4 h-4"/> Fully Planned</span> : 
                                    <span className="text-amber-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"><AlertTriangle className="w-4 h-4"/> Needs More</span>
                                  }
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedClassId(c.id);
                                        setSelectedSectionId(sec.id);
                                        setIsEditPlanModalOpen(true);
                                      }}
                                      className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 transition-colors"
                                    >
                                      Edit Plan
                                    </button>
                                    <button
                                      onClick={() => {
                                        setPreviewClassId(c.id);
                                        setPreviewSectionId(sec.id);
                                        setIsPreviewModalOpen(true);
                                      }}
                                      className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition-colors"
                                    >
                                      Preview
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

                  </div>
      )}

      {/* Premium Add Class Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setClassModalOpen(false)}
        title={classForm.id ? 'Edit Class' : 'Add New Class'}
        icon={Book}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleClassSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-2 gap-5">
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 group-focus-within:text-purple-500 transition-colors">Class Number / Level <span className="text-red-500">*</span></label>
              <div className="relative flex items-center">
                <span className="absolute left-5 font-bold text-muted-foreground text-sm">Class</span>
                <input 
                  required
                  pattern="[0-9A-Za-z\s\-]{1,10}"
                  type="text" 
                  placeholder="e.g. 10 or X"
                  value={classForm.name}
                  onChange={e => setClassForm({...classForm, name: e.target.value.replace(/^Class\s*/i, '')})}
                  className="peer w-full pl-16 pr-5 py-3 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-purple-500/50 rounded-2xl font-bold focus:ring-4 focus:ring-purple-500/20 outline-none transition-all text-sm" 
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 group-focus-within:text-emerald-500 transition-colors">Max Capacity <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  required
                  type="number" 
                  min="1"
                  max="200"
                  placeholder="e.g. 40"
                  value={classForm.maxCapacity}
                  onChange={e => setClassForm({...classForm, maxCapacity: e.target.value})}
                  className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-emerald-500/50 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-emerald-500/20 text-foreground transition-all font-mono text-sm" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 group-focus-within:text-indigo-500 transition-colors">Sections (Comma Separated)</label>
              <div className="relative">
                <input 
                  type="text" 
                  pattern="^[A-Za-z0-9](,\s*[A-Za-z0-9])*$"
                  placeholder="e.g. A, B, C"
                  value={classForm.sections}
                  onChange={e => setClassForm({...classForm, sections: e.target.value})}
                  className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-indigo-500/50 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-indigo-500/20 text-foreground transition-all text-sm" 
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 group-focus-within:text-amber-500 transition-colors">Order Index</label>
              <div className="relative">
                <input 
                  required
                  type="number" 
                  min="1"
                  max="100"
                  placeholder="e.g. 1"
                  value={classForm.orderIndex}
                  onChange={e => setClassForm({...classForm, orderIndex: e.target.value})}
                  className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-amber-500/50 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-amber-500/20 text-foreground transition-all font-mono text-sm" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 group-focus-within:text-pink-500 transition-colors">Period Duration <span className="text-red-500">*</span></label>
              <select 
                required
                value={classForm.periodDuration}
                onChange={e => setClassForm({...classForm, periodDuration: e.target.value})}
                className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-pink-500/50 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-pink-500/20 text-foreground transition-all font-bold text-sm cursor-pointer"
              >
                <option value="30">30 Minutes</option>
                <option value="35">35 Minutes</option>
                <option value="40">40 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="50">50 Minutes</option>
                <option value="60">60 Minutes</option>
                <option value="90">90 Minutes</option>
              </select>
              <p className="mt-1.5 text-[11px] text-muted-foreground font-medium">Controls automatic end-time calculation for subjects.</p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-black/5 dark:border-white/5">
            <button type="button" onClick={() => setClassModalOpen(false)} className="px-5 py-3 rounded-xl font-bold text-xs text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmittingClass} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 premium-shadow hover:scale-105 transition-all disabled:opacity-50">
              {isSubmittingClass ? 'Saving...' : <><div className="bg-white/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4" /></div> {classForm.id ? 'Update Class' : 'Confirm Class'}</>}
            </button>
          </div>
        </form>
      </Modal>
         {/* Edit School Profile Modal */}
      <Modal
        isOpen={isEditingSchoolProfile}
        onClose={() => setIsEditingSchoolProfile(false)}
        title="Edit Core Settings"
        icon={Settings}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSchoolSave} className="space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timings */}
            <div className="space-y-6">
              <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs border-b border-black/5 dark:border-white/5 pb-2">Operational Timings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-indigo-500 transition-colors">Start Time <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      required
                      type="time" 
                      value={schoolConfig.schoolStartTime || ''}
                      onChange={e => setSchoolConfig({...schoolConfig, schoolStartTime: e.target.value})}
                      className="peer w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-indigo-500/50 rounded-2xl font-mono focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all focus:invalid:border-red-500 focus:invalid:ring-red-500/20"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-indigo-500 transition-colors">End Time <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      required
                      type="time" 
                      value={schoolConfig.schoolEndTime || ''}
                      onChange={e => setSchoolConfig({...schoolConfig, schoolEndTime: e.target.value})}
                      className="peer w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-indigo-500/50 rounded-2xl font-mono focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all focus:invalid:border-red-500 focus:invalid:ring-red-500/20"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-orange-500 transition-colors">Lunch Start <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      required
                      type="time" 
                      value={schoolConfig.lunchStartTime || ''}
                      onChange={e => setSchoolConfig({...schoolConfig, lunchStartTime: e.target.value})}
                      className="peer w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-orange-500/50 rounded-2xl font-mono focus:ring-4 focus:ring-orange-500/20 outline-none transition-all focus:invalid:border-red-500 focus:invalid:ring-red-500/20"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-orange-500 transition-colors">Lunch End <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      required
                      type="time" 
                      value={schoolConfig.lunchEndTime || ''}
                      onChange={e => setSchoolConfig({...schoolConfig, lunchEndTime: e.target.value})}
                      className="peer w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-orange-500/50 rounded-2xl font-mono focus:ring-4 focus:ring-orange-500/20 outline-none transition-all focus:invalid:border-red-500 focus:invalid:ring-red-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hierarchy */}
            <div className="space-y-6">
              <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs border-b border-black/5 dark:border-white/5 pb-2">Management Hierarchy</h4>
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-purple-500 transition-colors">Principal Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Users className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-purple-500 transition-colors" />
                    <input 
                      required
                      pattern="[A-Za-z\s\.]{3,50}"
                      title="Please enter a valid name (letters and spaces only)"
                      type="text" 
                      placeholder="e.g. Dr. A. P. Sharma"
                      value={schoolConfig.principalName || ''}
                      onChange={e => setSchoolConfig({...schoolConfig, principalName: e.target.value})}
                      className="peer w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-purple-500/50 rounded-2xl font-medium focus:ring-4 focus:ring-purple-500/20 outline-none transition-all focus:invalid:border-red-500 focus:invalid:ring-red-500/20 placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-purple-500 transition-colors">Manager Name</label>
                  <div className="relative">
                    <Users className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-purple-500 transition-colors" />
                    <input 
                      pattern="[A-Za-z\s\.]{3,50}"
                      type="text" 
                      placeholder="e.g. Mr. R. K. Gupta"
                      value={schoolConfig.managerName || ''}
                      onChange={e => setSchoolConfig({...schoolConfig, managerName: e.target.value})}
                      className="peer w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-purple-500/50 rounded-2xl font-medium focus:ring-4 focus:ring-purple-500/20 outline-none transition-all focus:invalid:border-red-500 focus:invalid:ring-red-500/20 placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-6 md:col-span-2">
              <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs border-b border-black/5 dark:border-white/5 pb-2">Contact Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-emerald-500 transition-colors">Primary Phone <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      required
                      pattern="[0-9]{10}"
                      title="Phone number must be exactly 10 digits"
                      maxLength="10"
                      type="tel" 
                      placeholder="10-digit number"
                      value={schoolConfig.contactPhone || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setSchoolConfig({...schoolConfig, contactPhone: val});
                      }}
                      className="peer w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-emerald-500/50 rounded-2xl font-mono font-bold focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all focus:invalid:border-red-500 focus:invalid:ring-red-500/20 placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-amber-500 transition-colors">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                      required
                      type="email" 
                      maxLength="100"
                      pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                      title="Please enter a valid email address"
                      placeholder="school@example.com"
                      value={schoolConfig.contactEmail || ''}
                      onChange={e => setSchoolConfig({...schoolConfig, contactEmail: e.target.value})}
                      className="peer w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-amber-500/50 rounded-2xl font-medium focus:ring-4 focus:ring-amber-500/20 outline-none transition-all focus:invalid:border-red-500 focus:invalid:ring-red-500/20 placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-rose-500 transition-colors">Full Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-rose-500 transition-colors" />
                    <input 
                      required
                      type="text" 
                      placeholder="Street, City, Zip"
                      value={schoolConfig.schoolAddress || ''}
                      onChange={e => setSchoolConfig({...schoolConfig, schoolAddress: e.target.value})}
                      className="peer w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-rose-500/50 rounded-2xl font-medium focus:ring-4 focus:ring-rose-500/20 outline-none transition-all focus:invalid:border-red-500 focus:invalid:ring-red-500/20 placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-black/5 dark:border-white/5">
            <button type="button" onClick={() => setIsEditingSchoolProfile(false)} className="px-6 py-3 rounded-xl border border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 font-bold transition-all text-xs">
              Cancel
            </button>
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-xs">
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </form>
      </Modal>

      {/* Premium Add Session Modal */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        title={sessionForm.id ? 'Edit Academic Session' : 'Create Academic Session'}
        icon={Hash}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSessionSubmit} className="space-y-6 text-left">
          <div className="group">
            <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-emerald-500 transition-colors">Session Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <Hash className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                required
                pattern="[0-9]{4}-[0-9]{4}"
                type="text" 
                placeholder="e.g. 2024-2025"
                value={sessionForm.name}
                onChange={e => setSessionForm({...sessionForm, name: e.target.value})}
                className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-emerald-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-emerald-500/20 text-foreground transition-all font-mono font-bold focus:invalid:border-red-500 focus:invalid:ring-red-500/20" 
              />
              <p className="mt-1.5 text-xs text-red-500 font-medium opacity-0 peer-invalid:peer-focus:opacity-100 transition-opacity absolute -bottom-5 left-1">Use format YYYY-YYYY (e.g., 2024-2025).</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="group">
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-emerald-500 transition-colors">Start Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  type="date" 
                  value={sessionForm.startDate}
                  onChange={e => setSessionForm({...sessionForm, startDate: e.target.value})}
                  className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-emerald-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-emerald-500/20 text-foreground transition-all font-mono focus:invalid:border-red-500 focus:invalid:ring-red-500/20" 
                />
                <p className="mt-1.5 text-xs text-red-500 font-medium opacity-0 peer-invalid:peer-focus:opacity-100 transition-opacity absolute -bottom-5 left-1">Start Date is required.</p>
              </div>
            </div>
            <div className="group">
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-rose-500 transition-colors">End Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-rose-500 transition-colors" />
                <input 
                  required
                  type="date" 
                  value={sessionForm.endDate}
                  onChange={e => setSessionForm({...sessionForm, endDate: e.target.value})}
                  className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-rose-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-rose-500/20 text-foreground transition-all font-mono focus:invalid:border-red-500 focus:invalid:ring-red-500/20" 
                />
                <p className="mt-1.5 text-xs text-red-500 font-medium opacity-0 peer-invalid:peer-focus:opacity-100 transition-opacity absolute -bottom-5 left-1">End Date is required.</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label htmlFor="makeActive" className="flex items-start gap-4 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/10 transition-colors">
              <div className="pt-0.5">
                <input 
                   type="checkbox" 
                   id="makeActive"
                   checked={sessionForm.makeActive}
                   onChange={e => setSessionForm({...sessionForm, makeActive: e.target.checked})}
                   className="w-5 h-5 rounded-md border-emerald-500/50 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer"
                />
              </div>
              <div>
                <span className="block font-bold text-emerald-600 dark:text-emerald-400">Set as Active Session</span>
                <span className="block text-xs text-muted-foreground font-medium mt-1">This will automatically deactivate all other previously created academic sessions.</span>
              </div>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-black/5 dark:border-white/5">
            <button type="button" onClick={() => setSessionModalOpen(false)} className="px-6 py-3 rounded-xl border border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 font-bold transition-all text-xs">
              Cancel
            </button>
            <button type="submit" disabled={isSubmittingSession} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-xs disabled:opacity-50">
              {isSubmittingSession ? 'Saving...' : <><div className="bg-white/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4" /></div> {sessionForm.id ? 'Update Session' : 'Start Session'}</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Premium Add Master Subject Modal */}
      <AnimatePresence>
        {isMasterSubjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              onClick={() => setMasterSubjectModalOpen(false)}
              className="absolute inset-0 bg-black/40 dark:bg-black/60 transition-all"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[2rem] premium-shadow overflow-hidden z-10 text-left"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{masterSubjectForm.id ? 'Edit Master Subject' : 'Add Master Subject'}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{masterSubjectForm.id ? 'Update the details for this master subject.' : 'Create a new global subject for the catalog.'}</p>
                </div>
                <button onClick={() => setMasterSubjectModalOpen(false)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleMasterSubjectSubmit} className="p-8 space-y-6 bg-background/50 text-left">
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-pink-500 transition-colors">Subject Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Library className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-pink-500 transition-colors" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Mathematics"
                        value={masterSubjectForm.name}
                        onChange={e => setMasterSubjectForm({...masterSubjectForm, name: e.target.value})}
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-pink-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-pink-500/20 text-foreground transition-all font-bold focus:invalid:border-red-500 focus:invalid:ring-red-500/20" 
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-rose-500 transition-colors">Subject Code</label>
                    <div className="relative">
                      <Hash className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-rose-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="e.g. MAT101"
                        value={masterSubjectForm.code}
                        onChange={e => setMasterSubjectForm({...masterSubjectForm, code: e.target.value})}
                        className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-rose-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-rose-500/20 text-foreground transition-all font-mono font-bold" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-8 border-t border-black/5 dark:border-white/10 flex justify-end gap-4 bg-background p-4 rounded-b-[2rem] -mx-8 -mb-8">
                  <button type="button" onClick={() => setMasterSubjectModalOpen(false)} className="px-6 py-3.5 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingMasterSubject} className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold flex items-center gap-3 premium-shadow hover:scale-105 transition-all disabled:opacity-50">
                    {isSubmittingMasterSubject ? 'Saving...' : <><div className="bg-white/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4" /></div> {masterSubjectForm.id ? 'Update Master Subject' : 'Save Master Subject'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

            {/* EDIT PLAN MODAL */}
      {typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
          {isEditPlanModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center p-4 md:p-8" style={{ zIndex: 99998 }}>
              <div 
                className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm cursor-pointer" 
                onClick={() => setIsEditPlanModalOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="relative w-full max-w-[95vw] lg:max-w-7xl bg-white/95 dark:bg-black/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.2)] dark:shadow-[0_0_100px_rgba(255,255,255,0.05)] flex flex-col max-h-[calc(100vh-4rem)] md:max-h-[85vh] overflow-hidden z-10"
              >
                {/* Header */}
                <div className="flex-none p-4 md:p-6 lg:p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 relative z-30 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2.5 md:p-3.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-purple-500/30">
                      <BookOpen className="w-6 h-6 md:w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Manage Class Subjects</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-black text-foreground uppercase tracking-widest">
                          {(() => {
                            const name = classes.find(c => c.id === selectedClassId)?.name || '';
                            return name.toLowerCase().startsWith('class') ? name : `Class ${name}`;
                          })()}
                        </span>
                        {selectedSectionId && (
                          <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-black uppercase tracking-widest">
                            Section {classes.find(c => c.id === selectedClassId)?.sections?.find(s => s.id === selectedSectionId)?.name || ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {selectedClassId && (
                      <button onClick={() => {
                        if (isSubjectModalOpen) {
                          setSubjectModalOpen(false);
                        } else {
                          setSubjectForm({ id: null, masterSubjectId: '', classId: selectedClassId, sectionId: selectedSectionId, isOptional: false, teacherId: '', startTime: schoolConfig?.schoolStartTime || '', endTime: schoolConfig?.schoolEndTime || '', daysOfWeek: [] });
                          setSubjectModalOpen(true);
                        }
                      }} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                        {isSubjectModalOpen ? (
                          <>Hide Planner</>
                        ) : (
                          <><div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Add Subject</>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditPlanModalOpen(false)}
                      className="p-3 bg-black/5 dark:bg-white/10 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 text-muted-foreground rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                {/* Scrollable Content Grid */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative z-20">
                  {/* Inner extracted block without the outer class selector */}
                  


          <>
          {/* List contents always visible inline */}

            <>
          {selectedClassId && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
              {classes.find(c => c.id === selectedClassId)?.sections?.map(sec => (
                <button 
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${selectedSectionId === sec.id ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground'}`}
                >
                  Section {sec.name}
                </button>
              ))}
            </div>
          )}

          {selectedClassId && selectedSectionId && (
            <div className="relative glass-panel p-1 rounded-[2.5rem] group overflow-hidden shadow-xl transition-all duration-500">
              {/* Dynamic Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 blur-3xl opacity-50 pointer-events-none" />
                          <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
                <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs border-b border-black/5 dark:border-white/5 pb-4 mb-8 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Subjects for this Class
                </h4>

                {/* Search, Filter and Sort Bar */}
                <div className="relative mb-8 flex flex-col xl:flex-row gap-4">
                  <div className="relative flex-1 group/search">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-purple-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search assigned subjects by name, code, or teacher..." 
                      value={subSearchTerm}
                      onChange={e => setSubSearchTerm(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-purple-500/50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-purple-500/20 text-foreground transition-all font-medium"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative min-w-[160px] flex items-center bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-purple-500/50 transition-all focus-within:ring-4 focus-within:ring-purple-500/20">
                      <Filter className="w-4 h-4 absolute left-4 text-muted-foreground pointer-events-none" />
                      <select 
                        value={subFilterStatus}
                        onChange={(e) => setSubFilterStatus(e.target.value)}
                        className="w-full bg-transparent pl-10 pr-2 py-4 outline-none text-foreground font-bold appearance-none cursor-pointer flex-1"
                      >
                        <option value="all">All Status</option>
                        <option value="mandatory">Mandatory</option>
                        <option value="optional">Optional</option>
                      </select>
                    </div>

                    <div className="relative min-w-[160px] flex items-center bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-purple-500/50 transition-all focus-within:ring-4 focus-within:ring-purple-500/20">
                      <select 
                        value={subSortBy}
                        onChange={(e) => setSubSortBy(e.target.value)}
                        className="w-full bg-transparent pl-4 pr-2 py-4 outline-none text-foreground font-bold appearance-none cursor-pointer flex-1"
                      >
                        <option value="startTime">Sort by Time</option>
                        <option value="name">Sort by Name</option>
                        <option value="teacher">Sort by Teacher</option>
                      </select>
                      <button 
                        onClick={() => setSubSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
                        className="px-3 hover:text-purple-500 transition-colors border-l border-black/10 dark:border-white/10 h-full flex items-center justify-center text-muted-foreground"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              
                {currentSectionSubjects.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground font-medium border-2 border-dashed border-purple-500/20 dark:border-purple-500/20 rounded-3xl bg-purple-500/5 dark:bg-purple-500/5 flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-purple-500/10 rounded-full"><BookOpen className="w-8 h-8 text-purple-500" /></div>
                    <p className="text-lg">No subjects assigned yet. Click "Add Subject" to begin.</p>
                  </div>
                ) : currentSubjects.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground font-medium border-2 border-dashed border-purple-500/20 dark:border-purple-500/20 rounded-3xl bg-purple-500/5 dark:bg-purple-500/5 flex flex-col items-center justify-center gap-4">
                    <Search className="w-8 h-8 text-purple-500 opacity-50" />
                    <p className="text-lg">No subjects match your search/filter criteria.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentSubjects.map(sub => (
                      <div key={sub.id} className="group relative overflow-hidden rounded-3xl bg-card border border-black/5 dark:border-white/10 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        {/* Top Banner */}
                        <div className="h-20 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 relative">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                          
                          {/* Action Buttons */}
                          <div className="absolute top-3 right-3 flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button onClick={() => handleEditSubject(sub)} className="p-2 bg-card/80 backdrop-blur-md text-indigo-500 hover:text-indigo-400 hover:bg-card rounded-xl transition-all shadow-sm">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteSubject(sub.id, sub.masterSubject?.name)} className="p-2 bg-card/80 backdrop-blur-md text-red-500 hover:text-red-400 hover:bg-card rounded-xl transition-all shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
  
                        <div className="p-4 md:p-6 relative pb-6 flex-1 flex flex-col">
                          {/* Icon/Avatar overlaying the banner */}
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-white premium-shadow absolute -top-8 border-4 border-card">
                            <BookOpen className="w-7 h-7" />
                          </div>
                          
                          <div className="mt-10 mb-6">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="text-xl font-black text-foreground">{sub.masterSubject?.name || 'Unknown'}</h4>
                              {sub.masterSubject?.code && <span className="bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">{sub.masterSubject.code}</span>}
                            </div>
                            {sub.isOptional && <span className="bg-pink-500/10 text-pink-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block">Optional Subject</span>}
                          </div>
  
                          <div className="space-y-3 bg-black/5 dark:bg-white/5 p-4 rounded-2xl mb-auto">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                                <User className="w-3.5 h-3.5" /> Teacher
                              </div>
                              <span className="font-bold text-indigo-500 truncate max-w-[120px]">{sub.teacher ? `${sub.teacher.firstName} ${sub.teacher.lastName}` : 'Unassigned'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                                <Clock className="w-3.5 h-3.5" /> Timing
                              </div>
                              <span className="font-mono font-bold text-emerald-500">{sub.startTime || '00:00'} - {sub.endTime || '00:00'}</span>
                            </div>
                          </div>
  
                          {/* Footer (Days) */}
                          <div className="mt-5 flex items-center justify-between border-t border-black/5 dark:border-white/10 pt-5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Days</span>
                            <span className="font-black text-foreground bg-pink-500/10 text-pink-500 px-3 py-1.5 rounded-xl text-xs truncate max-w-[150px] text-right" title={sub.daysOfWeek ? sub.daysOfWeek.split(',').join(', ') : 'All Days'}>
                              {sub.daysOfWeek ? sub.daysOfWeek.split(',').join(', ') : 'All Days'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>

                    {subTotalPages > 1 && (
                      <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground text-center sm:text-left">
                          Showing <span className="font-black text-foreground">{(subCurrentPage - 1) * subItemsPerPage + 1}</span> to <span className="font-black text-foreground">{Math.min(subCurrentPage * subItemsPerPage, currentSectionSubjects.length)}</span> of <span className="font-black text-foreground">{currentSectionSubjects.length}</span> subjects
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSubCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={subCurrentPage === 1}
                            className="p-3 rounded-xl border border-black/5 dark:border-white/5 bg-card hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-card transition-all text-foreground premium-shadow disabled:shadow-none"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setSubCurrentPage(prev => Math.min(subTotalPages, prev + 1))}
                            disabled={subCurrentPage === subTotalPages}
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
          )}
            </>
            
            {/* Inline Plan Subject Form */}
            <AnimatePresence>
              {isSubjectModalOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8 pt-8 border-t-2 border-dashed border-purple-500/20 text-left overflow-hidden z-10"
                >
                  <div className="max-w-3xl mx-auto bg-card rounded-[2rem] border border-white/10 premium-shadow">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{subjectForm.id ? 'Edit Subject Plan' : 'Plan Subject'}</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    For <span className="font-bold text-purple-500">{classes.find(c => c.id === subjectForm.classId)?.name || 'Class'}</span> 
                    {' • '}
                    <span className="font-bold text-indigo-500">Section {classes.find(c => c.id === subjectForm.classId)?.sections?.find(s => s.id === subjectForm.sectionId)?.name || '?'}</span>
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubjectSubmit} className="p-8 space-y-6 bg-background/50 text-left">
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-purple-500 transition-colors">Master Subject <span className="text-red-500">*</span></label>
                    <select 
                      required
                      value={subjectForm.masterSubjectId}
                      onChange={e => setSubjectForm({...subjectForm, masterSubjectId: e.target.value})}
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-purple-500/50 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-purple-500/20 text-foreground transition-all font-bold appearance-none"
                    >
                      <option value="" disabled>Select a Master Subject</option>
                      {masterSubjects
                        .filter(ms => {
                          if (subjectForm.id && subjectForm.masterSubjectId === ms.id) return true;
                          return !subjects.some(s => s.classId === subjectForm.classId && s.sectionId === subjectForm.sectionId && s.masterSubjectId === ms.id);
                        })
                        .map(ms => (
                        <option key={ms.id} value={ms.id}>{ms.name} {ms.code ? `(${ms.code})` : ''}</option>
                      ))}
                    </select>
                  </div>

                    <div className="group">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Target Class & Section</label>
                      <div className="flex gap-2">
                        <div className="flex-1 w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-5 py-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-500" />
                            <span className="font-bold text-foreground">{classes.find(c => c.id === subjectForm.classId)?.name || 'Unknown'}</span>
                          </div>
                        </div>
                        <select
                          required
                          value={subjectForm.sectionId}
                          onChange={e => setSubjectForm({...subjectForm, sectionId: e.target.value})}
                          className="flex-1 w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-indigo-500/50 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/20 text-foreground transition-all font-bold appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select Section</option>
                          {classes.find(c => c.id === subjectForm.classId)?.sections?.map(sec => (
                            <option key={sec.id} value={sec.id}>Section {sec.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group relative z-30">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-purple-500 transition-colors">Assign Teacher <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setTeacherDropdownOpen(!isTeacherDropdownOpen)}
                          className="w-full text-left bg-black/5 dark:bg-white/5 border border-transparent hover:border-purple-500/30 focus:border-purple-500/50 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-purple-500/20 text-foreground transition-all font-bold flex justify-between items-center"
                        >
                          {subjectForm.teacherId ? (
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold premium-shadow">
                                {teachers.find(t => t.id === subjectForm.teacherId)?.firstName?.[0] || 'T'}
                              </div>
                              <span className="truncate">
                                {teachers.find(t => t.id === subjectForm.teacherId)?.firstName} {teachers.find(t => t.id === subjectForm.teacherId)?.lastName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-2">
                              <User className="w-5 h-5 text-purple-500/50" /> Select Teacher
                            </span>
                          )}
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isTeacherDropdownOpen ? 'rotate-180 text-purple-500' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isTeacherDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[280px] overflow-y-auto custom-scrollbar"
                            >
                              <div className="p-2 space-y-3">
                                {Object.entries(teachers.reduce((acc, t) => {
                                  const role = t.department || 'Other Staff';
                                  if (!acc[role]) acc[role] = [];
                                  acc[role].push(t);
                                  return acc;
                                }, {})).map(([role, roleTeachers]) => (
                                  <div key={role} className="space-y-1">
                                    <div className="sticky top-0 z-10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-500 bg-background/90 backdrop-blur-md rounded-lg mb-1 flex items-center gap-2 border border-purple-500/10">
                                      <Briefcase className="w-3 h-3" /> {role}
                                    </div>
                                    <div className="space-y-1">
                                      {roleTeachers.map(t => (
                                        <button
                                          key={t.id}
                                          type="button"
                                          onClick={() => {
                                            setSubjectForm({...subjectForm, teacherId: t.id});
                                            setTeacherDropdownOpen(false);
                                          }}
                                          className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 group/teacher ${subjectForm.teacherId === t.id ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'hover:bg-black/5 dark:hover:bg-white/5 text-foreground border border-transparent'}`}
                                        >
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${subjectForm.teacherId === t.id ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30' : 'bg-black/10 dark:bg-white/10 group-hover/teacher:scale-110'}`}>
                                            {t.firstName?.[0]}{t.lastName?.[0]}
                                          </div>
                                          <div className="flex-1 overflow-hidden">
                                            <div className="font-bold text-sm truncate">{t.firstName} {t.lastName}</div>
                                            <div className="text-[10px] text-muted-foreground truncate">{t.designation || 'Staff'} • {t.employeeId}</div>
                                          </div>
                                          {subjectForm.teacherId === t.id && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-indigo-500 transition-colors">Select Period <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setPeriodDropdownOpen(!isPeriodDropdownOpen)}
                          className="w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-transparent hover:border-indigo-500/30 focus:border-indigo-500/50 rounded-2xl font-mono focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold flex justify-between items-center"
                        >
                          <div className="flex items-center overflow-hidden flex-1 mr-2 text-left">
                            <Clock className="w-5 h-5 absolute left-4 text-indigo-500 flex-shrink-0" />
                            <span className={`truncate ${subjectForm.startTime ? "text-foreground" : "text-muted-foreground"}`}>
                              {subjectForm.startTime && subjectForm.endTime 
                                ? periodOptions.find(p => p.value === `${subjectForm.startTime}|${subjectForm.endTime}`)?.label 
                                : 'Choose Period Slot'}
                            </span>
                          </div>
                          <svg className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        <AnimatePresence>
                          {isPeriodDropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto"
                            >
                              <div className="p-2 space-y-1">
                                {periodOptions.filter(p => {
                                  if (p.isLunch) return true;
                                  
                                  const isOccupied = subjects.some(s => {
                                    if (subjectForm.id && s.id === subjectForm.id) return false;
                                    if (s.classId !== subjectForm.classId || s.sectionId !== subjectForm.sectionId) return false;
                                    
                                    const st = p.value.split('|')[0];
                                    if (s.startTime !== st) return false;
                                    
                                    const currentDays = subjectForm.daysOfWeek || [];
                                    const existingDays = s.daysOfWeek ? s.daysOfWeek.split(',') : [];
                                    
                                    if (currentDays.length === 0 || existingDays.length === 0) return true;
                                    return currentDays.some(d => existingDays.includes(d));
                                  });
                                  
                                  return !isOccupied;
                                }).map(p => {
                                  if (p.isLunch) {
                                    return (
                                      <div key={p.id} className="w-full text-center px-5 py-3 my-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black tracking-widest text-xs uppercase shadow-sm">
                                        {p.label}
                                      </div>
                                    );
                                  }
                                  const isSelected = subjectForm.startTime === p.value.split('|')[0];
                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => {
                                        const [st, en] = p.value.split('|');
                                        setSubjectForm({...subjectForm, startTime: st, endTime: en});
                                        setPeriodDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group/btn ${isSelected ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground'}`}
                                    >
                                      <span className="font-mono text-sm">{p.label}</span>
                                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <p className="mt-1.5 text-[10px] text-muted-foreground font-medium absolute -bottom-5 left-1">
                          Duration: {classes.find(c => c.id === subjectForm.classId)?.periodDuration || 45} mins/period
                        </p>
                      </div>
                    </div>

                    <div className="group md:col-span-2">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 group-focus-within:text-pink-500 transition-colors">Select Weekdays <span className="text-muted-foreground font-normal normal-case">(Optional)</span></label>
                      <div className="flex flex-wrap gap-3">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
                          const isSelected = subjectForm.daysOfWeek.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setSubjectForm(prev => {
                                  const newDays = prev.daysOfWeek.includes(day) 
                                    ? prev.daysOfWeek.filter(d => d !== day)
                                    : [...prev.daysOfWeek, day];
                                  return {...prev, daysOfWeek: newDays};
                                });
                              }}
                              className={`relative overflow-hidden px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 ${isSelected ? 'text-white shadow-lg shadow-pink-500/30 scale-105' : 'bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground'}`}
                            >
                              {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-100" />}
                              <span className="relative z-10">{day}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground font-medium">
                        Leave unselected to assign to <strong className="text-foreground">ALL</strong> days automatically.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                  <label htmlFor="isOptional" className="flex items-start gap-4 p-5 rounded-2xl border border-pink-500/30 bg-pink-500/5 cursor-pointer hover:bg-pink-500/10 transition-colors">
                    <div className="pt-0.5">
                      <input 
                         type="checkbox" 
                         id="isOptional"
                         checked={subjectForm.isOptional}
                         onChange={e => setSubjectForm({...subjectForm, isOptional: e.target.checked})}
                         className="w-5 h-5 rounded-md border-pink-500/50 text-pink-500 focus:ring-pink-500/20 focus:ring-offset-0 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="block font-bold text-pink-600 dark:text-pink-400">Mark as Optional Subject</span>
                      <span className="block text-xs text-muted-foreground font-medium mt-1">Check this if the subject is an elective and not mandatory for all students.</span>
                    </div>
                  </label>
                </div>

                <div className="pt-6 mt-8 border-t border-black/5 dark:border-white/10 flex justify-end gap-4 bg-background p-4 rounded-b-[2rem] -mx-8 -mb-8">
                  <button type="button" onClick={() => setSubjectModalOpen(false)} className="px-6 py-3.5 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingSubject} className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold flex items-center gap-3 premium-shadow hover:scale-105 transition-all disabled:opacity-50">
                    {isSubmittingSubject ? 'Saving...' : <><div className="bg-white/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4" /></div> {subjectForm.id ? 'Update Assignment' : 'Save Assignment'}</>}
                  </button>
                </div>
              </form>

            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      ) : null}

      {/* WEEKLY SCHEDULE PREVIEW MODAL */}
      {typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
          {isPreviewModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center p-4 sm:p-8" style={{ zIndex: 99999 }}>
            <div 
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm cursor-pointer" 
              onClick={() => setIsPreviewModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-[95vw] lg:max-w-7xl bg-white/95 dark:bg-black/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.2)] dark:shadow-[0_0_100px_rgba(255,255,255,0.05)] flex flex-col max-h-[90vh] overflow-hidden z-10"
            >
              {/* Dynamic decorative backdrop circles */}
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/5 blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-pink-500/10 to-rose-500/5 blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

              {/* Sticky Header Container */}
              <div className="flex-none p-6 md:p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 relative z-30 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Weekly Schedule</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-black text-foreground uppercase tracking-widest">
                        Class {classes.find(c => c.id === previewClassId)?.name || ''}
                      </span>
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest">
                        Section {classes.find(c => c.id === previewClassId)?.sections?.find(s => s.id === previewSectionId)?.name || ''}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-3 bg-black/5 dark:bg-white/10 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 text-muted-foreground rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content Grid */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative z-20">
                {(() => {
                  const previewSubjects = subjects.filter(s => s.classId === previewClassId && s.sectionId === previewSectionId);
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  
                  const uniqueSlotsMap = {};
                  previewSubjects.forEach(s => {
                    if (s.startTime && s.endTime) {
                      const key = `${s.startTime}-${s.endTime}`;
                      uniqueSlotsMap[key] = { start: s.startTime, end: s.endTime };
                    }
                  });
                  const timeSlots = Object.values(uniqueSlotsMap).sort((a, b) => a.start.localeCompare(b.start));

                  if (previewSubjects.length === 0) {
                    return (
                      <div className="text-center py-32 text-muted-foreground font-medium flex flex-col items-center justify-center gap-6">
                        <div className="p-8 bg-indigo-500/10 rounded-full text-indigo-500">
                          <BookOpen className="w-16 h-16" />
                        </div>
                        <div>
                          <h4 className="text-3xl font-black text-foreground mb-3">No Classes Scheduled</h4>
                          <p className="max-w-md text-base mx-auto">Use the "Edit Plan" button on the previous screen to add subjects, timings, and teachers to create a weekly schedule.</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto border border-black/5 dark:border-white/10 rounded-[2rem] bg-white dark:bg-black shadow-xl premium-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="sticky top-0 z-20">
                          <tr className="bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-black/10 dark:border-white/10 text-muted-foreground text-[11px] uppercase tracking-widest font-black shadow-sm">
                            <th className="p-5 border-r border-black/5 dark:border-white/5 w-[180px] text-center sticky left-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-xl z-30">Time & Period</th>
                            {days.map(day => (
                              <th key={day} className="p-5 text-center border-r border-black/5 dark:border-white/5 last:border-r-0 w-[14%]">{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-foreground">
                          {timeSlots.map((slot, sIdx) => {
                            const timeToMins = (t) => {
                              if (!t) return 0;
                              const [h, m] = t.split(':').map(Number);
                              return h * 60 + m;
                            };
                            
                            const prevEndMins = sIdx > 0 ? timeToMins(timeSlots[sIdx-1].end) : 0;
                            const currStartMins = timeToMins(slot.start);
                            const intervalGap = currStartMins - prevEndMins;
                            const hasInterval = sIdx > 0 && intervalGap >= 15;

                            const colors = [
                              { bg: "bg-gradient-to-br from-pink-500/10 to-rose-500/5", border: "border-pink-500/20", text: "text-pink-600 dark:text-pink-400", bgIcon: "bg-pink-500/10 text-pink-500", dot: "bg-pink-500" },
                              { bg: "bg-gradient-to-br from-indigo-500/10 to-blue-500/5", border: "border-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400", bgIcon: "bg-indigo-500/10 text-indigo-500", dot: "bg-indigo-500" },
                              { bg: "bg-gradient-to-br from-emerald-500/10 to-teal-500/5", border: "border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", bgIcon: "bg-emerald-500/10 text-emerald-500", dot: "bg-emerald-500" },
                              { bg: "bg-gradient-to-br from-orange-500/10 to-amber-500/5", border: "border-orange-500/20", text: "text-orange-600 dark:text-orange-400", bgIcon: "bg-orange-500/10 text-orange-500", dot: "bg-orange-500" },
                              { bg: "bg-gradient-to-br from-purple-500/10 to-violet-500/5", border: "border-purple-500/20", text: "text-purple-600 dark:text-purple-400", bgIcon: "bg-purple-500/10 text-purple-500", dot: "bg-purple-500" }
                            ];

                            return (
                              <React.Fragment key={sIdx}>
                                {hasInterval && (
                                  <tr className="border-b border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                                    <td colSpan={7} className="p-4">
                                      <div className="flex items-center justify-center gap-6 text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-[10px]">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                                        <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                          <Clock className="w-3.5 h-3.5" /> Break ({intervalGap} Mins)
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                                      </div>
                                    </td>
                                  </tr>
                                )}
                                <tr className="border-b border-black/5 dark:border-white/5 last:border-b-0 group/row hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                  <td className="p-4 font-mono font-bold text-muted-foreground border-r border-black/5 dark:border-white/5 text-center sticky left-0 bg-white group-hover/row:bg-gray-50 dark:bg-black dark:group-hover/row:bg-gray-900/50 z-10 transition-colors">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                      <div className="text-xs bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5">
                                        {slot.start} - {slot.end}
                                      </div>
                                      <div className="text-[10px] text-muted-foreground/70 uppercase tracking-widest font-black">
                                        Period {sIdx + 1}
                                      </div>
                                    </div>
                                  </td>
                                  {days.map((day, dIdx) => {
                                    const sub = previewSubjects.find(s => {
                                      const isSameTime = s.startTime === slot.start && s.endTime === slot.end;
                                      if (!isSameTime) return false;
                                      const subDays = s.daysOfWeek ? s.daysOfWeek.split(',') : days;
                                      return subDays.includes(day);
                                    });

                                    let theme = colors[0];
                                    if (sub) {
                                      const subName = sub.masterSubject?.name || 'Subject';
                                      const colorHash = subName.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % colors.length;
                                      theme = colors[colorHash];
                                    }

                                    return (
                                      <td key={day} className="p-3 text-center border-r border-black/5 dark:border-white/5 last:border-r-0 align-top">
                                        {sub ? (
                                          <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: dIdx * 0.04 + sIdx * 0.02, type: 'spring' }}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            className={`h-full border rounded-[1.25rem] p-4 flex flex-col gap-2 items-center text-center relative group/card transition-all duration-300 hover:shadow-lg ${theme.bg} ${theme.border} hover:border-black/20 dark:hover:border-white/20`}
                                          >
                                            {/* Decorative Dot */}
                                            <div className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                                            
                                            <div className="flex-1 flex flex-col justify-center items-center gap-1.5">
                                              <span className={`font-black text-xs uppercase tracking-widest leading-tight ${theme.text}`}>{sub.masterSubject?.name || 'Subject'}</span>
                                              {sub.masterSubject?.code && (
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-white/50 dark:bg-black/50 ${theme.text}`}>
                                                  {sub.masterSubject.code}
                                                </span>
                                              )}
                                            </div>
                                            
                                            <div className="w-full h-px bg-black/5 dark:bg-white/5 my-1" />
                                            
                                            <div className="flex items-center gap-1.5 w-full justify-center">
                                              <div className={`p-1 rounded-full ${theme.bgIcon}`}>
                                                <User className="w-3 h-3" />
                                              </div>
                                              <span className="text-[10px] font-bold text-muted-foreground truncate">
                                                {sub.teacher ? `${sub.teacher.firstName} ${sub.teacher.lastName}` : 'TBA'}
                                              </span>
                                            </div>
                                          </motion.div>
                                        ) : (
                                          <div className="flex items-center justify-center h-full min-h-[100px] border border-transparent rounded-[1.25rem] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-default">
                                            <span className="text-black/10 dark:text-white/10">
                                              <Plus className="w-6 h-6" />
                                            </span>
                                          </div>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    ) : null}
    </div>
  );
}
