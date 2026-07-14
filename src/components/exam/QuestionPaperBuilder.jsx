import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Save, ArrowLeft, Plus, Trash2, Upload, GripVertical, CheckCircle2, ChevronDown, ChevronUp, Check, Download, Copy, Type, Image as ImageIcon, SplitSquareHorizontal, CircleDot, AlignLeft, CheckSquare, Eye, Palette, Star, Undo2, Redo2, Link2, UserPlus, MoreVertical, Award, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';

const CustomDropdown = ({ value, onChange, theme, paperType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const allOptions = [
    { label: 'Short Answer', value: 'SHORT_ANSWER', icon: <AlignLeft className="w-4 h-4"/> },
    { label: 'Paragraph', value: 'PARAGRAPH', icon: <AlignLeft className="w-4 h-4"/> },
    { label: 'Multiple Choice', value: 'MCQ', icon: <CircleDot className="w-4 h-4"/> },
    { label: 'Checkboxes', value: 'CHECKBOXES', icon: <CheckSquare className="w-4 h-4"/> },
    { label: 'Dropdown', value: 'DROPDOWN', icon: <ChevronDown className="w-4 h-4"/> },
    { label: 'Linear Scale', value: 'LINEAR_SCALE', icon: <SplitSquareHorizontal className="w-4 h-4"/> },
    { label: 'True / False', value: 'TRUE_FALSE', icon: <CheckCircle2 className="w-4 h-4"/> },
    { label: 'Section Header', value: 'SECTION_HEADER', icon: <SplitSquareHorizontal className="w-4 h-4"/> },
  ];

  const options = allOptions.filter(opt => {
    if (paperType === 'MCQ') {
      return ['MCQ', 'CHECKBOXES', 'DROPDOWN', 'LINEAR_SCALE', 'TRUE_FALSE', 'SECTION_HEADER'].includes(opt.value);
    }
    if (paperType === 'SUBJECTIVE') {
      return ['SHORT_ANSWER', 'PARAGRAPH', 'SECTION_HEADER'].includes(opt.value);
    }
    return true;
  });

  let mappedValue = value;
  if (value === 'SUBJECTIVE') mappedValue = 'PARAGRAPH';

  const selected = options.find(o => o.value === mappedValue) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${isOpen ? theme.border + ' ring-2 ' + theme.focusRing : 'hover:bg-black/10 dark:hover:bg-white/10'}`}
      >
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">{selected.icon}</div>
          <span>{selected.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-card border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2"
          >
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-4 py-3 flex items-center gap-3 text-sm font-bold cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${mappedValue === opt.value ? theme.lightBg + ' ' + theme.text : ''}`}
              >
                <div className={mappedValue === opt.value ? theme.text : "text-muted-foreground"}>{opt.icon}</div>
                <span>{opt.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuestionPaperBuilder = ({ examSubject, apiBase, onClose, startInPreview = false }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paper, setPaper] = useState({ title: '', description: '', totalMarks: 0, isDigital: true, questions: [] });
  const [isPreviewMode, setIsPreviewMode] = useState(startInPreview);
  const [themeColor, setThemeColor] = useState('purple'); // Default Google Forms color
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'responses', 'settings'
  const [paperType, setPaperType] = useState(examSubject?.paperType || 'MIXED');
  const [previewAnswers, setPreviewAnswers] = useState({});
  const fileInputRef = useRef(null);

  const handlePreviewAnswerSelect = (qId, optionVal, isMultiple = false) => {
    setPreviewAnswers(prev => {
      const current = prev[qId] || [];
      if (isMultiple) {
        const next = current.includes(optionVal) 
          ? current.filter(x => x !== optionVal)
          : [...current, optionVal];
        return { ...prev, [qId]: next };
      } else {
        const next = current[0] === optionVal ? [] : [optionVal];
        return { ...prev, [qId]: next };
      }
    });
  };

  const themeClasses = {
    orange: {
      bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', hoverBg: 'hover:bg-orange-500', hoverText: 'hover:text-orange-500', focusRing: 'focus:ring-orange-500/50', gradient: 'from-orange-500 to-amber-500', lightBg: 'bg-orange-500/10'
    },
    blue: {
      bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', hoverBg: 'hover:bg-blue-500', hoverText: 'hover:text-blue-500', focusRing: 'focus:ring-blue-500/50', gradient: 'from-blue-500 to-cyan-500', lightBg: 'bg-blue-500/10'
    },
    green: {
      bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', hoverBg: 'hover:bg-emerald-500', hoverText: 'hover:text-emerald-500', focusRing: 'focus:ring-emerald-500/50', gradient: 'from-emerald-500 to-teal-500', lightBg: 'bg-emerald-500/10'
    },
    purple: {
      bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', hoverBg: 'hover:bg-purple-500', hoverText: 'hover:text-purple-500', focusRing: 'focus:ring-purple-500/50', gradient: 'from-purple-500 to-fuchsia-500', lightBg: 'bg-purple-500/10'
    },
    rose: {
      bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', hoverBg: 'hover:bg-rose-500', hoverText: 'hover:text-rose-500', focusRing: 'focus:ring-rose-500/50', gradient: 'from-rose-500 to-pink-500', lightBg: 'bg-rose-500/10'
    }
  };
  const theme = themeClasses[themeColor];

  useEffect(() => {
    fetchPaper();
  }, []);

  const fetchPaper = async () => {
    try {
      const res = await fetch(`${apiBase}/exam-subjects/${examSubject.id}/question-paper`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          // Parse options if stored as string
          const parsedQuestions = (data.questions || []).map(q => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : []
          }));
          setPaper({ 
            title: data.title || '',
            description: data.description || '',
            totalMarks: data.totalMarks || 0,
            isDigital: data.isDigital !== undefined ? data.isDigital : true,
            questions: parsedQuestions 
          });
        } else {
          const defaultTitle = examSubject?.examName && examSubject?.subjectName 
            ? `${examSubject.examName} - ${examSubject.subjectName}`
            : `${examSubject?.subject?.name || 'Untitled'} Paper`;
          setPaper({ title: defaultTitle, description: '', totalMarks: 0, isDigital: true, questions: [] });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Calculate total marks automatically
      const totalMarks = paper.questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0);
      
      const payload = {
        title: paper.title,
        fileUrl: paper.description || '',
        totalMarks: totalMarks,
        isDigital: paper.isDigital,
        questions: paper.questions
      };

      const res = await fetch(`${apiBase}/exam-subjects/${examSubject.id}/question-paper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setPaper({ 
          title: data.title || '',
          description: data.fileUrl || '',
          totalMarks: data.totalMarks || 0,
          isDigital: data.isDigital !== undefined ? data.isDigital : true,
          questions: data.questions.map(q => ({...q, options: q.options ? JSON.parse(q.options) : []})) 
        });
        alert('Question Paper Saved Successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save paper.');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (type = 'SUBJECTIVE') => {
    const newQ = { 
      id: `new_${Date.now()}`, 
      type, 
      text: type === 'SECTION_HEADER' ? 'Untitled Section' : '', 
      marks: type === 'SECTION_HEADER' ? 0 : 1, 
      options: [], 
      correctAnswer: '',
      isRequired: false,
      imageUrl: ''
    };
    if (type === 'MCQ' || type === 'CHECKBOXES' || type === 'DROPDOWN') {
      newQ.options = ['Option 1'];
    }
    setPaper(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
  };

  const duplicateQuestion = (index) => {
    setPaper(prev => {
      const q = prev.questions[index];
      const newQ = { ...q, id: `dup_${Date.now()}` };
      const newQs = [...prev.questions];
      newQs.splice(index + 1, 0, newQ);
      return { ...prev, questions: newQs };
    });
  };

  const updateQuestion = (index, field, value) => {
    setPaper(prev => {
      const newQs = [...prev.questions];
      newQs[index] = { ...newQs[index], [field]: value };
      return { ...prev, questions: newQs };
    });
  };

  const removeQuestion = (index) => {
    setPaper(prev => {
      const newQs = [...prev.questions];
      newQs.splice(index, 1);
      return { ...prev, questions: newQs };
    });
  };

  const moveQuestion = (index, direction) => {
    setPaper(prev => {
      const newQs = [...prev.questions];
      if (direction === -1 && index > 0) {
        [newQs[index - 1], newQs[index]] = [newQs[index], newQs[index - 1]];
      } else if (direction === 1 && index < newQs.length - 1) {
        [newQs[index + 1], newQs[index]] = [newQs[index], newQs[index + 1]];
      }
      return { ...prev, questions: newQs };
    });
  };

  const addOption = (qIndex) => {
    setPaper(prev => {
      const newQs = [...prev.questions];
      newQs[qIndex].options.push(`Option ${newQs[qIndex].options.length + 1}`);
      return { ...prev, questions: newQs };
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setPaper(prev => {
      const newQs = [...prev.questions];
      newQs[qIndex].options[optIndex] = value;
      return { ...prev, questions: newQs };
    });
  };

  const removeOption = (qIndex, optIndex) => {
    setPaper(prev => {
      const newQs = [...prev.questions];
      newQs[qIndex].options.splice(optIndex, 1);
      return { ...prev, questions: newQs };
    });
  };

  const handleAddImage = (idx) => {
    const url = prompt('Enter Image URL (e.g., https://example.com/image.png):');
    if (url) {
      updateQuestion(idx, 'imageUrl', url);
    }
  };

  const toggleCheckboxAnswer = (idx, opt) => {
    setPaper(prev => {
      const newQs = [...prev.questions];
      const q = newQs[idx];
      let currentAnswers = [];
      try { currentAnswers = JSON.parse(q.correctAnswer || '[]'); } catch(e) { currentAnswers = []; }
      
      if (!Array.isArray(currentAnswers)) currentAnswers = [q.correctAnswer].filter(Boolean);

      if (currentAnswers.includes(opt)) {
        currentAnswers = currentAnswers.filter(a => a !== opt);
      } else {
        currentAnswers.push(opt);
      }
      q.correctAnswer = JSON.stringify(currentAnswers);
      return { ...prev, questions: newQs };
    });
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const newQuestions = data.map((row, idx) => {
          const type = (row.Type || 'SUBJECTIVE').toUpperCase();
          const marks = parseFloat(row.Marks) || 1;
          const text = row.Question || '';
          
          let options = [];
          if (type === 'MCQ') {
            if (row.Option1) options.push(row.Option1);
            if (row.Option2) options.push(row.Option2);
            if (row.Option3) options.push(row.Option3);
            if (row.Option4) options.push(row.Option4);
          }

          return {
            id: `excel_${Date.now()}_${idx}`,
            type,
            text,
            marks,
            options,
            correctAnswer: row.CorrectAnswer || ''
          };
        });

        setPaper(prev => ({ ...prev, questions: [...prev.questions, ...newQuestions] }));
        alert(`Successfully imported ${newQuestions.length} questions!`);
      } catch (err) {
        console.error(err);
        alert('Failed to parse Excel file. Please ensure columns match: Type, Question, Marks, Option1, Option2, Option3, Option4, CorrectAnswer');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // reset
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        Type: 'SUBJECTIVE',
        Question: 'Explain the process of photosynthesis.',
        Marks: 5,
        Option1: '', Option2: '', Option3: '', Option4: '', CorrectAnswer: ''
      },
      {
        Type: 'MCQ',
        Question: 'What is the capital of France?',
        Marks: 2,
        Option1: 'London', Option2: 'Paris', Option3: 'Berlin', Option4: 'Madrid', CorrectAnswer: 'Paris'
      },
      {
        Type: 'TRUE_FALSE',
        Question: 'The Earth is flat.',
        Marks: 1,
        Option1: '', Option2: '', Option3: '', Option4: '', CorrectAnswer: 'False'
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Question_Paper_Template.xlsx");
  };

  const totalCalculatedMarks = paper.questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0);

  if (loading) {
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>,
      document.body
    );
  }

  const content = (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col h-screen overflow-hidden"
    >
      {/* Header Toolbar (Google Forms Style) */}
      <div className="flex flex-col bg-card shrink-0 border-b border-black/10 dark:border-white/10">
        {/* Top Tier: Actions */}
        <div className="h-16 flex items-center justify-between px-4">
          {/* Left side: Icon, Title, Star */}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-muted-foreground mr-1" title="Go back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`p-2 rounded-xl bg-${themeColor}-100 dark:bg-${themeColor}-500/20 ${theme.text}`}>
              <FileText className="w-6 h-6" />
            </div>
            <input 
              type="text" 
              value={paper.title || 'Untitled form'}
              onChange={e => setPaper({...paper, title: e.target.value})}
              className="ml-2 text-lg font-medium bg-transparent outline-none border-b border-transparent hover:border-black/20 focus:border-foreground transition-colors px-1 w-48 lg:w-64"
            />
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-muted-foreground">
              <Star className="w-4 h-4" />
            </button>
          </div>

          {/* Right side: Tools */}
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-muted-foreground hidden md:block" title="Undo">
              <Undo2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-muted-foreground hidden md:block" title="Redo">
              <Redo2 className="w-5 h-5" />
            </button>
            
            <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-2 hidden md:block"></div>

            <div className="relative group flex items-center">
              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-muted-foreground" title="Customize Theme">
                <Palette className="w-5 h-5" />
              </button>
              {/* Palette Dropdown on hover */}
              <div className="absolute top-full right-0 mt-2 p-3 bg-card border border-black/10 dark:border-white/10 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 flex gap-2">
                {Object.keys(themeClasses).map(color => (
                  <button 
                    key={color} 
                    onClick={() => setThemeColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${themeColor === color ? 'scale-110 shadow-md border-foreground' : 'border-transparent hover:scale-110'} ${themeClasses[color].bg}`}
                  />
                ))}
              </div>
            </div>

            <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`p-2 rounded-full transition-colors ${isPreviewMode ? theme.lightBg + ' ' + theme.text : 'hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground'}`} title="Preview">
              <Eye className="w-5 h-5" />
            </button>

            <button 
              onClick={handleSave}
              disabled={saving || isPreviewMode}
              className={`ml-2 px-6 py-2 ${theme.bg} text-white font-bold rounded-md hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2`}
              style={{ backgroundColor: themeColor === 'purple' ? '#673ab7' : undefined }} // Authentic Google Forms purple
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Publish'}
            </button>
            
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-muted-foreground ml-1" title="More">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Tier: Tabs */}
        {!isPreviewMode && (
          <div className="flex justify-center gap-8 px-6 text-sm font-medium text-muted-foreground">
            <button 
              onClick={() => setActiveTab('questions')}
              className={`pb-3 px-2 border-b-4 transition-colors ${activeTab === 'questions' ? theme.border + ' ' + theme.text : 'border-transparent hover:text-foreground'}`}
            >
              Questions
            </button>
            <button 
              onClick={() => setActiveTab('responses')}
              className={`pb-3 px-2 border-b-4 transition-colors ${activeTab === 'responses' ? theme.border + ' ' + theme.text : 'border-transparent hover:text-foreground'}`}
            >
              Responses
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`pb-3 px-2 border-b-4 transition-colors ${activeTab === 'settings' ? theme.border + ' ' + theme.text : 'border-transparent hover:text-foreground'}`}
            >
              Settings
            </button>
          </div>
        )}
      </div>
      <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleExcelUpload} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-black/5 dark:bg-black p-4 md:p-8 flex justify-center custom-scrollbar">
        <div className="flex max-w-5xl w-full gap-4 relative">
          
          <div className="flex-1 space-y-6 pb-32">
          
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`bg-card rounded-3xl border-t-[6px] ${theme.border} border-x border-b border-black/5 dark:border-white/5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`}>
                <h2 className="text-2xl font-black mb-6">Settings</h2>
                {examSubject?.examName && (
                  <div className={`bg-gradient-to-r ${theme.lightBg} border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm mb-8`}>
                    <div className="flex flex-col gap-2">
                      <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${theme.text}`}>
                        <span>{examSubject.examName}</span>
                        <span className="text-black/20 dark:text-white/20">•</span>
                        <span>{examSubject.className}</span>
                        <span className="text-black/20 dark:text-white/20">•</span>
                        <span>{examSubject.subjectName}</span>
                      </div>
                      <h2 className="text-sm font-medium text-muted-foreground">Configuration linked and synced automatically.</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="px-4 py-2 bg-background rounded-xl border border-black/5 dark:border-white/5 shadow-sm text-xs font-bold flex items-center gap-2">
                        <span className="text-muted-foreground uppercase text-[10px]">Mode:</span>
                        <span className="text-foreground">{examSubject.mode || 'OFFLINE'}</span>
                      </div>
                      <div className="px-4 py-2 bg-background rounded-xl border border-black/5 dark:border-white/5 shadow-sm text-xs font-bold flex items-center gap-2">
                        <span className="text-muted-foreground uppercase text-[10px]">Type:</span>
                        <span className="text-foreground">{(examSubject.paperType || 'SUBJECTIVE').replace('_', ' ')}</span>
                      </div>
                      <div className="px-4 py-2 bg-background rounded-xl border border-black/5 dark:border-white/5 shadow-sm text-xs font-bold flex items-center gap-2">
                        <span className="text-muted-foreground uppercase text-[10px]">Duration:</span>
                        <span className="text-foreground">{examSubject.durationMins || 120} Mins</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-6">
                    <div>
                      <h3 className="font-bold text-lg">Total Marks</h3>
                      <p className="text-sm text-muted-foreground mt-1">The calculated total marks for this paper.</p>
                    </div>
                    <div className={`text-3xl font-black ${theme.text} bg-black/5 dark:bg-white/5 px-6 py-2 rounded-2xl`}>{totalCalculatedMarks}</div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h3 className="font-bold text-lg">Import via Excel</h3>
                      <p className="text-sm text-muted-foreground mt-1">Download template and bulk import questions.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleDownloadTemplate} className="px-5 py-2.5 bg-black/5 dark:bg-white/5 text-sm font-bold rounded-xl hover:bg-black/10 transition-colors">Template</button>
                      <button onClick={() => fileInputRef.current?.click()} className={`px-5 py-2.5 ${theme.bg} text-white hover:brightness-110 transition-colors text-sm font-bold rounded-xl shadow-md`}>Import</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card rounded-3xl border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-16 flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className={`w-24 h-24 rounded-full ${theme.lightBg} flex items-center justify-center mb-6 shadow-inner`}>
                <FileText className={`w-10 h-10 ${theme.text} opacity-80`} />
              </div>
              <h2 className="text-3xl font-black mb-3">0 Responses</h2>
              <p className="text-muted-foreground text-lg max-w-sm">Waiting for responses. This examination paper is not currently active.</p>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {/* Paper Title Header */}
              <div className={`bg-card rounded-3xl border-t-[8px] ${theme.border} border-x border-b border-black/5 dark:border-white/5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`}>
                {isPreviewMode ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {examSubject?.examName && (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-muted-foreground`}>
                          {examSubject.examName}
                        </span>
                      )}
                      {examSubject?.className && (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-muted-foreground`}>
                          {examSubject.className}
                        </span>
                      )}
                      {examSubject?.subjectName && (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${theme.lightBg} ${theme.text}`}>
                          {examSubject.subjectName}
                        </span>
                      )}
                    </div>
                    
                    <h1 className="w-full text-4xl font-black mb-3 leading-tight">{paper.title || 'Untitled form'}</h1>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-6">{paper.description || 'Please read all instructions carefully before answering.'}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-black/5 dark:border-white/5 text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>{paper.questions.filter(q => q.type !== 'SECTION_HEADER').length} Questions</span>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span>{totalCalculatedMarks} Total Marks</span>
                      </div>
                      {examSubject?.durationMins && (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{examSubject.durationMins} Minutes</span>
                          </div>
                        </>
                      )}
                      {examSubject?.mode && (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${examSubject.mode === 'ONLINE' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                              {examSubject.mode}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <input 
                      type="text" 
                      value={paper.title}
                      onChange={e => setPaper({...paper, title: e.target.value})}
                      placeholder="Paper Title"
                      className="w-full text-4xl font-black bg-transparent outline-none mb-4 border-b-2 border-transparent hover:border-black/10 focus:border-black/20 dark:hover:border-white/10 dark:focus:border-white/20 pb-2 transition-colors placeholder:text-black/20 dark:placeholder:text-white/20"
                    />
                    <input 
                      type="text" 
                      value={paper.description || ''}
                      onChange={e => setPaper({...paper, description: e.target.value})}
                      placeholder="Paper description or instructions"
                      className="w-full text-base text-muted-foreground font-medium bg-transparent outline-none border-b-2 border-transparent hover:border-black/10 focus:border-black/20 dark:hover:border-white/10 dark:focus:border-white/20 pb-2 transition-colors placeholder:text-black/30 dark:placeholder:text-white/30"
                    />
                  </>
                )}
              </div>

              {/* Paper Format / Type Selector */}
              {!isPreviewMode && (
                <div className="bg-card rounded-3xl border border-black/5 dark:border-white/5 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.015)]">
                  <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 select-none">Paper Format / Type</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'MCQ', label: 'Objective (MCQ)', desc: 'Only multiple-choice, checkboxes, true/false questions.' },
                      { id: 'SUBJECTIVE', label: 'Subjective', desc: 'Written exams, essays, and short/long answers.' },
                      { id: 'MIXED', label: 'Mixed Mode', desc: 'A blended exam allowing all objective and subjective types.' }
                    ].map(t => {
                      const isSelected = paperType === t.id;
                      return (
                        <button 
                          key={t.id}
                          onClick={() => setPaperType(t.id)}
                          className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] ${
                            isSelected 
                              ? `${theme.border} bg-black/[0.015] dark:bg-white/[0.015] ring-2 ring-offset-2 dark:ring-offset-black ${theme.focusRing}` 
                              : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:bg-black/[0.005] dark:hover:bg-white/[0.005]'
                          }`}
                          type="button"
                        >
                          <div className={`text-sm font-black transition-colors ${isSelected ? theme.text : 'text-foreground'}`}>{t.label}</div>
                          <div className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">{t.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Add Bar */}
              {!isPreviewMode && (
                <div className="bg-card rounded-2xl border border-black/5 dark:border-white/5 p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">Add:</span>
                  {[
                    { label: 'MCQ', type: 'MCQ', icon: <CircleDot className="w-3.5 h-3.5" /> },
                    { label: 'Subjective', type: 'PARAGRAPH', icon: <AlignLeft className="w-3.5 h-3.5" /> },
                    { label: 'Short', type: 'SHORT_ANSWER', icon: <AlignLeft className="w-3.5 h-3.5" /> },
                    { label: 'Checkbox', type: 'CHECKBOXES', icon: <CheckSquare className="w-3.5 h-3.5" /> },
                    { label: 'True/False', type: 'TRUE_FALSE', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                    { label: 'Section', type: 'SECTION_HEADER', icon: <SplitSquareHorizontal className="w-3.5 h-3.5" /> },
                  ].filter(item => {
                    if (paperType === 'MCQ') {
                      return ['MCQ', 'CHECKBOXES', 'TRUE_FALSE', 'SECTION_HEADER'].includes(item.type);
                    }
                    if (paperType === 'SUBJECTIVE') {
                      return ['PARAGRAPH', 'SHORT_ANSWER', 'SECTION_HEADER'].includes(item.type);
                    }
                    return true;
                  }).map(item => (
                    <button 
                      key={item.type}
                      onClick={() => addQuestion(item.type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow-sm border border-transparent hover:border-black/10 dark:hover:border-white/10 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5`}
                      type="button"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

          {/* Questions List */}
          <AnimatePresence>
            {paper.questions.map((q, idx) => {
              const isSectionHeader = q.type === 'SECTION_HEADER';
              let parsedAnswers = [];
              try { parsedAnswers = JSON.parse(q.correctAnswer || '[]'); } catch(e) { parsedAnswers = []; }
              if (!Array.isArray(parsedAnswers)) parsedAnswers = [q.correctAnswer].filter(Boolean);
              const cardClass = isPreviewMode
                ? isSectionHeader
                  ? "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5 mt-6 mb-2 shadow-sm"
                  : `bg-card border border-black/8 dark:border-white/8 p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] border-l-4 ${theme.border} transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:translate-y-[-1px] duration-300`
                : "bg-card border border-black/6 dark:border-white/6 px-6 py-5 rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] relative group hover:border-black/12 dark:hover:border-white/12 transition-all";

              return (
              <motion.div 
                key={q.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.15, delay: idx * 0.02 }}
                className={cardClass}
              >
                {/* Drag Controls */}
                {!isPreviewMode && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5">
                    <button onClick={() => moveQuestion(idx, -1)} className="p-0.5 bg-card border border-black/10 dark:border-white/10 rounded hover:bg-black/5 transition-colors"><ChevronUp className="w-3 h-3" /></button>
                    <button onClick={() => moveQuestion(idx, 1)} className="p-0.5 bg-card border border-black/10 dark:border-white/10 rounded hover:bg-black/5 transition-colors"><ChevronDown className="w-3 h-3" /></button>
                  </div>
                )}

                {isPreviewMode ? (
                  <div className="space-y-4">
                    {/* Header: Title + Marks */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 items-start flex-1">
                        {!isSectionHeader && (
                          <span className={`${theme.text} font-black text-base mt-0.5 shrink-0 select-none`}>
                            {idx + 1}.
                          </span>
                        )}
                        <div className={`whitespace-pre-wrap leading-relaxed ${isSectionHeader ? 'text-2xl font-black text-foreground' : 'text-base font-semibold text-foreground'} ${q.isRequired ? "after:content-['*'] after:text-red-500 after:ml-0.5" : ''}`}>
                          {q.text}
                        </div>
                      </div>
                      {!isSectionHeader && q.marks > 0 && (
                        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl ${theme.lightBg} ${theme.text} border border-${themeColor}-500/10 shadow-sm shrink-0 select-none`}>
                          <Award className="w-3.5 h-3.5" />
                          <span>{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Optional Image */}
                    {q.imageUrl && (
                      <div className="mt-3">
                        <img src={q.imageUrl} alt="Question Graphic" className="max-w-md w-full h-auto rounded-2xl border border-black/10 shadow-sm" />
                      </div>
                    )}
                    
                    {/* Interactive Answer Input */}
                    <div className={`mt-3 ${!isSectionHeader ? 'pl-0' : ''}`}>
                      {/* Short Answer / Paragraph / Subjective */}
                      {(q.type === 'SHORT_ANSWER' || q.type === 'PARAGRAPH' || q.type === 'SUBJECTIVE') && !isSectionHeader && (
                        <div className="w-full max-w-3xl space-y-2">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Your Response</div>
                          {q.type === 'SHORT_ANSWER' ? (
                            <input 
                              type="text" 
                              placeholder="Type your answer here..." 
                              className={`w-full bg-black/[0.015] dark:bg-white/[0.015] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-${themeColor}-500 focus:ring-2 focus:ring-${themeColor}-500/10 transition-all font-medium focus:bg-background`}
                              value={previewAnswers[q.id]?.[0] || ''}
                              onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [q.id]: [e.target.value] }))}
                            />
                          ) : (
                            <div>
                              <textarea 
                                placeholder="Type your detailed explanation or answer here..." 
                                rows={5} 
                                className={`w-full bg-black/[0.015] dark:bg-white/[0.015] border border-black/10 dark:border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-${themeColor}-500 focus:ring-2 focus:ring-${themeColor}-500/10 transition-all font-medium resize-none focus:bg-background`}
                                value={previewAnswers[q.id]?.[0] || ''}
                                onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [q.id]: [e.target.value] }))}
                              />
                              <div className="flex justify-end text-[10px] text-muted-foreground font-bold mt-1 px-1">
                                {((previewAnswers[q.id]?.[0] || '').length)} characters
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* MCQ & Checkboxes */}
                      {(q.type === 'MCQ' || q.type === 'CHECKBOXES') && (
                        <div className="space-y-2">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Select Answer</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
                            {q.options.map((opt, oIdx) => {
                              const isMCQ = q.type === 'MCQ';
                              const currentSel = previewAnswers[q.id] || [];
                              const isSelected = currentSel.includes(opt);
                              const letter = String.fromCharCode(65 + oIdx);
                              const badgeShape = isMCQ ? 'rounded-full' : 'rounded-lg';
                              
                              return (
                                <div 
                                  key={oIdx} 
                                  onClick={() => handlePreviewAnswerSelect(q.id, opt, !isMCQ)}
                                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                                    isSelected 
                                      ? `border-${themeColor}-500 bg-${themeColor}-500/[0.03] dark:bg-${themeColor}-500/10 shadow-sm scale-[1.01]` 
                                      : 'border-black/5 dark:border-white/5 hover:border-black/12 dark:hover:border-white/12 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]'
                                  }`}
                                >
                                  <div className={`w-6 h-6 flex items-center justify-center shrink-0 border-2 transition-all font-bold text-xs ${
                                    isSelected 
                                      ? `border-${themeColor}-500 bg-${themeColor}-500 text-white` 
                                      : 'border-black/15 dark:border-white/15 text-muted-foreground bg-black/5 dark:bg-white/5'
                                  } ${badgeShape}`}>
                                    {isSelected ? (
                                      isMCQ ? <div className="w-1.5 h-1.5 bg-white rounded-full" /> : <Check className="w-3.5 h-3.5 text-white font-black" />
                                    ) : letter}
                                  </div>
                                  <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Dropdown */}
                      {q.type === 'DROPDOWN' && (
                        <div className="w-full sm:w-1/2 space-y-2">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Option</div>
                          <select 
                            className={`w-full px-4 py-3 bg-black/[0.015] dark:bg-white/[0.015] rounded-xl border border-black/10 dark:border-white/10 outline-none text-sm font-semibold transition-all focus:border-${themeColor}-500 focus:ring-2 focus:ring-${themeColor}-500/10 focus:bg-background`}
                            value={previewAnswers[q.id]?.[0] || ''}
                            onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [q.id]: [e.target.value] }))}
                          >
                            <option value="" className="bg-background">Choose Option</option>
                            {q.options.map((opt, oIdx) => <option key={oIdx} value={opt} className="bg-background">{opt}</option>)}
                          </select>
                        </div>
                      )}

                      {/* True / False */}
                      {q.type === 'TRUE_FALSE' && (
                        <div className="space-y-2">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Answer</div>
                          <div className="flex gap-3">
                            {['True', 'False'].map(opt => {
                              const isSelected = previewAnswers[q.id]?.[0] === opt;
                              return (
                                <button 
                                  key={opt} 
                                  onClick={() => handlePreviewAnswerSelect(q.id, opt)} 
                                  className={`px-8 py-3 rounded-xl text-sm font-black border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                    isSelected 
                                      ? `bg-${themeColor}-500 text-white border-transparent shadow-md scale-102` 
                                      : 'border-black/10 dark:border-white/10 hover:border-black/25 text-muted-foreground bg-black/[0.01] dark:bg-white/[0.01]'
                                  }`}
                                  type="button"
                                >
                                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Linear Scale */}
                      {q.type === 'LINEAR_SCALE' && (
                        <div className="space-y-3">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rate (Linear Scale)</div>
                          <div className="relative flex items-center gap-3 max-w-sm">
                            <div className="absolute left-4 right-4 h-0.5 bg-black/5 dark:bg-white/5 -z-10"></div>
                            {[1, 2, 3, 4, 5].map(val => {
                              const isSelected = previewAnswers[q.id]?.[0] === val.toString();
                              return (
                                <button 
                                  key={val} 
                                  onClick={() => handlePreviewAnswerSelect(q.id, val.toString())} 
                                  className={`w-10 h-10 rounded-full text-sm font-bold border transition-all flex items-center justify-center cursor-pointer ${
                                    isSelected 
                                      ? `bg-${themeColor}-500 text-white border-transparent shadow-md scale-110` 
                                      : 'border-black/10 dark:border-white/10 hover:border-black/25 text-muted-foreground bg-card'
                                  }`}
                                  type="button"
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header: # + Type + Marks */}
                    {!isSectionHeader && (
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                          <div className={`w-8 h-8 rounded-xl ${theme.lightBg} ${theme.text} flex items-center justify-center text-xs font-black shrink-0`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CustomDropdown 
                              value={q.type} 
                              onChange={(t) => updateQuestion(idx, 'type', t)} 
                              theme={theme} 
                              paperType={paperType}
                            />
                          </div>
                        </div>
                        
                        {/* Premium Stepper for Marks */}
                        <div className="flex items-center h-10 rounded-xl border border-black/8 dark:border-white/8 bg-black/[0.015] dark:bg-white/[0.015] shrink-0 overflow-hidden shadow-sm hover:border-black/15 transition-all">
                          <button 
                            onClick={() => updateQuestion(idx, 'marks', Math.max(0, (parseInt(q.marks) || 0) - 1))}
                            className="px-3 hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors h-full flex items-center justify-center border-r border-black/8 dark:border-white/8"
                            type="button"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <input 
                            type="number" 
                            value={q.marks} 
                            onChange={e => updateQuestion(idx, 'marks', Math.max(0, parseInt(e.target.value) || 0))} 
                            className={`w-10 bg-transparent text-center text-sm font-black outline-none h-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${theme.text}`} 
                            min={0} 
                          />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pr-3 select-none h-full flex items-center border-r border-black/8 dark:border-white/8">M</span>
                          <button 
                            onClick={() => updateQuestion(idx, 'marks', (parseInt(q.marks) || 0) + 1)}
                            className="px-3 hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors h-full flex items-center justify-center"
                            type="button"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Question Text */}
                    <div className="space-y-2">
                      <textarea 
                        value={q.text} 
                        onChange={e => updateQuestion(idx, 'text', e.target.value)} 
                        placeholder={isSectionHeader ? 'Section Title' : 'Enter your question here...'} 
                        className={`w-full bg-transparent border-b border-black/10 dark:border-white/10 focus:border-black/25 dark:focus:border-white/25 px-1 py-2 outline-none resize-none transition-colors ${isSectionHeader ? 'text-xl font-black' : 'text-sm font-medium'}`} 
                        rows={1} 
                      />
                      {q.imageUrl && (
                        <div className="relative inline-block mt-3 group/img">
                          <img src={q.imageUrl} alt="" className="max-w-[240px] h-auto rounded-xl border border-black/10 shadow-sm" />
                          <button 
                            onClick={() => updateQuestion(idx, 'imageUrl', '')} 
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover/img:opacity-100 transition-opacity"
                            type="button"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    <div className="mt-4 space-y-1">
                      {(q.type === 'SHORT_ANSWER' || q.type === 'PARAGRAPH' || q.type === 'SUBJECTIVE') && !isSectionHeader && (
                        <div className={`border-b border-dotted border-black/15 dark:border-white/15 pb-2 text-muted-foreground text-xs font-semibold ${q.type === 'SHORT_ANSWER' ? 'w-1/3' : 'w-2/3'}`}>
                          {q.type === 'SHORT_ANSWER' ? 'Short answer placeholder text' : 'Long answer placeholder text'}
                        </div>
                      )}

                      {(q.type === 'MCQ' || q.type === 'CHECKBOXES') && (
                        <div className="space-y-1">
                          {q.options.map((opt, oIdx) => {
                            const isChecked = q.type === 'MCQ' ? q.correctAnswer === opt : parsedAnswers.includes(opt);
                            const letter = String.fromCharCode(65 + oIdx);
                            const isMCQ = q.type === 'MCQ';
                            const badgeShape = isMCQ ? 'rounded-full' : 'rounded-lg';
                            
                            return (
                              <div key={oIdx} className="flex items-center gap-3 group/opt py-1.5 px-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all -mx-3">
                                <button 
                                  onClick={() => {
                                    if (isMCQ) {
                                      updateQuestion(idx, 'correctAnswer', q.correctAnswer === opt ? '' : opt);
                                    } else {
                                      toggleCheckboxAnswer(idx, opt);
                                    }
                                  }}
                                  className={`w-6 h-6 ${badgeShape} text-[10px] font-black flex items-center justify-center shrink-0 transition-all ${
                                    isChecked 
                                      ? `${theme.bg} text-white shadow-sm scale-105` 
                                      : 'bg-black/[0.05] dark:bg-white/[0.05] text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10'
                                  }`}
                                  title={isChecked ? "Click to unmark as correct answer" : "Click to mark as correct answer"}
                                  type="button"
                                >
                                  {isChecked ? <Check className="w-3 h-3" /> : letter}
                                </button>
                                
                                <input 
                                  type="text" 
                                  value={opt} 
                                  onChange={e => updateOption(idx, oIdx, e.target.value)} 
                                  placeholder={`Option ${oIdx + 1}`} 
                                  className="flex-1 bg-transparent py-1 outline-none transition-colors text-sm font-medium border-b border-transparent hover:border-black/10 focus:border-black/25 dark:hover:border-white/10 dark:focus:border-white/25" 
                                />
                                
                                <button 
                                  onClick={() => removeOption(idx, oIdx)} 
                                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg opacity-0 group-hover/opt:opacity-100 transition-all"
                                  title="Delete option"
                                  type="button"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )
                          })}
                          
                          <button 
                            onClick={() => addOption(idx)} 
                            className={`mt-2 text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 text-muted-foreground hover:text-foreground bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.04]`}
                            type="button"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add option
                          </button>
                        </div>
                      )}

                      {q.type === 'DROPDOWN' && (
                        <div className="space-y-1">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = q.correctAnswer === opt;
                            return (
                              <div key={oIdx} className="flex items-center gap-3 group/opt py-1.5 px-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all -mx-3">
                                <button 
                                  onClick={() => updateQuestion(idx, 'correctAnswer', q.correctAnswer === opt ? '' : opt)}
                                  className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 transition-all ${
                                    isCorrect 
                                      ? `${theme.bg} text-white shadow-sm scale-105` 
                                      : 'bg-black/[0.05] dark:bg-white/[0.05] text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10'
                                  }`}
                                  title={isCorrect ? "Click to unmark as correct answer" : "Click to mark as correct answer"}
                                  type="button"
                                >
                                  {isCorrect ? <Check className="w-3 h-3" /> : (oIdx + 1)}
                                </button>
                                
                                <input 
                                  type="text" 
                                  value={opt} 
                                  onChange={e => updateOption(idx, oIdx, e.target.value)} 
                                  placeholder={`Option ${oIdx + 1}`} 
                                  className="flex-1 bg-transparent py-1 outline-none transition-colors text-sm font-medium border-b border-transparent hover:border-black/10 focus:border-black/25 dark:hover:border-white/10 dark:focus:border-white/25" 
                                />
                                
                                <button 
                                  onClick={() => removeOption(idx, oIdx)} 
                                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg opacity-0 group-hover/opt:opacity-100 transition-all"
                                  title="Delete option"
                                  type="button"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )
                          })}
                          
                          <button 
                            onClick={() => addOption(idx)} 
                            className={`mt-2 text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 text-muted-foreground hover:text-foreground bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.04]`}
                            type="button"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add option
                          </button>
                        </div>
                      )}

                      {q.type === 'TRUE_FALSE' && (
                        <div className="flex gap-3 py-2">
                          {['True', 'False'].map(opt => {
                            const isSelected = q.correctAnswer === opt;
                            return (
                              <button 
                                key={opt} 
                                onClick={() => updateQuestion(idx, 'correctAnswer', q.correctAnswer === opt ? '' : opt)} 
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                  isSelected 
                                    ? `${theme.bg} text-white border-transparent shadow-sm scale-102` 
                                    : 'border-black/10 dark:border-white/10 hover:border-black/20 text-muted-foreground bg-black/[0.02] dark:bg-white/[0.02]'
                                }`}
                                type="button"
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'LINEAR_SCALE' && (
                        <div className="flex items-center gap-3 py-2">
                          {[1,2,3,4,5].map(val => {
                            const isSelected = q.correctAnswer === val.toString();
                            return (
                              <button 
                                key={val} 
                                onClick={() => updateQuestion(idx, 'correctAnswer', q.correctAnswer === val.toString() ? '' : val.toString())} 
                                className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all flex items-center justify-center ${
                                  isSelected 
                                    ? `${theme.bg} text-white border-transparent shadow-sm scale-105` 
                                    : 'border-black/10 dark:border-white/10 hover:border-black/20 text-muted-foreground bg-black/[0.02] dark:bg-white/[0.02]'
                                }`}
                                type="button"
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Footer Controls */}
                    <div className="flex items-center justify-end gap-1 pt-4 mt-4 border-t border-black/5 dark:border-white/5">
                      <button onClick={() => handleAddImage(idx)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all" title="Add Image" type="button"><ImageIcon className="w-4 h-4" /></button>
                      <button onClick={() => duplicateQuestion(idx)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all" title="Duplicate Question" type="button"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => removeQuestion(idx)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all" title="Delete Question" type="button"><Trash2 className="w-4 h-4" /></button>
                      
                      <div className="h-5 w-px bg-black/[0.08] dark:bg-white/[0.08] mx-2"></div>
                      
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-muted-foreground select-none">
                        Required
                        <div className="relative inline-flex items-center h-4 w-8">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={q.isRequired || false} 
                            onChange={e => updateQuestion(idx, 'isRequired', e.target.checked)} 
                          />
                          <div className={`w-8 h-4.5 rounded-full transition-colors relative ${q.isRequired ? theme.bg : 'bg-black/15 dark:bg-white/15'}`}>
                            <div className={`absolute top-[2.5px] left-[2px] bg-white rounded-full h-3 w-3 transition-transform ${q.isRequired ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
              );
            })}
          </AnimatePresence>
          
          {isPreviewMode && (
            <div className={`mt-8 p-5 rounded-2xl bg-${themeColor}-500/10 border border-${themeColor}-500/20 text-center flex flex-col sm:flex-row items-center justify-between gap-4 w-full shadow-sm`}>
              <div className="flex items-center gap-3 text-sm text-left">
                <div className={`w-3 h-3 rounded-full bg-${themeColor}-500 animate-ping shrink-0`} />
                <span className="text-muted-foreground font-medium">
                  You are viewing the <span className={`font-black ${theme.text}`}>Interactive Student Mockup</span>. Student answer entry is simulated.
                </span>
              </div>
              <button 
                onClick={() => setIsPreviewMode(false)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black ${theme.bg} text-white hover:brightness-110 shadow-md transition-all cursor-pointer shrink-0`}
                type="button"
              >
                Return to Editor
              </button>
            </div>
          )}
            </div>
          )}
        </div>

        {/* Vertical Floating Toolbar (Google Forms Style) */}
        {!isPreviewMode && activeTab === 'questions' && (
          <div className="hidden md:flex flex-col shrink-0 mt-32 w-14">
            <div className="sticky top-24 bg-card border border-black/5 dark:border-white/5 rounded-3xl flex flex-col items-center py-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] z-10 gap-1">
              <button onClick={() => addQuestion(paperType === 'SUBJECTIVE' ? 'PARAGRAPH' : 'MCQ')} className={`p-3 text-muted-foreground hover:${theme.text} hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all`} title="Add question">
                <Plus className="w-5 h-5" />
              </button>
              <button onClick={() => fileInputRef.current?.click()} className={`p-3 text-muted-foreground hover:${theme.text} hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all`} title="Import questions">
                <Upload className="w-5 h-5" />
              </button>
              <button onClick={() => addQuestion('PARAGRAPH')} className={`p-3 text-muted-foreground hover:${theme.text} hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all`} title="Add title and description">
                <Type className="w-5 h-5" />
              </button>
              <button onClick={() => handleAddImage(paper.questions.length - 1 >= 0 ? paper.questions.length - 1 : 0)} className={`p-3 text-muted-foreground hover:${theme.text} hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all`} title="Add image">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button onClick={() => addQuestion('SECTION_HEADER')} className={`p-3 text-muted-foreground hover:${theme.text} hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all`} title="Add section">
                <SplitSquareHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
      </div>
    </motion.div>
  );

  return createPortal(content, document.body);
};

export default QuestionPaperBuilder;
