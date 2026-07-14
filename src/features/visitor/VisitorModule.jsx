import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, X, Search, Clock, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const apiBase = 'http://localhost:1422/api';

export default function VisitorModule() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', whomToMeet: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiBase}/visitor`);
      if (res.ok) setLogs(await res.json());
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
      const res = await fetch(`${apiBase}/visitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async (id) => {
    try {
      await fetch(`${apiBase}/visitor/${id}/checkout`, { method: 'PUT' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLogs = logs.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.phone.includes(searchQuery));

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse font-medium">Loading Visitor Log...</div>;

  return (
    <div className="space-y-8 h-full overflow-auto pb-20 w-full text-left px-2">
      <div className="w-full text-left flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500 text-left inline-block">Visitor Management</h1>
          <p className="text-muted-foreground mt-2 text-lg text-left">Track guests, parents, and vendors at the front office.</p>
        </div>
        <button onClick={() => {
          setForm({ name: '', phone: '', purpose: '', whomToMeet: '' });
          setModalOpen(true);
        }} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Check-In Visitor
        </button>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow">
        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search visitors by name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-purple-500/50 font-bold transition-all"
          />
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-black/5 dark:bg-white/5">
            No visitor logs found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-black text-foreground">{log.name}</h4>
                      <p className="text-sm text-muted-foreground font-medium flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {log.phone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${log.status === 'In-Campus' ? 'bg-purple-500/10 text-purple-500 animate-pulse' : 'bg-black/10 dark:bg-white/10 text-muted-foreground'}`}>
                      {log.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium"><span className="text-muted-foreground">Purpose:</span> {log.purpose}</p>
                    {log.whomToMeet && <p className="text-sm font-medium"><span className="text-muted-foreground">To Meet:</span> {log.whomToMeet}</p>}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                  <div className="text-xs font-bold text-muted-foreground">
                    <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> In: {new Date(log.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    {log.checkOut && <p className="flex items-center gap-1 mt-1 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Out: {new Date(log.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                  </div>
                  
                  {log.status === 'In-Campus' && (
                    <button onClick={() => handleCheckout(log.id)} className="bg-foreground text-background px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                      Check-Out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card w-full max-w-lg rounded-[2.5rem] premium-shadow border border-white/10">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <div><h2 className="text-2xl font-bold text-foreground">Visitor Check-In</h2></div>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-black/10 transition-colors text-muted-foreground"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Visitor Name *</label>
                    <input required type="text" placeholder="e.g. John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 font-bold" />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Phone Number *</label>
                    <input required type="text" placeholder="e.g. 9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 font-bold" />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Purpose of Visit *</label>
                  <input required type="text" placeholder="e.g. Admission Inquiry" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 font-bold" />
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Whom to Meet</label>
                  <input type="text" placeholder="e.g. Principal" value={form.whomToMeet} onChange={e => setForm({...form, whomToMeet: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 font-bold" />
                </div>
                <div className="pt-6 mt-8 flex justify-end gap-4"><button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-bold hover:scale-105 transition-all">Check-In</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
