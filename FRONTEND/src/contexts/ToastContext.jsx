import React, { createContext, useState, useCallback, useContext, useRef, useEffect } from 'react';
import ToastContainer from '../components/Toast/ToastContainer';

const ToastContext = createContext(null);

export const ToastProvider = ({ children, maxToasts = 5, defaultDuration = 5000, defaultVersion = 1 }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map())

  const clearTimer = (id) => {
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  };

   const removeToast = useCallback((id) => {
    clearTimer(id);
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, { variant = 'info', duration, version = defaultVersion } = {}) => {
    const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
    const dur = Number.isFinite(duration) ? duration : defaultDuration;

    setToasts((curr) => {
      const next = [...curr, { id, message, variant, duration: dur, version, createdAt: Date.now() }];
      return next.length > maxToasts ? next.slice(next.length - maxToasts) : next;
    });

    const timeoutId = setTimeout(() => removeToast(id), dur);
    timersRef.current.set(id, timeoutId);

    return id;
  }, [defaultDuration, maxToasts, removeToast, defaultVersion]);

  useEffect(() => () => {
    timersRef.current.forEach((tid) => clearTimeout(tid));
    timersRef.current.clear();
  }, []);

    const value = { addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx.addToast;
};
