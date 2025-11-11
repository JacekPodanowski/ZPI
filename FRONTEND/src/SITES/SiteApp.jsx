import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

// JEDYNE POTRZEBNE IMPORTY SYSTEMOWE
import { MODULE_REGISTRY } from './components/modules/ModuleRegistry.js';
import composeSiteStyle, {
  resolveStyleId as resolveStyleIdFromConfig,
  extractStyleOverrides as extractStyleOverridesFromConfig
} from './styles/utils.js';

const fetchPublicSiteConfig = async (siteId) => {
  const response = await apiClient.get(`/public-sites/by-id/${siteId}/`);
  return response.data;
};

// NOWA, UPROSZCZONA FUNKCJA RENDERUJĄCA
const renderModule = (module, style, siteId) => {
  if (module?.enabled === false) return null;
  
  const moduleType = (module.type || module.id || '').toLowerCase();
  const moduleDef = MODULE_REGISTRY[moduleType];

  if (moduleDef) {
    const Component = moduleDef.component;
    const layout = module.content?.layout || moduleDef.defaultLayout;
    return (
      <Component
        key={module.id}
        layout={layout}
        content={module.content || {}}
        style={style}
        siteId={siteId}
      />
    );
  } else {
    // Zamiast fallbacku, teraz logujemy błąd. To wymusza pełną migrację.
    console.error(`[SiteApp] Nie znaleziono definicji w MODULE_REGISTRY dla modułu typu: "${moduleType}". Upewnij się, że moduł został poprawnie zmigrowany i zarejestrowany.`);
    return (
      <div style={{ padding: '2rem', border: '2px dashed red', margin: '1rem', backgroundColor: '#fff0f0' }}>
        <strong>Błąd:</strong> Nie można wyrenderować modułu typu "<strong>{moduleType}</strong>".
      </div>
    );
  }
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
        // Only support new format: template_config.site
        const templateConfig = siteConfig.template_config?.site || {};
        setConfig(templateConfig);
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

    // Convert pages array to object for rendering
    const pages = Array.isArray(config.pages)
      ? config.pages.reduce((acc, page) => {
          acc[page.id] = page;
          return acc;
        }, {})
      : {};

    const getPageKeyFromPath = (path) => {
      if (!path) return null;
      const entry = Object.entries(pages).find(([, page]) => page?.route === path);
      return entry ? entry[0] : null;
    };

    const determineInitialPage = () => {
      const entryPoint = config.entryPointPageId;
      const defaultKey = entryPoint && pages[entryPoint] ? entryPoint : Object.keys(pages)[0];
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

    // Convert pages array to object for rendering
    const pages = Array.isArray(config.pages)
      ? config.pages.reduce((acc, page) => {
          acc[page.id] = page;
          return acc;
        }, {})
      : {};

    const getPageKeyFromPath = (path) => {
      if (!path) return null;
      const entry = Object.entries(pages).find(([, page]) => page?.route === path);
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
          const nextPath = pages[pageKey].route || `/${pageKey}`;
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
    ? (Array.isArray(config.pages) 
        ? config.pages.find(p => p.id === (activePageKey || config.entryPointPageId || config.currentPage || 'home'))
        : config.pages[activePageKey || config.entryPointPageId || config.currentPage || 'home']
      )
    : null;

  if (loading) return <div>Loading Site...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!config || !activePage) return <div>Site configuration is incomplete.</div>;

  const styleId = resolveStyleIdFromConfig(config);
  const styleOverrides = extractStyleOverridesFromConfig(config);
  const style = composeSiteStyle(styleId, styleOverrides);

  const modulesToRender = activePage.modules
    ?.filter((module) => module?.enabled !== false)
    ?.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)) || [];

  return (
    <main>
      {modulesToRender.map((module) => renderModule(module, style, siteId))}
    </main>
  );
};

export default SiteApp;
