// File: FRONTEND/src/SITES/pages/SiteListPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import REAL_DefaultLayout from '../../STUDIO/layouts/REAL_DefaultLayout';

const SiteListPage = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await apiClient.get('/public-sites/');
        setSites(response.data);
      } catch (err) {
        setError('Nie udało się załadować listy stron.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  if (loading) {
    return (
      <REAL_DefaultLayout title="Dostępne strony" subtitle="Lista wszystkich publicznych stron w systemie">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </REAL_DefaultLayout>
    );
  }

  if (error) {
    return (
      <REAL_DefaultLayout title="Dostępne strony" subtitle="Lista wszystkich publicznych stron w systemie">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </REAL_DefaultLayout>
    );
  }

  return (
    <REAL_DefaultLayout 
      title="Dostępne strony" 
      subtitle="Lista wszystkich publicznych stron w systemie"
    >
      {sites.length === 0 ? (
        <Box sx={{ 
          p: 6, 
          textAlign: 'center', 
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <Typography color="text.secondary">Brak dostępnych stron</Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {sites.map((site, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={site.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ height: '100%' }}
              >
                <Card
                  component={Link}
                  to={`/viewer/${site.identifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: 200,
                    maxWidth: 320,
                    mx: 'auto',
                    textDecoration: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: 4,
                    border: '3px solid',
                    borderColor: (theme) => theme.palette.mode === 'light'
                      ? 'rgba(146, 0, 32, 0.15)'
                      : 'rgba(114, 0, 21, 0.3)',
                    boxShadow: (theme) => theme.palette.mode === 'light'
                      ? '0 6px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)'
                      : '0 6px 24px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4)',
                    background: (theme) => theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(252, 252, 252, 1) 100%)'
                      : 'linear-gradient(135deg, rgba(35, 35, 35, 1) 0%, rgba(25, 25, 25, 1) 100%)',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: (theme) => theme.palette.mode === 'light'
                        ? '0 20px 60px rgba(146, 0, 32, 0.25), 0 8px 30px rgba(0, 0, 0, 0.15)'
                        : '0 20px 60px rgba(114, 0, 21, 0.5), 0 8px 30px rgba(0, 0, 0, 0.5)',
                      borderColor: 'primary.main',
                      '& .site-name': {
                        color: 'primary.main',
                        transform: 'scale(1.05)'
                      }
                    }
                  }}
                >
                  <CardContent sx={{ 
                    p: 3.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    flex: 1
                  }}>
                    <Typography 
                      className="site-name"
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        mb: 1.5,
                        color: 'text.primary',
                        transition: 'all 0.3s ease',
                        wordBreak: 'break-word'
                      }}
                    >
                      {site.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        mb: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        wordBreak: 'break-all'
                      }}
                    >
                      {site.identifier}
                    </Typography>
                    {site.owner && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.disabled',
                          fontStyle: 'italic',
                          fontSize: '0.75rem',
                          mt: 'auto',
                          wordBreak: 'break-word'
                        }}
                      >
                        {site.owner.email}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </REAL_DefaultLayout>
  );
};

export default SiteListPage;
