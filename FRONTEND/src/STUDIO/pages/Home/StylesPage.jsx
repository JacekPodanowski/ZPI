import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Paper,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import useTheme from '../../../theme/useTheme';
import Navigation from '../../../components/Navigation/Navigation';
import ColorPicker from '../../../components/ColorPicker';

const spacingVar = (step) => `calc(var(--spacing-${step}) * var(--density-multiplier, 1))`;
const radiusVar = (token) => `var(--radius-${token})`;
const shadowVar = (token) => `var(--shadow-${token})`;
const borderVar = (token) => `var(--border-${token})`;
const fontWeightVar = (token) => `var(--font-weight-${token})`;

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
      padding: spacingVar(6),
      height: '100%',
      borderRadius: radiusVar('rounded'),
      position: 'relative',
      cursor: 'pointer',
      borderColor: isActive ? themeColors.interactive.default : themeColors.border.subtle,
      borderWidth: borderVar('hairline'),
      borderStyle: 'solid',
      backgroundColor: isActive ? themeColors.bg.elevated : themeColors.bg.surface,
      boxShadow: isActive ? shadowVar('floating') : shadowVar('none'),
      transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        borderColor: themeColors.interactive.hover,
        boxShadow: shadowVar('lifted'),
        transform: 'translateY(-0.125rem)'
      }
    }}
  >
    <Stack spacing={0} sx={{ gap: spacingVar(4) }}>
      <Stack direction="row" spacing={0} alignItems="center" justifyContent="space-between" sx={{ gap: spacingVar(2) }}>
        <Typography variant="h6" sx={{ fontWeight: fontWeightVar('semibold') }}>
          {preset.name}
        </Typography>
        {preset.isCustom && (
          <Chip
            label="Custom"
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: fontWeightVar('semibold'),
              borderRadius: radiusVar('pill'),
              px: spacingVar(2)
            }}
          />
        )}
      </Stack>
      <Typography variant="body2" sx={{ color: themeColors.text.secondary }}>
        {preset.description}
      </Typography>
      <Stack direction="row" spacing={0} sx={{ gap: spacingVar(2) }}>
        {colors.map((swatch) => (
          <Box
            key={swatch.label}
            sx={{
              width: spacingVar(10),
              height: spacingVar(10),
              borderRadius: radiusVar('soft'),
              borderWidth: borderVar('hairline'),
              borderStyle: 'solid',
              borderColor: themeColors.border.subtle,
              backgroundColor: swatch.value
            }}
          />
        ))}
      </Stack>
      {isActive && (
        <Typography variant="caption" sx={{ color: themeColors.interactive.default, fontWeight: fontWeightVar('medium') }}>
          Aktywny motyw
        </Typography>
      )}
    </Stack>
    {preset.isCustom && (
      <Tooltip title="Usuń motyw" placement="top">
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: spacingVar(3),
            right: spacingVar(3),
            borderRadius: radiusVar('pill'),
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

const OptionPreview = ({ label, onClick, isActive, preview }) => (
  <Button
    variant={isActive ? 'contained' : 'outlined'}
    onClick={onClick}
    sx={{
      minWidth: 'calc(var(--spacing-16) * 1.25)',
      borderRadius: radiusVar('soft'),
      textTransform: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacingVar(2),
      borderWidth: borderVar('hairline'),
      borderStyle: 'solid'
    }}
  >
    {preview}
    <Typography variant="caption" sx={{ fontWeight: fontWeightVar('semibold') }}>
      {label}
    </Typography>
  </Button>
);

const StylesPage = () => {
  const {
    colors,
    mode,
    toggleMode,
    availableThemes,
    themeId,
    selectTheme,
    deleteCustomTheme,
    updateWorkingTheme,
    workingTheme,
    hasUnsavedChanges,
    saveCustomTheme
  } = useTheme();

  const [newThemeName, setNewThemeName] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [colorsOpen, setColorsOpen] = useState(false);

  const roundnessOptions = useMemo(() => ([
    { label: 'None', value: 'none' },
    { label: 'Subtle', value: 'subtle' },
    { label: 'Soft', value: 'soft' },
    { label: 'Rounded', value: 'rounded' },
    { label: 'Pill', value: 'pill' }
  ]), []);

  const shadowOptions = useMemo(() => ([
    { label: 'None', value: 'none' },
    { label: 'Lifted', value: 'lifted' },
    { label: 'Floating', value: 'floating' },
    { label: 'Elevated', value: 'elevated' }
  ]), []);

  const borderOptions = useMemo(() => ([
    { label: 'None', value: 'none' },
    { label: 'Hairline', value: 'hairline' },
    { label: 'Standard', value: 'standard' },
    { label: 'Bold', value: 'bold' }
  ]), []);

  const handleSaveTheme = () => {
    const result = saveCustomTheme(newThemeName);
    if (result.success) {
      setFeedback({ type: 'success', message: 'Motyw zapisany. Możesz go ponownie wczytać z listy powyżej.' });
      setNewThemeName('');
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
  };

  return (
    <>
      <Navigation />
      <Box
        sx={{
          backgroundColor: colors.bg.page,
          minHeight: '100vh',
          color: colors.text.primary,
          py: { xs: spacingVar(6), md: spacingVar(12) },
          px: { xs: spacingVar(4), md: spacingVar(12) }
        }}
      >
        <Stack spacing={0} sx={{ maxWidth: 1240, mx: 'auto', gap: spacingVar(12) }}>
          <Stack spacing={0} sx={{ gap: spacingVar(4) }}>
            <Chip
              label="Personalizacja"
              sx={{
                alignSelf: 'flex-start',
                backgroundColor: colors.interactive.subtle,
                color: colors.interactive.default,
                fontWeight: fontWeightVar('semibold'),
                borderRadius: radiusVar('pill'),
                px: spacingVar(3),
                py: spacingVar(1)
              }}
            />
            <Typography variant="h3" sx={{ fontWeight: fontWeightVar('bold') }}>
              STYL
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 1000, color: colors.text.secondary }}>
              Według nas każdy powinien mieć możliwość kreatywnego wyrażenia siebie poprzez dostosowanie wyglądu.
            </Typography>
            <Stack direction="row" spacing={0} sx={{ gap: spacingVar(3) }}>
              <Button
                variant="contained"
                onClick={toggleMode}
                sx={{
                  backgroundColor: colors.interactive.default,
                  color: colors.text.inverse,
                  borderRadius: radiusVar('pill'),
                  px: spacingVar(4),
                  py: spacingVar(2),
                  '&:hover': {
                    backgroundColor: colors.interactive.hover
                  }
                }}
              >
                {mode === 'light' ? '🌙 Włącz tryb ciemny' : '☀️ Włącz tryb jasny'}
              </Button>
            </Stack>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: { xs: spacingVar(6), md: spacingVar(8) },
              borderRadius: radiusVar('rounded'),
              borderWidth: borderVar('hairline'),
              borderStyle: 'solid',
              borderColor: colors.border.default,
              backgroundColor: colors.bg.surface,
              boxShadow: shadowVar('none')
            }}
          >
            <Stack spacing={0} sx={{ gap: spacingVar(6) }}>
              <Typography variant="subtitle2" sx={{ color: colors.text.secondary }}>
                Wybierz motyw bazowy
              </Typography>
              <Grid
                container
                spacing={0}
                sx={{
                  rowGap: spacingVar(6),
                  columnGap: spacingVar(6)
                }}
              >
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
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: spacingVar(6), md: spacingVar(8) },
              borderRadius: radiusVar('rounded'),
              borderWidth: borderVar('hairline'),
              borderStyle: 'solid',
              borderColor: colors.border.default,
              backgroundColor: colors.bg.surface
            }}
          >
            <Stack spacing={0} sx={{ gap: spacingVar(6) }}>
              <Typography variant="subtitle2" sx={{ color: colors.text.secondary }}>
                Dostosuj parametry globalne
              </Typography>

              <Stack spacing={0} sx={{ gap: spacingVar(3) }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: fontWeightVar('semibold'), textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Roundness
                </Typography>
                <Stack
                  direction="row"
                  spacing={0}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ columnGap: spacingVar(3), rowGap: spacingVar(3) }}
                >
                  {roundnessOptions.map((option) => (
                    <OptionPreview
                      key={option.value}
                      label={option.label}
                      isActive={workingTheme.roundness === option.value}
                      onClick={() => updateWorkingTheme('roundness', option.value)}
                      preview={(
                        <Box
                          sx={{
                            width: spacingVar(13),
                            height: spacingVar(9),
                            borderRadius: workingTheme.radii?.[option.value] || option.value,
                            borderWidth: borderVar('hairline'),
                            borderStyle: 'solid',
                            borderColor: colors.border.subtle,
                            backgroundColor: colors.bg.surface
                          }}
                        />
                      )}
                    />
                  ))}
                </Stack>
              </Stack>

              <Divider sx={{ borderColor: colors.border.subtle }} />

              <Stack spacing={0} direction={{ xs: 'column', md: 'row' }} sx={{ gap: spacingVar(6) }}>
                <Stack spacing={0} sx={{ flex: 1, gap: spacingVar(3) }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: fontWeightVar('semibold'), textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    Gęstość / spacing
                  </Typography>
                  <Slider
                    value={workingTheme.density}
                    onChange={(_, value) => updateWorkingTheme('density', Array.isArray(value) ? value[0] : value)}
                    min={0.75}
                    max={1.5}
                    step={0.05}
                    marks={[
                      { value: 0.75, label: 'Compact' },
                      { value: 1, label: 'Balanced' },
                      { value: 1.5, label: 'Spacious' }
                    ]}
                  />
                </Stack>
                <Stack spacing={0} sx={{ flex: 1, gap: spacingVar(3) }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: fontWeightVar('semibold'), textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    Font scale
                  </Typography>
                  <Slider
                    value={workingTheme.fontScale}
                    onChange={(_, value) => updateWorkingTheme('fontScale', Array.isArray(value) ? value[0] : value)}
                    min={0.75}
                    max={1.25}
                    step={0.05}
                    marks={[
                      { value: 0.75, label: '-25%' },
                      { value: 1, label: 'Standard' },
                      { value: 1.25, label: '+25%' }
                    ]}
                  />
                </Stack>
              </Stack>

              <Divider sx={{ borderColor: colors.border.subtle }} />

              <Stack spacing={0} sx={{ gap: spacingVar(3) }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: fontWeightVar('semibold'), textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Shadows
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  color="primary"
                  value={workingTheme.shadowPreset}
                  onChange={(_, value) => value && updateWorkingTheme('shadows', value)}
                  sx={{ flexWrap: 'wrap', gap: spacingVar(2) }}
                >
                  {shadowOptions.map((option) => (
                    <ToggleButton
                      key={option.value}
                      value={option.value}
                      sx={{
                        textTransform: 'none',
                        px: spacingVar(3),
                        borderRadius: radiusVar('pill')
                      }}
                    >
                      {option.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>

              <Stack spacing={0} sx={{ gap: spacingVar(3) }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: fontWeightVar('semibold'), textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Border widths
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  color="primary"
                  value={workingTheme.borderWidthPreset}
                  onChange={(_, value) => value && updateWorkingTheme('borderWidths', value)}
                  sx={{ flexWrap: 'wrap', gap: spacingVar(2) }}
                >
                  {borderOptions.map((option) => (
                    <ToggleButton
                      key={option.value}
                      value={option.value}
                      sx={{
                        textTransform: 'none',
                        px: spacingVar(3),
                        borderRadius: radiusVar('pill')
                      }}
                    >
                      {option.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: spacingVar(6), md: spacingVar(8) },
              borderRadius: radiusVar('rounded'),
              borderWidth: borderVar('hairline'),
              borderStyle: 'solid',
              borderColor: colors.border.default,
              backgroundColor: colors.bg.surface
            }}
          >
            <Stack spacing={0} sx={{ gap: spacingVar(4) }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0} sx={{ gap: spacingVar(3) }}>
                <Typography variant="subtitle2" sx={{ color: colors.text.secondary }}>
                  Interaktywne kolory
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  endIcon={colorsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setColorsOpen((prev) => !prev)}
                  sx={{ textTransform: 'none', fontWeight: fontWeightVar('semibold') }}
                >
                  {colorsOpen ? 'Ukryj edytor' : 'Pokaż edytor'}
                </Button>
              </Stack>

              <Collapse in={colorsOpen} timeout="auto" unmountOnExit>
                <Stack spacing={0} sx={{ gap: spacingVar(6), mt: spacingVar(2) }}>
                  <ColorPicker
                    label="Primary color"
                    value={workingTheme.primaryColor || workingTheme.colors.interactive.default}
                    onChange={(value) => updateWorkingTheme('primaryColor', value)}
                  />
                  <ColorPicker
                    label="Secondary color"
                    value={workingTheme.secondaryColor || workingTheme.colors.interactive.alternative}
                    onChange={(value) => updateWorkingTheme('secondaryColor', value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      updateWorkingTheme('primaryColor', null);
                      updateWorkingTheme('secondaryColor', null);
                    }}
                    sx={{
                      alignSelf: { xs: 'stretch', sm: 'flex-start' },
                      borderRadius: radiusVar('pill'),
                      borderWidth: borderVar('hairline'),
                      borderStyle: 'solid'
                    }}
                  >
                    Resetuj kolory
                  </Button>
                </Stack>
              </Collapse>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: spacingVar(6), md: spacingVar(8) },
              borderRadius: radiusVar('rounded'),
              borderWidth: borderVar('hairline'),
              borderStyle: 'solid',
              borderColor: colors.border.default,
              backgroundColor: colors.bg.surface
            }}
          >
            <Stack spacing={0} sx={{ gap: spacingVar(6) }}>
              <Typography variant="subtitle2" sx={{ color: colors.text.secondary }}>
                Zapisz motyw jako własny
              </Typography>

              {hasUnsavedChanges && (
                <Alert severity="info">
                  Masz niezapisane zmiany. Zapisz je jako nowy motyw, aby móc skorzystać z nich ponownie.
                </Alert>
              )}

              {feedback && (
                <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
                  {feedback.message}
                </Alert>
              )}

              <Stack spacing={0} direction={{ xs: 'column', md: 'row' }} sx={{ gap: spacingVar(3) }}>
                <TextField
                  label="Nazwa nowego motywu"
                  value={newThemeName}
                  onChange={(event) => setNewThemeName(event.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleSaveTheme}
                  disabled={!newThemeName.trim()}
                  sx={{
                    minWidth: 'calc(var(--spacing-16) * 3.5)',
                    backgroundColor: colors.interactive.default,
                    borderRadius: radiusVar('pill'),
                    px: spacingVar(4),
                    py: spacingVar(2),
                    '&:hover': {
                      backgroundColor: colors.interactive.hover
                    }
                  }}
                >
                  Zapisz custom theme
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </>
  );
};

export default StylesPage;
