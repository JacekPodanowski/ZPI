import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Settings } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import { STYLE_LIST } from '../../../SITES/styles';
import useTheme from '../../../theme/useTheme';
import getEditorColorTokens from '../../../theme/editorColorTokens';

const SiteSettingsDrawer = () => {
  const [open, setOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const { site, setStyleId } = useNewEditorStore();
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const accentColor = editorColors.interactive.main;

  const currentStyleId = site?.styleId || 'auroraMinimal';

  const handleStyleChange = (event) => {
    const newStyleId = event.target.value;
    setStyleId(newStyleId);
  };

  const handleToggle = () => {
    const newRotation = open ? rotation - 720 : rotation + 720;
    setRotation(newRotation);
    setOpen(!open);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Settings Panel */}
      {open && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            minWidth: 200,
            maxWidth: 280,
            borderRadius: '18px',
            backgroundColor: editorColors.surfaces.base,
            border: `1px solid ${alpha(accentColor, 0.12)}`,
            boxShadow: `0 24px 48px ${alpha('#000', theme.palette.mode === 'dark' ? 0.6 : 0.18)}`,
            zIndex: 999,
            animation: 'fadeIn 0.3s ease',
            '@keyframes fadeIn': {
              from: {
                opacity: 0,
                transform: 'translateY(-10px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Stack spacing={1.5} sx={{ p: 1.5 }}>
            {/* Header with Title and Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: -1
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  color: editorColors.interactive.main,
                  fontWeight: 600
                }}
              >
                Site Settings
              </Typography>
              
              {/* Empty space for alignment - icon is positioned absolutely */}
              <Box sx={{ width: 40 }} />
            </Box>

            <Divider sx={{ borderColor: alpha(editorColors.text.secondary || '#000', 0.2) }} />

            <FormControl fullWidth size="small">
              <InputLabel
                sx={{
                  color: editorColors.text.secondary,
                  '&.Mui-focused': {
                    color: editorColors.interactive.main
                  }
                }}
              >
                Site Style
              </InputLabel>
              <Select
                value={currentStyleId}
                onChange={handleStyleChange}
                label="Site Style"
                sx={{
                  color: editorColors.text.primary,
                  bgcolor: editorColors.backgrounds.canvas,
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(editorColors.borders.subtle, 0.5)
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: editorColors.interactive.main
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: editorColors.interactive.main
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
                {STYLE_LIST.map((style) => (
                  <MenuItem key={style.id} value={style.id}>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: editorColors.text.primary
                        }}
                      >
                        {style.name}
                      </Typography>
                      {style.description && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: editorColors.text.secondary,
                            display: 'block',
                            mt: 0.25
                          }}
                        >
                          {style.description}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography
              variant="caption"
              sx={{
                color: editorColors.text.hint,
                fontStyle: 'italic',
                textAlign: 'center'
              }}
            >
              More settings coming soon...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Settings Icon Button - Always visible in same position */}
      <IconButton
        onClick={handleToggle}
        sx={{
          position: 'relative',
          top: 1,
          zIndex: 1000,
          color: editorColors.text.primary,
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            color: editorColors.interactive.main
          }
        }}
      >
        <Settings sx={{ fontSize: 22 }} />
      </IconButton>
    </Box>
  );
};

export default SiteSettingsDrawer;
