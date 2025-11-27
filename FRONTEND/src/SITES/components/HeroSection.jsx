import React from 'react'
import { motion } from 'framer-motion'
import { resolveMediaUrl } from '../../config/api'
import { isVideoUrl } from '../../utils/mediaUtils'
import ResponsiveImage from './ResponsiveImage'

const HeroSection = ({ config, thumbnails = {} }) => {
  const { title, subtitle, bgColor, textColor, backgroundImage } = config
  const resolvedBackground = resolveMediaUrl(backgroundImage)
  const isVideo = isVideoUrl(backgroundImage)
  const hasValidBackground = resolvedBackground && resolvedBackground.trim() !== ''

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Obrazek lub wideo tła */}
      {hasValidBackground && (
        isVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute z-0 w-auto min-w-full min-h-full max-w-none"
            style={{ objectFit: 'cover', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <source src={resolvedBackground} />
          </video>
        ) : (
          <div className="absolute inset-0 opacity-30">
            <ResponsiveImage
              src={backgroundImage}
              thumbnails={thumbnails}
              alt=""
              className="w-full h-full object-cover"
              sizes="100vw"
              loading="eager"
            />
          </div>
        )
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
