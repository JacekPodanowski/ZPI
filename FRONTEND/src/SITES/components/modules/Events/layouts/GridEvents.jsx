import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveMediaUrl } from '../../../../../config/api';
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import NewsletterSubscription from '../NewsletterSubscription';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

const formatShortDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = new Intl.DateTimeFormat('pl-PL', { day: '2-digit' }).format(date);
    const month = new Intl.DateTimeFormat('pl-PL', { month: 'short' }).format(date);
    return { day, month };
  } catch (error) {
    return { day: '', month: '' };
  }
};

const isEventPast = (dateString) => {
  if (!dateString) return false;
  try {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  } catch (error) {
    return false;
  }
};

const GridEvents = ({ content, style, siteIdentifier, eventsStatus = 'static', isEditing, moduleId, pageId }) => {
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

  const handleTitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { title: newValue });
  };

  const handleSubtitleSave = (newValue) => {
    updateModuleContent(pageId, moduleId, { subtitle: newValue });
  };

  const { 
    title, 
    subtitle, 
    events = [], 
    showNewsletter = false,
    bgColor, 
    accentColor, 
    textColor, 
    backgroundImage, 
    backgroundOverlayColor 
  } = content;
  const [activeEvent, setActiveEvent] = useState(null);
  const isLoading = eventsStatus === 'loading';
  const hasError = eventsStatus === 'error';

  // Filter out past events
  const upcomingEvents = events.filter(event => !isEventPast(event.date));

  // Sort events by date
  const sortedEvents = [...upcomingEvents].sort((a, b) => {
    const dateA = new Date(a.date || '9999-12-31');
    const dateB = new Date(b.date || '9999-12-31');
    return dateA - dateB;
  });

  return (
    <section className={`relative ${style.spacing} py-12 px-4 md:py-20 md:px-6`} style={{ backgroundColor: bgColor || style.background }}>
      <BackgroundMedia media={backgroundImage} overlayColor={backgroundOverlayColor} />
      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        {(title || subtitle) && (
          <div className="text-center space-y-3">
            {(isEditing || title) && (
              isEditing ? (
                <EditableText
                  value={title || ''}
                  onSave={handleTitleSave}
                  as="h2"
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold"
                  style={{ color: textColor || style.text }}
                  placeholder="Click to edit title..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <h2 className={`text-3xl md:text-4xl lg:text-5xl font-semibold`} style={{ color: textColor || style.text }}>
                  {title}
                </h2>
              )
            )}
            {(isEditing || subtitle) && (
              isEditing ? (
                <EditableText
                  value={subtitle || ''}
                  onSave={handleSubtitleSave}
                  as="p"
                  className={`${style.textSize} opacity-70`}
                  style={{ color: textColor || style.text }}
                  placeholder="Click to edit subtitle..."
                  multiline
                  isModuleSelected={true}
                />
              ) : (
                <p className={`${style.textSize} opacity-70`} style={{ color: textColor || style.text }}>
                  {subtitle}
                </p>
              )
            )}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-6 text-sm opacity-70">
            Ładuję wydarzenia...
          </div>
        )}

        {hasError && (
          <div className="text-center py-6 text-sm text-red-600">
            Nie udało się wczytać wydarzeń. Spróbuj ponownie później.
          </div>
        )}

        {sortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event, index) => {
              const dateInfo = formatShortDate(event.date);
              
              return (
                <motion.button
                  key={event.id || index}
                  onClick={() => setActiveEvent(event)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className={`text-left bg-white ${style.shadows} ${style.rounded} overflow-hidden border border-black/5 hover:border-transparent hover:shadow-2xl ${style.animations} group`}
                >
                  {/* Date Badge */}
                  <div className="relative h-32" style={{ backgroundColor: accentColor || style.primary }}>
                    <div className="absolute top-4 right-4 bg-white text-center px-4 py-2 rounded-lg shadow-md">
                      <div className="text-2xl font-bold" style={{ color: accentColor || style.primary }}>
                        {dateInfo.day}
                      </div>
                      <div className="text-xs uppercase tracking-wide opacity-70" style={{ color: textColor || style.text }}>
                        {dateInfo.month}
                      </div>
                    </div>
                    
                    {event.tag && (
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                          {event.tag}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-semibold group-hover:translate-x-1 transition-transform" style={{ color: textColor || style.text }}>
                      {event.title || 'Nowe wydarzenie'}
                    </h3>
                    
                    {event.summary && (
                      <p 
                        className="text-sm opacity-70 leading-relaxed line-clamp-3" 
                        style={{ color: textColor || style.text }}
                        dangerouslySetInnerHTML={{ __html: event.summary }} 
                      />
                    )}
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs opacity-60" style={{ color: textColor || style.text }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="uppercase tracking-wide">{event.location}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all" style={{ color: accentColor || style.primary }}>
                      <span>Szczegóły</span>
                      <span aria-hidden className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (!isLoading && !hasError && (
          <div className="text-center py-16 text-sm text-black/40">
            Brak nadchodzących wydarzeń.
          </div>
        ))}

        {showNewsletter && (
          <NewsletterSubscription 
            siteIdentifier={siteIdentifier}
            accentColor={accentColor || style.primary}
            textColor={textColor || style.text}
          />
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
              className={`max-w-3xl w-full max-h-[85vh] overflow-y-auto bg-white ${style.rounded} ${style.shadows} p-8 relative`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={`absolute top-5 right-5 w-10 h-10 ${style.rounded} bg-black/5 flex items-center justify-center text-2xl hover:bg-black/10 ${style.animations}`}
                onClick={() => setActiveEvent(null)}
              >
                ×
              </button>

              <div className="space-y-6" style={{ color: textColor || style.text }}>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider" style={{ color: accentColor || style.primary }}>
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
                      const resolvedImage = resolveMediaUrl(image);
                      return resolvedImage && resolvedImage.trim() !== '' ? (
                        <div key={index} className={`${style.rounded} overflow-hidden`}>
                          <img src={resolvedImage} alt={`${activeEvent.title} ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ) : null;
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
  );
};

export default GridEvents;
