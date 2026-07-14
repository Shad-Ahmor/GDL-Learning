import React, { useState, useEffect } from 'react';
import { Bus, Plus, X, Users, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const apiBase = 'http://localhost:1422/api';

export default function TransportModule() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', vehicleNo: '', driverName: '', driverPhone: '', feeAmount: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiBase}/transport`);
      if (res.ok) setRoutes(await res.json());
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
      const res = await fetch(`${apiBase}/transport`, {
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

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse font-medium">Loading Transport...</div>;

  return (
    <div className="space-y-8 h-full overflow-auto pb-20 w-full text-left px-2">
      <div className="w-full text-left flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-500 text-left inline-block">Transport Management</h1>
          <p className="text-muted-foreground mt-2 text-lg text-left">Manage bus routes, drivers, and assigned students.</p>
        </div>
        <button onClick={() => {
          setForm({ name: '', vehicleNo: '', driverName: '', driverPhone: '', feeAmount: '' });
          setModalOpen(true);
        }} className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]">
          <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Add Route
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="text-center p-12 glass-panel rounded-[2rem] border border-black/5 dark:border-white/5">
           <div className="bg-black/5 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Bus className="w-10 h-10 text-muted-foreground" />
           </div>
           <h3 className="text-xl font-bold mb-2 text-foreground">No Routes Configured</h3>
           <p className="text-muted-foreground">Create your first transport route to assign students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map(route => (
            <div key={route.id} className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow group hover:-translate-y-1 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-foreground">{route.name}</h4>
                    <p className="text-sm font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded inline-block mt-1 uppercase tracking-wider">{route.vehicleNo}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-4 text-sm text-muted-foreground font-medium">
                <p>Driver: <span className="text-foreground">{route.driverName || 'Not Assigned'}</span></p>
                <p>Phone: <span className="text-foreground">{route.driverPhone || 'N/A'}</span></p>
                <p>Monthly Fee: <span className="text-foreground font-bold text-yellow-500">₹{route.feeAmount}</span></p>
              </div>
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Users className="w-4 h-4 text-yellow-500" /> {route._count?.students || 0} Students
                </span>
                <button className="text-yellow-500 font-bold text-sm hover:underline">View List</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card w-full max-w-lg rounded-[2.5rem] premium-shadow border border-white/10">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <div><h2 className="text-2xl font-bold text-foreground">Add Transport Route</h2></div>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-black/10 transition-colors text-muted-foreground"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Route Name *</label>
                    <input required type="text" placeholder="e.g. Route 1" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/50 font-bold" />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Vehicle Number *</label>
                    <input required type="text" placeholder="e.g. MH12 AB 1234" value={form.vehicleNo} onChange={e => setForm({...form, vehicleNo: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/50 font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Driver Name</label>
                    <input type="text" value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/50 font-bold" />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Driver Phone</label>
                    <input type="text" value={form.driverPhone} onChange={e => setForm({...form, driverPhone: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/50 font-bold" />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Monthly Fee (₹) *</label>
                  <input required type="number" min="0" value={form.feeAmount} onChange={e => setForm({...form, feeAmount: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/50 font-bold" />
                </div>
                <div className="pt-6 mt-8 flex justify-end gap-4"><button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-2xl font-bold hover:scale-105 transition-all">Save Route</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
