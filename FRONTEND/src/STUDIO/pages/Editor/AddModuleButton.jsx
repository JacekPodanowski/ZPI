import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import { getModuleDefinition, getDefaultModuleContent } from './moduleDefinitions';

// List of commonly used modules
const QUICK_MODULES = [
  'hero',
  'about',
  'services',
  'servicesAndPricing',
  'team',
  'gallery',
  'faq',
  'contact',
  'publicCalendarBig',
  'publicCalendarSmall',
  'text',
  'button',
  'spacer'
];

const AddModuleButton = () => {
  const { getSelectedPage, addModule } = useNewEditorStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const page = getSelectedPage();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddModule = (moduleType) => {
    if (page) {
      const defaultContent = getDefaultModuleContent(moduleType);
      addModule(page.id, {
        type: moduleType,
        content: defaultContent
      });
    }
    handleClose();
  };

  if (!page) return null;

  return (
    <>
      <Tooltip title="Add Section">
        <IconButton
          onClick={handleClick}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 380, // Position to the left of properties panel (320px + 60px gap)
            bgcolor: 'rgb(146, 0, 32)',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 20px rgba(146, 0, 32, 0.4)',
            transition: 'all 0.3s ease',
            zIndex: 1000,
            '&:hover': {
              bgcolor: 'rgb(114, 0, 21)',
              transform: 'scale(1.1)',
              boxShadow: '0 6px 28px rgba(146, 0, 32, 0.5)'
            }
          }}
        >
          <Add sx={{ fontSize: 28 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: '500px',
            width: '280px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            mt: -1
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'rgba(30, 30, 30, 0.7)' }}>
            Add Section
          </Typography>
        </Box>
        
        {QUICK_MODULES.map((moduleType) => {
          const definition = getModuleDefinition(moduleType);
          const Icon = definition.icon;
          
          return (
            <MenuItem
              key={moduleType}
              onClick={() => handleAddModule(moduleType)}
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                gap: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(146, 0, 32, 0.04)'
                }
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: definition.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon sx={{ fontSize: 18, color: 'white' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'rgb(30, 30, 30)' }}>
                  {definition.label}
                </Typography>
                <Typography sx={{ fontSize: '11px', color: 'rgba(30, 30, 30, 0.5)' }}>
                  {definition.category}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default AddModuleButton;
