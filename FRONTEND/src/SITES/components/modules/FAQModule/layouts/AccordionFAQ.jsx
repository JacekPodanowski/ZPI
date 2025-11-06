import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundMedia from '../../../../../components/BackgroundMedia';

const AccordionFAQ = ({ content, vibe, theme }) => {
  const { title = 'Najczęstsze pytania', intro = '', items = [], bgColor, textColor, backgroundImage, backgroundOverlayColor } = content;
  const [openId, setOpenId] = useState(items[0]?.id || null);
  const overlayColor = backgroundOverlayColor ?? (backgroundImage ? 'rgba(0, 0, 0, 0.35)' : undefined);

  const handleToggle = (id) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className={`${vibe.spacing} px-4 relative overflow-hidden`} style={{ backgroundColor: bgColor || theme.background }}>
      <BackgroundMedia media={backgroundImage} overlayColor={overlayColor} />
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {(title || intro) && (
          <div className="text-center space-y-3">
            {title && (
              <h2 className={`${vibe.headingSize} font-semibold`} style={{ color: textColor || theme.text }}>
                {title}
              </h2>
            )}
            {intro && (
              <p className={`${vibe.textSize} opacity-80`} style={{ color: textColor || theme.text }}>
                {intro}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3 }}
              className={`${vibe.rounded} border border-black/5 bg-white/80 ${vibe.shadows}`}
            >
              <button
                onClick={() => handleToggle(item.id)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-6"
                style={{ color: textColor || theme.text }}
              >
                <span className="text-lg font-medium">{item.question}</span>
                <motion.span
                  animate={{ rotate: openId === item.id ? 45 : 0 }}
                  className="text-2xl leading-none"
                  style={{ color: textColor || theme.text }}
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {openId === item.id && (
                  <motion.div
                    key={`${item.id}-answer`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="px-6 pb-6 overflow-hidden"
                  >
                    <div
                      className="prose prose-sm max-w-none"
                      style={{ color: textColor || theme.text }}
                      dangerouslySetInnerHTML={{ __html: item.answer || '' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-10 text-sm text-black/40">
              Dodaj pytania w konfiguratorze.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AccordionFAQ;
