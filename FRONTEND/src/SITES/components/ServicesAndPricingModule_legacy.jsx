import React from 'react'
import { motion } from 'framer-motion'
import { resolveMediaUrl } from '../../config/api'
import { isVideoUrl } from '../../utils/mediaUtils'

const ServicesAndPricingModule = ({ config }) => {
  const {
    title = 'Oferta',
    subtitle = 'Sprawdź naszą ofertę i przejrzyste ceny',
    offers = [], // Combined services with prices
    currency = 'PLN',
    bgColor = '#FFFFFF',
    textColor = 'rgb(30, 30, 30)',
    accentColor = 'rgb(146, 0, 32)'
  } = config || {}

  const hasOffers = offers && offers.length > 0

  return (
    <section className="py-12 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
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

        {/* Offers Grid */}
        {hasOffers ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const resolvedImage = resolveMediaUrl(offer.image)
              const hasValidImage = resolvedImage && resolvedImage.trim() !== ''
              
              return (
                <motion.article
                  key={offer.id}
                  whileHover={{ y: -6 }}
                  className="rounded-3xl overflow-hidden bg-white shadow-lg border border-black/5"
                >
                  {hasValidImage && (
                    <div className="aspect-video overflow-hidden bg-black">
                      {isVideoUrl(offer.image) ? (
                        <video
                          src={resolvedImage}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        >
                          Twoja przeglądarka nie obsługuje odtwarzania wideo.
                        </video>
                      ) : (
                        <img src={resolvedImage} alt={offer.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                  <div className="p-6 space-y-4" style={{ color: textColor }}>
                    <div>
                      {offer.category && (
                        <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] mb-2" style={{ color: accentColor }}>
                          {offer.category}
                        </span>
                      )}
                      <h3 className="text-xl font-semibold">{offer.name || 'Nowa oferta'}</h3>
                      {offer.description && (
                        <p className="text-sm opacity-75 mt-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: offer.description }} />
                      )}
                    </div>
                    <div className="flex items-baseline justify-between pt-2 border-t border-black/10">
                      <span className="text-sm uppercase tracking-[0.2em] opacity-60">Cena</span>
                      <span className="text-2xl font-semibold" style={{ color: accentColor }}>
                        {offer.price ? `${offer.price} ${currency}` : 'Na zapytanie'}
                      </span>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-black/40">
            Dodaj oferty w konfiguratorze, aby wypełnić sekcję.
          </div>
        )}
      </div>
    </section>
  )
}

export default ServicesAndPricingModule
