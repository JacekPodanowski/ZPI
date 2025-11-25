import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Button,
  Box,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import useTheme from '../../theme/useTheme';
import getEditorColorTokens from '../../theme/editorColorTokens';
import useImageSearchStore from '../store/imageSearchStore';
import useNewEditorStore from '../store/newEditorStore';

/**
 * ImageSelectorModal - Focused Mode (1 image)
 * Shows images with pagination controls (< 1/10 >)
 * Real-time preview as user navigates
 */
const ImageSelectorModal = ({ open, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const siteId = useNewEditorStore((state) => state.siteId);

  const {
    searchResults,
    isLoading,
    error,
    quota,
    searchImages,
    checkQuota,
    resetSearch
  } = useImageSearchStore();

  useEffect(() => {
    if (open) {
      checkQuota(siteId);
      resetSearch();
      setCurrentIndex(0);
    }
  }, [open, siteId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      await searchImages(siteId, searchQuery.trim(), {
        mode: 'focused',
        page: 1
      });
      setCurrentIndex(0); // Reset to first image after new search
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleImageSelect = (image) => {
    if (onSelect) {
      onSelect({
        url: image.src.large,
        photographer: image.photographer,
        photographerUrl: image.photographer_url,
        source: 'pexels',
        pexelsId: image.id
      });
    }
    onClose();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < searchResults.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDialogKeyPress = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Enter' && searchResults[currentIndex]) {
      handleImageSelect(searchResults[currentIndex]);
    }
  };

  // Real-time preview - trigger onSelect but don't close
  useEffect(() => {
    if (searchResults.length > 0 && searchResults[currentIndex] && onSelect) {
      const image = searchResults[currentIndex];
      // Preview mode - just update, don't close
      onSelect({
        url: image.src.large,
        photographer: image.photographer,
        photographerUrl: image.photographer_url,
        source: 'pexels',
        pexelsId: image.id
      }, true); // Pass true to indicate preview mode
    }
  }, [currentIndex, searchResults]);

  const currentImage = searchResults[currentIndex];
  const isQuotaExceeded = quota.remaining === 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={handleDialogKeyPress}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          bgcolor: theme === 'dark' ? editorColors.background.paper : '#fff',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${editorColors.divider}`,
          color: editorColors.text.primary,
          pb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon sx={{ color: editorColors.interactive.main }} />
          <span style={{ fontWeight: 600 }}>Wybierz obraz</span>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: editorColors.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <InfoIcon sx={{ fontSize: 16 }} />
            {quota.remaining} / {quota.limit} wyszukań
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Wyszukaj obrazy (np. 'górski krajobraz', 'yoga studio')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            disabled={isQuotaExceeded}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
              }
            }}
          />
          <IconButton
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isLoading || isQuotaExceeded}
            sx={{
              bgcolor: editorColors.interactive.main,
              color: '#fff',
              '&:hover': {
                bgcolor: editorColors.interactive.dark
              },
              '&:disabled': {
                bgcolor: editorColors.divider
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        </Box>

        {/* Quota Exceeded Warning */}
        {isQuotaExceeded && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Osiągnąłeś dzienny limit wyszukiwań (50). Spróbuj jutro lub użyj już załadowanych obrazków.
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px'
            }}
          >
            <CircularProgress sx={{ color: editorColors.interactive.main }} />
          </Box>
        )}

        {/* No Results */}
        {!isLoading && searchResults.length === 0 && searchQuery && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: editorColors.text.secondary
            }}
          >
            <SearchIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Brak wyników
            </Typography>
            <Typography variant="body2">
              Spróbuj użyć innych słów kluczowych
            </Typography>
          </Box>
        )}

        {/* Results - Paginated Single Image View */}
        {!isLoading && searchResults.length > 0 && currentImage && (
          <Box>
            {/* Main Image Display */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '500px',
                borderRadius: '12px',
                overflow: 'hidden',
                mb: 2,
                boxShadow: `0 4px 24px ${editorColors.interactive.main}20`
              }}
            >
              <img
                src={currentImage.src.large}
                alt={currentImage.alt || 'Pexels image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)'
                }}
              />
              
              {/* Photographer Attribution */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  padding: '16px',
                  color: '#fff'
                }}
              >
                <Typography variant="caption">
                  Zdjęcie: {currentImage.photographer}
                </Typography>
              </Box>
            </Box>

            {/* Pagination Controls */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              <IconButton
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: editorColors.interactive.main,
                  color: '#fff',
                  '&:hover': {
                    bgcolor: editorColors.interactive.dark
                  },
                  '&:disabled': {
                    bgcolor: editorColors.divider,
                    color: editorColors.text.secondary
                  }
                }}
              >
                {'<'}
              </IconButton>

              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: editorColors.text.primary,
                    mb: 0.5
                  }}
                >
                  {currentIndex + 1} / {searchResults.length}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: editorColors.text.secondary
                  }}
                >
                  Użyj strzałek lub kliknij aby wybrać
                </Typography>
              </Box>

              <IconButton
                onClick={handleNext}
                disabled={currentIndex === searchResults.length - 1}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: editorColors.interactive.main,
                  color: '#fff',
                  '&:hover': {
                    bgcolor: editorColors.interactive.dark
                  },
                  '&:disabled': {
                    bgcolor: editorColors.divider,
                    color: editorColors.text.secondary
                  }
                }}
              >
                {'>'}
              </IconButton>
            </Box>

            {/* Select Button */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleImageSelect(currentImage)}
                sx={{
                  bgcolor: editorColors.interactive.main,
                  color: '#fff',
                  px: 4,
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  '&:hover': {
                    bgcolor: editorColors.interactive.dark
                  }
                }}
              >
                Wybierz ten obraz
              </Button>
            </Box>
          </Box>
        )}

        {/* Initial State */}
        {!isLoading && searchResults.length === 0 && !searchQuery && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: editorColors.text.secondary
            }}
          >
            <SearchIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Wyszukaj obrazy z Pexels
            </Typography>
            <Typography variant="body2">
              Wpisz frazy opisujące obraz, który chcesz znaleźć
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageSelectorModal;
