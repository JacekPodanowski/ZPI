import React from 'react'
import TopBar from '../components/TopBar'
import ModuleSelector from '../components/ModuleSelector'
import SiteCanvas from '../components/SiteCanvas'
import Configurator from '../components/Configurator'
import AIChat from '../components/AIChat'
import useEditorStore from '../../store/editorStore'

const EditorPage = () => {
  const { mode } = useEditorStore()

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      
      <div className="flex h-[calc(100vh-64px)]">
        {mode === 'edit' && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <ModuleSelector />
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          <SiteCanvas />
        </div>
        
        {mode === 'edit' && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <Configurator />
          </div>
        )}
      </div>
      
      {mode === 'edit' && <AIChat />}
    </div>
  )
}

export default EditorPage
