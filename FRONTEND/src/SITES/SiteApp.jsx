import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import CalendarSection from './components/CalendarSection';
import ContactForm from './components/ContactForm';
import TextModule from './components/TextModule';
import ButtonModule from './components/ButtonModule';
import GalleryModule from './components/GalleryModule';
import SpacerModule from './components/SpacerModule';
import ContainerModule from './components/ContainerModule';
import VideoModule from './components/VideoModule';
import FAQModule from './components/FAQModule';
import BlogModule from './components/BlogModule';
import EventsModule from './components/EventsModule';
import ServicesAndPricingModule from './components/ServicesAndPricingModule';
import TeamModule from './components/TeamModule';
import ReactComponentModule from './components/ReactComponentModule';

const fetchPublicSiteConfig = async (siteId) => {
  const response = await apiClient.get(`/public-sites/by-id/${siteId}/`);
  return response.data;
};

// Component map to render modules dynamically
const componentMap = {
  hero: HeroSection,
  about: AboutSection,
  calendar: CalendarSection,
  contact: ContactForm,
  contactForm: ContactForm,
  text: TextModule,
  button: ButtonModule,
  gallery: GalleryModule,
  spacer: SpacerModule,
  container: ContainerModule,
  video: VideoModule,
  faq: FAQModule,
  blog: BlogModule,
  events: EventsModule,
  servicesAndPricing: ServicesAndPricingModule,
  team: TeamModule,
  reactComponent: ReactComponentModule,
};

const renderModule = (module) => {
  if (!module?.enabled) return null;
  const Component = componentMap[module.type] || componentMap[module.id];
  if (!Component) return null;
  return <Component key={module.id} config={module.config || {}} />;
};

const SiteApp = () => {
  const siteId = import.meta.env.VITE_SITE_ID;
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePageKey, setActivePageKey] = useState(null);

  useEffect(() => {
    if (!siteId) {
      setError('VITE_SITE_ID is missing. Cannot render site.');
      setLoading(false);
      return;
    }

    const loadSite = async () => {
      try {
        const siteConfig = await fetchPublicSiteConfig(siteId);
        setConfig(siteConfig.template_config);
      } catch (err) {
        setError('Could not load site configuration.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [siteId]);

  useEffect(() => {
    if (!config) return;

    const pages = config.pages || {};

    const getPageKeyFromPath = (path) => {
      if (!path) return null;
      const entry = Object.entries(pages).find(([, page]) => page?.path === path);
      return entry ? entry[0] : null;
    };

    const determineInitialPage = () => {
      const defaultKey = config.currentPage && pages[config.currentPage] ? config.currentPage : Object.keys(pages)[0];
      if (typeof window === 'undefined') {
        return defaultKey;
      }

      const matchedFromLocation = getPageKeyFromPath(window.location.pathname);
      return matchedFromLocation || defaultKey;
    };

    setActivePageKey(determineInitialPage());

    const handlePopState = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const nextKey = getPageKeyFromPath(window.location.pathname);
      if (nextKey && pages[nextKey]) {
        setActivePageKey(nextKey);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [config]);

  useEffect(() => {
    if (!config) return;

    const pages = config.pages || {};

    const getPageKeyFromPath = (path) => {
      if (!path) return null;
      const entry = Object.entries(pages).find(([, page]) => page?.path === path);
      return entry ? entry[0] : null;
    };

    const handleNavigation = (event) => {
      const detail = event?.detail;
      const target = typeof detail === 'string' ? { path: detail } : (detail || {});
      if (!target) return;

      if (target.path && typeof target.path === 'string' && target.path.startsWith('#')) {
        const element = document.getElementById(target.path.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      let pageKey = target.pageId;

      if (!pageKey && target.path) {
        pageKey = getPageKeyFromPath(target.path);
      }

      if (pageKey && pages[pageKey]) {
        setActivePageKey(pageKey);
        if (typeof window !== 'undefined') {
          const nextPath = pages[pageKey].path || `/${pageKey}`;
          if (window.location.pathname !== nextPath) {
            window.history.pushState({}, '', nextPath);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      if (target.path && typeof window !== 'undefined' && !target.path.startsWith('#')) {
        window.location.assign(target.path);
      }
    };

    window.addEventListener('site:navigate', handleNavigation);
    return () => window.removeEventListener('site:navigate', handleNavigation);
  }, [config]);

  const activePage = config?.pages
    ? config.pages[activePageKey || config.currentPage || 'home']
    : null;

  if (loading) return <div>Loading Site...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!config || !activePage) return <div>Site configuration is incomplete.</div>;

  const modulesToRender = activePage.modules
    ?.filter((module) => module?.enabled)
    ?.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)) || [];

  return (
    <main>
      {modulesToRender.map((module) => renderModule(module))}
    </main>
  );
};

export default SiteApp;
