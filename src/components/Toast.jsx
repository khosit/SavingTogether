import { createContext, useContext, useState, useCallback } from 'react';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const configs = {
    success: { gradient: 'linear-gradient(135deg,#059669,#10B981)', Icon: Check },
    error:   { gradient: 'linear-gradient(135deg,#DC2626,#EF4444)', Icon: AlertTriangle },
    info:    { gradient: 'linear-gradient(135deg,#065F46,#059669)', Icon: Info },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed top-5 z-[300] flex flex-col gap-2 pointer-events-none"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 360,
        }}
      >
        {toasts.map(toast => {
          const { gradient, Icon } = configs[toast.type] || configs.info;
          return (
            <div
              key={toast.id}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl animate-fade-up pointer-events-auto cursor-pointer"
              style={{ background: gradient, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
              onClick={() => dismiss(toast.id)}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <Icon size={14} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-white flex-1 leading-snug">{toast.message}</p>
              <X size={13} className="text-white/50 flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
