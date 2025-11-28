import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { format, startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns';
import { pl } from 'date-fns/locale';
import PublicCalendar from '../components/PublicCalendar';
import BookingModal from '../../../../../components/Calendar/BookingModal';
import { applyOpacity } from '../../../../../utils/color';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const normalizeEvents = (events = []) => {
  const entries = Array.isArray(events) ? events : [];
  const map = new Map();

  entries.forEach((event, index) => {
    if (!event) {
      return;
    }

    let candidateDate = null;
    if (event.date) {
      candidateDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
    } else if (event.start) {
      candidateDate = typeof event.start === 'string' ? parseISO(event.start) : event.start;
    }

    if (!candidateDate || !isValid(candidateDate)) {
      return;
    }

    const dayKey = format(candidateDate, 'yyyy-MM-dd');

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
      const aDate = a.start ? (typeof a.start === 'string' ? parseISO(a.start) : a.start) : parseISO(`${dayKey}T00:00:00`);
      const bDate = b.start ? (typeof b.start === 'string' ? parseISO(b.start) : b.start) : parseISO(`${dayKey}T00:00:00`);
      return aDate.getTime() - bDate.getTime();
    });
  });

  return map;
};

const FullWidthCalendar = ({ content, style, siteId, isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleSubtitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { subtitle: newValue });
  };

  const [activeDay, setActiveDay] = useState(null);
  const [apiEvents, setApiEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState('all');

  const accent = content.highlightColor || style?.primary || '#920020';
  const headingColor = content.textColor || style?.text || '#1e1e1e';
  const bodyText = style?.text || '#1f2937';
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

  const normalizeAssigneeId = useCallback((value) => {
    if (value === undefined || value === null) {
      return null;
    }
    return String(value);
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!siteId) {
      setError('Brak ID witryny - nie można pobrać dostępności');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/v1/public-sites/${siteId}/availability/?start_date=${start}&end_date=${end}`
      );
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać dostępności. Spróbuj odświeżyć stronę.');
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
        event_type: slot.event_type,
        assignee_name: slot.assignee_name || slot.creator_name || 'Nieznany',
        assignee_id: normalizeAssigneeId(slot.assignee_id || slot.creator_id),
        assignee_type: slot.assignee_type
      }));

      setApiEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Nie udało się pobrać dostępności. Spróbuj odświeżyć stronę.');
    } finally {
      setLoading(false);
    }
  }, [siteId, currentMonth, normalizeAssigneeId]);

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Use API events if available, otherwise fall back to content.events
  const eventsToDisplay = apiEvents.length > 0 ? apiEvents : (content.events || []);
  
  // Get unique creators for filtering
  const uniqueCreators = useMemo(() => {
    const creatorsMap = new Map();
    eventsToDisplay.forEach(event => {
      if (event.assignee_id && event.assignee_name) {
        creatorsMap.set(event.assignee_id, event.assignee_name);
      }
    });
    return Array.from(creatorsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [eventsToDisplay]);

  // Filter events by selected creator
  const filteredEvents = useMemo(() => {
    if (selectedCreator === 'all') {
      return eventsToDisplay;
    }
    return eventsToDisplay.filter(event => event.assignee_id === selectedCreator);
  }, [eventsToDisplay, selectedCreator]);

  const eventsByDate = useMemo(() => normalizeEvents(filteredEvents), [filteredEvents]);

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
      available_spots: event.availableSpots,
      assignee_type: event.assignee_type,
      assignee_id: event.assignee_id,
      assignee_name: event.assignee_name
    });
    setIsModalOpen(true);
  }, []);

  const handleBookingSuccess = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    // Refetch events to ensure full synchronization with backend
    fetchEvents();
  }, [fetchEvents]);

  const activeDayKey = useMemo(() => {
    if (!activeDay) {
      return null;
    }
    return format(activeDay, 'yyyy-MM-dd');
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
            {(isEditing || content.title) && (
              isEditing ? (
                <EditableText
                  value={content.title || ''}
                  onSave={handleTitleSave}
                  as="h2"
                  className={style?.headingSize || 'text-4xl font-semibold tracking-tight'}
                  style={{ color: headingColor }}
                  placeholder="Click to edit title..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <h2 className={style?.headingSize || 'text-4xl font-semibold tracking-tight'} style={{ color: headingColor }}>
                  {content.title}
                </h2>
              )
            )}
            {(isEditing || content.subtitle) && (
              isEditing ? (
                <EditableText
                  value={content.subtitle || ''}
                  onSave={handleSubtitleSave}
                  as="p"
                  className={`${style?.textSize || 'text-lg'} mt-4`}
                  style={{ color: subtleText }}
                  placeholder="Click to edit subtitle..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <p
                  className={`${style?.textSize || 'text-lg'} mt-4`}
                  style={{ color: subtleText }}
                >
                  {content.subtitle}
                </p>
              )
            )}
            <p className="mt-2 text-sm" style={{ color: neutralText }}>
              Źródło danych: {siteId ? (apiEvents.length > 0 ? 'API Backend' : 'dane przykładowe (brak odpowiedzi API)') : 'dane przykładowe (brak siteId)'}
            </p>
          </header>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        )}

        {/* Creator Filter */}
        {uniqueCreators.length > 1 && (
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-3 bg-white rounded-lg shadow-sm border border-neutral-200 px-4 py-2">
              <label htmlFor="creator-filter" className="text-sm font-medium" style={{ color: headingColor }}>
                Filtruj według twórcy:
              </label>
              <select
                id="creator-filter"
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
                className="text-sm border border-neutral-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2"
                style={{
                  color: headingColor,
                  focusRingColor: accent
                }}
              >
                <option value="all">Wszyscy</option>
                {uniqueCreators.map(creator => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name}
                  </option>
                ))}
              </select>
            </div>
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
            {activeDayKey ? `Wydarzenia ${format(parseISO(activeDayKey), 'd MMMM yyyy', { locale: pl })}` : 'Brak wybranego dnia'}
          </h3>

          {activeEvents.length === 0 ? (
            <p className="text-neutral-500">{emptyState}</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {activeEvents.map((event) => {
                const startTime = event.start ? format(typeof event.start === 'string' ? parseISO(event.start) : event.start, 'HH:mm') : null;
                const endTime = event.end ? format(typeof event.end === 'string' ? parseISO(event.end) : event.end, 'HH:mm') : null;

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
                    
                    {event.assignee_name && (
                      <p className="mt-2 text-sm" style={{ color: neutralText }}>
                        Prowadzący: <span className="font-semibold" style={{ color: bodyText }}>{event.assignee_name}</span>
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
