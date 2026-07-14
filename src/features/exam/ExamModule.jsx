import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileSpreadsheet, Plus, X, CheckCircle2, Search, Calendar, 
  FileText, Award, BarChart3, Clock, AlertTriangle, Printer,
  GraduationCap, Download, Check, Settings, Save, User, CalendarDays, RefreshCw, Trash2, BookOpen, ChevronDown, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalContext } from '../../context/GlobalContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Tooltip as RechartsTooltip
} from 'recharts';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import QuestionPaperBuilder from '../../components/exam/QuestionPaperBuilder';

const EmployeeSelect = ({ employees, value, onChange, placeholder = '-- Assign --' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const grouped = employees.reduce((acc, emp) => {
      const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      if (name.includes(term)) {
        const role = emp.designation || 'Staff';
        if (!acc[role]) acc[role] = [];
        acc[role].push(emp);
      }
      return acc;
    }, {});
    return grouped;
  }, [employees, searchTerm]);

  const selectedEmp = employees.find(e => e.id === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium cursor-pointer flex justify-between items-center transition-all hover:bg-black/10 dark:hover:bg-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedEmp ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName} (${selectedEmp.designation || 'Staff'})` : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-background border border-black/10 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden premium-shadow"
          >
            <div className="p-3 border-b border-black/5 dark:border-white/5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-3">
              {Object.keys(filteredEmployees).length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No staff found</div>
              ) : (
                Object.entries(filteredEmployees).map(([role, emps]) => (
                  <div key={role} className="space-y-1">
                    <div className="px-3 py-1 text-xs font-black text-orange-500 uppercase tracking-wider bg-orange-500/10 rounded-lg inline-block mb-1">
                      {role}
                    </div>
                    {emps.map(emp => (
                      <div 
                        key={emp.id}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all flex justify-between items-center ${value === emp.id ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5 text-foreground'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onChange(emp.id);
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                      >
                        {emp.firstName} {emp.lastName}
                        {value === emp.id && <Check className="w-4 h-4" />}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const apiBase = 'http://localhost:1422/api';

export default function ExamModule() {
  const { settings, activeSession } = useGlobalContext();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);

  // Global Data
  const [exams, setExams] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);

  // Modal States
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [termModalOpen, setTermModalOpen] = useState(false);
  const [subjectMapModalOpen, setSubjectMapModalOpen] = useState(null); // holds exam object
  const [configExamSubject, setConfigExamSubject] = useState(null); // holds examSubject object
  const [builderExamSubject, setBuilderExamSubject] = useState(null); // holds examSubject for the paper builder
  const [builderStartInPreview, setBuilderStartInPreview] = useState(false);
  
  // Invigilation State
  const [invigilationClassFilter, setInvigilationClassFilter] = useState('');
  const [evaluationClassFilter, setEvaluationClassFilter] = useState('');
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  // Forms
  const [examForm, setExamForm] = useState({ name: '', termId: '', startDate: '', endDate: '' });
  const [termForm, setTermForm] = useState({ id: null, name: '', months: [] });
  
  // Subject Mapping State
  const [mapClassId, setMapClassId] = useState('');
  const [mapSubjectsData, setMapSubjectsData] = useState([]);
  const [plannerStartDate, setPlannerStartDate] = useState('');
  const [plannerGapDays, setPlannerGapDays] = useState(0);

  // Published Date Sheets Filter
  const [publishedFilterClassId, setPublishedFilterClassId] = useState('');

  // Marks Entry State
  const [marksExamId, setMarksExamId] = useState('');
  const [marksClassId, setMarksClassId] = useState('');
  const [marksSectionId, setMarksSectionId] = useState('');
  const [marksGridData, setMarksGridData] = useState({ students: [], examSubjects: [], marks: [] });
  const [marksInput, setMarksInput] = useState({}); 
  const [isSavingMarks, setIsSavingMarks] = useState(false);

  // Report Card State
  const [reportClassId, setReportClassId] = useState('');
  const [reportSectionId, setReportSectionId] = useState('');
  const [reportStudents, setReportStudents] = useState([]);
  const [selectedReportStudent, setSelectedReportStudent] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Calculate valid months for the active session
  const sessionMonths = useMemo(() => {
    if (!activeSession?.startDate || !activeSession?.endDate) return [];
    const start = new Date(activeSession.startDate);
    const end = new Date(activeSession.endDate);
    const months = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      months.push(current.toLocaleString('default', { month: 'long', year: 'numeric' }));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }, [activeSession]);

  // Conflicts State
  const [conflicts, setConflicts] = useState([]);
  const [resolvingConflicts, setResolvingConflicts] = useState(false);

  useEffect(() => {
    // Load holidays from local storage (synced from AcademicModule)
    const storedHolidays = localStorage.getItem('school_holidays_registry');
    if (storedHolidays) {
      setHolidays(JSON.parse(storedHolidays));
    }
    fetchInitialData();
  }, [activeSession]);

  const fetchInitialData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const dashboardUrl = activeSession?.id ? `${apiBase}/exams/dashboard?sessionId=${activeSession.id}` : null;
      
      const promises = [
        fetch(`${apiBase}/exams`),
        fetch(`${apiBase}/setup/terms`),
        fetch(`${apiBase}/setup/classes`),
        fetch(`${apiBase}/setup/subjects`),
        fetch(`${apiBase}/hr/employees`)
      ];

      if (dashboardUrl) {
        promises.push(fetch(dashboardUrl));
      }

      const results = await Promise.all(promises);
      const exRes = results[0];
      const tmRes = results[1];
      const clRes = results[2];
      const subRes = results[3];
      const empRes = results[4];
      const dashRes = dashboardUrl ? results[5] : null;

      if (exRes.ok) {
        const fetchedExams = await exRes.json();
        setExams(fetchedExams);
      }
      if (tmRes.ok) setTerms(await tmRes.json());
      if (clRes.ok) setClasses(await clRes.json());
      if (subRes.ok) setSubjects(await subRes.json());
      if (empRes.ok) setEmployees((await empRes.json()).filter(e => e.isActive !== false));
      if (dashRes && dashRes.ok) setDashboardStats(await dashRes.json());

    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ----- CONFLICT DETECTION -----
  useEffect(() => {
    if (exams.length > 0 && holidays.length > 0) {
      const foundConflicts = [];
      exams.forEach(exam => {
        exam.subjects?.forEach(es => {
          if (es.examDate) {
            const dateStr = new Date(es.examDate).toISOString().split('T')[0];
            const isConflict = holidays.some(h => dateStr >= h.startDate && dateStr <= h.endDate);
            if (isConflict) {
              foundConflicts.push({
                examId: exam.id,
                examName: exam.name,
                examSubject: es,
                date: dateStr
              });
            }
          }
        });
      });
      setConflicts(foundConflicts);
    } else {
      setConflicts([]);
    }
  }, [exams, holidays]);

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    if(!activeSession?.id) return alert("No active academic session found.");
    try {
      const url = termForm.id ? `${apiBase}/setup/terms/${termForm.id}` : `${apiBase}/setup/terms`;
      const method = termForm.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: termForm.name, sessionId: activeSession.id, months: termForm.months })
      });
      if (res.ok) {
        setTermForm({ id: null, name: '', months: [] });
        const tmRes = await fetch(`${apiBase}/setup/terms`);
        if (tmRes.ok) setTerms(await tmRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTerm = async (id) => {
    if (!window.confirm("Are you sure you want to delete this term?")) return;
    try {
      const res = await fetch(`${apiBase}/setup/terms/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (termForm.id === id) setTermForm({ id: null, name: '', months: [] });
        const tmRes = await fetch(`${apiBase}/setup/terms`);
        if (tmRes.ok) setTerms(await tmRes.json());
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete term.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete term.");
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const selectedTerm = terms.find(t => t.id === examForm.termId);
      let autoStartDate = new Date().toISOString();
      let autoEndDate = new Date().toISOString();

      if (selectedTerm && selectedTerm.months) {
        const monthsArr = JSON.parse(selectedTerm.months);
        if (monthsArr.length > 0) {
          const firstMonthStr = monthsArr[0];
          const lastMonthStr = monthsArr[monthsArr.length - 1];

          autoStartDate = new Date(firstMonthStr).toISOString();
          
          const lastDate = new Date(lastMonthStr);
          lastDate.setMonth(lastDate.getMonth() + 1);
          lastDate.setDate(0);
          autoEndDate = lastDate.toISOString();
        }
      }

      const payload = {
        name: examForm.name,
        termId: examForm.termId,
        startDate: autoStartDate,
        endDate: autoEndDate
      };

      const res = await fetch(`${apiBase}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setExamModalOpen(false);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSubjectConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/exam-subjects/${configExamSubject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: configExamSubject.mode,
          paperType: configExamSubject.paperType,
          durationMins: configExamSubject.durationMins
        })
      });
      if (res.ok) {
        setConfigExamSubject(null);
        fetchInitialData(); // Refresh state
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignDuty = async (examSubjectId, teacherId) => {
    try {
      await fetch(`${apiBase}/exam-subjects/${examSubjectId}/duties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId })
      });
      fetchInitialData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoAssignDuties = async (examId) => {
    setIsAutoAssigning(true);
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam || !exam.subjects) return;

      const activeAssignments = [];
      
      // Seed current assignments from DB
      exams.forEach(ex => {
        ex.subjects?.forEach(es => {
          es.duties?.forEach(d => {
            if (d.teacherId) {
              activeAssignments.push({
                teacherId: d.teacherId,
                dateStr: new Date(es.examDate).toDateString()
              });
            }
          });
        });
      });

      const unassignedSubjects = exam.subjects.filter(es => !es.duties || es.duties.length === 0);
      
      if (unassignedSubjects.length === 0) {
        alert("All subjects for this exam already have assigned invigilators!");
        setIsAutoAssigning(false);
        return;
      }

      let count = 0;
      for (const es of unassignedSubjects) {
        const esDateStr = new Date(es.examDate).toDateString();
        
        const busyTeacherIds = activeAssignments
          .filter(a => a.dateStr === esDateStr)
          .map(a => a.teacherId);
          
        const freeTeachers = employees.filter(emp => !busyTeacherIds.includes(emp.id));
        
        if (freeTeachers.length === 0) {
          console.warn(`No free teachers available on ${esDateStr} for subject ID ${es.id}`);
          continue;
        }

        const teacherWorkloads = {};
        freeTeachers.forEach(t => {
          teacherWorkloads[t.id] = activeAssignments.filter(a => a.teacherId === t.id).length;
        });

        freeTeachers.sort((a, b) => teacherWorkloads[a.id] - teacherWorkloads[b.id]);

        const chosenTeacher = freeTeachers[0];

        await fetch(`${apiBase}/exam-subjects/${es.id}/duties`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacherId: chosenTeacher.id })
        });

        activeAssignments.push({
          teacherId: chosenTeacher.id,
          dateStr: esDateStr
        });
        count++;
      }

      await fetchInitialData(true);
      alert(`Auto-assigned duties for ${count} subjects!`);
    } catch (err) {
      console.error(err);
      alert("Failed to auto-assign duties.");
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const handleAssignEvaluation = async (examSubjectId, evaluatorId, status = 'PENDING') => {
    try {
      await fetch(`${apiBase}/exam-subjects/${examSubjectId}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluatorId, status })
      });
      fetchInitialData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoAssignEvaluations = async (examId) => {
    setIsAutoAssigning(true);
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam || !exam.subjects) return;

      const activeAssignments = [];
      
      // Seed current evaluations workload from DB
      exams.forEach(ex => {
        ex.subjects?.forEach(es => {
          es.evaluations?.forEach(ev => {
            if (ev.evaluatorId) {
              activeAssignments.push({ evaluatorId: ev.evaluatorId });
            }
          });
        });
      });

      const unassignedSubjects = exam.subjects.filter(es => !es.evaluations || es.evaluations.length === 0);
      
      if (unassignedSubjects.length === 0) {
        alert("All subjects for this exam already have assigned evaluators!");
        setIsAutoAssigning(false);
        return;
      }

      let count = 0;
      for (const es of unassignedSubjects) {
        // Count how many evaluations each teacher has overall to balance workload
        const teacherWorkloads = {};
        employees.forEach(t => {
          teacherWorkloads[t.id] = activeAssignments.filter(a => a.evaluatorId === t.id).length;
        });

        // Sort teachers by workload (ascending)
        const sortedTeachers = [...employees].sort((a, b) => teacherWorkloads[a.id] - teacherWorkloads[b.id]);
        const chosenTeacher = sortedTeachers[0];

        await fetch(`${apiBase}/exam-subjects/${es.id}/evaluations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ evaluatorId: chosenTeacher.id, status: 'PENDING' })
        });

        activeAssignments.push({ evaluatorId: chosenTeacher.id });
        count++;
      }

      await fetchInitialData(true);
      alert(`Auto-assigned evaluators for ${count} subjects!`);
    } catch (err) {
      console.error(err);
      alert("Failed to auto-assign evaluators.");
    } finally {
      setIsAutoAssigning(false);
    }
  };

  // ----- SUBJECT MAPPING & SMART PLANNER -----
  useEffect(() => {
    if (subjectMapModalOpen && subjectMapModalOpen.startDate) {
      const d = new Date(subjectMapModalOpen.startDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setPlannerStartDate(`${year}-${month}-${day}`);
      }
    } else {
      setPlannerStartDate('');
    }
  }, [subjectMapModalOpen]);

  useEffect(() => {
    if (mapClassId && subjectMapModalOpen) {
      const classSubjects = subjects.filter(s => s.classId === mapClassId);
      const existingMapped = subjectMapModalOpen.subjects || [];
      
      const newMapData = classSubjects.map(cs => {
        const existing = existingMapped.find(es => es.subjectId === cs.id);
        return {
          id: existing?.id || '',
          subjectId: cs.id,
          subjectName: cs.masterSubject.name,
          examDate: existing ? new Date(existing.examDate).toISOString().split('T')[0] : '',
          maxMarks: existing ? existing.maxMarks : 100,
          passMarks: existing ? existing.passMarks : 33,
          selected: !!existing
        };
      });
      setMapSubjectsData(newMapData);
    } else {
      setMapSubjectsData([]);
    }
  }, [mapClassId, subjectMapModalOpen]);

  // Helper to check if a date is a holiday or Sunday
  const isHolidayOrSunday = (dateObj) => {
    if (dateObj.getDay() === 0) return true; // Sunday
    const dateStr = dateObj.toISOString().split('T')[0];
    return holidays.some(h => dateStr >= h.startDate && dateStr <= h.endDate);
  };

  const handleGenerateSchedule = () => {
    if (!plannerStartDate) return alert("Please select a Start Date.");
    
    let currentDate = new Date(plannerStartDate);
    const newData = [...mapSubjectsData];
    
    // Get only selected subjects to map
    const selectedIndices = [];
    newData.forEach((s, idx) => {
      if (s.selected) selectedIndices.push(idx);
    });

    if (selectedIndices.length === 0) return alert("Please select at least one subject to schedule.");

    for (let i = 0; i < selectedIndices.length; i++) {
      // Find next available working day
      while (isHolidayOrSunday(currentDate)) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      newData[selectedIndices[i]].examDate = currentDate.toISOString().split('T')[0];
      
      // Advance by 1 + gapDays for the next subject
      currentDate.setDate(currentDate.getDate() + 1 + Number(plannerGapDays));
    }
    
    setMapSubjectsData(newData);
  };

  const handleSaveSubjectMapping = async () => {
    const selectedSubjects = mapSubjectsData.filter(s => s.selected);
    if (selectedSubjects.length === 0) return alert("Select at least one subject");
    
    try {
      const res = await fetch(`${apiBase}/exams/${subjectMapModalOpen.id}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: selectedSubjects })
      });
      if (res.ok) {
        setSubjectMapModalOpen(null);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveConflicts = async () => {
    setResolvingConflicts(true);
    try {
      // Group conflicts by exam
      const conflictsByExam = {};
      conflicts.forEach(c => {
        if (!conflictsByExam[c.examId]) conflictsByExam[c.examId] = [];
        conflictsByExam[c.examId].push(c.examSubject);
      });

      for (const [examId, clashingSubjects] of Object.entries(conflictsByExam)) {
        // Find the full exam to get all subjects (so we can rewrite properly)
        const exam = exams.find(e => e.id === examId);
        const updatedSubjects = [];

        // Simple approach: shift clashing subjects to the next available working day after their original date
        exam.subjects.forEach(es => {
          const isClashing = clashingSubjects.find(c => c.id === es.id);
          if (isClashing) {
            let curDate = new Date(es.examDate);
            while (isHolidayOrSunday(curDate)) {
              curDate.setDate(curDate.getDate() + 1);
            }
            updatedSubjects.push({
              id: es.id,
              subjectId: es.subjectId,
              examDate: curDate.toISOString().split('T')[0],
              maxMarks: es.maxMarks,
              passMarks: es.passMarks
            });
          } else {
            updatedSubjects.push({
              id: es.id,
              subjectId: es.subjectId,
              examDate: es.examDate,
              maxMarks: es.maxMarks,
              passMarks: es.passMarks
            });
          }
        });

        // Save back
        await fetch(`${apiBase}/exams/${examId}/subjects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjects: updatedSubjects })
        });
      }
      
      alert("Conflicts resolved successfully! All dates shifted to next working days.");
      fetchInitialData();
    } catch (err) {
      console.error(err);
      alert("Failed to resolve conflicts.");
    } finally {
      setResolvingConflicts(false);
    }
  };

  // ----- MARKS ENTRY -----
  const fetchMarksGrid = async () => {
    if (!marksExamId || !marksClassId || !marksSectionId) return;
    try {
      const res = await fetch(`${apiBase}/exams/marks/grid?examId=${marksExamId}&classId=${marksClassId}&sectionId=${marksSectionId}`);
      if (res.ok) {
        const data = await res.json();
        setMarksGridData(data);
        
        const inputs = {};
        data.marks.forEach(m => {
          inputs[`${m.studentId}_${m.examSubjectId}`] = m.marksObtained;
        });
        setMarksInput(inputs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMarksGrid();
  }, [marksExamId, marksClassId, marksSectionId]);

  const handleBulkSaveMarks = async () => {
    setIsSavingMarks(true);
    try {
      const grouped = {};
      Object.keys(marksInput).forEach(key => {
        const [studentId, examSubjectId] = key.split('_');
        if (!grouped[examSubjectId]) grouped[examSubjectId] = [];
        grouped[examSubjectId].push({
          studentId,
          marksObtained: marksInput[key] || 0,
          remarks: ''
        });
      });

      for (const esId of Object.keys(grouped)) {
        await fetch(`${apiBase}/exams/marks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examSubjectId: esId, marks: grouped[esId] })
        });
      }
      alert("Marks saved successfully!");
      fetchMarksGrid();
    } catch (err) {
      console.error(err);
      alert("Failed to save marks");
    } finally {
      setIsSavingMarks(false);
    }
  };

  // ----- REPORT CARDS -----
  useEffect(() => {
    if (reportClassId && reportSectionId) {
      fetch(`${apiBase}/students?classId=${reportClassId}&sectionId=${reportSectionId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch students');
          return res.json();
        })
        .then(data => setReportStudents(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error(err);
          setReportStudents([]);
        });
    } else {
      setReportStudents([]);
    }
  }, [reportClassId, reportSectionId]);

  useEffect(() => {
    if (selectedReportStudent && activeSession?.id) {
      fetch(`${apiBase}/exams/report/${selectedReportStudent}?sessionId=${activeSession.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch report card');
          return res.json();
        })
        .then(data => setReportData(data))
        .catch(err => {
          console.error(err);
          setReportData(null);
        });
    } else {
      setReportData(null);
    }
  }, [selectedReportStudent, activeSession]);


  const TABS = [
    { id: 'Dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-orange-500 to-amber-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)]', border: 'border-orange-500', text: 'text-orange-500', iconBg: 'bg-orange-500/10' },
    { id: 'Exam Setup', label: 'Exam Setup', icon: Settings, color: 'from-purple-500 to-indigo-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)]', border: 'border-purple-500', text: 'text-purple-500', iconBg: 'bg-purple-500/10' },
    { id: 'Paper Preparation', label: 'Paper Preparation', icon: FileText, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)]', border: 'border-blue-500', text: 'text-blue-500', iconBg: 'bg-blue-500/10' },
    { id: 'Invigilation', label: 'Invigilation', icon: User, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]', border: 'border-emerald-500', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
    { id: 'Evaluation Tracker', label: 'Evaluation Tracker', icon: CheckCircle2, color: 'from-rose-500 to-pink-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(244,63,94,0.5)]', border: 'border-rose-500', text: 'text-rose-500', iconBg: 'bg-rose-500/10' },
    { id: 'Student Grading', label: 'Student Grading', icon: FileSpreadsheet, color: 'from-yellow-500 to-orange-400', shadow: 'shadow-[0_10px_30px_-10px_rgba(234,179,8,0.5)]', border: 'border-yellow-500', text: 'text-yellow-500', iconBg: 'bg-yellow-500/10' },
    { id: 'Report Cards', label: 'Report Cards', icon: Award, color: 'from-fuchsia-500 to-purple-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(217,70,239,0.5)]', border: 'border-fuchsia-500', text: 'text-fuchsia-500', iconBg: 'bg-fuchsia-500/10' },
  ];

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse font-medium">Loading Exams Module...</div>;

  return (
    <div className="space-y-6 h-full overflow-auto pb-20 w-full text-left px-2">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 text-left inline-block mb-2">
          Exam Management
        </h1>
        <p className="text-muted-foreground text-lg text-left">Manage all aspects of exams, duties, evaluations, and grading from this central hub.</p>
      </div>

      {/* Glowing Animated Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x px-1">
        {TABS.map(tab => (
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

      {conflicts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h4 className="font-bold">Holiday Conflicts Detected!</h4>
              <p className="text-sm font-medium">You have {conflicts.length} exam subject(s) scheduled on dates that are now marked as holidays.</p>
            </div>
          </div>
          <button onClick={handleResolveConflicts} disabled={resolvingConflicts} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center gap-2">
            {resolvingConflicts ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Auto-Shift Dates'}
          </button>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'Dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Exams</p>
                  <h3 className="text-3xl font-black">{exams.length}</h3>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Active Terms</p>
                  <h3 className="text-3xl font-black">{terms.length}</h3>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Award className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">School Avg</p>
                  <h3 className="text-3xl font-black">{dashboardStats?.schoolAverage || 0}%</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5">
              <h3 className="text-xl font-bold mb-6">Performance Across Exams</h3>
              <div className="h-64">
                {dashboardStats?.examTrends?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardStats.examTrends}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#111', color: '#fff', fontWeight: 'bold' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="avg" fill="#f97316" radius={[4, 4, 0, 0]} name="Average Score (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                    No exam data available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" /> Action Center
                </h3>
                {dashboardStats?.missingMarksAlerts?.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {dashboardStats.missingMarksAlerts.map((alert, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                        <div className="mt-0.5">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">{alert}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-black/5 dark:bg-white/5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
                    <span className="font-bold">All clear! No pending tasks.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 mt-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-orange-500" /> Upcoming Planned Exams
            </h3>
            
            {exams.filter(e => e.subjects && e.subjects.length > 0).length === 0 ? (
              <div className="text-center p-8 text-muted-foreground font-medium border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/5 dark:bg-white/5">
                No date sheets published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {exams.filter(e => e.subjects && e.subjects.length > 0).map(exam => {
                  const groupedByClass = {};
                  exam.subjects.forEach(es => {
                    const globalSubject = subjects.find(sub => sub.id === es.subjectId);
                    const classId = globalSubject?.classId;
                    if (!classId) return;
                    
                    if (!groupedByClass[classId]) {
                      groupedByClass[classId] = {
                        className: classes.find(c => c.id === classId)?.name || 'Unknown Class',
                        subjects: []
                      };
                    }
                    
                    groupedByClass[classId].subjects.push({
                      id: es.id,
                      name: globalSubject?.masterSubject?.name || 'Unknown Subject',
                      date: new Date(es.examDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
                      rawDate: new Date(es.examDate),
                      maxMarks: es.maxMarks,
                      passMarks: es.passMarks
                    });
                  });
                  
                  return (
                    <div key={exam.id} className="space-y-4">
                      <h4 className="text-lg font-bold text-foreground border-b border-black/5 dark:border-white/5 pb-2 flex items-center gap-2">
                        <div className="w-1.5 h-6 rounded-full bg-orange-500"></div>
                        {exam.name} <span className="text-xs text-muted-foreground font-medium ml-2">({exam.term?.name || 'N/A'})</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {Object.values(groupedByClass).sort((a,b) => a.className.localeCompare(b.className)).map(cls => (
                          <div key={cls.className} className="p-5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden group">
                            <h5 className="text-md font-black text-orange-500 mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" /> {cls.className}
                            </h5>
                            <div className="overflow-x-auto custom-scrollbar">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-background/50 font-bold uppercase tracking-wider text-muted-foreground">
                                  <tr>
                                    <th className="px-3 py-2 rounded-l-lg">Subject</th>
                                    <th className="px-3 py-2">Exam Date</th>
                                    <th className="px-3 py-2 text-center rounded-r-lg">Marks (Max/Pass)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                  {cls.subjects.sort((a,b) => a.rawDate - b.rawDate).map((s, idx) => (
                                    <tr key={idx} className="hover:bg-background/50 transition-colors">
                                      <td className="px-3 py-2 font-bold text-foreground">{s.name}</td>
                                      <td className="px-3 py-2 font-medium whitespace-nowrap text-muted-foreground">{s.date}</td>
                                      <td className="px-3 py-2 text-center font-bold text-foreground">{s.maxMarks} / {s.passMarks}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXAM SETUP TAB */}
      {activeTab === 'Exam Setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TERMS SECTION */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500"/> Academic Terms</h3>
            <div className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col h-[600px]">
              <form onSubmit={handleCreateTerm} className="mb-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground">Select Months</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-auto custom-scrollbar p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                    {sessionMonths.map(m => (
                      <label key={m} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${termForm.months.includes(m) ? 'bg-orange-500 text-white border-orange-500' : 'bg-background border-black/10 dark:border-white/10 hover:border-orange-500/50'}`}>
                        <input type="checkbox" className="hidden" checked={termForm.months.includes(m)} onChange={(e) => {
                          let newMonths = [...termForm.months];
                          if (e.target.checked) newMonths.push(m);
                          else newMonths = newMonths.filter(x => x !== m);
                          newMonths.sort((a,b) => sessionMonths.indexOf(a) - sessionMonths.indexOf(b));
                          
                          let autoName = termForm.name;
                          if (newMonths.length > 0) {
                            const startMonth = newMonths[0].split(' ')[0];
                            const endMonth = newMonths[newMonths.length - 1].split(' ')[0];
                            autoName = startMonth === endMonth ? `${startMonth} Term` : `${startMonth} - ${endMonth} Term`;
                          }
                          
                          setTermForm({ name: autoName, months: newMonths });
                        }} />
                        {m.split(' ')[0]}
                      </label>
                    ))}
                    {sessionMonths.length === 0 && <span className="text-xs text-muted-foreground p-1">No session months found</span>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <input required type="text" placeholder="Term Name" value={termForm.name} onChange={e => setTermForm({...termForm, name: e.target.value})} className="flex-1 bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold text-sm" />
                  {termForm.id && (
                    <button type="button" onClick={() => setTermForm({ id: null, name: '', months: [] })} className="px-4 py-3 bg-black/10 dark:bg-white/10 text-foreground rounded-xl font-bold hover:bg-black/20 transition-colors text-sm">Cancel</button>
                  )}
                  <button type="submit" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">{termForm.id ? 'Save' : 'Add'}</button>
                </div>
              </form>
              
              <div className="flex-1 overflow-auto custom-scrollbar space-y-3 pr-2">
                {terms.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground font-medium border border-dashed border-black/10 dark:border-white/10 rounded-2xl">No terms created yet. Add one above!</div>
                ) : (
                  terms.map(t => {
                    const parsedMonths = t.months ? JSON.parse(t.months) : [];
                    const termExams = exams.filter(e => e.termId === t.id);
                    const isLocked = termExams.some(e => new Date(e.startDate) <= new Date());
                    const isDeleteLocked = termExams.length > 0;

                    return (
                      <div key={t.id} className={`flex flex-col gap-2 p-4 rounded-2xl border transition-colors ${termForm.id === t.id ? 'bg-orange-500/10 border-orange-500/50' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-orange-500/30'}`}>
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-foreground">{t.name}</span>
                          <div className="flex items-center gap-1">
                            {isLocked ? (
                              <button type="button" disabled title="Locked: Exams have already started" className="text-muted-foreground p-1.5 opacity-50 cursor-not-allowed">
                                <Settings className="w-4 h-4" />
                              </button>
                            ) : (
                              <button type="button" onClick={() => setTermForm({ id: t.id, name: t.name, months: parsedMonths })} className="text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 p-1.5 rounded-lg transition-colors">
                                <Settings className="w-4 h-4" />
                              </button>
                            )}
                            
                            {isDeleteLocked ? (
                              <button type="button" disabled title="Cannot delete: Exams are assigned to this term" className="text-muted-foreground p-1.5 opacity-50 cursor-not-allowed">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button type="button" onClick={() => handleDeleteTerm(t.id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        {parsedMonths.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {parsedMonths.map(m => (
                              <span key={m} className="px-2 py-0.5 bg-background border border-black/10 dark:border-white/10 rounded-md text-[10px] font-bold text-muted-foreground">{m.split(' ')[0]}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* EXAMS SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-orange-500"/> Scheduled Exams</h3>
              <button onClick={() => setExamModalOpen(true)} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all premium-shadow text-sm">
                <Plus className="w-4 h-4" /> Create Exam
              </button>
            </div>

            {exams.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground font-medium border border-dashed border-black/10 dark:border-white/10 rounded-3xl h-[520px] flex flex-col items-center justify-center bg-black/5 dark:bg-white/5">
                <FileSpreadsheet className="w-12 h-12 mb-4 text-black/20 dark:text-white/20" />
                No exams scheduled yet.<br/>Create a term first, then create an exam.
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-auto max-h-[600px] pr-2 custom-scrollbar pb-10">
                {exams.map(exam => (
                  <div key={exam.id} className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-black text-foreground">{exam.name}</h4>
                      <p className="text-orange-500 font-bold uppercase tracking-wider text-xs mt-1 mb-4">{exam.term?.name || 'N/A'}</p>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg font-medium">
                          <Calendar className="w-4 h-4 text-orange-500" /> 
                          {new Date(exam.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <button onClick={() => setSubjectMapModalOpen(exam)} className="w-full bg-black/5 dark:bg-white/5 hover:bg-orange-500 hover:text-white text-foreground py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                        <CalendarDays className="w-5 h-5" /> Smart Date Sheet Planner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        {/* PUBLISHED DATE SHEETS SECTION */}
        <div className="lg:col-span-3 space-y-6 mt-8 border-t border-black/10 dark:border-white/10 pt-10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-orange-500"/> Published Date Sheets
            </h3>
            <select 
              value={publishedFilterClassId} 
              onChange={e => setPublishedFilterClassId(e.target.value)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold appearance-none text-sm min-w-[200px]"
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          {exams.filter(e => e.subjects && e.subjects.length > 0).length === 0 ? (
            <div className="text-center p-12 text-muted-foreground font-medium border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/5 dark:bg-white/5">
              No date sheets published yet. Use the Smart Date Sheet Planner to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12">
              {exams.filter(e => e.subjects && e.subjects.length > 0).map(exam => {
                // Group subjects by classId using the global subjects array
                const groupedByClass = {};
                exam.subjects.forEach(es => {
                  const globalSubject = subjects.find(sub => sub.id === es.subjectId);
                  const classId = globalSubject?.classId;
                  if (!classId) return;
                  
                  if (!groupedByClass[classId]) {
                    groupedByClass[classId] = {
                      className: classes.find(c => c.id === classId)?.name || 'Unknown Class',
                      subjects: []
                    };
                  }
                  
                  groupedByClass[classId].subjects.push({
                    id: es.id,
                    name: globalSubject?.masterSubject?.name || 'Unknown Subject',
                    date: new Date(es.examDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
                    rawDate: new Date(es.examDate), // for sorting
                    maxMarks: es.maxMarks,
                    passMarks: es.passMarks
                  });
                });
                
                const filteredClasses = Object.entries(groupedByClass)
                  .filter(([cId, cls]) => publishedFilterClassId === '' || cId === publishedFilterClassId)
                  .sort((a,b) => a[1].className.localeCompare(b[1].className));

                if (filteredClasses.length === 0) return null;
                
                return (
                  <div key={exam.id} className="space-y-6">
                    <h4 className="text-xl font-bold text-foreground border-b border-black/5 dark:border-white/5 pb-4 flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full bg-orange-500"></div>
                      {exam.name} <span className="text-sm text-muted-foreground font-medium ml-2">({exam.term?.name || 'N/A'})</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {filteredClasses.map(([cId, cls]) => (
                        <div key={cls.className} className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                          <div className="relative z-10">
                            <h5 className="text-lg font-black text-orange-500 mb-4 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" /> {cls.className}
                            </h5>
                            <div className="overflow-x-auto custom-scrollbar">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-black/5 dark:bg-white/5 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                                  <tr>
                                    <th className="px-4 py-3 rounded-l-xl">Subject</th>
                                    <th className="px-4 py-3">Exam Date</th>
                                    <th className="px-4 py-3 text-center">Max Marks</th>
                                    <th className="px-4 py-3 text-center rounded-r-xl">Pass Marks</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                  {cls.subjects.sort((a,b) => a.rawDate - b.rawDate).map((s, idx) => (
                                    <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                      <td className="px-4 py-3 font-bold text-foreground">{s.name}</td>
                                      <td className="px-4 py-3 font-medium whitespace-nowrap text-muted-foreground">{s.date}</td>
                                      <td className="px-4 py-3 text-center font-bold text-foreground">{s.maxMarks}</td>
                                      <td className="px-4 py-3 text-center font-bold text-foreground">{s.passMarks}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>
      )}

      {/* PAPER PREPARATION TAB */}
      {activeTab === 'Paper Preparation' && (
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-background to-orange-500/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <FileText className="w-8 h-8 text-orange-500" /> Paper Preparation Board
                </h2>
                <p className="text-muted-foreground font-medium mt-2">
                  Configure exam modes (Online/Offline) and attach question papers.
                </p>
              </div>
            </div>

            {exams.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground font-medium border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/5 dark:bg-white/5">
                No exams scheduled yet.
              </div>
            ) : (
              <div className="space-y-8">
                {exams.filter(e => e.subjects && e.subjects.length > 0).map(exam => (
                  <div key={exam.id} className="bg-background border border-black/10 dark:border-white/10 rounded-3xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                      {exam.name} <span className="text-sm font-medium text-muted-foreground ml-2">({exam.term?.name})</span>
                    </h3>
                    
                    <div className="space-y-6">
                      {Object.values(
                        exam.subjects.reduce((acc, es) => {
                          const globalSub = subjects.find(s => s.id === es.subjectId);
                          const classObj = classes.find(c => c.id === globalSub?.classId);
                          const className = classObj?.name || 'Unknown Class';
                          const order = classObj?.orderIndex || 999;
                          if (!acc[className]) acc[className] = { className, order, items: [] };
                          acc[className].items.push({ es, globalSub });
                          return acc;
                        }, {})
                      ).sort((a, b) => a.order - b.order).map(classGroup => (
                        <div key={classGroup.className} className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                          <h4 className="text-lg font-bold mb-4 text-orange-500 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" /> {classGroup.className}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {classGroup.items.map(({ es, globalSub }) => {
                              const subName = globalSub?.masterSubject?.name || 'Unknown Subject';
                              const hasPaper = !!es.questionPaper;
                              return (
                                <div key={es.id} className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-background hover:border-orange-500/30 transition-all group shadow-sm flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-start mb-3 gap-2">
                                      <h4 className="font-bold text-foreground truncate" title={subName}>{subName}</h4>
                                      <div className="flex gap-1.5 shrink-0">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${es.mode === 'ONLINE' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                          {es.mode || 'OFFLINE'}
                                        </span>
                                        {hasPaper ? (
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5 select-none">
                                            <Check className="w-2.5 h-2.5 shrink-0" /> Ready
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-muted-foreground border border-black/5 dark:border-white/5 select-none">
                                            Draft
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(es.examDate).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-2">
                                      {hasPaper && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setBuilderExamSubject({...es, examName: exam.name, className: classGroup.className, subjectName: subName});
                                            setBuilderStartInPreview(true);
                                          }} 
                                          className="flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                                          type="button"
                                        >
                                          <Eye className="w-3.5 h-3.5" /> Preview
                                        </button>
                                      )}
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setConfigExamSubject({...es, examName: exam.name, className: classGroup.className, subjectName: subName});
                                        }} 
                                        className="flex items-center gap-1 text-orange-500 hover:text-orange-600 hover:underline cursor-pointer transition-colors"
                                        type="button"
                                      >
                                        <Settings className="w-3.5 h-3.5" /> Configure
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVIGILATION TAB */}
      {activeTab === 'Invigilation' && (
        <div className="space-y-6">
           <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-background to-orange-500/5">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
              <User className="w-8 h-8 text-orange-500" /> Invigilation Auto-Assigner
            </h2>
            <p className="text-muted-foreground font-medium mb-8">
              Assign teachers to classrooms for exam duties automatically, ensuring no double-booking and balanced workloads.
            </p>

            {/* Filter by Class Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-black/5 dark:border-white/5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filter by Class:</span>
                <select
                  value={invigilationClassFilter}
                  onChange={e => setInvigilationClassFilter(e.target.value)}
                  className="bg-card border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {invigilationClassFilter && (
                  <button 
                    onClick={() => setInvigilationClassFilter('')}
                    className="text-xs font-bold text-orange-500 hover:underline cursor-pointer transition-all"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {exams.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground font-medium border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/5 dark:bg-white/5">
                No exams scheduled yet.
              </div>
            ) : (
              <div className="space-y-8">
                {exams.filter(e => e.subjects && e.subjects.length > 0).map(exam => {
                  // Filter subjects for the table
                  const filteredSubjects = exam.subjects.filter(es => {
                    const globalSub = subjects.find(s => s.id === es.subjectId);
                    const classObj = classes.find(c => c.id === globalSub?.classId);
                    if (invigilationClassFilter && classObj?.id !== invigilationClassFilter) return false;
                    return true;
                  });

                  if (filteredSubjects.length === 0) return null;

                  return (
                    <div key={exam.id} className="bg-background border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                          {exam.name}
                        </h3>
                        <button
                          onClick={() => handleAutoAssignDuties(exam.id)}
                          disabled={isAutoAssigning}
                          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 text-sm cursor-pointer"
                        >
                          {isAutoAssigning ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          Smart Auto-Assign Invigilators
                        </button>
                      </div>

                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-black/5 dark:bg-white/5 text-xs uppercase font-black tracking-wider text-muted-foreground">
                            <tr>
                              <th className="px-6 py-4 rounded-tl-2xl">Class</th>
                              <th className="px-6 py-4">Subject</th>
                              <th className="px-6 py-4">Exam Date</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Workload</th>
                              <th className="px-6 py-4 w-72">Assigned Invigilator</th>
                              <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5 dark:divide-white/5">
                            {filteredSubjects.map(es => {
                              const globalSub = subjects.find(s => s.id === es.subjectId);
                              const classObj = classes.find(c => c.id === globalSub?.classId);
                              const className = classObj?.name || 'Unknown Class';
                              const subName = globalSub?.masterSubject?.name || 'Unknown Subject';
                              const assignedDuty = es.duties?.[0];
                              
                              // Count workload: how many duties does this teacher have overall in this exam?
                              const workloadCount = assignedDuty?.teacherId
                                ? exam.subjects.reduce((sum, esSub) => sum + (esSub.duties?.some(d => d.teacherId === assignedDuty?.teacherId) ? 1 : 0), 0)
                                : 0;

                              return (
                                <tr key={es.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                  {/* Class */}
                                  <td className="px-6 py-4 font-bold text-foreground">
                                    {className}
                                  </td>
                                  {/* Subject */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-orange-500 shrink-0" />
                                      <span className="font-semibold">{subName}</span>
                                    </div>
                                  </td>
                                  {/* Date */}
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 bg-black/5 dark:bg-white/5 text-muted-foreground text-xs font-bold px-2.5 py-1 rounded-lg">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {new Date(es.examDate).toLocaleDateString()}
                                    </span>
                                  </td>
                                  {/* Status */}
                                  <td className="px-6 py-4">
                                    {assignedDuty?.teacherId ? (
                                      <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-green-500/20">
                                        <Check className="w-3.5 h-3.5 font-bold" />
                                        Assigned
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-500/20 animate-pulse">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Pending
                                      </span>
                                    )}
                                  </td>
                                  {/* Workload */}
                                  <td className="px-6 py-4">
                                    {assignedDuty?.teacherId ? (
                                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                                        workloadCount > 3 
                                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' 
                                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                      }`}>
                                        {workloadCount} {workloadCount === 1 ? 'duty' : 'duties'}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground text-xs font-medium">-</span>
                                    )}
                                  </td>
                                  {/* Selection Dropdown */}
                                  <td className="px-6 py-4">
                                    <EmployeeSelect 
                                      employees={employees}
                                      value={assignedDuty?.teacherId || ''}
                                      placeholder="-- Assign Invigilator --"
                                      onChange={(val) => handleAssignDuty(es.id, val)}
                                    />
                                  </td>
                                  {/* Actions */}
                                  <td className="px-6 py-4 text-right">
                                    {assignedDuty?.teacherId && (
                                      <button
                                        onClick={() => handleAssignDuty(es.id, '')}
                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer"
                                        title="Clear assignment"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EVALUATION TRACKER TAB */}
      {activeTab === 'Evaluation Tracker' && (
         <div className="space-y-6">
           <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-background to-orange-500/5">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-orange-500" /> Evaluation Tracker
            </h2>
            <p className="text-muted-foreground font-medium mb-8">
              Assign evaluating teachers to subjects, track copy checking status, and set deadlines for marks entry.
            </p>

            {/* Filter by Class Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-black/5 dark:border-white/5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filter by Class:</span>
                <select
                  value={evaluationClassFilter}
                  onChange={e => setEvaluationClassFilter(e.target.value)}
                  className="bg-card border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {evaluationClassFilter && (
                  <button 
                    onClick={() => setEvaluationClassFilter('')}
                    className="text-xs font-bold text-orange-500 hover:underline cursor-pointer transition-all"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {exams.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground font-medium border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/5 dark:bg-white/5">
                No exams scheduled yet.
              </div>
            ) : (
              <div className="space-y-8">
                {exams.filter(e => e.subjects && e.subjects.length > 0).map(exam => {
                  const filteredSubjects = exam.subjects.filter(es => {
                    const globalSub = subjects.find(s => s.id === es.subjectId);
                    const classObj = classes.find(c => c.id === globalSub?.classId);
                    if (evaluationClassFilter && classObj?.id !== evaluationClassFilter) return false;
                    return true;
                  });

                  if (filteredSubjects.length === 0) return null;

                  return (
                    <div key={exam.id} className="bg-background border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                          {exam.name}
                        </h3>
                        <button
                          onClick={() => handleAutoAssignEvaluations(exam.id)}
                          disabled={isAutoAssigning}
                          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 text-sm cursor-pointer"
                        >
                          {isAutoAssigning ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          Smart Auto-Assign Evaluators
                        </button>
                      </div>

                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-black/5 dark:bg-white/5 text-xs uppercase font-black tracking-wider text-muted-foreground">
                            <tr>
                              <th className="px-6 py-4 rounded-tl-2xl">Class</th>
                              <th className="px-6 py-4">Subject</th>
                              <th className="px-6 py-4">Workload</th>
                              <th className="px-6 py-4 w-72">Assigned Evaluator</th>
                              <th className="px-6 py-4">Copy Checking Status</th>
                              <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5 dark:divide-white/5">
                            {filteredSubjects.map(es => {
                              const globalSub = subjects.find(s => s.id === es.subjectId);
                              const classObj = classes.find(c => c.id === globalSub?.classId);
                              const className = classObj?.name || 'Unknown Class';
                              const subName = globalSub?.masterSubject?.name || 'Unknown Subject';
                              const evaluation = es.evaluations?.[0];
                              
                              // Count workload: how many evaluations does this teacher have overall in this exam?
                              const workloadCount = evaluation?.evaluatorId
                                ? exam.subjects.reduce((sum, esSub) => sum + (esSub.evaluations?.some(d => d.evaluatorId === evaluation?.evaluatorId) ? 1 : 0), 0)
                                : 0;

                              return (
                                <tr key={es.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                  {/* Class */}
                                  <td className="px-6 py-4 font-bold text-foreground">
                                    {className}
                                  </td>
                                  {/* Subject */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-orange-500 shrink-0" />
                                      <span className="font-semibold">{subName}</span>
                                    </div>
                                  </td>
                                  {/* Workload */}
                                  <td className="px-6 py-4">
                                    {evaluation?.evaluatorId ? (
                                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                                        workloadCount > 3 
                                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' 
                                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                      }`}>
                                        {workloadCount} {workloadCount === 1 ? 'subject' : 'subjects'}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground text-xs font-medium">-</span>
                                    )}
                                  </td>
                                  {/* Selection Dropdown */}
                                  <td className="px-6 py-4">
                                    <EmployeeSelect 
                                      employees={employees}
                                      value={evaluation?.evaluatorId || ''}
                                      placeholder="-- Assign Evaluator --"
                                      onChange={(val) => handleAssignEvaluation(es.id, val, 'PENDING')}
                                    />
                                  </td>
                                  {/* Copy Checking Status */}
                                  <td className="px-6 py-4">
                                    {evaluation?.evaluatorId ? (
                                      <div className="flex gap-1">
                                        <button 
                                          onClick={() => handleAssignEvaluation(es.id, evaluation.evaluatorId, 'PENDING')}
                                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                                            evaluation.status === 'PENDING' 
                                              ? 'bg-amber-500 text-white shadow-sm font-black' 
                                              : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10'
                                          }`}
                                          type="button"
                                        >
                                          PENDING
                                        </button>
                                        <button 
                                          onClick={() => handleAssignEvaluation(es.id, evaluation.evaluatorId, 'IN_PROGRESS')}
                                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                                            evaluation.status === 'IN_PROGRESS' 
                                              ? 'bg-blue-500 text-white shadow-sm font-black' 
                                              : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10'
                                          }`}
                                          type="button"
                                        >
                                          WORKING
                                        </button>
                                        <button 
                                          onClick={() => handleAssignEvaluation(es.id, evaluation.evaluatorId, 'COMPLETED')}
                                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                                            evaluation.status === 'COMPLETED' 
                                              ? 'bg-green-500 text-white shadow-sm font-black' 
                                              : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10'
                                          }`}
                                          type="button"
                                        >
                                          DONE
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs font-semibold select-none flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Pending Assignment
                                      </span>
                                    )}
                                  </td>
                                  {/* Actions */}
                                  <td className="px-6 py-4 text-right">
                                    {evaluation?.evaluatorId && (
                                      <button
                                        onClick={() => handleAssignEvaluation(es.id, '')}
                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer"
                                        title="Clear assignment"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENT GRADING TAB */}
      {activeTab === 'Student Grading' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-wrap gap-4 items-end bg-gradient-to-br from-background to-orange-500/5">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Select Exam Cycle</label>
              <select value={marksExamId} onChange={e => setMarksExamId(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold appearance-none cursor-pointer">
                <option value="">-- Choose Exam --</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Target Class</label>
              <select value={marksClassId} onChange={e => setMarksClassId(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold appearance-none cursor-pointer">
                <option value="">-- Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Target Section</label>
              <select value={marksSectionId} onChange={e => setMarksSectionId(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold appearance-none cursor-pointer">
                <option value="">-- Section --</option>
                {classes.find(c => c.id === marksClassId)?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {marksGridData.students.length > 0 && marksGridData.examSubjects.length > 0 && (
            <div className="glass-panel rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-orange-500/[0.02]">
                <h3 className="text-xl font-bold flex items-center gap-2"><FileSpreadsheet className="text-orange-500 w-5 h-5"/> Student Marks Entry Sheet</h3>
                <button onClick={handleBulkSaveMarks} disabled={isSavingMarks} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-orange-500/10 cursor-pointer">
                  <Save className="w-4 h-4" /> {isSavingMarks ? 'Saving...' : 'Save Grades Sheet'}
                </button>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="bg-black/5 dark:bg-white/5 text-xs uppercase font-black tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-2xl">Roll No.</th>
                      <th className="px-6 py-4">Student Name</th>
                      {marksGridData.examSubjects.map(es => (
                        <th key={es.id} className="px-6 py-4 text-center">
                          {es.subject.masterSubject.name}
                          <div className="text-[10px] text-orange-500 mt-1 uppercase font-bold tracking-wide">Max: {es.maxMarks} • Pass: {es.passMarks}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {marksGridData.students.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-muted-foreground">{student.rollNumber || '-'}</td>
                        <td className="px-6 py-4 font-bold text-foreground">{student.firstName} {student.lastName}</td>
                        {marksGridData.examSubjects.map(es => {
                          const key = `${student.id}_${es.id}`;
                          const val = marksInput[key] !== undefined ? marksInput[key] : '';
                          const isFail = val !== '' && Number(val) < es.passMarks;
                          const isDistinction = val !== '' && (Number(val) / es.maxMarks) >= 0.9;
                          
                          return (
                            <td key={es.id} className="px-6 py-4 text-center">
                              <input 
                                type="number" 
                                min="0" 
                                max={es.maxMarks}
                                value={val}
                                placeholder="-"
                                title={`Min to pass: ${es.passMarks} / Max: ${es.maxMarks}`}
                                onChange={(e) => {
                                  if(Number(e.target.value) > es.maxMarks) return;
                                  setMarksInput({...marksInput, [key]: e.target.value});
                                }}
                                className={`w-24 text-center border rounded-xl px-2 py-2 outline-none focus:ring-2 font-bold transition-all ${
                                  isFail ? 'bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400 focus:ring-red-500/30' : 
                                  isDistinction ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500/30' : 
                                  'bg-black/[0.01] border-black/10 dark:border-white/10 focus:ring-orange-500/30 focus:bg-background'
                                }`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {marksGridData.students.length === 0 && marksExamId && marksSectionId && (
            <div className="text-center p-12 text-muted-foreground font-medium bg-background border border-dashed border-black/10 dark:border-white/10 rounded-3xl">No students or subjects found for this selection. Ensure subjects are mapped to this exam cycle.</div>
          )}
        </div>
      )}

      {/* REPORT CARDS TAB */}
      {activeTab === 'Report Cards' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Select Class</label>
              <select value={reportClassId} onChange={e => setReportClassId(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold appearance-none">
                <option value="">-- Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Select Section</label>
              <select value={reportSectionId} onChange={e => setReportSectionId(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold appearance-none">
                <option value="">-- Section --</option>
                {classes.find(c => c.id === reportClassId)?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Select Student</label>
              <select value={selectedReportStudent || ''} onChange={e => setSelectedReportStudent(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold appearance-none">
                <option value="">-- Choose Student --</option>
                {Array.isArray(reportStudents) && reportStudents.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
          </div>

          {reportData && reportData.student && (() => {
            const studentInitials = `${reportData.student.firstName?.[0] || ''}${reportData.student.lastName?.[0] || ''}`.toUpperCase();
            
            const sessionMarks = reportData.marks || [];
            const overallTotalObtained = sessionMarks.reduce((acc, m) => acc + m.marksObtained, 0);
            const overallTotalMax = sessionMarks.reduce((acc, m) => acc + m.examSubject.maxMarks, 0);
            const overallPercentage = overallTotalMax > 0 ? (overallTotalObtained / overallTotalMax) * 100 : 0;

            let sessionGrade = 'F';
            if (overallPercentage >= 90) sessionGrade = 'A+';
            else if (overallPercentage >= 80) sessionGrade = 'A';
            else if (overallPercentage >= 70) sessionGrade = 'B';
            else if (overallPercentage >= 60) sessionGrade = 'C';
            else if (overallPercentage >= 33) sessionGrade = 'D';

            const isSessionPassed = overallPercentage >= 33;

            const examsMap = {};
            sessionMarks.forEach(m => {
              const examName = m.examSubject.exam.name;
              if (!examsMap[examName]) examsMap[examName] = [];
              examsMap[examName].push(m);
            });

            return (
              <motion.div 
                id="printable-report-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="glass-panel rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden max-w-5xl mx-auto relative bg-gradient-to-b from-card to-card/95 premium-shadow shadow-2xl print:border-none print:shadow-none print:rounded-none"
              >
                {/* Print specific CSS */}
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    #printable-report-card, #printable-report-card * {
                      visibility: visible;
                    }
                    #printable-report-card {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      background: white !important;
                      color: black !important;
                      border: 3px double #d97706 !important;
                      border-radius: 12px !important;
                      padding: 24px !important;
                      box-shadow: none !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                    .print-text-black {
                      color: #000000 !important;
                    }
                    .print-bg-gray {
                      background-color: #f3f4f6 !important;
                    }
                    .print-bg-white {
                      background-color: #ffffff !important;
                    }
                    .print-border-black {
                      border-color: #000000 !important;
                    }
                    .print-progress-bar {
                      background-color: #e5e7eb !important;
                      border: 1px solid #9ca3af !important;
                    }
                    .print-progress-fill {
                      background-color: #4b5563 !important;
                    }
                  }
                `}</style>

                {/* Crest Watermark */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] dark:opacity-[0.015]">
                  <GraduationCap className="w-[500px] h-[500px] text-foreground rotate-12" />
                </div>

                {/* Professional Header */}
                <div className="p-8 bg-gradient-to-br from-orange-500 via-amber-500 to-amber-600 text-white flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
                  <div className="flex items-center gap-4 z-10">
                    {settings?.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg shadow-black/10" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg"><GraduationCap className="w-9 h-9 text-white"/></div>
                    )}
                    <div className="text-left">
                      <h2 className="text-3xl font-black tracking-tight">{settings?.schoolName || 'GDL International School'}</h2>
                      <p className="text-white/80 font-medium text-sm mt-0.5 flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> Academic Session: {activeSession?.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-center md:items-end z-10">
                    <span className="text-[10px] font-black tracking-widest px-3 py-1 bg-white/20 rounded-full uppercase leading-none mb-2 border border-white/10 backdrop-blur-md">Official Document</span>
                    <h3 className="text-3xl font-black tracking-wider bg-clip-text text-white">REPORT CARD</h3>
                  </div>
                </div>

                {/* Sub-header gradient thin accent line */}
                <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-600"></div>
                
                <div className="p-8 relative z-10">
                  {/* Student Details Card */}
                  <div className="flex flex-col md:flex-row gap-6 items-center p-6 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-black/5 dark:border-white/5 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/20 print:shadow-none">
                      {studentInitials}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full text-left">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Student Name</span>
                        <div className="font-extrabold text-foreground text-base">{reportData.student.firstName} {reportData.student.lastName}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Admission No</span>
                        <div className="font-extrabold text-foreground text-base">{reportData.student.admissionNumber}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Class & Section</span>
                        <div className="font-extrabold text-foreground text-base">{reportData.student.class?.name} - {reportData.student.section?.name}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Roll Number</span>
                        <div className="font-extrabold text-foreground text-base">{reportData.student.rollNumber || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                      <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">Total Marks</div>
                      <div className="text-2xl font-black text-foreground">{overallTotalObtained} / {overallTotalMax}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Session Total</div>
                    </motion.div>

                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                      <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">Percentage</div>
                      <div className="text-3xl font-black text-orange-500">{overallPercentage.toFixed(1)}%</div>
                      <div className="w-20 bg-black/10 dark:bg-white/10 h-1 rounded-full mt-2 overflow-hidden print-progress-bar">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${overallPercentage}%` }} 
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-orange-500 rounded-full print-progress-fill"
                        />
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                      <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">Overall Grade</div>
                      <div className="text-3xl font-black text-amber-500 drop-shadow-md">{sessionGrade}</div>
                      <div className="text-[10px] text-amber-500/75 mt-0.5 font-bold">Academic Performance</div>
                    </motion.div>

                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center relative overflow-hidden ${isSessionPassed ? 'from-emerald-500/5 to-teal-500/5 border-emerald-500/10' : 'from-red-500/5 to-rose-500/5 border-red-500/10'}`}
                    >
                      <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">Result Status</div>
                      <div className={`text-2xl font-black uppercase tracking-wider ${isSessionPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isSessionPassed ? 'PROMOTED' : 'DETAINED'}
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-1.5 leading-none ${isSessionPassed ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'}`}>
                        {isSessionPassed ? 'PASS' : 'FAIL'}
                      </span>
                    </motion.div>
                  </div>

                  {/* Exam Cycles List */}
                  {Object.keys(examsMap).map((examName, examIndex) => {
                    const mList = examsMap[examName];
                    let examTotalObtained = 0;
                    let examTotalMax = 0;
                    
                    mList.forEach(m => {
                      examTotalObtained += m.marksObtained;
                      examTotalMax += m.examSubject.maxMarks;
                    });

                    return (
                      <motion.div 
                        key={examName} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: examIndex * 0.2 }}
                        className="mb-8 bg-black/[0.01] dark:bg-white/[0.01] rounded-3xl p-6 border border-black/5 dark:border-white/5 print:bg-white print:border-black"
                      >
                        <h4 className="text-lg font-black text-orange-500 mb-5 tracking-tight uppercase border-b border-orange-500/20 pb-2.5 flex items-center gap-2">
                          <Award className="w-5 h-5" /> {examName}
                        </h4>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="border-b border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                <th className="px-4 py-3">Subject</th>
                                <th className="px-4 py-3 text-center">Max Marks</th>
                                <th className="px-4 py-3 text-center">Pass Marks</th>
                                <th className="px-4 py-3 text-center">Marks Obtained</th>
                                <th className="px-4 py-3 text-center">Percentage</th>
                                <th className="px-4 py-3 text-center">Grade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-foreground">
                              {mList.map((m, idx) => {
                                const pct = (m.marksObtained / m.examSubject.maxMarks) * 100;
                                let grade = 'F';
                                if (pct >= 90) grade = 'A+';
                                else if (pct >= 80) grade = 'A';
                                else if (pct >= 70) grade = 'B';
                                else if (pct >= 60) grade = 'C';
                                else if (pct >= Number(m.examSubject.passMarks)) grade = 'D';

                                return (
                                  <motion.tr 
                                    key={m.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: (examIndex * 0.2) + (idx * 0.05) }}
                                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors print:hover:bg-transparent"
                                  >
                                    <td className="px-4 py-3.5 font-extrabold text-foreground">{m.examSubject.subject.masterSubject.name}</td>
                                    <td className="px-4 py-3.5 text-center text-muted-foreground">{m.examSubject.maxMarks}</td>
                                    <td className="px-4 py-3.5 text-center text-muted-foreground">{m.examSubject.passMarks}</td>
                                    <td className="px-4 py-3.5 text-center">
                                      <div className="flex flex-col items-center gap-1.5">
                                        <span className="font-black text-foreground">{m.marksObtained}</span>
                                        {/* Score Progress Bar */}
                                        <div className="w-24 bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden print-progress-bar">
                                          <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, delay: 0.4 }}
                                            className={`h-full rounded-full print-progress-fill ${
                                              pct >= 75 ? 'bg-emerald-500' :
                                              pct >= Number(m.examSubject.passMarks) ? 'bg-amber-500' :
                                              'bg-red-500'
                                            }`}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-center font-bold text-muted-foreground">{pct.toFixed(1)}%</td>
                                    <td className="px-4 py-3.5 text-center">
                                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black tracking-wider leading-none ${
                                        grade === 'F' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                                        grade === 'A+' || grade === 'A' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                        'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                      }`}>
                                        {grade}
                                      </span>
                                    </td>
                                  </motion.tr>
                                );
                              })}
                              
                              <tr className="bg-orange-500/[0.03] print:bg-gray-100 font-extrabold">
                                <td className="px-4 py-4 font-black text-right" colSpan={3}>EXAM TOTAL</td>
                                <td className="px-4 py-4 text-center font-black text-base text-orange-500">{examTotalObtained} / {examTotalMax}</td>
                                <td className="px-4 py-4 text-center font-black text-base text-orange-500" colSpan={2}>
                                  {((examTotalObtained / examTotalMax) * 100).toFixed(1)}%
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Chart */}
                        <div className="mt-8 h-56 w-full bg-black/[0.01] dark:bg-white/[0.005] rounded-2xl p-4 border border-black/5 dark:border-white/5 print:hidden">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mList.map(m => ({
                              subject: m.examSubject.subject.masterSubject.name.length > 12 ? m.examSubject.subject.masterSubject.name.substring(0, 10) + '...' : m.examSubject.subject.masterSubject.name,
                              marks: m.marksObtained,
                              max: m.examSubject.maxMarks
                            }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`scoreGrad-${examName.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.9}/>
                                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.3}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.05} />
                              <XAxis dataKey="subject" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#111', color: '#fff', fontWeight: 'bold', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
                                itemStyle={{ color: '#fff' }}
                              />
                              <Bar dataKey="marks" fill={`url(#scoreGrad-${examName.replace(/\s+/g, '-')})`} radius={[8, 8, 0, 0]} name="Marks Obtained" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Signatures & Seal watermarked Block */}
                  <div className="mt-16 grid grid-cols-3 gap-8 text-center pt-8 border-t border-black/5 dark:border-white/5 relative">
                    <div className="flex flex-col items-center">
                      <div className="h-12 flex items-end justify-center italic text-orange-500 font-extrabold text-lg select-none print:text-black">
                        Class Teacher
                      </div>
                      <div className="w-40 border-b border-dashed border-black/20 dark:border-white/20 my-2"></div>
                      <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Class Teacher</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center relative">
                      {/* Stamp Seal Design */}
                      <div className="absolute -top-6 w-20 h-20 rounded-full border-4 border-double border-orange-500/20 flex items-center justify-center rotate-12 select-none pointer-events-none print:border-black/30">
                        <span className="text-[7px] font-black text-orange-500/40 print:text-black/40 text-center uppercase leading-none">GDL School<br/>★<br/>OFFICIAL SEAL</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-12">Institutional Seal</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="h-12 flex items-end justify-center italic text-orange-500 font-extrabold text-lg select-none print:text-black">
                        Principal
                      </div>
                      <div className="w-40 border-b border-dashed border-black/20 dark:border-white/20 my-2"></div>
                      <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Principal</span>
                    </div>
                  </div>

                  {/* Print and Export Actions */}
                  <div className="mt-12 flex justify-end gap-3 no-print">
                    <button onClick={() => window.print()} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all premium-shadow shadow-lg shadow-orange-500/25">
                      <Printer className="w-5 h-5" /> Print Report Card
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </div>
      )}

      {/* MODALS */}
      {/* Create Exam Modal */}
      <AnimatePresence>
        {examModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card w-full max-w-lg rounded-[2.5rem] premium-shadow border border-white/10">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <h2 className="text-2xl font-bold text-foreground">Create Exam</h2>
                <button onClick={() => setExamModalOpen(false)} className="p-2 rounded-full hover:bg-black/10 transition-colors text-muted-foreground"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateExam} className="p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Exam Name</label>
                  <input required type="text" value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Select Term</label>
                  <select required value={examForm.termId} onChange={e => setExamForm({...examForm, termId: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold appearance-none">
                    <option value="">-- Choose Term --</option>
                    {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="pt-6 mt-8 flex justify-end">
                  <button type="submit" className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold hover:scale-105 transition-all">Create Exam</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Date Sheet Planner Modal */}
      <AnimatePresence>
        {subjectMapModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card w-full max-w-5xl rounded-[2.5rem] premium-shadow border border-white/10 flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-orange-500/10 to-amber-500/5">
                <div>
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                    <CalendarDays className="w-7 h-7 text-orange-500" /> Smart Date Sheet Planner
                  </h2>
                  <p className="text-orange-500 font-bold text-sm mt-1">Generating schedule for: {subjectMapModalOpen.name}</p>
                </div>
                <button onClick={() => setSubjectMapModalOpen(null)} className="p-2 rounded-full hover:bg-black/10 transition-colors text-muted-foreground"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="p-8 flex-1 overflow-visible min-h-0 flex flex-col md:flex-row gap-8">
                {/* Sidebar Configuration */}
                <div className="w-full md:w-64 space-y-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Step 1: Select Class</label>
                    <select value={mapClassId} onChange={e => setMapClassId(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold appearance-none">
                      <option value="">-- Choose Class --</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {mapClassId && (
                    <div className="space-y-6 p-5 bg-orange-500/5 rounded-2xl border border-orange-500/20">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Step 2: Start Date</label>
                        <CustomDatePicker 
                          minDate={subjectMapModalOpen?.startDate} 
                          maxDate={subjectMapModalOpen?.endDate} 
                          selectedDate={plannerStartDate} 
                          onChange={setPlannerStartDate} 
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Step 3: Gap Days</label>
                        <select value={plannerGapDays} onChange={e => setPlannerGapDays(Number(e.target.value))} className="w-full bg-background rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold appearance-none border border-black/5 dark:border-white/5">
                          <option value={0}>0 Days (Consecutive)</option>
                          <option value={1}>1 Day Gap</option>
                          <option value={2}>2 Days Gap</option>
                          <option value={3}>3 Days Gap</option>
                        </select>
                      </div>
                      <button onClick={handleGenerateSchedule} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                        Auto-Generate Dates
                      </button>
                      <p className="text-[10px] text-muted-foreground text-center font-medium leading-relaxed">
                        Holidays and Sundays will be automatically skipped based on the School Setup calendar.
                      </p>
                    </div>
                  )}
                </div>

                {/* Grid */}
                <div className="flex-1">
                  {mapClassId && mapSubjectsData.length > 0 && (
                    <div className="border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden h-full flex flex-col">
                      <div className="overflow-auto custom-scrollbar flex-1 pb-64">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-black/5 dark:bg-white/5 uppercase font-black text-xs tracking-wider text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                              <th className="px-4 py-4 text-center w-16">Include</th>
                              <th className="px-4 py-4">Subject Name</th>
                              <th className="px-4 py-4">Exam Date</th>
                              <th className="px-4 py-4 w-28">Max Marks</th>
                              <th className="px-4 py-4 w-28">Pass Marks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5 dark:divide-white/5">
                            {mapSubjectsData.map((s, idx) => (
                              <tr key={s.subjectId} className={`transition-colors ${s.selected ? 'bg-orange-500/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                <td className="px-4 py-3 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={s.selected}
                                    onChange={e => {
                                      const newData = [...mapSubjectsData];
                                      newData[idx].selected = e.target.checked;
                                      setMapSubjectsData(newData);
                                    }}
                                    className="w-5 h-5 rounded border-black/20 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                  />
                                </td>
                                <td className="px-4 py-3 font-bold text-foreground">{s.subjectName}</td>
                                <td className="px-4 py-3">
                                  <div className={!s.selected ? "opacity-50 pointer-events-none" : ""}>
                                    <CustomDatePicker 
                                      minDate={subjectMapModalOpen?.startDate} 
                                      maxDate={subjectMapModalOpen?.endDate} 
                                      selectedDate={s.examDate} 
                                      onChange={val => {
                                        const newData = [...mapSubjectsData];
                                        newData[idx].examDate = val;
                                        setMapSubjectsData(newData);
                                      }} 
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <input 
                                    type="number" 
                                    value={s.maxMarks}
                                    onChange={e => {
                                      const newData = [...mapSubjectsData];
                                      newData[idx].maxMarks = e.target.value;
                                      setMapSubjectsData(newData);
                                    }}
                                    disabled={!s.selected}
                                    className="w-20 bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold disabled:opacity-50 text-foreground"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input 
                                    type="number" 
                                    value={s.passMarks}
                                    onChange={e => {
                                      const newData = [...mapSubjectsData];
                                      newData[idx].passMarks = e.target.value;
                                      setMapSubjectsData(newData);
                                    }}
                                    disabled={!s.selected}
                                    className="w-20 bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold disabled:opacity-50 text-foreground"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {mapClassId && mapSubjectsData.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground font-medium h-full flex items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                      No subjects found for this class. Add subjects in School Setup.
                    </div>
                  )}
                  {!mapClassId && (
                    <div className="text-center p-8 text-muted-foreground font-medium h-full flex flex-col items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                      <CalendarDays className="w-12 h-12 mb-4 text-black/10 dark:text-white/10" />
                      Select a class to start scheduling exams.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/5 dark:bg-white/5 flex justify-end gap-4 rounded-b-[2.5rem]">
                <button onClick={() => setSubjectMapModalOpen(null)} className="px-6 py-3 font-bold text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleSaveSubjectMapping} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold hover:scale-105 transition-all premium-shadow flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5"/> Save Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBJECT CONFIG MODAL */}
      <AnimatePresence>
        {configExamSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-background w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-black/10 dark:border-white/10 flex flex-col">
              <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <h3 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-orange-500" /> Configure Paper</h3>
                <button onClick={() => setConfigExamSubject(null)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form id="configForm" onSubmit={handleSaveSubjectConfig} className="space-y-6">
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground">Exam Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['OFFLINE', 'ONLINE', 'HYBRID'].map(m => (
                        <button type="button" key={m} onClick={() => setConfigExamSubject({...configExamSubject, mode: m})} className={`p-3 rounded-xl border font-bold text-xs transition-colors ${configExamSubject.mode === m ? 'bg-orange-500 border-orange-500 text-white' : 'bg-background border-black/10 dark:border-white/10 hover:border-orange-500/50'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground">Question Paper Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['SUBJECTIVE', 'OBJECTIVE', 'MIXED', 'EXTERNAL_PDF'].map(pt => (
                        <button type="button" key={pt} onClick={() => setConfigExamSubject({...configExamSubject, paperType: pt})} className={`p-3 rounded-xl border font-bold text-xs transition-colors ${configExamSubject.paperType === pt ? 'bg-orange-500 border-orange-500 text-white' : 'bg-background border-black/10 dark:border-white/10 hover:border-orange-500/50'}`}>
                          {pt.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground">Duration (Minutes)</label>
                    <input type="number" value={configExamSubject.durationMins || 120} onChange={e => setConfigExamSubject({...configExamSubject, durationMins: parseInt(e.target.value)})} className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold" />
                  </div>

                </form>
              </div>
              <div className="p-6 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex gap-3 flex-wrap">
                <button type="button" onClick={() => { setBuilderExamSubject(configExamSubject); setConfigExamSubject(null); }} className="w-full mb-2 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" /> Open Paper Builder
                </button>
                <button onClick={() => setConfigExamSubject(null)} className="flex-1 py-3 bg-black/10 dark:bg-white/10 text-foreground rounded-xl font-bold hover:bg-black/20 transition-colors">Cancel</button>
                <button type="submit" form="configForm" className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">Save Settings</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAPER BUILDER FULLSCREEN */}
      <AnimatePresence>
        {builderExamSubject && (
          <QuestionPaperBuilder 
            examSubject={builderExamSubject}
            apiBase={apiBase}
            onClose={() => {
              setBuilderExamSubject(null);
              setBuilderStartInPreview(false);
            }}
            startInPreview={builderStartInPreview}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
