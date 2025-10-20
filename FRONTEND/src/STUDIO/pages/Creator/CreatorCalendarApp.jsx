import React, { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { fetchSites } from '../../../services/siteService';
import CalendarGridControlled from '../../components/Dashboard/Calendar/CalendarGridControlled';
import RealTemplateBrowser from '../../components/Dashboard/Templates/RealTemplateBrowser';
import DayDetailsModal from '../../components/Dashboard/Calendar/DayDetailsModal';
import { getSiteColorHex } from '../../../theme/siteColors';

const CreatorCalendarApp = () => {
    const [sites, setSites] = useState([]);
    const [events, setEvents] = useState([]);
    const [availabilityBlocks, setAvailabilityBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSiteId, setSelectedSiteId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

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
                    response.forEach((site) => {
                        // Use the same color system as calendar buttons
                        const siteColor = getSiteColorHex(site.color_index ?? 0);
                        
                        for (let i = 0; i < 5; i++) {
                            const date = new Date();
                            date.setDate(date.getDate() + Math.floor(Math.random() * 30));
                            mockEvents.push({
                                id: `${site.id}-event-${i}`,
                                site_id: site.id,
                                site_color: siteColor,
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
        console.log('(DEBUGLOG) CreatorCalendarApp.dayClick', { date, selectedSiteId });
        setSelectedDate(date);
        setModalOpen(true);
    };

    const handleSiteSelect = (siteId) => {
        console.log('(DEBUGLOG) CreatorCalendarApp.siteSelect', { siteId });
        setSelectedSiteId(siteId);
    };

    const handleCreateEvent = (eventData) => {
        console.log('Create event:', eventData);
        // TODO: Call API to create event
        // For now, just add to local state
        const newEvent = {
            id: `event-${Date.now()}`,
            ...eventData,
            site_id: selectedSiteId || sites[0]?.id,
            site_color: sites.find(s => s.id === (selectedSiteId || sites[0]?.id))?.color_tag
        };
        setEvents([...events, newEvent]);
    };

    const handleCreateAvailability = (availabilityData) => {
        console.log('Create availability:', availabilityData);
        // TODO: Call API to create availability block
        // For now, just add to local state
        const newBlock = {
            id: `availability-${Date.now()}`,
            ...availabilityData,
            site_id: selectedSiteId || sites[0]?.id
        };
        setAvailabilityBlocks([...availabilityBlocks, newBlock]);
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
                        py: 0,
                        gap: 0,
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
                        <CalendarGridControlled
                            events={events}
                            sites={sites}
                            selectedSiteId={selectedSiteId}
                            currentMonth={currentMonth}
                            onDayClick={handleDayClick}
                            onMonthChange={setCurrentMonth}
                            onSiteSelect={handleSiteSelect}
                        />
                    </motion.div>
                </Box>
            </Box>

            <DayDetailsModal
                open={modalOpen}
                date={selectedDate}
                events={events}
                availabilityBlocks={availabilityBlocks}
                sites={sites}
                onClose={() => setModalOpen(false)}
                onCreateEvent={handleCreateEvent}
                onCreateAvailability={handleCreateAvailability}
            />
        </Box>
    );
};

export default CreatorCalendarApp;
