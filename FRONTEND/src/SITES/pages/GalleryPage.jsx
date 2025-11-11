import React from 'react'
import GalleryModule from '../components/modules/Gallery'
import { STYLES, DEFAULT_STYLE_ID } from '../styles'
import composeSiteStyle from '../styles/utils'

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

  const style = composeSiteStyle(DEFAULT_STYLE_ID)

  return (
    <div className="min-h-screen bg-background">
      <GalleryModule 
        layout="masonry"
        content={galleryContent}
        style={style}
      />
    </div>
  )
}

export default GalleryPage
