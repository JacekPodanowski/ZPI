import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import useEditorStore from '../store/editorStore'

const PageNavigation = ({ variant = 'panel', onNavigate }) => {
  const { currentPage, setCurrentPage, templateConfig, siteStructure } = useEditorStore()
  const pages = Object.values(templateConfig.pages)

  const handlePageClick = (page) => {
    if (siteStructure === 'single-page') {
      // W single-page przewiń do sekcji
      const firstModule = page.modules.find(m => m.enabled)
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
      // W multi-page po prostu zmień stronę
      setCurrentPage(page.id)
    }

    if (onNavigate) {
      onNavigate()
    }
  }

  const buttons = pages.map((page) => (
    <motion.button
      key={page.id}
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
        ({page.modules.filter(m => m.enabled).length})
      </span>
    </motion.button>
  ))

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2 overflow-x-auto">
        <div className="text-xs px-3 py-1 rounded-full" style={{ 
          backgroundColor: siteStructure === 'single-page' ? 'rgba(146, 0, 32, 0.1)' : 'rgba(30, 30, 30, 0.1)',
          color: siteStructure === 'single-page' ? 'rgb(146, 0, 32)' : 'rgb(30, 30, 30)'
        }}>
          {siteStructure === 'single-page' ? '📄 Jedna strona (scroll)' : '📑 Wiele stron'}
        </div>
        {buttons}
      </div>
    )
  }

  return (
    <div className="bg-white border-b px-6 py-3" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="text-xs px-3 py-1 rounded-full" style={{ 
            backgroundColor: siteStructure === 'single-page' ? 'rgba(146, 0, 32, 0.1)' : 'rgba(30, 30, 30, 0.1)',
            color: siteStructure === 'single-page' ? 'rgb(146, 0, 32)' : 'rgb(30, 30, 30)'
          }}>
            {siteStructure === 'single-page' ? '📄 Jedna strona (scroll)' : '📑 Wiele stron (routing)'}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto flex-1">
          {buttons}
        </div>
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
