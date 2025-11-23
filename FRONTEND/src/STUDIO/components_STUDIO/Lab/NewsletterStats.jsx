import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid, Paper } from '@mui/material';
import { Email, Visibility, TouchApp, TrendingUp, People, Schedule } from '@mui/icons-material';
import apiClient from '../../../services/apiClient';

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => (
    <Paper
        sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(228,229,218,0.7) 100%)',
            border: '1px solid rgba(146, 0, 32, 0.12)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
            }
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: color === 'primary' 
                        ? 'linear-gradient(135deg, rgba(146,0,32,0.15) 0%, rgba(146,0,32,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(74,222,128,0.15) 0%, rgba(74,222,128,0.05) 100%)',
                }}
            >
                <Icon sx={{ color: color === 'primary' ? 'rgb(146, 0, 32)' : '#4ade80', fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'rgb(30, 30, 30)' }}>
                    {value}
                </Typography>
            </Box>
        </Box>
        {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                {subtitle}
            </Typography>
        )}
    </Paper>
);

const NewsletterStats = ({ siteId }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/newsletter/stats/${siteId}/`);
                setStats(response.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch newsletter stats:', err);
                setError('Nie udało się pobrać statystyk newslettera');
            } finally {
                setLoading(false);
            }
        };

        if (siteId) {
            fetchStats();
        }
    }, [siteId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
                {error}
            </Alert>
        );
    }

    if (!stats || stats.subscribers.total === 0) {
        return (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
                Brak subskrybentów newslettera. Dodaj moduł Wydarzenia do strony i włącz formularz zapisu na newsletter.
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header */}
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    📊 Newsletter Analytics
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Statystyki zaangażowania subskrybentów newslettera wydarzeń
                </Typography>
            </Box>

            {/* Subscribers Overview */}
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ color: 'rgb(146, 0, 32)' }} />
                    Subskrybenci
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <StatCard
                            icon={People}
                            title="Aktywni subskrybenci"
                            value={stats.subscribers.active}
                            subtitle={`${stats.subscribers.total} łącznie`}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <StatCard
                            icon={Schedule}
                            title="Oczekuje potwierdzenia"
                            value={stats.subscribers.pending_confirmation}
                            subtitle="Jeszcze nie potwierdzili emaila"
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* All-Time Stats */}
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp sx={{ color: 'rgb(146, 0, 32)' }} />
                    Statystyki wszystkich czasów
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <StatCard
                            icon={Email}
                            title="Wysłane emaile"
                            value={stats.all_time.emails_sent}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard
                            icon={Visibility}
                            title="Otwarte"
                            value={stats.all_time.emails_opened}
                            subtitle={`${stats.all_time.open_rate}% open rate`}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard
                            icon={TouchApp}
                            title="Kliknięcia"
                            value={stats.all_time.emails_clicked}
                            subtitle={`${stats.all_time.click_rate}% click rate`}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard
                            icon={TrendingUp}
                            title="Click-to-Open"
                            value={`${stats.all_time.click_to_open_rate}%`}
                            subtitle="Procent otwartych, które kliknięto"
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Last 30 Days Stats */}
            {stats.last_30_days.emails_sent > 0 && (
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        📈 Ostatnie 30 dni
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <StatCard
                                icon={Email}
                                title="Wysłane"
                                value={stats.last_30_days.emails_sent}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatCard
                                icon={Visibility}
                                title="Open Rate"
                                value={`${stats.last_30_days.open_rate}%`}
                                subtitle={`${stats.last_30_days.emails_opened} otwartych`}
                                color="success"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatCard
                                icon={TouchApp}
                                title="Click Rate"
                                value={`${stats.last_30_days.click_rate}%`}
                                subtitle={`${stats.last_30_days.emails_clicked} kliknięć`}
                                color="success"
                            />
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Top Subscribers */}
            {stats.top_subscribers && stats.top_subscribers.length > 0 && (
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        🏆 Najbardziej zaangażowani subskrybenci
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {stats.top_subscribers.map((subscriber, index) => (
                            <Paper
                                key={index}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.6)',
                                    border: '1px solid rgba(146, 0, 32, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(146,0,32,0.2), rgba(146,0,32,0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        color: 'rgb(146, 0, 32)'
                                    }}
                                >
                                    {index + 1}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {subscriber.email}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {subscriber.emails_sent} wysłanych · {subscriber.open_rate.toFixed(1)}% open rate · {subscriber.click_rate.toFixed(1)}% click rate
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default NewsletterStats;
