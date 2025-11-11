import React from 'react';
import { motion } from 'framer-motion';

const CardsFAQ = ({ content, style }) => {
  const { title = 'Pytania i odpowiedzi', intro = '', items = [], bgColor, textColor } = content;

  return (
  <section className={`${style.spacing} py-12 px-4 md:py-20 md:px-6`} style={{ backgroundColor: bgColor || style.background }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {(title || intro) && (
          <div className="text-center space-y-3">
            {title && (
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-semibold`} style={{ color: textColor || style.text }}>
                {title}
              </h2>
            )}
            {intro && (
              <p className={style.textSize} style={{ color: textColor || style.text }}>
                {intro}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`${style.rounded} ${style.shadows} bg-white p-6 space-y-3`}
            >
              <h3 className="text-lg font-semibold" style={{ color: textColor || style.primary }}>
                {item.question}
              </h3>
              <div
                className="prose prose-sm max-w-none opacity-80"
                style={{ color: textColor || style.text }}
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
