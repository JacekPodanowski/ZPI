// src/components/UI/Button.jsx
import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) => {
    // Warianty: 'primary', 'secondary', 'danger', 'google'
    const buttonClasses = `${styles.btn} ${styles[variant]} ${className}`;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={buttonClasses}
        >
            {children}
        </button>
    );
};

export default Button;