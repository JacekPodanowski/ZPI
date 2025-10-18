import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveMediaUrl } from '../../config/api'

const GalleryModule = ({ config }) => {
  const { images = [], columns = 3, gap = '1rem', style = 'grid' } = config
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef(null)

  // Auto-play dla slideshow i fade
  useEffect(() => {
    if ((style === 'slideshow' || style === 'fade') && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [style, images.length])

  if (!images || images.length === 0) {
    return (
      <div className="py-12 px-4 text-center" style={{ color: 'rgba(30, 30, 30, 0.5)' }}>
        <div className="max-w-4xl mx-auto">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">Galeria - dodaj zdjęcia w konfiguratorze</p>
        </div>
      </div>
    )
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const scrollToImage = (direction) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollAmount = 336 // 320px (width) + 16px (gap)
    
    if (direction === 'next') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  // Grid Layout
  if (style === 'grid') {
    return (
      <div className="py-12 px-4" style={{ backgroundColor: 'rgb(228, 229, 218)' }}>
        <div 
          className="max-w-6xl mx-auto grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gap
          }}
        >
          {images.map((item, idx) => {
            const imgUrlRaw = typeof item === 'string' ? item : item.url
            const imgUrl = resolveMediaUrl(imgUrlRaw)
            const caption = typeof item === 'object' ? item.caption : ''
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="rounded-xl overflow-hidden shadow-md cursor-pointer"
              >
                <img src={imgUrl} alt={caption || `Gallery ${idx + 1}`} className="w-full h-64 object-cover" />
                {caption && (
                  <div className="p-3 bg-white">
                    <p className="text-sm text-center" style={{ color: 'rgb(30, 30, 30)' }}>
                      {caption}
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // Masonry Layout
  if (style === 'masonry') {
    return (
      <div className="py-12 px-4" style={{ backgroundColor: 'rgb(228, 229, 218)' }}>
        <div 
          className="max-w-6xl mx-auto"
          style={{
            columnCount: columns,
            columnGap: gap
          }}
        >
          {images.map((item, idx) => {
            const imgUrlRaw = typeof item === 'string' ? item : item.url
            const imgUrl = resolveMediaUrl(imgUrlRaw)
            const caption = typeof item === 'object' ? item.caption : ''
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="mb-4 rounded-xl overflow-hidden shadow-md cursor-pointer break-inside-avoid"
              >
                <img src={imgUrl} alt={caption || `Gallery ${idx + 1}`} className="w-full object-cover" />
                {caption && (
                  <div className="p-3 bg-white">
                    <p className="text-sm text-center" style={{ color: 'rgb(30, 30, 30)' }}>
                      {caption}
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // Slideshow (poziome przesuwanie)
  if (style === 'slideshow') {
    const currentItem = images[currentIndex]
    const imgUrlRaw = typeof currentItem === 'string' ? currentItem : currentItem?.url
    const imgUrl = resolveMediaUrl(imgUrlRaw)
    const caption = typeof currentItem === 'object' ? currentItem?.caption : ''

    return (
      <div className="py-12 px-4" style={{ backgroundColor: 'rgb(228, 229, 218)' }}>
        <div className="max-w-4xl mx-auto relative">
          <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img
                  src={imgUrl}
                  alt={caption || `Slide ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                    <p className="text-center">{caption}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center shadow-lg transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center shadow-lg transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  backgroundColor: idx === currentIndex ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.3)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Fade (zanikanie)
  if (style === 'fade') {
    const currentItem = images[currentIndex]
    const imgUrlRaw = typeof currentItem === 'string' ? currentItem : currentItem?.url
    const imgUrl = resolveMediaUrl(imgUrlRaw)
    const caption = typeof currentItem === 'object' ? currentItem?.caption : ''

    return (
      <div className="py-12 px-4" style={{ backgroundColor: 'rgb(228, 229, 218)' }}>
        <div className="max-w-4xl mx-auto relative">
          <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <img
                  src={imgUrl}
                  alt={caption || `Slide ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                    <p className="text-center">{caption}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  backgroundColor: idx === currentIndex ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.3)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Carousel (okrągłe przesuwanie) - NAPRAWIONY
  if (style === 'carousel') {
    return (
      <div className="py-12 px-4" style={{ backgroundColor: 'rgb(228, 229, 218)' }}>
        <div className="max-w-6xl mx-auto relative">
          {/* Scrollable container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
          >
            {images.map((item, idx) => {
              const imgUrlRaw = typeof item === 'string' ? item : item.url
              const imgUrl = resolveMediaUrl(imgUrlRaw)
              const caption = typeof item === 'object' ? item.caption : ''
              
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 w-80 rounded-xl overflow-hidden shadow-md cursor-pointer snap-center bg-white"
                >
                  <img src={imgUrl} alt={caption || `Carousel ${idx + 1}`} className="w-full h-64 object-cover" />
                  {caption && (
                    <div className="p-3">
                      <p className="text-sm text-center" style={{ color: 'rgb(30, 30, 30)' }}>
                        {caption}
                      </p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => scrollToImage('prev')}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollToImage('next')}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Scroll hint */}
          <div className="text-center mt-4 text-sm opacity-60">
            ← Przewiń, aby zobaczyć więcej →
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default GalleryModule
