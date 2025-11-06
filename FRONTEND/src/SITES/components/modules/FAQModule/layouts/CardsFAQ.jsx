import React from 'react';
import { motion } from 'framer-motion';

const CardsFAQ = ({ content, vibe, theme }) => {
  const { title = 'Pytania i odpowiedzi', intro = '', items = [], bgColor, textColor } = content;

  return (
    <section className={`${vibe.spacing} px-4`} style={{ backgroundColor: bgColor || theme.background }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {(title || intro) && (
          <div className="text-center space-y-3">
            {title && (
              <h2 className={`${vibe.headingSize} font-semibold`} style={{ color: textColor || theme.text }}>
                {title}
              </h2>
            )}
            {intro && (
              <p className={vibe.textSize} style={{ color: textColor || theme.text }}>
                {intro}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`${vibe.rounded} ${vibe.shadows} bg-white p-6 space-y-3`}
            >
              <h3 className="text-lg font-semibold" style={{ color: textColor || theme.primary }}>
                {item.question}
              </h3>
              <div
                className="prose prose-sm max-w-none opacity-80"
                style={{ color: textColor || theme.text }}
                dangerouslySetInnerHTML={{ __html: item.answer || '' }}
              />
            </motion.div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-10 text-sm opacity-40">
            Dodaj pytania w konfiguratorze.
          </div>
        )}
      </div>
    </section>
  );
};

export default CardsFAQ;
