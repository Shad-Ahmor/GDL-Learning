import React, { useState, useEffect, useMemo } from 'react';
import { 
  HeartHandshake, Phone, Mail, MapPin, Users, User, Search, 
  ArrowUpDown, Filter, ChevronLeft, ChevronRight, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const apiBase = 'http://localhost:1422/api';
const ITEMS_PER_PAGE = 12;

export default function ParentModule() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Sort, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name_asc');
  const [filterOption, setFilterOption] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/parents`);
      if (res.ok) {
        setParents(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption, filterOption]);

  // Derived state: filtered and sorted parents
  const processedParents = useMemo(() => {
    let result = [...parents];

    // 1. Filter
    if (filterOption === 'with_students') {
      result = result.filter(p => p.students && p.students.length > 0);
    } else if (filterOption === 'no_students') {
      result = result.filter(p => !p.students || p.students.length === 0);
    }

    // 2. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const father = p.fatherName?.toLowerCase() || '';
        const mother = p.motherName?.toLowerCase() || '';
        const phone = p.primaryPhone || '';
        return father.includes(q) || mother.includes(q) || phone.includes(q);
      });
    }

    // 3. Sort
    result.sort((a, b) => {
      const nameA = a.fatherName || a.motherName || '';
      const nameB = b.fatherName || b.motherName || '';
      const studentsA = a.students?.length || 0;
      const studentsB = b.students?.length || 0;

      switch (sortOption) {
        case 'name_asc':
          return nameA.localeCompare(nameB);
        case 'name_desc':
          return nameB.localeCompare(nameA);
        case 'students_desc':
          return studentsB - studentsA;
        case 'students_asc':
          return studentsA - studentsB;
        default:
          return 0;
      }
    });

    return result;
  }, [parents, searchQuery, sortOption, filterOption]);

  // Pagination Logic
  const totalPages = Math.ceil(processedParents.length / ITEMS_PER_PAGE);
  const currentParents = processedParents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full overflow-auto pb-20 w-full px-2 lg:px-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500 inline-flex items-center gap-3">
            <HeartHandshake className="w-10 h-10 text-pink-500" />
            Parent Directory
          </h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Manage parent profiles and view their linked wards.</p>
        </div>
      </div>

      {/* Toolbar: Search, Sort, Filter */}
      <div className="bg-card p-4 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col md:flex-row gap-4 premium-shadow">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500/50 font-bold transition-all"
          />
        </div>

        {/* Filter */}
        <div className="relative w-full md:w-56 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center focus-within:ring-2 focus-within:ring-pink-500/50 transition-all overflow-hidden group">
          <Filter className="w-5 h-5 ml-4 text-muted-foreground group-focus-within:text-pink-500 transition-colors" />
          <select 
            value={filterOption}
            onChange={e => setFilterOption(e.target.value)}
            className="w-full bg-transparent pl-3 pr-4 py-3.5 outline-none font-bold appearance-none cursor-pointer"
          >
            <option value="all">All Parents</option>
            <option value="with_students">Has Linked Students</option>
            <option value="no_students">No Students</option>
          </select>
        </div>

        {/* Sort */}
        <div className="relative w-full md:w-56 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center focus-within:ring-2 focus-within:ring-pink-500/50 transition-all overflow-hidden group">
          <ArrowUpDown className="w-5 h-5 ml-4 text-muted-foreground group-focus-within:text-pink-500 transition-colors" />
          <select 
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="w-full bg-transparent pl-3 pr-4 py-3.5 outline-none font-bold appearance-none cursor-pointer"
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="students_desc">Most Students</option>
            <option value="students_asc">Least Students</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 items-center text-sm font-bold text-muted-foreground ml-2">
        <span>Showing {processedParents.length} parent{processedParents.length !== 1 ? 's' : ''}</span>
        {searchQuery && <span>• Filtered results</span>}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {currentParents.map(parent => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={parent.id} 
              className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-white/5 premium-shadow hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.3)] transition-all flex flex-col justify-between group overflow-hidden relative"
            >
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
              
              {/* Subtle background glow on hover */}
              <div className="absolute -inset-24 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 shrink-0">
                    <span className="text-2xl font-black">{parent.fatherName ? parent.fatherName[0] : (parent.motherName?.[0] || 'P')}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-foreground line-clamp-1">{parent.fatherName}</h4>
                    {parent.motherName && <p className="text-sm font-bold text-muted-foreground line-clamp-1">& {parent.motherName}</p>}
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-white/40 dark:bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/40 dark:border-white/5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-pink-500" />
                    </div>
                    <span className="font-bold text-sm">{parent.primaryPhone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="font-medium text-sm text-muted-foreground line-clamp-2 mt-1.5">{parent.address || 'Address not provided'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/10 relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-500" /> Wards
                  </h5>
                  <span className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xs font-bold">
                    {parent.students?.length || 0}
                  </span>
                </div>

                <div className="space-y-2">
                  {parent.students?.slice(0, 3).map(student => (
                    <div key={student.id} className="flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-blue-500 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{student.firstName} {student.lastName}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">
                          {student.class?.name || 'Unassigned'} • {student.section?.name || '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {parent.students?.length > 3 && (
                    <div className="text-center pt-2">
                      <span className="text-xs font-bold text-pink-500">+ {parent.students.length - 3} more</span>
                    </div>
                  )}
                  {(!parent.students || parent.students.length === 0) && (
                     <div className="text-sm text-muted-foreground italic text-center py-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 border-dashed">
                       No students linked yet.
                     </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {currentParents.length === 0 && (
          <div className="col-span-full text-center p-16 bg-card rounded-3xl border border-black/5 dark:border-white/5 premium-shadow">
             <div className="bg-pink-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search className="w-10 h-10 text-pink-500" />
             </div>
             <h3 className="text-2xl font-black mb-2 text-foreground">No Parents Found</h3>
             <p className="text-muted-foreground font-medium max-w-md mx-auto">
               {searchQuery ? "We couldn't find any parents matching your search criteria. Try adjusting your filters." : "There are no parents currently registered in the system."}
             </p>
             {searchQuery && (
               <button 
                 onClick={() => { setSearchQuery(''); setFilterOption('all'); }}
                 className="mt-6 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-pink-500/20"
               >
                 Clear Filters
               </button>
             )}
           </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8 pb-4">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-xl bg-card border border-black/5 dark:border-white/5 text-muted-foreground hover:bg-pink-500 hover:text-white hover:border-pink-500 disabled:opacity-50 disabled:hover:bg-card disabled:hover:text-muted-foreground disabled:hover:border-black/5 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-full px-2 py-2">
            {(() => {
              const pages = [];
              const maxVisible = 5;
              let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);

              if (endPage - startPage + 1 < maxVisible) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }

              if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push('...');
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }

              if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push('...');
                pages.push(totalPages);
              }

              return pages.map((page, idx) => (
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-muted-foreground font-black">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl font-black transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 scale-110'
                        : 'bg-card border border-black/5 dark:border-white/5 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {page}
                  </button>
                )
              ));
            })()}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl bg-card border border-black/5 dark:border-white/5 text-muted-foreground hover:bg-pink-500 hover:text-white hover:border-pink-500 disabled:opacity-50 disabled:hover:bg-card disabled:hover:text-muted-foreground disabled:hover:border-black/5 transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
