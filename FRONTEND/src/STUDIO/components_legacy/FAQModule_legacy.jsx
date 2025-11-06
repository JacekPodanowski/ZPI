import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQModule = ({ config }) => {
  const {
    title = 'Najczęstsze pytania',
    intro = '',
    items = [],
    bgColor = '#FFFFFF',
    textColor = 'rgb(30, 30, 30)'
  } = config || {}

  const [openId, setOpenId] = useState(items[0]?.id || null)

  const handleToggle = (id) => {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <section className="py-12 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {(title || intro) && (
          <div className="text-center space-y-3">
            {title && (
              <h2 className="text-3xl font-semibold" style={{ color: textColor }}>
                {title}
              </h2>
            )}
            {intro && (
              <p className="text-base opacity-80" style={{ color: textColor }}>
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
              className="rounded-2xl border border-black/5 bg-white/80 shadow-sm"
            >
              <button
                onClick={() => handleToggle(item.id)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-6"
                style={{ color: textColor }}
              >
                <span className="text-lg font-medium">{item.question}</span>
                <motion.span
                  animate={{ rotate: openId === item.id ? 45 : 0 }}
                  className="text-2xl leading-none"
                  style={{ color: textColor }}
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
                      style={{ color: textColor }}
                      dangerouslySetInnerHTML={{ __html: item.answer || '' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-10 text-sm text-black/40">
              Dodaj pytania w konfiguratorze, aby wyświetlić sekcję FAQ.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FAQModule
