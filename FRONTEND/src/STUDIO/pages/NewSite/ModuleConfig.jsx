import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import useEditorStore from '../../store/editorStore'
import Button from '../../../components/Button'

const isHeroModule = (module) => {
  if (!module) return false
  const type = (module.type || '').toLowerCase()
  if (type === 'hero') return true
  const id = (module.id || '').toLowerCase()
  return id === 'hero' || id.startsWith('hero') || id.endsWith('hero')
}

const ModuleConfig = () => {
  const navigate = useNavigate()
  const { templateId } = useParams()
  const { templateConfig, toggleModule, updateModuleConfig, currentPage } = useEditorStore()
  
  // Pobierz moduły z aktualnej strony
  const currentPageData = templateConfig.pages[currentPage] || templateConfig.pages.home
  const [localConfig, setLocalConfig] = useState(currentPageData?.modules || [])

  // Aktualizuj localConfig gdy zmieni się strona
  useEffect(() => {
    const pageData = templateConfig.pages[currentPage] || templateConfig.pages.home
    setLocalConfig(pageData?.modules || [])
  }, [currentPage, templateConfig])

  const handleToggle = (moduleId) => {
    setLocalConfig(prev => 
      prev.map(m => m.id === moduleId ? { ...m, enabled: !m.enabled } : m)
    )
  }

  const handleConfigChange = (moduleId, key, value) => {
    setLocalConfig(prev =>
      prev.map(m => 
        m.id === moduleId 
          ? { ...m, config: { ...m.config, [key]: value } }
          : m
      )
    )
  }

  const handleContinue = () => {
    // Zapisz konfigurację do store
    localConfig.forEach(module => {
      const originalModule = currentPageData.modules.find(m => m.id === module.id)
      if (originalModule && module.enabled !== originalModule.enabled) {
        toggleModule(module.id)
      }
      updateModuleConfig(module.id, module.config)
    })
  navigate('/studio/editor')
  }

  // Guard clause - jeśli brak danych
  if (!localConfig || localConfig.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'rgb(228, 229, 218)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'rgb(30, 30, 30)' }}>
            Ładowanie...
          </h1>
          <Button onClick={() => navigate('/studio/templates')}>
            Wróć do szablonów
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'rgb(228, 229, 218)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'rgb(30, 30, 30)' }}>
            Konfiguruj moduły
          </h1>
          <p className="text-lg opacity-70">
            Wybierz sekcje, które chcesz uwzględnić i dostosuj ich ustawienia
          </p>
        </motion.div>

        <div className="space-y-4 mb-8">
          {localConfig.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1" style={{ color: 'rgb(30, 30, 30)' }}>
                    {module.name}
                  </h3>
                  <p className="text-sm opacity-60">
                    {isHeroModule(module) && 'Sekcja powitalna na górze strony'}
                    {module.id === 'calendar' && 'Kalendarz rezerwacji i spotkań'}
                    {module.id === 'about' && 'Informacje o Tobie i Twojej działalności'}
                    {module.id === 'contact' && 'Formularz kontaktowy i dane'}
                  </p>
                </div>
                <label className="flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={module.enabled}
                    onChange={() => handleToggle(module.id)}
                    className="w-6 h-6 rounded cursor-pointer"
                    style={{ accentColor: 'rgb(146, 0, 32)' }}
                  />
                </label>
              </div>

              {/* Ustawienia specyficzne dla modułu */}
              {module.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t pt-4 mt-4 space-y-3"
                  style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}
                >
                  {/* Kalendarz - ustawienia specjalne */}
                  {module.id === 'calendar' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2 opacity-70">
                          Minimalny odstęp między spotkaniami (minuty)
                        </label>
                        <input
                          type="number"
                          value={module.config?.minInterval || 15}
                          onChange={(e) => handleConfigChange(module.id, 'minInterval', parseInt(e.target.value))}
                          className="w-full px-4 py-2 rounded-lg border"
                          style={{ borderColor: 'rgba(30, 30, 30, 0.2)' }}
                          min="5"
                          step="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 opacity-70">
                          Rodzaje zajęć
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={module.config?.allowIndividual !== false}
                              onChange={(e) => handleConfigChange(module.id, 'allowIndividual', e.target.checked)}
                              className="mr-2"
                              style={{ accentColor: 'rgb(146, 0, 32)' }}
                            />
                            <span>Zajęcia indywidualne</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={module.config?.allowGroup !== false}
                              onChange={(e) => handleConfigChange(module.id, 'allowGroup', e.target.checked)}
                              className="mr-2"
                              style={{ accentColor: 'rgb(146, 0, 32)' }}
                            />
                            <span>Zajęcia grupowe</span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Ustawienia wspólne - tytuł */}
                  {module.config?.title !== undefined && (
                    <div>
                      <label className="block text-sm font-medium mb-2 opacity-70">
                        Tytuł sekcji
                      </label>
                      <input
                        type="text"
                        value={module.config.title}
                        onChange={(e) => handleConfigChange(module.id, 'title', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{ borderColor: 'rgba(30, 30, 30, 0.2)' }}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Wstecz
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1"
          >
            Przejdź do edytora
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ModuleConfig
