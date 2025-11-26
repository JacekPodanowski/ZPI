import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import useImageSearchStore from '../store/imageSearchStore';
import useNewEditorStore from '../store/newEditorStore';
import useTheme from '../../theme/useTheme';
import { getModuleDefinition } from '../pages/Editor/moduleDefinitions';

const MAX_BOOKMARKS = 5;
const CACHE_EXPIRY_DAYS = 7;
const CACHE_KEY = 'pexels_search_tabs';
const CACHE_TIMESTAMP_KEY = 'pexels_search_tabs_timestamp';

/**
 * MediaPanel - Pexels search integrated into Toolbar
 * Features:
 * - Search input with Pexels API integration
 * - Bookmarks as tabs (up to 5, auto-remove oldest)
 * - Cache cleared every 7 days
 * - Scrollable image results (vertical list)
 * - Click image to select it
 */
const MediaPanel = ({ textPrimary, textMuted, accentColor, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTabs, setSearchTabs] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(null);
  const searchDebounceRef = useRef(null);
  const theme = useTheme();
  const siteId = useNewEditorStore((state) => state.siteId);
  const selectedModuleId = useNewEditorStore((state) => state.selectedModuleId);
  const selectedPageId = useNewEditorStore((state) => state.selectedPageId);
  const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);
  const getSelectedModule = useNewEditorStore((state) => state.getSelectedModule);

  const {
    searchResults,
    isLoading,
    searchImages,
    quota
  } = useImageSearchStore();

  // Load tabs from localStorage and check cache expiry
  useEffect(() => {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();
    const cacheAge = timestamp ? now - parseInt(timestamp, 10) : Infinity;
    const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (cacheAge > expiryMs) {
      // Cache expired, clear it
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
      setSearchTabs([]);
    } else {
      // Load existing tabs
      const saved = localStorage.getItem(CACHE_KEY);
      if (saved) {
        try {
          const tabs = JSON.parse(saved);
          setSearchTabs(tabs);
        } catch (e) {
          console.error('Failed to load search tabs:', e);
          setSearchTabs([]);
        }
      }
      
      // Set timestamp if not exists
      if (!timestamp) {
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
      }
    }
  }, []);

  // Save tabs to localStorage
  const saveTabs = (tabs) => {
    setSearchTabs(tabs);
    localStorage.setItem(CACHE_KEY, JSON.stringify(tabs));
  };

  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = async (query) => {
    if (!query) return;

    try {
      // Search using Pexels API
      const response = await searchImages(siteId, query, {
        mode: 'bulk',
        page: 1
      });

      // Add to tabs (as bookmarks)
      addTab(query, response.images || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    if (query) {
      handleSearch(query);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const addTab = (query, images) => {
    const newTab = {
      query,
      images,
      timestamp: Date.now()
    };

    const newTabs = [newTab, ...searchTabs.filter(t => t.query !== query)];
    
    // Keep only MAX_BOOKMARKS most recent
    if (newTabs.length > MAX_BOOKMARKS) {
      newTabs.pop();
    }
    
    saveTabs(newTabs);
    setActiveTabIndex(0);
  };

  const handleTabClick = (index) => {
    setActiveTabIndex(index);
  };

  const handleTabRemove = (index, e) => {
    e.stopPropagation();
    const newTabs = searchTabs.filter((_, i) => i !== index);
    saveTabs(newTabs);
    
    if (activeTabIndex === index) {
      setActiveTabIndex(newTabs.length > 0 ? 0 : null);
    } else if (activeTabIndex > index) {
      setActiveTabIndex(activeTabIndex - 1);
    }
  };

  const selectedModule = useMemo(() => {
    if (!selectedModuleId) {
      return null;
    }
    return getSelectedModule?.() || null;
  }, [getSelectedModule, selectedModuleId, selectedPageId]);

  const selectedModuleLabel = useMemo(() => {
    if (!selectedModule) {
      return null;
    }
    if (selectedModule.name) {
      return selectedModule.name;
    }
    const definition = getModuleDefinition(selectedModule.type);
    return definition?.label || selectedModule.type;
  }, [selectedModule]);

  const handleImageClick = (image) => {
    const selectedElementId = localStorage.getItem('selectedImageElement');
    let handled = false;

    if (selectedElementId && window.__imageElementCallbacks) {
      const callback = window.__imageElementCallbacks[selectedElementId];
      if (callback) {
        callback(image.src.large);
        handled = true;
      }
    }

    if (!handled && selectedModuleId && selectedPageId && selectedModule) {
      const bestSrc =
        image?.src?.large2x || image?.src?.large || image?.src?.original || image?.src?.medium;
      if (bestSrc) {
        const currentBg = selectedModule?.content?.backgroundImage;
        if (currentBg !== bestSrc) {
          updateModuleContent(
            selectedPageId,
            selectedModuleId,
            { backgroundImage: bestSrc },
            {
              description: `Ustawiono tło w sekcji "${selectedModuleLabel || selectedModule.type || 'moduł'}"`,
              actionType: 'set_module_background'
            }
          );
        }
        handled = true;
      }
    }
  };

  const lowQuota = typeof quota?.remaining === 'number' && quota.remaining < 10;

  const activeTab = activeTabIndex !== null ? searchTabs[activeTabIndex] : null;
  const displayImages = activeTab ? activeTab.images : searchResults;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search Input */}
      <Box
        sx={{
          pt: 0.5,
          pb: 1,
          mx: -0.5,
          px: 0.5,
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Wyszukaj obrazy w Pexels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                onClick={handleSearchSubmit}
                disabled={!searchQuery.trim() || isLoading}
                sx={{ color: textMuted, mr: -1 }}
              >
                <SearchIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: '13px',
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '& fieldset': {
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }
            },
            '& input': {
              color: textPrimary
            }
          }}
        />
        {lowQuota && (
          <Alert
            severity="warning"
            sx={{
              mt: 0.5,
              py: 0.4,
              px: 0.75,
              borderRadius: '8px'
            }}
          >
            Zostało tylko {quota?.remaining} wyszukań na dziś.
          </Alert>
        )}
      </Box>

      {/* Module context hint */}
      {selectedModule && (
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(146,0,32,0.03)'
          }}
        >
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              color: textPrimary,
              mb: 0.25
            }}
          >
            {selectedModuleLabel || 'Wybrany moduł'}
          </Typography>
          <Typography sx={{ fontSize: '11px', color: textMuted }}>
            Kliknięcie obrazu ustawi go jako tło tej sekcji.
          </Typography>
        </Box>
      )}

      {/* Search Tabs */}
      {searchTabs.length > 0 && (
        <Box sx={{ 
          p: 1.5, 
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.75
        }}>
          {searchTabs.map((tab, index) => (
            <Chip
              key={tab.query + tab.timestamp}
              label={tab.query}
              size="small"
              onClick={() => handleTabClick(index)}
              onDelete={(e) => handleTabRemove(index, e)}
              deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />}
              sx={{
                bgcolor: activeTabIndex === index 
                  ? (isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)')
                  : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                color: textPrimary,
                fontSize: '11px',
                height: '26px',
                cursor: 'pointer',
                border: activeTabIndex === index ? `1px solid ${accentColor}` : 'none',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                },
                '& .MuiChip-deleteIcon': {
                  color: textMuted,
                  '&:hover': {
                    color: textPrimary
                  }
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* Image Results */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            borderRadius: '3px',
            '&:hover': {
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
            }
          }
        }}
      >
        {/* Loading */}
        {isLoading && activeTabIndex === null && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4
            }}
          >
            <CircularProgress size={24} sx={{ color: accentColor }} />
          </Box>
        )}

        {/* No search yet */}
        {!isLoading && displayImages.length === 0 && searchTabs.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              color: textMuted
            }}
          >
            <SearchIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
            <Typography sx={{ fontSize: '12px' }}>
              Wyszukaj obrazy z Pexels używając pola powyżej
            </Typography>
          </Box>
        )}

        {/* Results - Vertical List */}
        {displayImages.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {displayImages.map((image) => (
              <Box
                key={image.id}
                onClick={() => handleImageClick(image)}
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: `2px solid transparent`,
                  '&:hover': {
                    border: `2px solid ${accentColor}`,
                    transform: 'scale(1.02)',
                    boxShadow: `0 4px 12px ${accentColor}40`
                  }
                }}
              >
                <img
                  src={image.src.small}
                  alt={image.alt || 'Pexels image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="lazy"
                />
                
                {/* Photographer Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                    padding: '6px 8px',
                    fontSize: '10px',
                    color: '#fff'
                  }}
                >
                  {image.photographer}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* No results in active tab */}
        {!isLoading && displayImages.length === 0 && searchTabs.length > 0 && activeTabIndex !== null && (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              color: textMuted
            }}
          >
            <Typography sx={{ fontSize: '12px' }}>
              Brak wyników w tej zakładce
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MediaPanel;
