import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ikony zależne od wariantu (ale używane wewnątrz wersji)


const ToastVersions = {
  1: ({ message, variant, duration, onClose }) => {
    const [remaining, setRemaining] = useState(duration);
    const startRef = useRef(Date.now());

    useEffect(() => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startRef.current;
        setRemaining(Math.max(0, duration - elapsed));
      }, 100);
      return () => clearInterval(interval);
    }, [duration]);

    const colors = {
      success: { bg: 'rgb(34,217,94)', border: 'rgb(10, 182, 54)', progress: 'rgb(34,217,94)', text: '#1e1e1e', icon: '✅' },
      error:   { bg: 'rgb(176,30,32)', border: 'rgb(144,0,22)', progress: 'rgb(176,30,32)', text: '#fff', icon: '❌'},
      warning: { bg: 'rgb(234,209,18)', border: 'rgb(190,165,0)', progress: 'rgb(234,209,18)', text: '#1e1e1e', icon: '⚠️'},
      info:    { bg: 'rgb(49,130,255)', border: 'rgb(60,120,212)', progress: 'rgb(49,130,255)', text: '#fff', icon: 'ℹ️'},
    }[variant] || colors.info;


    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
        role="status"
        aria-live="polite"
        className="relative flex items-center w-full max-w-sm p-4 rounded-xl shadow-lg"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderLeft: `12px solid ${colors.border}`,
        }}
      >
        <div className="text-xl mr-3" aria-hidden="true" style={{ color: colors.border }}>
          {colors.icon}
        </div>
        <div className="flex-1 text-sm font-medium">{message}</div>
        <button
          onClick={onClose}
          className="ml-4 p-1 rounded-full hover:opacity-80 focus:outline-none focus:ring"
          aria-label="zamknij powiadomienie"
        >
          ✕
        </button>

        <div
          aria-hidden="true"
          className="absolute left-0 right-0 bottom-0 h-1 rounded-b-xl overflow-hidden"
          style={{ background: 'transparent' }}
        >
          <div
            className="h-full"
            style={{
              width: `${(remaining / duration) * 100}%`,
              background: colors.progress,
              opacity: 0.18,
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </motion.div>
    );
  },

  2: ({ message, variant, duration, onClose }) => {
  const [remaining, setRemaining] = useState(duration);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setRemaining(Math.max(0, duration - elapsed));
    }, 100);
    return () => clearInterval(interval);
  }, [duration]);

  const colors = {
    success: { bg: '#80ff09', border: '#34d47c', progress: '#34d47c', text: '#ffffff', icon: '✓' },
    error:   { bg: '#e90f0f', border: '#c40b0e', progress: '#ff4d4f', text: '#ffffff', icon: '✖' },
    warning: { bg: '#ffee00ff', border: '#ffc107', progress: '#ffc107', text: '#ffffff', icon: '⚠' },
    info:    { bg: '#09affc', border: '#2356ff', progress: '#3399ff', text: '#ffffff', icon: 'ℹ' },
  }[variant] || {
    bg: '#09affc',
    border: '#2356ff',
    progress: '#3399ff',
    text: '#ffffff',
    icon: 'ℹ',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      role="status"
      aria-live="polite"
      className="relative flex w-full max-w-sm rounded-xl shadow-lg overflow-hidden"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      {/* LEFT BORDER ICON BAR */}
      <div
        className="flex items-center justify-center"
        style={{
          width: '56px',
          backgroundColor: colors.border,
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        {colors.icon}
      </div>

      {/* MESSAGE */}
      <div className="flex-1 p-4 text-base font-semibold">{message}</div>

      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:opacity-80 focus:outline-none focus:ring"
        aria-label="zamknij powiadomienie"
        style={{ color: colors.text }}
      >
        ✕
      </button>

      {/* PROGRESS BAR */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 bottom-0 h-1"
        style={{ background: '#0001' }}
      >
        <div
          className="h-full"
          style={{
            width: `${(remaining / duration) * 100}%`,
            background: colors.progress,
            opacity: 0.25,
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </motion.div>
  );
},
3: ({ message, variant, duration, onClose }) => {
  const [remaining, setRemaining] = useState(duration);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setRemaining(Math.max(0, duration - elapsed));
    }, 100);
    return () => clearInterval(interval);
  }, [duration]);

  const percent = (remaining / duration) * 100;

  const colors = {
    success: { bg: '#eafff0', progress: '#00b86b', text: '#003322', icon: '✓' },
    error:   { bg: '#ffeaea', progress: '#c40000', text: '#330000', icon: '✖' },
    warning: { bg: '#fff9e0', progress: '#d1a500', text: '#332900', icon: '⚠' },
    info:    { bg: '#eaf0ff', progress: '#0047b8', text: '#001133', icon: 'ℹ' },
  }[variant] || {
    bg: '#eaf0ff',
    progress: '#0047b8',
    text: '#001133',
    icon: 'ℹ',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      role="status"
      aria-live="polite"
      className="relative flex items-center w-full max-w-sm p-4 rounded-lg shadow-md overflow-hidden"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      {/* GRADIENT OVERLAY */}
      <div
        className="absolute top-0 right-0 bottom-0 z-0"
        style={{
          width: `${100 - percent}%`,
          backgroundColor: colors.progress,
          opacity: 0.1,
          transition: 'width 0.1s linear',
        }}
      />

      {/* ICON (left) */}
      <div
        className="z-10 mr-3 text-lg font-bold"
        style={{ color: colors.progress }}
        aria-hidden="true"
      >
        {colors.icon}
      </div>

      {/* MESSAGE */}
      <div className="z-10 flex-1 text-sm font-medium">{message}</div>
    </motion.div>
  );
}
};

export default ToastVersions;
