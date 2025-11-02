import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * TimeInput Component
 * A custom time input that handles HH:MM format with intelligent behavior
 * 
 * Features:
 * - Click to edit mode with cursor positioning
 * - Smart backspace handling (preserves colon)
 * - Numeric input only
 * - Auto-formatting (e.g., "6" -> "06:00", "2030" -> "20:30")
 * - Validates on blur/enter
 * - Revert to original value if invalid or empty
 */
const TimeInput = ({ 
    value, 
    onChange, 
    onValidationError,
    validator,
    icon: Icon,
    sx = {} 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef(null);
    const originalValueRef = useRef(value);

    // Format time for display
    const formatTime = (time) => {
        if (typeof time === 'number') {
            return `${time.toString().padStart(2, '0')}:00`;
        }
        return time;
    };

    // Parse time string to get components
    const parseTime = (timeStr) => {
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            return {
                hours: parseInt(parts[0], 10) || 0,
                minutes: parseInt(parts[1], 10) || 0
            };
        }
        return { hours: 0, minutes: 0 };
    };

    // Handle entering edit mode
    const handleClick = (e) => {
        const displayText = formatTime(value);
        setInputValue(displayText);
        originalValueRef.current = value;
        setIsEditing(true);
        
        // Calculate cursor position based on click
        setTimeout(() => {
            if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const charWidth = rect.width / displayText.length;
                const position = Math.min(
                    Math.max(0, Math.round(clickX / charWidth)),
                    displayText.length
                );
                setCursorPosition(position);
                inputRef.current.setSelectionRange(position, position);
            }
        }, 0);
    };

    // Handle key input
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
            return;
        }

        if (e.key === 'Escape') {
            setIsEditing(false);
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            handleBackspace();
            return;
        }

        if (e.key === 'Delete') {
            e.preventDefault();
            handleDelete();
            return;
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            // Allow arrow key navigation
            return;
        }

        // Only allow numeric input
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        handleNumericInput(e.key);
    };

    // Handle backspace with colon preservation
    const handleBackspace = () => {
        const pos = inputRef.current?.selectionStart || 0;
        if (pos === 0) return;

        let newValue = inputValue;
        let newPos = pos;

        if (inputValue[pos - 1] === ':') {
            // Skip the colon, delete the character before it
            if (pos > 1) {
                newValue = inputValue.slice(0, pos - 2) + ' ' + ':' + inputValue.slice(pos);
                newPos = pos - 1;
            }
        } else {
            // Delete the character before cursor
            newValue = inputValue.slice(0, pos - 1) + ' ' + inputValue.slice(pos);
            newPos = pos - 1;
        }

        setInputValue(newValue);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(newPos, newPos);
                setCursorPosition(newPos);
            }
        }, 0);
    };

    // Handle delete key
    const handleDelete = () => {
        const pos = inputRef.current?.selectionStart || 0;
        if (pos >= inputValue.length) return;

        let newValue = inputValue;
        let newPos = pos;

        if (inputValue[pos] === ':') {
            // Skip the colon, delete the character after it
            if (pos < inputValue.length - 1) {
                newValue = inputValue.slice(0, pos + 1) + ' ' + inputValue.slice(pos + 2);
                newPos = pos + 1;
            }
        } else {
            // Delete the character at cursor
            newValue = inputValue.slice(0, pos) + ' ' + inputValue.slice(pos + 1);
            newPos = pos;
        }

        setInputValue(newValue);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(newPos, newPos);
                setCursorPosition(newPos);
            }
        }, 0);
    };

    // Handle numeric input
    const handleNumericInput = (digit) => {
        const start = inputRef.current?.selectionStart || 0;
        const end = inputRef.current?.selectionEnd || 0;
        let newValue = inputValue;
        let newPos = start;

        // Check if there's a selection (e.g., from double-click)
        if (start !== end) {
            // Replace the entire selection with the digit
            // Find if we need to preserve the colon
            const beforeSelection = inputValue.slice(0, start);
            const afterSelection = inputValue.slice(end);
            const hasColonInSelection = inputValue.slice(start, end).includes(':');
            
            if (hasColonInSelection) {
                // Selection includes colon - we need to be smart about this
                // Replace everything before colon with spaces, keep colon, replace after with spaces
                const colonIndex = inputValue.indexOf(':');
                if (start < colonIndex && end > colonIndex) {
                    // Selection spans across colon
                    const spacesBeforeColon = ' '.repeat(colonIndex - start);
                    const spacesAfterColon = ' '.repeat(end - colonIndex - 1);
                    newValue = beforeSelection + spacesBeforeColon + ':' + spacesAfterColon + afterSelection;
                    // Place digit in the first position
                    newValue = inputValue.slice(0, start) + digit + newValue.slice(start + 1);
                    newPos = start + 1;
                }
            } else {
                // Normal selection without colon - replace with digit and spaces
                const replacementLength = end - start;
                const replacement = digit + ' '.repeat(Math.max(0, replacementLength - 1));
                newValue = beforeSelection + replacement + afterSelection;
                newPos = start + 1;
            }
            
            // Skip over colon if we're about to hit it
            if (newValue[newPos] === ':') {
                newPos++;
            }
        } else {
            // No selection - normal single character replacement
            if (inputValue[start] === ':') {
                // Move past the colon
                newValue = inputValue.slice(0, start + 1) + digit + inputValue.slice(start + 2);
                newPos = start + 2;
            } else {
                // Replace current character or space
                newValue = inputValue.slice(0, start) + digit + inputValue.slice(start + 1);
                newPos = start + 1;
                
                // Skip over colon if we're about to hit it
                if (newValue[newPos] === ':') {
                    newPos++;
                }
            }
        }

        setInputValue(newValue);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(newPos, newPos);
                setCursorPosition(newPos);
            }
        }, 0);
    };

    // Format and validate on blur
    const handleBlur = () => {
        // Remove spaces and get just the numbers
        const cleaned = inputValue.replace(/[^\d:]/g, '');
        const numbersOnly = cleaned.replace(/:/g, '');

        if (!numbersOnly || numbersOnly.trim() === '') {
            // Empty input - revert to original
            setIsEditing(false);
            return;
        }

        // Parse the numbers and format
        let hours = 0;
        let minutes = 0;

        if (numbersOnly.length === 1) {
            hours = parseInt(numbersOnly, 10);
            minutes = 0;
        } else if (numbersOnly.length === 2) {
            hours = parseInt(numbersOnly, 10);
            minutes = 0;
        } else if (numbersOnly.length === 3) {
            hours = parseInt(numbersOnly.slice(0, 1), 10);
            minutes = parseInt(numbersOnly.slice(1), 10);
        } else {
            hours = parseInt(numbersOnly.slice(0, 2), 10);
            minutes = parseInt(numbersOnly.slice(2, 4), 10);
        }

        // Validate hours and minutes
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            // Invalid time - show error and revert
            if (onValidationError) {
                onValidationError('Nieprawidłowy format czasu. Użyj formatu 24-godzinnego (00:00 - 23:59).');
            }
            setIsEditing(false);
            return;
        }

        const formattedValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Custom validation
        if (validator) {
            const error = validator(hours, minutes);
            if (error) {
                if (onValidationError) {
                    onValidationError(error);
                }
                setIsEditing(false);
                return;
            }
        }

        // Success - update the value with formatted time string
        if (onChange) {
            onChange(formattedValue);
        }
        setIsEditing(false);
    };

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    if (!isEditing) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    ...sx
                }}
            >
                {Icon && (
                    <Icon 
                        sx={{ 
                            fontSize: 20, 
                            color: 'text.primary',
                            flexShrink: 0
                        }} 
                    />
                )}
                <Typography
                    onClick={handleClick}
                    sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'text.primary',
                        cursor: 'pointer',
                        width: 52,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        borderRadius: 1.5,
                        transition: 'all 150ms ease',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            color: 'primary.main'
                        }
                    }}
                >
                    {formatTime(value)}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                ...sx
            }}
        >
            {Icon && (
                <Icon 
                    sx={{ 
                        fontSize: 20, 
                        color: 'text.primary',
                        flexShrink: 0
                    }} 
                />
            )}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                style={{
                    width: '52px',
                    height: '28px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '4px',
                    border: '1px solid rgb(146, 0, 32)',
                    borderRadius: '6px',
                    outline: 'none',
                    backgroundColor: '#fff',
                    color: 'rgb(30, 30, 30)',
                    fontFamily: 'inherit'
                }}
            />
        </Box>
    );
};

TimeInput.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onChange: PropTypes.func.isRequired,
    onValidationError: PropTypes.func,
    validator: PropTypes.func,
    icon: PropTypes.elementType,
    sx: PropTypes.object
};

export default TimeInput;
