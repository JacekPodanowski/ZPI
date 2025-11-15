import React, { useCallback, useRef } from 'react';
import { Box, Stack, Typography, Button, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import ColorPicker from '../../../components/ColorPicker';
import { STYLE_LIST } from '../../../SITES/styles';

const SitePropertiesPanel = ({ placement = 'right' }) => {
  const { site, selectedPageId, setStyleId, updateStyleOverrides, batchUpdateModuleContents } = useNewEditorStore();
  const page = site?.pages?.find(p => p.id === selectedPageId);
  
  // Debounce refs for color changes
  const debounceTimers = useRef({});
  
  if (!site || !page) return null;

  const currentStyleId = site.styleId || 'default';
  const currentOverrides = site.styleOverrides || {};
  const currentStyle = site.style || {};

  const handleStyleChange = (newStyleId) => {
    setStyleId(newStyleId);
  };

  const handleOverrideChange = useCallback((key, value) => {
    // Clear existing timer for this key
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }
    
    // Set new timer - only update after 300ms of no changes
    debounceTimers.current[key] = setTimeout(() => {
      updateStyleOverrides({ [key]: value });
      delete debounceTimers.current[key];
    }, 300);
  }, [updateStyleOverrides]);

  const handleApplyToAll = (field) => {
    if (!page.modules || page.modules.length === 0) return;

    const updates = {};
    page.modules.forEach(module => {
      const moduleId = module.id;
      switch (field) {
        case 'bgColor':
          updates[moduleId] = { bgColor: currentStyle.background };
          break;
        case 'textColor':
          updates[moduleId] = { textColor: currentStyle.text };
          break;
        case 'accentColor':
          updates[moduleId] = { accentColor: currentStyle.primary };
          break;
        case 'backgroundImage':
          // Clear background images from all modules
          updates[moduleId] = { backgroundImage: '' };
          break;
        case 'backgroundOverlayColor':
          updates[moduleId] = { backgroundOverlayColor: '' };
          break;
        default:
          break;
      }
    });

    batchUpdateModuleContents(updates);
  };

  const panelMotionProps = {
    initial: { x: placement === 'right' ? 320 : -320 },
    animate: { x: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  };

  const panelStyle = {
    width: '100%',
    height: '100%',
    flexShrink: 0,
    display: 'flex',
    maxWidth: placement === 'right' ? 360 : '100%',
    minWidth: placement === 'left' ? 250 : 400
  };

  const containerSx = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'rgb(228, 229, 218)',
    position: 'relative',
    ...(placement === 'left'
      ? {
          borderRight: '1px solid rgba(30, 30, 30, 0.1)'
        }
      : {
          '&::before': {
            content: "''",
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '40px',
            width: '1px',
            backgroundColor: 'rgba(30, 30, 30, 0.1)'
          }
        })
  };

  return (
    <motion.div
      {...panelMotionProps}
      style={panelStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <Box sx={containerSx}>
        {/* Header */}
        <Box
          sx={{
            px: 3.5,
            py: 3,
            borderBottom: '1px solid rgba(30, 30, 30, 0.1)',
            backgroundColor: 'rgb(220, 221, 210)'
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'rgb(30, 30, 30)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}
          >
            Site Settings
          </Typography>
          <Typography
            sx={{
              fontSize: '12px',
              color: 'rgba(30, 30, 30, 0.6)',
              mt: 0.5
            }}
          >
            Global style and color settings
          </Typography>
        </Box>

        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 3.5,
            py: 3,
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(30, 30, 30, 0.2)',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: 'rgba(30, 30, 30, 0.3)'
              }
            }
          }}
        >
          <Stack spacing={3}>
            {/* Style Theme Selector */}
            <Box>
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'rgba(30, 30, 30, 0.5)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  mb: 2
                }}
              >
                Theme
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ '&.Mui-focused': { color: 'rgb(146, 0, 32)' } }}>
                  Style Theme
                </InputLabel>
                <Select
                  value={currentStyleId}
                  onChange={(e) => handleStyleChange(e.target.value)}
                  label="Style Theme"
                  sx={{
                    borderRadius: '8px',
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' }
                  }}
                >
                  {STYLE_LIST.map(style => (
                    <MenuItem key={style.id} value={style.id}>
                      {style.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Global Colors */}
            <Box>
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'rgba(30, 30, 30, 0.5)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  mb: 2
                }}
              >
                Global Colors
              </Typography>
              <Stack spacing={2.5}>
                {/* Background Color */}
                <Box>
                  <ColorPicker
                    label="Background Color"
                    value={currentOverrides.background || currentStyle.background || '#f5f2eb'}
                    onChange={(color) => handleOverrideChange('background', color)}
                  />
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleApplyToAll('bgColor')}
                    sx={{
                      mt: 1,
                      fontSize: '11px',
                      textTransform: 'none',
                      color: 'rgb(146, 0, 32)',
                      '&:hover': {
                        backgroundColor: 'rgba(146, 0, 32, 0.08)'
                      }
                    }}
                  >
                    Apply to All Modules
                  </Button>
                </Box>

                {/* Text Color */}
                <Box>
                  <ColorPicker
                    label="Text Color"
                    value={currentOverrides.text || currentStyle.text || '#1e1e1e'}
                    onChange={(color) => handleOverrideChange('text', color)}
                  />
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleApplyToAll('textColor')}
                    sx={{
                      mt: 1,
                      fontSize: '11px',
                      textTransform: 'none',
                      color: 'rgb(146, 0, 32)',
                      '&:hover': {
                        backgroundColor: 'rgba(146, 0, 32, 0.08)'
                      }
                    }}
                  >
                    Apply to All Modules
                  </Button>
                </Box>

                {/* Primary/Accent Color */}
                <Box>
                  <ColorPicker
                    label="Accent Color"
                    value={currentOverrides.primary || currentStyle.primary || '#920020'}
                    onChange={(color) => handleOverrideChange('primary', color)}
                  />
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleApplyToAll('accentColor')}
                    sx={{
                      mt: 1,
                      fontSize: '11px',
                      textTransform: 'none',
                      color: 'rgb(146, 0, 32)',
                      '&:hover': {
                        backgroundColor: 'rgba(146, 0, 32, 0.08)'
                      }
                    }}
                  >
                    Apply to All Modules
                  </Button>
                </Box>

                {/* Surface Color */}
                <Box>
                  <ColorPicker
                    label="Surface Color"
                    value={currentOverrides.surface || currentStyle.surface || '#ffffff'}
                    onChange={(color) => handleOverrideChange('surface', color)}
                  />
                </Box>

                {/* Neutral Color */}
                <Box>
                  <ColorPicker
                    label="Neutral Color"
                    value={currentOverrides.neutral || currentStyle.neutral || '#6b7280'}
                    onChange={(color) => handleOverrideChange('neutral', color)}
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Background Management */}
            <Box>
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'rgba(30, 30, 30, 0.5)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  mb: 2
                }}
              >
                Background Management
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: 'rgba(30, 30, 30, 0.7)',
                      mb: 1
                    }}
                  >
                    Clear all background images
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleApplyToAll('backgroundImage')}
                    sx={{
                      fontSize: '11px',
                      textTransform: 'none',
                      borderColor: 'rgba(146, 0, 32, 0.3)',
                      color: 'rgb(146, 0, 32)',
                      '&:hover': {
                        borderColor: 'rgb(146, 0, 32)',
                        backgroundColor: 'rgba(146, 0, 32, 0.08)'
                      }
                    }}
                  >
                    Remove All Background Images
                  </Button>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: 'rgba(30, 30, 30, 0.7)',
                      mb: 1
                    }}
                  >
                    Clear all background overlays
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleApplyToAll('backgroundOverlayColor')}
                    sx={{
                      fontSize: '11px',
                      textTransform: 'none',
                      borderColor: 'rgba(146, 0, 32, 0.3)',
                      color: 'rgb(146, 0, 32)',
                      '&:hover': {
                        borderColor: 'rgb(146, 0, 32)',
                        backgroundColor: 'rgba(146, 0, 32, 0.08)'
                      }
                    }}
                  >
                    Remove All Overlays
                  </Button>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Info Box */}
            <Box
              sx={{
                p: 2,
                borderRadius: '8px',
                backgroundColor: 'rgba(146, 0, 32, 0.05)',
                border: '1px solid rgba(146, 0, 32, 0.1)'
              }}
            >
              <Typography
                sx={{
                  fontSize: '12px',
                  color: 'rgba(30, 30, 30, 0.7)',
                  lineHeight: 1.5
                }}
              >
                <strong>Global settings</strong> affect the entire site. Use "Apply to All Modules" buttons to propagate colors to all modules on the current page.
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </motion.div>
  );
};

export default SitePropertiesPanel;
