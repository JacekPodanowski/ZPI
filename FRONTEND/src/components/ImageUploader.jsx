import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

const ImageUploader = ({ label, value, onChange, aspectRatio = '16/9' }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState(value || '')
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Proszę wybrać plik obrazu')
      return
    }

    // Walidacja rozmiaru (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Plik jest za duży. Maksymalny rozmiar to 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target.result
      setPreview(imageUrl)
      onChange(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
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
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  const handleUrlInput = () => {
    const url = prompt('Wklej URL obrazu:')
    if (url) {
      setPreview(url)
      onChange(url)
    }
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'rgb(30, 30, 30)' }}>
          {label}
        </label>
      )}

      {/* Podgląd obrazu */}
      <AnimatePresence>
        {preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden shadow-md"
            style={{ aspectRatio }}
          >
            <img
              src={preview}
              alt="Podgląd"
              className="w-full h-full object-cover"
            />
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
                {isDragging ? 'Upuść plik tutaj' : 'Kliknij lub przeciągnij obraz'}
              </p>
              <p className="text-xs opacity-50">PNG, JPG, GIF do 5MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ukryty input file */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Opcje dodatkowe */}
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
