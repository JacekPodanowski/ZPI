import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveMediaUrl } from '../../../../../config/api';
import BackgroundMedia from '../../../../../components/BackgroundMedia';
import NewsletterSubscription from '../NewsletterSubscription';

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

const ListEvents = ({ content, style, siteIdentifier, eventsStatus = 'static' }) => {
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

  return (
    <section className={`relative ${style.spacing} py-12 px-4 md:py-20 md:px-6`} style={{ backgroundColor: bgColor || style.background }}>
      <BackgroundMedia media={backgroundImage} overlayColor={backgroundOverlayColor} />
      <div className="relative z-10 max-w-5xl mx-auto space-y-10">
        {(title || subtitle) && (
          <div className="text-center space-y-3">
            {title && (
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-semibold`} style={{ color: textColor || style.text }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`${style.textSize} opacity-70`} style={{ color: textColor || style.text }}>
                {subtitle}
              </p>
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

        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <motion.button
              key={event.id}
              onClick={() => setActiveEvent(event)}
              whileHover={{ scale: 1.01 }}
              className={`w-full text-left bg-white ${style.shadows} ${style.rounded} px-4 py-4 sm:px-6 sm:py-6 flex flex-col md:flex-row gap-4 sm:gap-6 items-start border border-black/5 hover:border-transparent hover:shadow-xl ${style.animations}`}
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`flex flex-col items-center justify-center ${style.rounded} px-5 py-3 text-white`} style={{ backgroundColor: accentColor || style.primary }}>
                  <span className="text-xs uppercase tracking-[0.2em]">{event.tag || 'Data'}</span>
                  <span className="text-lg font-semibold">
                    {event.date ? formatDate(event.date) : 'Wkrótce'}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-2" style={{ color: textColor || style.text }}>
                <h3 className="text-2xl font-semibold">{event.title || 'Nowe wydarzenie'}</h3>
                {event.summary && (
                  <p className="text-sm opacity-80 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.summary }} />
                )}
                {event.location && (
                  <p className="text-xs uppercase tracking-[0.3em] opacity-60">{event.location}</p>
                )}
              </div>
              <div className="ml-auto hidden md:flex items-center gap-2 text-sm font-medium" style={{ color: accentColor || style.primary }}>
                Szczegóły
                <span aria-hidden>→</span>
              </div>
            </motion.button>
          ))}
        </div>

        {upcomingEvents.length === 0 && !isLoading && !hasError && (
          <div className="text-center py-10 text-sm text-black/40">
            Brak nadchodzących wydarzeń.
          </div>
        )}

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
                className={`absolute top-5 right-5 w-10 h-10 ${style.rounded} bg-black/5 flex items-center justify-center text-2xl`}
                onClick={() => setActiveEvent(null)}
              >
                ×
              </button>

              <div className="space-y-6" style={{ color: textColor || style.text }}>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em]" style={{ color: accentColor || style.primary }}>
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

export default ListEvents;
