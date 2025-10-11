import React from 'react'
import useEditorStore from '../../store/editorStore'
import ColorPicker from '../../components/ColorPicker'
import ImageUploader from '../../components/ImageUploader'
import Button from '../../components/Button'

const Configurator = () => {
  const { selectedModule, templateConfig, updateModuleConfig } = useEditorStore()

  const module = templateConfig.modules.find((m) => m.id === selectedModule)

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

  const handleConfigChange = (key, value) => {
    updateModuleConfig(selectedModule, { [key]: value })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold" style={{ color: 'rgb(30, 30, 30)' }}>
            {module.name}
          </h2>
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'rgb(146, 0, 32)' }}
          />
        </div>
        <p className="text-sm opacity-60">Edytuj ustawienia sekcji</p>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tytuł */}
        {module.config.title !== undefined && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
              Tytuł
            </label>
            <input
              type="text"
              value={module.config.title}
              onChange={(e) => handleConfigChange('title', e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'rgba(30, 30, 30, 0.2)',
                '--tw-ring-color': 'rgb(146, 0, 32)'
              }}
              placeholder="Wpisz tytuł..."
            />
          </div>
        )}

        {/* Podtytuł */}
        {module.config.subtitle !== undefined && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
              Podtytuł
            </label>
            <input
              type="text"
              value={module.config.subtitle}
              onChange={(e) => handleConfigChange('subtitle', e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'rgba(30, 30, 30, 0.2)',
                '--tw-ring-color': 'rgb(146, 0, 32)'
              }}
              placeholder="Wpisz podtytuł..."
            />
          </div>
        )}

        {/* Opis */}
        {module.config.description !== undefined && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
              Opis
            </label>
            <textarea
              value={module.config.description}
              onChange={(e) => handleConfigChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 resize-none"
              style={{ 
                borderColor: 'rgba(30, 30, 30, 0.2)',
                '--tw-ring-color': 'rgb(146, 0, 32)'
              }}
              placeholder="Wpisz opis..."
            />
          </div>
        )}

        {/* Separator */}
        {(module.config.imageUrl !== undefined || 
          module.config.backgroundImage !== undefined || 
          module.config.avatar !== undefined) && (
          <div className="border-t pt-6" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
            <h3 className="text-sm font-medium mb-4 opacity-60">MULTIMEDIA</h3>
          </div>
        )}

        {/* Obraz główny */}
        {module.config.imageUrl !== undefined && (
          <ImageUploader
            label="Obraz sekcji"
            value={module.config.imageUrl}
            onChange={(url) => handleConfigChange('imageUrl', url)}
            aspectRatio="16/9"
          />
        )}

        {/* Obrazek tła (dla Hero) */}
        {module.config.backgroundImage !== undefined && (
          <ImageUploader
            label="Obraz tła"
            value={module.config.backgroundImage}
            onChange={(url) => handleConfigChange('backgroundImage', url)}
            aspectRatio="21/9"
          />
        )}

        {/* Logo/Avatar */}
        {module.config.avatar !== undefined && (
          <ImageUploader
            label="Avatar/Logo"
            value={module.config.avatar}
            onChange={(url) => handleConfigChange('avatar', url)}
            aspectRatio="1/1"
          />
        )}

        {/* Separator */}
        {(module.config.bgColor !== undefined || 
          module.config.textColor !== undefined || 
          module.config.color !== undefined) && (
          <div className="border-t pt-6" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
            <h3 className="text-sm font-medium mb-4 opacity-60">KOLORY</h3>
          </div>
        )}

        {/* Kolor tła */}
        {module.config.bgColor !== undefined && (
          <ColorPicker
            label="Kolor tła"
            value={module.config.bgColor}
            onChange={(color) => handleConfigChange('bgColor', color)}
          />
        )}

        {/* Kolor tekstu */}
        {module.config.textColor !== undefined && (
          <ColorPicker
            label="Kolor tekstu"
            value={module.config.textColor}
            onChange={(color) => handleConfigChange('textColor', color)}
          />
        )}

        {/* Kolor akcentu */}
        {module.config.color !== undefined && (
          <ColorPicker
            label="Kolor akcentu"
            value={module.config.color}
            onChange={(color) => handleConfigChange('color', color)}
          />
        )}

        {/* Separator */}
        {(module.config.email !== undefined || module.config.phone !== undefined) && (
          <div className="border-t pt-6" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
            <h3 className="text-sm font-medium mb-4 opacity-60">KONTAKT</h3>
          </div>
        )}

        {/* Email */}
        {module.config.email !== undefined && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
              Email
            </label>
            <input
              type="email"
              value={module.config.email}
              onChange={(e) => handleConfigChange('email', e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'rgba(30, 30, 30, 0.2)',
                '--tw-ring-color': 'rgb(146, 0, 32)'
              }}
              placeholder="twoj@email.pl"
            />
          </div>
        )}

        {/* Telefon */}
        {module.config.phone !== undefined && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
              Telefon
            </label>
            <input
              type="tel"
              value={module.config.phone}
              onChange={(e) => handleConfigChange('phone', e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'rgba(30, 30, 30, 0.2)',
                '--tw-ring-color': 'rgb(146, 0, 32)'
              }}
              placeholder="+48 123 456 789"
            />
          </div>
        )}

        {/* Ustawienia specjalne kalendarza */}
        {module.id === 'calendar' && (
          <>
            <div className="border-t pt-6" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
              <h3 className="text-sm font-medium mb-4 opacity-60">USTAWIENIA KALENDARZA</h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(30, 30, 30)' }}>
                Minimalny odstęp między spotkaniami (minuty)
              </label>
              <input
                type="number"
                value={module.config.minInterval || 15}
                onChange={(e) => handleConfigChange('minInterval', parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'rgba(30, 30, 30, 0.2)',
                  '--tw-ring-color': 'rgb(146, 0, 32)'
                }}
                min="5"
                step="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'rgb(30, 30, 30)' }}>
                Rodzaje zajęć
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
                  <input
                    type="checkbox"
                    checked={module.config.allowIndividual !== false}
                    onChange={(e) => handleConfigChange('allowIndividual', e.target.checked)}
                    className="mr-3 w-5 h-5 rounded"
                    style={{ accentColor: 'rgb(146, 0, 32)' }}
                  />
                  <div>
                    <span className="font-medium">Zajęcia indywidualne</span>
                    <p className="text-xs opacity-60">Sesje jeden na jeden</p>
                  </div>
                </label>
                <label className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
                  <input
                    type="checkbox"
                    checked={module.config.allowGroup !== false}
                    onChange={(e) => handleConfigChange('allowGroup', e.target.checked)}
                    className="mr-3 w-5 h-5 rounded"
                    style={{ accentColor: 'rgb(146, 0, 32)' }}
                  />
                  <div>
                    <span className="font-medium">Zajęcia grupowe</span>
                    <p className="text-xs opacity-60">Sesje dla wielu osób</p>
                  </div>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Configurator
