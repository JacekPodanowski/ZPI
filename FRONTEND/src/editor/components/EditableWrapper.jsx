import React from 'react'
import { motion } from 'framer-motion'
import useEditorStore from '../../store/editorStore'

const EditableWrapper = ({ moduleId, children, label }) => {
  const { mode, selectedModule, selectModule } = useEditorStore()
  const isSelected = selectedModule === moduleId
  const isEditMode = mode === 'edit'

  const handleClick = (e) => {
    if (!isEditMode) return
    
    e.stopPropagation()
    selectModule(moduleId)
  }

  if (!isEditMode) {
    return <>{children}</>
  }

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer transition-all"
      style={{
        outline: isSelected ? '3px solid rgb(146, 0, 32)' : '2px dashed rgba(146, 0, 32, 0.2)',
        outlineOffset: '4px',
      }}
    >
      {/* Label na hover lub gdy zaznaczony */}
      {(isSelected) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-4 px-3 py-1 rounded-lg text-sm font-medium shadow-md z-50"
          style={{
            backgroundColor: 'rgb(146, 0, 32)',
            color: 'rgb(228, 229, 218)',
          }}
        >
          {label || moduleId}
        </motion.div>
      )}

      {/* Overlay na hover */}
      <div
        className="absolute inset-0 transition-all pointer-events-none"
        style={{
          backgroundColor: isSelected ? 'rgba(146, 0, 32, 0.05)' : 'transparent',
        }}
      />

      {children}
    </div>
  )
}

export default EditableWrapper
