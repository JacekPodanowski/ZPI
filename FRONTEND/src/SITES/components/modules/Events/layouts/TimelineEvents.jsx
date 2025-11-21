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

const formatShortDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: 'short'
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

const TimelineEvents = ({ content, style, siteIdentifier }) => {
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
      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
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

        {sortedEvents.length > 0 ? (
          <div className="relative">
            {/* Vertical timeline line */}
            <div 
              className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 transform md:-translate-x-1/2"
              style={{ backgroundColor: accentColor || style.primary, opacity: 0.2 }}
            />

            <div className="space-y-12 md:space-y-16">
              {sortedEvents.map((event, index) => {
                const isLeft = index % 2 === 0;
                
                return (
                  <motion.div
                    key={event.id || index}
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* Timeline dot */}
                    <div 
                      className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 z-10 ring-4"
                      style={{ 
                        backgroundColor: accentColor || style.primary,
                        ringColor: bgColor || style.background
                      }}
                    />

                    {/* Arrow pointing to event */}
                    <div className={`hidden md:block absolute top-1/2 ${isLeft ? 'left-1/2 ml-2' : 'right-1/2 mr-2'} transform -translate-y-1/2`}>
                      <svg
                        width="40"
                        height="20"
                        viewBox="0 0 40 20"
                        fill="none"
                        className={isLeft ? '' : 'rotate-180'}
                      >
                        <path
                          d="M0 10 L30 10 L25 5 M30 10 L25 15"
                          stroke={accentColor || style.primary}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.4"
                        />
                      </svg>
                    </div>

                    {/* Event card */}
                    <div className={`flex-1 pl-16 md:pl-0 ${isLeft ? 'md:pr-16' : 'md:pl-16'}`}>
                      <motion.button
                        onClick={() => setActiveEvent(event)}
                        whileHover={{ scale: 1.02 }}
                        className={`w-full text-left bg-white ${style.shadows} ${style.rounded} p-6 flex flex-col sm:flex-row gap-4 items-start border border-black/5 hover:border-transparent hover:shadow-xl ${style.animations}`}
                      >
                        <div className={`flex flex-col items-center justify-center ${style.rounded} px-4 py-3 text-white shrink-0`} style={{ backgroundColor: accentColor || style.primary }}>
                          <span className="text-xs uppercase tracking-wider opacity-90">{event.tag || 'Wydarzenie'}</span>
                          <span className="text-sm font-semibold mt-1">
                            {event.date ? formatShortDate(event.date) : 'TBD'}
                          </span>
                        </div>
                        <div className="flex-1 space-y-2" style={{ color: textColor || style.text }}>
                          <h3 className="text-xl font-semibold">{event.title || 'Nowe wydarzenie'}</h3>
                          {event.summary && (
                            <p className="text-sm opacity-80 leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{ __html: event.summary }} />
                          )}
                          {event.location && (
                            <p className="text-xs uppercase tracking-wider opacity-60">{event.location}</p>
                          )}
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-sm text-black/40">
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

export default TimelineEvents;
