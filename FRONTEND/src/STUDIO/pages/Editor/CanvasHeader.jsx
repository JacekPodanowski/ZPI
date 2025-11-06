import React from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import useNewEditorStore from '../../store/newEditorStore';
import useTheme from '../../../theme/useTheme';

const CanvasHeader = ({ activePageId, onNavigate }) => {
  const { site, siteName } = useNewEditorStore();
  const theme = useTheme();

  const pages = site?.pages || [];
  if (!pages.length) {
    return null;
  }

  const logoLetter = siteName?.trim()?.charAt(0)?.toUpperCase() || 'S';

  return (
    <Box
      sx={{
        width: '100%',
        px: 4,
        pt: 3,
        pb: 1.5,
        pointerEvents: 'all'
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              display: 'grid',
              placeItems: 'center',
              bgcolor: theme.colors?.surface?.raised || 'rgba(255,255,255,0.8)',
              color: theme.colors?.primary?.base || 'rgb(146, 0, 32)',
              fontWeight: 700,
              fontSize: '18px',
              textTransform: 'uppercase'
            }}
          >
            {logoLetter}
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: theme.colors?.text?.muted || 'rgba(30,30,30,0.5)'
              }}
            >
              Studio Preview
            </Typography>
            <Typography
              sx={{
                fontSize: '18px',
                fontWeight: 600,
                color: theme.colors?.text?.base || 'rgb(30, 30, 30)'
              }}
            >
              {siteName || 'Untitled Site'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
          {pages.map((page) => (
            <Button
              key={page.id}
              size="small"
              onClick={() => onNavigate && onNavigate(page.id)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: '999px',
                px: 2.5,
                py: 0.75,
                color:
                  activePageId === page.id
                    ? theme.colors?.primary?.contrastText || '#fff'
                    : theme.colors?.text?.muted || 'rgba(30, 30, 30, 0.6)',
                bgcolor:
                  activePageId === page.id
                    ? theme.colors?.primary?.base || 'rgb(146, 0, 32)'
                    : 'rgba(255, 255, 255, 0.7)',
                border: `1px solid ${
                  activePageId === page.id
                    ? theme.colors?.primary?.base || 'rgb(146, 0, 32)'
                    : 'rgba(30, 30, 30, 0.12)'
                }`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor:
                    activePageId === page.id
                      ? theme.colors?.primary?.hover || 'rgb(114, 0, 21)'
                      : 'rgba(255, 255, 255, 0.95)',
                  borderColor: theme.colors?.primary?.base || 'rgb(146, 0, 32)',
                  color: theme.colors?.primary?.base || 'rgb(146, 0, 32)'
                }
              }}
            >
              {page.name || 'Page'}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default CanvasHeader;
