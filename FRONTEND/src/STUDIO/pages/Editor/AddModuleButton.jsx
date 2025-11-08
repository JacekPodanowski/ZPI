import React, { useState } from 'react';
import { Box, Button, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
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

const AddModuleButton = ({
  positioning = 'fixed',
  variant = 'floating',
  insertIndex = null,
  buttonSx = {},
  label = 'Add Section'
}) => {
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
      }, insertIndex);
    }
    handleClose();
  };

  if (!page) return null;

  const isFloating = variant === 'floating';

  const menuAnchorOrigin = isFloating
    ? { vertical: 'top', horizontal: 'right' }
    : { vertical: 'bottom', horizontal: 'center' };

  const menuTransformOrigin = isFloating
    ? { vertical: 'bottom', horizontal: 'left' }
    : { vertical: 'top', horizontal: 'center' };

  return (
    <>
      {isFloating ? (
        <Tooltip title="Add Section" placement="right">
          <IconButton
            onClick={handleClick}
            sx={[
              {
                position: positioning,
                bottom: { xs: 24, md: 32 },
                left: { xs: 16, md: 32 },
                bgcolor: 'rgb(146, 0, 32)',
                color: 'white',
                width: { xs: 52, md: 56 },
                height: { xs: 52, md: 56 },
                boxShadow: '0 2px 12px rgba(146, 0, 32, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1000,
                '&:hover': {
                  bgcolor: 'rgb(114, 0, 21)',
                  transform: 'scale(1.08)',
                  boxShadow: '0 4px 20px rgba(146, 0, 32, 0.4)'
                },
                '&:active': {
                  transform: 'scale(0.95)'
                }
              },
              buttonSx
            ]}
          >
            <Add sx={{ fontSize: { xs: 26, md: 28 } }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Box sx={{ width: '100%', px: { xs: 1.25, sm: 1.75, md: 2 } }}>
          <Button
            onClick={handleClick}
            startIcon={<Add sx={{ fontSize: { xs: 18, md: 20 } }} />}
            fullWidth
            sx={[
              {
                mt: { xs: 1.1, md: 1.75 },
                mb: { xs: 1.1, md: 1.75 },
                py: { xs: 1, md: 1.35 },
                borderRadius: { xs: '12px', md: '14px' },
                border: '1px dashed rgba(146, 0, 32, 0.35)',
                bgcolor: 'rgba(146, 0, 32, 0.06)',
                color: 'rgb(146, 0, 32)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '13px', md: '14px' },
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 0.75, md: 1 },
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'rgba(146, 0, 32, 0.12)',
                  borderColor: 'rgba(146, 0, 32, 0.5)'
                },
                '&:active': {
                  transform: 'scale(0.98)'
                }
              },
              buttonSx
            ]}
          >
            {label}
          </Button>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={menuAnchorOrigin}
        transformOrigin={menuTransformOrigin}
        PaperProps={{
          sx: {
            maxHeight: '70vh',
            width: isFloating ? '280px' : 'min(320px, 92vw)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            overflowY: 'auto'
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
