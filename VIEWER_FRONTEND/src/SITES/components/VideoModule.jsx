import React from 'react'
import { motion } from 'framer-motion'

const normaliseVideoUrl = (rawUrl = '') => {
  if (!rawUrl) return ''
  const url = rawUrl.trim()

  if (url.startsWith('<iframe')) {
    const match = url.match(/src=["']([^"']+)/i)
    if (match && match[1]) {
      return match[1]
    }
  }

  if (url.includes('youtube.com/embed') || url.includes('player.vimeo.com')) {
    return url
  }

  if (url.includes('youtube.com/watch')) {
    return url.replace('watch?v=', 'embed/')
  }

  if (url.includes('youtu.be/')) {
    const [, idWithParams = ''] = url.split('youtu.be/')
    if (!idWithParams) return ''
    const [id, params] = idWithParams.split('?')
    const query = params ? `?${params}` : ''
    return `https://www.youtube.com/embed/${id}${query}`
  }

  if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
    const [, idWithParams = ''] = url.split('vimeo.com/')
    if (!idWithParams) return ''
    const [id, params] = idWithParams.split('?')
    const query = params ? `?${params}` : ''
    return `https://player.vimeo.com/video/${id}${query}`
  }

  return url
}

const applyPlaybackPreferences = (rawUrl, options = {}) => {
  if (!rawUrl) return ''

  try {
    const url = new URL(rawUrl)
    const host = url.hostname

    if (options.muted) {
      if (host.includes('youtube.com')) {
        url.searchParams.set('mute', '1')
        url.searchParams.set('playsinline', url.searchParams.get('playsinline') || '1')
      }

      if (host.includes('player.vimeo.com')) {
        url.searchParams.set('muted', '1')
      }
    }

    return url.toString()
  } catch (error) {
    return rawUrl
  }
}

const VideoModule = ({ config }) => {
  const { videoUrl, caption, captionColor, bgColor, muted } = config || {}
  const embedUrl = applyPlaybackPreferences(normaliseVideoUrl(videoUrl), { muted })

  return (
    <section className="py-12 px-6" style={{ backgroundColor: bgColor || 'transparent' }}>
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black/20"
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={caption || 'Embedded Video'}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-sm text-gray-500 bg-white/60">
              Ustaw adres URL wideo w konfiguratorze
            </div>
          )}
        </motion.div>
        {caption && (
          <p
            className="text-sm text-center max-w-3xl"
            style={{ color: captionColor || 'rgb(75, 85, 99)' }}
          >
            {caption}
          </p>
        )}
      </div>
    </section>
  )
}

export default VideoModule
