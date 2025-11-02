import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import useNewEditorStore from '../../store/newEditorStore';
import StructureMode from './StructureMode';
import DetailMode from './DetailMode';
import EditorTopBar from './EditorTopBar';
import EditorErrorBoundary from './EditorErrorBoundary';
import { fetchSiteById } from '../../../services/siteService';
import useTheme from '../../../theme/useTheme';

const NewEditorPage = () => {
  const { siteId } = useParams();
  const { editorMode, loadSite, setSiteId, setSiteName } = useNewEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

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
                vibe: data.template_config.vibe || 'minimal',
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
            
            loadSite({
              id: data.id,
              name: data.name,
              site: {
                vibe: 'minimal',
                theme: {
                  primary: '#920020',
                  secondary: '#2D5A7B',
                  neutral: '#E4E5DA'
                },
                pages: [
                  {
                    id: 'home',
                    name: 'Home',
                    route: '/',
                    modules: []
                  }
                ]
              },
              userLibrary: { customAssets: [] },
              entryPointPageId: 'home'
            });
            console.log('[NewEditorPage] Default structure created');
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

  if (loading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.colors?.background?.base || 'rgb(228, 229, 218)'
        }}
      >
        <CircularProgress sx={{ color: theme.colors?.primary?.base || 'rgb(146, 0, 32)' }} />
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
          bgcolor: theme.colors?.background?.base || 'rgb(228, 229, 218)'
        }}
      >
        <Typography sx={{ color: theme.colors?.primary?.base || 'rgb(146, 0, 32)' }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <EditorErrorBoundary>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: theme.colors?.background?.base || 'rgb(228, 229, 218)',
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
