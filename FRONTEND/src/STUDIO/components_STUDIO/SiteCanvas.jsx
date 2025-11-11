import React, { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useEditorStore from '../store/editorStore'
import EditableWrapper from './EditableWrapper'
import SiteNavigation from './SiteNavigation'
import { MODULE_REGISTRY } from '../../SITES/components/modules/ModuleRegistry'
import { STYLES, DEFAULT_STYLE_ID } from '../../SITES/styles'
import composeSiteStyle from '../../SITES/styles/utils'

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

  const orderedPageKeys = useMemo(
    () => (templateConfig.pageOrder || Object.keys(templateConfig.pages || {}))
      .filter((key) => templateConfig.pages?.[key]),
    [templateConfig.pageOrder, templateConfig.pages]
  )

  useEffect(() => {
    const handleNavigationRequest = (event) => {
      const detail = event?.detail
      const target = typeof detail === 'string' ? { path: detail } : (detail || {})
      if (!target) return

      if (target.path && typeof target.path === 'string' && target.path.startsWith('#')) {
        const element = document.getElementById(target.path.substring(1))
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }

      let matchedPageKey = target.pageId

      if (!matchedPageKey && target.path) {
        matchedPageKey = orderedPageKeys.find((key) => {
          const page = templateConfig.pages?.[key]
          return page?.path === target.path
        })
      }

      if (!matchedPageKey || !templateConfig.pages?.[matchedPageKey]) {
        return
      }

      if (siteStructure === 'single-page') {
        const page = templateConfig.pages[matchedPageKey]
        const firstModule = page?.modules?.find((module) => module.enabled)
        if (firstModule) {
          const element = document.getElementById(`section-${firstModule.id}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      }

      setCurrentPage(matchedPageKey)
    }

    window.addEventListener('site:navigate', handleNavigationRequest)
    return () => window.removeEventListener('site:navigate', handleNavigationRequest)
  }, [orderedPageKeys, setCurrentPage, siteStructure, templateConfig.pages])

  const handleBackgroundClick = () => {
    if (!expertMode) {
      clearSelection()
    }
  }

  const resolveStyleId = () => {
    const candidates = [
      templateConfig?.styleId,
      templateConfig?.style?.id,
      templateConfig?.style?.styleId,
      typeof templateConfig?.style === 'string' ? templateConfig.style : null,
      templateConfig?.vibeId,
      templateConfig?.vibe,
      templateConfig?.style?.vibe
    ]

    const match = candidates.find((id) => id && STYLES[id])
    return match || DEFAULT_STYLE_ID
  }

  const extractStyleOverrides = () => {
    const overrides = {}

    if (templateConfig?.styleOverrides && typeof templateConfig.styleOverrides === 'object') {
      Object.assign(overrides, templateConfig.styleOverrides)
    }

    if (templateConfig?.style && typeof templateConfig.style === 'object' && !Array.isArray(templateConfig.style)) {
      const { id, styleId, vibe, vibeId, themeId, theme, ...rest } = templateConfig.style
      Object.assign(overrides, rest)
      if (theme && typeof theme === 'object') {
        overrides.colors = {
          ...(overrides.colors || {}),
          ...theme
        }
      }
    }

    const legacyThemeOverrides = templateConfig?.themeOverrides || templateConfig?.theme
    if (legacyThemeOverrides && typeof legacyThemeOverrides === 'object') {
      overrides.colors = {
        ...(overrides.colors || {}),
        ...legacyThemeOverrides
      }
    }

    return overrides
  }

  const styleId = resolveStyleId()
  const styleOverrides = extractStyleOverrides()
  const style = composeSiteStyle(styleId, styleOverrides)

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
          for (const pageKey of orderedPageKeys) {
            const page = templateConfig.pages[pageKey]
            if (page?.modules?.some((m) => m.id === sectionId)) {
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
    orderedPageKeys.forEach((pageKey) => {
      const page = templateConfig.pages[pageKey]
      page?.modules?.forEach((module) => {
        if (module.enabled) {
          const element = document.getElementById(`section-${module.id}`)
          if (element) observer.observe(element)
        }
      })
    })

    return () => observer.disconnect()
  }, [orderedPageKeys, setCurrentPage, siteStructure, templateConfig.pages])

  const renderModule = (module, inSinglePage = false) => {
    if (!module.enabled) return null

    const moduleType = (module.type || module.id || '').toLowerCase()
    const moduleDef = MODULE_REGISTRY[moduleType]

    if (!moduleDef) {
      console.warn(`[SiteCanvas] Module type "${moduleType}" not found in MODULE_REGISTRY`)
      return null
    }

    const Component = moduleDef.component
    const layout = module.config?.layout || module.content?.layout || moduleDef.defaultLayout

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
    }

    const componentProps = {
      layout,
      content: module.content || module.config || {},
      style
    }

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
    const allModules = []

    orderedPageKeys.forEach((pageKey) => {
      const page = templateConfig.pages[pageKey]
      if (page?.modules) {
        page.modules
          .filter((m) => m.enabled)
          .sort((a, b) => a.order - b.order)
          .forEach((module) => {
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

