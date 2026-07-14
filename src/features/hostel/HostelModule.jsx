import React, { useState, useEffect } from 'react';
import { Home, Plus, X, Users, DoorOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const apiBase = 'http://localhost:1422/api';

export default function HostelModule() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ roomNo: '', hostelName: '', roomType: 'Non-AC', capacity: '', feeAmount: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiBase}/hostel`);
      if (res.ok) setRooms(await res.json());
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
      const res = await fetch(`${apiBase}/hostel`, {
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

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse font-medium">Loading Hostel Data...</div>;

  return (
    <div className="space-y-8 h-full overflow-auto pb-20 w-full text-left px-2">
      <div className="w-full text-left flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500 text-left inline-block">Hostel Management</h1>
          <p className="text-muted-foreground mt-2 text-lg text-left">Manage hostel rooms, capacities, and resident students.</p>
        </div>
        <button onClick={() => {
          setForm({ roomNo: '', hostelName: '', roomType: 'Non-AC', capacity: '', feeAmount: '' });
          setModalOpen(true);
        }} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Add Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center p-12 glass-panel rounded-[2rem] border border-black/5 dark:border-white/5">
           <div className="bg-black/5 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Home className="w-10 h-10 text-muted-foreground" />
           </div>
           <h3 className="text-xl font-bold mb-2 text-foreground">No Rooms Configured</h3>
           <p className="text-muted-foreground">Add rooms to start managing hostel residents.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-2xl font-black text-foreground">{room.roomNo}</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{room.hostelName}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                  <DoorOpen className="w-5 h-5" />
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <span className="bg-black/5 dark:bg-white/5 px-2 py-1 rounded text-xs font-bold text-muted-foreground">{room.roomType}</span>
                <span className="bg-cyan-500/10 px-2 py-1 rounded text-xs font-bold text-cyan-500">₹{room.feeAmount}/mo</span>
              </div>

              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">Occupancy: <span className={`text-sm ${room._count?.students >= room.capacity ? 'text-red-500' : 'text-emerald-500'}`}>{room._count?.students || 0}</span> / {room.capacity}</span>
                <button className="text-cyan-500 font-bold text-sm hover:underline">View Students</button>
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
                <div><h2 className="text-2xl font-bold text-foreground">Add Hostel Room</h2></div>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-black/10 transition-colors text-muted-foreground"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Room No *</label>
                    <input required type="text" placeholder="e.g. 101" value={form.roomNo} onChange={e => setForm({...form, roomNo: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 font-bold" />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Hostel Name *</label>
                    <input required type="text" placeholder="e.g. Boys Hostel A" value={form.hostelName} onChange={e => setForm({...form, hostelName: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Room Type *</label>
                    <select required value={form.roomType} onChange={e => setForm({...form, roomType: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 font-bold appearance-none">
                      <option>Non-AC</option><option>AC</option><option>Dormitory</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Capacity *</label>
                    <input required type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 font-bold" />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Monthly Fee (₹) *</label>
                  <input required type="number" min="0" value={form.feeAmount} onChange={e => setForm({...form, feeAmount: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 font-bold" />
                </div>
                <div className="pt-6 mt-8 flex justify-end gap-4"><button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold hover:scale-105 transition-all">Save Room</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
