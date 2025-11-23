import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

// JEDYNE POTRZEBNE IMPORTY SYSTEMOWE
import { MODULE_REGISTRY } from './components/modules/ModuleRegistry.js';
import composeSiteStyle, {
  resolveStyleId as resolveStyleIdFromConfig,
  extractStyleOverrides as extractStyleOverridesFromConfig
} from './styles/utils.js';
import getTypographyFonts from './styles/typography.js';

const fetchPublicSiteConfig = async (identifier) => {
  const response = await apiClient.get(`/public-sites/${identifier}/`);
  return response.data;
};

// NOWA, UPROSZCZONA FUNKCJA RENDERUJĄCA
const renderModule = (module, style, typography, siteId, siteIdentifier, activePageKey) => {
  if (module?.enabled === false) return null;
  
  const moduleType = (module.type || module.id || '').toLowerCase();
  const moduleDef = MODULE_REGISTRY[moduleType];

  if (moduleDef) {
    const Component = moduleDef.component;
    // Support both module.layout and module.content.layout
    const layout = module.layout || module.content?.layout || moduleDef.defaultLayout;
    
    // Dla nawigacji dodaj activePageId do contentu
    const content = moduleType === 'navigation' 
      ? { ...module.content, activePageId: activePageKey }
      : module.content || {};
    
    return (
      <Component
        key={module.id}
        layout={layout}
        content={content}
        style={style}
        typography={typography}
        siteId={siteId}
        siteIdentifier={siteIdentifier}
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

// ZMIANA: Komponent teraz przyjmuje opcjonalny props `siteIdentifierFromPath` lub `previewConfig`
const SiteApp = ({ siteIdentifierFromPath, previewConfig, isPreview = false }) => {
  const [config, setConfig] = useState(previewConfig || null);
  const [siteId, setSiteId] = useState(null);
  const [siteIdentifier, setSiteIdentifier] = useState(null);
  const [loading, setLoading] = useState(!previewConfig);
  const [error, setError] = useState(null);
  const [activePageKey, setActivePageKey] = useState(null);

  useEffect(() => {
    // Jeśli to preview z gotowym configiem, pomijamy ładowanie
    if (previewConfig) {
      setConfig(previewConfig);
      setLoading(false);
      setSiteId('preview');
      return;
    }

    const routingMode = import.meta.env.VITE_APP_ROUTING_MODE;
    const buildTarget = import.meta.env.VITE_BUILD_TARGET;
    let identifier = null;

    // Tryb SITE (dla Vercel deployments)
    if (buildTarget === 'SITE') {
      identifier = import.meta.env.VITE_SITE_ID;
    } 
    // Tryb path (deweloperski)
    else if (routingMode === 'path') {
      identifier = siteIdentifierFromPath;
    } 
    // Tryb subdomain (produkcyjny)
    else {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      // Ignoruj "www" i "studio"
      if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'studio') {
        identifier = parts[0];
      } else if (parts[0] !== 'localhost' && parts[0] !== 'studio') {
        // Dla prostych domen (bez subdomen)
        identifier = parts[0];
      }
    }
    
    if (!identifier) {
      setError('Nie można zidentyfikować strony na podstawie adresu URL.');
      setLoading(false);
      return;
    }

    setSiteIdentifier(identifier);

    const loadSite = async () => {
      try {
        const siteData = await fetchPublicSiteConfig(identifier);
        setSiteId(siteData.id);
        if (siteData.identifier) {
          setSiteIdentifier(siteData.identifier);
        }
        
        // Obsługa dwóch struktur: template_config.site lub template_config bezpośrednio
        let templateConfig;
        if (siteData.template_config?.site) {
          // Nowa struktura: { template_config: { site: { pages: [...] } } }
          templateConfig = siteData.template_config.site;
        } else if (siteData.template_config?.pages) {
          // Stara struktura: { template_config: { pages: [...] } }
          templateConfig = siteData.template_config;
        } else {
          templateConfig = {};
        }
        
        setConfig(templateConfig);
      } catch (err) {
        setError(`Strona "${identifier}" nie została znaleziona lub wystąpił błąd ładowania.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [siteIdentifierFromPath, previewConfig]);

  useEffect(() => {
    if (!config) return;

    // Convert pages array to object for rendering
    const pages = Array.isArray(config.pages)
      ? config.pages.reduce((acc, page) => {
          acc[page.id] = page;
          return acc;
        }, {})
      : (config.pages || {});

    // Funkcja pomocnicza do budowania pełnej ścieżki w zależności od trybu
    const buildFullPath = (route) => {
      const routingMode = import.meta.env.VITE_APP_ROUTING_MODE;
      const buildTarget = import.meta.env.VITE_BUILD_TARGET;
      
      // W trybie SITE lub subdomain, używaj bezpośrednich ścieżek
      if (buildTarget === 'SITE' || routingMode === 'subdomain') {
        return route;
      }
      
      // W trybie path, dodaj prefiks /viewer/:siteIdentifier
      if (routingMode === 'path' && siteIdentifier) {
        return `/viewer/${siteIdentifier}${route}`;
      }
      
      return route;
    };

    const getPageKeyFromPath = (path) => {
      if (!path) return null;
      
      // W trybie path, usuń prefiks /viewer/:siteIdentifier
      const routingMode = import.meta.env.VITE_APP_ROUTING_MODE;
      let cleanPath = path;
      
      if (routingMode === 'path' && siteIdentifier) {
        const prefix = `/viewer/${siteIdentifier}`;
        if (path.startsWith(prefix)) {
          cleanPath = path.substring(prefix.length) || '/';
        }
      }
      
      const entry = Object.entries(pages).find(([, page]) => page?.route === cleanPath);
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

    // Ustaw początkową stronę tylko raz przy załadowaniu konfiguracji
    if (!activePageKey) {
      setActivePageKey(determineInitialPage());
    }

    const handlePopState = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const nextKey = getPageKeyFromPath(window.location.pathname);
      if (nextKey && pages[nextKey]) {
        setActivePageKey(nextKey);
      }
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
        return;
      }

      let pageKey = target.pageId;

      if (!pageKey && target.path) {
        pageKey = getPageKeyFromPath(target.path);
      }

      if (pageKey && pages[pageKey]) {
        setActivePageKey(pageKey);
        if (typeof window !== 'undefined') {
          const baseRoute = pages[pageKey].route || `/${pageKey}`;
          const nextPath = buildFullPath(baseRoute);
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

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('site:navigate', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('site:navigate', handleNavigation);
    };
  }, [config, siteIdentifier, activePageKey]);

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
  const typography = getTypographyFonts(style);
  const fontCss = `
    [data-site-app-root="true"] {
      font-family: ${typography.textFont};
    }

    [data-site-app-root="true"] h1,
    [data-site-app-root="true"] h2,
    [data-site-app-root="true"] h3,
    [data-site-app-root="true"] h4,
    [data-site-app-root="true"] h5,
    [data-site-app-root="true"] h6,
    [data-site-app-root="true"] .font-heading {
      font-family: ${typography.titleFont};
    }

    [data-site-app-root="true"] p,
    [data-site-app-root="true"] span,
    [data-site-app-root="true"] div,
    [data-site-app-root="true"] a,
    [data-site-app-root="true"] li,
    [data-site-app-root="true"] .font-body {
      font-family: ${typography.textFont};
    }
  `;

  // Renderuj globalne moduły (np. nawigacja) - są to moduły na poziomie site, nie strony
  const globalModules = (config.modules || [])
    .filter((module) => module?.enabled !== false)
    .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

  // Automatycznie generuj nawigację z listy stron, jeśli nie ma zdefiniowanego modułu nawigacji
  const hasNavigationModule = globalModules.some(m => m.type === 'navigation');
  const autoNavigation = !hasNavigationModule && config.pages ? {
    id: 'auto-navigation',
    type: 'navigation',
    order: -1000,
    enabled: true,
    content: {
      layout: 'horizontal',
      links: Array.isArray(config.pages) 
        ? config.pages.map(page => ({
            label: page.name || page.id,
            href: page.route || `/${page.id}`,
            pageId: page.id
          }))
        : Object.entries(config.pages).map(([pageId, page]) => ({
            label: page.name || pageId,
            href: page.route || `/${pageId}`,
            pageId: pageId
          }))
    }
  } : null;

  // Renderuj moduły specyficzne dla aktywnej strony
  const modulesToRender = activePage.modules
    ?.filter((module) => module?.enabled !== false)
    ?.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)) || [];

  return (
    <main data-site-app-root="true" style={{ fontFamily: typography.textFont }}>
      <style>{fontCss}</style>
      {/* Renderuj automatyczną nawigację jeśli nie ma zdefiniowanej */}
      {autoNavigation && renderModule(autoNavigation, style, typography, siteId, siteIdentifier, activePageKey)}
      
      {/* Renderuj globalne moduły (nawigacja, stopka) */}
      {globalModules.map((module) => renderModule(module, style, typography, siteId, siteIdentifier, activePageKey))}
      
      {/* Następnie renderuj moduły specyficzne dla strony */}
      {modulesToRender.map((module) => renderModule(module, style, typography, siteId, siteIdentifier, activePageKey))}
    </main>
  );
};

export default SiteApp;
