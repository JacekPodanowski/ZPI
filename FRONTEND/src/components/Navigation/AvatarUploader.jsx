import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import apiClient from '../../services/apiClient';
import { deleteMediaAsset } from '../../services/mediaService';

const AvatarUploader = ({ currentAvatar, onAvatarChange, size = 48, uploadEndpoint = null }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);

  // Function to resize image on client side
  const resizeImage = (file, maxWidth = 512, maxHeight = 512, quality = 0.9) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                reject(new Error('Failed to resize image'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Proszę wybrać plik graficzny.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('Plik jest za duży. Maksymalny rozmiar to 25MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Resize image before upload (512x512 max for avatars)
      const resizedFile = await resizeImage(file, 512, 512, 0.9);

      const formData = new FormData();
      formData.append('file', resizedFile);
      formData.append('usage', 'avatar');

      const response = await apiClient.post('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newAvatarUrl = response.data.url;
      
      // Update avatar in backend using custom endpoint or default user endpoint
      if (uploadEndpoint) {
        await apiClient.patch(uploadEndpoint, { avatar_url: newAvatarUrl });
      } else {
        await apiClient.patch('/users/me/', { avatar_url: newAvatarUrl });
      }
      
      // Delete old avatar if it exists
      if (currentAvatar) {
        void deleteMediaAsset(currentAvatar, { usage: 'avatar' });
      }

      onAvatarChange(newAvatarUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      if (error.message && error.message.includes('resize')) {
        alert('Nie udało się przetworzyć obrazu.');
      } else {
        alert('Nie udało się przesłać avatara.');
      }
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
  uploadEndpoint: PropTypes.string,
};

AvatarUploader.defaultProps = {
  currentAvatar: null,
  size: 48,
  uploadEndpoint: null,
};

export default AvatarUploader;
