import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Switch,
  Divider,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import useTheme from '../../../theme/useTheme';
import { useAuth } from '../../../contexts/AuthContext';
import { updateUserPreferences } from '../../../services/authService';

const COOKIE_CONSENT_KEY = 'cookie_consent';

// Get consent from localStorage
const getLocalConsent = () => {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading cookie consent:', e);
  }
  return null;
};

// Save consent to localStorage
const saveLocalConsent = (consent) => {
  const existing = getLocalConsent();
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
    ...existing,
    ...consent,
    timestamp: new Date().toISOString()
  }));
};

const SettingsPage = () => {
  const theme = useTheme();
  const { user, updateUser } = useAuth();

  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;

  // Initialize consent settings from user preferences or localStorage
  const [consentSettings, setConsentSettings] = useState({
    functionalCookies: true, // Always required
    analyticsCookies: false,
    marketingCookies: false,
    marketingEmails: false
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    bookingNotifications: true,
    twoFactorAuth: false,
    autoSave: true,
    language: 'en',
    timezone: 'UTC',
    sessionTimeout: 30
  });

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Load consent settings from user preferences or localStorage
  useEffect(() => {
    // First check user preferences (backend)
    if (user?.preferences?.consent) {
      setConsentSettings(prev => ({
        ...prev,
        ...user.preferences.consent
      }));
    } else {
      // Fallback to localStorage
      const localConsent = getLocalConsent();
      if (localConsent) {
        setConsentSettings(prev => ({
          ...prev,
          analyticsCookies: localConsent.analytics || false,
          marketingCookies: localConsent.marketing || false,
          marketingEmails: localConsent.marketing || false
        }));
      }
    }
  }, [user]);

  const handleSettingChange = (setting) => (event) => {
    const value = event.target.checked !== undefined ? event.target.checked : event.target.value;
    setSettings((prev) => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleConsentChange = (setting) => async (event) => {
    const value = event.target.checked;
    
    // Functional cookies are always required
    if (setting === 'functionalCookies') return;

    const newConsentSettings = {
      ...consentSettings,
      [setting]: value
    };
    setConsentSettings(newConsentSettings);

    // Save to localStorage immediately
    saveLocalConsent({
      necessary: true,
      analytics: newConsentSettings.analyticsCookies,
      marketing: newConsentSettings.marketingCookies || newConsentSettings.marketingEmails
    });

    // Auto-save consent settings to backend
    try {
      setLoading(true);
      setSaveError(null);
      const updatedPreferences = {
        ...user.preferences,
        consent: newConsentSettings
      };
      const response = await updateUserPreferences(updatedPreferences);
      updateUser(response);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save consent settings:', err);
      setSaveError('Nie udało się zapisać ustawień zgód. Spróbuj ponownie.');
      // Revert on error
      setConsentSettings(prev => ({
        ...prev,
        [setting]: !value
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // TODO: Save settings to backend
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Account deletion logic here
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: surfaceColor,
        borderRadius: '16px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
        Ustawienia
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: theme.colors?.text?.secondary, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Zarządzaj preferencjami aplikacji
      </Typography>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
          Ustawienia zgód zostały zapisane.
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {saveError}
        </Alert>
      )}

      <Stack spacing={4}>
        {/* Consent Settings - RODO/GDPR */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Zgody i prywatność
          </Typography>
          <Typography variant="caption" sx={{ mb: 2, display: 'block', color: theme.colors?.text?.secondary }}>
            Zarządzaj zgodami na przetwarzanie danych zgodnie z RODO. Możesz w każdej chwili zmienić swoje preferencje.
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
                backgroundColor: alpha(theme.colors?.bg?.default || theme.palette.background.default, 0.5)
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Niezbędne cookies
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Wymagane do prawidłowego działania aplikacji (logowanie, bezpieczeństwo)
                </Typography>
              </Box>
              <Switch
                checked={true}
                disabled
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
                  Cookies analityczne
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pomagają nam zrozumieć jak korzystasz z aplikacji
                </Typography>
              </Box>
              <Switch
                checked={consentSettings.analyticsCookies}
                onChange={handleConsentChange('analyticsCookies')}
                disabled={loading}
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
                  Cookies marketingowe
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Służą do personalizacji reklam i treści
                </Typography>
              </Box>
              <Switch
                checked={consentSettings.marketingCookies}
                onChange={handleConsentChange('marketingCookies')}
                disabled={loading}
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
                  Emaile marketingowe
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Otrzymuj informacje o nowościach i promocjach
                </Typography>
              </Box>
              <Switch
                checked={consentSettings.marketingEmails}
                onChange={handleConsentChange('marketingEmails')}
                disabled={loading}
                color="primary"
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Notifications */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Powiadomienia
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
                  Powiadomienia email
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Otrzymuj aktualizacje przez email
                </Typography>
              </Box>
              <Switch
                checked={settings.emailNotifications}
                onChange={handleSettingChange('emailNotifications')}
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
                  Powiadomienia o rezerwacjach
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Otrzymuj powiadomienia o nowych rezerwacjach
                </Typography>
              </Box>
              <Switch
                checked={settings.bookingNotifications}
                onChange={handleSettingChange('bookingNotifications')}
                color="primary"
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Security */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Bezpieczeństwo
          </Typography>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: theme.colors?.bg?.default || theme.palette.background.default
              }}
            >
              <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                Limit czasu sesji
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Automatyczne wylogowanie po bezczynności (minuty)
              </Typography>
              <TextField
                type="number"
                value={settings.sessionTimeout}
                onChange={handleSettingChange('sessionTimeout')}
                size="small"
                sx={{ width: 120 }}
                inputProps={{ min: 5, max: 120 }}
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Editor Preferences */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Edytor
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
                  Automatyczne zapisywanie
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Automatycznie zapisuj zmiany podczas edycji
                </Typography>
              </Box>
              <Switch
                checked={settings.autoSave}
                onChange={handleSettingChange('autoSave')}
                color="primary"
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Alert severity="info" sx={{ borderRadius: '12px', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          <strong>Informacja:</strong> Ustawienia powiadomień i edytora zostaną w pełni zaimplementowane wkrótce.
        </Alert>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, pt: 2 }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={loading}
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
            Zapisz ustawienia
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default SettingsPage;
