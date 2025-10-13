import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import ModuleSelector from '../../components/ModuleSelector';
import SiteCanvas from '../../components/SiteCanvas';
import Configurator from '../../components/Configurator';
import AIChat from '../../components/AIChat';
import useEditorStore, { createDefaultTemplateConfig } from '../../store/editorStore';
import EditorNavigation from '../../components/EditorNavigation/EditorNavigation';
import { fetchSiteById, updateSiteTemplate } from '../../../services/siteService';
import { ThemeProvider as MuiThemeProvider, createTheme as createMuiTheme } from '@mui/material/styles';
import { createTheme as createSemanticTheme, assignCssVariables } from '../../../theme/colorSystem';
import { themeDefinitions } from '../../../theme/themeDefinitions';

const PENDING_CONFIG_KEY = 'editor:pendingTemplateConfig';
const PENDING_META_KEY = 'editor:pendingSiteMeta';
const ACTIVE_NEW_DRAFT_KEY = 'editor:activeNewDraft';
const EXISTING_DRAFT_PREFIX = 'editor:draft:site:';
const NEW_DRAFT_PREFIX = 'editor:draft:new:';

const createDraftId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
};

const getDraftStorageKey = (siteIdentifier, draftIdentifier) => {
  if (siteIdentifier) {
    return `${EXISTING_DRAFT_PREFIX}${siteIdentifier}`;
  }
  if (draftIdentifier) {
    return `${NEW_DRAFT_PREFIX}${draftIdentifier}`;
  }
  return null;
};

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
    templateConfig,
    hasUnsavedChanges,
    setHasUnsavedChanges
  } = useEditorStore();

  const [draftId] = useState(() => {
    if (siteId) {
      return null;
    }
    if (location.state?.draftId) {
      return location.state.draftId;
    }
    if (typeof window !== 'undefined') {
      const existing = window.localStorage.getItem(ACTIVE_NEW_DRAFT_KEY);
      if (existing) {
        return existing;
      }
    }
    return createDraftId();
  });

  const draftStorageKey = useMemo(() => getDraftStorageKey(siteId, draftId), [siteId, draftId]);

  const readDraft = useCallback(() => {
    if (!draftStorageKey || typeof window === 'undefined') {
      return null;
    }
    const raw = window.localStorage.getItem(draftStorageKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('Nie udało się odczytać szkicu z localStorage.', error);
      return null;
    }
  }, [draftStorageKey]);

  const persistDraft = useCallback((config, meta, unsaved) => {
    if (!draftStorageKey || typeof window === 'undefined') {
      return;
    }
    try {
      const payload = {
        draftId,
        siteId: siteId || null,
        config,
        meta,
        hasUnsavedChanges: Boolean(unsaved),
        updatedAt: Date.now()
      };
      window.localStorage.setItem(draftStorageKey, JSON.stringify(payload));
    } catch (error) {
      console.error('Nie udało się zapisać szkicu w localStorage.', error);
    }
  }, [draftStorageKey, draftId, siteId]);

  const clearLocalDraft = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (draftStorageKey) {
      window.localStorage.removeItem(draftStorageKey);
    }
    if (!siteId && draftId) {
      const activeDraft = window.localStorage.getItem(ACTIVE_NEW_DRAFT_KEY);
      if (activeDraft === draftId) {
        window.localStorage.removeItem(ACTIVE_NEW_DRAFT_KEY);
      }
    }
    window.sessionStorage.removeItem(PENDING_CONFIG_KEY);
    window.sessionStorage.removeItem(PENDING_META_KEY);
    window.localStorage.removeItem(PENDING_CONFIG_KEY);
    window.localStorage.removeItem(PENDING_META_KEY);
  }, [draftStorageKey, siteId, draftId]);

  const flushDraft = useCallback(async ({ forceRemove = false } = {}) => {
    const hasSiteIdentifier = Boolean(siteMeta?.id);
    let persisted = false;

    if (hasSiteIdentifier && hasUnsavedChanges) {
      try {
        await updateSiteTemplate(siteMeta.id, templateConfig, siteMeta.name);
        setHasUnsavedChanges(false);
        persisted = true;
      } catch (error) {
        console.error('Nie udało się zapisać zmian przed opuszczeniem edytora.', error);
      }
    }

    if (forceRemove || (hasSiteIdentifier && (!hasUnsavedChanges || persisted))) {
      clearLocalDraft();
    }
  }, [siteMeta?.id, siteMeta?.name, hasUnsavedChanges, templateConfig, setHasUnsavedChanges, clearLocalDraft]);

  useEffect(() => {
    if (!siteId && draftId && typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_NEW_DRAFT_KEY, draftId);
    }
  }, [siteId, draftId]);

  // Always initialize loading to true to prevent rendering with stale state.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasContainerRef = useRef(null);
  const initialisedRef = useRef(false);

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
    setLoading(true);
    setError(null);

    const loadExistingSite = async () => {
      try {
        const site = await fetchSiteById(siteId);
        if (!active) {
          return;
        }

        const storedDraft = readDraft();
        const shouldUseStored = storedDraft?.config && storedDraft?.hasUnsavedChanges;

        if (shouldUseStored) {
          setTemplateConfig(storedDraft.config, { markDirty: true });
          setSiteMeta({ id: site.id, name: storedDraft.meta?.name || site.name });
        } else {
          setTemplateConfig(site.template_config || createDefaultTemplateConfig());
          setSiteMeta({ id: site.id, name: site.name });
          clearLocalDraft();
        }

        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem(PENDING_CONFIG_KEY);
          window.sessionStorage.removeItem(PENDING_META_KEY);
        }

        initialisedRef.current = true;
        setMode('edit');
        setLoading(false);
      } catch (err) {
        if (!active) {
          return;
        }
        setError('Nie udało się załadować konfiguracji strony.');
        setLoading(false);
      }
    };

    const loadNewSite = () => {
      const storedDraft = readDraft();
      const pendingConfigLocalRaw = typeof window !== 'undefined'
        ? window.localStorage.getItem(PENDING_CONFIG_KEY)
        : null;
      const pendingConfigRaw = typeof window !== 'undefined'
        ? window.sessionStorage.getItem(PENDING_CONFIG_KEY)
        : null;
      const pendingMetaLocalRaw = typeof window !== 'undefined'
        ? window.localStorage.getItem(PENDING_META_KEY)
        : null;
      const pendingMetaRaw = typeof window !== 'undefined'
        ? window.sessionStorage.getItem(PENDING_META_KEY)
        : null;

      let pendingMeta = null;
      if (pendingMetaLocalRaw) {
        try {
          const parsedMeta = JSON.parse(pendingMetaLocalRaw);
          if (parsedMeta?.meta) {
            pendingMeta = parsedMeta.meta;
          }
        } catch (error) {
          console.error('Nie udało się odczytać metadanych strony z localStorage.', error);
        }
      }
      if (pendingMetaRaw) {
        try {
          pendingMeta = JSON.parse(pendingMetaRaw);
        } catch (error) {
          console.error('Nie udało się odczytać metadanych strony.', error);
        }
      }

      let pendingConfigPayload = null;
      if (pendingConfigLocalRaw) {
        try {
          const parsedConfig = JSON.parse(pendingConfigLocalRaw);
          if (parsedConfig?.templateConfig) {
            pendingConfigPayload = parsedConfig;
          }
        } catch (error) {
          console.error('Nie udało się odczytać konfiguracji szablonu z localStorage.', error);
        }
      }

      if (storedDraft?.config) {
        setTemplateConfig(storedDraft.config, { markDirty: storedDraft.hasUnsavedChanges });
        setSiteMeta(storedDraft.meta || { id: null, name: storedDraft.meta?.name || pendingMeta?.name || location.state?.siteName || 'Nowa strona' });
      } else if (pendingConfigPayload?.templateConfig) {
        setTemplateConfig(pendingConfigPayload.templateConfig, { markDirty: true, restrictToDefaultPages: true });
        setSiteMeta({ id: null, name: pendingMeta?.name || pendingConfigPayload.templateConfig?.name || location.state?.siteName || 'Nowa strona' });
      } else if (pendingConfigRaw) {
        try {
          const parsedConfig = JSON.parse(pendingConfigRaw);
          setTemplateConfig(parsedConfig, { markDirty: true, restrictToDefaultPages: true });
          setSiteMeta({ id: null, name: pendingMeta?.name || parsedConfig?.name || location.state?.siteName || 'Nowa strona' });
        } catch (error) {
          console.error('Nie udało się odczytać zapisanej konfiguracji edytora.', error);
          resetTemplateConfig();
          setSiteMeta({ id: null, name: location.state?.siteName || 'Nowa strona' });
        }
      } else if (location.state?.isNewSite) {
        setSiteMeta({ id: null, name: location.state.siteName || 'Nowa strona' });
      } else {
        setSiteMeta((previous) => {
          if (previous?.name) {
            return previous;
          }
          return { id: null, name: 'Nowa strona' };
        });
      }

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(PENDING_CONFIG_KEY);
        window.sessionStorage.removeItem(PENDING_META_KEY);
      }

      initialisedRef.current = true;
      setMode('edit');
      setLoading(false);
    };

    if (siteId) {
      loadExistingSite();
    } else {
      loadNewSite();
    }

    return () => {
      active = false;
    };
  }, [siteId, location.state, readDraft, clearLocalDraft, setTemplateConfig, setSiteMeta, resetTemplateConfig, setMode]);


  useEffect(() => {
    if (!draftStorageKey || loading || !initialisedRef.current) {
      return;
    }
    persistDraft(templateConfig, siteMeta, hasUnsavedChanges);
  }, [draftStorageKey, loading, templateConfig, siteMeta, hasUnsavedChanges, persistDraft]);


  useEffect(() => () => {
    flushDraft();
  }, [flushDraft]);


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