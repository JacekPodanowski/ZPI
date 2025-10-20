import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';

const ToastContainer = ({ toasts, removeToast, position = 'bottom-left' }) => {
  const pos = {
    'top-right':    'top-4 right-4 items-end',
    'top-left':     'top-4 left-4 items-start',
    'bottom-right': 'bottom-4 right-4 items-end',
    'bottom-left':  'bottom-4 left-4 items-start',
  }[position] || 'bottom-4 left-4 items-start';

  const body = typeof document !== 'undefined' ? document.body : null;
  const content = (
    <div className={`fixed z-50 w-full max-w-sm pointer-events-none ${pos}`}>
      <div className="flex flex-col space-y-2 pointer-events-auto">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast
              key={t.id}
              message={t.message}
              variant={t.variant}
              duration={t.duration}
              onClose={() => removeToast(t.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  return body ? createPortal(content, body) : content;
};

export default ToastContainer;
