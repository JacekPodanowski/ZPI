import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import moment from 'moment';
import { fetchSites, fetchSiteCalendarRoster } from '../../../services/siteService';
import { fetchEvents, createEvent, fetchAvailabilityBlocks, createAvailabilityBlock, deleteEvent } from '../../../services/eventService';
import CalendarGridControlled from '../../components_STUDIO/Dashboard/Calendar/CalendarGridControlled';
import RealTemplateBrowser from '../../components_STUDIO/Dashboard/Templates/RealTemplateBrowser';
import DayDetailsModal from '../../components_STUDIO/Dashboard/Calendar/DayDetailsModal';
import BookingDetailsModal from '../../components_STUDIO/Dashboard/Calendar/BookingDetailsModal';
import { getSiteColorHex } from '../../../theme/siteColors';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { getCache, setCache, removeCache, CACHE_KEYS } from '../../../utils/cache';
import { useAuth } from '../../../contexts/AuthContext';

const ROLE_PERMISSIONS = {
    owner: {
        canCreateEvents: true,
        canAssignAnyone: true,
        canEditAllEvents: true,
        canManageAvailability: true,
        autoAssignSelf: false
    },
    manager: {
        canCreateEvents: true,
        canAssignAnyone: true,
        canEditAllEvents: true,
        canManageAvailability: true,
        autoAssignSelf: false
    },
    contributor: {
        canCreateEvents: true,
        canAssignAnyone: false,
        canEditAllEvents: false,
        canManageAvailability: false,
        autoAssignSelf: true
    },
    viewer: {
        canCreateEvents: false,
        canAssignAnyone: false,
        canEditAllEvents: false,
        canManageAvailability: false,
        autoAssignSelf: false
    }
};

const enhanceSitePayload = (site, role, membershipId, isOwner) => ({
    ...site,
    team_size: site?.team_size ?? 1,
    calendarRole: role,
    calendarMembershipId: membershipId ?? null,
    calendarIsOwner: isOwner,
});

const normalizeSitesPayload = (payload = {}) => {
    if (Array.isArray(payload)) {
        return payload.map((site) => enhanceSitePayload(site, 'owner', null, true));
    }

    const ownedSites = Array.isArray(payload?.owned_sites) ? payload.owned_sites : [];
    const teamSites = Array.isArray(payload?.team_member_sites) ? payload.team_member_sites : [];

    const normalized = [
        ...ownedSites.map((site) => enhanceSitePayload(site, 'owner', null, true)),
        // Only include linked team sites, not pending invitations
        ...teamSites
            .filter((site) => site?.team_member_info?.invitation_status === 'linked')
            .map((site) => enhanceSitePayload(
                site,
                site?.team_member_info?.permission_role ?? 'viewer',
                site?.team_member_info?.id ?? null,
                false
            )),
    ];

    if (!normalized.length && Array.isArray(payload?.results)) {
        return payload.results.map((site) => enhanceSitePayload(site, 'owner', null, true));
    }

    return normalized;
};

const ensureNormalizedSites = (data) => {
    if (Array.isArray(data) && data.every((site) => site && typeof site === 'object' && 'calendarRole' in site)) {
        return data;
    }
    return normalizeSitesPayload(data);
};

