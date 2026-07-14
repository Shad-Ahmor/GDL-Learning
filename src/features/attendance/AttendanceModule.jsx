import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CalendarCheck, Search, CheckCircle2, XCircle, Clock, Save, UserCheck, 
  AlertCircle, RefreshCw, Check, GraduationCap, Users, Info, Copy, Calendar, Award,
  ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const apiBase = 'http://localhost:1422/api';

const GRADIENT_PALETTE = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage === 1) endPage = 3;
      if (currentPage === totalPages) startPage = totalPages - 2;
      
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/5 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Prev
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
        onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/5 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Next
      </button>
    </div>
  );
};

export default function AttendanceModule() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSession, setActiveSession] = useState(null);
  
  // Navigation & Tab state
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'calendar' | 'registry'

  // Data states
  const [attendanceData, setAttendanceData] = useState([]);
  const [classSummaryData, setClassSummaryData] = useState([]);
  const [monthlySummaryData, setMonthlySummaryData] = useState({ totalStudents: 0, attendanceByDate: {} });
  
  // Loading & Action states
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveAlert, setSaveAlert] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Present', 'Absent', 'Late', 'HalfDay'
  
  // Board specific state (Search, Sort, Pagination, Cache)
  const [boardSearchQuery, setBoardSearchQuery] = useState('');
  const [boardSortBy, setBoardSortBy] = useState('name'); // 'name', 'rate', 'strength', 'status'
  const [boardSortOrder, setBoardSortOrder] = useState('asc'); // 'asc', 'desc'
  const [boardPage, setBoardPage] = useState(1);
  const summaryCache = useRef({});

  // Calendar parameters
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1); // 1-indexed

  // Sunday / Holiday details
  const [holidayNameInput, setHolidayNameInput] = useState('');
  const [isDeclaringHoliday, setIsDeclaringHoliday] = useState(false);

  // Load holidays from centralized registry
  const [holidaysList, setHolidaysList] = useState(() => {
    try {
      const saved = localStorage.getItem('school_holidays_registry');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 1. Initial configuration fetches
  useEffect(() => {
    fetchClasses();
    fetchActiveSession();
  }, []);

  // 2. Fetch class summary and sync holiday registry list whenever date is updated
  useEffect(() => {
    if (selectedDate) {
      fetchClassSummary(selectedDate);
      try {
        const saved = localStorage.getItem('school_holidays_registry');
        if (saved) {
          setHolidaysList(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to sync holidays:', err);
      }
    }
  }, [selectedDate]);

  // 3. Fetch detailed student attendance sheet when selectors change
  useEffect(() => {
    if (selectedClass && selectedSection && selectedDate) {
      fetchAttendance();
    } else {
      setAttendanceData([]);
    }
    // Reset flags on date change
    setIsDeclaringHoliday(false);
    setHolidayNameInput('');
  }, [selectedClass, selectedSection, selectedDate]);

  // 4. Fetch month summary for class & section
  useEffect(() => {
    if (selectedClass && selectedSection && calendarYear && calendarMonth) {
      fetchMonthlySummary(selectedClass, selectedSection, calendarYear, calendarMonth);
    } else {
      setMonthlySummaryData({ totalStudents: 0, attendanceByDate: {} });
    }
  }, [selectedClass, selectedSection, calendarYear, calendarMonth]);

  // 5. Automatically update active class section dropdowns
  useEffect(() => {
    if (selectedClass) {
      const cls = classes.find(c => c.id === selectedClass);
      setSections(cls ? cls.sections : []);
      setSelectedSection(''); // Reset section selector
      setAttendanceData([]);
    }
  }, [selectedClass, classes]);

  // 6. Handle alert timeouts
  useEffect(() => {
    if (saveAlert) {
      const timer = setTimeout(() => setSaveAlert(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [saveAlert]);

  // Sync Calendar Month/Year with selected date changes
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      setCalendarYear(d.getFullYear());
      setCalendarMonth(d.getMonth() + 1);
    }
  }, [selectedDate]);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${apiBase}/setup/classes`);
      if (res.ok) {
        setClasses(await res.json());
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const res = await fetch(`${apiBase}/setup/sessions`);
      if (res.ok) {
        const sessions = await res.json();
        const active = Array.isArray(sessions) ? sessions.find(s => s.isActive) : null;
        setActiveSession(active);
        
        // Clamping selectedDate to the boundaries of the active session
        if (active) {
          const today = new Date().toISOString().split('T')[0];
          const start = new Date(active.startDate).toISOString().split('T')[0];
          const end = new Date(active.endDate).toISOString().split('T')[0];
          if (today >= start && today <= end) {
            setSelectedDate(today);
          } else {
            setSelectedDate(start);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching session:', err);
    }
  };

  const fetchClassSummary = async (dateVal) => {
    // Return from cache immediately if available
    if (summaryCache.current[dateVal]) {
      setClassSummaryData(summaryCache.current[dateVal]);
      return;
    }

    setLoadingSummary(true);
    try {
      const res = await fetch(`${apiBase}/attendance/summary?date=${dateVal}`);
      if (res.ok) {
        const data = await res.json();
        summaryCache.current[dateVal] = data;
        setClassSummaryData(data);
      }
    } catch (err) {
      console.error('Error fetching summary board:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/attendance/students?classId=${selectedClass}&sectionId=${selectedSection}&date=${selectedDate}`);
      if (res.ok) {
        setAttendanceData(await res.json());
      }
    } catch (err) {
      console.error('Error fetching attendance list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async (clsId, secId, yr, mo) => {
    setLoadingMonthly(true);
    try {
      const res = await fetch(`${apiBase}/attendance/monthly-summary?classId=${clsId}&sectionId=${secId}&year=${yr}&month=${mo}`);
      if (res.ok) {
        setMonthlySummaryData(await res.json());
      }
    } catch (err) {
      console.error('Error fetching monthly summary:', err);
    } finally {
      setLoadingMonthly(false);
    }
  };

  // Status switches
  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => prev.map(item => 
      item.student.id === studentId ? { ...item, status } : item
    ));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceData(prev => prev.map(item => 
      item.student.id === studentId ? { ...item, remarks } : item
    ));
  };

  const markAll = (status) => {
    setAttendanceData(prev => prev.map(item => ({ ...item, status })));
    setSaveAlert({ type: 'info', message: `Marked all students as ${status}` });
  };

  const resetAll = () => {
    setAttendanceData(prev => prev.map(item => ({ ...item, status: 'Present', remarks: '' })));
    setSaveAlert({ type: 'info', message: 'Reset all attendance status to Present' });
  };

  const adjustPresentCount = (newPresent) => {
    const total = attendanceData.length;
    if (total === 0) return;
    
    const clampedPresent = Math.max(0, Math.min(total, parseInt(newPresent) || 0));
    
    setAttendanceData(prev => 
      prev.map((item, index) => ({
        ...item,
        status: index < clampedPresent ? 'Present' : 'Absent'
      }))
    );
  };

  const adjustAbsentCount = (newAbsent) => {
    const total = attendanceData.length;
    if (total === 0) return;
    
    const clampedAbsent = Math.max(0, Math.min(total, parseInt(newAbsent) || 0));
    const targetPresent = total - clampedAbsent;
    
    adjustPresentCount(targetPresent);
  };

  const saveAttendance = async () => {
    setIsSaving(true);
    try {
      const records = attendanceData.map(item => ({
        studentId: item.student.id,
        status: item.status,
        remarks: item.remarks
      }));

      const res = await fetch(`${apiBase}/attendance/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, records })
      });

      if (res.ok) {
        setSaveAlert({ type: 'success', message: 'Attendance records saved successfully!' });
        // Refresh dashboard summary
        fetchClassSummary(selectedDate);
        // Refresh monthly calendar summary if active
        if (selectedClass && selectedSection) {
          fetchMonthlySummary(selectedClass, selectedSection, calendarYear, calendarMonth);
        }
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error(err);
      setSaveAlert({ type: 'error', message: 'Error saving attendance. Please check database connection.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Declare holidays
  const handleDeclareHoliday = (e) => {
    e.preventDefault();
    if (!holidayNameInput.trim()) return;
    
    const newHoliday = {
      id: 'hol_' + Date.now(),
      name: holidayNameInput.trim(),
      startDate: selectedDate,
      endDate: selectedDate,
      scope: 'All',
      classIds: [],
      category: 'Custom',
      allowAttendance: false
    };
    
    const updated = [...holidaysList, newHoliday];
    setHolidaysList(updated);
    localStorage.setItem('school_holidays_registry', JSON.stringify(updated));
    setIsDeclaringHoliday(false);
    setSaveAlert({ type: 'success', message: `Declared holiday: ${holidayNameInput}` });
    
    // Refresh summary
    fetchClassSummary(selectedDate);
  };

  // Sunday and holiday logic checks (local timezone safe & string range comparisons)
  const isSunday = useMemo(() => {
    if (!selectedDate) return false;
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return false;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.getDay() === 0;
  }, [selectedDate]);

  // Check if there is an active override holiday for this date that allows attendance
  const hasAttendanceOverride = useMemo(() => {
    if (!selectedDate) return false;
    return holidaysList.some(h => {
      const inRange = selectedDate >= h.startDate && selectedDate <= h.endDate;
      if (!inRange) return false;
      if (h.allowAttendance) {
        if (h.scope === 'All') return true;
        if (h.scope === 'ClassSpecific' && h.classIds && selectedClass && h.classIds.includes(selectedClass)) return true;
      }
      return false;
    });
  }, [selectedDate, holidaysList, selectedClass]);

  const activeHoliday = useMemo(() => {
    if (!selectedDate || !selectedClass) return null;
    return holidaysList.find(h => {
      const inRange = selectedDate >= h.startDate && selectedDate <= h.endDate;
      if (!inRange) return false;
      
      if (h.scope === 'All') return true;
      if (h.scope === 'ClassSpecific' && h.classIds && h.classIds.includes(selectedClass)) return true;
      
      return false;
    });
  }, [selectedDate, holidaysList, selectedClass]);

  const isCurrentHoliday = !!activeHoliday && !activeHoliday.allowAttendance;
  const isRegistrySuspended = (isSunday && !hasAttendanceOverride) || isCurrentHoliday;

  // Single class registry stats
  const presentCount = attendanceData.filter(a => a.status === 'Present').length;
  const absentCount = attendanceData.filter(a => a.status === 'Absent').length;
  const lateCount = attendanceData.filter(a => a.status === 'Late').length;
  const halfDayCount = attendanceData.filter(a => a.status === 'HalfDay').length;
  const totalStudents = attendanceData.length;
  const presentPercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // School-wide statistics for the selectedDate
  const boardStats = useMemo(() => {
    if (!classSummaryData || classSummaryData.length === 0) {
      return { totalStudents: 0, markedClasses: 0, totalClasses: 0, presentRate: 0, present: 0, absent: 0, late: 0, halfDay: 0 };
    }
    
    let totalStudents = 0;
    let markedClasses = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalHalfDay = 0;
    const totalClasses = classSummaryData.length;
    
    classSummaryData.forEach(item => {
      totalStudents += item.totalStudents || 0;
      if (item.isMarked) {
        markedClasses++;
        totalPresent += item.present || 0;
        totalAbsent += item.absent || 0;
        totalLate += item.late || 0;
        totalHalfDay += item.halfDay || 0;
      }
    });
    
    const markedStudents = totalPresent + totalAbsent + totalLate + totalHalfDay;
    const presentRate = markedStudents > 0 ? Math.round(((totalPresent + totalLate + totalHalfDay) / markedStudents) * 100) : 0;
    
    return {
      totalStudents,
      markedClasses,
      totalClasses,
      presentRate,
      present: totalPresent,
      absent: totalAbsent,
      late: totalLate,
      halfDay: totalHalfDay
    };
  }, [classSummaryData]);

  // Filter Registry student cards
  const filteredStudents = useMemo(() => {
    let result = [...attendanceData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        `${item.student.firstName} ${item.student.lastName}`.toLowerCase().includes(q) ||
        item.student.admissionNumber?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter(item => item.status === statusFilter);
    }
    return result;
  }, [attendanceData, searchQuery, statusFilter]);

  const activeClassName = classes.find(c => c.id === selectedClass)?.name || '';
  const activeSectionName = sections.find(s => s.id === selectedSection)?.name || '';

  // Generate WhatsApp summary
  const shareableSummary = useMemo(() => {
    if (attendanceData.length === 0) return '';
    const dateStr = new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return `📝 *Attendance Summary*\n` +
           `🏫 *Class:* ${activeClassName} - ${activeSectionName}\n` +
           `📅 *Date:* ${dateStr}\n\n` +
           `👥 *Total Students:* ${totalStudents}\n` +
           `✅ *Present:* ${presentCount} (${presentPercentage}%)\n` +
           `❌ *Absent:* ${absentCount}\n` +
           `⏰ *Late:* ${lateCount}\n` +
           `⏳ *Half Day:* ${halfDayCount}\n\n` +
           `Report submitted by Class Teacher.`;
  }, [attendanceData, selectedDate, activeClassName, activeSectionName, totalStudents, presentCount, absentCount, lateCount, halfDayCount, presentPercentage]);

  const copySummaryText = () => {
    navigator.clipboard.writeText(shareableSummary);
    setSaveAlert({ type: 'success', message: 'Attendance copyable summary copied!' });
  };

  // Helper for generating dynamic months and years clamped to activeSession boundaries
  const calendarOptions = useMemo(() => {
    if (!activeSession) {
      const curYr = new Date().getFullYear();
      const years = [curYr - 1, curYr, curYr + 1];
      const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(2000, i, 1).toLocaleString('en-IN', { month: 'long' })
      }));
      return { years, months };
    }

    const start = new Date(activeSession.startDate);
    const end = new Date(activeSession.endDate);
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    const years = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }

    // List all months in selected year clamped to activeSession boundaries
    const getMonthsForYear = (yr) => {
      const months = [];
      const startMonth = yr === startYear ? start.getMonth() : 0;
      const endMonth = yr === endYear ? end.getMonth() : 11;

      for (let m = startMonth; m <= endMonth; m++) {
        months.push({
          value: m + 1,
          label: new Date(yr, m, 1).toLocaleString('en-IN', { month: 'long' })
        });
      }
      return months;
    };

    return { years, getMonthsForYear };
  }, [activeSession]);

  const activeMonths = useMemo(() => {
    if (!activeSession) return calendarOptions.months;
    return calendarOptions.getMonthsForYear(calendarYear);
  }, [calendarOptions, calendarYear, activeSession]);

  // Adjust month/year on selection to avoid out of bounds month selections
  useEffect(() => {
    if (activeMonths && activeMonths.length > 0) {
      const exists = activeMonths.find(m => m.value === calendarMonth);
      if (!exists) {
        setCalendarMonth(activeMonths[0].value);
      }
    }
  }, [calendarYear, activeMonths]);

  // Helper to compile monthly calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
    const firstDayIndex = new Date(calendarYear, calendarMonth - 1, 1).getDay(); // 0 = Sun
    
    const offsetDays = Array.from({ length: firstDayIndex });
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return { offsetDays, monthDays };
  }, [calendarYear, calendarMonth]);

  const holidaysInSelectedMonth = useMemo(() => {
    return holidaysList.filter(h => {
      const startOfMo = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-01`;
      const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
      const endOfMo = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${daysInMonth}`;
      return h.startDate <= endOfMo && h.endDate >= startOfMo;
    });
  }, [holidaysList, calendarYear, calendarMonth]);

  const dateStripDays = useMemo(() => {
    if (!selectedDate) return [];
    
    // We parse parts of selectedDate to avoid UTC shifts
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return [];
    
    const baseDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const result = [];
    
    // Generate 5 days before to 5 days after
    for (let i = -5; i <= 5; i++) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() + i);
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const dayLabel = targetDate.toLocaleDateString('en-IN', { day: '2-digit' });
      const weekdayLabel = targetDate.toLocaleDateString('en-IN', { weekday: 'short' });
      const isSun = targetDate.getDay() === 0;
      
      const dateHoliday = holidaysList.find(h => {
        const inRange = dateStr >= h.startDate && dateStr <= h.endDate;
        if (!inRange) return false;
        if (h.scope === 'All') return true;
        if (h.scope === 'ClassSpecific' && h.classIds && h.classIds.includes(selectedClass)) return true;
        return false;
      });
      const isHoliday = !!dateHoliday;
      
      const isOutOfSession = activeSession && (
        dateStr < activeSession.startDate.split('T')[0] ||
        dateStr > activeSession.endDate.split('T')[0]
      );
      
      result.push({
        dateStr,
        dayLabel,
        weekdayLabel,
        isSunday: isSun,
        isHoliday,
        holidayName: dateHoliday?.name || '',
        allowAttendance: dateHoliday?.allowAttendance || false,
        isOutOfSession
      });
    }
    
    return result;
  }, [selectedDate, holidaysList, selectedClass, activeSession]);

  // Filtered, Sorted, and Paginated Class Board items
  const filteredAndSortedBoardData = useMemo(() => {
    if (!classSummaryData) return [];
    
    // Filtering
    let result = classSummaryData.filter(item => 
      `${item.className} ${item.sectionName}`.toLowerCase().includes(boardSearchQuery.toLowerCase()) ||
      item.teacherName.toLowerCase().includes(boardSearchQuery.toLowerCase())
    );

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (boardSortBy) {
        case 'name':
          comparison = `${a.className} ${a.sectionName}`.localeCompare(`${b.className} ${b.sectionName}`);
          break;
        case 'rate':
          const rateA = a.totalStudents > 0 ? (a.present / a.totalStudents) : 0;
          const rateB = b.totalStudents > 0 ? (b.present / b.totalStudents) : 0;
          comparison = rateA - rateB;
          break;
        case 'strength':
          comparison = a.totalStudents - b.totalStudents;
          break;
        case 'status':
          // Unmarked (pending) first if ascending
          comparison = (a.isMarked === b.isMarked) ? 0 : a.isMarked ? 1 : -1;
          break;
        default:
          comparison = 0;
      }
      return boardSortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [classSummaryData, boardSearchQuery, boardSortBy, boardSortOrder]);

  // Reset page to 1 if search or sort changes
  useEffect(() => {
    setBoardPage(1);
  }, [boardSearchQuery, boardSortBy, boardSortOrder]);

  const boardItemsPerPage = 6;
  const boardTotalPages = Math.max(1, Math.ceil(filteredAndSortedBoardData.length / boardItemsPerPage));
  const paginatedBoardData = filteredAndSortedBoardData.slice((boardPage - 1) * boardItemsPerPage, boardPage * boardItemsPerPage);

  // Navigation handlers
  const handleMarkClass = (classId, sectionId) => {
    setSelectedClass(classId);
    // Directly pull class and update sections list
    const cls = classes.find(c => c.id === classId);
    setSections(cls ? cls.sections : []);
    setSelectedSection(sectionId);
    setActiveTab('registry');
  };

  const handleViewCalendar = (classId, sectionId) => {
    setSelectedClass(classId);
    const cls = classes.find(c => c.id === classId);
    setSections(cls ? cls.sections : []);
    setSelectedSection(sectionId);
    setActiveTab('calendar');
  };

  const handleCalendarDayClick = (day) => {
    const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setActiveTab('registry');
  };

  return (
    <div className="space-y-6 h-full overflow-auto pb-20 w-full text-left px-2">
      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {saveAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-bold backdrop-blur-md ${
              saveAlert.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : saveAlert.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
            }`}
          >
            {saveAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : saveAlert.type === 'error' ? (
              <XCircle className="w-5 h-5 text-rose-500" />
            ) : (
              <Info className="w-5 h-5 text-blue-500" />
            )}
            <span>{saveAlert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title & Header Section */}
      <div className="w-full text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600 text-left inline-block">
            School Attendance Desk
          </h1>
          <p className="text-muted-foreground mt-2 text-sm text-left">
            Real calendar sync, weekend suspensions, declared holidays, and teacher-reported class rosters.
          </p>
        </div>
        {activeSession && (
          <span className="text-xs font-black px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 text-muted-foreground uppercase tracking-wider shrink-0 w-fit">
            Academic Calendar: {activeSession.name}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 pt-4 px-1 custom-scrollbar w-full snap-x">
        {[
          { id: 'board', label: 'Class Board', icon: GraduationCap, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)]', border: 'border-blue-500', text: 'text-blue-500', iconBg: 'bg-blue-500/10' },
          { id: 'registry', label: 'Daily Registry', icon: CalendarCheck, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]', border: 'border-emerald-500', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
          { id: 'calendar', label: 'Monthly Calendar', icon: Calendar, color: 'from-purple-500 to-indigo-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)]', border: 'border-purple-500', text: 'text-purple-500', iconBg: 'bg-purple-500/10' },
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

      {/* TAB CONTENTS */}
      <AnimatePresence mode="wait">
        {activeTab === 'board' && (
          <motion.div
            key="board-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Board Filters & Date select */}
            <div className="bg-card p-6 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-4 py-2.5 rounded-2xl border border-black/5 w-full md:max-w-md">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search by Class/Section or Teacher..."
                  value={boardSearchQuery}
                  onChange={e => setBoardSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select 
                  value={boardSortBy}
                  onChange={e => setBoardSortBy(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 rounded-2xl px-3 py-2.5 border border-black/5 outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-xs cursor-pointer"
                >
                  <option value="name">Sort by Name</option>
                  <option value="rate">Sort by Present Rate</option>
                  <option value="strength">Sort by Class Strength</option>
                  <option value="status">Sort by Status</option>
                </select>
                <button
                  onClick={() => setBoardSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="bg-black/5 dark:bg-white/5 p-2.5 rounded-2xl border border-black/5 hover:bg-black/10 transition-colors"
                >
                  <span className="text-xs font-bold">{boardSortOrder === 'asc' ? '↑' : '↓'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground shrink-0">
                  Target Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={activeSession ? new Date(activeSession.startDate).toISOString().split('T')[0] : undefined}
                  max={activeSession ? new Date(activeSession.endDate).toISOString().split('T')[0] : undefined}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-2.5 border border-black/5 outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold font-mono text-xs cursor-pointer transition-all"
                />
              </div>
            </div>

            {/* Aggregate Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1: Total School Strength */}
              <div className="bg-card border border-black/5 dark:border-white/5 rounded-3xl p-6 premium-shadow flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Strength</span>
                  <span className="block text-2xl font-black text-foreground mt-0.5">{boardStats.totalStudents}</span>
                </div>
              </div>

              {/* Stat 2: Class Marking Progress */}
              <div className="bg-card border border-black/5 dark:border-white/5 rounded-3xl p-6 premium-shadow flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Classes Marked</span>
                  <span className="block text-2xl font-black text-foreground mt-0.5">
                    {boardStats.markedClasses} <span className="text-sm font-bold text-muted-foreground">/ {boardStats.totalClasses}</span>
                  </span>
                </div>
              </div>

              {/* Stat 3: Present Rate */}
              <div className="bg-card border border-black/5 dark:border-white/5 rounded-3xl p-6 premium-shadow flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Present Rate</span>
                  <span className="block text-2xl font-black text-foreground mt-0.5">{boardStats.presentRate}%</span>
                </div>
              </div>

              {/* Stat 4: Break Alert Status */}
              <div className="bg-card border border-black/5 dark:border-white/5 rounded-3xl p-6 premium-shadow flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">School Status</span>
                  <span className="block text-sm font-black text-foreground mt-1 truncate">
                    {isCurrentHoliday ? (
                      <span className="text-orange-500">Holiday: {activeHoliday.name}</span>
                    ) : (isSunday && !hasAttendanceOverride) ? (
                      <span className="text-muted-foreground">Sunday Weekend</span>
                    ) : hasAttendanceOverride ? (
                      <span className="text-emerald-500 font-black uppercase tracking-wider text-xs flex items-center gap-1">
                        ⚡ Working Day ({activeHoliday?.name || 'Special Sunday'})
                      </span>
                    ) : (
                      <span className="text-emerald-500 font-bold uppercase tracking-wider text-xs">Standard Working Day</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Sunday / Holiday Check for class summary */}
            {isRegistrySuspended ? (
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 p-5 rounded-3xl flex items-center gap-4">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm">
                    {isCurrentHoliday ? `Holiday Active Today: ${activeHoliday.name}` : 'Sunday Weekend Break Active'}
                  </h4>
                  <p className="text-xs font-bold mt-0.5 opacity-90">
                    Attendance records are not parsed or updated during holidays or Sundays unless overridden in School Setup.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Grid of Class-wise summaries */}
            {loadingSummary ? (
              <div className="py-20 flex flex-col items-center justify-center bg-card rounded-[2rem] border border-black/5">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground font-bold text-sm">Parsing class summaries...</p>
              </div>
            ) : filteredAndSortedBoardData.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-[2rem] border border-black/5 dark:border-white/5 premium-shadow">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-black mb-2">No Classes Configured</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto text-sm">
                  We could not find any active class sections matching your search query. Update setup in Academics first.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedBoardData.map((item) => {
                  const rate = item.totalStudents > 0 ? Math.round((item.present / item.totalStudents) * 100) : 0;
                  
                  return (
                    <div
                      key={`${item.classId}-${item.sectionId}`}
                      className="bg-card border border-black/5 dark:border-white/10 rounded-3xl premium-shadow hover:shadow-lg transition-all p-6 flex flex-col justify-between gap-5 relative overflow-hidden"
                    >
                      {/* Top section: Title, Teacher, Status */}
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-black text-foreground">
                            {item.className} - {item.sectionName}
                          </h3>
                          {item.isMarked ? (
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Reported
                            </span>
                          ) : (
                            <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-bold">
                          Teacher: <span className="text-foreground">{item.teacherName}</span>
                        </p>
                      </div>

                      {/* Middle: Strength / Count overview */}
                      <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className="text-muted-foreground">Class Strength:</span>
                          <span className="text-foreground">{item.totalStudents} Students</span>
                        </div>
                        
                        {item.isMarked ? (
                          <div className="space-y-3 pt-2 border-t border-black/5 dark:border-white/5">
                            <div className="grid grid-cols-4 gap-1 text-center">
                              <div className="bg-emerald-500/5 py-1 rounded">
                                <p className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">Pres</p>
                                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">{item.present}</p>
                              </div>
                              <div className="bg-rose-500/5 py-1 rounded">
                                <p className="text-[8px] font-black uppercase text-rose-500">Abs</p>
                                <p className="text-xs font-black text-rose-500">{item.absent}</p>
                              </div>
                              <div className="bg-amber-500/5 py-1 rounded">
                                <p className="text-[8px] font-black uppercase text-amber-600">Late</p>
                                <p className="text-xs font-black text-amber-600">{item.late}</p>
                              </div>
                              <div className="bg-purple-500/5 py-1 rounded">
                                <p className="text-[8px] font-black uppercase text-purple-500">HD</p>
                                <p className="text-xs font-black text-purple-500">{item.halfDay}</p>
                              </div>
                            </div>
                            
                            {/* Attendance progress rate indicator */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold opacity-80">
                                <span>Roster Present Rate</span>
                                <span>{rate}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" 
                                  style={{ width: `${rate}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-xs font-bold text-muted-foreground/60 italic">
                            Roster summary pending updates today
                          </div>
                        )}
                      </div>

                      {/* Bottom actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleMarkClass(item.classId, item.sectionId)}
                          className="py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] active:scale-95 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>{item.isMarked ? 'Update roster' : 'Mark attendance'}</span>
                        </button>
                        <button
                          onClick={() => handleViewCalendar(item.classId, item.sectionId)}
                          className="py-2.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 hover:text-foreground text-muted-foreground rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-black/5"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Monthly view</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              {boardTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                  <span className="text-xs text-muted-foreground font-bold">
                    Showing {(boardPage - 1) * boardItemsPerPage + 1} - {Math.min(boardPage * boardItemsPerPage, filteredAndSortedBoardData.length)} of {filteredAndSortedBoardData.length} classes
                  </span>
                  <PaginationControls currentPage={boardPage} totalPages={boardTotalPages} onPageChange={setBoardPage} />
                </div>
              )}
            </>
            )}
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div
            key="calendar-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Selector panel for Calendar */}
            <div className="bg-card p-6 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Class</label>
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 border border-black/5 outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold cursor-pointer transition-all"
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Section</label>
                <select 
                  value={selectedSection} 
                  onChange={e => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 border border-black/5 outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold cursor-pointer disabled:opacity-50 transition-all"
                >
                  <option value="">-- Choose Section --</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calendar Year</label>
                <select 
                  value={calendarYear} 
                  onChange={e => setCalendarYear(parseInt(e.target.value))}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 border border-black/5 outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold cursor-pointer transition-all"
                >
                  {calendarOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calendar Month</label>
                <select 
                  value={calendarMonth} 
                  onChange={e => setCalendarMonth(parseInt(e.target.value))}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 border border-black/5 outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold cursor-pointer transition-all"
                >
                  {activeMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>

            {!selectedClass || !selectedSection ? (
              <div className="text-center py-20 bg-card rounded-[2rem] border border-black/5 dark:border-white/5 premium-shadow">
                <div className="bg-emerald-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-foreground">Select a Class & Section</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto text-sm">
                  Please choose a class and section from the dropdowns above to inspect their monthly academic attendance sheets.
                </p>
              </div>
            ) : loadingMonthly ? (
              <div className="py-20 flex flex-col items-center justify-center bg-card rounded-[2rem] border border-black/5">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground font-bold text-sm">Parsing monthly calendar values...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Column 1: Calendar Grid Panel */}
                <div className="lg:col-span-8 bg-card border border-black/5 dark:border-white/5 premium-shadow rounded-3xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 gap-4">
                    <div>
                      <h3 className="text-xl font-black text-foreground">
                        {new Date(calendarYear, calendarMonth - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                      </h3>
                      <p className="text-xs text-muted-foreground font-bold">
                        Attendance Calendar: Class {activeClassName} - Section {activeSectionName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Present / Marked</span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Custom Holiday</span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/5"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Sunday</span>
                    </div>
                  </div>

                  {/* Day grids */}
                  <div className="grid grid-cols-7 gap-3 text-center">
                    {/* Calendar Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
                      <div 
                        key={d} 
                        className={`text-[10px] font-black uppercase tracking-wider pb-2 border-b border-black/5 ${
                          index === 0 ? 'text-rose-500' : 'text-muted-foreground'
                        }`}
                      >
                        {d}
                      </div>
                    ))}

                    {/* Empty slots for week offsets */}
                    {calendarDays.offsetDays.map((_, i) => (
                      <div key={`offset-${i}`} className="bg-black/[0.01] rounded-2xl aspect-square border border-transparent" />
                    ))}

                    {/* Days in Month */}
                    {calendarDays.monthDays.map(day => {
                      const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      
                      const isOutOfSession = activeSession && (
                        dateStr < activeSession.startDate.split('T')[0] ||
                        dateStr > activeSession.endDate.split('T')[0]
                      );
                      
                      const isSun = new Date(calendarYear, calendarMonth - 1, day).getDay() === 0;
                      const dateHoliday = holidaysList.find(h => {
                        const inRange = dateStr >= h.startDate && dateStr <= h.endDate;
                        if (!inRange) return false;
                        
                        if (h.scope === 'All') return true;
                        if (h.scope === 'ClassSpecific' && h.classIds && h.classIds.includes(selectedClass)) return true;
                        
                        return false;
                      });
                      const isHoliday = !!dateHoliday;
                      const isOverridden = dateHoliday?.allowAttendance || false;

                      const dayReport = monthlySummaryData.attendanceByDate[dateStr];
                      const isMarked = !!dayReport;

                      return (
                        <button
                          key={day}
                          disabled={isOutOfSession}
                          onClick={() => handleCalendarDayClick(day)}
                          className={`p-3 rounded-2xl flex flex-col justify-between items-start aspect-square border transition-all text-left group relative ${
                            isOutOfSession 
                              ? 'opacity-25 bg-black/5 border-transparent cursor-not-allowed'
                              : isHoliday
                                ? isOverridden
                                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer'
                                  : 'bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400 cursor-pointer'
                                : isSun
                                  ? 'bg-black/5 border-transparent text-muted-foreground/60 cursor-pointer'
                                  : isMarked
                                    ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer'
                                    : 'bg-card border-black/5 hover:border-black/20 text-foreground cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-black">{day}</span>
                            {!isOutOfSession && isMarked && (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>

                          {/* Cell footer tags */}
                          <div className="text-[8px] font-black mt-2 leading-tight uppercase w-full truncate">
                            {isOutOfSession ? (
                              'Inactive'
                            ) : isHoliday ? (
                              <span className={`${isOverridden ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500'} block truncate`}>
                                {isOverridden ? `⚡ ${dateHoliday.name}` : dateHoliday.name}
                              </span>
                            ) : isSun ? (
                              'Sunday'
                            ) : isMarked ? (
                              <span className="text-emerald-600 dark:text-emerald-400 block font-mono">
                                {dayReport.present}/{monthlySummaryData.totalStudents} P
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40 block border-dashed border border-black/10 dark:border-white/10 rounded py-0.5 text-center group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition-colors">
                                Mark
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Column 2: Monthly Holidays List Sidebar */}
                <div className="lg:col-span-4 bg-card border border-black/5 dark:border-white/5 premium-shadow rounded-3xl p-6 space-y-6 text-left">
                  <div className="border-b border-black/5 dark:border-white/5 pb-4">
                    <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                      <Award className="w-5 h-5 text-orange-500" />
                      Holidays in {new Date(calendarYear, calendarMonth - 1, 1).toLocaleString('en-IN', { month: 'long' })}
                    </h3>
                    <p className="text-xs text-muted-foreground font-bold mt-1">
                      Active breaks & vacation periods scheduled for this month.
                    </p>
                  </div>

                  {holidaysInSelectedMonth.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-black/[0.01] flex flex-col items-center gap-3">
                      <Info className="w-8 h-8 opacity-50" />
                      <p className="text-xs font-bold">No holidays scheduled for this month.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                      {holidaysInSelectedMonth.map(h => {
                        const isPast = h.startDate < new Date().toISOString().split('T')[0];
                        return (
                          <div key={h.id} className="bg-black/5 dark:bg-white/5 border border-black/5 p-4 rounded-2xl flex flex-col gap-3 hover:scale-[1.01] transition-all">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-sm text-foreground truncate" title={h.name}>{h.name}</h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <span className="inline-block bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/10 text-[8px] font-black uppercase px-2 py-0.5 rounded-md font-sans">
                                    {h.category}
                                  </span>
                                  {h.allowAttendance && (
                                    <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 text-[8px] font-black uppercase px-2 py-0.5 rounded-md font-sans font-extrabold">
                                      ⚡ Working Day
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => {
                                  if (isPast) {
                                    if (!window.confirm('WARNING: You are deleting a past holiday. This might alter historic attendance records. Do you wish to proceed?')) return;
                                  } else {
                                    if (!window.confirm(`Are you sure you want to delete the holiday "${h.name}"?`)) return;
                                  }
                                  const updated = holidaysList.filter(item => item.id !== h.id);
                                  setHolidaysList(updated);
                                  localStorage.setItem('school_holidays_registry', JSON.stringify(updated));
                                  setSaveAlert({ type: 'info', message: `Deleted holiday: ${h.name}` });
                                  fetchClassSummary(selectedDate);
                                  if (selectedClass && selectedSection) {
                                    fetchMonthlySummary(selectedClass, selectedSection, calendarYear, calendarMonth);
                                  }
                                }}
                                className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-muted-foreground transition-all cursor-pointer shrink-0"
                                title="Delete Break"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="space-y-1.5 text-[11px] font-bold text-muted-foreground border-t border-black/5 dark:border-white/5 pt-2 font-mono">
                              <div className="flex justify-between gap-2">
                                <span className="font-sans font-bold">Dates:</span>
                                <span className="text-foreground text-right">
                                  {h.startDate === h.endDate ? h.startDate : `${h.startDate} to ${h.endDate}`}
                                </span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="font-sans font-bold">Scope:</span>
                                <span className="text-foreground font-black text-[10px] uppercase font-sans">
                                  {h.scope === 'All' ? 'Whole School' : 'Class Specific'}
                                </span>
                              </div>
                              {h.scope === 'ClassSpecific' && h.classIds && (
                                <div className="text-[9px] bg-black/5 dark:bg-white/5 p-1 rounded mt-1 font-sans text-foreground leading-normal">
                                  Classes: {h.classIds.map(cid => classes.find(c => c.id === cid)?.name || cid).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'registry' && (
          <motion.div
            key="registry-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Registry Selectors Panel */}
            <div className="bg-card p-6 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Class</label>
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 border border-black/5 outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold cursor-pointer transition-all"
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Section</label>
                <select 
                  value={selectedSection} 
                  onChange={e => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 border border-black/5 outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold cursor-pointer disabled:opacity-50 transition-all"
                >
                  <option value="">-- Choose Section --</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Attendance Date</label>
                <input 
                  type="date"
                  value={selectedDate}
                  min={activeSession ? new Date(activeSession.startDate).toISOString().split('T')[0] : undefined}
                  max={activeSession ? new Date(activeSession.endDate).toISOString().split('T')[0] : undefined}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 border border-black/5 outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold font-mono text-sm transition-all"
                />
              </div>
            </div>

            {/* Weekly Date Strip Navigation */}
            {selectedClass && selectedSection && (
              <div className="bg-card p-4 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-left pl-2">
                  Quick Date Switcher (Weekly View)
                </span>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 px-1">
                  {dateStripDays.map((d) => {
                    const isSelected = d.dateStr === selectedDate;
                    
                    return (
                      <button
                        key={d.dateStr}
                        onClick={() => setSelectedDate(d.dateStr)}
                        className={`flex-1 min-w-[70px] py-3.5 px-2 rounded-2xl border transition-all flex flex-col items-center justify-between gap-2.5 relative cursor-pointer group ${
                          isSelected
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105'
                            : d.isOutOfSession
                              ? 'opacity-35 bg-black/5 border-transparent cursor-not-allowed text-muted-foreground'
                              : d.isHoliday
                                ? d.allowAttendance
                                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400'
                                : d.isSunday
                                  ? 'bg-black/5 border-transparent text-muted-foreground/60'
                                  : 'bg-card border-black/5 hover:border-black/20 text-foreground'
                        }`}
                        title={d.isHoliday ? `Holiday: ${d.holidayName}` : d.isSunday ? 'Sunday' : ''}
                      >
                        <span className={`text-[8px] font-black uppercase tracking-wider ${isSelected ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                          {d.weekdayLabel}
                        </span>
                        
                        <span className="text-sm font-black tracking-tight leading-none">
                          {d.dayLabel}
                        </span>
                        
                        {/* Day indicator dots */}
                        <div className="flex gap-1 justify-center items-center h-1.5">
                          {d.isHoliday && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : d.allowAttendance ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`} />
                          )}
                          {d.isSunday && !d.isHoliday && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-400'}`} />
                          )}
                          {!d.isSunday && !d.isHoliday && (
                            <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!selectedClass || !selectedSection ? (
              <div className="text-center py-20 bg-card rounded-[2rem] border border-black/5 dark:border-white/5 premium-shadow">
                <div className="bg-emerald-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CalendarCheck className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-foreground">Select a Class & Section</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto text-sm">
                  Please choose a class and section from the dropdowns above to compile their roster data.
                </p>
              </div>
            ) : loading ? (
              <div className="py-20 flex flex-col items-center justify-center bg-card rounded-[2rem] border border-black/5">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground font-bold text-sm">Loading attendance registry...</p>
              </div>
            ) : attendanceData.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-[2rem] border border-black/5 dark:border-white/5 premium-shadow">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-2xl font-black mb-2 text-foreground">No Students Found</h3>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm">
                  There are no active students registered under Class {activeClassName} - {activeSectionName}.
                </p>
              </div>
            ) : isRegistrySuspended ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-6 bg-card border border-black/5 dark:border-white/5 rounded-[2rem] premium-shadow space-y-6 max-w-lg mx-auto"
              >
                <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-orange-500">
                  {isCurrentHoliday ? <Award className="w-10 h-10" /> : <Calendar className="w-10 h-10" />}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-foreground">
                    {isCurrentHoliday ? `🎉 School Holiday: ${activeHoliday.name}` : '🎯 Weekend Holiday (Sunday)'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">
                    {isCurrentHoliday 
                      ? 'Today is marked as an official school holiday. Attendance registry compilation is suspended.' 
                      : 'Today is Sunday. Weekly weekend break is active. Attendance records are not generated.'
                    }
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Header Summary Dashboard Card */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-full" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full border border-white/10 w-fit">
                        Attendance Registry Sheet
                      </span>
                      <h3 className="text-2xl font-black pt-1">Class {activeClassName} - Section {activeSectionName}</h3>
                      <p className="text-xs font-bold opacity-80">
                        Date: {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <div className="text-[11px] font-extrabold opacity-95 pt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Today, {presentCount} student{presentCount !== 1 ? 's are' : ' is'} present out of {totalStudents} ({presentPercentage}% presence).
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 sm:w-fit md:text-right">
                      <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-center">
                        <p className="text-[10px] font-black uppercase tracking-wider opacity-75 font-mono">Present Rate</p>
                        <h4 className="text-2xl font-black mt-0.5">{presentPercentage}%</h4>
                      </div>
                      <button
                        onClick={copySummaryText}
                        className="px-4 py-2 bg-white text-emerald-600 rounded-xl font-bold text-xs shadow-md hover:bg-emerald-50 hover:scale-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy WhatsApp Summary
                      </button>
                    </div>
                  </div>
                </div>

                {/* Registry counters */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  <div className="bg-card p-4 rounded-2xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-3xl font-black text-foreground">{totalStudents}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mt-0.5">Strength</span>
                  </div>
                  
                  <div className="bg-card border border-black/5 dark:border-white/5 p-4 rounded-3xl premium-shadow flex flex-col items-center justify-center text-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Present Today</span>
                    
                    <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-1 w-max mx-auto shadow-inner">
                      <button 
                        type="button"
                        onClick={() => adjustPresentCount(presentCount - 1)}
                        className="w-8 h-8 rounded-xl bg-card hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-rose-500 flex items-center justify-center font-extrabold text-sm cursor-pointer transition-all active:scale-90 shadow-sm"
                      >
                        -
                      </button>
                      
                      <input 
                        type="text"
                        value={presentCount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          adjustPresentCount(val === '' ? 0 : parseInt(val));
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          width: '2.5rem',
                          textAlign: 'center',
                          fontWeight: '900',
                          fontSize: '1.125rem',
                          padding: '0',
                          margin: '0 4px',
                          boxShadow: 'none',
                          color: '#10b981' // emerald-500
                        }}
                        className="text-emerald-500"
                      />
                      
                      <button 
                        type="button"
                        onClick={() => adjustPresentCount(presentCount + 1)}
                        className="w-8 h-8 rounded-xl bg-card hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-emerald-500 flex items-center justify-center font-extrabold text-sm cursor-pointer transition-all active:scale-90 shadow-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => markAll('Present')}
                      className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer border-none"
                    >
                      All Present
                    </button>
                  </div>
                  
                  <div className="bg-card border border-black/5 dark:border-white/5 p-4 rounded-3xl premium-shadow flex flex-col items-center justify-center text-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Absent Today</span>
                    
                    <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-1 w-max mx-auto shadow-inner">
                      <button 
                        type="button"
                        onClick={() => adjustAbsentCount(absentCount - 1)}
                        className="w-8 h-8 rounded-xl bg-card hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-rose-500 flex items-center justify-center font-extrabold text-sm cursor-pointer transition-all active:scale-90 shadow-sm"
                      >
                        -
                      </button>
                      
                      <input 
                        type="text"
                        value={absentCount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          adjustAbsentCount(val === '' ? 0 : parseInt(val));
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          width: '2.5rem',
                          textAlign: 'center',
                          fontWeight: '900',
                          fontSize: '1.125rem',
                          padding: '0',
                          margin: '0 4px',
                          boxShadow: 'none',
                          color: '#f43f5e' // rose-500
                        }}
                        className="text-rose-500"
                      />
                      
                      <button 
                        type="button"
                        onClick={() => adjustAbsentCount(absentCount + 1)}
                        className="w-8 h-8 rounded-xl bg-card hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-emerald-500 flex items-center justify-center font-extrabold text-sm cursor-pointer transition-all active:scale-90 shadow-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => markAll('Absent')}
                      className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer border-none"
                    >
                      All Absent
                    </button>
                  </div>
                  
                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-amber-500">{lateCount}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-0.5">Late Arrival</span>
                  </div>
                  
                  <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-purple-500">{halfDayCount}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 mt-0.5">Half Day</span>
                  </div>
                </div>

                {/* Filtering, Search & Custom Holiday controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-5 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow">
                  <div className="flex flex-1 flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text"
                        placeholder="Search student..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-xs"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="bg-black/5 dark:bg-white/5 px-4 py-2.5 rounded-2xl border border-black/5 outline-none font-bold text-xs cursor-pointer min-w-[130px]"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="HalfDay">Half Day</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {isDeclaringHoliday ? (
                      <form onSubmit={handleDeclareHoliday} className="flex items-center gap-2 animate-fadeIn">
                        <input
                          type="text"
                          required
                          placeholder="Holiday Name (e.g. Diwali)..."
                          value={holidayNameInput}
                          onChange={e => setHolidayNameInput(e.target.value)}
                          className="px-3 py-2 bg-black/5 border border-orange-500/20 outline-none rounded-xl font-bold text-xs focus:ring-1 focus:ring-orange-500"
                        />
                        <button type="submit" className="px-3.5 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">
                          Save Holiday
                        </button>
                        <button type="button" onClick={() => setIsDeclaringHoliday(false)} className="px-3 py-2 bg-black/5 text-muted-foreground font-bold text-xs rounded-xl cursor-pointer">
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsDeclaringHoliday(true)}
                        className="px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        🎉 Declare Holiday
                      </button>
                    )}

                    <button
                      onClick={resetAll}
                      className="px-4 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground rounded-2xl font-bold text-xs border border-black/5 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reset Markings
                    </button>
                  </div>
                </div>

                {/* Grid card rosters */}
                {filteredStudents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredStudents.map((item, idx) => {
                      const bgGradient = GRADIENT_PALETTE[item.student.firstName.charCodeAt(0) % GRADIENT_PALETTE.length];
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.015 }}
                          key={item.student.id}
                          className="bg-card border border-black/5 dark:border-white/10 p-5 rounded-3xl premium-shadow hover:shadow-md transition-all flex flex-col justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bgGradient} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md`}>
                              {item.student.firstName[0]}{item.student.lastName[0]}
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <h4 className="font-extrabold text-sm text-foreground truncate">{item.student.firstName} {item.student.lastName}</h4>
                              <div className="flex gap-1.5 mt-1 flex-wrap">
                                <span className="bg-black/5 dark:bg-white/5 text-muted-foreground px-2 py-0.5 rounded text-[8px] font-black uppercase border border-black/5">
                                  Adm: {item.student.admissionNumber}
                                </span>
                                {item.student.rollNumber && (
                                  <span className="bg-black/5 dark:bg-white/5 text-muted-foreground px-2 py-0.5 rounded text-[8px] font-black uppercase border border-black/5">
                                    Roll: {item.student.rollNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                            {[
                              { key: 'Present', label: 'Present', color: 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20' },
                              { key: 'Absent', label: 'Absent', color: 'bg-rose-500 border-rose-500 text-white shadow-rose-500/20' },
                              { key: 'Late', label: 'Late', color: 'bg-amber-500 border-amber-500 text-white shadow-amber-500/20' },
                              { key: 'HalfDay', label: 'Half Day', color: 'bg-purple-500 border-purple-500 text-white shadow-purple-500/20' },
                            ].map(opt => {
                              const isSelected = item.status === opt.key;
                              return (
                                <button
                                  key={opt.key}
                                  onClick={() => handleStatusChange(item.student.id, opt.key)}
                                  className={`py-2 px-1 rounded-xl text-[10px] font-black transition-all border text-center cursor-pointer ${
                                    isSelected
                                      ? `${opt.color} shadow-lg scale-105`
                                      : 'border-transparent bg-black/5 dark:bg-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>

                          <div className="relative flex items-center bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-emerald-500/30 overflow-hidden">
                            <input 
                              type="text"
                              placeholder="Add reason/remarks (optional)..."
                              value={item.remarks || ''}
                              onChange={e => handleRemarksChange(item.student.id, e.target.value)}
                              className="w-full bg-transparent px-4 py-2 outline-none font-bold text-xs text-left"
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-black/10 dark:border-white/10 text-muted-foreground font-semibold text-sm">
                    No students match active search or status filters.
                  </div>
                )}

                {/* Footer Save Registry action panel */}
                <div className="bg-card p-6 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-left">
                    <Info className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-xs font-bold text-muted-foreground">
                      Ensure all markings are correctly checked before saving registry data. Changes will reflect instantly on the Class board.
                    </p>
                  </div>
                  
                  <button 
                    onClick={saveAttendance}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Attendance
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
