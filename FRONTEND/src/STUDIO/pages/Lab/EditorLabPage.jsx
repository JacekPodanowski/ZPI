import React from 'react';
import { Box, Container, Typography, Button, Stack, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Edit, ViewColumn, Palette } from '@mui/icons-material';

const EditorLabPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'rgb(228, 229, 218)',
        py: 6
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: 'rgb(30, 30, 30)',
            mb: 1,
            textAlign: 'center'
          }}
        >
          Editor Lab
        </Typography>
        <Typography
          sx={{
            color: 'rgba(30, 30, 30, 0.6)',
            textAlign: 'center',
            mb: 6
          }}
        >
          Test the new editor architecture
        </Typography>

        <Stack spacing={3}>
          <Paper
            sx={{
              p: 4,
              borderRadius: '16px',
              border: '1px solid rgba(30, 30, 30, 0.06)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: 'rgb(146, 0, 32)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ViewColumn sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Structure Mode
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visual site architecture editor
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ mb: 3, color: 'rgba(30, 30, 30, 0.7)' }}>
              Drag-and-drop interface for building site structure. Add pages, set entry points, 
              and organize modules with smooth animations.
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 2, fontWeight: 600, color: 'rgb(146, 0, 32)' }}>
              ⭐ This is now the default editor for all sites
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/studio/editor/new')}
              sx={{
                bgcolor: 'rgb(146, 0, 32)',
                '&:hover': {
                  bgcolor: 'rgb(114, 0, 21)'
                }
              }}
            >
              Open Structure Mode
            </Button>
          </Paper>

          <Paper
            sx={{
              p: 4,
              borderRadius: '16px',
              border: '1px solid rgba(30, 30, 30, 0.06)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: '#4ECDC4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Edit sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Detail Mode
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visual content editor with live preview
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ mb: 3, color: 'rgba(30, 30, 30, 0.7)' }}>
              Edit module content in real-time with section navigator, canvas preview, 
              and properties panel. Switch between desktop and mobile views.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Click on a page card in Structure Mode to access Detail Mode
            </Typography>
          </Paper>

          <Paper
            sx={{
              p: 4,
              borderRadius: '16px',
              border: '1px solid rgba(30, 30, 30, 0.06)',
              bgcolor: 'rgba(30, 30, 30, 0.02)'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: 'rgba(30, 30, 30, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Palette sx={{ color: 'rgba(30, 30, 30, 0.5)' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Features Implemented
                </Typography>
              </Box>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                ✅ State management with Zustand
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Structure Mode with page cards & drag-drop
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Module toolbar with 8 module types
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Detail Mode with 3-panel layout
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Section navigator & properties panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Hero, About, Contact module renderers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Device preview (desktop/mobile)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Real-time content editing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Ethereal minimalism design system
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default EditorLabPage;
