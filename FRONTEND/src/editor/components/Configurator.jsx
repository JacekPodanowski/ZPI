import React, { useState, useRef } from 'react'
import useEditorStore from '../../store/editorStore'
import ColorPicker from '../../components/ColorPicker'
import ImageUploader from '../../components/ImageUploader'

const Configurator = () => {
  const { 
    selectedModule, 
    selectedChild,
    templateConfig, 
    updateModuleConfig, 
    currentPage, 
    removeModule, 
    expertMode 
  } = useEditorStore()

  const currentPageData = templateConfig.pages[currentPage] || templateConfig.pages.home
  const module = currentPageData?.modules?.find((m) => m.id === selectedModule)

  const [editingCaption, setEditingCaption] = useState(null)
  const [expandedChild, setExpandedChild] = useState(null)
  const dragCounter = useRef(0)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Jeśli zaznaczono dziecko, użyj jego danych
  const isEditingChild = selectedChild !== null
  const childData = isEditingChild && module?.config?.children?.[selectedChild.childIndex]

  const handleConfigChange = (key, value) => {
    updateModuleConfig(selectedModule, { [key]: value })
  }

  const handleChildConfigChange = (childIndex, key, value) => {
    const children = [...(module.config?.children || [])]
    children[childIndex] = {
      ...children[childIndex],
      config: {
        ...children[childIndex].config,
        [key]: value
      }
    }
    handleConfigChange('children', children)
  }

  if (!selectedModule || !module) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center" style={{ color: 'rgba(30, 30, 30, 0.5)' }}>
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <p className="text-lg font-medium mb-2">Wybierz sekcję do edycji</p>
        <p className="text-sm">Kliknij na dowolną sekcję po lewej stronie lub bezpośrednio na podglądzie</p>
      </div>
    )
  }

  // Jeśli edytujemy dziecko - pokaż tylko jego ustawienia
  if (isEditingChild && childData) {
    return (
      <div className="h-full flex flex-col">
        {/* Header dla dziecka */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => useEditorStore.getState().selectModule(selectedModule)}
              className="p-1 hover:bg-gray-100 rounded transition-all"
              title="Wróć do kontenera"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold" style={{ color: 'rgb(30, 30, 30)' }}>
                {childData.type === 'text' && '📝 Tekst'}
                {childData.type === 'button' && '🔘 Przycisk'}
                {childData.type === 'gallery' && '🖼️ Galeria'}
                {childData.type === 'spacer' && '↕️ Odstęp'}
              </h2>
              <p className="text-xs opacity-60 mt-1">
                Element w kontenerze: {module.name}
              </p>
            </div>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'rgb(146, 0, 32)' }}
            />
          </div>
        </div>

        {/* Content - ustawienia dziecka */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Edycja Text */}
          {childData.type === 'text' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                  Treść
                </label>
                <textarea
                  value={childData.config?.content || ''}
                  onChange={(e) => handleChildConfigChange(selectedChild.childIndex, 'content', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    borderColor: 'rgba(30, 30, 30, 0.2)',
                    '--tw-ring-color': 'rgb(146, 0, 32)'
                  }}
                  placeholder="Wpisz tekst..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                  Rozmiar czcionki
                </label>
                <input
                  type="text"
                  value={childData.config?.fontSize || '16px'}
                  onChange={(e) => handleChildConfigChange(selectedChild.childIndex, 'fontSize', e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'rgba(30, 30, 30, 0.2)',
                    '--tw-ring-color': 'rgb(146, 0, 32)'
                  }}
                  placeholder="16px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                  Wyrównanie
                </label>
                <select
                  value={childData.config?.align || 'left'}
                  onChange={(e) => handleChildConfigChange(selectedChild.childIndex, 'align', e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'rgba(30, 30, 30, 0.2)',
                    '--tw-ring-color': 'rgb(146, 0, 32)'
                  }}
                >
                  <option value="left">Do lewej</option>
                  <option value="center">Do środka</option>
                  <option value="right">Do prawej</option>
                </select>
              </div>
              
              {/* Flex Grow - wypełnianie dostępnego miejsca */}
              <label 
                className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all"
                style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}
              >
                <input
                  type="checkbox"
                  checked={childData.config?.flexGrow === true}
                  onChange={(e) => handleChildConfigChange(selectedChild.childIndex, 'flexGrow', e.target.checked)}
                  className="w-6 h-6 rounded"
                  style={{ accentColor: 'rgb(146, 0, 32)' }}
                />
                <div className="flex-1">
                  <span className="font-medium block">Wypełnij dostępne miejsce</span>
                  <p className="text-xs opacity-60 mt-1">Tekst będzie rozciągał się aby wypełnić wolną przestrzeń</p>
                </div>
              </label>

              <ColorPicker
                label="Kolor tekstu"
                value={childData.config?.textColor || 'rgb(30, 30, 30)'}
                onChange={(color) => handleChildConfigChange(selectedChild.childIndex, 'textColor', color)}
              />
            </>
          )}

          {/* Edycja Button */}
          {childData.type === 'button' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                  Tekst przycisku
                </label>
                <input
                  type="text"
                  value={childData.config?.text || ''}
                  onChange={(e) => handleChildConfigChange(selectedChild.childIndex, 'text', e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'rgba(30, 30, 30, 0.2)',
                    '--tw-ring-color': 'rgb(146, 0, 32)'
                  }}
                  placeholder="Kliknij mnie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                  Link
                </label>
                <input
                  type="text"
                  value={childData.config?.link || ''}
                  onChange={(e) => handleChildConfigChange(selectedChild.childIndex, 'link', e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'rgba(30, 30, 30, 0.2)',
                    '--tw-ring-color': 'rgb(146, 0, 32)'
                  }}
                  placeholder="https://..."
                />
              </div>
              <ColorPicker
                label="Kolor tła"
                value={childData.config?.bgColor || 'rgb(146, 0, 32)'}
                onChange={(color) => handleChildConfigChange(selectedChild.childIndex, 'bgColor', color)}
              />
              <ColorPicker
                label="Kolor tekstu"
                value={childData.config?.textColor || 'rgb(228, 229, 218)'}
                onChange={(color) => handleChildConfigChange(selectedChild.childIndex, 'textColor', color)}
              />
            </>
          )}

          {/* Edycja Spacer */}
          {childData.type === 'spacer' && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Wysokość odstępu
              </label>
              <input
                type="text"
                value={childData.config?.height || '2rem'}
                onChange={(e) => handleChildConfigChange(selectedChild.childIndex, 'height', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="2rem"
              />
            </div>
          )}

          {/* Edycja Gallery */}
          {childData.type === 'gallery' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                  Styl galerii
                </label>
                <select
                  value={childData.config?.style || 'grid'}
                  onChange={(e) => handleChildConfigChange(selectedChild.childIndex, 'style', e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'rgba(30, 30, 30, 0.2)',
                    '--tw-ring-color': 'rgb(146, 0, 32)'
                  }}
                >
                  <option value="grid">Siatka (Grid)</option>
                  <option value="masonry">Murowane (Masonry)</option>
                  <option value="slideshow">Pokaz slajdów (Slideshow)</option>
                  <option value="fade">Zanikanie (Fade)</option>
                  <option value="carousel">Karuzela (Carousel)</option>
                </select>
                <p className="text-xs mt-2 opacity-60">
                  {childData.config?.style === 'grid' && 'Równomierne kafelki w siatce'}
                  {childData.config?.style === 'masonry' && 'Dynamiczny układ pinterest-style'}
                  {childData.config?.style === 'slideshow' && 'Automatyczne przesuwanie zdjęć'}
                  {childData.config?.style === 'fade' && 'Płynne zanikanie między zdjęciami'}
                  {childData.config?.style === 'carousel' && 'Przewijana galeria pozioma'}
                </p>
              </div>

              {/* Liczba kolumn - tylko dla grid i masonry */}
              {(childData.config?.style === 'grid' || childData.config?.style === 'masonry' || !childData.config?.style) && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                    Liczba kolumn
                  </label>
                  <input
                    type="number"
                    value={childData.config?.columns || 3}
                    onChange={(e) => handleChildConfigChange(selectedChild.childIndex, 'columns', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: 'rgba(30, 30, 30, 0.2)',
                      '--tw-ring-color': 'rgb(146, 0, 32)'
                    }}
                    min="1"
                    max="6"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'rgb(30, 30, 30)' }}>
                  Dodaj zdjęcia
                </label>
                <ImageUploader
                  label=""
                  value=""
                  multiple={true}
                  onChange={(urls) => {
                    const currentImages = childData.config?.images || []
                    const newImages = urls.map(url => ({ url, caption: '' }))
                    handleChildConfigChange(selectedChild.childIndex, 'images', [...currentImages, ...newImages])
                  }}
                />
                <p className="text-xs mt-2 opacity-60">
                  💡 Możesz wybrać wiele zdjęć naraz (Ctrl/Cmd + klik) lub przeciągnąć kilka plików
                </p>
              </div>

              {/* Lista dodanych zdjęć */}
              {childData.config?.images && childData.config.images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium" style={{ color: 'rgb(30, 30, 30)' }}>
                      Dodane zdjęcia ({childData.config.images.length})
                    </p>
                    <button
                      onClick={() => {
                        // eslint-disable-next-line no-restricted-globals
                        if (confirm('Czy na pewno chcesz usunąć wszystkie zdjęcia?')) {
                          handleChildConfigChange(selectedChild.childIndex, 'images', [])
                        }
                      }}
                      className="text-xs px-3 py-1 rounded-lg border transition-all hover:bg-red-50"
                      style={{ 
                        borderColor: 'rgb(146, 0, 32)',
                        color: 'rgb(146, 0, 32)'
                      }}
                    >
                      Usuń wszystkie
                    </button>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {childData.config.images.map((item, idx) => {
                      const imgUrl = typeof item === 'string' ? item : item.url
                      const caption = typeof item === 'object' ? item.caption : ''
                      const isEditing = editingCaption === idx

                      return (
                        <div key={idx} className="bg-gray-50 rounded-lg group hover:bg-gray-100 transition-all">
                          {/* Image preview */}
                          <div className="flex items-center gap-3 p-2">
                            <div className="flex-shrink-0">
                              <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium opacity-60">Zdjęcie {idx + 1}</p>
                              <p className="text-xs truncate opacity-40">{imgUrl.substring(0, 40)}...</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Move up */}
                              {idx > 0 && (
                                <button
                                  onClick={() => {
                                    const images = [...childData.config.images]
                                    ;[images[idx], images[idx - 1]] = [images[idx - 1], images[idx]]
                                    handleChildConfigChange(selectedChild.childIndex, 'images', images)
                                  }}
                                  className="p-1.5 hover:bg-white rounded transition-all"
                                  title="Przesuń w górę"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                              )}
                              {/* Move down */}
                              {idx < childData.config.images.length - 1 && (
                                <button
                                  onClick={() => {
                                    const images = [...childData.config.images]
                                    ;[images[idx], images[idx + 1]] = [images[idx + 1], images[idx]]
                                    handleChildConfigChange(selectedChild.childIndex, 'images', images)
                                  }}
                                  className="p-1.5 hover:bg-white rounded transition-all"
                                  title="Przesuń w dół"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              )}
                              {/* Delete */}
                              <button
                                onClick={() => {
                                  const images = childData.config.images.filter((_, i) => i !== idx)
                                  handleChildConfigChange(selectedChild.childIndex, 'images', images)
                                }}
                                className="p-1.5 hover:bg-red-100 rounded transition-all"
                                style={{ color: 'rgb(146, 0, 32)' }}
                                title="Usuń"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Caption editor */}
                          <div className="px-2 pb-2">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={caption}
                                  onChange={(e) => {
                                    const images = [...childData.config.images]
                                    if (typeof images[idx] === 'string') {
                                      images[idx] = { url: images[idx], caption: e.target.value }
                                    } else {
                                      images[idx] = { ...images[idx], caption: e.target.value }
                                    }
                                    handleChildConfigChange(selectedChild.childIndex, 'images', images)
                                  }}
                                  placeholder="Dodaj opis zdjęcia..."
                                  className="flex-1 px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                                  style={{ 
                                    borderColor: 'rgba(30, 30, 30, 0.2)',
                                    '--tw-ring-color': 'rgb(146, 0, 32)'
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => setEditingCaption(null)}
                                  className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                                >
                                  ✓
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingCaption(idx)}
                                className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-white transition-all"
                                style={{ color: caption ? 'rgb(30, 30, 30)' : 'rgba(30, 30, 30, 0.4)' }}
                              >
                                {caption || '+ Dodaj opis'}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Akcje */}
          <div className="border-t pt-4" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
            <button
              onClick={() => {
                // eslint-disable-next-line no-restricted-globals
                if (confirm('Czy na pewno chcesz usunąć ten element?')) {
                  const children = module.config.children.filter((_, i) => i !== selectedChild.childIndex)
                  handleConfigChange('children', children)
                  useEditorStore.getState().selectModule(selectedModule)
                }
              }}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all hover:bg-red-50"
              style={{ borderColor: 'rgb(146, 0, 32)', color: 'rgb(146, 0, 32)' }}
            >
              🗑️ Usuń element
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Normalny widok dla modułu (nie dziecka)
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold" style={{ color: 'rgb(30, 30, 30)' }}>
            {module.name}
          </h2>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'rgb(146, 0, 32)' }}
            />
            {expertMode && module.type && (
              <button
                onClick={() => removeModule(module.id)}
                className="p-1.5 hover:bg-red-500 hover:bg-opacity-10 rounded transition-all"
                title="Usuń moduł"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgb(146, 0, 32)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="text-sm opacity-60">Edytuj ustawienia sekcji</p>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Expert Mode - Text Module */}
        {module.type === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Treść
              </label>
              <textarea
                value={module.config?.content || ''}
                onChange={(e) => handleConfigChange('content', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="Wpisz tekst..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Rozmiar czcionki
              </label>
              <input
                type="text"
                value={module.config?.fontSize || '16px'}
                onChange={(e) => handleConfigChange('fontSize', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="16px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Wyrównanie
              </label>
              <select
                value={module.config?.align || 'left'}
                onChange={(e) => handleConfigChange('align', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
              >
                <option value="left">Do lewej</option>
                <option value="center">Do środka</option>
                <option value="right">Do prawej</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Układ
              </label>
              <select
                value={module.config?.layout || 'block'}
                onChange={(e) => handleConfigChange('layout', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
              >
                <option value="block">Blokowy (pełna szerokość)</option>
                <option value="inline">W linii (obok innych)</option>
              </select>
              <p className="text-xs mt-1 opacity-60">
                Układ "w linii" pozwala umieścić element obok innych
              </p>
            </div>
            <ColorPicker
              label="Kolor tekstu"
              value={module.config?.textColor || 'rgb(30, 30, 30)'}
              onChange={(color) => handleConfigChange('textColor', color)}
            />
          </>
        )}

        {/* Expert Mode - Button Module */}
        {module.type === 'button' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Tekst przycisku
              </label>
              <input
                type="text"
                value={module.config?.text || ''}
                onChange={(e) => handleConfigChange('text', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="Kliknij mnie"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Link
              </label>
              <input
                type="text"
                value={module.config?.link || ''}
                onChange={(e) => handleConfigChange('link', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Układ
              </label>
              <select
                value={module.config?.layout || 'block'}
                onChange={(e) => handleConfigChange('layout', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
              >
                <option value="block">Blokowy (pełna szerokość)</option>
                <option value="inline">W linii (obok innych)</option>
              </select>
            </div>

            {module.config?.layout === 'block' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                  Wyrównanie
                </label>
                <select
                  value={module.config?.align || 'center'}
                  onChange={(e) => handleConfigChange('align', e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'rgba(30, 30, 30, 0.2)',
                    '--tw-ring-color': 'rgb(146, 0, 32)'
                  }}
                >
                  <option value="left">Do lewej</option>
                  <option value="center">Do środka</option>
                  <option value="right">Do prawej</option>
                </select>
              </div>
            )}
            
            <ColorPicker
              label="Kolor tła"
              value={module.config?.bgColor || 'rgb(146, 0, 32)'}
              onChange={(color) => handleConfigChange('bgColor', color)}
            />
            <ColorPicker
              label="Kolor tekstu"
              value={module.config?.textColor || 'rgb(228, 229, 218)'}
              onChange={(color) => handleConfigChange('textColor', color)}
            />
          </>
        )}

        {/* Expert Mode - Gallery Module */}
        {module.type === 'gallery' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Styl galerii
              </label>
              <select
                value={module.config?.style || 'grid'}
                onChange={(e) => handleConfigChange('style', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
              >
                <option value="grid">Siatka (Grid)</option>
                <option value="masonry">Murowane (Masonry)</option>
                <option value="slideshow">Pokaz slajdów (Slideshow)</option>
                <option value="fade">Zanikanie (Fade)</option>
                <option value="carousel">Karuzela (Carousel)</option>
              </select>
              <p className="text-xs mt-2 opacity-60">
                {module.config?.style === 'grid' && 'Równomierne kafelki w siatce'}
                {module.config?.style === 'masonry' && 'Dynamiczny układ pinterest-style'}
                {module.config?.style === 'slideshow' && 'Automatyczne przesuwanie zdjęć'}
                {module.config?.style === 'fade' && 'Płynne zanikanie między zdjęciami'}
                {module.config?.style === 'carousel' && 'Przewijana galeria pozioma'}
              </p>
            </div>

            {/* Liczba kolumn - tylko dla grid i masonry */}
            {(module.config?.style === 'grid' || module.config?.style === 'masonry' || !module.config?.style) && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                  Liczba kolumn
                </label>
                <input
                  type="number"
                  value={module.config?.columns || 3}
                  onChange={(e) => handleConfigChange('columns', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'rgba(30, 30, 30, 0.2)',
                    '--tw-ring-color': 'rgb(146, 0, 32)'
                  }}
                  min="1"
                  max="6"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'rgb(30, 30, 30)' }}>
                Dodaj zdjęcia
              </label>
              <ImageUploader
                label=""
                value=""
                multiple={true}
                onChange={(urls) => {
                  const currentImages = module.config?.images || []
                  // Konwertuj URL-e na obiekty z pustymi caption
                  const newImages = urls.map(url => ({ url, caption: '' }))
                  handleConfigChange('images', [...currentImages, ...newImages])
                }}
              />
              <p className="text-xs mt-2 opacity-60">
                💡 Możesz wybrać wiele zdjęć naraz (Ctrl/Cmd + klik) lub przeciągnąć kilka plików
              </p>
            </div>

            {/* Lista dodanych zdjęć */}
            {module.config?.images && module.config.images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium" style={{ color: 'rgb(30, 30, 30)' }}>
                    Dodane zdjęcia ({module.config.images.length})
                  </p>
                  <button
                    onClick={() => {
                      // eslint-disable-next-line no-restricted-globals
                      if (confirm('Czy na pewno chcesz usunąć wszystkie zdjęcia?')) {
                        handleConfigChange('images', [])
                      }
                    }}
                    className="text-xs px-3 py-1 rounded-lg border transition-all hover:bg-red-50"
                    style={{ 
                      borderColor: 'rgb(146, 0, 32)',
                      color: 'rgb(146, 0, 32)'
                    }}
                  >
                    Usuń wszystkie
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {module.config.images.map((item, idx) => {
                    // Obsługa starych formatów (string) i nowych (object)
                    const imgUrl = typeof item === 'string' ? item : item.url
                    const caption = typeof item === 'object' ? item.caption : ''
                    const isEditing = editingCaption === idx

                    return (
                      <div key={idx} className="bg-gray-50 rounded-lg group hover:bg-gray-100 transition-all">
                        {/* Image preview */}
                        <div className="flex items-center gap-3 p-2">
                          <div className="flex-shrink-0">
                            <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium opacity-60">Zdjęcie {idx + 1}</p>
                            <p className="text-xs truncate opacity-40">{imgUrl.substring(0, 40)}...</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Move up */}
                            {idx > 0 && (
                              <button
                                onClick={() => {
                                  const images = [...module.config.images]
                                  ;[images[idx], images[idx - 1]] = [images[idx - 1], images[idx]]
                                  handleConfigChange('images', images)
                                }}
                                className="p-1.5 hover:bg-white rounded transition-all"
                                title="Przesuń w górę"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                            )}
                            {/* Move down */}
                            {idx < module.config.images.length - 1 && (
                              <button
                                onClick={() => {
                                  const images = [...module.config.images]
                                  ;[images[idx], images[idx + 1]] = [images[idx + 1], images[idx]]
                                  handleConfigChange('images', images)
                                }}
                                className="p-1.5 hover:bg-white rounded transition-all"
                                title="Przesuń w dół"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            )}
                            {/* Delete */}
                            <button
                              onClick={() => {
                                const images = module.config.images.filter((_, i) => i !== idx)
                                handleConfigChange('images', images)
                              }}
                              className="p-1.5 hover:bg-red-100 rounded transition-all"
                              style={{ color: 'rgb(146, 0, 32)' }}
                              title="Usuń"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Caption editor */}
                        <div className="px-2 pb-2">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={caption}
                                onChange={(e) => {
                                  const images = [...module.config.images]
                                  if (typeof images[idx] === 'string') {
                                    images[idx] = { url: images[idx], caption: e.target.value }
                                  } else {
                                    images[idx] = { ...images[idx], caption: e.target.value }
                                  }
                                  handleConfigChange('images', images)
                                }}
                                placeholder="Dodaj opis zdjęcia..."
                                className="flex-1 px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                                style={{ 
                                  borderColor: 'rgba(30, 30, 30, 0.2)',
                                  '--tw-ring-color': 'rgb(146, 0, 32)'
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => setEditingCaption(null)}
                                className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingCaption(idx)}
                              className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-white transition-all"
                              style={{ color: caption ? 'rgb(30, 30, 30)' : 'rgba(30, 30, 30, 0.4)' }}
                            >
                              {caption || '+ Dodaj opis'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Expert Mode - Spacer Module */}
        {module.type === 'spacer' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Wysokość odstępu
              </label>
              <input
                type="text"
                value={module.config?.height || '2rem'}
                onChange={(e) => handleConfigChange('height', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="2rem"
              />
            </div>
          </>
        )}

        {/* Expert Mode - Container Module */}
        {module.type === 'container' && (
          <>
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(146, 0, 32, 0.1)' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📦</span>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1" style={{ color: 'rgb(30, 30, 30)' }}>
                    Kontener elementów
                  </p>
                  <p className="text-xs opacity-70">
                    Ułóż elementy poziomo lub pionowo. Przeciągnij elementy z lewego panelu lub dodaj poniżej.
                  </p>
                </div>
              </div>
            </div>

            {/* Kierunek - wizualne duże przyciski */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'rgb(30, 30, 30)' }}>
                Kierunek układania
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleConfigChange('direction', 'horizontal')}
                  className="p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: module.config?.direction === 'horizontal' ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.2)',
                    backgroundColor: module.config?.direction === 'horizontal' ? 'rgba(146, 0, 32, 0.1)' : 'white',
                    color: 'rgb(30, 30, 30)'
                  }}
                >
                  <div className="text-3xl mb-2">↔️</div>
                  <div className="text-sm font-medium">Poziomo</div>
                  <div className="text-xs opacity-60 mt-1">Obok siebie</div>
                </button>
                <button
                  onClick={() => handleConfigChange('direction', 'vertical')}
                  className="p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: module.config?.direction === 'vertical' ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.2)',
                    backgroundColor: module.config?.direction === 'vertical' ? 'rgba(146, 0, 32, 0.1)' : 'white',
                    color: 'rgb(30, 30, 30)'
                  }}
                >
                  <div className="text-3xl mb-2">↕️</div>
                  <div className="text-sm font-medium">Pionowo</div>
                  <div className="text-xs opacity-60 mt-1">Pod sobą</div>
                </button>
              </div>
            </div>

            {/* Odstęp - wizualne przyciski */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Odstęp
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: '0.5rem', label: 'Mały' },
                  { value: '1rem', label: 'Średni' },
                  { value: '1.5rem', label: 'Duży' },
                  { value: '2rem', label: 'Bardzo duży' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleConfigChange('gap', value)}
                    className="p-2 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: module.config?.gap === value ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.2)',
                      backgroundColor: module.config?.gap === value ? 'rgba(146, 0, 32, 0.1)' : 'white',
                      color: 'rgb(30, 30, 30)'
                    }}
                  >
                    <div className="text-xs font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Wyrównanie */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Wyrównanie
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'start', label: 'Początek', icon: '⬅️' },
                  { value: 'center', label: 'Środek', icon: '↔️' },
                  { value: 'end', label: 'Koniec', icon: '➡️' }
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => handleConfigChange('align', value)}
                    className="p-2 rounded-lg border-2 transition-all text-xs"
                    style={{
                      borderColor: module.config?.align === value ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.2)',
                      backgroundColor: module.config?.align === value ? 'rgba(146, 0, 32, 0.1)' : 'white',
                      color: 'rgb(30, 30, 30)'
                    }}
                  >
                    <div className="text-lg mb-1">{icon}</div>
                    <div>{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rozmieszczenie */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Rozmieszczenie
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'start', label: 'Do początku' },
                  { value: 'center', label: 'Do środka' },
                  { value: 'end', label: 'Do końca' },
                  { value: 'between', label: 'Rozłożone' },
                  { value: 'around', label: 'Równomiernie' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleConfigChange('justify', value)}
                    className="p-2 rounded-lg border-2 transition-all text-xs"
                    style={{
                      borderColor: module.config?.justify === value ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.2)',
                      backgroundColor: module.config?.justify === value ? 'rgba(146, 0, 32, 0.1)' : 'white',
                      color: 'rgb(30, 30, 30)'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zawijanie */}
            <label 
              className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all"
              style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}
            >
              <input
                type="checkbox"
                checked={module.config?.wrap !== false}
                onChange={(e) => handleConfigChange('wrap', e.target.checked)}
                className="w-6 h-6 rounded"
                style={{ accentColor: 'rgb(146, 0, 32)' }}
              />
              <div className="flex-1">
                <span className="font-medium block">Automatyczne zawijanie</span>
                <p className="text-xs opacity-60 mt-1">Elementy przejdą do nowej linii jeśli zabraknie miejsca</p>
              </div>
            </label>

            {/* LISTA ELEMENTÓW W KONTENERZE Z EDYCJĄ */}
            <div className="border-t pt-4 mt-4" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: 'rgb(30, 30, 30)' }}>
                  Elementy w kontenerze
                </p>
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(146, 0, 32, 0.1)', color: 'rgb(146, 0, 32)' }}>
                  {module.config?.children?.length || 0}
                </span>
              </div>
              
              {/* Drop zone dla drag & drop - POPRAWIONA */}
              <div 
                className="mb-4 p-4 rounded-xl border-2 border-dashed transition-all"
                style={{ 
                  borderColor: isDraggingOver ? 'rgb(146, 0, 32)' : 'rgba(146, 0, 32, 0.3)',
                  backgroundColor: isDraggingOver ? 'rgba(146, 0, 32, 0.05)' : 'transparent'
                }}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  dragCounter.current++
                  if (e.dataTransfer.types.includes('moduletype')) {
                    setIsDraggingOver(true)
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  dragCounter.current--
                  if (dragCounter.current === 0) {
                    setIsDraggingOver(false)
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  dragCounter.current = 0
                  setIsDraggingOver(false)
                  
                  const moduleType = e.dataTransfer.getData('moduleType')
                  if (moduleType) {
                    const defaultConfigs = {
                      text: { content: 'Nowy tekst', fontSize: '16px', textColor: 'rgb(30, 30, 30)', align: 'left' },
                      button: { text: 'Kliknij', link: '#', bgColor: 'rgb(146, 0, 32)', textColor: 'rgb(228, 229, 218)', align: 'center' },
                      spacer: { height: '2rem' },
                      gallery: { images: [], columns: 3, gap: '1rem', style: 'grid' }
                    }
                    const children = [...(module.config?.children || []), { type: moduleType, config: defaultConfigs[moduleType] }]
                    handleConfigChange('children', children)
                  }
                }}
              >
                <div className="text-center text-sm opacity-50 pointer-events-none">
                  <p className="mb-1">🎯 Przeciągnij tutaj element z lewego panelu</p>
                  <p className="text-xs">lub użyj przycisków poniżej</p>
                </div>
              </div>

              {/* Lista elementów z możliwością edycji */}
              {module.config?.children && module.config.children.length > 0 ? (
                module.config.children.map((child, index) => {
                  const isSelected = selectedChild?.childIndex === index
                  return (
                    <div
                      key={index}
                      className={`p-3 mb-2 rounded-lg transition-all border-2
                        ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50 border-transparent'}`}
                      style={{ borderColor: isSelected ? 'rgb(146, 0, 32)' : 'transparent' }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Ikona elementu */}
                        <div className="flex-shrink-0">
                          {child.type === 'text' && (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          )}
                          {child.type === 'button' && (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                          )}
                          {child.type === 'gallery' && (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          {child.type === 'spacer' && (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Info o elemencie - klikalne */}
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (isSelected) {
                              useEditorStore.getState().selectModule(selectedModule)
                            } else {
                              useEditorStore.getState().selectChild(selectedModule, index)
                            }
                          }}
                        >
                          <p className="text-sm font-medium capitalize" style={{ color: 'rgb(30, 30, 30)' }}>
                            {child.type}
                            {child.config?.flexGrow && <span className="ml-2 text-xs opacity-50">↔️ elastyczny</span>}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {child.type === 'text' && (child.config?.content || 'Pusty tekst')}
                            {child.type === 'button' && (child.config?.text || 'Przycisk')}
                            {child.type === 'gallery' && `${child.config?.images?.length || 0} zdjęć`}
                            {child.type === 'spacer' && (child.config?.height || '2rem')}
                          </p>
                        </div>

                        {/* Przyciski przesuwania */}
                        <div className="flex gap-1">
                          {/* Przesuń w górę */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (index > 0) {
                                const children = [...module.config.children]
                                ;[children[index], children[index - 1]] = [children[index - 1], children[index]]
                                handleConfigChange('children', children)
                                // Zaktualizuj selectedChild jeśli był zaznaczony
                                if (isSelected) {
                                  useEditorStore.getState().selectChild(selectedModule, index - 1)
                                }
                              }
                            }}
                            disabled={index === 0}
                            className="p-1.5 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ 
                              backgroundColor: index === 0 ? 'transparent' : 'white',
                              color: 'rgb(146, 0, 32)'
                            }}
                            title="Przesuń w górę"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>

                          {/* Przesuń w dół */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (index < module.config.children.length - 1) {
                                const children = [...module.config.children]
                                ;[children[index], children[index + 1]] = [children[index + 1], children[index]]
                                handleConfigChange('children', children)
                                // Zaktualizuj selectedChild jeśli był zaznaczony
                                if (isSelected) {
                                  useEditorStore.getState().selectChild(selectedModule, index + 1)
                                }
                              }
                            }}
                            disabled={index === module.config.children.length - 1}
                            className="p-1.5 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ 
                              backgroundColor: index === module.config.children.length - 1 ? 'transparent' : 'white',
                              color: 'rgb(146, 0, 32)'
                            }}
                            title="Przesuń w dół"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-sm text-gray-500 rounded-lg bg-gray-50 mb-4">
                  <p className="mb-1">Brak elementów w kontenerze</p>
                  <p className="text-xs">Przeciągnij elementy z lewego panelu lub użyj przycisków poniżej</p>
                </div>
              )}

              {/* Przyciski dodawania */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'text', icon: '📝', label: 'Tekst', config: { content: 'Nowy tekst', fontSize: '16px', textColor: 'rgb(30, 30, 30)', align: 'left' } },
                  { type: 'button', icon: '🔘', label: 'Przycisk', config: { text: 'Kliknij', link: '#', bgColor: 'rgb(146, 0, 32)', textColor: 'rgb(228, 229, 218)', align: 'center' } },
                  { type: 'spacer', icon: '↕️', label: 'Odstęp', config: { height: '2rem' } },
                  { type: 'gallery', icon: '🖼️', label: 'Galeria', config: { images: [], columns: 3, gap: '1rem', style: 'grid' } }
                ].map(({ type, icon, label, config }) => (
                  <button
                    key={type}
                    onClick={() => {
                      const children = [...(module.config?.children || []), { type, config }]
                      handleConfigChange('children', children)
                    }}
                    className="p-3 rounded-lg border-2 border-dashed transition-all hover:border-solid hover:shadow-md"
                    style={{ borderColor: 'rgb(146, 0, 32)', color: 'rgb(30, 30, 30)' }}
                  >
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-xs font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Base Module - Hero Section */}
        {module.id === 'hero' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Tytuł główny
              </label>
              <input
                type="text"
                value={module.config?.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="Witaj w Świecie Wellness"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Podtytuł
              </label>
              <input
                type="text"
                value={module.config?.subtitle || ''}
                onChange={(e) => handleConfigChange('subtitle', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="Odkryj harmonię ciała i umysłu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'rgb(30, 30, 30)' }}>
                Obrazek tła (opcjonalny)
              </label>
              <ImageUploader
                label=""
                value={module.config?.backgroundImage || ''}
                onChange={(url) => handleConfigChange('backgroundImage', url)}
              />
              {module.config?.backgroundImage && (
                <p className="text-xs mt-2 opacity-60">
                  💡 Obrazek będzie wyświetlany z przeźroczystością 30%
                </p>
              )}
            </div>
            <ColorPicker
              label="Kolor tła"
              value={module.config?.bgColor || 'rgb(228, 229, 218)'}
              onChange={(color) => handleConfigChange('bgColor', color)}
            />
            <ColorPicker
              label="Kolor tekstu"
              value={module.config?.textColor || 'rgb(30, 30, 30)'}
              onChange={(color) => handleConfigChange('textColor', color)}
            />
          </>
        )}

        {/* Base Module - Calendar Section */}
        {module.id === 'calendar' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Tytuł sekcji
              </label>
              <input
                type="text"
                value={module.config?.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="Zarezerwuj Termin"
              />
            </div>
            <ColorPicker
              label="Kolor akcentu kalendarza"
              value={module.config?.color || 'rgb(146, 0, 32)'}
              onChange={(color) => handleConfigChange('color', color)}
            />
            <ColorPicker
              label="Kolor tła sekcji"
              value={module.config?.bgColor || 'rgb(255, 255, 255)'}
              onChange={(color) => handleConfigChange('bgColor', color)}
            />
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Minimalny odstęp między spotkaniami (minuty)
              </label>
              <input
                type="number"
                value={module.config?.minInterval || 15}
                onChange={(e) => handleConfigChange('minInterval', parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                min="5"
                max="120"
                step="5"
              />
            </div>
            
            {/* Rodzaje zajęć */}
            <div className="space-y-3">
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Rodzaje zajęć
              </label>
              
              <label 
                className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all"
                style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}
              >
                <input
                  type="checkbox"
                  checked={module.config?.allowIndividual !== false}
                  onChange={(e) => handleConfigChange('allowIndividual', e.target.checked)}
                  className="w-6 h-6 rounded"
                  style={{ accentColor: 'rgb(146, 0, 32)' }}
                />
                <div className="flex-1">
                  <span className="font-medium block">Zajęcia indywidualne</span>
                  <p className="text-xs opacity-60 mt-1">Rezerwacje 1:1 z instruktorem</p>
                </div>
              </label>

              <label 
                className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all"
                style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}
              >
                <input
                  type="checkbox"
                  checked={module.config?.allowGroup !== false}
                  onChange={(e) => handleConfigChange('allowGroup', e.target.checked)}
                  className="w-6 h-6 rounded"
                  style={{ accentColor: 'rgb(146, 0, 32)' }}
                />
                <div className="flex-1">
                  <span className="font-medium block">Zajęcia grupowe</span>
                  <p className="text-xs opacity-60 mt-1">Sesje dla wielu uczestników</p>
                </div>
              </label>
            </div>
          </>
        )}

        {/* Base Module - About Section */}
        {module.id === 'about' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Tytuł sekcji
              </label>
              <input
                type="text"
                value={module.config?.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="O Mnie"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Opis
              </label>
              <textarea
                value={module.config?.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="Opowiedz o sobie..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'rgb(30, 30, 30)' }}>
                Zdjęcie profilowe
              </label>
              <ImageUploader
                label=""
                value={module.config?.imageUrl || module.config?.avatar || ''}
                onChange={(url) => {
                  handleConfigChange('imageUrl', url)
                  handleConfigChange('avatar', url)
                }}
              />
            </div>
            <ColorPicker
              label="Kolor tła sekcji"
              value={module.config?.bgColor || 'rgb(228, 229, 218)'}
              onChange={(color) => handleConfigChange('bgColor', color)}
            />
          </>
        )}

        {/* Base Module - Contact Section */}
        {module.id === 'contact' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Email
              </label>
              <input
                type="email"
                value={module.config?.email || ''}
                onChange={(e) => handleConfigChange('email', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="kontakt@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Numer telefonu
              </label>
              <input
                type="tel"
                value={module.config?.phone || ''}
                onChange={(e) => handleConfigChange('phone', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                placeholder="+48 123 456 789"
              />
            </div>
            <ColorPicker
              label="Kolor tła sekcji"
              value={module.config?.bgColor || 'rgb(255, 255, 255)'}
              onChange={(color) => handleConfigChange('bgColor', color)}
            />
          </>
        )}

        {/* Standardowe moduły */}
        <div className="mt-6">
          <p className="text-sm font-medium" style={{ color: 'rgb(30, 30, 30)' }}>
            Dodaj nową sekcję
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              onClick={() => {
                const newPage = {
                  id: Date.now(),
                  name: 'Nowa strona',
                  modules: [
                    {
                      id: Date.now(),
                      type: 'container',
                      name: 'Nowy kontener',
                      config: {
                        direction: 'vertical',
                        gap: '1rem',
                        wrap: true,
                        children: []
                      }
                    }
                  ]
                }
                useEditorStore.getState().addPage(newPage)
                useEditorStore.getState().selectPage(newPage.id)
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border-2 transition-all hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium" style={{ color: 'rgb(30, 30, 30)' }}>
                Nowa strona
              </span>
            </button>
            <button
              onClick={() => {
                const children = [...(module.config?.children || []), { type: 'container', config: { direction: 'vertical', gap: '1rem', wrap: true, children: [] } }]
                handleConfigChange('children', children)
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border-2 transition-all hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium" style={{ color: 'rgb(30, 30, 30)' }}>
                Nowy kontener
              </span>
            </button>
          </div>
        </div>

        {/* Standard modules */}
        {!module.type && (
          <>
            {/* ...existing standard modules code... */}
          </>
        )}
      </div>
    </div>
  )
}

export default Configurator
