import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import ModuleSelector from '../../components/ModuleSelector';
import SiteCanvas from '../../components/SiteCanvas';
import Configurator from '../../components/Configurator';
import AIChat from '../../components/AIChat';
import useEditorStore, { createDefaultTemplateConfig } from '../../store/editorStore';
import EditorNavigation from '../../components/EditorNavigation/EditorNavigation';
import { fetchSiteById } from '../../../services/siteService';
import { ThemeProvider as MuiThemeProvider, createTheme as createMuiTheme } from '@mui/material/styles';
import { createTheme as createSemanticTheme, assignCssVariables } from '../../../theme/colorSystem';
import { themeDefinitions } from '../../../theme/themeDefinitions';

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
    selectedModule,
    templateConfig
  } = useEditorStore();

  const [loading, setLoading] = useState(Boolean(siteId));
  const [error, setError] = useState(null);
  const canvasContainerRef = useRef(null);

  const siteThemeDefinition = useMemo(() => {
    const themeId = templateConfig?.themeId || templateConfig?.theme?.id || 'modernWellness';
    return themeDefinitions[themeId] || themeDefinitions.modernWellness;
  }, [templateConfig]);

  const siteSemanticTheme = useMemo(
    () => createSemanticTheme(siteThemeDefinition, 'light'),
    [siteThemeDefinition]
  );

  const siteMuiTheme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          mode: siteSemanticTheme.mode,
          primary: { main: siteSemanticTheme.colors.brand.primary },
          secondary: { main: siteSemanticTheme.colors.brand.secondary },
          background: {
            default: siteSemanticTheme.colors.bg.page,
            paper: siteSemanticTheme.colors.bg.surface
          },
          text: {
            primary: siteSemanticTheme.colors.text.primary,
            secondary: siteSemanticTheme.colors.text.secondary
          }
        },
        typography: {
          fontFamily: siteSemanticTheme.typography.fonts.body
        }
      }),
    [siteSemanticTheme]
  );

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

  useEffect(() => {
    const element = canvasContainerRef.current;
    if (!element) {
      return;
    }
    assignCssVariables(element, siteSemanticTheme);
    element.setAttribute('data-site-theme', siteSemanticTheme.id);
    element.style.backgroundColor = siteSemanticTheme.colors.bg.page;
    element.style.color = siteSemanticTheme.colors.text.primary;
  }, [siteSemanticTheme]);

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
      <EditorNavigation
        siteId={siteMeta?.id || siteId}
        siteName={title}
        isNewSite={!siteId}
        disabled={loading}
      />
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ letterSpacing: 2, color: 'secondary.main' }}>
            EDYTOR
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            W trybie edycji możesz eksperymentować z modułami, konfiguracją i natychmiastowym podglądem.
          </Typography>
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

            <MuiThemeProvider theme={siteMuiTheme}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'background.default',
                  color: 'text.primary'
                }}
                ref={canvasContainerRef}
              >
                <SiteCanvas />
              </Paper>
            </MuiThemeProvider>

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
