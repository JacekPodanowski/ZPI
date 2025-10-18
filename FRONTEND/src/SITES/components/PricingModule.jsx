import React from 'react'
import { motion } from 'framer-motion'
import { resolveMediaUrl } from '../../config/api'

const PricingModule = ({ config }) => {
  const {
    title = 'Cennik',
    subtitle = 'Wybierz najlepszą opcję dla siebie',
    currency = 'PLN',
    items = [],
    bgColor = '#FFFFFF',
    accentColor = 'rgb(146, 0, 32)',
    textColor = 'rgb(30, 30, 30)'
  } = config || {}

  return (
    <section className="py-12 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto space-y-10">
        {(title || subtitle) && (
          <div className="text-center space-y-3">
            {title && (
              <h2 className="text-3xl font-semibold" style={{ color: textColor }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base opacity-70" style={{ color: textColor }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <motion.article
              key={item.id}
              whileHover={{ y: -6 }}
              className="rounded-3xl overflow-hidden bg-white shadow-lg border border-black/5"
            >
              {item.image && (
                <div className="aspect-video overflow-hidden">
                  <img src={resolveMediaUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 space-y-4" style={{ color: textColor }}>
                <div>
                  <h3 className="text-xl font-semibold">{item.name || 'Nowa pozycja'}</h3>
                  {item.description && (
                    <p className="text-sm opacity-75 mt-2" dangerouslySetInnerHTML={{ __html: item.description }} />
                  )}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm uppercase tracking-[0.2em] opacity-60">Cena</span>
                  <span className="text-2xl font-semibold" style={{ color: accentColor }}>
                    {item.price ? `${item.price} ${currency}` : 'Na zapytanie'}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12 text-sm text-black/40">
            Dodaj pozycje cenowe w konfiguratorze, aby wypełnić sekcję.
          </div>
        )}
      </div>
    </section>
  )
}

export default PricingModule
