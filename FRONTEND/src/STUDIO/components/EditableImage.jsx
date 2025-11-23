import React, { useState, useCallback } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, TextField, Button, IconButton } from '@mui/material';
import { Close as CloseIcon, Upload as UploadIcon, Link as LinkIcon } from '@mui/icons-material';
import useTheme from '../../theme/useTheme';
import getEditorColorTokens from '../../theme/editorColorTokens';
import { resolveMediaUrl } from '../../config/api';
import { uploadMedia } from '../../services/mediaService';
import useNewEditorStore from '../store/newEditorStore';

/**
 * EditableImage - Komponent umożliwiający edycję obrazu inline w edytorze
 * 
 * Po kliknięciu w obrazek pojawia się modal, gdzie można:
 * - Wkleić link do obrazu
 * - Przeciągnąć plik obrazu (drag & drop)
 * - Wybrać plik z dysku
 */
const EditableImage = ({ 
  value,
  onSave,
  className = '',
  style = {},
  alt = '',
  isModuleSelected = false,
  ...otherProps 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const siteId = useNewEditorStore((state) => state.siteId);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setLinkValue('');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setLinkValue('');
    setIsDragging(false);
  };

  const handleSaveLink = () => {
    if (linkValue.trim()) {
      onSave(linkValue.trim());
      handleClose();
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Proszę wybrać plik obrazu');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadMedia(file, {
        usage: 'site_content',
        siteId: siteId
      });
      const uploadedUrl = response?.url || response?.file_url || response;
      if (uploadedUrl) {
        onSave(uploadedUrl);
        handleClose();
      } else {
        alert('Nie otrzymano URL-a przesłanego obrazu');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Błąd podczas przesyłania obrazu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const resolvedImageUrl = resolveMediaUrl(value);

  return (
    <>
      <Box
        component="img"
        src={resolvedImageUrl || 'https://via.placeholder.com/400x300?text=Click+to+edit'}
        alt={alt}
        className={className}
        style={{
          ...style,
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={handleClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.outline = `3px dashed ${editorColors.interactive.main}`;
          e.currentTarget.style.outlineOffset = '4px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.outline = 'none';
          e.currentTarget.style.outlineOffset = '0px';
        }}
        {...otherProps}
      />

      <Dialog 
        open={isOpen} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            bgcolor: theme === 'dark' ? editorColors.background.paper : '#fff'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${editorColors.divider}`,
          color: editorColors.text.primary
        }}>
          Edytuj obrazek
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {/* Link input */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LinkIcon sx={{ color: editorColors.text.secondary }} />
              <span style={{ color: editorColors.text.primary, fontWeight: 500 }}>
                Wklej link do obrazu
              </span>
            </Box>
            <TextField
              fullWidth
              placeholder="https://example.com/image.jpg"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveLink();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }
              }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSaveLink}
              disabled={!linkValue.trim()}
              sx={{ 
                mt: 1.5,
                bgcolor: editorColors.interactive.main,
                '&:hover': {
                  bgcolor: editorColors.interactive.dark
                },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Zapisz link
            </Button>
          </Box>

          {/* Divider */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            my: 3,
            color: editorColors.text.secondary 
          }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: editorColors.divider }} />
            <span style={{ fontSize: '0.875rem' }}>LUB</span>
            <Box sx={{ flex: 1, height: '1px', bgcolor: editorColors.divider }} />
          </Box>

          {/* Drag & drop area */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <UploadIcon sx={{ color: editorColors.text.secondary }} />
              <span style={{ color: editorColors.text.primary, fontWeight: 500 }}>
                Prześlij obraz
              </span>
            </Box>
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: `2px dashed ${isDragging ? editorColors.interactive.main : editorColors.divider}`,
                borderRadius: '12px',
                padding: '32px 16px',
                textAlign: 'center',
                bgcolor: isDragging 
                  ? `${editorColors.interactive.main}10` 
                  : (theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: editorColors.interactive.main,
                  bgcolor: `${editorColors.interactive.main}05`
                }
              }}
              onClick={() => document.getElementById('image-file-input').click()}
            >
              <input
                id="image-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              {isUploading ? (
                <Box sx={{ color: editorColors.text.secondary }}>
                  <Box className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full mb-2" />
                  <div>Przesyłanie...</div>
                </Box>
              ) : (
                <>
                  <UploadIcon sx={{ 
                    fontSize: 48, 
                    color: editorColors.text.secondary,
                    mb: 1
                  }} />
                  <div style={{ 
                    color: editorColors.text.primary,
                    fontSize: '1rem',
                    fontWeight: 500,
                    marginBottom: '4px'
                  }}>
                    Przeciągnij obraz tutaj
                  </div>
                  <div style={{ 
                    color: editorColors.text.secondary,
                    fontSize: '0.875rem'
                  }}>
                    lub kliknij aby wybrać plik
                  </div>
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableImage;
