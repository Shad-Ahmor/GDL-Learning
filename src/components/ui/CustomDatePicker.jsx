import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDatePicker = ({ minDate, maxDate, selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse min and max dates, converting UTC timestamp to local midnight
  const getLocalDate = (isoString) => {
    if (!isoString) return new Date();
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const min = getLocalDate(minDate);
  const max = getLocalDate(maxDate);

  // Parse the selected date string (YYYY-MM-DD)
  const getSelected = () => {
    if (!selectedDate) return null;
    const [y, m, d] = selectedDate.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  };
  const currentSelected = getSelected();

  // The month currently being viewed in the calendar
  const [viewDate, setViewDate] = useState(() => {
    return currentSelected ? new Date(currentSelected) : new Date(min);
  });

  // Whenever modal opens or dates change, ensure viewDate is valid
  useEffect(() => {
    if (currentSelected) {
      setViewDate(new Date(currentSelected));
    } else {
      setViewDate(new Date(min));
    }
  }, [selectedDate, minDate]);

  const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  
  // Get days array for rendering
  const daysInMonth = endOfMonth.getDate();
  const startingDayOfWeek = startOfMonth.getDay(); // 0 is Sunday
  
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));
  }

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newView = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    // Only go back if the end of that month is >= minDate
    const endOfNewView = new Date(newView.getFullYear(), newView.getMonth() + 1, 0);
    if (endOfNewView >= min) {
      setViewDate(newView);
    }
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newView = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    // Only go forward if the start of that month is <= maxDate
    if (newView <= max) {
      setViewDate(newView);
    }
  };

  const isDateDisabled = (d) => {
    if (!d) return true;
    // Set hours to 0 to compare just the dates
    const dTime = d.getTime();
    return dTime < min.getTime() || dTime > max.getTime();
  };

  const isSameDate = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  };

  const handleDateSelect = (d) => {
    if (isDateDisabled(d)) return;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Click outside to close (simple overlay)
  return (
    <div className="relative w-full">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 font-bold flex justify-between items-center cursor-pointer hover:border-orange-500/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-orange-500" />
          <span className={selectedDate ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedDate ? currentSelected.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Select Date'}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay to close */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 mt-2 p-4 bg-card border border-black/10 dark:border-white/10 rounded-2xl shadow-xl w-[320px] left-0 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={handlePrevMonth}
                  type="button"
                  className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-bold text-sm">
                  {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </div>
                <button 
                  onClick={handleNextMonth}
                  type="button"
                  className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                  if (!d) return <div key={i} className="aspect-square"></div>;
                  
                  const disabled = isDateDisabled(d);
                  const selected = isSameDate(d, currentSelected);
                  const today = isSameDate(d, new Date());

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDateSelect(d)}
                      className={`
                        relative aspect-square flex items-center justify-center text-xs font-bold rounded-xl transition-all
                        ${disabled ? 'text-muted-foreground/30 cursor-not-allowed' : 'hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer'}
                        ${selected ? 'bg-orange-500 text-white hover:bg-orange-600 hover:text-white shadow-md shadow-orange-500/30' : ''}
                        ${!selected && today ? 'border border-orange-500 text-orange-500' : ''}
                      `}
                    >
                      {d.getDate()}
                      {selected && (
                        <motion.div 
                          layoutId="selected-date-indicator"
                          className="absolute inset-0 bg-orange-500 rounded-xl -z-10"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                Dates strictly locked to exam term
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
