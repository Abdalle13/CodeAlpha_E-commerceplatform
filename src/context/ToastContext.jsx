import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div 
        className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto flex items-start justify-between p-4 rounded-sm shadow-card border text-sm',
                t.type === 'success' && 'bg-white border-status-success/30 text-charcoal',
                t.type === 'error' && 'bg-white border-status-error/30 text-charcoal',
                t.type === 'warning' && 'bg-white border-status-warning/30 text-charcoal',
                t.type === 'info' && 'bg-white border-soft-beige text-charcoal'
              )}
            >
              <div className="flex items-start space-x-3">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />}
                {t.type === 'error' && <AlertCircle className="w-5 h-5 text-status-error shrink-0 mt-0.5" />}
                {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-muted-olive shrink-0 mt-0.5" />}
                <p className="text-xs sm:text-sm font-medium leading-snug">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="ml-3 text-muted-text hover:text-charcoal transition-colors p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

