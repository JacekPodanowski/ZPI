import React from 'react'
import { motion } from 'framer-motion'
import { resolveMediaUrl } from '../../config/api'
import { isVideoUrl } from '../../utils/mediaUtils'

const AboutSection = ({ config }) => {
  const { title, description, imageUrl, avatar, bgColor } = config

  return (
    <section className="py-20 px-4" style={{ backgroundColor: bgColor || 'rgb(228, 229, 218)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'rgb(30, 30, 30)' }}>
              {title}
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: 'rgb(30, 30, 30)' }}>
              {description}
            </p>
          </div>
          
          {/* Obrazek lub wideo albo placeholder */}
          <div className="rounded-xl h-96 overflow-hidden shadow-lg bg-black">
            {(imageUrl || avatar) ? (
              isVideoUrl(imageUrl || avatar) ? (
                <video
                  src={resolveMediaUrl(imageUrl || avatar)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={resolveMediaUrl(imageUrl || avatar)} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, rgb(146, 0, 32) 0%, rgb(200, 50, 80) 100%)' 
                }}
              >
                <span className="text-8xl text-white">👤</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
