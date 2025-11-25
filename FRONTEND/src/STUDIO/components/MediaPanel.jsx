import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useImageSearchStore from '../store/imageSearchStore';
import useNewEditorStore from '../store/newEditorStore';
import useTheme from '../../theme/useTheme';

/**
 * MediaPanel - Pexels search integrated into Toolbar
 * Features:
 * - Search input with magnifying glass
 * - Bookmark recent searches (up to 3, draggable)
 * - Scrollable image results (vertical list)
 * - Click image to select it
 */
const MediaPanel = ({ textPrimary, textMuted, accentColor, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBookmarks, setSearchBookmarks] = useState([]);
  const searchDebounceRef = useRef(null);
  const theme = useTheme();
  const siteId = useNewEditorStore((state) => state.siteId);

  const {
    searchResults,
    isLoading,
    searchImages,
    quota
  } = useImageSearchStore();

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pexels_search_bookmarks');
    if (saved) {
      try {
        setSearchBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      }
    }
  }, []);

  // Save bookmarks to localStorage
  const saveBookmarks = (bookmarks) => {
    setSearchBookmarks(bookmarks);
    localStorage.setItem('pexels_search_bookmarks', JSON.stringify(bookmarks));
  };

  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (searchQuery.trim()) {
      searchDebounceRef.current = setTimeout(() => {
        handleSearch(searchQuery.trim());
      }, 500);
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
      await searchImages(siteId, query, {
        mode: 'bulk',
        page: 1
      });

      // Add to bookmarks
      addBookmark(query);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const addBookmark = (query) => {
    const newBookmarks = [query, ...searchBookmarks.filter(b => b !== query)];
    
    // Keep only 3 most recent
    if (newBookmarks.length > 3) {
      newBookmarks.pop();
    }
    
    saveBookmarks(newBookmarks);
  };

  const handleBookmarkClick = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(searchBookmarks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    saveBookmarks(items);
  };

  const handleImageClick = (image) => {
    // Get selected element from localStorage
    const selectedElementId = localStorage.getItem('selectedImageElement');
    
    if (selectedElementId && window.__imageElementCallbacks) {
      const callback = window.__imageElementCallbacks[selectedElementId];
      if (callback) {
        callback(image.src.large);
      }
    }
  };

  const lowQuota = typeof quota?.remaining === 'number' && quota.remaining < 10;

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
          placeholder="Wyszukaj obrazy..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                onClick={() => handleSearch(searchQuery.trim())}
                disabled={!searchQuery.trim()}
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

      {/* Bookmarks */}
      {searchBookmarks.length > 0 && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              color: textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 1
            }}
          >
            Ostatnie wyszukiwania
          </Typography>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="bookmarks">
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}
                >
                  {searchBookmarks.map((bookmark, index) => (
                    <Draggable key={bookmark} draggableId={bookmark} index={index}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            borderRadius: '6px',
                            px: 1,
                            py: 0.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: snapshot.isDragging ? 0.5 : 1,
                            '&:hover': {
                              bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
                            }
                          }}
                          onClick={() => handleBookmarkClick(bookmark)}
                        >
                          <Box {...provided.dragHandleProps}>
                            <DragIcon sx={{ fontSize: 14, color: textMuted }} />
                          </Box>
                          <Typography
                            sx={{
                              fontSize: '12px',
                              color: textPrimary,
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {bookmark}
                          </Typography>
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
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
        {isLoading && (
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
        {!isLoading && searchResults.length === 0 && !searchQuery && (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              color: textMuted
            }}
          >
            <SearchIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
            <Typography sx={{ fontSize: '12px' }}>
              Wyszukaj obrazy używając pola powyżej
            </Typography>
          </Box>
        )}

        {/* Results - Vertical List */}
        {!isLoading && searchResults.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {searchResults.map((image) => (
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

        {/* No results */}
        {!isLoading && searchResults.length === 0 && searchQuery && (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              color: textMuted
            }}
          >
            <Typography sx={{ fontSize: '12px' }}>
              Brak wyników dla "{searchQuery}"
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MediaPanel;
