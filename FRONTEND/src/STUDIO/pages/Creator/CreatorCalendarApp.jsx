import React, { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { fetchSites } from '../../../services/siteService';
import CalendarGrid from '../../components/Dashboard/Calendar/CalendarGrid';
import RealTemplateBrowser from '../../components/Dashboard/Templates/RealTemplateBrowser';

const CreatorCalendarApp = () => {
    const [sites, setSites] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    }, []);

    const handleDayClick = (date) => {
        console.log('Day clicked:', date);
        // TODO: Open day detail modal
    };

    const handleCreateDayTemplate = () => {
        console.log('Create day template');
        // TODO: Implement day template creation
    };

    const handleCreateWeekTemplate = () => {
        console.log('Create week template');
        // TODO: Implement week template creation
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
                <RealTemplateBrowser
                    onCreateDayTemplate={handleCreateDayTemplate}
                    onCreateWeekTemplate={handleCreateWeekTemplate}
                />

                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        px: { xs: 2, md: 3, lg: 4 },
                        py: { xs: 0.5, md: 1.25 },
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

                    <motion.div
                        style={{
                            flex: 1,
                            minWidth: 0,
                            minHeight: 0,
                            display: 'flex'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <CalendarGrid
                            events={events}
                            sites={sites}
                            onDayClick={handleDayClick}
                            forceExtendedMode={true}
                        />
                    </motion.div>
                </Box>
            </Box>
        </Box>
    );
};

export default CreatorCalendarApp;
