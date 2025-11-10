import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ikony zależne od wariantu (ale używane wewnątrz wersji)


const ToastVersions = {
  
1: ({ message, variant, duration, width, height, font, onClose }) => {
  const [remaining, setRemaining] = useState(duration);
  const [isHovered, setIsHovered] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isDown, setIsDown] = useState(false);
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
      initial={{ opacity: 0, x: 0 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
        opacity: { duration: 0.3, ease: 'easeOut' }
        }
      }}
      exit={{
        opacity: 0,
        x: -100,
        transition: { duration: 0.3, ease: 'easeIn' }
      }}
      role="status"
      aria-live="polite"
      className="relative flex items-center w-full max-w-sm p-4 rounded-lg shadow-md overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: 'Segode UI, sans-serif',
        width: width,
        height: height,
        padding: '1rem',
        fontSize: `{0.875}rem`,
        boxShadow: isHovered && !isCloseHovered 
          ? `0 4px 12px ${colors.progress}20, 0 0 0 1px ${colors.progress}10`
          : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsCloseHovered(false);
        setIsDown(false);
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
      <div 
        className="z-10 flex-1 text-sm font-medium"
        style={{
          fontSize: `${font}px`,
          paddingRight: isHovered ? '5%' : '0',
          transition: 'padding-right 0.2s ease'
        }}
      >
        {message}
      </div>

      {/* CLOSE BUTTON (visible on hover) */}
      {isHovered && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => {
            setIsCloseHovered(false);
            setIsDown(false);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDown(true);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            setIsDown(false);
          }}
          className="z-20 absolute right-0 top-0 bottom-0 flex items-center justify-center cursor-pointer border-none transition-all duration-150"
          style={{
            width: '5%',
            minWidth: '30px',
            color: colors.progress,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            backgroundColor: isDown 
              ? `${colors.progress}40`  // 40% opacity gdy naciśnięty
              : isCloseHovered
              ? `${colors.progress}25`  // 25% opacity przy hover nad X
              : `${colors.progress}10`, // 10% opacity domyślnie
            transform: isDown ? 'scale(0.95)' : 'scale(1)',
          }}
          aria-label="Close notification"
        >
          ×
        </motion.button>
      )}
    </motion.div>
  );
}
};

export default ToastVersions;
