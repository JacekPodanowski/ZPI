import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../services/apiClient';

import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import CalendarSection from './components/CalendarSection';
import ContactSection from './components/ContactSection';
import TextModule from './components/TextModule';
import ButtonModule from './components/ButtonModule';
import GalleryModule from './components/GalleryModule';
import SpacerModule from './components/SpacerModule';
import ContainerModule from './components/ContainerModule';
import VideoModule from './components/VideoModule';
import FAQModule from './components/FAQModule';
import BlogModule from './components/BlogModule';
import EventsModule from './components/EventsModule';
import PricingModule from './components/PricingModule';
import ServicesModule from './components/ServicesModule';
import TeamModule from './components/TeamModule';

const fetchPublicSiteConfig = async (siteId) => {
  const response = await apiClient.get(`/public-sites/by-id/${siteId}/`);
  return response.data;
};

// Component map to render modules dynamically
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

  const activePage = useMemo(() => {
    if (!config) return null;
    const pageKey = config.currentPage || 'home';
    return config.pages?.[pageKey];
  }, [config]);

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
