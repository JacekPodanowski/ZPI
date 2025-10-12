import React from 'react';
import { Box, Button, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import useTheme from '../theme/useTheme';
import { themeDefinitions } from '../theme/themeDefinitions';

const ColorSwatch = ({ label, value, borderColor }) => (
  <Stack spacing={1} alignItems="flex-start">
    <Box
      sx={{
        width: '100%',
        height: 56,
        borderRadius: 2,
        backgroundColor: value,
        border: `1px solid ${borderColor}`
      }}
    />
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)' }}>
      {value}
    </Typography>
  </Stack>
);

const StylesPage = () => {
  const theme = useTheme();
  const { availableThemes, themeId, switchTheme, toggleMode, mode } = theme;

  return (
    <Box sx={{
      backgroundColor: theme.colors.bg.page,
      minHeight: '100vh',
      color: theme.colors.text.primary,
      py: { xs: 6, md: 10 },
      px: { xs: 2, md: 6 }
    }}>
      <Stack spacing={6} sx={{ maxWidth: 1240, mx: 'auto' }}>
        <Stack spacing={2}>
          <Chip
            label="Personalizacja"
            sx={{
              alignSelf: 'flex-start',
              backgroundColor: theme.colors.interactive.subtle,
              color: theme.colors.interactive.default,
              fontWeight: theme.typography.weights.semibold
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: theme.typography.weights.bold }}>
            Style YourEasySite
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 720, color: theme.colors.text.secondary }}>
            Przełączaj motywy, testuj tryb jasny i ciemny oraz zobacz jak semantyczne kolory wpływają na komponenty aplikacji.
            Wszystkie wartości pochodzą z generatora kolorów opartego na chroma-js.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={toggleMode}
              sx={{
                backgroundColor: theme.colors.interactive.default,
                color: theme.colors.text.inverse,
                '&:hover': {
                  backgroundColor: theme.colors.interactive.hover
                }
              }}
            >
              {mode === 'light' ? '🌙 Włącz tryb ciemny' : '☀️ Włącz tryb jasny'}
            </Button>
          </Stack>
        </Stack>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: `1px solid ${theme.colors.border.default}` }}>
          <Typography variant="subtitle2" sx={{ color: theme.colors.text.secondary, mb: 2 }}>
            Wybierz motyw
          </Typography>
          <Grid container spacing={3}>
            {availableThemes.map((preset) => {
              const isActive = preset.id === themeId;
              return (
                <Grid item xs={12} md={6} key={preset.id}>
                  <Paper
                    role="button"
                    elevation={0}
                    onClick={() => switchTheme(preset.id)}
                    onKeyDown={(event) => event.key === 'Enter' && switchTheme(preset.id)}
                    tabIndex={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 3,
                      cursor: 'pointer',
                      border: `2px solid ${isActive ? theme.colors.interactive.default : theme.colors.border.subtle}`,
                      backgroundColor: isActive ? theme.colors.bg.elevated : theme.colors.bg.surface,
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: theme.colors.interactive.hover
                      }
                    }}
                  >
                    <Stack spacing={2}>
                      <Typography variant="h6" sx={{ fontWeight: theme.typography.weights.semibold }}>
                        {preset.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
                        {preset.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: themeDefinitions[preset.id][mode].primary }} />
                        <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: themeDefinitions[preset.id][mode].secondary }} />
                        <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: themeDefinitions[preset.id][mode].background }} />
                        <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: themeDefinitions[preset.id][mode].text }} />
                      </Stack>
                      {isActive && (
                        <Typography variant="caption" sx={{ color: theme.colors.interactive.default }}>
                          Aktywny motyw
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: `1px solid ${theme.colors.border.default}` }}>
              <Typography variant="subtitle2" sx={{ color: theme.colors.text.secondary, mb: 2 }}>
                Semantyczne tokeny kolorów
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ColorSwatch label="bg.page" value={theme.colors.bg.page} borderColor={theme.colors.border.subtle} />
                </Grid>
                <Grid item xs={6}>
                  <ColorSwatch label="bg.surface" value={theme.colors.bg.surface} borderColor={theme.colors.border.subtle} />
                </Grid>
                <Grid item xs={6}>
                  <ColorSwatch label="interactive.default" value={theme.colors.interactive.default} borderColor={theme.colors.border.subtle} />
                </Grid>
                <Grid item xs={6}>
                  <ColorSwatch label="interactive.hover" value={theme.colors.interactive.hover} borderColor={theme.colors.border.subtle} />
                </Grid>
                <Grid item xs={6}>
                  <ColorSwatch label="calendar.event" value={theme.colors.calendar.event} borderColor={theme.colors.border.subtle} />
                </Grid>
                <Grid item xs={6}>
                  <ColorSwatch label="calendar.availability" value={theme.colors.calendar.availability} borderColor={theme.colors.border.subtle} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>


        </Stack>
    </Box>
  );
};

export default StylesPage;
