import React, { useState, useEffect, useRef } from 'react'

const JsonFilePicker = ({ currentFile, onFileChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [availableFiles, setAvailableFiles] = useState([])
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Fetch list of JSON files from the public folder
    const fetchJsonFiles = async () => {
      try {
        // Get all JSON files from public folder
        // In development, we'll hardcode the known files
        // In production, this could be fetched from a manifest
        const files = ['json_test.json', 'strona-dla-ejaja.json']
        setAvailableFiles(files)
      } catch (err) {
        console.error('Error fetching JSON files:', err)
      }
    }

    fetchJsonFiles()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleFileSelect = (file) => {
    if (file !== currentFile) {
      onFileChange(file)
      setIsOpen(false)
    }
  }

  return (
    <div className="fixed top-4 left-4 z-50" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-neutral-200"
        title="Wybierz plik JSON"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-neutral-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-14 left-0 w-64 bg-white rounded-lg shadow-2xl border border-neutral-200 overflow-hidden animate-fadeIn">
          <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Wybierz plik JSON
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {availableFiles.length === 0 ? (
              <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                Brak dostępnych plików
              </div>
            ) : (
              <ul>
                {availableFiles.map((file) => (
                  <li key={file}>
                    <button
                      onClick={() => handleFileSelect(file)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        file === currentFile
                          ? 'bg-neutral-900 text-white'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {file}
                        </span>
                        {file === currentFile && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 flex-shrink-0 ml-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default JsonFilePicker
