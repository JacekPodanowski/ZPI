import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'
import { resolveMediaUrl } from '../config/api'
import { deleteMediaAsset } from '../services/mediaService'
import { isVideoUrl } from '../utils/mediaUtils'
import useEditorStore from '../STUDIO/store/editorStore'
import { storeTempImage, isTempBlobUrl } from '../services/tempMediaCache'

const ImageUploader = ({ label, value, onChange, aspectRatio = '16/9', multiple = false, usage = 'site_content', siteId: explicitSiteId }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState(value || '')
  const fileInputRef = useRef(null)
  const editorSiteId = useEditorStore((state) => state.siteMeta?.id)
  const resolvedSiteId = explicitSiteId ?? editorSiteId ?? null

  const ensureUploadContext = useCallback(() => {
    if (usage === 'site_content' && !resolvedSiteId) {
      alert('Zapisz stronę, aby otrzymać identyfikator przed dodaniem multimediów.')
      return false
    }
    return true
  }, [resolvedSiteId, usage])

  const getDeletionContext = useCallback(() => {
    if (usage === 'site_content' && resolvedSiteId) {
      return { usage, siteId: resolvedSiteId }
    }
    return { usage }
  }, [resolvedSiteId, usage])

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return

    if (!ensureUploadContext()) {
      return
    }

    const cacheFileAndGetBlobUrl = async (file) => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')

      if (!isImage && !isVideo) {
        alert(`${file.name} is not a supported file type.`)
        return null
      }

      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 50MB.`)
        return null
      }

      // Store the file in the browser cache and get a blob URL
      const result = await storeTempImage(file)
      return result ? result.blobUrl : null
    }

    if (multiple) {
      const cachePromises = Array.from(files).map(file => cacheFileAndGetBlobUrl(file))
      const blobUrls = (await Promise.all(cachePromises)).filter(Boolean)
      if (blobUrls.length > 0) {
        onChange(blobUrls)
      }
    } else {
      const file = files[0]
      const blobUrl = await cacheFileAndGetBlobUrl(file)
      
      if (blobUrl) {
        // Use the blob URL for both preview and state
        setPreview(blobUrl)
        onChange(blobUrl)
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    void handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInput = (e) => {
    void handleFileSelect(e.target.files)
  }

  const handleUrlInput = () => {
    if (!ensureUploadContext()) {
      return
    }

    const url = prompt('Wklej URL obrazu lub wideo:')
    if (url) {
      const previousUrl = preview
      if (multiple) {
        onChange([url])
      } else {
        setPreview(url)
        onChange(url)
        if (previousUrl && previousUrl !== url) {
          void deleteMediaAsset(previousUrl, getDeletionContext())
        }
      }
    }
  }

  const handleRemove = () => {
    const previousUrl = preview
    setPreview('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (previousUrl) {
      void deleteMediaAsset(previousUrl, getDeletionContext())
    }
  }

  const resolvedPreview = resolveMediaUrl(preview)
  const previewIsVideo = isVideoUrl(preview)

  // Update preview when parent's value changes
  useEffect(() => {
    setPreview(value || '')
  }, [value])

  // Dla multiple nie pokazujemy podglądu - tylko upload area
  if (multiple) {
    return (
      <div className="space-y-3">
        {label && (
          <label className="block text-sm font-medium" style={{ color: 'rgb(30, 30, 30)' }}>
            {label}
          </label>
        )}

        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-300'
          }`}
          style={{ 
            aspectRatio,
            borderColor: isDragging ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.2)'
          }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <svg
              className="w-12 h-12 mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium mb-1" style={{ color: 'rgb(30, 30, 30)' }}>
              {isDragging ? 'Upuść pliki tutaj' : 'Kliknij lub przeciągnij obrazy lub wideo'}
            </p>
            <p className="text-xs opacity-50">PNG, JPG, GIF, MP4 do 50MB (wiele plików)</p>
          </div>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              handleUrlInput()
            }}
            className="flex-1 text-sm py-2"
          >
            📎 Wklej URL
          </Button>
        </div>
      </div>
    )
  }

  // Single mode - z podglądem
  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'rgb(30, 30, 30)' }}>
          {label}
        </label>
      )}

      <AnimatePresence>
        {preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden shadow-md"
            style={{ aspectRatio }}
          >
            {resolvedPreview && resolvedPreview.trim() !== '' ? (
              previewIsVideo ? (
                <video
                  src={resolvedPreview}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  Twoja przeglądarka nie obsługuje odtwarzania wideo.
                </video>
              ) : (
                <img
                  src={resolvedPreview}
                  alt="Podgląd"
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full grid place-items-center bg-black/5 text-sm text-black/40">
                Ładowanie...
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="secondary"
                onClick={handleClick}
                className="text-sm px-3 py-1"
                style={{ backgroundColor: 'white' }}
              >
                Zmień
              </Button>
              <Button
                variant="secondary"
                onClick={handleRemove}
                className="text-sm px-3 py-1"
                style={{ backgroundColor: 'white', color: 'rgb(146, 0, 32)' }}
              >
                Usuń
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-300'
            }`}
            style={{ 
              aspectRatio,
              borderColor: isDragging ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.2)'
            }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <svg
                className="w-12 h-12 mb-3 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium mb-1" style={{ color: 'rgb(30, 30, 30)' }}>
                {isDragging ? 'Upuść plik tutaj' : 'Kliknij lub przeciągnij obraz lub wideo'}
              </p>
              <p className="text-xs opacity-50">PNG, JPG, GIF, MP4 do 50MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {!preview && (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleUrlInput}
            className="flex-1 text-sm py-2"
          >
            📎 Wklej URL
          </Button>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
