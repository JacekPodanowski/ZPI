import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const CustomCalendar = ({ 
  config = {},
  onDateSelect,
  onEventClick,
  minInterval = 15,
  allowIndividual = true,
  allowGroup = true,
  siteIdentifier = null
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useState([])
  const [availability, setAvailability] = useState({})
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('month') // 'month' | 'week' | 'day'

  const API_EVENTS = import.meta.env.VITE_API_EVENTS || 'http://192.168.0.102:8000/api/events'
  const API_AVAILABILITY = import.meta.env.VITE_API_AVAILABILITY || 'http://192.168.0.102:8000/api/availability'

  // Pobierz wydarzenia z API
  useEffect(() => {
    fetchEvents()
    fetchAvailability()
  }, [currentDate, siteIdentifier])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const params = {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      }
      
      if (siteIdentifier) {
        params.site = siteIdentifier
      }

      const response = await axios.get(API_EVENTS, { params })
      setEvents(response.data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(API_AVAILABILITY, {
        params: { 
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          site: siteIdentifier
        }
      })
      setAvailability(response.data.availability || {})
    } catch (error) {
      console.error('Failed to fetch availability:', error)
      setAvailability({})
    }
  }

  // Pomocnicze funkcje dla kalendarza
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ]

  const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd']

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    if (onDateSelect) {
      onDateSelect(clickedDate)
    }
  }

  const getEventsForDay = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]
    return events.filter(event => {
      const eventDate = new Date(event.start_time).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  const isDateAvailable = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]
    return availability[dateStr] !== false
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isPast = (day) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return checkDate < today
  }

  const isSelected = (day) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={previousMonth}
          className="p-2 rounded-lg hover:bg-white transition-all"
          style={{ color: config.color || 'rgb(146, 0, 32)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <h2 className="text-2xl font-bold" style={{ color: 'rgb(30, 30, 30)' }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-white transition-all"
          style={{ color: config.color || 'rgb(146, 0, 32)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-sm p-2"
            style={{ color: 'rgb(30, 30, 30)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before first day */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayEvents = getEventsForDay(day)
          const available = isDateAvailable(day)
          const past = isPast(day)
          const today = isToday(day)
          const selected = isSelected(day)

          return (
            <motion.div
              key={day}
              whileHover={!past && available ? { scale: 1.05 } : {}}
              whileTap={!past && available ? { scale: 0.95 } : {}}
              onClick={() => !past && available && handleDateClick(day)}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center
                transition-all relative
                ${!past && available ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                ${selected ? 'ring-2' : ''}
                ${today ? 'font-bold' : ''}
              `}
              style={{
                backgroundColor: selected 
                  ? config.color || 'rgb(146, 0, 32)'
                  : 'white',
                color: selected 
                  ? 'white'
                  : past 
                  ? 'rgba(30, 30, 30, 0.3)'
                  : 'rgb(30, 30, 30)',
                ringColor: config.color || 'rgb(146, 0, 32)',
              }}
            >
              <span className="text-sm">{day}</span>
              
              {/* Event indicators */}
              {dayEvents.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ 
                        backgroundColor: selected ? 'white' : config.color || 'rgb(146, 0, 32)' 
                      }}
                      title={event.title}
                    />
                  ))}
                </div>
              )}

              {/* Today indicator */}
              {today && !selected && (
                <div 
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ backgroundColor: config.color || 'rgb(146, 0, 32)' }}
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Selected date events */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(30, 30, 30)' }}>
              Wydarzenia - {selectedDate.toLocaleDateString('pl-PL')}
            </h3>
            
            {getEventsForDay(selectedDate.getDate()).length > 0 ? (
              <div className="space-y-2">
                {getEventsForDay(selectedDate.getDate()).map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onEventClick && onEventClick(event)}
                    className="p-4 bg-white rounded-xl shadow-md cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold" style={{ color: 'rgb(30, 30, 30)' }}>
                          {event.title}
                        </h4>
                        <p className="text-sm opacity-70">
                          {new Date(event.start_time).toLocaleTimeString('pl-PL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {' - '}
                          {new Date(event.end_time).toLocaleTimeString('pl-PL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: event.event_type === 'individual' 
                            ? 'rgba(146, 0, 32, 0.1)' 
                            : 'rgba(146, 0, 32, 0.2)',
                          color: config.color || 'rgb(146, 0, 32)',
                        }}
                      >
                        {event.event_type === 'individual' ? 'Indywidualne' : 'Grupowe'}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm mt-2 opacity-70">{event.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-50">
                <p>Brak wydarzeń w tym dniu</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-opacity-25" 
               style={{ 
                 borderColor: config.color || 'rgb(146, 0, 32)',
                 borderTopColor: 'transparent'
               }} 
          />
        </div>
      )}
    </div>
  )
}

export default CustomCalendar
