import React, { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import useDashboardStore from '../../store/dashboardStore';
import { fetchSites } from '../../../services/siteService';
import SiteSelector from '../../components/Dashboard/SiteSelector';
import CalendarGrid from '../../components/Dashboard/Calendar/CalendarGrid';
import TemplateLibrary from '../../components/Dashboard/Templates/TemplateLibrary';

const StudioDashboard = () => {
    const {
        sites,
        events,
        setSites,
        setEvents,
        initialize,
        isTransitioning,
        mode
    } = useDashboardStore((state) => ({
        sites: state.sites,
        events: state.events,
        setSites: state.setSites,
        setEvents: state.setEvents,
        initialize: state.initialize,
        isTransitioning: state.isTransitioning,
        mode: state.mode
    }));

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize dashboard on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Fetch sites from API
    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                setLoading(true);
                const response = await fetchSites();
                if (active) {
                    setSites(response);
                    
                    // Mock events for demonstration
                    // TODO: Replace with actual API call
                    const mockEvents = [];
                    response.forEach((site, siteIndex) => {
                        for (let i = 0; i < 5; i++) {
                            const date = new Date();
                            date.setDate(date.getDate() + Math.floor(Math.random() * 30));
                            mockEvents.push({
                                id: `${site.id}-event-${i}`,
                                site_id: site.id,
                                site_color: site.color_tag || `hsl(${siteIndex * 60}, 70%, 50%)`,
                                date: date.toISOString().split('T')[0],
                                title: `Event ${i + 1}`,
                                start_time: `${9 + i}:00`,
                                event_type: i % 2 === 0 ? 'individual' : 'group',
                                max_capacity: 12,
                                current_capacity: Math.floor(Math.random() * 12)
                            });
                        }
                    });
                    setEvents(mockEvents);
                }
            } catch (err) {
                if (active) {
                    console.error('Error loading sites:', err);
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
    }, [setSites, setEvents]);

    const handleDayClick = (date) => {
        console.log('Day clicked:', date);
        // TODO: Open day detail modal
    };

    if (loading) {
        return (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                backgroundColor: 'background.default'
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    minHeight: 0,
                    overflow: 'hidden'
                }}
            >
                <TemplateLibrary />

                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        px: { xs: 2, md: 3, lg: 4 },
                        py: { xs: 2, md: 3 },
                        gap: 2,
                        minHeight: 0,
                        overflow: 'hidden'
                    }}
                >
                    {error ? (
                        <Alert severity="error" sx={{ flexShrink: 0 }}>
                            {error}
                        </Alert>
                    ) : null}

                    {mode === 'site-focus' ? (
                        <SiteSelector sites={sites} />
                    ) : null}

                    <motion.div
                        style={{
                            flex: 1,
                            minWidth: 0,
                            minHeight: 0,
                            display: 'flex'
                        }}
                        animate={{ opacity: isTransitioning ? 0.7 : 1 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <CalendarGrid
                            events={events}
                            sites={sites}
                            onDayClick={handleDayClick}
                        />
                    </motion.div>
                </Box>
            </Box>
        </Box>
    );
};

export default StudioDashboard;
