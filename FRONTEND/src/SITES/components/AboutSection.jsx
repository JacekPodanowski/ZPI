import { motion } from 'framer-motion'
import { resolveMediaUrl } from '../../config/api'
import { isVideoUrl } from '../../utils/mediaUtils'
import ResponsiveImage from './ResponsiveImage'

const AboutSection = ({ config, thumbnails = {} }) => {
  const { title, description, imageUrl, avatar, bgColor, email, phone } = config
  const primaryMedia = imageUrl || avatar
  const fallbackImage = imageUrl && avatar && imageUrl !== avatar ? avatar : ''
  const primaryIsVideo = isVideoUrl(primaryMedia)

  return (
    <section className="py-20 px-4" style={{ backgroundColor: bgColor || 'rgb(228, 229, 218)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'rgb(30, 30, 30)' }}>
              {title}
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgb(30, 30, 30)' }}>
              {description}
            </p>
            
            {/* Contact Info */}
            {(email || phone) && (
              <div className="space-y-4 mt-8">
                {email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center">
                      <span className="text-white text-lg">📧</span>
                    </div>
                    <a 
                      href={`mailto:${email}`} 
                      className="text-lg hover:underline"
                      style={{ color: 'rgb(146, 0, 32)' }}
                    >
                      {email}
                    </a>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center">
                      <span className="text-white text-lg">📱</span>
                    </div>
                    <a 
                      href={`tel:${phone}`} 
                      className="text-lg hover:underline"
                      style={{ color: 'rgb(146, 0, 32)' }}
                    >
                      {phone}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Obrazek lub wideo albo placeholder */}
          <div className="rounded-xl h-96 overflow-hidden shadow-lg bg-black">
            {primaryMedia ? (() => {
              const resolvedMedia = resolveMediaUrl(primaryMedia)
              const hasValidMedia = resolvedMedia && resolvedMedia.trim() !== ''
              
              if (!hasValidMedia) {
                return (
                  <div 
                    className="w-full h-full grid place-items-center text-sm opacity-40"
                    style={{ color: textColor }}
                  >
                    Dodaj zdjęcie lub wideo w konfiguratorze
                  </div>
                )
              }
              
              return primaryIsVideo ? (
                <video
                  src={resolvedMedia}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={fallbackImage ? resolveMediaUrl(fallbackImage) : undefined}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ResponsiveImage
                  src={primaryMedia}
                  thumbnails={thumbnails}
                  alt={title}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )
            })() : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, rgb(146, 0, 32) 0%, rgb(200, 50, 80) 100%)' 
                }}
              >
                <span className="text-8xl text-white">👤</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
