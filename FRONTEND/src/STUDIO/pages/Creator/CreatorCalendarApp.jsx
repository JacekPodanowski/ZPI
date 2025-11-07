import React, { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import moment from 'moment';
import { fetchSites } from '../../../services/siteService';
import { fetchEvents, createEvent, fetchAvailabilityBlocks, createAvailabilityBlock, deleteEvent } from '../../../services/eventService';
import CalendarGridControlled from '../../components_STUDIO/Dashboard/Calendar/CalendarGridControlled';
import RealTemplateBrowser from '../../components_STUDIO/Dashboard/Templates/RealTemplateBrowser';
import DayDetailsModal from '../../components_STUDIO/Dashboard/Calendar/DayDetailsModal';
import { getSiteColorHex } from '../../../theme/siteColors';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { getCache, setCache, removeCache, CACHE_KEYS } from '../../../utils/cache';
import { useAuth } from '../../../contexts/AuthContext';

const CreatorCalendarApp = () => {
    const { calendar, updateCalendarPreferences } = usePreferences();
    const { user } = useAuth();
    const [sites, setSites] = useState([]);
    const [events, setEvents] = useState([]);
    const [availabilityBlocks, setAvailabilityBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSiteId, setSelectedSiteId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [draggingTemplate, setDraggingTemplate] = useState(null);
    
    // Get operating hours directly from preferences
    const operatingStartHour = calendar?.operating_start_hour ?? '06:00';
    const operatingEndHour = calendar?.operating_end_hour ?? '22:00';
    
    // Handlers that update preferences
    const handleOperatingStartHourChange = (newHour) => {
        updateCalendarPreferences({ operating_start_hour: newHour });
    };
    
    const handleOperatingEndHourChange = (newHour) => {
        updateCalendarPreferences({ operating_end_hour: newHour });
    };

    // Fetch sites and events from API
    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                // Try loading from cache first for instant display
                const userId = user?.id;
                const cachedSites = userId ? getCache(`${CACHE_KEYS.SITES}_${userId}`) : null;
                const cachedEvents = userId ? getCache(`${CACHE_KEYS.EVENTS}_${userId}`) : null;
                const cachedAvailability = userId ? getCache(`${CACHE_KEYS.AVAILABILITY_BLOCKS}_${userId}`) : null;
                
                if (cachedSites && cachedEvents) {
                    // Show cached data immediately
                    setSites(cachedSites);
                    setEvents(cachedEvents);
                    if (cachedAvailability) {
                        setAvailabilityBlocks(cachedAvailability);
                    }
                    setLoading(false);
                }
                
                // Fetch fresh data in background
                const sitesResponse = await fetchSites();
                if (active) {
                    setSites(sitesResponse);
                    if (userId) {
                        setCache(`${CACHE_KEYS.SITES}_${userId}`, sitesResponse, 1000 * 60 * 5); // 5 min cache
                    }
                    
                    // Fetch events for all sites
                    const eventsResponse = await fetchEvents();
                    if (active) {
                        // Transform events to include site colors
                        const transformedEvents = eventsResponse.map(event => ({
                            ...event,
                            site_color: getSiteColorHex(
                                sitesResponse.find(s => s.id === event.site)?.color_index ?? 0
                            ),
                            // Convert datetime to date for the calendar
                            date: new Date(event.start_time).toISOString().split('T')[0],
                            start_time: new Date(event.start_time).toTimeString().substring(0, 5),
                            end_time: new Date(event.end_time).toTimeString().substring(0, 5)
                        }));
                        setEvents(transformedEvents);
                        if (userId) {
                            setCache(`${CACHE_KEYS.EVENTS}_${userId}`, transformedEvents, 1000 * 60 * 5); // 5 min cache
                        }
                    }
                    
                    // Fetch availability blocks
                    try {
                        const availabilityResponse = await fetchAvailabilityBlocks();
                        if (active) {
                            console.log('Raw availability blocks from API:', availabilityResponse);
                            const transformedAvailability = availabilityResponse.map(block => ({
                                ...block,
                                site_color: getSiteColorHex(
                                    sitesResponse.find(s => s.id === block.site)?.color_index ?? 0
                                )
                            }));
                            console.log('Transformed availability blocks:', transformedAvailability);
                            setAvailabilityBlocks(transformedAvailability);
                            if (userId) {
                                setCache(`${CACHE_KEYS.AVAILABILITY_BLOCKS}_${userId}`, transformedAvailability, 1000 * 60 * 5); // 5 min cache
                            }
                        }
                    } catch (availError) {
                        console.warn('Could not fetch availability blocks:', availError);
                        setAvailabilityBlocks([]);
                    }
                }
            } catch (err) {
                if (active) {
                    console.error('Error loading calendar data:', err);
                    setError('Nie udało się pobrać danych kalendarza. Spróbuj ponownie później.');
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

    const handleCreateEvent = async (eventData) => {
        console.log('Create event:', eventData);
        try {
            // Use siteId from form data, or fall back to selectedSiteId or first site
            const siteId = eventData.siteId || selectedSiteId || sites[0]?.id;
            
            if (!siteId) {
                setError('Wybierz stronę dla której chcesz utworzyć wydarzenie.');
                return;
            }
            
            // Add site_id to event data
            const eventWithSite = {
                ...eventData,
                site_id: siteId
            };
            
            const newEvent = await createEvent(eventWithSite);
            
            // Transform the response to match our UI format
            const transformedEvent = {
                ...newEvent,
                site_color: getSiteColorHex(
                    sites.find(s => s.id === newEvent.site)?.color_index ?? 0
                ),
                site_id: newEvent.site,
                date: new Date(newEvent.start_time).toISOString().split('T')[0],
                start_time: new Date(newEvent.start_time).toTimeString().substring(0, 5),
                end_time: new Date(newEvent.end_time).toTimeString().substring(0, 5)
            };
            
            setEvents(prevEvents => {
                const updatedEvents = [...prevEvents, transformedEvent];
                // Update cache immediately
                if (user?.id) {
                    setCache(`${CACHE_KEYS.EVENTS}_${user.id}`, updatedEvents, 1000 * 60 * 5);
                }
                return updatedEvents;
            });
        } catch (error) {
            console.error('Error creating event:', error);
            setError('Nie udało się utworzyć wydarzenia. Spróbuj ponownie.');
        }
    };

    const handleCreateAvailability = async (availabilityData) => {
        console.log('Create availability:', availabilityData);
        try {
            // Use siteId from form data, or fall back to selectedSiteId or first site
            const siteId = availabilityData.siteId || selectedSiteId || sites[0]?.id;
            
            if (!siteId) {
                setError('Wybierz stronę dla której chcesz utworzyć dostępność.');
                return;
            }
            
            // Add site_id to availability data
            const availabilityWithSite = {
                ...availabilityData,
                site_id: siteId
            };
            
            const newBlock = await createAvailabilityBlock(availabilityWithSite);
            
            // Transform the response to match our UI format
            const transformedBlock = {
                ...newBlock,
                site_color: getSiteColorHex(
                    sites.find(s => s.id === newBlock.site)?.color_index ?? 0
                ),
                site_id: newBlock.site
            };
            
            setAvailabilityBlocks(prevBlocks => {
                const updatedBlocks = [...prevBlocks, transformedBlock];
                // Update cache immediately
                if (user?.id) {
                    setCache(`${CACHE_KEYS.AVAILABILITY_BLOCKS}_${user.id}`, updatedBlocks, 1000 * 60 * 5);
                }
                return updatedBlocks;
            });
        } catch (error) {
            console.error('Error creating availability block:', error);
            setError('Nie udało się utworzyć bloku dostępności. Spróbuj ponownie.');
        }
    };

    const handleCreateDayTemplate = () => {
        console.log('Create day template');
        // TODO: Implement day template creation
    };

    const handleCreateWeekTemplate = () => {
        console.log('Create week template');
        // TODO: Implement week template creation
    };

    const handleTemplateDragStart = (template) => {
        console.log('Template drag started:', template);
        setDraggingTemplate(template);
    };

    const handleTemplateDragEnd = () => {
        console.log('Template drag ended');
        setDraggingTemplate(null);
    };

    const handleApplyTemplate = async (template, targetDate, affectedEvents) => {
        console.log('Applying template:', { template, targetDate, affectedEvents });
        
        try {
            // First, delete affected events if any
            if (affectedEvents.length > 0) {
                for (const event of affectedEvents) {
                    try {
                        await deleteEvent(event.id);
                        // Remove from local state
                        setEvents(prevEvents => {
                            const updatedEvents = prevEvents.filter(e => e.id !== event.id);
                            // Update cache immediately
                            if (user?.id) {
                                setCache(`${CACHE_KEYS.EVENTS}_${user.id}`, updatedEvents, 1000 * 60 * 5);
                            }
                            return updatedEvents;
                        });
                    } catch (deleteError) {
                        console.error('Error deleting event:', deleteError);
                    }
                }
            }
            
            // Then create new events from template
            if (template.events && template.events.length > 0) {
                const templateType = template.day_abbreviation ? 'day' : 'week';
                
                if (templateType === 'day') {
                    // Apply day template - create events for the specific date
                    for (const templateEvent of template.events) {
                        const eventData = {
                            title: templateEvent.title,
                            description: templateEvent.description || '',
                            date: targetDate,
                            startTime: templateEvent.start_time,
                            endTime: templateEvent.end_time,
                            meetingType: templateEvent.event_type || 'individual',
                            capacity: templateEvent.capacity || 1,
                            type: templateEvent.type || 'online',
                            location: templateEvent.location || '',
                            site_id: selectedSiteId || sites[0]?.id
                        };
                        
                        console.log('Creating event from template:', eventData);
                        await handleCreateEvent(eventData);
                    }
                } else {
                    // Apply week template - create events for the whole week
                    const startOfWeek = moment(targetDate).startOf('isoWeek');
                    
                    for (const templateEvent of template.events) {
                        // Calculate the actual date based on day_of_week
                        const eventDate = startOfWeek.clone().add(templateEvent.day_of_week - 1, 'days');
                        
                        const eventData = {
                            title: templateEvent.title,
                            description: templateEvent.description || '',
                            date: eventDate.format('YYYY-MM-DD'),
                            startTime: templateEvent.start_time,
                            endTime: templateEvent.end_time,
                            meetingType: templateEvent.event_type || 'individual',
                            capacity: templateEvent.capacity || 1,
                            type: templateEvent.type || 'online',
                            location: templateEvent.location || '',
                            site_id: selectedSiteId || sites[0]?.id
                        };
                        
                        console.log('Creating event from template:', eventData);
                        await handleCreateEvent(eventData);
                    }
                }
            }
            
            console.log('Template applied successfully');
        } catch (error) {
            console.error('Error applying template:', error);
            setError('Nie udało się zastosować szablonu. Spróbuj ponownie.');
        }
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
                    overflow: 'hidden' // Prevent scroll from child elements
                }}
            >
                <RealTemplateBrowser
                    onCreateDayTemplate={handleCreateDayTemplate}
                    onCreateWeekTemplate={handleCreateWeekTemplate}
                    onTemplateDragStart={handleTemplateDragStart}
                    onTemplateDragEnd={handleTemplateDragEnd}
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
                        overflow: 'visible' // Allow events to expand on hover
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
                            availabilityBlocks={availabilityBlocks}
                            sites={sites}
                            selectedSiteId={selectedSiteId}
                            currentMonth={currentMonth}
                            onDayClick={handleDayClick}
                            onMonthChange={setCurrentMonth}
                            onSiteSelect={handleSiteSelect}
                            draggingTemplate={draggingTemplate}
                            onApplyTemplate={handleApplyTemplate}
                            operatingStartHour={operatingStartHour}
                            operatingEndHour={operatingEndHour}
                            onOperatingStartHourChange={handleOperatingStartHourChange}
                            onOperatingEndHourChange={handleOperatingEndHourChange}
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
                selectedSiteId={selectedSiteId}
                onClose={() => setModalOpen(false)}
                onCreateEvent={handleCreateEvent}
                onCreateAvailability={handleCreateAvailability}
                operatingStartHour={operatingStartHour}
                operatingEndHour={operatingEndHour}
            />
        </Box>
    );
};

export default CreatorCalendarApp;
