import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ikony zależne od wariantu (ale używane wewnątrz wersji)


const ToastVersions = {
  
1: ({ message, variant, duration, width, height, font}) => {
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
        width: width,
        height: height,
        padding: '1rem',
        fontSize: `{0.875}rem`
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
      <div className="z-10 flex-1 text-sm font-medium"
      style={{fontSize: `${font}px`}}>{message}</div>
    </motion.div>
  );
}
};

export default ToastVersions;
