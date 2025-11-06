import React from 'react'
import GalleryModule from '../components/modules/GalleryModule'
import { VIBES } from '../vibes'
import { themeDefinitions } from '../../theme/themeDefinitions'
import { createTheme } from '../../theme/colorSystem'

const GalleryPage = () => {
  const galleryContent = {
    images: [
      { url: 'https://via.placeholder.com/400x600', caption: 'Zdjęcie 1' },
      { url: 'https://via.placeholder.com/400x400', caption: 'Zdjęcie 2' },
      { url: 'https://via.placeholder.com/400x500', caption: 'Zdjęcie 3' },
    ],
    columns: 3,
    gap: '1rem'
  }

  const theme = createTheme(themeDefinitions.modernWellness, 'light')
  const vibe = VIBES.vibe1

  return (
    <div className="min-h-screen bg-background">
      <GalleryModule 
        layout="masonry"
        content={galleryContent}
        vibe={vibe}
        theme={theme}
      />
    </div>
  )
}

export default GalleryPage
