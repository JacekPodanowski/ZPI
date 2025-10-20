import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Divider, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { fetchSiteById } from '../../../services/siteService';

const generateSampleSeries = (seed) => {
    const base = Number(String(seed ?? 17).replace(/\D/g, '')) || 17;
    return Array.from({ length: 12 }, (_, index) => {
        const phase = (base * (index + 5)) % 36;
        return Math.round(30 + phase * Math.sin((index + 1) / 2.6));
    });
};

const buildSparklinePath = (data) => {
    if (!Array.isArray(data) || data.length < 2) {
        return '';
    }
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = Math.max(max - min, 1);

    return data
        .map((value, index) => {
            const normalized = (value - min) / range;
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - normalized * 100;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');
};

const HighlightCard = ({ title, value, caption, variant }) => (
    <Box
        sx={{
            borderRadius: 4,
            px: 3,
            py: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            background:
                variant === 'dark'
                    ? 'linear-gradient(135deg, rgba(12,12,12,0.82) 0%, rgba(30,30,30,0.92) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(228,229,218,0.82) 100%)',
            boxShadow:
                variant === 'dark'
                    ? '0 16px 30px rgba(12,12,12,0.32)'
                    : '0 18px 38px rgba(12,12,12,0.16)',
            border: '1px solid rgba(146, 0, 32, 0.18)',
            color: variant === 'dark' ? 'rgb(228,229,218)' : 'text.primary'
        }}
    >
        <Typography variant="caption" sx={{ letterSpacing: 1, opacity: 0.7 }}>
            {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {value}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.75 }}>
            {caption}
        </Typography>
    </Box>
);

HighlightCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    caption: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['light', 'dark'])
};

HighlightCard.defaultProps = {
    variant: 'light'
};

