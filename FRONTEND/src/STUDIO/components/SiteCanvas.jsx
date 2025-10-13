import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useEditorStore from '../store/editorStore'
import EditableWrapper from './EditableWrapper'
import SiteNavigation from './SiteNavigation'
import HeroSection from '../../SITES/components/HeroSection'
import CalendarSection from '../../SITES/components/CalendarSection'
import AboutSection from '../../SITES/components/AboutSection'
import ContactSection from '../../SITES/components/ContactSection'
import TextModule from '../../SITES/components/TextModule'
import ButtonModule from '../../SITES/components/ButtonModule'
import GalleryModule from '../../SITES/components/GalleryModule'
import SpacerModule from '../../SITES/components/SpacerModule'
import RowModule from '../../SITES/components/RowModule'
import ContainerModule from '../../SITES/components/ContainerModule'

const SiteCanvas = () => {
  const {
    currentPage,
    setCurrentPage,
    templateConfig,
    mode,
    siteStructure,
    animations,
    clearSelection,
    expertMode
  } = useEditorStore()

  const handleBackgroundClick = () => {
    if (!expertMode) {
      clearSelection()
    }
  }

  // Intersection Observer TYLKO dla single-page
  useEffect(() => {
    if (siteStructure !== 'single-page') return

    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisible = null
        let maxRatio = 0

        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            mostVisible = entry
          }
        })

        if (mostVisible && mostVisible.isIntersecting && maxRatio > 0.3) {
          const sectionId = mostVisible.target.id.replace('section-', '')
          for (const [pageKey, page] of Object.entries(templateConfig.pages)) {
            if (page.modules.some(m => m.id === sectionId)) {
              setCurrentPage(pageKey)
              break
            }
          }
        }
      },
      { 
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-20% 0px -20% 0px'
      }
    )

    // Obserwuj sekcje w single-page
    Object.values(templateConfig.pages).forEach(page => {
      page.modules.forEach(module => {
        if (module.enabled) {
          const element = document.getElementById(`section-${module.id}`)
          if (element) observer.observe(element)
        }
      })
    })

    return () => observer.disconnect()
  }, [siteStructure, templateConfig.pages, setCurrentPage])

  const baseComponents = {
    hero: HeroSection,
    calendar: CalendarSection,
    about: AboutSection,
    contact: ContactSection,
  }

  const expertComponents = {
    text: TextModule,
    button: ButtonModule,
    gallery: GalleryModule,
    spacer: SpacerModule,
    container: ContainerModule,
  }

  const renderModule = (module, inSinglePage = false) => {
    if (!module.enabled) return null

    const Component = baseComponents[module.id] || expertComponents[module.type]
    if (!Component) return null

    const animationVariants = {
      smooth: {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
      },
      fade: {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true },
        transition: { duration: 0.4 }
      },
      slide: {
        initial: { opacity: 0, x: -50 },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 }
      },
      none: {}
    }

    // Dla ContainerModule przekaż isEditing prop
    const componentProps = module.type === 'container' 
      ? { config: module.config, isEditing: mode === 'edit' }
      : { config: module.config }

    const content = animations.enabled ? (
      <motion.div {...animationVariants[animations.style]}>
        <Component {...componentProps} />
      </motion.div>
    ) : (
      <Component {...componentProps} />
    )

    const wrappedContent = mode === 'edit' ? (
      <EditableWrapper
        moduleId={module.id}
        label={module.name}
      >
        {content}
      </EditableWrapper>
    ) : content

    if (inSinglePage) {
      return (
        <section key={module.id} id={`section-${module.id}`} className="scroll-mt-20">
          {wrappedContent}
        </section>
      )
    }

    return <div key={module.id}>{wrappedContent}</div>
  }

  // SINGLE-PAGE MODE - wszystkie moduły na jednej stronie ze scrollingiem
  if (siteStructure === 'single-page') {
  const pageOrder = ['home', 'about', 'calendar', 'gallery', 'contact']
    const allModules = []
    
    pageOrder.forEach(pageKey => {
      const page = templateConfig.pages[pageKey]
      if (page?.modules) {
        page.modules
          .filter(m => m.enabled)
          .sort((a, b) => a.order - b.order)
          .forEach(module => {
            allModules.push(module)
          })
      }
    })
    
    return (
      <div
        className={`bg-background min-h-screen ${mode === 'preview' ? '' : 'select-none'}`}
        onClick={handleBackgroundClick}
      >
        <SiteNavigation />
        <div className="scroll-smooth">
          {allModules.map((module) => renderModule(module, true))}
        </div>
      </div>
    )
  }

  // MULTI-PAGE MODE - tylko aktualna strona
  const currentPageData = templateConfig.pages[currentPage]
  
  if (!currentPageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg opacity-60">Wybierz stronę z nawigacji</p>
      </div>
    )
  }

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  }

  return (
    <div
      className={`bg-background min-h-screen ${mode === 'preview' ? '' : 'select-none'}`}
      onClick={handleBackgroundClick}
    >
      <SiteNavigation />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          {...pageTransition}
          className="min-h-screen"
        >
          {currentPageData.modules
            .filter(m => m.enabled)
            .sort((a, b) => a.order - b.order)
            .map((module) => renderModule(module, false))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default SiteCanvas

