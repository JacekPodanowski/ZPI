import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useTheme from '../../theme/useTheme';


const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

const Toast = ({ message, variant = 'info', duration = 5000, onClose }) => {
  const theme = useTheme();

  const variantStyles = {
    success: { borderColor: theme.colors?.states?.success, bg: theme.colors?.bg?.surface },
    error:   { borderColor: theme.colors?.states?.critical, bg: theme.colors?.bg?.surface },
    warning: { borderColor: theme.colors?.palettes?.secondary?.[400], bg: theme.colors?.bg?.surface },
    info:    { borderColor: theme.colors?.states?.info, bg: theme.colors?.bg?.surface },
  };

   const style = variantStyles[variant] || variantStyles.info;

  const [remaining, setRemaining] = useState(duration);
  const startRef = useRef(Date.now());
  const localTimer = useRef(null);

  useEffect(() => {
    localTimer.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setRemaining((d) => Math.max(0, duration - elapsed));
    }, 100);
    return () => clearInterval(localTimer.current);
  }, [duration]);

   return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
      role="status"
      aria-live="polite"
      className="flex items-center w-full max-w-sm p-4 rounded-xl shadow-lg"
      style={{
        backgroundColor: style.bg,
        color: theme.colors?.text?.primary,
        borderLeft: `4px solid ${style.borderColor}`,
      }}
    >
      <div className="text-xl mr-3" aria-hidden="true">{icons[variant] || icons.info}</div>
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
            background: style.borderColor,
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </motion.div>
  );
};

export default Toast;
