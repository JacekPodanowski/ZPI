import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import useNewEditorStore from '../../store/newEditorStore';
import StructureMode from './StructureMode';
import DetailMode from './DetailMode';
import EditorTopBar from './EditorTopBar';
import { fetchSiteById } from '../../../services/siteService';

const NewEditorPage = () => {
  const { siteId } = useParams();
  const { editorMode, loadSite, setSiteId, setSiteName } = useNewEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSiteData = async () => {
      if (siteId) {
        try {
          setLoading(true);
          const data = await fetchSiteById(siteId);
          
          // Set site ID and name
          setSiteId(data.id);
          setSiteName(data.name || 'Untitled Site');
          
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
          } else {
            // No valid config - create default structure
            console.log('[NewEditorPage] No valid config found, creating default structure');
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
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Failed to load site:', err);
          setError('Failed to load site data');
          setLoading(false);
        }
      } else {
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
          bgcolor: 'rgb(228, 229, 218)'
        }}
      >
        <CircularProgress sx={{ color: 'rgb(146, 0, 32)' }} />
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
          bgcolor: 'rgb(228, 229, 218)'
        }}
      >
        <Typography sx={{ color: 'rgb(146, 0, 32)' }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgb(228, 229, 218)',
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
  );
};

export default NewEditorPage;
