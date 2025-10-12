import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import ModuleSelector from '../components/ModuleSelector';
import SiteCanvas from '../components/SiteCanvas';
import Configurator from '../components/Configurator';
import AIChat from '../components/AIChat';
import useEditorStore, { createDefaultTemplateConfig } from '../../store/editorStore';
import EditorToolbar from '../components/TopBar';
import { fetchSiteById } from '../../services/siteService';

const EditorPage = () => {
  const { siteId } = useParams();
  const location = useLocation();
  const {
    mode,
    setMode,
    setTemplateConfig,
    resetTemplateConfig,
    setSiteMeta,
    siteMeta,
    expertMode,
    selectedModule
  } = useEditorStore();

  const [loading, setLoading] = useState(Boolean(siteId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const initialiseNewSite = () => {
      if (location.state?.isNewSite) {
        setSiteMeta({ id: null, name: location.state.siteName || 'Nowa strona' });
        setMode('edit');
        setLoading(false);
        return;
      }
      resetTemplateConfig();
      setLoading(false);
    };

    const loadSite = async () => {
      try {
        setLoading(true);
        const site = await fetchSiteById(siteId);
        if (!active) {
          return;
        }
        setTemplateConfig(site.template_config || createDefaultTemplateConfig());
        setSiteMeta({ id: site.id, name: site.name });
        setMode('edit');
        setError(null);
      } catch (err) {
        if (active) {
          setError('Nie udało się załadować konfiguracji strony.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (siteId) {
      loadSite();
    } else {
      initialiseNewSite();
    }

    return () => {
      active = false;
    };
  }, [location.state, resetTemplateConfig, setMode, setSiteMeta, setTemplateConfig, siteId]);

  const title = useMemo(() => {
    if (siteMeta?.name) {
      return siteMeta.name;
    }
    return 'Nowa strona';
  }, [siteMeta]);

  const showSidebar = mode === 'edit' && expertMode && !loading;
  const showConfigurator = mode === 'edit' && !loading && (expertMode || selectedModule);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 4 }, pb: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 2, color: 'secondary.main' }}>
              EDYTOR
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Przełączaj tryby, zapisuj wersje i opublikuj ulepszoną odsłonę swojej strony.
            </Typography>
          </Box>

          <EditorToolbar siteId={siteMeta?.id || siteId} siteName={title} isNewSite={!siteId} disabled={loading} />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 2, md: 4 },
          pb: { xs: 2, md: 3 },
          gap: 2
        }}
      >
        {loading ? (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 4,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress />
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flex: 1, gap: 2, minHeight: 0, flexDirection: { xs: 'column', lg: 'row' } }}>
            {showSidebar && (
              <Paper
                variant="outlined"
                sx={{
                  width: { xs: '100%', lg: 280 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <ModuleSelector />
              </Paper>
            )}

            <Paper
              variant="outlined"
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <SiteCanvas />
            </Paper>

            {showConfigurator && (
              <Paper
                variant="outlined"
                sx={{
                  width: { xs: '100%', lg: 320 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Configurator compact={!expertMode} />
              </Paper>
            )}
          </Box>
        )}

        {mode === 'edit' && !loading && expertMode && <AIChat />}
      </Box>
    </Box>
  );
};

export default EditorPage;
