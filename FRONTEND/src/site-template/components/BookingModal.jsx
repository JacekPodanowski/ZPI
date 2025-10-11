import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBooking } from '../../services/calendarService'
import Button from '../../components/Button'

const BookingModal = ({ isOpen, onClose, selectedDate, selectedEvent, config }) => {
  const [step, setStep] = useState(1) // 1: type, 2: time, 3: details, 4: confirmation
  const [bookingType, setBookingType] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const bookingData = {
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        type: bookingType,
        ...formData
      }

      await createBooking(bookingData)
      setStep(4)
    } catch (err) {
      setError('Nie udało się zarezerwować terminu. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b px-6 py-4" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold" style={{ color: 'rgb(30, 30, 30)' }}>
                  Rezerwacja
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedDate && (
                <p className="text-sm opacity-70 mt-2">
                  {selectedDate.toLocaleDateString('pl-PL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Choose type */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold mb-4">Wybierz rodzaj zajęć</h3>
                  
                  {config.allowIndividual && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setBookingType('individual')
                        setStep(2)
                      }}
                      className="p-6 border-2 rounded-xl cursor-pointer transition-all"
                      style={{ 
                        borderColor: bookingType === 'individual' 
                          ? config.color || 'rgb(146, 0, 32)' 
                          : 'rgba(30, 30, 30, 0.1)' 
                      }}
                    >
                      <h4 className="text-lg font-semibold mb-2">Sesja indywidualna</h4>
                      <p className="text-sm opacity-70">Zajęcia jeden na jeden</p>
                    </motion.div>
                  )}

                  {config.allowGroup && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setBookingType('group')
                        setStep(2)
                      }}
                      className="p-6 border-2 rounded-xl cursor-pointer transition-all"
                      style={{ 
                        borderColor: bookingType === 'group' 
                          ? config.color || 'rgb(146, 0, 32)' 
                          : 'rgba(30, 30, 30, 0.1)' 
                      }}
                    >
                      <h4 className="text-lg font-semibold mb-2">Zajęcia grupowe</h4>
                      <p className="text-sm opacity-70">Sesje dla wielu osób</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Choose time */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold mb-4">Wybierz godzinę</h3>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimes.map((time) => (
                      <motion.button
                        key={time}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTime(time)}
                        className="p-3 rounded-lg text-sm font-medium transition-all"
                        style={{
                          backgroundColor: selectedTime === time 
                            ? config.color || 'rgb(146, 0, 32)' 
                            : 'rgb(228, 229, 218)',
                          color: selectedTime === time ? 'white' : 'rgb(30, 30, 30)'
                        }}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                      Wstecz
                    </Button>
                    <Button 
                      onClick={() => setStep(3)} 
                      disabled={!selectedTime}
                      className="flex-1"
                    >
                      Dalej
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Fill details */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold mb-4">Twoje dane</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Imię i nazwisko *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': config.color || 'rgb(146, 0, 32)' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': config.color || 'rgb(146, 0, 32)' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': config.color || 'rgb(146, 0, 32)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Uwagi</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 resize-none"
                      style={{ '--tw-ring-color': config.color || 'rgb(146, 0, 32)' }}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                      Wstecz
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading || !formData.name || !formData.email}
                      className="flex-1"
                    >
                      {loading ? 'Rezerwuję...' : 'Zarezerwuj'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(146, 0, 32, 0.1)' }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: config.color || 'rgb(146, 0, 32)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Rezerwacja potwierdzona!</h3>
                  <p className="opacity-70 mb-6">
                    Szczegóły rezerwacji zostały wysłane na adres {formData.email}
                  </p>
                  <Button onClick={onClose}>Zamknij</Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BookingModal