const SiteLabPage = () => {
    const navigate = useNavigate();
    const { siteId } = useParams();
    const [site, setSite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const loadSite = async () => {
            try {
                setLoading(true);
                const response = await fetchSiteById(siteId);
                if (!mounted) {
                    return;
                }
                setSite(response);
                setError(null);
            } catch (err) {
                if (!mounted) {
                    return;
                }
                console.error('Failed to load lab site', err);
                setError('Nie udało się pobrać danych tej witryny lub nie masz do niej dostępu.');
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadSite();
        return () => {
            mounted = false;
        };
    }, [siteId]);

    const analyticsSeries = useMemo(() => generateSampleSeries(site?.id), [site?.id]);
    const sparklinePath = useMemo(() => buildSparklinePath(analyticsSeries), [analyticsSeries]);
    const totalVisits = useMemo(
        () => analyticsSeries.reduce((sum, value) => sum + value, 0),
        [analyticsSeries]
    );
    const peakValue = Math.max(...analyticsSeries, 0);
    const trend = analyticsSeries.length > 1
        ? analyticsSeries[analyticsSeries.length - 1] - analyticsSeries[analyticsSeries.length - 2]
        : 0;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    py: 6
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Problem z dostępem do Laboratorium
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 420, color: 'text.secondary' }}>
                    {error}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button variant="contained" onClick={() => navigate('/studio/sites')}>
                        Wróć do panelu
                    </Button>
                    <Button variant="text" onClick={() => navigate(`/studio/editor/${siteId}`)}>
                        Otwórz edytor
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                py: { xs: 4, md: 6 },
                px: { xs: 1, md: 0 }
            }}
        >
            <Box
                sx={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    position: 'relative',
                    background:
                        'radial-gradient(circle at 10% 20%, rgba(146,0,32,0.36) 0%, rgba(12,12,12,0.92) 55%, rgba(12,12,12,0.88) 100%)',
                    boxShadow: '0 30px 60px rgba(12,12,12,0.45)',
                    color: 'rgb(228,229,218)'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 3, md: 6 },
                        p: { xs: 4, md: 6 },
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.7 }}>
                            LABORATORIUM ANALITYKI
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 600 }}>
                            {site?.name}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.76, maxWidth: 520 }}>
                            Puls witryny na wyciągnięcie ręki. Zobacz trend ruchu, kluczowe wskaźniki i zaplanuj kolejne kroki.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => navigate(`/studio/editor/${site.id}`)}
                                sx={{ fontWeight: 600 }}
                            >
                                Otwórz edytor
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/studio/sites')}
                                sx={{ fontWeight: 600, borderColor: 'rgba(228,229,218,0.4)', color: 'rgb(228,229,218)' }}
                            >
                                Wróć do panelu
                            </Button>
                            <Chip
                                label={site?.is_active ? 'Status: ONLINE' : 'Status: OFFLINE'}
                                sx={{
                                    backgroundColor: site?.is_active
                                        ? 'rgba(74,222,128,0.15)'
                                        : 'rgba(239,68,68,0.18)',
                                    color: site?.is_active ? '#4ade80' : '#ef4444',
                                    fontWeight: 600
                                }}
                            />
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            borderRadius: 4,
                            backdropFilter: 'blur(12px)',
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
                            border: '1px solid rgba(228,229,218,0.18)',
                            boxShadow: '0 20px 35px rgba(12,12,12,0.35)',
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        <Typography variant="caption" sx={{ letterSpacing: 1.2, opacity: 0.7 }}>
                            WYKRES RUCHU · OSTATNIE 12 DNI
                        </Typography>
                        <Box sx={{ flex: 1, minHeight: 180 }}>
                            <svg
                                viewBox="0 0 100 40"
                                preserveAspectRatio="none"
                                style={{ width: '100%', height: '100%' }}
                            >
                                <defs>
                                    <linearGradient id="lab-sparkline" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(146,0,32,0.6)" />
                                        <stop offset="100%" stopColor="rgba(146,0,32,0)" />
                                    </linearGradient>
                                </defs>
                                <polyline
                                    points={sparklinePath}
                                    fill="none"
                                    stroke="rgba(146,0,32,0.85)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Box>
                        <Divider sx={{ borderColor: 'rgba(228,229,218,0.12)' }} />
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.6 }}>SUMA</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>{totalVisits}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.6 }}>SZCZYT</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>{peakValue}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.6 }}>TREND</Typography>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 600, color: trend >= 0 ? '#4ade80' : '#ef4444' }}
                                >
                                    {trend >= 0 ? `+${trend}` : trend}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 80% 10%, rgba(146,0,32,0.45) 0%, transparent 45%)',
                        pointerEvents: 'none'
                    }}
                />
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
                    gap: 3
                }}
            >
                <HighlightCard
                    title="Współczynnik zaangażowania"
                    value={(site?.analytics?.engagement_rate ?? '32.4%')}
                    caption="Odsetek sesji z co najmniej jedną interakcją AI Asystenta."
                />
                <HighlightCard
                    title="Średni czas na stronie"
                    value={(site?.analytics?.avg_time_on_site ?? '04:32')}
                    caption="Średnia sesja wzrosła o 12% w stosunku do ostatniego tygodnia."
                    variant="dark"
                />
                <HighlightCard
                    title="Rezervacje tygodniowo"
                    value={site?.event_count ?? 0}
                    caption="Zsumowane rezerwacje dla wszystkich typów wydarzeń."
                />
            </Box>

            <Box
                sx={{
                    borderRadius: 4,
                    p: { xs: 3, md: 4 },
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(228,229,218,0.85) 100%)',
                    border: '1px solid rgba(146, 0, 32, 0.12)',
                    boxShadow: '0 20px 40px rgba(12,12,12,0.15)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3
                }}
            >
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Laboratorium danej witryny
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 520 }}>
                        Tutaj wkrótce pojawią się szczegółowe moduły AI z rekomendacjami zmian w treści, kolorystyce i strukturze. System przeanalizuje historię publikacji oraz zachowania użytkowników, aby zaproponować kolejne kroki optymalizacji.
                    </Typography>
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        borderRadius: 3,
                        p: 3,
                        background: 'rgba(12,12,12,0.85)',
                        color: 'rgb(228,229,218)',
                        border: '1px solid rgba(146, 0, 32, 0.18)',
                        boxShadow: '0 18px 35px rgba(12,12,12,0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Wkrótce dostępne
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                        • Scoring jakości bloków treści
                        <br />• Alerty o spadku wydajności modułów
                        <br />• Eksperymenty A/B z jednym kliknięciem
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ alignSelf: 'flex-start', mt: 1 }}
                        onClick={() => navigate(`/studio/editor/${site?.id}`)}
                    >
                        Rozpocznij eksperyment
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default SiteLabPage;
