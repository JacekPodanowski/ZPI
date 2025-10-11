import React, { useState } from 'react'
import { motion } from 'framer-motion'
import useEditorStore from '../../store/editorStore'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { saveTemplate } from '../../config/api'

const TopBar = () => {
  const { 
    mode, 
    setMode, 
    expertMode, 
    setExpertMode, 
    templateConfig, 
    saveVersion,
    siteStructure,
    setSiteStructure,
    animations,
    setAnimations,
    convertToSinglePage
  } = useEditorStore()

  const [showSettings, setShowSettings] = useState(false)

  const handleSave = async () => {
    try {
      saveVersion()
      await saveTemplate(templateConfig)
      alert('Zmiany zapisane!')
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Nie udało się zapisać zmian')
    }
  }

  const handlePublish = () => {
    alert('Publikacja strony w przygotowaniu')
  }

  const handleStructureChange = (newStructure) => {
    if (newStructure === 'single-page' && siteStructure === 'multi-page') {
      if (confirm('Czy na pewno chcesz połączyć wszystkie strony w jedną? Ta operacja połączy wszystkie moduły.')) {
        convertToSinglePage()
      }
    } else {
      setSiteStructure(newStructure)
    }
  }

  return (
    <>
      <motion.div
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm"
        style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgb(30, 30, 30)' }}
          >
            <span className="text-xl font-bold" style={{ color: 'rgb(228, 229, 218)' }}>W</span>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'rgb(30, 30, 30)' }}>
            Editor
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
            style={{ color: 'rgb(30, 30, 30)' }}
            title="Ustawienia"
          >
            ⚙️ Ustawienia
          </button>

          {/* Expert Mode Toggle */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
            <input
              type="checkbox"
              checked={expertMode}
              onChange={(e) => setExpertMode(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'rgb(146, 0, 32)' }}
            />
            <span className="text-sm font-medium" style={{ color: 'rgb(30, 30, 30)' }}>
              Expert Mode
            </span>
          </label>

          {/* Preview Toggle */}
          <button
            onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
            style={{ color: 'rgb(30, 30, 30)' }}
          >
            {mode === 'edit' ? '👁️ Podgląd' : '✏️ Edycja'}
          </button>
          
          <Button variant="secondary" onClick={handleSave}>
            💾 Zapisz
          </Button>
          
          <Button onClick={handlePublish}>
            🚀 Opublikuj
          </Button>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Ustawienia strony">
        <div className="space-y-6">
          {/* Struktura strony */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'rgb(30, 30, 30)' }}>
              Struktura strony
            </h3>
            <div className="space-y-2">
              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                     style={{ borderColor: siteStructure === 'single-page' ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.1)' }}>
                <input
                  type="radio"
                  name="structure"
                  checked={siteStructure === 'single-page'}
                  onChange={() => handleStructureChange('single-page')}
                  className="mr-3"
                  style={{ accentColor: 'rgb(146, 0, 32)' }}
                />
                <div>
                  <div className="font-semibold">Jedna strona</div>
                  <div className="text-sm opacity-60">Wszystkie sekcje na jednej stronie (scrolling)</div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                     style={{ borderColor: siteStructure === 'multi-page' ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.1)' }}>
                <input
                  type="radio"
                  name="structure"
                  checked={siteStructure === 'multi-page'}
                  onChange={() => handleStructureChange('multi-page')}
                  className="mr-3"
                  style={{ accentColor: 'rgb(146, 0, 32)' }}
                />
                <div>
                  <div className="font-semibold">Wiele stron</div>
                  <div className="text-sm opacity-60">Osobne podstrony z nawigacją</div>
                </div>
              </label>
            </div>
          </div>

          {/* Animacje */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'rgb(30, 30, 30)' }}>
              Animacje
            </h3>
            
            <label className="flex items-center justify-between p-3 mb-3">
              <span>Włącz animacje</span>
              <input
                type="checkbox"
                checked={animations.enabled}
                onChange={(e) => setAnimations({ enabled: e.target.checked })}
                className="w-5 h-5 rounded"
                style={{ accentColor: 'rgb(146, 0, 32)' }}
              />
            </label>

            {animations.enabled && (
              <div>
                <label className="block text-sm font-medium mb-2">Styl animacji</label>
                <select
                  value={animations.style}
                  onChange={(e) => setAnimations({ style: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'rgba(30, 30, 30, 0.2)',
                    '--tw-ring-color': 'rgb(146, 0, 32)'
                  }}
                >
                  <option value="smooth">Płynne (Smooth)</option>
                  <option value="fade">Zanikanie (Fade)</option>
                  <option value="slide">Przesuwanie (Slide)</option>
                  <option value="none">Brak</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
            <Button variant="secondary" onClick={() => setShowSettings(false)} className="flex-1">
              Anuluj
            </Button>
            <Button onClick={() => setShowSettings(false)} className="flex-1">
              Zastosuj
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default TopBar
