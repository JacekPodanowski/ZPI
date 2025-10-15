import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import CalendarSection from '../components/CalendarSection'
import ContactSection from '../components/ContactSection'
import TextModule from '../components/TextModule'
import ButtonModule from '../components/ButtonModule'
import GalleryModule from '../components/GalleryModule'
import SpacerModule from '../components/SpacerModule'
import ContainerModule from '../components/ContainerModule'
import VideoModule from '../components/VideoModule'
import FAQModule from '../components/FAQModule'
import BlogModule from '../components/BlogModule'
import EventsModule from '../components/EventsModule'
import PricingModule from '../components/PricingModule'
import ServicesModule from '../components/ServicesModule'
import TeamModule from '../components/TeamModule'
import RowModule from '../components/RowModule'
import apiClient from '../../services/apiClient'

const DEFAULT_PAGE_SLUG = import.meta.env.VITE_SITE_PAGE || 'home'

const fetchPublicSiteConfig = async (identifier) => {
  const response = await apiClient.get(`/public-sites/${identifier}/`)
  return response.data
}

const componentMap = {
  hero: HeroSection,
  about: AboutSection,
  calendar: CalendarSection,
  contact: ContactSection,
  text: TextModule,
  button: ButtonModule,
  gallery: GalleryModule,
  spacer: SpacerModule,
  container: ContainerModule,
  video: VideoModule,
  faq: FAQModule,
  blog: BlogModule,
  events: EventsModule,
  pricing: PricingModule,
  services: ServicesModule,
  team: TeamModule,
  row: RowModule,
}

const renderModule = (module) => {
  if (!module?.enabled) return null

  const Component = componentMap[module.type] || componentMap[module.id]

  if (!Component) {
    console.warn(`No component found for module: ${module?.type || module?.id}`)
    return null
  }

  const children = module.children
    ?.filter((child) => child?.enabled)
    ?.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))

  if (children?.length) {
    return (
      <Component key={module.id} config={module.config || {}}>
        {children.map((child) => renderModule(child))}
      </Component>
    )
  }

  return <Component key={module.id} config={module.config || {}} />
}

const SiteRendererPage = () => {
  const { identifier } = useParams()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activePageSlug, setActivePageSlug] = useState(null)

  useEffect(() => {
    const loadSite = async () => {
      try {
        setLoading(true)
        const siteConfig = await fetchPublicSiteConfig(identifier)
        setConfig(siteConfig)
      } catch (err) {
        setError('Could not load site configuration.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (identifier) {
      loadSite()
    }
  }, [identifier])

  const templateConfig = useMemo(() => {
    if (!config) return null
    return config.template_config ?? config
  }, [config])

  const pages = useMemo(() => templateConfig?.pages ?? {}, [templateConfig])
  const pageOrder = useMemo(() => (
    Array.isArray(templateConfig?.pageOrder) ? templateConfig.pageOrder : []
  ), [templateConfig])
  const preferredDefaultSlug = templateConfig?.currentPage || DEFAULT_PAGE_SLUG
  const siteTitle = templateConfig?.name || config?.name || 'YourEasySite'

  useEffect(() => {
    if (!templateConfig) {
      setActivePageSlug(null)
      return
    }

    const resolveSlug = () => {
      if (typeof window !== 'undefined') {
        const slugFromQuery = new URLSearchParams(window.location.search).get('page')
        if (slugFromQuery && pages[slugFromQuery]) {
          return slugFromQuery
        }
      }

      if (pages[preferredDefaultSlug]) {
        return preferredDefaultSlug
      }

      const firstFromOrder = pageOrder.find((slug) => pages[slug])
      if (firstFromOrder) {
        return firstFromOrder
      }

      const [firstAvailable] = Object.keys(pages)
      return firstAvailable || null
    }

    setActivePageSlug(resolveSlug())
  }, [templateConfig, pages, pageOrder, preferredDefaultSlug])

  const orderedPageSlugs = useMemo(() => {
    const known = pageOrder.filter((slug) => pages[slug])
    const remaining = Object.keys(pages).filter((slug) => !known.includes(slug))
    return [...known, ...remaining]
  }, [pageOrder, pages])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!config) return <div>Site not found.</div>

  const handlePageChange = (slug) => {
    if (!slug || slug === activePageSlug) return
    setActivePageSlug(slug)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('page', slug)
      window.history.replaceState(null, '', url.toString())
    }
  }

  if (!activePageSlug) {
    if (orderedPageSlugs.length === 0) {
      return <div>No pages available for this site.</div>
    }
    return <div>Preparing page...</div>
  }

  const selectedPage = pages[activePageSlug]
  const modulesToRender = selectedPage?.modules
    ?.filter((module) => module?.enabled)
    ?.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)) || []

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-neutral-900">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">{templateConfig?.ownerName ? `Site by ${templateConfig.ownerName}` : 'Personal Site'}</p>
            <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">{siteTitle}</h1>
            {selectedPage?.name && (
              <p className="mt-1 text-sm text-neutral-500">Currently viewing: {selectedPage.name}</p>
            )}
          </div>
          {orderedPageSlugs.length > 0 && (
            <nav className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
              {orderedPageSlugs.map((slug) => {
                const page = pages[slug]
                const label = page?.name || slug
                const isActive = slug === activePageSlug
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => handlePageChange(slug)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'bg-white/80 text-neutral-700 hover:bg-neutral-900/10'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-8 sm:py-12">
        {modulesToRender.map((module) => renderModule(module))}
      </main>
    </div>
  )
}

export default SiteRendererPage
