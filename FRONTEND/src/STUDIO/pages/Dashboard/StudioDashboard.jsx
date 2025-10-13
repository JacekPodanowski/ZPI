import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Container,
    Grid,
    Skeleton,
    Stack,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchSites } from '../../../services/siteService';

const formatDate = (value) => {
    if (!value) {
        return 'Brak danych';
    }

    try {
        return new Intl.DateTimeFormat('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(value));
    } catch (error) {
        return value;
    }
};

const SitePreview = ({ site }) => {
    const config = site?.template_config || {};
    const heroModule = config?.pages?.home?.modules?.find((module) => module.id === 'hero');

    const backgroundColor = heroModule?.config?.bgColor || 'rgba(228, 229, 218, 0.8)';
    const textColor = heroModule?.config?.textColor || 'rgb(30, 30, 30)';
    const title = heroModule?.config?.title || site.name;
    const subtitle = heroModule?.config?.subtitle || 'Podgląd Twojej strony';

    return (
        <Box
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(70, 70, 68, 0.16)',
                backgroundColor,
                height: 180,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                p: 3,
                gap: 1,
                position: 'relative'
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(12, 12, 12, 0) 0%, rgba(12, 12, 12, 0.12) 100%)'
                }}
            />
            <Typography variant="caption" sx={{ color: textColor, position: 'relative' }}>
                {site.identifier || 'podglad-szablonu'}
            </Typography>
            <Typography variant="h5" sx={{ color: textColor, fontWeight: 600, position: 'relative' }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ color: textColor, opacity: 0.75, position: 'relative' }}>
                {subtitle}
            </Typography>
        </Box>
    );
};

const StudioDashboard = () => {
    const navigate = useNavigate();
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                setLoading(true);
                const response = await fetchSites();
                if (active) {
                    setSites(response);
                }
            } catch (err) {
                if (active) {
                    setError('Nie udało się pobrać listy stron. Spróbuj ponownie później.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        load();
        return () => {
            active = false;
        };
    }, []);

    const availableSlots = useMemo(() => Math.max(0, 3 - sites.length), [sites.length]);

    return (
        <Container maxWidth="lg">
            <Stack spacing={4}>
                <Box>
                    <Typography variant="overline" sx={{ letterSpacing: 2, color: 'secondary.main' }}>
                        STUDIO
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        Zarządzaj swoimi stronami
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                        W jednym miejscu podejrzysz wszystkie projekty, uruchomisz edytor i opublikujesz nowe wersje.
                    </Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                    <Button variant="contained" size="large" onClick={() => navigate('/studio/new')}>
                        + Stwórz nową stronę
                    </Button>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Możesz posiadać maksymalnie trzy aktywne strony. Pozostało miejsc: {availableSlots}
                    </Typography>
                </Stack>

                <Grid container spacing={3}>
                    {loading
                        ? Array.from({ length: 3 }).map((_, index) => (
                              <Grid item xs={12} md={4} key={`skeleton-${index}`}>
                                  <Card sx={{ borderRadius: 4, border: '1px solid rgba(160, 0, 22, 0.08)' }}>
                                      <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 4, m: 2 }} />
                                      <CardContent>
                                          <Skeleton width="60%" />
                                          <Skeleton width="40%" />
                                      </CardContent>
                                  </Card>
                              </Grid>
                          ))
                        : sites.map((site, index) => (
                              <Grid item xs={12} md={4} key={site.id}>
                                  <motion.div
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                  >
                                      <Card
                                          elevation={0}
                                          sx={{
                                              borderRadius: 4,
                                              border: '1px solid rgba(160, 0, 22, 0.14)',
                                              overflow: 'hidden'
                                          }}
                                      >
                                          <CardActionArea onClick={() => navigate(`/studio/editor/${site.id}`)}>
                                              <SitePreview site={site} />
                                          </CardActionArea>
                                          <CardContent>
                                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                  {site.name}
                                              </Typography>
                                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                  Ostatnia aktualizacja: {formatDate(site.updated_at)}
                                              </Typography>
                                          </CardContent>
                                      </Card>
                                  </motion.div>
                              </Grid>
                          ))}
                </Grid>

                {!loading && sites.length === 0 && !error && (
                    <Stack
                        spacing={2}
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            border: '1px dashed rgba(160, 0, 22, 0.24)',
                            borderRadius: 4,
                            py: 6,
                            px: 4,
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Nie masz jeszcze żadnych stron
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
                            Rozpocznij od wyboru szablonu i konfiguracji modułów. Proces zajmie dosłownie kilka minut.
                        </Typography>
                        <Button variant="outlined" onClick={() => navigate('/studio/new')}>
                            Startuj z pierwszym projektem
                        </Button>
                    </Stack>
                )}
            </Stack>
        </Container>
    );
};

export default StudioDashboard;
