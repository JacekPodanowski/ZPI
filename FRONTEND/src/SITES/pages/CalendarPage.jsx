import React from 'react'
import CalendarSection from '../components/CalendarSection'

const CalendarPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <CalendarSection config={{ title: 'Kalendarz Rezerwacji', color: '#c04b3e' }} />
    </div>
  )
}

export default CalendarPage
