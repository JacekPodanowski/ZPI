import React from 'react';
import ToastVersions from './ToastVersions';

const Toast = ({ message, variant = 'info', duration = 5000, version = 1, onClose }) => {
  const ToastVersion = ToastVersions[version] || ToastVersions[1];
  return <ToastVersion message={message} variant={variant} duration={duration} onClose={onClose} />;
};

export default Toast;
