import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Link, CircularProgress, Stack, Divider } from '@mui/material';
import { MenuBook, Gavel, Shield } from '@mui/icons-material';
import apiClient from '../../../services/apiClient';
import useTheme from '../../../theme/useTheme';
import Navigation from '../../../components/Navigation/Navigation';

const InfoPage = () => {
  const theme = useTheme();
  const [termsVersion, setTermsVersion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTermsVersion = async () => {
      try {
        const response = await apiClient.get('/terms/latest/');
        setTermsVersion(response.data.version);
      } catch (error) {
        console.error('Failed to fetch terms version:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsVersion();
  }, []);

  const infoSections = [
    {
      icon: (
        <Box
          sx={{
            fontSize: 48,
            fontWeight: 700,
            color: theme.palette.primary.main,
            fontFamily: 'Georgia, serif'
          }}
        >
          §
        </Box>
      ),
      title: 'Regulamin',
      description: 'Zasady korzystania z platformy YourEasySite',
      link: '/terms'
    },
    {
      icon: <Shield sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Polityka Prywatności',
      description: 'Informacje o przetwarzaniu danych osobowych',
      link: '/policy'
    },
    {
      icon: <MenuBook sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Poradnik',
      description: 'Przewodnik użytkownika i dokumentacja techniczna',
      link: '/guide'
    }
  ];

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
      <Container maxWidth="lg">
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
              Informacje
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.mode === 'dark' ? 'rgb(188, 186, 179)' : 'rgb(70, 70, 68)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Dokumenty prawne i informacje o platformie YourEasySite
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : (
            <Stack spacing={3}>
              {infoSections.map((section, index) => (
                <Paper
                  key={index}
                  elevation={3}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                  component={Link}
                  href={section.link}
                  underline="none"
                >
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box>{section.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)'
                        }}
                      >
                        {section.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.mode === 'dark' ? 'rgb(188, 186, 179)' : 'rgb(70, 70, 68)'
                        }}
                      >
                        {section.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}

          <Box sx={{ textAlign: 'center', pt: 4 }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.mode === 'dark' ? 'rgb(188, 186, 179)' : 'rgb(70, 70, 68)'
              }}
            >
              W razie pytań skontaktuj się z nami:{' '}
              <Link
                href="mailto:support@youreasysite.com"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                support@youreasysite.com
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
    </>
  );
};

export default InfoPage;