const CreatorCalendarApp = () => {
    const { calendar, updateCalendarPreferences } = usePreferences();
    const { user } = useAuth();
    const [sites, setSites] = useState([]);
    const [sitePermissions, setSitePermissions] = useState({});
    const [siteRosters, setSiteRosters] = useState({});
    const [events, setEvents] = useState([]);
    const [availabilityBlocks, setAvailabilityBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSiteId, setSelectedSiteId] = useState(null);
    const [allowAllSitesView, setAllowAllSitesView] = useState(false);
    const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [draggingTemplate, setDraggingTemplate] = useState(null);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const rosterInFlightRef = useRef(new Set());
    const computePermissionsFromSites = useCallback((siteList) => {
        const map = {};
        siteList.forEach((site) => {
            const roleKey = site?.calendarRole ?? 'viewer';
            map[site.id] = ROLE_PERMISSIONS[roleKey] || ROLE_PERMISSIONS.viewer;
        });
        return map;
    }, []);

    const ensureSiteRoster = useCallback(async (siteId) => {
        if (!siteId || siteRosters[siteId] || rosterInFlightRef.current.has(siteId)) {
            return siteRosters[siteId];
        }

        rosterInFlightRef.current.add(siteId);
        try {
            const response = await fetchSiteCalendarRoster(siteId);
            setSiteRosters((prev) => ({ ...prev, [siteId]: response }));
            setSitePermissions((prev) => ({
                ...prev,
                [siteId]: response?.permissions
                    || prev[siteId]
                    || ROLE_PERMISSIONS[response?.role] 
                    || ROLE_PERMISSIONS.viewer,
            }));
            return response;
        } catch (rosterError) {
            console.error('Failed to load team roster for site', siteId, rosterError);
            throw rosterError;
        } finally {
            rosterInFlightRef.current.delete(siteId);
        }
    }, [siteRosters]);

    useEffect(() => {
        if (!sites.length) {
            if (selectedSiteId !== null) {
                setSelectedSiteId(null);
            }
            return;
        }

        // If a site is selected but no longer exists, deselect it
        if (selectedSiteId) {
            const selectedSiteExists = sites.some((site) => site.id === selectedSiteId);
            if (!selectedSiteExists) {
                setSelectedSiteId(null);
            }
        }
        // Default to no selection (show all sites)
    }, [sites, selectedSiteId]);

    useEffect(() => {
        if (!selectedSiteId) {
            setSelectedAssigneeFilter(null);
            return;
        }
        setSelectedAssigneeFilter(null);
        const activeSite = sites.find((site) => site.id === selectedSiteId);
        if (activeSite?.team_size > 1) {
            ensureSiteRoster(selectedSiteId);
        }
    }, [selectedSiteId, sites, ensureSiteRoster]);
    
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
            const userId = user?.id;

            try {
                const cachedSitesRaw = userId ? getCache(`${CACHE_KEYS.SITES}_${userId}`) : null;
                const cachedEvents = userId ? getCache(`${CACHE_KEYS.EVENTS}_${userId}`) : null;
                const cachedAvailability = userId ? getCache(`${CACHE_KEYS.AVAILABILITY_BLOCKS}_${userId}`) : null;

                if (cachedSitesRaw && cachedEvents && active) {
                    const normalizedCachedSites = ensureNormalizedSites(cachedSitesRaw);
                    setSites(normalizedCachedSites);
                    setSitePermissions(computePermissionsFromSites(normalizedCachedSites));
                    setEvents(cachedEvents);
                    if (cachedAvailability) {
                        setAvailabilityBlocks(cachedAvailability);
                    }
                    setLoading(false);
                }

                const sitesResponse = await fetchSites();
                if (!active) {
                    return;
                }
                const normalizedSites = ensureNormalizedSites(sitesResponse);
                setSites(normalizedSites);
                setSitePermissions(computePermissionsFromSites(normalizedSites));

                if (userId) {
                    setCache(`${CACHE_KEYS.SITES}_${userId}`, normalizedSites, 1000 * 60 * 5);
                }

                const eventsResponse = await fetchEvents();
                if (active) {
                    const transformedEvents = eventsResponse.map((event) => {
                        const siteEntry = normalizedSites.find((s) => s.id === event.site) || {};
                        const startDate = new Date(event.start_time);
                        const endDate = new Date(event.end_time);
                        return {
                            ...event,
                            site_id: event.site,
                            site_color: getSiteColorHex(siteEntry.color_index ?? 0),
                            date: startDate.toISOString().split('T')[0],
                            start_time: startDate.toTimeString().substring(0, 5),
                            end_time: endDate.toTimeString().substring(0, 5),
                            assignment_type: event.assignment_type,
                            assignment_label: event.assignment_label,
                            assigned_to_owner: event.assigned_to_owner,
                            assigned_to_team_member: event.assigned_to_team_member,
                        };
                    });
                    setEvents(transformedEvents);
                    if (userId) {
                        setCache(`${CACHE_KEYS.EVENTS}_${userId}`, transformedEvents, 1000 * 60 * 5);
                    }
                }

                try {
                    const availabilityResponse = await fetchAvailabilityBlocks();
                    if (active) {
                        const transformedAvailability = availabilityResponse.map((block) => ({
                            ...block,
                            site_color: getSiteColorHex(
                                normalizedSites.find((s) => s.id === block.site)?.color_index ?? 0
                            ),
                        }));
                        setAvailabilityBlocks(transformedAvailability);
                        if (userId) {
                            setCache(`${CACHE_KEYS.AVAILABILITY_BLOCKS}_${userId}`, transformedAvailability, 1000 * 60 * 5);
                        }
                    }
                } catch (availError) {
                    console.warn('Could not fetch availability blocks:', availError);
                    if (active) {
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
    }, [user?.id, computePermissionsFromSites]);

    const handleDayClick = (date) => {
        console.log('(DEBUGLOG) CreatorCalendarApp.dayClick', { date, selectedSiteId });
        setSelectedDate(date);
        setModalOpen(true);
    };

    const handleSiteSelect = (siteId, options = {}) => {
        const isClearingSelection = siteId === null || options?.reason === 'clear' || options?.clearSelection;
        if (isClearingSelection) {
            console.log('(DEBUGLOG) CreatorCalendarApp.siteSelect.clear');
            setAllowAllSitesView(true);
            setSelectedSiteId(null);
            setSelectedAssigneeFilter(null);
            return;
        }

        const normalizedId = typeof siteId === 'number' ? siteId : Number(siteId) || siteId;
        console.log('(DEBUGLOG) CreatorCalendarApp.siteSelect', { siteId: normalizedId });
        setAllowAllSitesView(false);
        setSelectedSiteId(normalizedId);
    };

    const handleAssigneeFilterChange = (assignee) => {
        setSelectedAssigneeFilter((prev) => {
            if (!assignee) {
                return null;
            }
            const isSame = prev && prev.id === assignee.id && prev.type === assignee.type;
            return isSame ? null : assignee;
        });
    };

    const handleCreateEvent = async (eventData) => {
        console.log('Create event:', eventData);
        try {
            const siteId = eventData.siteId || selectedSiteId || sites[0]?.id;

            if (!siteId) {
                setError('Wybierz stronę dla której chcesz utworzyć wydarzenie.');
                return;
            }

            const targetSite = sites.find((site) => site.id === siteId);
            const siteRole = targetSite?.calendarRole ?? 'viewer';
            const permissions = sitePermissions[siteId] || ROLE_PERMISSIONS[siteRole] || ROLE_PERMISSIONS.viewer;

            if (!permissions.canCreateEvents) {
                setError('Nie masz uprawnień do tworzenia wydarzeń na tej stronie.');
                return;
            }

            const { assignee, ...restPayload } = eventData;
            let assignedOwner = null;
            let assignedMember = null;

            if (assignee?.type === 'team_member' && assignee?.id) {
                assignedMember = Number(assignee.id) || assignee.id;
            } else if (assignee?.type === 'owner') {
                assignedOwner = targetSite?.owner?.id ?? null;
            }

            if (!assignedOwner && !assignedMember) {
                if (permissions.autoAssignSelf && targetSite?.calendarMembershipId) {
                    assignedMember = targetSite.calendarMembershipId;
                } else {
                    assignedOwner = targetSite?.owner?.id ?? null;
                }
            }

            if (!assignedOwner && !assignedMember) {
                setError('Nie udało się ustalić prowadzącego wydarzenie.');
                return;
            }

            const eventWithSite = {
                ...restPayload,
                site_id: siteId,
                assigned_to_owner: assignedOwner,
                assigned_to_team_member: assignedMember,
            };

            const newEvent = await createEvent(eventWithSite);

            const transformedEvent = {
                ...newEvent,
                site_color: getSiteColorHex(
                    sites.find((s) => s.id === newEvent.site)?.color_index ?? 0
                ),
                site_id: newEvent.site,
                date: new Date(newEvent.start_time).toISOString().split('T')[0],
                start_time: new Date(newEvent.start_time).toTimeString().substring(0, 5),
                end_time: new Date(newEvent.end_time).toTimeString().substring(0, 5),
                assignment_type: newEvent.assignment_type,
                assignment_label: newEvent.assignment_label,
                assigned_to_owner: newEvent.assigned_to_owner,
                assigned_to_team_member: newEvent.assigned_to_team_member,
            };

            setEvents((prevEvents) => {
                const updatedEvents = [...prevEvents, transformedEvent];
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

            const targetSite = sites.find((site) => site.id === siteId);
            const siteRole = targetSite?.calendarRole ?? 'viewer';
            const permissions = sitePermissions[siteId] || ROLE_PERMISSIONS[siteRole] || ROLE_PERMISSIONS.viewer;

            if (!permissions.canManageAvailability) {
                setError('Nie masz uprawnień do zarządzania dostępnością zespołu.');
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

    const currentSite = useMemo(() => (
        selectedSiteId ? sites.find((site) => site.id === selectedSiteId) : null
    ), [sites, selectedSiteId]);

    const currentPermissions = useMemo(() => {
        if (!selectedSiteId) {
            return ROLE_PERMISSIONS.owner;
        }
        const siteRole = currentSite?.calendarRole ?? 'viewer';
        return sitePermissions[selectedSiteId] || ROLE_PERMISSIONS[siteRole] || ROLE_PERMISSIONS.viewer;
    }, [selectedSiteId, currentSite, sitePermissions]);

    const currentRoster = selectedSiteId ? siteRosters[selectedSiteId] : null;
    const currentMembershipId = currentSite?.calendarMembershipId ?? null;

    const siteTeamSizeMap = useMemo(() => {
        const map = new Map();
        (sites || []).forEach((site) => {
            map.set(String(site.id), site.team_size ?? 1);
        });
        return map;
    }, [sites]);

    const eventsForCalendar = useMemo(() => {
        return events.map((event) => {
            const siteKey = String(event.site_id);
            const isFromSelectedSite = !selectedSiteId || siteKey === String(selectedSiteId);
            const siteTeamSize = siteTeamSizeMap.get(siteKey) ?? 1;
            
            // Hide team member events if site doesn't have team
            if (siteTeamSize <= 1 && event.assigned_to_team_member) {
                return null;
            }
            
            // Apply assignee filter if set
            if (selectedAssigneeFilter && isFromSelectedSite) {
                if (selectedAssigneeFilter.type === 'owner') {
                    if (selectedAssigneeFilter.id) {
                        if (String(event.assigned_to_owner) !== String(selectedAssigneeFilter.id)) {
                            return null;
                        }
                    } else if (!event.assigned_to_owner) {
                        return null;
                    }
                } else if (selectedAssigneeFilter.type === 'team_member') {
                    if (String(event.assigned_to_team_member) !== String(selectedAssigneeFilter.id)) {
                        return null;
                    }
                }
            }
            
            // Mark events from selected site for visual distinction
            return {
                ...event,
                isFromSelectedSite
            };
        }).filter(Boolean);
    }, [events, selectedSiteId, selectedAssigneeFilter, siteTeamSizeMap]);

    const availabilityForCalendar = useMemo(() => {
        if (!selectedSiteId) {
            return availabilityBlocks;
        }
        return availabilityBlocks.filter((block) => (
            String(block.site_id ?? block.site) === String(selectedSiteId)
        ));
    }, [availabilityBlocks, selectedSiteId]);

    const handleBookingRemoved = useCallback(({ eventId, bookingId }) => {
        if (!eventId || !bookingId) {
            return;
        }

        setEvents((prevEvents) => {
            let changed = false;

            const updatedEvents = prevEvents.map((event) => {
                if (String(event.id) !== String(eventId)) {
                    return event;
                }

                const eventBookings = Array.isArray(event.bookings) ? event.bookings : [];
                const filteredBookings = eventBookings.filter((booking) => String(booking.id) !== String(bookingId));

                if (filteredBookings.length === eventBookings.length) {
                    return event;
                }

                changed = true;
                return {
                    ...event,
                    bookings: filteredBookings
                };
            });

            if (!changed) {
                return prevEvents;
            }

            if (user?.id) {
                setCache(`${CACHE_KEYS.EVENTS}_${user.id}`, updatedEvents, 1000 * 60 * 5);
            }

            return updatedEvents;
        });

        if (selectedBooking?.id === bookingId) {
            setSelectedBooking(null);
            setBookingModalOpen(false);
        }
    }, [user?.id, selectedBooking?.id, setSelectedBooking, setBookingModalOpen]);

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
                    overflow: 'hidden', // Prevent scroll from child elements
                    position: 'relative' // For potential drawer positioning
                }}
            >
                {/* Template Browser - Hidden on mobile, visible on lg+ */}
                <Box
                    sx={{
                        display: { xs: 'none', lg: 'block' } // Hide on mobile and tablet
                    }}
                >
                    <RealTemplateBrowser
                        onCreateDayTemplate={handleCreateDayTemplate}
                        onCreateWeekTemplate={handleCreateWeekTemplate}
                        onTemplateDragStart={handleTemplateDragStart}
                        onTemplateDragEnd={handleTemplateDragEnd}
                    />
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        px: { xs: 0.5, sm: 1, md: 1.5, lg: 2 },
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
                            events={eventsForCalendar}
                            availabilityBlocks={availabilityForCalendar}
                            sites={sites}
                            selectedSiteId={selectedSiteId}
                            currentMonth={currentMonth}
                            onDayClick={handleDayClick}
                            onMonthChange={setCurrentMonth}
                            onSiteSelect={handleSiteSelect}
                            teamRoster={currentRoster}
                            selectedAssigneeFilter={selectedAssigneeFilter}
                            onAssigneeFilterChange={handleAssigneeFilterChange}
                            currentSiteRole={currentSite?.calendarRole}
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
                events={eventsForCalendar}
                availabilityBlocks={availabilityForCalendar}
                sites={sites}
                selectedSiteId={selectedSiteId}
                onClose={() => setModalOpen(false)}
                onCreateEvent={handleCreateEvent}
                onCreateAvailability={handleCreateAvailability}
                operatingStartHour={operatingStartHour}
                operatingEndHour={operatingEndHour}
                onBookingRemoved={handleBookingRemoved}
                sitePermissions={sitePermissions}
                rolePermissionMap={ROLE_PERMISSIONS}
                siteRosters={siteRosters}
                ensureSiteRoster={ensureSiteRoster}
            />
            
            {/* Booking Details Modal */}
            {bookingModalOpen && selectedBooking && (
                <BookingDetailsModal
                    open={bookingModalOpen}
                    onClose={() => {
                        setBookingModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    booking={selectedBooking}
                    onBookingUpdated={(payload) => {
                        if (!payload || payload.action !== 'cancel') {
                            return;
                        }

                        const fallbackEventId = payload.eventId
                            ?? selectedBooking?.event
                            ?? selectedBooking?.event_id
                            ?? selectedBooking?.event_details?.id
                            ?? selectedBooking?.event_details?.event
                            ?? null;

                        handleBookingRemoved({
                            eventId: fallbackEventId,
                            bookingId: payload.bookingId
                        });
                    }}
                />
            )}
        </Box>
    );
};

export default CreatorCalendarApp;
