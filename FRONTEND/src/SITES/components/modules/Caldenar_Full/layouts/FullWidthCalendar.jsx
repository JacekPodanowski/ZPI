import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import PublicCalendar from '../components/PublicCalendar';
import BookingModal from '../../../../../components/Calendar/BookingModal';
import { applyOpacity } from '../../../../../utils/color';

const normalizeEvents = (events = []) => {
  const entries = Array.isArray(events) ? events : [];
  const map = new Map();

  entries.forEach((event, index) => {
    if (!event) {
      return;
    }

    const candidateMoment = event.date ? moment(event.date) : event.start ? moment(event.start) : null;

    if (!candidateMoment || !candidateMoment.isValid()) {
      return;
    }

    const dayKey = candidateMoment.format('YYYY-MM-DD');

    const normalizedEvent = {
      title: event.title || event.name || 'Wydarzenie',
      id: event.id || `public-calendar-big-${index}`,
      start: event.start,
      end: event.end,
      date: dayKey,
      description: event.description,
      location: event.location,
      category: event.category,
      capacity: event.capacity,
      availableSpots: event.availableSpots ?? event.available_spots,
      duration: event.duration,
      event_type: event.event_type
    };

    const existing = map.get(dayKey);

    if (existing) {
      existing.push(normalizedEvent);
    } else {
      map.set(dayKey, [normalizedEvent]);
    }
  });

  map.forEach((list, dayKey) => {
    list.sort((a, b) => {
      const aMoment = a.start ? moment(a.start) : moment(`${dayKey}T00:00:00`);
      const bMoment = b.start ? moment(b.start) : moment(`${dayKey}T00:00:00`);
      return aMoment.valueOf() - bMoment.valueOf();
    });
  });

  return map;
};

