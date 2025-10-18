import React from 'react'
import { motion } from 'framer-motion'
import { resolveMediaUrl } from '../../config/api'

const HeroSection = ({ config }) => {
  const { title, subtitle, bgColor, textColor, backgroundImage } = config
  const resolvedBackground = resolveMediaUrl(backgroundImage)

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Obrazek tła */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${resolvedBackground})` }}
        />
      )}
      
      {/* Zawartość */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6">{title}</h1>
        <p className="text-xl md:text-2xl opacity-80">{subtitle}</p>
      </motion.div>
    </section>
  )
}

export default HeroSection
