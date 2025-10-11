import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EditorApp from './editor/EditorApp'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<EditorApp />} />
      </Routes>
    </Router>
  )
}

export default App
