import React from 'react'
import { motion } from 'framer-motion'
import useEditorStore from '../../store/editorStore'

const ModuleSelector = () => {
  const { templateConfig, toggleModule, selectModule, selectedModule } = useEditorStore()

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-text mb-4">Sekcje strony</h2>
      <div className="space-y-2">
        {templateConfig.modules.map((module) => (
          <motion.div
            key={module.id}
            whileHover={{ scale: 1.02 }}
            className={`p-3 rounded-xl cursor-pointer transition-all ${
              selectedModule === module.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 text-text'
            }`}
            onClick={() => selectModule(module.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{module.name}</span>
              <input
                type="checkbox"
                checked={module.enabled}
                onChange={(e) => {
                  e.stopPropagation()
                  toggleModule(module.id)
                }}
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ModuleSelector
