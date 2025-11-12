import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import useTheme from '../../../theme/useTheme';
import { useAuth } from '../../../contexts/AuthContext';
import AvatarUploader from '../../../components/Navigation/AvatarUploader';

const ProfilePage = () => {
  const theme = useTheme();
  const { user, updatePreferences } = useAuth();

  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    bio: ''
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    // TODO: Implement API call to save profile data
    console.log('Saving profile:', formData);
  };

  const handleAvatarChange = async (newAvatarUrl) => {
    try {
      await updatePreferences({ avatar: newAvatarUrl });
      console.log('Avatar updated successfully');
    } catch (error) {
      console.error('Failed to update avatar:', error);
      alert('Failed to update avatar. Please try again.');
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
        Your Account
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: theme.colors?.text?.secondary, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Manage your personal information
      </Typography>

      <Alert severity="info" sx={{ mb: 3, borderRadius: '12px', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        <strong>TODO:</strong> API integration for saving profile data is not yet implemented.
      </Alert>

      <Stack spacing={4}>
        {/* Avatar Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Profile Picture
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user?.avatar_url}
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  border: `2px solid ${alpha(accentColor, 0.2)}`
                }}
              >
                {formData.firstName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <AvatarUploader
                currentAvatar={user?.avatar_url}
                onAvatarChange={handleAvatarChange}
                size={100}
              />
            </Box>
            <Typography variant="caption" sx={{ color: theme.colors?.text?.secondary, textAlign: { xs: 'center', sm: 'left' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Click on the avatar to upload a new photo
            </Typography>
          </Stack>
        </Box>

        <Divider />

        {/* Personal Information */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Personal Information
          </Typography>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                sx={{ borderRadius: '12px' }}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                sx={{ borderRadius: '12px' }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={handleChange('email')}
              type="email"
              sx={{ borderRadius: '12px' }}
            />

            <TextField
              fullWidth
              label="Bio"
              value={formData.bio}
              onChange={handleChange('bio')}
              multiline
              rows={4}
              placeholder="Tell us a bit about yourself..."
              sx={{ borderRadius: '12px' }}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Password Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Password
          </Typography>
          <Button variant="outlined" disabled sx={{ borderRadius: '12px' }}>
            Change Password (TODO)
          </Button>
        </Box>

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
            Save Changes
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ProfilePage;
