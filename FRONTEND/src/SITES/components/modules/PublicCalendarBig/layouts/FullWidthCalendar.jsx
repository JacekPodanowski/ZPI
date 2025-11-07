import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import PublicCalendar from '../components/PublicCalendar';

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

const FullWidthCalendar = ({ content, theme, siteId }) => {
  const [activeDay, setActiveDay] = useState(null);
  const [apiEvents, setApiEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month'));

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

  const accent = content.highlightColor || theme?.colors?.primary || theme?.palette?.primary?.main || '#920020';
  const headingColor = content.textColor || theme?.colors?.text || '#1e1e1e';
  const sectionBackground = content.backgroundColor || theme?.colors?.background || '#f0f0ed';
  const emptyState = content.emptyStateMessage || 'Wybierz dzień z kalendarza, aby zobaczyć wydarzenia.';

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: sectionBackground }}>
      <div className="mx-auto max-w-6xl px-4">
        {(content.title || content.subtitle) && (
          <header className="text-center mb-12">
            {content.title && (
              <h2 className="text-4xl font-semibold tracking-tight" style={{ color: headingColor }}>
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="mt-4 text-lg text-neutral-600">
                {content.subtitle}
              </p>
            )}
            <p className="mt-2 text-sm text-neutral-500">
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
            <span className="ml-3 text-neutral-600">Ładowanie wydarzeń...</span>
          </div>
        )}

        <div className="rounded-3xl shadow-xl overflow-hidden border border-neutral-200/70 bg-white/90 backdrop-blur">
          <PublicCalendar eventsByDate={eventsByDate} onDayClick={handleDayClick} />
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
                    className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-colors duration-200 hover:border-neutral-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-xl font-semibold" style={{ color: headingColor }}>
                        {event.title}
                      </h4>
                      {event.category && (
                        <span
                          className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                          style={{ color: accent, backgroundColor: `${accent}1a` }}
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
                      <p className="mt-2 text-sm text-neutral-500">{event.location}</p>
                    )}

                    {event.description && (
                      <p className="mt-4 text-sm leading-relaxed text-neutral-600">{event.description}</p>
                    )}

                    {typeof event.capacity === 'number' && (
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Dostępne miejsca: {event.availableSpots ?? event.capacity}/{event.capacity}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
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
  theme: PropTypes.object,
  siteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

FullWidthCalendar.defaultProps = {
  content: {
    events: []
  },
  theme: undefined,
  siteId: null
};

export default FullWidthCalendar;
