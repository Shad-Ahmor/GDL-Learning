import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, setMonth, setYear } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function AnimatedDatePicker({ value, onChange, label, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const popupRef = useRef(null);

  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    if (value) setCurrentDate(new Date(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  // Pad with empty days for first week
  const startDay = startDate.getDay();
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 80 + i);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="relative group/input hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 rounded-2xl" ref={popupRef}>
      <div 
        className={`peer w-full bg-black/5 dark:bg-white/5 border border-transparent group-focus-within:border-cyan-500/50 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-cyan-500/20 text-foreground transition-all duration-300 font-bold hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer flex items-center ${isOpen ? 'ring-4 ring-cyan-500/20 border-cyan-500/50 scale-[1.02] bg-black/10 dark:bg-white/10' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <CalendarIcon className="w-5 h-5 absolute left-4 text-muted-foreground/50 group-focus-within:text-cyan-500 transition-colors z-10" />
        <span className={selectedDate ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedDate ? format(selectedDate, 'dd MMM yyyy') : 'Select Date...'}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 p-5 bg-card/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2rem] w-80 left-0 premium-shadow"
          >
            {/* Header / Selectors */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={(e) => { e.preventDefault(); setCurrentDate(subMonths(currentDate, 1))}} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <div className="flex gap-2 font-black text-sm bg-black/5 dark:bg-white/5 p-1.5 rounded-xl">
                <select 
                  value={currentDate.getMonth()}
                  onChange={(e) => setCurrentDate(setMonth(currentDate, parseInt(e.target.value)))}
                  className="bg-transparent outline-none cursor-pointer hover:text-cyan-500 transition-colors appearance-none text-center px-1"
                >
                  {months.map((m, i) => <option key={m} value={i} className="bg-card text-foreground">{m}</option>)}
                </select>
                <span className="text-muted-foreground/50">/</span>
                <select 
                  value={currentDate.getFullYear()}
                  onChange={(e) => setCurrentDate(setYear(currentDate, parseInt(e.target.value)))}
                  className="bg-transparent outline-none cursor-pointer hover:text-cyan-500 transition-colors appearance-none text-center px-1"
                >
                  {years.map(y => <option key={y} value={y} className="bg-card text-foreground">{y}</option>)}
                </select>
              </div>

              <button onClick={(e) => { e.preventDefault(); setCurrentDate(addMonths(currentDate, 1))}} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {days.map(d => (
                <div key={d} className="text-center text-[10px] font-black text-muted-foreground uppercase">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map(d => (
                <div key={`empty-${d}`} className="h-10 w-10" />
              ))}
              {monthDays.map(day => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                return (
                  <button
                    key={day.toISOString()}
                    onClick={(e) => { e.preventDefault(); onChange(format(day, 'yyyy-MM-dd')); setIsOpen(false); }}
                    className={`h-10 w-10 mx-auto rounded-xl flex items-center justify-center text-sm font-bold transition-all
                      ${isSelected ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-110 rotate-[-5deg]' : 
                        isToday ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 
                        'text-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:scale-110'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
