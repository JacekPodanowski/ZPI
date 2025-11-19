import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import useTheme from '../../../theme/useTheme';
import { useAuth } from '../../../contexts/AuthContext';
import AvatarUploader from '../../../components/Navigation/AvatarUploader';
import Avatar from '../../../components/Avatar/Avatar';
import { updateUserProfile } from '../../../services/authService';
import { resolveMediaUrl } from '../../../config/api';
import apiClient from '../../../services/apiClient';

const ProfilePage = () => {
  const theme = useTheme();
  const { user, updateUser } = useAuth();

  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    bio: user?.bio || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // Update formData when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        bio: formData.bio
      };

      const response = await updateUserProfile(updatedData);
      updateUser(response);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (newAvatarUrl) => {
    // Avatar is already updated in backend by AvatarUploader
    // Just update local state immediately for instant UI refresh
    updateUser({ avatar_url: newAvatarUrl });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setError(null);
    setPasswordResetSuccess(false);
    
    try {
      await apiClient.post('/auth/password-reset/request/');
      setPasswordResetSuccess(true);
      setTimeout(() => setPasswordResetSuccess(false), 5000);
    } catch (err) {
      setError('Nie udało się wysłać linku do zmiany hasła. Spróbuj ponownie.');
      console.error('Password reset request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = 
    formData.firstName !== (user?.first_name || '') ||
    formData.lastName !== (user?.last_name || '') ||
    formData.bio !== (user?.bio || '');

  const avatarUrl = user?.avatar_url ? resolveMediaUrl(user.avatar_url) : null;

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
        Twoje Konto
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: theme.colors?.text?.secondary, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Zarządzaj swoimi danymi osobowymi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontSize: { xs: '0.875rem', sm: '1rem' } }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', fontSize: { xs: '0.875rem', sm: '1rem' } }} onClose={() => setSuccess(false)}>
          Profil zaktualizowany pomyślnie!
        </Alert>
      )}

      {passwordResetSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', fontSize: { xs: '0.875rem', sm: '1rem' } }} onClose={() => setPasswordResetSuccess(false)}>
          Link do zmiany hasła został wysłany na Twój e-mail. Sprawdź skrzynkę odbiorczą.
        </Alert>
      )}

      <Stack spacing={4}>
        {/* Avatar Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Zdjęcie Profilowe
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                key={avatarUrl || 'default'} // Force re-render when avatar changes
                avatarUrl={avatarUrl}
                user={user}
                size={100}
                sx={{
                  border: `2px solid ${alpha(accentColor, 0.2)}`
                }}
              />
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <AvatarUploader
                  currentAvatar={user?.avatar_url}
                  onAvatarChange={handleAvatarChange}
                  size={100}
                />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: theme.colors?.text?.secondary, textAlign: { xs: 'center', sm: 'left' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Kliknij na awatar, aby przesłać nowe zdjęcie
            </Typography>
          </Stack>
        </Box>

        <Divider />

        {/* Personal Information */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Dane Osobowe
          </Typography>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Imię"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                sx={{ borderRadius: '12px' }}
              />
              <TextField
                fullWidth
                label="Nazwisko"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                sx={{ borderRadius: '12px' }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              disabled
              type="email"
              helperText="Email nie może być zmieniony"
              sx={{ 
                borderRadius: '12px',
                '& .Mui-disabled': {
                  WebkitTextFillColor: theme.colors?.text?.primary,
                  color: theme.colors?.text?.primary
                }
              }}
            />

            <TextField
              fullWidth
              label="Bio"
              value={formData.bio}
              onChange={handleChange('bio')}
              multiline
              rows={4}
              placeholder="Powiedz nam coś o sobie..."
              sx={{ borderRadius: '12px' }}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Password Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Hasło
          </Typography>
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: theme.colors?.text?.secondary, fontSize: '0.9rem' }}>
              Zmień hasło do swojego konta w bezpieczny sposób.
            </Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={handlePasswordReset}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  borderColor: accentColor,
                  color: accentColor,
                  '&:hover': {
                    borderColor: accentColor,
                    backgroundColor: alpha(accentColor, 0.08)
                  }
                }}
              >
                Zmień hasło
              </Button>
            </Box>
          </Stack>
        </Box>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, pt: 2 }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={loading || !hasChanges}
            fullWidth={{ xs: true, sm: false }}
            sx={{
              borderRadius: '12px',
              px: 4,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              backgroundColor: accentColor,
              '&:hover': {
                backgroundColor: alpha(accentColor, 0.9)
              },
              '&:disabled': {
                backgroundColor: alpha(accentColor, 0.3)
              }
            }}
          >
            {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ProfilePage;
