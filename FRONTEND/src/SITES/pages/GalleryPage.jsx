import React from 'react'
import GalleryModule from '../components/GalleryModule'

const GalleryPage = () => {
  const galleryConfig = {
    images: [
      { url: 'https://via.placeholder.com/400x600', caption: 'Zdjęcie 1' },
      { url: 'https://via.placeholder.com/400x400', caption: 'Zdjęcie 2' },
      { url: 'https://via.placeholder.com/400x500', caption: 'Zdjęcie 3' },
    ],
    columns: 3,
    gap: '1rem',
    style: 'masonry'
  }

  return (
    <div className="min-h-screen bg-background">
      <GalleryModule config={galleryConfig} />
    </div>
  )
}

export default GalleryPage
