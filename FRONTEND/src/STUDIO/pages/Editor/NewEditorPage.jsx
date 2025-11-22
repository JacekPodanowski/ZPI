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

  useEffect(() => {
    const loadSiteData = async () => {
      if (siteId) {
        try {
          console.log('[NewEditorPage] Loading site with ID:', siteId);
          setLoading(true);
          const data = await fetchSiteById(siteId);
          
          console.log('[NewEditorPage] API Response:', data);
          console.log('[NewEditorPage] template_config:', data.template_config);
          
          // Set site ID and name
          setSiteId(data.id);
          setSiteName(data.name || 'Untitled Site');
          setSiteIdentifier(data.identifier || data.identifier_slug || null);
          
          // Load the site structure from template_config
          if (data.template_config && data.template_config.site) {
            // New unified format
            console.log('[NewEditorPage] Loading from template_config.site format');
            console.log('[NewEditorPage] Pages found:', data.template_config.site.pages);
            
            loadSite({
              id: data.id,
              name: data.name,
              site: data.template_config.site,
              userLibrary: data.template_config.userLibrary || { customAssets: [] },
              entryPointPageId: data.template_config.entryPointPageId || data.template_config.site.pages[0]?.id
            });
            console.log('[NewEditorPage] Site loaded successfully from template_config');
          } else if (data.template_config && data.template_config.pages) {
            // Old format - pages at root level
            console.log('[NewEditorPage] Loading from old template_config.pages format');
            console.log('[NewEditorPage] Pages found:', data.template_config.pages);
            
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
            console.log('[NewEditorPage] Site loaded successfully from old format');
          } else {
            // No valid config - create default structure
            console.log('[NewEditorPage] No valid config found, creating default structure');
            console.log('[NewEditorPage] template_config value:', JSON.stringify(data.template_config, null, 2));
            
            // Check if we have old-style module names array
            const pages = [];
            const homeModules = [];
            
            if (data.template_config && Array.isArray(data.template_config.modules)) {
              console.log('[NewEditorPage] Converting old module names to new format:', data.template_config.modules);
              
              // Always add Hero to home page
              const heroModule = convertModuleNameToObject('hero', 0);
              homeModules.push(heroModule);
              console.log('[NewEditorPage] Added Hero to home page:', heroModule);
              
              // Create separate page for each other module
              data.template_config.modules.forEach((moduleName, index) => {
                const moduleObj = convertModuleNameToObject(moduleName, index + 1);
                console.log('[NewEditorPage] Processing module:', moduleName, '->', moduleObj);
                
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
                
                console.log('[NewEditorPage] Created page:', { pageId, pageName, route });
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
            console.log('[NewEditorPage] Default structure created with pages:', allPages);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('[NewEditorPage] Failed to load site:', err);
          console.error('[NewEditorPage] Error details:', err.response?.data || err.message);
          setError('Failed to load site data');
          setLoading(false);
        }
      } else {
        console.log('[NewEditorPage] No siteId provided');
        setLoading(false);
      }
    };

    loadSiteData();
  }, [siteId, loadSite, setSiteId, setSiteName]);

  // WebSocket connection for AI updates (now used only for real-time delivery)
  useEffect(() => {
    if (!user?.id) {
      console.log('[NewEditorPage] No user ID available, skipping WebSocket connection');
      return;
    }

    // Use backend URL for WebSocket
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.104:8000/api/v1';
    const backendHost = API_BASE.replace(/^https?:\/\//, '').replace(/\/api\/v1$/, '');
    const wsProtocol = API_BASE.startsWith('https') ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${backendHost}/ws/ai-updates/${user.id}/`;
    
    console.log('[NewEditorPage] Establishing WebSocket connection to:', wsUrl);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('[NewEditorPage] WebSocket connected for AI updates');
    };

    socket.onmessage = (event) => {
      try {
        console.log('[NewEditorPage] Raw WebSocket message received:', event.data);
        const data = JSON.parse(event.data);
        console.log('[NewEditorPage] Parsed AI update:', data);

        handleAIUpdate(data);
      } catch (error) {
        console.error('[NewEditorPage] Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('[NewEditorPage] WebSocket error:', error);
    };

    socket.onclose = (event) => {
      console.log('[NewEditorPage] WebSocket closed:', event.code, event.reason);
    };

    return () => {
      console.log('[NewEditorPage] Cleaning up WebSocket connection');
      socket.close();
    };
  }, [user?.id, handleAIUpdate]);

  // Also listen for polling-based updates
  useEffect(() => {
    const handlePolledUpdate = (event) => {
      console.log('[NewEditorPage] Polled AI update received:', event.detail);
      handleAIUpdate(event.detail);
    };

    window.addEventListener('ai-site-updated', handlePolledUpdate);
    return () => window.removeEventListener('ai-site-updated', handlePolledUpdate);
  }, [handleAIUpdate]);

  // Unified AI update handler
  const handleAIUpdate = useCallback((data) => {
    // Validate response structure
    const validation = validateAIResponse(data);
    
    if (!validation.valid) {
      console.error('[NewEditorPage] Invalid AI response:', validation.error);
      window.dispatchEvent(new CustomEvent('ai-update-received', {
        detail: { status: 'error', explanation: validation.error }
      }));
      return;
    }
    
    if (validation.warning) {
      console.warn('[NewEditorPage] AI response warning:', validation.warning);
    }
    
    if (data.status === 'success' && data.site) {
      console.log('[NewEditorPage] Applying AI-generated site update');
      
      // Extract site using helper (handles unwrapping)
      const siteData = extractSiteFromResponse(data);
      
      if (!siteData) {
        console.error('[NewEditorPage] Failed to extract site data from response');
        window.dispatchEvent(new CustomEvent('ai-update-received', {
          detail: { status: 'error', explanation: 'Invalid site data structure' }
        }));
        return;
      }
      
      console.log('[NewEditorPage] Extracted site data - pages:', siteData.pages?.length || 0);
      
      replaceSiteStateWithHistory(siteData, {
        type: 'ai-update',
        prompt: data.prompt || 'AI modification',
        explanation: data.explanation
      });
      
      console.log('[NewEditorPage] replaceSiteStateWithHistory called successfully');
      
      // Notify chat panel about success
      window.dispatchEvent(new CustomEvent('ai-update-received', {
        detail: { status: 'success', explanation: data.explanation }
      }));
    } else if (data.status === 'error') {
      console.error('[NewEditorPage] AI task failed:', data.error);
      
      // Notify chat panel about error
      window.dispatchEvent(new CustomEvent('ai-update-received', {
        detail: { status: 'error', explanation: data.error }
      }));
    }
  }, [replaceSiteStateWithHistory]);

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
