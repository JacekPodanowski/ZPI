import React from 'react';
import ToastVersions from './ToastVersions';

const Toast = ({ message, variant = 'info', duration = 5000, version = 1, width = 420, height = 75, font = 16, onClose }) => {
  const ToastVersion = ToastVersions[version] || ToastVersions[1];
  return (
    <ToastVersion 
      message={message} 
      variant={variant} 
      duration={duration} 
      width={width} 
      height={height} 
      font={font} 
      onClose={onClose} 
    />
  );
};

export default Toast;
