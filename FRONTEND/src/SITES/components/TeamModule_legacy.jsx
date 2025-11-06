import React from 'react'
import { motion } from 'framer-motion'
import { resolveMediaUrl } from '../../config/api'
import { isVideoUrl } from '../../utils/mediaUtils'

const TeamModule = ({ config }) => {
  const {
    title = 'Poznaj nasz zespół',
    subtitle = 'Ludzie, którzy wspierają Cię w drodze do równowagi',
    members = [],
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const resolvedImage = resolveMediaUrl(member.image)
            const hasValidImage = resolvedImage && resolvedImage.trim() !== ''
            
            return (
              <motion.article
                key={member.id}
                className="relative rounded-3xl overflow-hidden shadow-lg group h-full bg-white"
                whileHover={{ y: -8 }}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                  {hasValidImage ? (
                    isVideoUrl(member.image) ? (
                      <video
                        src={resolvedImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      >
                        Twoja przeglądarka nie obsługuje odtwarzania wideo.
                      </video>
                    ) : (
                      <img
                        src={resolvedImage}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="w-full h-full grid place-items-center bg-black/5 text-sm text-black/40">
                      Dodaj zdjęcie
                    </div>
                  )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white opacity-0 translate-y-6 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  {member.bio && (
                    <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: member.bio }} />
                  )}
                </div>
              </div>
              <div className="p-6 space-y-2" style={{ color: textColor }}>
                <div>
                  <h3 className="text-xl font-semibold">{member.name || 'Nowa osoba'}</h3>
                  {member.role && (
                    <p className="text-sm uppercase tracking-[0.3em]" style={{ color: accentColor }}>
                      {member.role}
                    </p>
                  )}
                </div>
                {member.focus && (
                  <p className="text-sm opacity-70" dangerouslySetInnerHTML={{ __html: member.focus }} />
                )}
              </div>
            </motion.article>
            )
          })}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12 text-sm text-black/40">
            Dodaj członków w konfiguratorze, aby zaprezentować zespół.
          </div>
        )}
      </div>
    </section>
  )
}

export default TeamModule
