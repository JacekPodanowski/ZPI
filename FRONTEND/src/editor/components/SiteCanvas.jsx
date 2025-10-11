import React from 'react'
import useEditorStore from '../../store/editorStore'
import EditableWrapper from './EditableWrapper'
import HeroSection from '../../site-template/components/HeroSection'
import CalendarSection from '../../site-template/components/CalendarSection'
import AboutSection from '../../site-template/components/AboutSection'
import ContactSection from '../../site-template/components/ContactSection'

const SiteCanvas = () => {
  const { templateConfig, mode } = useEditorStore()

  const renderModule = (module) => {
    if (!module.enabled) return null

    const components = {
      hero: HeroSection,
      calendar: CalendarSection,
      about: AboutSection,
      contact: ContactSection,
    }

    const Component = components[module.id]
    if (!Component) return null

    const content = <Component config={module.config} />

    // W trybie edycji owijamy w EditableWrapper
    if (mode === 'edit') {
      return (
        <EditableWrapper
          key={module.id}
          moduleId={module.id}
          label={module.name}
        >
          {content}
        </EditableWrapper>
      )
    }

    return <div key={module.id}>{content}</div>
  }

  return (
    <div className={`bg-background ${mode === 'preview' ? '' : 'select-none'}`}>
      {templateConfig.modules.map(renderModule)}
    </div>
  )
}

export default SiteCanvas
