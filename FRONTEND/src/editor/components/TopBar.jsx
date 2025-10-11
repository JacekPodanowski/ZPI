import React from 'react'
import { motion } from 'framer-motion'
import useEditorStore from '../../store/editorStore'
import Button from '../../components/Button'
import { saveTemplate } from '../../config/api'

const TopBar = () => {
  const { mode, setMode, templateConfig, saveVersion } = useEditorStore()

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

  return (
    <motion.div
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-text rounded-lg flex items-center justify-center">
          <span className="text-xl text-background font-bold">W</span>
        </div>
        <h1 className="text-xl font-semibold text-text">Editor</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-text transition-all"
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
  )
}

export default TopBar
