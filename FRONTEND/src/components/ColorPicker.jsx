import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

const ColorPicker = ({ label, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const [debounceTimer, setDebounceTimer] = useState(null);
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const presetColors = [
    '#c04b3e', '#f8f6f3', '#222', '#ffffff',
    '#e8d5c4', '#8b7355', '#d4a373', '#6b8e23',
  ]

  // Debounced change handler for continuous inputs (color picker, text input)
  const handleDebouncedChange = useCallback((newValue) => {
    setLocalValue(newValue);
    
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new timer - only call onChange after 300ms of no changes
    const timer = setTimeout(() => {
      onChange(newValue);
    }, 300);
    
    setDebounceTimer(timer);
  }, [onChange, debounceTimer]);
  
  // Immediate change handler for preset buttons
  const handlePresetClick = useCallback((color) => {
    // Clear any pending debounced updates
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    
    setLocalValue(color);
    onChange(color);
  }, [onChange, debounceTimer]);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={localValue}
          onChange={(e) => handleDebouncedChange(e.target.value)}
          className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={localValue}
          onChange={(e) => handleDebouncedChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
        />
      </div>
      <div className="grid grid-cols-8 gap-2 mt-3">
        {presetColors.map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePresetClick(color)}
            className="w-8 h-8 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: color,
              borderColor: localValue === color ? '#c04b3e' : '#e5e7eb',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default ColorPicker
