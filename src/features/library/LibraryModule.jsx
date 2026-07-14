import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, X, Search, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const apiBase = 'http://localhost:1422/api';

export default function LibraryModule() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', quantity: 1, available: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiBase}/library/books`);
      if (res.ok) setBooks(await res.json());
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
      const payload = { ...form, quantity: parseInt(form.quantity), available: parseInt(form.quantity) };
      const res = await fetch(`${apiBase}/library/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse font-medium">Loading Library...</div>;

  return (
    <div className="space-y-8 h-full overflow-auto pb-20 w-full text-left px-2">
      <div className="w-full text-left flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-red-500 text-left inline-block">Library Management</h1>
          <p className="text-muted-foreground mt-2 text-lg text-left">Manage book inventory, categories, and student issues.</p>
        </div>
        <button onClick={() => {
          setForm({ title: '', author: '', isbn: '', category: '', quantity: 1, available: 1 });
          setModalOpen(true);
        }} className="bg-gradient-to-r from-rose-500 to-red-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]">
          <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Add Book
        </button>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-black/5 dark:border-white/5 premium-shadow">
        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search books by title or author..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-rose-500/50 font-bold transition-all"
          />
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-black/5 dark:bg-white/5">
            No books found. Add some books to the library.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map(book => (
              <div key={book.id} className="p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors group flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-black text-foreground">{book.title}</h4>
                  <p className="text-muted-foreground font-medium text-sm mt-1">By {book.author}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{book.category}</span>
                    {book.isbn && <span className="bg-black/10 dark:bg-white/10 text-muted-foreground px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">ISBN: {book.isbn}</span>}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground">Available: <span className={`text-sm ${book.available > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{book.available}</span> / {book.quantity}</span>
                  <button className="text-rose-500 font-bold text-sm hover:underline">Issue Book</button>
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
                <div><h2 className="text-2xl font-bold text-foreground">Add New Book</h2></div>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-black/10 transition-colors text-muted-foreground"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Book Title *</label>
                  <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500/50 font-bold" />
                </div>
                <div className="group">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Author *</label>
                  <input required type="text" value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500/50 font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Category *</label>
                    <input required type="text" placeholder="e.g. Science" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500/50 font-bold" />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Quantity *</label>
                    <input required type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500/50 font-bold" />
                  </div>
                </div>
                <div className="pt-6 mt-8 flex justify-end gap-4"><button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-2xl font-bold hover:scale-105 transition-all">Save Book</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
