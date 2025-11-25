import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import useTheme from '../../theme/useTheme';
import getEditorColorTokens from '../../theme/editorColorTokens';
import useImageSearchStore from '../store/imageSearchStore';
import useNewEditorStore from '../store/newEditorStore';

/**
 * ImageLibraryPanel - Bulk Mode (2+ images)
 * Side panel with 100 images, infinite scroll, filters
 */
const ImageLibraryPanel = ({ onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const scrollRef = useRef(null);
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const siteId = useNewEditorStore((state) => state.siteId);

  const {
    searchResults,
    isLoading,
    error,
    quota,
    selectedImages,
    orientation,
    color,
    hasMore,
    isPanelOpen,
    searchImages,
    loadNextPage,
    checkQuota,
    setOrientation,
    setColor,
    resetSearch
  } = useImageSearchStore();

  useEffect(() => {
    if (isPanelOpen) {
      checkQuota(siteId);
    }
  }, [isPanelOpen, siteId]);

  // Debounced search
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    if (searchQuery.trim()) {
      const timeout = setTimeout(() => {
        handleSearch(searchQuery.trim());
      }, 500);
      setSearchDebounce(timeout);
    }

    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
    };
  }, [searchQuery]);

  const handleSearch = async (query) => {
    if (!query) return;

    try {
      await searchImages(siteId, query, {
        mode: 'bulk',
        page: 1,
        orientation,
        color
      });
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8) {
      loadNextPage(siteId);
    }
  }, [isLoading, hasMore, siteId, loadNextPage]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleImageClick = (image) => {
    if (onSelect) {
      onSelect({
        url: image.src.large,
        photographer: image.photographer,
        photographerUrl: image.photographer_url,
        source: 'pexels',
        pexelsId: image.id
      });
    }
  };

  const handleFilterChange = async (filterType, value) => {
    if (filterType === 'orientation') {
      setOrientation(value);
    } else if (filterType === 'color') {
      setColor(value);
    }

    // Re-search with new filters if there's an active query
    if (searchQuery.trim()) {
      await searchImages(siteId, searchQuery.trim(), {
        mode: 'bulk',
        page: 1,
        orientation: filterType === 'orientation' ? value : orientation,
        color: filterType === 'color' ? value : color
      });
    }
  };

  const isQuotaExceeded = quota.remaining === 0;

  if (!isPanelOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '400px',
        bgcolor: theme === 'dark' ? editorColors.background.paper : '#fff',
        borderLeft: `1px solid ${editorColors.divider}`,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1300,
        animation: 'slideIn 0.3s ease-out',
        '@keyframes slideIn': {
          from: {
            transform: 'translateX(100%)'
          },
          to: {
            transform: 'translateX(0)'
          }
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${editorColors.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon sx={{ color: editorColors.interactive.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: editorColors.text.primary }}>
            Biblioteka Obrazków
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${editorColors.divider}` }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Wyszukaj obrazy..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isQuotaExceeded}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: editorColors.text.secondary }} />
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
            }
          }}
        />

        {/* Filters Toggle */}
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => setShowFilters(!showFilters)}
            sx={{ color: editorColors.text.secondary }}
          >
            <FilterIcon />
          </IconButton>
          <Typography variant="caption" sx={{ color: editorColors.text.secondary }}>
            {quota.remaining} / {quota.limit} wyszukań
          </Typography>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Orientacja</InputLabel>
              <Select
                value={orientation}
                label="Orientacja"
                onChange={(e) => handleFilterChange('orientation', e.target.value)}
              >
                <MenuItem value="all">Wszystkie</MenuItem>
                <MenuItem value="landscape">Pozioma</MenuItem>
                <MenuItem value="portrait">Pionowa</MenuItem>
                <MenuItem value="square">Kwadratowa</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Kolor</InputLabel>
              <Select
                value={color}
                label="Kolor"
                onChange={(e) => handleFilterChange('color', e.target.value)}
              >
                <MenuItem value="">Wszystkie</MenuItem>
                <MenuItem value="red">Czerwony</MenuItem>
                <MenuItem value="orange">Pomarańczowy</MenuItem>
                <MenuItem value="yellow">Żółty</MenuItem>
                <MenuItem value="green">Zielony</MenuItem>
                <MenuItem value="turquoise">Turkusowy</MenuItem>
                <MenuItem value="blue">Niebieski</MenuItem>
                <MenuItem value="violet">Fioletowy</MenuItem>
                <MenuItem value="pink">Różowy</MenuItem>
                <MenuItem value="brown">Brązowy</MenuItem>
                <MenuItem value="black">Czarny</MenuItem>
                <MenuItem value="gray">Szary</MenuItem>
                <MenuItem value="white">Biały</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {/* Quota Warning */}
      {isQuotaExceeded && (
        <Alert severity="warning" sx={{ m: 2 }}>
          Osiągnąłeś dzienny limit wyszukiwań (50). Spróbuj jutro.
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Selection Counter */}
      {selectedImages.length > 0 && (
        <Box sx={{ px: 2, py: 1, bgcolor: editorColors.interactive.main + '10' }}>
          <Chip
            label={`Wybrano: ${selectedImages.length} obrazków`}
            size="small"
            sx={{
              bgcolor: editorColors.interactive.main,
              color: '#fff'
            }}
          />
        </Box>
      )}

      {/* Image Grid */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: editorColors.divider,
            borderRadius: '4px',
            '&:hover': {
              bgcolor: editorColors.text.secondary
            }
          }
        }}
      >
        {/* Loading State */}
        {isLoading && searchResults.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px'
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
            <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="body2">Brak wyników</Typography>
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
            <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>
              Wyszukaj obrazy
            </Typography>
            <Typography variant="caption">
              Wpisz frazy opisujące obrazy
            </Typography>
          </Box>
        )}

        {/* Results Grid - 3 columns */}
        {searchResults.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1
            }}
          >
            {searchResults.map((image) => (
              <Box
                key={image.id}
                onClick={() => handleImageClick(image)}
                sx={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: `2px solid transparent`,
                  '&:hover': {
                    transform: 'scale(1.05)',
                    border: `2px solid ${editorColors.interactive.main}`,
                    boxShadow: `0 4px 12px ${editorColors.interactive.main}40`,
                    zIndex: 10
                  }
                }}
              >
                <img
                  src={image.src.tiny}
                  alt={image.alt || 'Pexels image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="lazy"
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Loading More Indicator */}
        {isLoading && searchResults.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 2,
              py: 2
            }}
          >
            <CircularProgress size={24} sx={{ color: editorColors.interactive.main }} />
          </Box>
        )}
      </Box>

      {/* Footer Info */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${editorColors.divider}`,
          bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
        }}
      >
        <Typography variant="caption" sx={{ color: editorColors.text.secondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <InfoIcon sx={{ fontSize: 14 }} />
          Obrazy z Pexels.com - darmowe do użytku komercyjnego
        </Typography>
      </Box>
    </Box>
  );
};

export default ImageLibraryPanel;
