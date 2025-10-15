import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PublicCalendar from './PublicCalendar/PublicCalendar'
import BookingModal from './BookingModal'

const CalendarSection = ({ config }) => {
  const { title, color, allowIndividual, allowGroup, bgColor, events = [] } = config
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const eventsByDate = useMemo(() => {
    const map = new Map()
    events.forEach((event) => {
      if (!event?.date || !event?.title) return
      const key = event.date
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key).push(event)
    })
    return map
  }, [events])

  const handleDayClick = (day) => {
    const dayKey = day.format('YYYY-MM-DD')
    const dayEvents = eventsByDate.get(dayKey) || []
    setSelectedDate(day.toDate())
    setSelectedEvent(dayEvents[0] || null)
    setShowBookingModal(true)
  }

  const handleCloseModal = () => {
    setShowBookingModal(false)
    setSelectedDate(null)
    setSelectedEvent(null)
  }

  return (
    <section className="py-20 px-4" style={{ backgroundColor: bgColor || 'rgb(255, 255, 255)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12"
          style={{ color }}
        >
          {title}
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-xl p-8 shadow-lg"
          style={{ backgroundColor: 'rgb(228, 229, 218)' }}
        >
          <PublicCalendar
            eventsByDate={eventsByDate}
            onDayClick={handleDayClick}
          />
        </motion.div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={handleCloseModal}
          selectedDate={selectedDate}
          selectedEvent={selectedEvent}
          config={config}
        />
      )}
    </section>
  )
}

export default CalendarSection