const FullWidthCalendar = ({ content, style, siteId }) => {
  const [activeDay, setActiveDay] = useState(null);
  const [apiEvents, setApiEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const accent = content.highlightColor || style?.primary || '#920020';
  const headingColor = content.textColor || style?.text || '#1e1e1e';
  const sectionBackground = content.backgroundColor || style?.background || '#f0f0ed';
  const neutralText = style?.neutral || '#6b7280';
  const subtleText = style?.colors?.text?.subtle || applyOpacity(neutralText, 0.8);
  const surface = style?.surface || '#ffffff';
  const borderColor = style?.colors?.border || style?.borderColor || 'rgba(0, 0, 0, 0.14)';
  const subtleBorder = style?.colors?.borderSubtle || applyOpacity(borderColor, 0.5);
  const buttonText = content.buttonTextColor || (style?.mode === 'dark'
    ? style?.text || '#f5f5f5'
    : style?.background || '#ffffff');
  const emptyState = content.emptyStateMessage || 'Wybierz dzień z kalendarza, aby zobaczyć wydarzenia.';

  // Fetch events from API
  useEffect(() => {
    if (!siteId) {
      setError('Brak ID witryny - wyświetlane są dane przykładowe');
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      const start = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
      const end = currentMonth.clone().endOf('month').format('YYYY-MM-DD');

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/v1/public-sites/${siteId}/availability/?start_date=${start}&end_date=${end}`
        );
        
        if (!response.ok) {
          throw new Error('Nie udało się pobrać wydarzeń');
        }

        const slots = await response.json();

        // Transform API slots to event format
        const events = slots.map((slot, index) => ({
          id: slot.id || `event-${index}`,
          title: slot.title || 'Termin dostępny',
          start: slot.start,
          end: slot.end,
          date: slot.start.split('T')[0],
          description: slot.description || '',
          location: slot.location || '',
          category: slot.event_type === 'group' ? 'Grupowe' : 'Indywidualne',
          capacity: slot.capacity,
          availableSpots: slot.available_spots ?? slot.capacity,
          duration: slot.duration,
          event_type: slot.event_type
        }));

        setApiEvents(events);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Backend nie zwrócił odpowiedzi – wyświetlane są dane przykładowe.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [siteId, currentMonth]);

  // Use API events if available, otherwise fall back to content.events
  const eventsToDisplay = apiEvents.length > 0 ? apiEvents : (content.events || []);
  const eventsByDate = useMemo(() => normalizeEvents(eventsToDisplay), [eventsToDisplay]);

  const handleDayClick = useCallback((dayMoment) => {
    setActiveDay(dayMoment);
  }, []);

  const handleSlotClick = useCallback((event) => {
    // Transform event to slot format expected by BookingModal
    setSelectedSlot({
      id: event.id,
      start: event.start,
      end: event.end,
      duration: event.duration,
      title: event.title,
      event_type: event.event_type,
      capacity: event.capacity,
      available_spots: event.availableSpots
    });
    setIsModalOpen(true);
  }, []);

  const handleBookingSuccess = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    // Refresh events after successful booking
    const start = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
    const end = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
    
    if (siteId) {
      fetch(`${import.meta.env.VITE_API_BASE}/api/v1/public-sites/${siteId}/availability/?start_date=${start}&end_date=${end}`)
        .then(response => response.json())
        .then(slots => {
          const events = slots.map((slot, index) => ({
            id: slot.id || `event-${index}`,
            title: slot.title || 'Termin dostępny',
            start: slot.start,
            end: slot.end,
            date: slot.start.split('T')[0],
            description: slot.description || '',
            location: slot.location || '',
            category: slot.event_type === 'group' ? 'Grupowe' : 'Indywidualne',
            capacity: slot.capacity,
            availableSpots: slot.available_spots ?? slot.capacity,
            duration: slot.duration,
            event_type: slot.event_type
          }));
          setApiEvents(events);
        })
        .catch(error => console.error('Error refreshing events:', error));
    }
  };

  const activeDayKey = useMemo(() => {
    if (!activeDay) {
      return null;
    }
    return activeDay.clone().startOf('day').format('YYYY-MM-DD');
  }, [activeDay]);

  const activeEvents = useMemo(() => {
    if (!activeDayKey) {
      return [];
    }
    return eventsByDate.get(activeDayKey) || [];
  }, [activeDayKey, eventsByDate]);

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: sectionBackground }}>
      <div className="mx-auto max-w-6xl px-4">
        {(content.title || content.subtitle) && (
          <header className="text-center mb-12">
            {content.title && (
              <h2 className={style?.headingSize || 'text-4xl font-semibold tracking-tight'} style={{ color: headingColor }}>
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p
                className={`${style?.textSize || 'text-lg'} mt-4`}
                style={{ color: subtleText }}
              >
                {content.subtitle}
              </p>
            )}
            <p className="mt-2 text-sm" style={{ color: neutralText }}>
              Źródło danych: {siteId ? (apiEvents.length > 0 ? 'API Backend' : 'dane przykładowe') : 'dane przykładowe (brak siteId)'}
            </p>
          </header>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12 mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: accent }}></div>
            <span className="ml-3" style={{ color: neutralText }}>Ładowanie wydarzeń...</span>
          </div>
        )}

        <div
          className={`${style?.rounded || 'rounded-3xl'} ${style?.shadows || 'shadow-xl'} overflow-hidden ${style?.borders || 'border border-neutral-200/70'}`}
          style={{ backgroundColor: surface, borderColor }}
        >
          <PublicCalendar eventsByDate={eventsByDate} onDayClick={handleDayClick} style={style} />
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: headingColor }}>
            {activeDayKey ? `Wydarzenia ${moment(activeDayKey).format('D MMMM YYYY')}` : 'Brak wybranego dnia'}
          </h3>

          {activeEvents.length === 0 ? (
            <p className="text-neutral-500">{emptyState}</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {activeEvents.map((event) => {
                const startTime = event.start ? moment(event.start).format('HH:mm') : null;
                const endTime = event.end ? moment(event.end).format('HH:mm') : null;

                return (
                  <article
                    key={event.id}
                    className={`${style?.rounded || 'rounded-2xl'} ${style?.shadows || 'shadow-sm'} border p-6 ${style?.animations || 'transition-colors duration-200'} hover:shadow-md`}
                    style={{
                      backgroundColor: surface,
                      borderColor: subtleBorder
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-xl font-semibold" style={{ color: headingColor }}>
                        {event.title}
                      </h4>
                      {event.category && (
                        <span
                          className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                          style={{ color: accent, backgroundColor: applyOpacity(accent, 0.1) }}
                        >
                          {event.category}
                        </span>
                      )}
                    </div>

                    {(startTime || endTime) && (
                      <p className="mt-3 text-sm font-medium" style={{ color: accent }}>
                        {startTime}
                        {endTime ? ` – ${endTime}` : ''}
                      </p>
                    )}

                    {event.location && (
                      <p className="mt-2 text-sm" style={{ color: neutralText }}>{event.location}</p>
                    )}

                    {event.description && (
                      <p className="mt-4 text-sm leading-relaxed" style={{ color: subtleText }}>{event.description}</p>
                    )}

                    {typeof event.capacity === 'number' && (
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: neutralText }}>
                        Dostępne miejsca: {event.availableSpots ?? event.capacity}/{event.capacity}
                      </p>
                    )}

                    <button
                      onClick={() => handleSlotClick(event)}
                      className={`mt-4 w-full ${style?.buttonStyle || 'rounded-lg py-3 px-4 text-sm font-medium'} ${style?.animations || 'transition-all duration-200'} ${style?.shadows || ''} hover:shadow-md`}
                      style={{
                        backgroundColor: accent,
                        color: buttonText
                      }}
                    >
                      Rezerwuj spotkanie
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && selectedSlot && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSlot(null);
          }}
          slot={selectedSlot}
          siteId={siteId}
          onSuccess={handleBookingSuccess}
        />
      )}
    </section>
  );
};

FullWidthCalendar.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    highlightColor: PropTypes.string,
    emptyStateMessage: PropTypes.string,
    events: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        name: PropTypes.string,
        date: PropTypes.string,
        start: PropTypes.string,
        end: PropTypes.string,
        description: PropTypes.string,
        location: PropTypes.string,
        category: PropTypes.string,
        capacity: PropTypes.number,
        availableSpots: PropTypes.number,
        available_spots: PropTypes.number
      })
    )
  }),
  style: PropTypes.object,
  siteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

FullWidthCalendar.defaultProps = {
  content: {
    events: []
  },
  style: undefined,
  siteId: null
};

export default FullWidthCalendar;
