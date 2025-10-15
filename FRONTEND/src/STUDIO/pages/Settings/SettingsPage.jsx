import React, { useState } from 'react';
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
  TextField
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import useTheme from '../../../theme/useTheme';

const SettingsPage = () => {
  const theme = useTheme();

  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;

  const [settings, setSettings] = useState({
    emailNotifications: true,
    bookingNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
    autoSave: true,
    language: 'en',
    timezone: 'UTC',
    sessionTimeout: 30
  });

  const handleSettingChange = (setting) => (event) => {
    const value = event.target.checked !== undefined ? event.target.checked : event.target.value;
    setSettings((prev) => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    // TODO: Save settings to backend
    console.log('Saving settings:', settings);
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion requested');
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: surfaceColor,
        borderRadius: '16px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: 4
      }}
    >
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Settings
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: theme.colors?.text?.secondary }}>
        Manage your application preferences
      </Typography>

      <Stack spacing={4}>
        {/* Notifications */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Notifications
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
                  Email Notifications
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Receive updates via email
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
                  Booking Notifications
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Get notified about new bookings
                </Typography>
              </Box>
              <Switch
                checked={settings.bookingNotifications}
                onChange={handleSettingChange('bookingNotifications')}
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
                  Marketing Emails
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Receive news and promotions
                </Typography>
              </Box>
              <Switch
                checked={settings.marketingEmails}
                onChange={handleSettingChange('marketingEmails')}
                color="primary"
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Security */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Security
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
                  Two-Factor Authentication
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add an extra layer of security (TODO)
                </Typography>
              </Box>
              <Switch
                checked={settings.twoFactorAuth}
                onChange={handleSettingChange('twoFactorAuth')}
                color="primary"
                disabled
              />
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: theme.colors?.bg?.default || theme.palette.background.default
              }}
            >
              <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                Session Timeout
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Auto logout after inactivity (minutes)
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
            Editor
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
                  Auto-Save
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Automatically save changes while editing
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

        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          <strong>TODO:</strong> Settings to be implemented.
        </Alert>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              borderRadius: '12px',
              px: 4,
              backgroundColor: accentColor,
              '&:hover': {
                backgroundColor: alpha(accentColor, 0.9)
              }
            }}
          >
            Save Settings
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default SettingsPage;
