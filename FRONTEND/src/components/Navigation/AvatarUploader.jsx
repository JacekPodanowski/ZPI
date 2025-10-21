import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import apiClient from '../../services/apiClient';
import { deleteMediaAsset } from '../../services/mediaService';

const AvatarUploader = ({ currentAvatar, onAvatarChange, size = 48 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Proszę wybrać plik graficzny.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Plik jest za duży. Maksymalny rozmiar to 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('usage', 'avatar');

    setIsUploading(true);

    try {
      const response = await apiClient.post('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newAvatarUrl = response.data.url;
      
      // Update user avatar in backend
      await apiClient.patch('/users/me/', { avatar: newAvatarUrl });
      
      // Delete old avatar if it exists
      if (currentAvatar) {
        void deleteMediaAsset(currentAvatar, { usage: 'avatar' });
      }

      onAvatarChange(newAvatarUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Nie udało się przesłać avatara.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        cursor: isUploading ? 'wait' : 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Hover Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          backgroundColor: alpha('#000', 0.6),
          opacity: (isHovered || isUploading) ? 1 : 0,
          transition: 'opacity 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        {isUploading ? (
          <CircularProgress size={20} sx={{ color: '#fff' }} />
        ) : (
          <Typography
            variant="caption"
            sx={{
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.7rem',
              textAlign: 'center',
              px: 1,
            }}
          >
            Prześlij
          </Typography>
        )}
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
    </Box>
  );
};

AvatarUploader.propTypes = {
  currentAvatar: PropTypes.string,
  onAvatarChange: PropTypes.func.isRequired,
  size: PropTypes.number,
};

AvatarUploader.defaultProps = {
  currentAvatar: null,
  size: 48,
};

export default AvatarUploader;
