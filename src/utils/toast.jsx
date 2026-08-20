import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-[#161622]/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] px-4 py-3 flex items-center gap-3 min-w-[260px] max-w-[380px] pointer-events-auto text-white animate-fadeInUp"
          >
            {toast.type === 'success' ? (
              <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
            ) : toast.type === 'error' ? (
              <XCircle size={18} className="text-red-400 flex-shrink-0" />
            ) : (
              <Info size={18} className="text-[var(--primary-color)] flex-shrink-0" />
            )}
            <p className="flex-1 text-xs font-semibold leading-tight">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default ToastProvider;
