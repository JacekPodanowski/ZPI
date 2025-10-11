import React, { useState } from 'react'
import { motion } from 'framer-motion'
import CustomCalendar from '../../components/CustomCalendar'
import BookingModal from './BookingModal'

const CalendarSection = ({ config }) => {
  const { title, color, minInterval, allowIndividual, allowGroup } = config
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setShowBookingModal(true)
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowBookingModal(true)
  }

  const handleCloseModal = () => {
    setShowBookingModal(false)
    setSelectedDate(null)
    setSelectedEvent(null)
  }

  return (
    <section className="py-20 px-4 bg-white">
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
          <CustomCalendar
            config={{ color }}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
            minInterval={minInterval}
            allowIndividual={allowIndividual}
            allowGroup={allowGroup}
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
