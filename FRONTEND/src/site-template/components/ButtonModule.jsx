import React from 'react'
import { motion } from 'framer-motion'

const ButtonModule = ({ config }) => {
  const { text, link, bgColor, textColor, layout = 'block', align = 'center' } = config

  const buttonElement = (
    <motion.a
      href={link}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block px-8 py-3 rounded-xl font-medium shadow-md transition-all"
      style={{
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {text}
    </motion.a>
  )

  if (layout === 'inline') {
    return (
      <div className="inline-block px-4">
        {buttonElement}
      </div>
    )
  }

  return (
    <div className="py-8 px-4" style={{ textAlign: align }}>
      {buttonElement}
    </div>
  )
}

export default ButtonModule
