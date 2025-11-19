import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Switch,
  Divider,
  Alert,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import useTheme from '../../../theme/useTheme';

const ThemeCard = ({
  preset,
  isActive,
  onSelect,
  onDelete,
  colors,
  themeColors
}) => (
  <Paper
    role="button"
    elevation={0}
    onClick={() => onSelect(preset.id)}
    onKeyDown={(event) => event.key === 'Enter' && onSelect(preset.id)}
    tabIndex={0}
    sx={{
      padding: 3,
      height: '100%',
      borderRadius: '16px',
      position: 'relative',
      cursor: 'pointer',
      borderColor: isActive ? themeColors.interactive.default : themeColors.border.subtle,
      borderWidth: '1px',
      borderStyle: 'solid',
      backgroundColor: isActive ? themeColors.bg.elevated : themeColors.bg.surface,
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: themeColors.interactive.hover,
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 16px ${alpha(themeColors.interactive.default, 0.15)}`
      }
    }}
  >
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {preset.name}
        </Typography>
        {preset.isCustom && (
          <Chip
            label="Własny"
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              borderRadius: '12px'
            }}
          />
        )}
      </Stack>
      <Typography variant="body2" sx={{ color: themeColors.text.secondary }}>
        {preset.description}
      </Typography>
      <Stack direction="row" spacing={1}>
        {colors.map((swatch) => (
          <Box
            key={swatch.label}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: themeColors.border.subtle,
              backgroundColor: swatch.value
            }}
          />
        ))}
      </Stack>
      {isActive && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.interactive.default }}>
          <CheckIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Aktywny motyw
          </Typography>
        </Box>
      )}
    </Stack>
    {preset.isCustom && (
      <Tooltip title="Usuń motyw" placement="top">
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            borderRadius: '8px',
            backgroundColor: 'transparent'
          }}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(preset.id);
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
  </Paper>
);

const AppearancePage = () => {
  const theme = useTheme();
  const { 
    toggleMode, 
    mode,
    availableThemes,
    themeId,
    selectTheme,
    deleteCustomTheme,
    colors
  } = useTheme();

  const accentColor = colors?.interactive?.default || theme.palette.primary.main;
  const surfaceColor = colors?.bg?.surface || theme.palette.background.paper;

  const [settings, setSettings] = useState({
    animations: true,
    reducedMotion: false,
    compactMode: false
  });

  const handleSettingChange = (setting) => (event) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleSave = () => {
    // TODO: Save settings to backend
    console.log('Saving appearance settings:', { mode, ...settings });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: surfaceColor,
        borderRadius: '16px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: { xs: 2, sm: 3, md: 4 },
        transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
        Wygląd
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: theme.colors?.text?.secondary, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Dostosuj wygląd i działanie aplikacji
      </Typography>

      <Stack spacing={4}>
        {/* Theme Mode Selection - Simple Toggle */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Tryb motywu
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'fit-content' } }}>
            <Button
              variant={mode === 'light' ? 'contained' : 'outlined'}
              onClick={() => mode !== 'light' && toggleMode()}
              startIcon={<LightModeIcon />}
              fullWidth={{ xs: true, sm: false }}
              sx={{
                px: 3,
                py: 1,
                borderRadius: '10px',
                textTransform: 'none',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: 600,
                fontSize: '0.875rem',
                ...(mode === 'light' && {
                  backgroundColor: accentColor,
                  '&:hover': {
                    backgroundColor: alpha(accentColor, 0.9)
                  }
                })
              }}
            >
              Tryb jasny
            </Button>

            <Button
              variant={mode === 'dark' ? 'contained' : 'outlined'}
              onClick={() => mode !== 'dark' && toggleMode()}
              startIcon={<DarkModeIcon />}
              fullWidth={{ xs: true, sm: false }}
              sx={{
                px: 3,
                py: 1,
                borderRadius: '10px',
                textTransform: 'none',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: 600,
                fontSize: '0.875rem',
                ...(mode === 'dark' && {
                  backgroundColor: accentColor,
                  '&:hover': {
                    backgroundColor: alpha(accentColor, 0.9)
                  }
                })
              }}
            >
              Tryb ciemny
            </Button>
          </Stack>
        </Box>

        <Divider />

        {/* Theme Selection Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Wybierz motyw
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: colors?.text?.secondary }}>
            Select a base theme to customize the look and feel
          </Typography>
          <Grid container spacing={3}>
            {availableThemes.map((preset) => {
              const palette = mode === 'light' ? preset.light : preset.dark;
              const isActive = preset.id === themeId;
              const colorPreviews = [
                { label: 'primary', value: palette.primary },
                { label: 'secondary', value: palette.secondary },
                { label: 'background', value: palette.background },
                { label: 'text', value: palette.text }
              ];
              return (
                <Grid item xs={12} md={6} key={preset.id}>
                  <ThemeCard
                    preset={preset}
                    isActive={isActive}
                    onSelect={selectTheme}
                    onDelete={deleteCustomTheme}
                    colors={colorPreviews}
                    themeColors={colors}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Divider />

        {/* Display Settings */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Opcje wyświetlania
          </Typography>
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: theme.colors?.bg?.default || theme.palette.background.default
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Włącz animacje
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Płynne przejścia i efekty
                </Typography>
              </Box>
              <Switch
                checked={settings.animations}
                onChange={handleSettingChange('animations')}
                color="primary"
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: theme.colors?.bg?.default || theme.palette.background.default
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Ograniczone animacje
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Minimalizuj animacje dla dostępności
                </Typography>
              </Box>
              <Switch
                checked={settings.reducedMotion}
                onChange={handleSettingChange('reducedMotion')}
                color="primary"
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: theme.colors?.bg?.default || theme.palette.background.default
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Tryb kompaktowy
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Zmniejsz odstępy dla większej ilości treści
                </Typography>
              </Box>
              <Switch
                checked={settings.compactMode}
                onChange={handleSettingChange('compactMode')}
                color="primary"
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Alert severity="info" sx={{ borderRadius: '12px', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          <strong>TODO:</strong> Additional appearance settings and preferences will be added here.
        </Alert>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, pt: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            fullWidth={{ xs: true, sm: false }}
            sx={{
              borderRadius: '12px',
              px: 4,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              backgroundColor: accentColor,
              '&:hover': {
                backgroundColor: alpha(accentColor, 0.9)
              }
            }}
          >
            Zapisz preferencje
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default AppearancePage;
