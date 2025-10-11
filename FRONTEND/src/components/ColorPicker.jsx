import React from 'react'
import { motion } from 'framer-motion'

const ColorPicker = ({ label, value, onChange }) => {
  const presetColors = [
    '#c04b3e', '#f8f6f3', '#222', '#ffffff',
    '#e8d5c4', '#8b7355', '#d4a373', '#6b8e23',
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
        />
      </div>
      <div className="grid grid-cols-8 gap-2 mt-3">
        {presetColors.map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(color)}
            className="w-8 h-8 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: color,
              borderColor: value === color ? '#c04b3e' : '#e5e7eb',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default ColorPicker
