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
    convertToSinglePage,
    exportTemplate,
    importTemplate
  } = useEditorStore()

  const [showSettings, setShowSettings] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

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

  const handleExportJSON = () => {
    setShowExportModal(true)
  }

  const confirmExport = () => {
    try {
      const jsonString = exportTemplate()
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().split('T')[0]
      const templateName = templateConfig.name.toLowerCase().replace(/\s+/g, '-')
      link.download = `${templateName}-${timestamp}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setShowExportModal(false)
      alert('✅ Szablon został wyeksportowany jako JSON!')
    } catch (error) {
      console.error('Export failed:', error)
      alert('❌ Nie udało się wyeksportować szablonu')
    }
  }

  const copyToClipboard = () => {
    try {
      const jsonString = exportTemplate()
      navigator.clipboard.writeText(jsonString)
      alert('✅ JSON został skopiowany do schowka!')
      setShowExportModal(false)
    } catch (error) {
      console.error('Copy failed:', error)
      alert('❌ Nie udało się skopiować do schowka')
    }
  }

  const handleImportJSON = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            importTemplate(event.target.result)
            alert('✅ Szablon został zaimportowany!')
          } catch (error) {
            console.error('Import failed:', error)
            alert('❌ Nie udało się zaimportować szablonu')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
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
          {/* Import JSON Button */}
          <button
            onClick={handleImportJSON}
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
            style={{ color: 'rgb(30, 30, 30)' }}
            title="Importuj szablon z pliku JSON"
          >
            📥 Importuj
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
            style={{ color: 'rgb(30, 30, 30)' }}
            title="Eksportuj szablon do pliku JSON"
          >
            📤 Eksportuj
          </button>

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

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Eksportuj szablon">
        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(146, 0, 32, 0.05)' }}>
            <p className="text-sm" style={{ color: 'rgb(30, 30, 30)' }}>
              📦 Eksport zapisze całą konfigurację strony w formacie JSON.
            </p>
            <p className="text-sm mt-2 opacity-70">
              Plik będzie zawierał wszystkie ustawienia sekcji, kolory, treści i strukturę strony.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📄</span>
                <span className="font-medium text-sm" style={{ color: 'rgb(30, 30, 30)' }}>
                  Nazwa szablonu:
                </span>
              </div>
              <p className="text-sm opacity-70 ml-7">{templateConfig.name}</p>
            </div>

            <div className="p-3 rounded-lg border" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📊</span>
                <span className="font-medium text-sm" style={{ color: 'rgb(30, 30, 30)' }}>
                  Struktura:
                </span>
              </div>
              <p className="text-sm opacity-70 ml-7">
                {siteStructure === 'single-page' ? 'Jedna strona (scrolling)' : 'Wiele podstron'}
              </p>
            </div>

            <div className="p-3 rounded-lg border" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎬</span>
                <span className="font-medium text-sm" style={{ color: 'rgb(30, 30, 30)' }}>
                  Animacje:
                </span>
              </div>
              <p className="text-sm opacity-70 ml-7">
                {animations.enabled ? `Włączone (${animations.style})` : 'Wyłączone'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
            <Button variant="secondary" onClick={() => setShowExportModal(false)} className="flex-1">
              Anuluj
            </Button>
            <Button onClick={copyToClipboard} variant="secondary" className="flex-1">
              📋 Kopiuj JSON
            </Button>
            <Button onClick={confirmExport} className="flex-1">
              📥 Pobierz plik
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default TopBar
