import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  maxWidth = 'max-w-2xl',
  className = '',
  noPadding = false
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-card w-full ${maxWidth} rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] ${className}`}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 bg-muted/30">
                <div className="flex items-center gap-3">
                  {Icon && (
                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Body */}
            <div className={`${noPadding ? '' : 'p-6'} overflow-y-auto custom-scrollbar flex-1`}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
