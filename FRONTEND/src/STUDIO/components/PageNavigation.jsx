import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import useEditorStore from '../store/editorStore'

const PageNavigation = ({ variant = 'panel', onNavigate }) => {
  const {
    currentPage,
    setCurrentPage,
    templateConfig,
    siteStructure,
    addPage,
    removePage,
    updatePage
  } = useEditorStore()
  const [renamingPageId, setRenamingPageId] = useState(null)
  const [newName, setNewName] = useState('')
  const pages = Object.values(templateConfig.pages)

  const handlePageClick = (page) => {
    if (siteStructure === 'single-page') {
      const firstModule = page.modules.find(module => module.enabled)
      if (firstModule) {
        const element = document.getElementById(`section-${firstModule.id}`)
        if (element) {
          const navHeight = 144
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - navHeight

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }
      setCurrentPage(page.id)
    } else {
      setCurrentPage(page.id)
    }

    if (onNavigate) {
      onNavigate()
    }
  }

  const handleAddPage = () => {
    const name = window.prompt('Podaj nazwę nowej strony:', 'Nowa strona')
    if (name) {
      addPage(name)
      if (onNavigate) {
        onNavigate()
      }
    }
  }

  const handleRenameStart = (page) => {
    setRenamingPageId(page.id)
    setNewName(page.name)
  }

  const handleRenameSave = () => {
    if (renamingPageId && newName.trim()) {
      updatePage(renamingPageId, { name: newName.trim() })
    }
    setRenamingPageId(null)
    setNewName('')
  }

  const handleRenameKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleRenameSave()
    } else if (event.key === 'Escape') {
      setRenamingPageId(null)
      setNewName('')
    }
  }

  const renderActionButtons = (page) => {
    if (page.id === 'home') {
      return null
    }

    return (
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="text-xs px-2 py-1 rounded bg-white border border-gray-200 shadow-sm"
          onClick={() => handleRenameStart(page)}
        >
          ✏️
        </button>
        <button
          type="button"
          className="text-xs px-2 py-1 rounded bg-white border border-gray-200 shadow-sm"
          onClick={() => {
            if (window.confirm('Na pewno usunąć tę stronę?')) {
              removePage(page.id)
              if (onNavigate) {
                onNavigate()
              }
            }
          }}
        >
          🗑️
        </button>
      </div>
    )
  }

  const buttons = pages.map((page) => (
    <div key={page.id} className="relative group">
      {renamingPageId === page.id ? (
        <input
          value={newName}
          onChange={event => setNewName(event.target.value)}
          onBlur={handleRenameSave}
          onKeyDown={handleRenameKeyDown}
          autoFocus
          className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm"
        />
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handlePageClick(page)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
            currentPage === page.id ? 'font-semibold' : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            backgroundColor: currentPage === page.id ? 'rgb(146, 0, 32)' : 'transparent',
            color: currentPage === page.id ? 'rgb(228, 229, 218)' : 'rgb(30, 30, 30)'
          }}
        >
          {currentPage === page.id && <span className="text-xs">📍</span>}
          {page.name}
          <span className="text-xs opacity-70">
            ({page.modules.filter(module => module.enabled).length})
          </span>
        </motion.button>
      )}
      {renamingPageId !== page.id && renderActionButtons(page)}
    </div>
  ))

  const badgeStyle = {
    backgroundColor: siteStructure === 'single-page' ? 'rgba(146, 0, 32, 0.1)' : 'rgba(30, 30, 30, 0.1)',
    color: siteStructure === 'single-page' ? 'rgb(146, 0, 32)' : 'rgb(30, 30, 30)'
  }

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2 overflow-x-auto">
        <div className="text-xs px-3 py-1 rounded-full" style={badgeStyle}>
          {siteStructure === 'single-page' ? '📄 Jedna strona (scroll)' : '📑 Wiele stron'}
        </div>
        {buttons}
        <button
          type="button"
          onClick={handleAddPage}
          className="px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm hover:bg-gray-50"
        >
          + Dodaj stronę
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border-b px-6 py-3" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="text-xs px-3 py-1 rounded-full" style={badgeStyle}>
            {siteStructure === 'single-page' ? '📄 Jedna strona (scroll)' : '📑 Wiele stron (routing)'}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto flex-1">
          {buttons}
        </div>

        <button
          type="button"
          onClick={handleAddPage}
          className="px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm hover:bg-gray-50"
        >
          + Dodaj stronę
        </button>
      </div>
    </div>
  )
}

export default PageNavigation

PageNavigation.propTypes = {
  variant: PropTypes.oneOf(['panel', 'inline']),
  onNavigate: PropTypes.func
}

PageNavigation.defaultProps = {
  variant: 'panel',
  onNavigate: undefined
}
