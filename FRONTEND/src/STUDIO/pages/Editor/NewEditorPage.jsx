import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import useNewEditorStore from '../../store/newEditorStore';
import StructureMode from './StructureMode';
import DetailMode from './DetailMode';
import EditorTopBar from './EditorTopBar';
import EditorErrorBoundary from './EditorErrorBoundary';
import ImageSearchIntegration from '../../components/ImageSearchIntegration';
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
  const navigate = useNavigate();
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
          
          // ============================================
          // OWNER CHECK: Only site owner can access editor
          // Team members should use calendar instead
          // ============================================
          if (data.owner && user && data.owner.id !== user.id) {
            console.warn('[NewEditorPage] User is not owner - redirecting to calendar');
            navigate(`/studio/events/${siteId}`, { replace: true });
            return;
          }
          
          const latestVersionConfig = data.latest_version?.template_config;
          const templateSource = latestVersionConfig && Object.keys(latestVersionConfig).length
            ? latestVersionConfig
            : (data.template_config || {});

          // Set site ID and name
          setSiteId(data.id);
          setSiteName(data.name || 'Untitled Site');
          setSiteIdentifier(data.identifier || data.identifier_slug || null);

          // Load the site structure from template_config (prefer the latest recorded version)
          if (templateSource && templateSource.site) {
            // New unified format
            loadSite({
              id: data.id,
              name: data.name,
              site: templateSource.site,
              userLibrary: templateSource.userLibrary || { customAssets: [] },
              entryPointPageId: templateSource.entryPointPageId || templateSource.site.pages[0]?.id,
              currentVersionNumber: data.latest_version?.version_number || 0,
              lastSavedAt: data.latest_version?.created_at || data.updated_at
            });
          } else if (templateSource && templateSource.pages) {
            // Old format - pages at root level
            loadSite({
              id: data.id,
              name: data.name,
              site: {
                vibe: templateSource.vibe || 'auroraMinimal',
                theme: templateSource.theme || {
                  primary: '#920020',
                  secondary: '#2D5A7B',
                  neutral: '#E4E5DA'
                },
                pages: templateSource.pages
              },
              userLibrary: { customAssets: [] },
              entryPointPageId: templateSource.pages[0]?.id,
              currentVersionNumber: data.latest_version?.version_number || 0,
              lastSavedAt: data.latest_version?.created_at || data.updated_at
            });
          } else {
            // No valid config - create default structure

            // Check if we have old-style module names array
            const pages = [];
            const homeModules = [];

            if (templateSource && Array.isArray(templateSource.modules)) {
              
              // Always add Hero to home page
              const heroModule = convertModuleNameToObject('hero', 0);
              homeModules.push(heroModule);
              
              // Create separate page for each other module
              templateSource.modules.forEach((moduleName, index) => {
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
                vibe: templateSource?.vibe || 'auroraMinimal',
                theme: templateSource?.colors ? {
                  primary: templateSource.colors.primary || '#920020',
                  secondary: templateSource.colors.secondary || '#2D5A7B',
                  neutral: '#E4E5DA'
                } : {
                  primary: '#920020',
                  secondary: '#2D5A7B',
                  neutral: '#E4E5DA'
                },
                pages: allPages
              },
              userLibrary: { customAssets: [] },
              entryPointPageId: 'home',
              currentVersionNumber: data.latest_version?.version_number || 0,
              lastSavedAt: data.latest_version?.created_at || data.updated_at
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
  }, [siteId, loadSite, setSiteId, setSiteName, user, navigate]);

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

  // Listen for AI updates dispatched from AIChatPanel
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

        {/* Image Search Integration - Floating button + Modal/Panel */}
        {editorMode === 'detail' && <ImageSearchIntegration />}
      </Box>
    </EditorErrorBoundary>
  );
};

export default NewEditorPage;
