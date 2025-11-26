import React from 'react';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import useTheme from '../../../theme/useTheme';
import Navigation from '../../../components/Navigation/Navigation';

const GuidePage = () => {
  const theme = useTheme();

  return (
    <>
      <Navigation />
      <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.mode === 'dark' ? 'rgb(12, 12, 12)' : 'rgb(228, 229, 218)',
        py: 8
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)'
              }}
            >
              Poradnik
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.mode === 'dark' ? 'rgb(188, 186, 179)' : 'rgb(70, 70, 68)'
              }}
            >
              Przewodnik użytkownika platformy YourEasySite
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3
            }}
          >
            <Stack spacing={3}>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)',
                  lineHeight: 1.8
                }}
              >
                Poradnik użytkownika będzie dostępny wkrótce.
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
    </>
  );
};

export default GuidePage;
