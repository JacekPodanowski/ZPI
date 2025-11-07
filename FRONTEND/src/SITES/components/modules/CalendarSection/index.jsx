// index.jsx - Interactive CalendarSection with booking functionality
import React, { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import BookingModal from '../../../../components/Calendar/BookingModal';
import { CALENDAR_DESCRIPTOR } from './descriptor';

const CalendarSection = ({ content = {}, siteId, theme, layout = 'sidebar' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { 
    title = 'Wybierz dogodny termin zajęć', 
    subtitle = 'Poniższy kalendarz prezentuje aktualne wydarzenia dostępne do rezerwacji.',
    bgColor = '#f8f9fa',
    textColor = '#1a1a1a',
    calendarAccentColor,
    showCapacity = true
  } = content;

  // Use calendarAccentColor from content, fallback to theme primary, then default
  const effectiveAccentColor = calendarAccentColor || theme?.primary || '#146B3A';

  useEffect(() => {
    if (!siteId) {
      setError('Brak ID witryny - nie można pobrać dostępności');
      return;
    }

    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/v1/public-sites/${siteId}/availability/?start_date=${start}&end_date=${end}`
        );
        
        if (!response.ok) {
          throw new Error('Nie udało się pobrać dostępności');
        }

        const slots = await response.json();

        // Deduplicate slots by start time (in case API returns duplicates)
        const uniqueSlots = slots.reduce((acc, slot) => {
          const existing = acc.find(s => s.start === slot.start);
          if (!existing) {
            acc.push(slot);
          }
          return acc;
        }, []);

        const slotsByDay = uniqueSlots.reduce((acc, slot) => {
          const day = slot.start.split('T')[0];
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push(slot);
          return acc;
        }, {});

        setAvailableSlots(slotsByDay);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setError('Backend nie zwrócił odpowiedzi – interfejs pozostaje dostępny z ograniczoną funkcjonalnością.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [currentMonth, siteId]);

  const availableDays = useMemo(() => {
    return Object.keys(availableSlots).map((dateStr) => new Date(dateStr + 'T00:00:00'));
  }, [availableSlots]);

  const handleDayClick = (day) => {
    if (!day) return;
    const dayStr = format(day, 'yyyy-MM-dd');
    if (availableSlots[dayStr] && availableSlots[dayStr].length > 0) {
      setSelectedDay(day);
    } else {
      setSelectedDay(null);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setIsModalOpen(false);
    setAvailableSlots((prev) => {
      const dayStr = format(new Date(selectedSlot.start), 'yyyy-MM-dd');
      const updatedSlots = { ...prev };
      updatedSlots[dayStr] = updatedSlots[dayStr].filter((s) => s.start !== selectedSlot.start);
      return updatedSlots;
    });
    setSelectedDay(null);
  };

  // Render slot button with capacity info
  const renderSlotButton = (slot, index) => (
    <button
      key={`${slot.start}-${slot.id || index}`}
      onClick={() => handleSlotSelect(slot)}
      className="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
      style={{
        borderColor: `${effectiveAccentColor}30`,
        backgroundColor: 'white'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = effectiveAccentColor;
        e.currentTarget.style.backgroundColor = `${effectiveAccentColor}05`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${effectiveAccentColor}30`;
        e.currentTarget.style.backgroundColor = 'white';
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-neutral-900">
            {format(new Date(slot.start), 'HH:mm')} - {format(new Date(slot.end), 'HH:mm')}
          </div>
          <div className="text-sm text-neutral-600 mt-1">
            Czas trwania: {slot.duration} min
            {slot.event_type && (
              <span className="ml-2">• {slot.event_type === 'group' ? 'Grupowe' : 'Indywidualne'}</span>
            )}
          </div>
          {showCapacity && slot.capacity !== undefined && (
            <div className="text-sm mt-1" style={{ color: effectiveAccentColor }}>
              Miejsca: {slot.available_spots || slot.capacity}/{slot.capacity}
            </div>
          )}
        </div>
        <svg className="w-5 h-5 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );

  // Layout-specific rendering
  const renderSidebarLayout = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-neutral-200">
      <div className="flex flex-col lg:flex-row">
        {/* Calendar */}
        <div className="flex-1 p-8">{renderCalendar()}</div>
        {/* Slots Sidebar */}
        <div className="lg:w-96 border-t lg:border-t-0 lg:border-l border-neutral-200 bg-neutral-50">
          {renderSlotsList()}
        </div>
      </div>
    </div>
  );

  const renderInlineLayout = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-neutral-200 p-8">
      <div className="max-w-4xl mx-auto">
        {renderCalendar()}
        <div className="mt-8 pt-8 border-t border-neutral-200">
          {renderSlotsList()}
        </div>
      </div>
    </div>
  );

  const renderCompactLayout = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200">
      <div className="grid md:grid-cols-2 gap-6 p-6">
        <div>{renderCalendar()}</div>
        <div>{renderSlotsList()}</div>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <>
      <style>{`
        .rdp {
          --rdp-accent-color: ${effectiveAccentColor};
          --rdp-background-color: ${effectiveAccentColor}15;
          margin: 0;
        }
        .rdp-day_button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: ${effectiveAccentColor}10;
        }
        .rdp-day_button.rdp-day_selected {
          background-color: ${effectiveAccentColor};
          color: white;
        }
        .rdp-day_button.has-events {
          position: relative;
          font-weight: 600;
        }
        .rdp-day_button.has-events::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: ${effectiveAccentColor};
        }
        .rdp-day_button.has-events.rdp-day_selected::after {
          background-color: white;
        }
        .rdp-caption {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .rdp-weekday {
          font-weight: 600;
          color: #6b7280;
          font-size: 0.875rem;
        }
        .rdp-day {
          font-size: 0.95rem;
        }
      `}</style>
      
      <DayPicker
        mode="single"
        selected={selectedDay}
        onSelect={handleDayClick}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        locale={pl}
        showOutsideDays={false}
        modifiers={{
          hasEvents: availableDays
        }}
        modifiersClassNames={{
          hasEvents: 'has-events'
        }}
        disabled={(date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          return !availableSlots[dateStr] || availableSlots[dateStr].length === 0;
        }}
      />
    </>
  );

  const renderSlotsList = () => (
    <div className="p-8">
      <h3 className="text-xl font-semibold mb-6" style={{ color: '#1a1a1a' }}>
        {selectedDay 
          ? `Terminy ${format(selectedDay, 'd MMMM yyyy', { locale: pl })}`
          : 'Wybierz dzień z kalendarza'
        }
      </h3>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: effectiveAccentColor }}></div>
        </div>
      )}

      {!loading && selectedDay && (
        <div className="space-y-3">
          {availableSlots[format(selectedDay, 'yyyy-MM-dd')]?.map((slot, index) => 
            renderSlotButton(slot, index)
          )}

          {(!availableSlots[format(selectedDay, 'yyyy-MM-dd')] ||
            availableSlots[format(selectedDay, 'yyyy-MM-dd')].length === 0) && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-neutral-500">Brak dostępnych terminów w tym dniu</p>
            </div>
          )}
        </div>
      )}

      {!loading && !selectedDay && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="text-neutral-500">Kliknij na dzień w kalendarzu,<br />aby zobaczyć dostępne terminy</p>
        </div>
      )}
    </div>
  );

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
            {title}
          </h2>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto mb-2">
            {subtitle}
          </p>
          <p className="text-sm text-neutral-500">
            Źródło danych: {siteId ? 'API Backend' : 'dane makietowe (mock)'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        )}

        {/* Render based on layout */}
        {layout === 'inline' && renderInlineLayout()}
        {layout === 'compact' && renderCompactLayout()}
        {layout === 'sidebar' && renderSidebarLayout()}

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500">
            Dni z dostępnymi terminami są oznaczone <span style={{ color: effectiveAccentColor, fontWeight: 600 }}>•</span>
          </p>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleBookingSuccess}
        slot={selectedSlot}
        siteId={siteId}
      />
    </section>
  );
};

CalendarSection.descriptor = CALENDAR_DESCRIPTOR;
export default CalendarSection;
