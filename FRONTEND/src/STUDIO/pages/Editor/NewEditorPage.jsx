import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import useNewEditorStore from '../../store/newEditorStore';
import StructureMode from './StructureMode';
import DetailMode from './DetailMode';
import EditorTopBar from './EditorTopBar';
import EditorErrorBoundary from './EditorErrorBoundary';
import { fetchSiteById } from '../../../services/siteService';
import useTheme from '../../../theme/useTheme';
import getEditorColorTokens from '../../../theme/editorColorTokens';
import { getDefaultModuleContent } from './moduleDefinitions';
import { useAuth } from '../../../contexts/AuthContext';
import { validateAIResponse, extractSiteFromResponse } from '../../components_STUDIO/AI/aiHelpers';

// Helper function to convert old module format to new format
const convertModuleNameToObject = (moduleName, index) => {
  // Map old module names to new types
  const typeMapping = {
    'publicCalendar': 'calendar',
    'publicCalendarBig': 'publicCalendarBig',
    'publicCalendarSmall': 'publicCalendarSmall',
    'calendar': 'publicCalendarSmall',
    'about': 'about',

    'services': 'services',
    'pricing': 'pricing',
    'gallery': 'gallery',
    'contact': 'contact',
    'text': 'text',
    'video': 'video',
    'testimonials': 'testimonials',
    'faq': 'faq',
    'team': 'team',
    'hero': 'hero',
    'navigation': 'navigation'
  };

  const moduleType = typeMapping[moduleName] || moduleName;
  
  return {
    id: `module-${moduleType}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    type: moduleType,
    content: getDefaultModuleContent(moduleType),
    enabled: true
  };
};

const NewEditorPage = () => {
  const { siteId } = useParams();
  const { editorMode, loadSite, setSiteId, setSiteName, setSiteIdentifier, replaceSiteStateWithHistory } = useNewEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const { user } = useAuth();
  const site = useNewEditorStore(state => state.site);

  // Inject font styles into editor preview
  useEffect(() => {
    if (!site?.style) return;

    const styleId = 'editor-font-preview';
    let styleEl = document.getElementById(styleId);
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const titleFont = site.style.titleFont || '"Inter", sans-serif';
    const textFont = site.style.textFont || site.style.titleFont || '"Inter", sans-serif';

    styleEl.textContent = `
      /* Editor Font Preview - Applied only in editor */
      [data-detail-canvas-scroll="true"] h1,
      [data-detail-canvas-scroll="true"] h2,
      [data-detail-canvas-scroll="true"] h3,
      [data-detail-canvas-scroll="true"] h4,
      [data-detail-canvas-scroll="true"] h5,
      [data-detail-canvas-scroll="true"] h6,
      [data-detail-canvas-scroll="true"] .font-heading {
        font-family: ${titleFont} !important;
      }
      
      [data-detail-canvas-scroll="true"] p,
      [data-detail-canvas-scroll="true"] span,
      [data-detail-canvas-scroll="true"] div,
      [data-detail-canvas-scroll="true"] a,
      [data-detail-canvas-scroll="true"] li,
      [data-detail-canvas-scroll="true"] .font-body {
        font-family: ${textFont} !important;
      }
    `;

    return () => {
      // Clean up on unmount
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [site?.style?.titleFont, site?.style?.textFont]);

  useEffect(() => {
    const loadSiteData = async () => {
      if (siteId) {
        try {
          setLoading(true);
          const data = await fetchSiteById(siteId);
          
          
          // Set site ID and name
          setSiteId(data.id);
          setSiteName(data.name || 'Untitled Site');
          setSiteIdentifier(data.identifier || data.identifier_slug || null);
          
          // Load the site structure from template_config
          if (data.template_config && data.template_config.site) {
            // New unified format
            loadSite({
              id: data.id,
              name: data.name,
              site: data.template_config.site,
              userLibrary: data.template_config.userLibrary || { customAssets: [] },
              entryPointPageId: data.template_config.entryPointPageId || data.template_config.site.pages[0]?.id
            });
          } else if (data.template_config && data.template_config.pages) {
            // Old format - pages at root level
            
            loadSite({
              id: data.id,
              name: data.name,
              site: {
                vibe: data.template_config.vibe || 'auroraMinimal',
                theme: data.template_config.theme || {
                  primary: '#920020',
                  secondary: '#2D5A7B',
                  neutral: '#E4E5DA'
                },
                pages: data.template_config.pages
              },
              userLibrary: { customAssets: [] },
              entryPointPageId: data.template_config.pages[0]?.id
            });
          } else {
            // No valid config - create default structure
            
            // Check if we have old-style module names array
            const pages = [];
            const homeModules = [];
            
            if (data.template_config && Array.isArray(data.template_config.modules)) {
              
              // Always add Hero to home page
              const heroModule = convertModuleNameToObject('hero', 0);
              homeModules.push(heroModule);
              
              // Create separate page for each other module
              data.template_config.modules.forEach((moduleName, index) => {
                const moduleObj = convertModuleNameToObject(moduleName, index + 1);
                
                // Skip hero as it's already on home
                if (moduleObj.type === 'hero') {
                  return;
                }
                
                // Create page name from module type
                const pageName = moduleObj.type.charAt(0).toUpperCase() + moduleObj.type.slice(1);
                const pageId = `page-${moduleObj.type}-${index}`;
                const route = `/${moduleObj.type.toLowerCase()}`;
                
                pages.push({
                  id: pageId,
                  name: pageName,
                  route: route,
                  modules: [moduleObj]
                });
                
              });
            }
            
            // Create home page with Hero
            const allPages = [
              {
                id: 'home',
                name: 'Home',
                route: '/',
                modules: homeModules
              },
              ...pages
            ];
            
            loadSite({
              id: data.id,
              name: data.name,
              site: {
                vibe: data.template_config?.vibe || 'auroraMinimal',
                theme: data.template_config?.colors ? {
                  primary: data.template_config.colors.primary || '#920020',
                  secondary: data.template_config.colors.secondary || '#2D5A7B',
                  neutral: '#E4E5DA'
                } : {
                  primary: '#920020',
                  secondary: '#2D5A7B',
                  neutral: '#E4E5DA'
                },
                pages: allPages
              },
              userLibrary: { customAssets: [] },
              entryPointPageId: 'home'
            });
          }
          
          setLoading(false);
        } catch (err) {
          setError('Failed to load site data');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadSiteData();
  }, [siteId, loadSite, setSiteId, setSiteName]);

  // Unified AI update handler - defined before useEffect hooks that use it
  const handleAIUpdate = useCallback((data) => {
    // Validate response structure
    const validation = validateAIResponse(data);
    
    if (!validation.valid) {
      window.dispatchEvent(new CustomEvent('ai-update-received', {
        detail: { status: 'error', explanation: validation.error }
      }));
      return;
    }
    
    if (validation.warning) {
    }
    
    if (data.status === 'success' && data.site) {
      
      // Extract site using helper (handles unwrapping)
      const siteData = extractSiteFromResponse(data);
      
      if (!siteData) {
        window.dispatchEvent(new CustomEvent('ai-update-received', {
          detail: { status: 'error', explanation: 'Invalid site data structure' }
        }));
        return;
      }
      
      replaceSiteStateWithHistory(siteData, {
        type: 'ai-update',
        prompt: data.prompt || 'AI modification',
        explanation: data.explanation
      });
      
      // Notify chat panel about success
      window.dispatchEvent(new CustomEvent('ai-update-received', {
        detail: { status: 'success', explanation: data.explanation }
      }));
    } else if (data.status === 'error') {
      
      // Notify chat panel about error
      window.dispatchEvent(new CustomEvent('ai-update-received', {
        detail: { status: 'error', explanation: data.error }
      }));
    }
  }, [replaceSiteStateWithHistory]);

  // WebSocket connection for AI updates (now used only for real-time delivery)
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Use backend URL for WebSocket
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const backendHost = API_BASE.replace(/^https?:\/\//, '').replace(/\/api\/v1$/, '');
    const wsProtocol = API_BASE.startsWith('https') ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${backendHost}/ws/ai-updates/${user.id}/`;
    
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        handleAIUpdate(data);
      } catch (error) {
      }
    };

    socket.onerror = (error) => {
    };

    socket.onclose = (event) => {
    };

    return () => {
      socket.close();
    };
  }, [user?.id, handleAIUpdate]);

  // Also listen for polling-based updates
  useEffect(() => {
    const handlePolledUpdate = (event) => {
      handleAIUpdate(event.detail);
    };

    window.addEventListener('ai-site-updated', handlePolledUpdate);
    return () => window.removeEventListener('ai-site-updated', handlePolledUpdate);
  }, [handleAIUpdate]);

  if (loading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: editorColors.backgrounds.page
        }}
      >
        <CircularProgress sx={{ color: editorColors.interactive.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: editorColors.backgrounds.page
        }}
      >
        <Typography sx={{ color: editorColors.interactive.main }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <EditorErrorBoundary>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: editorColors.backgrounds.page,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <EditorTopBar />
        
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {editorMode === 'structure' ? <StructureMode /> : <DetailMode />}
        </Box>
      </Box>
    </EditorErrorBoundary>
  );
};

export default NewEditorPage;
