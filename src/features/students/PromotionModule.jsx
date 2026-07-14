import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, ChevronLeft, Save, ArrowRight, AlertTriangle, UserPlus, CheckCircle2, UserMinus
} from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';

const apiBase = 'http://localhost:1422/api';

export default function PromotionModule() {
  const navigate = useNavigate();
  const { activeSession } = useGlobalContext();

  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [sourceSessionId, setSourceSessionId] = useState('');
  const [sourceClassId, setSourceClassId] = useState('');
  const [sourceSectionId, setSourceSectionId] = useState('');
  
  const [targetSessionId, setTargetSessionId] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Form state maps studentId -> { action, targetClassId, targetSectionId, newRollNumber }
  const [promoState, setPromoState] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessRes, clsRes] = await Promise.all([
        fetch(`${apiBase}/setup/sessions`),
        fetch(`${apiBase}/setup/classes`)
      ]);
      const fetchedSessions = await sessRes.json();
      setSessions(fetchedSessions);
      setClasses(await clsRes.json());
      
      const active = fetchedSessions.find(s => s.isActive)?.id || '';
      setSourceSessionId(active);
      setTargetSessionId(active); // usually user will change this to next session
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (sourceClassId) {
      const cls = classes.find(c => c.id === sourceClassId);
      setSections(cls ? cls.sections : []);
    } else {
      setSections([]);
    }
  }, [sourceClassId, classes]);

  useEffect(() => {
    if (sourceSessionId && sourceClassId && sourceSectionId) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [sourceSessionId, sourceClassId, sourceSectionId]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`${apiBase}/students?sessionId=${sourceSessionId}&classId=${sourceClassId}&sectionId=${sourceSectionId}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        
        // Initialize promo state
        const initialPromoState = {};
        data.forEach(stu => {
          initialPromoState[stu.id] = {
            action: 'Promote', // default
            targetClassId: '',
            targetSectionId: '',
            newRollNumber: ''
          };
        });
        setPromoState(initialPromoState);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const updatePromoState = (stuId, field, value) => {
    setPromoState(prev => ({
      ...prev,
      [stuId]: {
        ...prev[stuId],
        [field]: value
      }
    }));
  };

  const applyBulkAction = () => {
    // Determine the next class if possible, or just apply the first student's target to all
    const keys = Object.keys(promoState);
    if (keys.length === 0) return;
    const template = promoState[keys[0]];
    if (!template.targetClassId || !template.targetSectionId) {
      alert("Please set the Target Class and Section for the first student, then click Bulk Apply to copy to all.");
      return;
    }

    const newState = { ...promoState };
    keys.forEach(k => {
      if (newState[k].action === 'Promote' || newState[k].action === 'Retain') {
        newState[k].targetClassId = template.targetClassId;
        newState[k].targetSectionId = template.targetSectionId;
      }
    });
    setPromoState(newState);
  };

  const handleSubmit = async () => {
    if (!targetSessionId) return alert('Select a Target Session');
    if (sourceSessionId === targetSessionId) {
      if (!window.confirm("Source and Target sessions are the same. Are you sure you want to promote/retain students within the same session?")) return;
    }

    const payloadStudents = students.map(stu => ({
      studentId: stu.id,
      ...promoState[stu.id]
    }));

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/students/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSessionId,
          students: payloadStudents
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Success! Processed ${data.promotedCount} students.`);
      navigate('/students');
    } catch (err) {
      console.error(err);
      alert('Error saving promotion: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 h-full overflow-auto pb-20 w-full text-left px-2">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/students')} className="p-3 rounded-2xl bg-card border border-white/5 hover:bg-white/5 transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">Promotion & Retention</h1>
          <p className="text-muted-foreground mt-2 text-lg">Migrate students to the next academic session.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Selection */}
        <div className="bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 shadow-xl">
          <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
            <Users className="w-4 h-4" /> 1. Source (Current)
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Session</label>
              <select value={sourceSessionId} onChange={e => setSourceSessionId(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value="">Select Session</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Class</label>
                <select value={sourceClassId} onChange={e => setSourceClassId(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50">
                  <option value="">Select Class</option>
                  {classes.filter(c => c.sessionId === sourceSessionId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Section</label>
                <select value={sourceSectionId} onChange={e => setSourceSectionId(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50">
                  <option value="">Select Section</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Target Selection */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-emerald-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <h4 className="font-black text-emerald-500 uppercase tracking-widest text-xs border-b border-emerald-500/20 pb-4 mb-6 flex items-center gap-2 relative z-10">
            <ArrowRight className="w-4 h-4" /> 2. Target (Next)
          </h4>
          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-emerald-500/80 uppercase tracking-wider mb-2">Target Academic Session</label>
              <select value={targetSessionId} onChange={e => setTargetSessionId(e.target.value)} className="w-full bg-card border border-emerald-500/30 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner">
                <option value="">Select Next Session</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>)}
              </select>
              <p className="text-xs text-emerald-500 mt-3 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> All selected students will be enrolled in this session.</p>
            </div>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> 3. Student Action List ({students.length})
            </h4>
            <button onClick={applyBulkAction} className="text-xs bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-bold px-4 py-2 rounded-xl transition-colors">
              Bulk Copy 1st Row Target Class/Sec to All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="pb-3 font-bold">Student</th>
                  <th className="pb-3 font-bold">Action</th>
                  <th className="pb-3 font-bold">Target Class</th>
                  <th className="pb-3 font-bold">Target Section</th>
                  <th className="pb-3 font-bold">New Roll No</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((stu, idx) => (
                  <tr key={stu.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-foreground text-sm">{stu.firstName} {stu.lastName}</div>
                      <div className="text-xs text-muted-foreground">Adm: {stu.admissionNumber}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <select 
                        value={promoState[stu.id]?.action || 'Promote'}
                        onChange={(e) => updatePromoState(stu.id, 'action', e.target.value)}
                        className={`text-sm font-bold bg-transparent border-b-2 outline-none pb-1 ${
                          promoState[stu.id]?.action === 'Promote' ? 'text-emerald-500 border-emerald-500/50' : 
                          promoState[stu.id]?.action === 'Retain' ? 'text-orange-500 border-orange-500/50' : 
                          'text-red-500 border-red-500/50'
                        }`}
                      >
                        <option value="Promote">Promote</option>
                        <option value="Retain">Retain</option>
                        <option value="Leave">Leave / Graduated</option>
                      </select>
                    </td>
                    <td className="py-4 pr-4">
                      {promoState[stu.id]?.action !== 'Leave' && (
                        <select 
                          value={promoState[stu.id]?.targetClassId || ''}
                          onChange={(e) => updatePromoState(stu.id, 'targetClassId', e.target.value)}
                          className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-xl px-3 py-2 outline-none text-sm font-medium"
                        >
                          <option value="">Class</option>
                          {classes.filter(c => c.sessionId === targetSessionId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      {promoState[stu.id]?.action !== 'Leave' && promoState[stu.id]?.targetClassId && (
                        <select 
                          value={promoState[stu.id]?.targetSectionId || ''}
                          onChange={(e) => updatePromoState(stu.id, 'targetSectionId', e.target.value)}
                          className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-xl px-3 py-2 outline-none text-sm font-medium"
                        >
                          <option value="">Section</option>
                          {classes.find(c => c.id === promoState[stu.id]?.targetClassId)?.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="py-4">
                      {promoState[stu.id]?.action !== 'Leave' && (
                        <input 
                          type="text" 
                          placeholder="Opt"
                          value={promoState[stu.id]?.newRollNumber || ''}
                          onChange={(e) => updatePromoState(stu.id, 'newRollNumber', e.target.value)}
                          className="w-20 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl px-3 py-2 outline-none text-sm font-medium"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all premium-shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : <><Save className="w-5 h-5" /> Execute Promotion</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
