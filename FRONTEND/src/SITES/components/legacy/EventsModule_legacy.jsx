import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveMediaUrl } from '../../../config/api'

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    return dateString
  }
}

const EventsModule = ({ config }) => {
  const {
    title = 'Nadchodzące wydarzenia',
    subtitle = 'Zarezerwuj swoje miejsce wcześniej',
    events = [],
    bgColor = '#FFFFFF',
    accentColor = 'rgb(146, 0, 32)',
    textColor = 'rgb(30, 30, 30)'
  } = config || {}

  const [activeEvent, setActiveEvent] = useState(null)

  return (
    <section className="py-12 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-5xl mx-auto space-y-10">
        {(title || subtitle) && (
          <div className="text-center space-y-3">
            {title && (
              <h2 className="text-3xl font-semibold" style={{ color: textColor }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base opacity-70" style={{ color: textColor }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {events.map((event) => (
            <motion.button
              key={event.id}
              onClick={() => setActiveEvent(event)}
              whileHover={{ scale: 1.01 }}
              className="w-full text-left bg-white shadow-sm rounded-3xl px-6 py-6 flex flex-col md:flex-row gap-6 items-start border border-black/5 hover:border-transparent hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center rounded-2xl px-5 py-3 text-white" style={{ backgroundColor: accentColor }}>
                  <span className="text-xs uppercase tracking-[0.2em]">{event.tag || 'Data'}</span>
                  <span className="text-lg font-semibold">
                    {event.date ? formatDate(event.date) : 'Wkrótce'}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-2" style={{ color: textColor }}>
                <h3 className="text-2xl font-semibold">{event.title || 'Nowe wydarzenie'}</h3>
                {event.summary && (
                  <p className="text-sm opacity-80 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.summary }} />
                )}
                {event.location && (
                  <p className="text-xs uppercase tracking-[0.3em] opacity-60">{event.location}</p>
                )}
              </div>
              <div className="ml-auto hidden md:flex items-center gap-2 text-sm font-medium" style={{ color: accentColor }}>
                Szczegóły
                <span aria-hidden>→</span>
              </div>
            </motion.button>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-10 text-sm text-black/40">
            Dodaj wydarzenia w konfiguratorze, aby pokazać harmonogram.
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeEvent && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveEvent(null)}
          >
            <motion.div
              className="max-w-3xl w-full max-h-[85vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-8 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-2xl"
                onClick={() => setActiveEvent(null)}
                aria-label="Zamknij"
              >
                ×
              </button>

              <div className="space-y-6" style={{ color: textColor }}>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                    {activeEvent.date ? formatDate(activeEvent.date) : 'Wkrótce'}
                  </p>
                  <h3 className="text-3xl font-semibold">{activeEvent.title || 'Nowe wydarzenie'}</h3>
                  {activeEvent.summary && (
                    <p className="text-base opacity-70" dangerouslySetInnerHTML={{ __html: activeEvent.summary }} />
                  )}
                </div>

                {activeEvent.images && activeEvent.images.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeEvent.images.map((image, index) => {
                      const resolvedImage = resolveMediaUrl(image)
                      const hasValidImage = resolvedImage && resolvedImage.trim() !== ''
                      
                      return hasValidImage ? (
                        <div key={index} className="rounded-2xl overflow-hidden">
                          <img src={resolvedImage} alt={`${activeEvent.title} ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {activeEvent.fullDescription && (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: activeEvent.fullDescription }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default EventsModule
