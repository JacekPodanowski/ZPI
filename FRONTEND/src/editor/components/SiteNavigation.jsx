import React from 'react'
import { motion } from 'framer-motion'
import useEditorStore from '../../store/editorStore'

const SiteNavigation = () => {
  const { siteStructure, currentPage, setCurrentPage, templateConfig } = useEditorStore()
  
  const pages = Object.values(templateConfig.pages).filter(page => 
    page.modules.some(m => m.enabled)
  )

  const handlePageClick = (page) => {
    if (siteStructure === 'single-page') {
      const firstModule = page.modules.find(m => m.enabled)
      if (firstModule) {
        const element = document.getElementById(`section-${firstModule.id}`)
        if (element) {
          const navHeight = 80
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
  }

  if (pages.length === 0) return null

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-white border-b shadow-sm"
      style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-xl" style={{ color: 'rgb(30, 30, 30)' }}>
            Wellness
          </div>
          <div className="flex gap-1">
            {pages.map((page) => (
              <motion.button
                key={page.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageClick(page)}
                className="px-4 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: currentPage === page.id ? 'rgb(146, 0, 32)' : 'transparent',
                  color: currentPage === page.id ? 'rgb(228, 229, 218)' : 'rgb(30, 30, 30)'
                }}
              >
                {page.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}


export default SiteNavigation
