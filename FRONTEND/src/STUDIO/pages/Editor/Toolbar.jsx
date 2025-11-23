import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Box, Stack, Typography, IconButton, Select, MenuItem, FormControl, InputLabel, Tooltip, TextField, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  ViewModule, 
  Settings, 
  Delete,
  Tune,
  Image
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import useTheme from '../../../theme/useTheme';
import getEditorColorTokens from '../../../theme/editorColorTokens';
import useNewEditorStore from '../../store/newEditorStore';
import { STYLE_LIST } from '../../../SITES/styles';
import PropertiesPanel from './PropertiesPanel';
import pexelsService from '../../../services/pexelsService';
import ModuleToolbar from './ModuleToolbar';

const RAIL_WIDTH = 56;
const PANEL_WIDTH = 360;
const EDITOR_TOP_BAR_HEIGHT = 56;

const Toolbar = ({ isDraggingModule = false, mode = 'structure' }) => {
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const isDarkMode = theme.mode === 'dark';
  const accentColor = editorColors.interactive.main;
  
  const { 
    site, 
    setStyleId, 
    removeModule, 
    addModule, 
    setDragging, 
    currentPage 
  } = useNewEditorStore();

  const [activeSection, setActiveSection] = useState(null); // 'modules' | 'settings' | null
  const [isOverTrash, setIsOverTrash] = useState(false);
  const toolbarRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target) && activeSection) {
        setActiveSection(null);
      }
    };

    if (activeSection) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeSection]);

  const currentStyleId = site?.styleId || 'auroraMinimal';

  // Styling
  const surfaceBase = editorColors.surfaces?.base || (isDarkMode ? 'rgb(15, 15, 18)' : 'rgb(255, 255, 255)');
  const canvasBase = editorColors.backgrounds?.canvas || surfaceBase;
  const toolbarBg = isDarkMode ? 'rgb(20, 20, 24)' : 'rgb(255, 255, 255)';
  const borderColor = alpha(editorColors.borders.subtle, isDarkMode ? 0.5 : 0.8);
  const textPrimary = editorColors.text.primary;
  const textSecondary = editorColors.text.secondary;
  const hoverBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 30, 30, 0.04)';
  const glowShadow = isDarkMode ? '0 24px 48px rgba(0,0,0,0.45)' : '0 24px 48px rgba(15,23,42,0.22)';

  const isPanelOpen = Boolean(activeSection);
  const currentWidth = RAIL_WIDTH + (isPanelOpen ? PANEL_WIDTH : 0);

  const handleSectionClick = (section) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  // Handle style change
  const handleStyleChange = (event) => {
    const newStyleId = event.target.value;
    setStyleId(newStyleId);
  };

  // Handle trash drop
  const handleTrashDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const moduleId = e.dataTransfer.getData('moduleId');
    const sourcePageId = e.dataTransfer.getData('sourcePageId');
    
    if (moduleId && sourcePageId) {
      setIsOverTrash(false);
      removeModule(sourcePageId, moduleId);
      requestAnimationFrame(() => setDragging(false));
    }
  };

  const handleTrashDragOver = (e) => {
    if (!isDraggingModule) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOverTrash(true);
  };

  const handleTrashDragLeave = (e) => {
    if (!isDraggingModule) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsOverTrash(false);
    }
  };

  useEffect(() => {
    if (!isDraggingModule) {
      setIsOverTrash(false);
    }
  }, [isDraggingModule]);

  // Section configurations based on mode
  const sections = useMemo(() => (
    mode === 'structure'
      ? [
          {
            id: 'modules',
            icon: ViewModule,
            label: 'Modules',
            tooltip: 'Add and manage modules'
          },
          {
            id: 'images',
            icon: Image,
            label: 'Images',
            tooltip: 'Search Pexels images'
          },
          {
            id: 'settings',
            icon: Settings,
            label: 'Site Settings',
            tooltip: 'Configure site appearance'
          }
        ]
      : [
          {
            id: 'properties',
            icon: Tune,
            label: 'Properties',
            tooltip: 'Edit module properties'
          },
          {
            id: 'images',
            icon: Image,
            label: 'Images',
            tooltip: 'Search Pexels images'
          },
          {
            id: 'settings',
            icon: Settings,
            label: 'Site Settings',
            tooltip: 'Configure site appearance'
          }
        ]
  ), [mode]);

  return (
    <Box
      ref={toolbarRef}
      sx={{
        position: 'fixed',
        left: 0,
        top: EDITOR_TOP_BAR_HEIGHT,
        bottom: 0,
        width: currentWidth,
        display: 'flex',
        flexDirection: 'row',
        borderRight: `1px solid ${borderColor}`,
        bgcolor: toolbarBg,
        zIndex: 1000,
        boxShadow: isPanelOpen ? glowShadow : 'none',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Icon rail */}
      <Box
        sx={{
          width: RAIL_WIDTH,
          borderRight: isPanelOpen ? `1px solid ${borderColor}` : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          py: 1.5
        }}
      >
        <Stack spacing={1} sx={{ flex: 1, alignItems: 'center' }}>
          {sections.map((section) => (
            <Tooltip
              key={section.id}
              title={section.tooltip}
              placement="right"
              arrow
            >
              <IconButton
                onClick={() => handleSectionClick(section.id)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: activeSection === section.id ? alpha(accentColor, 0.15) : 'transparent',
                  color: activeSection === section.id ? accentColor : textPrimary,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: activeSection === section.id ? alpha(accentColor, 0.25) : hoverBg
                  }
                }}
              >
                {React.createElement(section.icon)}
              </IconButton>
            </Tooltip>
          ))}
        </Stack>

        {/* Trash zone indicator */}
        <AnimatePresence>
          {isDraggingModule && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Box
                onDrop={handleTrashDrop}
                onDragOver={handleTrashDragOver}
                onDragLeave={handleTrashDragLeave}
                sx={{
                  mx: 1,
                  mb: 1,
                  p: 1,
                  borderRadius: '12px',
                  border: `2px dashed ${isOverTrash ? accentColor : borderColor}`,
                  bgcolor: isOverTrash ? alpha(accentColor, 0.1) : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Delete sx={{ color: isOverTrash ? accentColor : textSecondary }} />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Detail panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: PANEL_WIDTH, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ px: 2, py: 2, flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {activeSection === 'modules' && mode === 'structure' && (
                <ModuleToolbar 
                  isDraggingModule={isDraggingModule}
                  onClose={() => setActiveSection(null)}
                />
              )}
              
              {activeSection === 'properties' && mode === 'detail' && (
                <Box sx={{ mt: -2 }}>
                  <PropertiesPanel placement="left" />
                </Box>
              )}
              
              {activeSection === 'images' && (
                <ImagesSection 
                  editorColors={editorColors}
                  accentColor={accentColor}
                  siteId={site?.id}
                  isDarkMode={isDarkMode}
                />
              )}
              
              {activeSection === 'settings' && (
                <SiteSettingsSection 
                  currentStyleId={currentStyleId}
                  onStyleChange={handleStyleChange}
                  editorColors={editorColors}
                  accentColor={accentColor}
                />
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

// Site Settings Section Component
const SiteSettingsSection = ({ currentStyleId, onStyleChange, editorColors, accentColor }) => {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          color: accentColor,
          fontWeight: 600,
          mb: 2,
          textTransform: 'uppercase',
          fontSize: '11px',
          letterSpacing: '0.5px'
        }}
      >
        Site Configuration
      </Typography>

      <Stack spacing={3}>
        <FormControl fullWidth size="small">
          <InputLabel
            sx={{
              color: editorColors.text.secondary,
              '&.Mui-focused': {
                color: accentColor
              }
            }}
          >
            Site Style
          </InputLabel>
          <Select
            value={currentStyleId}
            onChange={onStyleChange}
            label="Site Style"
            sx={{
              color: editorColors.text.primary,
              bgcolor: editorColors.backgrounds.canvas,
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(editorColors.borders.subtle, 0.5)
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: accentColor
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: accentColor
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: editorColors.surfaces.base,
                  border: `1px solid ${editorColors.borders.subtle}`,
                  borderRadius: '12px',
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    color: editorColors.text.primary,
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.25,
                    '&:hover': {
                      bgcolor: alpha(accentColor, 0.12)
                    },
                    '&.Mui-selected': {
                      bgcolor: alpha(accentColor, 0.15),
                      '&:hover': {
                        bgcolor: alpha(accentColor, 0.2)
                      }
                    }
                  }
                }
              }
            }}
          >
            {Object.keys(STYLE_LIST).map((styleId) => {
              const style = STYLE_LIST[styleId];
              return (
                <MenuItem key={styleId} value={styleId}>
                  {style.name || styleId}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <Box>
          <Typography
            variant="caption"
            sx={{
              color: editorColors.text.secondary,
              display: 'block',
              mb: 1
            }}
          >
            More settings coming soon...
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

// Images Section Component (Pexels Integration)
const ImagesSection = ({ editorColors, accentColor, siteId, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState({ used: 0, limit: 50, remaining: 50 });
  const [orientation, setOrientation] = useState('all');
  const searchDisabled = !siteId || quota.remaining <= 0;
  const fallbackAccent = accentColor || (isDarkMode ? 'rgb(200, 120, 120)' : 'rgb(146, 0, 32)');
  const fallbackBorder = editorColors.borders?.subtle || (isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(15, 23, 42, 0.18)');
  const fallbackTextSecondary = editorColors.text?.secondary || (isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.64)');
  const fallbackCanvas = editorColors.backgrounds?.canvas || (isDarkMode ? 'rgba(12,12,12,0.85)' : '#ffffff');
  const safeAlpha = (color, value, fallbackColor) => {
    const source = color || fallbackColor || (isDarkMode ? '#ffffff' : '#000000');
    try {
      return alpha(source, value);
    } catch (err) {
      return alpha(fallbackColor || (isDarkMode ? '#ffffff' : '#000000'), value);
    }
  };
  const resultsToRender = Array.isArray(searchResults) ? searchResults.filter(Boolean) : [];

  // Fetch quota on mount
  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const data = await pexelsService.getQuota(siteId);
        setQuota(data);
      } catch (err) {
        console.error('Failed to fetch quota:', err);
      }
    };

    if (siteId) {
      fetchQuota();
    } else {
      setQuota({ used: 0, limit: 0, remaining: 0 });
    }
  }, [siteId]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !siteId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await pexelsService.searchImages(siteId, {
        query: searchQuery,
        mode: 'bulk', // Always use bulk mode in toolbar for library
        orientation,
        page: 1
      });
      
      setSearchResults(data.images || []);
      
      // Update quota
      if (data.quota) {
        setQuota(data.quota);
      }
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || !siteId) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, orientation]);

  const handleImageClick = (image) => {
    // TODO: Implement image selection logic
    // This will be connected to the actual image element selection
    console.log('Selected image:', image);
  };

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          color: accentColor,
          fontWeight: 600,
          mb: 2,
          textTransform: 'uppercase',
          fontSize: '11px',
          letterSpacing: '0.5px'
        }}
      >
        Pexels Image Library
      </Typography>

      {/* Quota Display */}
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: '8px',
          bgcolor: safeAlpha(accentColor, 0.08, fallbackAccent),
          border: `1px solid ${safeAlpha(accentColor, 0.2, fallbackAccent)}`
        }}
      >
        <Typography variant="caption" sx={{ color: editorColors.text.secondary }}>
          Dzisiaj: <strong>{quota.used}</strong> / {quota.limit || '∞'} wyszukiwań
        </Typography>
        <Box
          sx={{
            mt: 0.5,
            height: 4,
            borderRadius: 2,
            bgcolor: safeAlpha(editorColors.text?.secondary, 0.2, fallbackTextSecondary),
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: quota.limit ? `${Math.min(100, (quota.used / quota.limit) * 100)}%` : '0%',
              bgcolor: quota.remaining < 10 ? '#f44336' : accentColor,
              transition: 'width 0.3s ease'
            }}
          />
        </Box>
      </Box>

      {/* Search Input */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Szukaj obrazków..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={searchDisabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: fallbackCanvas,
              '&:hover fieldset': { borderColor: accentColor },
              '&.Mui-focused fieldset': { borderColor: accentColor }
            }
          }}
        />

        {/* Orientation Filter */}
        <FormControl fullWidth size="small">
          <InputLabel
            sx={{
              color: editorColors.text.secondary,
              '&.Mui-focused': { color: accentColor }
            }}
          >
            Orientacja
          </InputLabel>
          <Select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            label="Orientacja"
            disabled={!searchQuery.trim() || searchDisabled}
            sx={{
              borderRadius: '12px',
              bgcolor: fallbackCanvas,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: safeAlpha(editorColors.borders?.subtle, 0.5, fallbackBorder)
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: accentColor
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: accentColor
              }
            }}
          >
            <MenuItem value="all">Wszystkie</MenuItem>
            <MenuItem value="landscape">Poziomo</MenuItem>
            <MenuItem value="portrait">Pionowo</MenuItem>
            <MenuItem value="square">Kwadrat</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Error State */}
      {error && (
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: safeAlpha('#f44336', 0.08, '#f44336'),
            border: `1px solid ${safeAlpha('#f44336', 0.2, '#f44336')}`,
            mb: 2
          }}
        >
          <Typography variant="body2" sx={{ color: '#f44336', fontSize: '13px' }}>
            {error}
          </Typography>
        </Box>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} sx={{ color: accentColor }} />
        </Box>
      )}

      {/* Results Grid */}
      {!isLoading && resultsToRender.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: editorColors.text.secondary,
              mb: 1,
              display: 'block'
            }}
          >
            Znaleziono {resultsToRender.length} obrazków
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
              mt: 2
            }}
          >
            {resultsToRender.map((image) => (
              <Box
                key={image.id}
                onClick={() => handleImageClick(image)}
                sx={{
                  position: 'relative',
                  paddingBottom: '75%', // 4:3 aspect ratio
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: `2px solid transparent`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: accentColor,
                    transform: 'scale(1.05)',
                    boxShadow: `0 4px 12px ${alpha(accentColor, 0.3)}`
                  }
                }}
              >
                <Box
                  component="img"
                  src={image?.src?.tiny || image?.src?.small}
                  alt={image?.alt || 'Pexels image'}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {/* Photographer credit overlay on hover */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    p: 0.5,
                    fontSize: '9px',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    '.MuiBox-root:hover &': {
                      opacity: 1
                    }
                  }}
                >
                  {image.photographer}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && !error && searchQuery && resultsToRender.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: editorColors.text.secondary
          }}
        >
          <Typography variant="body2">
            Brak wyników dla "{searchQuery}"
          </Typography>
          <Typography variant="caption">
            Spróbuj innej frazy
          </Typography>
        </Box>
      )}

      {/* Initial State */}
      {!searchQuery && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: editorColors.text.secondary
          }}
        >
          <Image sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
          <Typography variant="body2">
            {siteId ? 'Wyszukaj obrazki z Pexels' : 'Wybierz stronę aby rozpocząć'}
          </Typography>
          <Typography variant="caption">
            {siteId ? 'Bezpłatne, wysokiej jakości zdjęcia' : 'Biblioteka wymaga aktywnej strony'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Toolbar;
