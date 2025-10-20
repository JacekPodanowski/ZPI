import React from 'react'
import { motion } from 'framer-motion'
import { resolveMediaUrl } from '../../config/api'
import { isVideoUrl } from '../../utils/mediaUtils'

const ServicesModule = ({ config }) => {
  const {
    title = 'Nasze usługi',
    subtitle = 'Sprawdź jak możemy Cię wesprzeć',
    items = [],
    bgColor = '#FFFFFF',
    textColor = 'rgb(30, 30, 30)',
    accentColor = 'rgb(146, 0, 32)'
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
              className="rounded-3xl overflow-hidden bg-white shadow-md border border-black/5"
            >
              {item.image && (
                <div className="aspect-video overflow-hidden bg-black">
                  {isVideoUrl(item.image) ? (
                    <video
                      src={resolveMediaUrl(item.image)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      Twoja przeglądarka nie obsługuje odtwarzania wideo.
                    </video>
                  ) : (
                    <img src={resolveMediaUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              <div className="p-6 space-y-3" style={{ color: textColor }}>
                <span className="inline-flex items-center text-xs uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                  {item.category || 'Usługa'}
                </span>
                <h3 className="text-xl font-semibold">{item.name || 'Nowa usługa'}</h3>
                {item.description && (
                  <p className="text-sm opacity-75 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description }} />
                )}
              </div>
            </motion.article>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12 text-sm text-black/40">
            Dodaj usługi w konfiguratorze, aby zaprezentować ofertę.
          </div>
        )}
      </div>
    </section>
  )
}

export default ServicesModule
