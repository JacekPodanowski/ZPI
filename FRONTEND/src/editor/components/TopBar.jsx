import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useEditorStore from '../../store/editorStore';
import { createSite, updateSiteTemplate } from '../../services/siteService';
import PageNavigation from './PageNavigation';
import { useNavigate } from 'react-router-dom';

const EditorToolbar = ({ siteId, siteName, isNewSite, disabled }) => {
  const {
    mode,
    setMode,
    expertMode,
    setExpertMode,
    templateConfig,
    saveVersion,
    exportTemplate,
    importTemplate,
    animations,
    setAnimations,
    setSiteMeta
  } = useEditorStore();

  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [nameDraft, setNameDraft] = useState(siteName || '');
  const navigate = useNavigate();

  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    setNameDraft(siteName || '');
  }, [siteName]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          importTemplate(e.target.result);
          setStatus({ type: 'success', message: 'Szablon importowany pomyślnie.' });
        } catch (error) {
          setStatus({ type: 'error', message: 'Nie udało się zaimportować pliku JSON.' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
    handleMenuClose();
  };

  const handleExport = () => {
    try {
      const jsonString = exportTemplate();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(siteName || 'studio').toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', message: 'Szablon wyeksportowany jako JSON.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się wyeksportować szablonu.' });
    }
    handleMenuClose();
  };

  const handleSave = async () => {
    const trimmedName = nameDraft.trim();

    if (!trimmedName) {
      setStatus({ type: 'error', message: 'Podaj nazwę strony przed zapisaniem.' });
      return;
    }

    try {
      setSaving(true);
      saveVersion();
      if (!siteId) {
        const created = await createSite({
          name: trimmedName,
          template_config: templateConfig
        });
        setSiteMeta({ id: created.id, name: created.name });
        setStatus({ type: 'success', message: 'Nowa strona zapisana. Możesz kontynuować edycję.' });
        navigate(`/editor/${created.id}`, { replace: true });
      } else {
        await updateSiteTemplate(siteId, templateConfig, trimmedName);
        setSiteMeta({ id: siteId, name: trimmedName });
        setStatus({ type: 'success', message: 'Zmiany zapisane.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się zapisać zmian.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    setStatus({ type: 'info', message: 'Przygotowujemy proces publikacji. Wkrótce będzie dostępny.' });
  };

  const animationLabel = useMemo(() => {
    if (!animations.enabled) {
      return 'Animacje wyłączone';
    }
    const styles = {
      smooth: 'Płynne',
      fade: 'Zanikanie',
      slide: 'Przesunięcie'
    };
    return `Animacje: ${styles[animations.style] || 'Własne'}`;
  }, [animations]);

  const handleNameChange = (event) => {
    const { value } = event.target;
    setNameDraft(value);
    setSiteMeta({ id: siteId || null, name: value });
  };
  const pages = useMemo(() => Object.values(templateConfig.pages || {}), [templateConfig.pages]);

  return (
    <Stack spacing={2}>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 4,
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ xs: 'stretch', lg: 'center' }}>
            <Stack spacing={1} flex={1} minWidth={0}>
              <TextField
                label="Nazwa strony"
                value={nameDraft}
                onChange={handleNameChange}
                placeholder="Wpisz nazwę strony"
                size="small"
                inputProps={{ maxLength: 80 }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={mode === 'edit' ? 'Tryb edycji' : 'Podgląd'} color={mode === 'edit' ? 'secondary' : 'default'} />
                <Chip label={animationLabel} variant="outlined" />
                {isNewSite && <Chip label="Nowa strona" variant="outlined" color="secondary" />}
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
              <FormControlLabel
                control={<Switch color="secondary" checked={expertMode} onChange={(event) => setExpertMode(event.target.checked)} />}
                label="Tryb ekspercki"
              />
              <Button
                variant={mode === 'edit' ? 'outlined' : 'contained'}
                onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
                disabled={disabled}
              >
                {mode === 'edit' ? 'Podgląd' : 'Wróć do edycji'}
              </Button>
              <Button variant="outlined" onClick={handleSave} disabled={disabled || saving}>
                {siteId ? 'Zapisz zmiany' : 'Zapisz nową stronę'}
              </Button>
              <Button variant="contained" onClick={handlePublish} disabled={disabled || !siteId}>
                Opublikuj
              </Button>
              <Button
                variant="text"
                startIcon={<MoreVertIcon />}
                onClick={handleMenuOpen}
                disabled={disabled}
              >
                Więcej
              </Button>
            </Stack>
          </Stack>

          {pages.length > 0 && (
            <PageNavigation
              variant="inline"
            />
          )}
        </Stack>
      </Paper>

      {status && (
        <Alert severity={status.type} onClose={() => setStatus(null)}>
          {status.message}
        </Alert>
      )}

      <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            setAnimations({ enabled: !animations.enabled });
            handleMenuClose();
          }}
        >
          {animations.enabled ? 'Wyłącz animacje' : 'Włącz animacje'}
        </MenuItem>
        {animations.enabled && (
          <>
            <Divider />
            <MenuItem disabled>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Wybierz styl animacji
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnimations({ style: 'smooth' });
                handleMenuClose();
              }}
            >
              Płynne przejście
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnimations({ style: 'fade' });
                handleMenuClose();
              }}
            >
              Zanikanie
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnimations({ style: 'slide' });
                handleMenuClose();
              }}
            >
              Przesunięcie
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={handleExport}>Eksportuj konfigurację</MenuItem>
        <MenuItem onClick={handleImport}>Importuj z pliku</MenuItem>
      </Menu>
    </Stack>
  );
};

export default EditorToolbar;
