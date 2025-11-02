import React, { useState } from 'react';
import { Box, Stack, IconButton, Typography, Tooltip, ToggleButtonGroup, ToggleButton, Checkbox, FormControlLabel } from '@mui/material';
import { GridView, Visibility, ViewColumn, RemoveRedEye, ArrowDownward } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleToolbar from './ModuleToolbar';
import SiteCanvas from './SiteCanvas';

const StructureMode = () => {
  const { site, getSelectedPage, selectedPageId, enterDetailMode, addPage, setEntryPoint } = useNewEditorStore();
  
  const [showModuleToolbar, setShowModuleToolbar] = useState(true);
  const [renderMode, setRenderMode] = useState('icon'); // 'icon' | 'real'
  const [showOverlay, setShowOverlay] = useState(true);

  // Get the current page or default to first page
  const currentPage = getSelectedPage() || (site?.pages?.[0] || null);

  // Safety check
  if (!site || !site.pages || site.pages.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(30, 30, 30, 0.4)'
        }}
      >
        <Typography>No pages available. Add a page to get started.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'rgb(228, 229, 218)' // Off-white background for entire editor area
      }}
    >
      {/* Module Toolbar */}
      <AnimatePresence>
        {showModuleToolbar && <ModuleToolbar />}
      </AnimatePresence>

      {/* Main Editor Area */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          pl: showModuleToolbar ? '180px' : 0,
          transition: 'padding-left 0.4s ease',
          overflow: 'auto'
        }}
      >
        {/* Editor Canvas Area with Settings */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            px: 4,
            pt: 3,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
          }}
        >
          {/* Canvas Settings - Full Width, Left Aligned */}
          <Box
            sx={{
              width: '100%',
              mb: 3
            }}
          >
            <Stack direction="row" spacing={3} alignItems="center">
              {/* Render Mode Toggle */}
              <ToggleButtonGroup
                value={renderMode}
                exclusive
                onChange={(e, newMode) => newMode && setRenderMode(newMode)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 0.75,
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'none',
                    border: '1px solid rgba(30, 30, 30, 0.15)',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    '&.Mui-selected': {
                      bgcolor: 'rgb(146, 0, 32)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgb(114, 0, 21)'
                      }
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 1)'
                    }
                  }
                }}
              >
                <ToggleButton value="icon">
                  <GridView sx={{ fontSize: 16, mr: 0.5 }} />
                  Icon Render
                </ToggleButton>
                <ToggleButton value="real">
                  <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                  Real Render
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Color Overlay Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOverlay}
                    onChange={(e) => setShowOverlay(e.target.checked)}
                    size="small"
                    sx={{
                      color: 'rgb(146, 0, 32)',
                      '&.Mui-checked': {
                        color: 'rgb(146, 0, 32)'
                      }
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'rgb(30, 30, 30)' }}>
                    Color Overlay
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Stack>
          </Box>

          {/* Site Canvas Container */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            {/* Entry Point Indicator */}
            {site.entryPointPageId === currentPage?.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RemoveRedEye
                  sx={{
                    fontSize: 28,
                    color: 'rgb(146, 0, 32)'
                  }}
                />
                <ArrowDownward
                  sx={{
                    fontSize: 20,
                    color: 'rgb(146, 0, 32)',
                    animation: 'bounce 2s infinite'
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'rgb(146, 0, 32)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                >
                  Entry Point
                </Typography>
              </motion.div>
            )}

            {/* Site Canvas - The Website Representation */}
            {currentPage && (
              <motion.div
                key={currentPage.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{ width: '100%', maxWidth: '700px' }}
              >
                <SiteCanvas 
                  page={currentPage} 
                  renderMode={renderMode}
                  showOverlay={showOverlay}
                />
              </motion.div>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StructureMode;
