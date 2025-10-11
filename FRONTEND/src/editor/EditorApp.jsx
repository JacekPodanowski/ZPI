import React from 'react'
import { Routes, Route } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import TemplatePicker from './pages/TemplatePicker'
import ModuleConfig from './pages/ModuleConfig'
import EditorPage from './pages/EditorPage'
import StudioPage from './pages/StudioPage'

function EditorApp() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/studio" element={<StudioPage />} />
      <Route path="/templates" element={<TemplatePicker />} />
      <Route path="/configure/:templateId" element={<ModuleConfig />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  )
}

export default EditorApp
