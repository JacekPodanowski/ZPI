import React from 'react'
import TopBar from '../components/TopBar'
import PageNavigation from '../components/PageNavigation'
import ModuleSelector from '../components/ModuleSelector'
import SiteCanvas from '../components/SiteCanvas'
import Configurator from '../components/Configurator'
import AIChat from '../components/AIChat'
import useEditorStore from '../../store/editorStore'

const EditorPage = () => {
  const { mode } = useEditorStore()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TopBar zawsze widoczny */}
      <TopBar />
      
      {/* PageNavigation tylko w trybie edycji */}
      {mode === 'edit' && <PageNavigation />}
      
      {/* Główna zawartość - wysokość zależy od trybu */}
      <div className={`flex ${mode === 'edit' ? 'h-[calc(100vh-128px)]' : 'h-[calc(100vh-64px)]'}`}>
        {/* Lewy panel tylko w trybie edycji */}
        {mode === 'edit' && (
          <div className="w-64 bg-white border-r overflow-y-auto" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
            <ModuleSelector />
          </div>
        )}
        
        {/* Canvas - zawsze widoczny */}
        <div className="flex-1 overflow-y-auto">
          <SiteCanvas />
        </div>
        
        {/* Prawy panel tylko w trybie edycji */}
        {mode === 'edit' && (
          <div className="w-80 bg-white border-l overflow-y-auto" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
            <Configurator />
          </div>
        )}
      </div>
      
      {/* AI Chat tylko w trybie edycji */}
      {mode === 'edit' && <AIChat />}
    </div>
  )
}

export default EditorPage
