import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import moment from 'moment';
import { fetchSites, fetchSiteCalendarRoster, fetchSiteCalendarData } from '../../../services/siteService';
import { createEvent, createAvailabilityBlock, deleteEvent, updateEvent, updateAvailabilityBlock } from '../../../services/eventService';
import { fetchTemplates, createTemplate } from '../../../services/templateService';
import CalendarGridControlled from '../../components_STUDIO/Dashboard/Calendar/CalendarGridControlled';
import RealTemplateBrowser from '../../components_STUDIO/Dashboard/Templates/RealTemplateBrowser';
import DayDetailsModal from '../../components_STUDIO/Dashboard/Calendar/DayDetailsModal';
import BookingDetailsModal from '../../components_STUDIO/Dashboard/Calendar/BookingDetailsModal';
import CreateTemplateModal from '../../components_STUDIO/Dashboard/Templates/CreateTemplateModal';
import { getSiteColorHex } from '../../../theme/siteColors';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { getCache, setCache, removeCache, CACHE_KEYS } from '../../../utils/cache';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

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

    // Backend now filters to only return linked sites, no need to filter here
    const normalized = [
        ...ownedSites.map((site) => enhanceSitePayload(site, 'owner', null, true)),
        ...teamSites.map((site) => enhanceSitePayload(
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
    const addToast = useToast();
    const [sites, setSites] = useState([]);
    const [sitePermissions, setSitePermissions] = useState({});
    const [siteRosters, setSiteRosters] = useState({});
    const [events, setEvents] = useState([]);
    const [availabilityBlocks, setAvailabilityBlocks] = useState([]);
    const [templates, setTemplates] = useState([]);
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
    const [creatingTemplateMode, setCreatingTemplateMode] = useState(null); // 'day' or 'week' or null
    const [createTemplateModalOpen, setCreateTemplateModalOpen] = useState(false);
    const [selectedTemplateDate, setSelectedTemplateDate] = useState(null);
    const rosterInFlightRef = useRef(new Set());
    const computePermissionsFromSites = useCallback((siteList) => {
        const map = {};
        siteList.forEach((site) => {
            const roleKey = site?.calendarRole ?? 'viewer';
            map[site.id] = ROLE_PERMISSIONS[roleKey] || ROLE_PERMISSIONS.viewer;
        });
        return map;
    }, []);

    const invalidateSiteRoster = useCallback((siteId) => {
        if (!siteId) return;
        setSiteRosters((prev) => {
            const updated = { ...prev };
            delete updated[siteId];
            return updated;
        });
        rosterInFlightRef.current.delete(siteId);
    }, []);

    const ensureSiteRoster = useCallback(async (siteId, forceRefresh = false) => {
        if (!siteId) {
            return null;
        }

        if (!forceRefresh && siteRosters[siteId] && !rosterInFlightRef.current.has(siteId)) {
            return siteRosters[siteId];
        }

        if (rosterInFlightRef.current.has(siteId)) {
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

    // Fetch sites and calendar data from API
    useEffect(() => {
        let active = true;

        const load = async () => {
            const userId = user?.id;

            try {
                // Always fetch sites first to know which ones user has access to
                const sitesResponse = await fetchSites();
                if (!active) return;
                
                const normalizedSites = ensureNormalizedSites(sitesResponse);
                setSites(normalizedSites);
                setSitePermissions(computePermissionsFromSites(normalizedSites));

                if (userId) {
                    setCache(`${CACHE_KEYS.SITES}_${userId}`, normalizedSites, 1000 * 60 * 5);
                }

                // Fetch calendar data for each accessible site
                const allEvents = [];
                const allAvailabilityBlocks = [];
                
                for (const site of normalizedSites) {
                    try {
                        const calendarData = await fetchSiteCalendarData(site.id);
                        
                        // Transform events
                        const transformedEvents = calendarData.events.map((event) => {
                            const startDate = new Date(event.start_time);
                            const endDate = new Date(event.end_time);
                            return {
                                ...event,
                                site_id: site.id,
                                site_color: getSiteColorHex(site.color_index ?? 0),
                                date: startDate.toISOString().split('T')[0],
                                start_time: startDate.toTimeString().substring(0, 5),
                                end_time: endDate.toTimeString().substring(0, 5),
                                assignment_type: event.assignment_type,
                                assignment_label: event.assignment_label,
                                assigned_to_owner: event.assigned_to_owner,
                                assigned_to_team_member: event.assigned_to_team_member,
                            };
                        });
                        
                        // Transform availability blocks
                        const transformedBlocks = calendarData.availability_blocks.map((block) => ({
                            ...block,
                            site_color: getSiteColorHex(site.color_index ?? 0),
                        }));
                        
                        allEvents.push(...transformedEvents);
                        allAvailabilityBlocks.push(...transformedBlocks);
                    } catch (siteError) {
                        /* Skip site if calendar data cannot be fetched */
                    }
                }

                if (active) {
                    setEvents(allEvents);
                    setAvailabilityBlocks(allAvailabilityBlocks);
                    
                    if (userId) {
                        setCache(`${CACHE_KEYS.EVENTS}_${userId}`, allEvents, 1000 * 60 * 5);
                        setCache(`${CACHE_KEYS.AVAILABILITY_BLOCKS}_${userId}`, allAvailabilityBlocks, 1000 * 60 * 5);
                    }
                }

                // Fetch templates
                try {
                    const templatesResponse = await fetchTemplates();
                    if (active) {
                        setTemplates(templatesResponse);
                        if (userId) {
                            setCache(`${CACHE_KEYS.TEMPLATES}_${userId}`, templatesResponse, 1000 * 60 * 5);
                        }
                    }
                } catch (templError) {
                    if (active) {
                        setTemplates([]);
                    }
                }
            } catch (err) {
                if (active) {
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
    
    // Refresh data function for manual refresh
    const handleDataRefresh = useCallback(async () => {
        const userId = user?.id;
        if (!userId) return;
        
        try {
            // Fetch sites first
            const sitesResponse = await fetchSites();
            const normalizedSites = ensureNormalizedSites(sitesResponse);
            setSites(normalizedSites);
            setSitePermissions(computePermissionsFromSites(normalizedSites));
            setCache(`${CACHE_KEYS.SITES}_${userId}`, normalizedSites, 1000 * 60 * 5);

            // Fetch calendar data for each accessible site
            const allEvents = [];
            const allAvailabilityBlocks = [];
            
            for (const site of normalizedSites) {
                try {
                    const calendarData = await fetchSiteCalendarData(site.id);
                    
                    // Transform events
                    const transformedEvents = calendarData.events.map((event) => {
                        const startDate = new Date(event.start_time);
                        const endDate = new Date(event.end_time);
                        return {
                            ...event,
                            site_id: site.id,
                            site_color: getSiteColorHex(site.color_index ?? 0),
                            date: startDate.toISOString().split('T')[0],
                            start_time: startDate.toTimeString().substring(0, 5),
                            end_time: endDate.toTimeString().substring(0, 5),
                            assignment_type: event.assignment_type,
                            assignment_label: event.assignment_label,
                            assigned_to_owner: event.assigned_to_owner,
                            assigned_to_team_member: event.assigned_to_team_member,
                        };
                    });
                    
                    // Transform availability blocks
                    const transformedBlocks = calendarData.availability_blocks.map((block) => ({
                        ...block,
                        site_color: getSiteColorHex(site.color_index ?? 0),
                    }));
                    
                    allEvents.push(...transformedEvents);
                    allAvailabilityBlocks.push(...transformedBlocks);
                } catch (siteError) {
                    /* Ignore single-site failures during refresh */
                }
            }

            setEvents(allEvents);
            setAvailabilityBlocks(allAvailabilityBlocks);
            setCache(`${CACHE_KEYS.EVENTS}_${userId}`, allEvents, 1000 * 60 * 5);
            setCache(`${CACHE_KEYS.AVAILABILITY_BLOCKS}_${userId}`, allAvailabilityBlocks, 1000 * 60 * 5);

            const templatesResponse = await fetchTemplates();
            setTemplates(templatesResponse);
            setCache(`${CACHE_KEYS.TEMPLATES}_${userId}`, templatesResponse, 1000 * 60 * 5);
        } catch (err) {
            setError('Nie udało się odświeżyć danych kalendarza.');
            addToast('Nie udało się odświeżyć danych kalendarza.', { variant: 'error' });
        }
    }, [user?.id, computePermissionsFromSites, addToast]);

    const handleDayClick = (date) => {
        // If in template creation mode, cancel it when clicking non-selectable day
        if (creatingTemplateMode) {
            setCreatingTemplateMode(null);
            setSelectedTemplateDate(null);
            return;
        }
        
        setSelectedDate(date);
        setModalOpen(true);
    };

    const handleEventClick = (event) => {
        // Open the day modal for the event's date
        setSelectedDate(new Date(event.date));
        setModalOpen(true);
    };

    const handleSiteSelect = (siteId, options = {}) => {
        const isClearingSelection = siteId === null || options?.reason === 'clear' || options?.clearSelection;
        if (isClearingSelection) {
            setAllowAllSitesView(true);
            setSelectedSiteId(null);
            setSelectedAssigneeFilter(null);
            return;
        }

        const normalizedId = typeof siteId === 'number' ? siteId : Number(siteId) || siteId;
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
        try {
            const siteId = eventData.siteId || selectedSiteId || sites[0]?.id;

            if (!siteId) {
                setError('Wybierz stronę dla której chcesz utworzyć wydarzenie.');
                return;
            }

            const targetSite = sites.find((site) => String(site.id) === String(siteId));
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
                show_host: eventData.showHost ?? false,
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
            setError('Nie udało się utworzyć wydarzenia. Spróbuj ponownie.');
        }
    };

    const handleCreateAvailability = async (availabilityData) => {
        try {
            // Use siteId from form data, or fall back to selectedSiteId or first site
            const siteId = availabilityData.siteId || selectedSiteId || sites[0]?.id;
            
            if (!siteId) {
                setError('Wybierz stronę dla której chcesz utworzyć dostępność.');
                return;
            }

            const targetSite = sites.find((site) => String(site.id) === String(siteId));
            const siteRole = targetSite?.calendarRole ?? 'viewer';
            const permissions = sitePermissions[siteId] || ROLE_PERMISSIONS[siteRole] || ROLE_PERMISSIONS.viewer;

            if (!permissions.canManageAvailability) {
                setError('Nie masz uprawnień do zarządzania dostępnością zespołu.');
                return;
            }
            
            // Process assignee data
            const { assignee, ...restPayload } = availabilityData;
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

            // Add site_id and assignment to availability data
            const availabilityWithSite = {
                ...restPayload,
                site_id: siteId,
                assigned_to_owner: assignedOwner,
                assigned_to_team_member: assignedMember,
                show_host: availabilityData.showHost ?? false,
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
            setError('Nie udało się utworzyć bloku dostępności. Spróbuj ponownie.');
        }
    };

    const handleUpdateEvent = async (eventData) => {
        try {
            const siteId = eventData.siteId || selectedSiteId || sites[0]?.id;

            if (!siteId) {
                setError('Wybierz stronę dla której chcesz zaktualizować wydarzenie.');
                return;
            }

            const targetSite = sites.find((site) => String(site.id) === String(siteId));
            const siteRole = targetSite?.calendarRole ?? 'viewer';
            const permissions = sitePermissions[siteId] || ROLE_PERMISSIONS[siteRole] || ROLE_PERMISSIONS.viewer;

            if (!permissions.canCreateEvents) {
                setError('Nie masz uprawnień do edycji wydarzeń na tej stronie.');
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

            const updatePayload = {
                title: restPayload.title,
                description: restPayload.description || '',
                start_time: `${eventData.date}T${restPayload.startTime}:00`,
                end_time: `${eventData.date}T${restPayload.endTime}:00`,
                capacity: restPayload.meetingType === 'group' ? (restPayload.capacity || 1) : 1,
                event_type: restPayload.meetingType || 'individual',
                site: siteId,
                assigned_to_owner: assignedOwner,
                assigned_to_team_member: assignedMember,
                show_host: eventData.showHost ?? false,
            };

            const updatedEvent = await updateEvent(eventData.id, updatePayload);

            const transformedEvent = {
                ...updatedEvent,
                site_color: getSiteColorHex(
                    sites.find((s) => s.id === updatedEvent.site)?.color_index ?? 0
                ),
                site_id: updatedEvent.site,
                date: new Date(updatedEvent.start_time).toISOString().split('T')[0],
                start_time: new Date(updatedEvent.start_time).toTimeString().substring(0, 5),
                end_time: new Date(updatedEvent.end_time).toTimeString().substring(0, 5),
            };

            setEvents((prevEvents) => {
                const updatedEvents = prevEvents.map(e => e.id === eventData.id ? transformedEvent : e);
                if (user?.id) {
                    setCache(`${CACHE_KEYS.EVENTS}_${user.id}`, updatedEvents, 1000 * 60 * 5);
                }
                return updatedEvents;
            });
        } catch (error) {
            setError('Nie udało się zaktualizować wydarzenia. Spróbuj ponownie.');
        }
    };

    const handleUpdateAvailability = async (availabilityData) => {
        try {
            const siteId = availabilityData.siteId || selectedSiteId || sites[0]?.id;
            
            if (!siteId) {
                setError('Wybierz stronę dla której chcesz zaktualizować dostępność.');
                return;
            }

            const targetSite = sites.find((site) => String(site.id) === String(siteId));
            const siteRole = targetSite?.calendarRole ?? 'viewer';
            const permissions = sitePermissions[siteId] || ROLE_PERMISSIONS[siteRole] || ROLE_PERMISSIONS.viewer;

            if (!permissions.canManageAvailability) {
                setError('Nie masz uprawnień do edycji dostępności zespołu.');
                return;
            }
            
            const { assignee, ...restPayload } = availabilityData;
            let assignedOwner = null;
            let assignedMember = null;

            if (assignee?.type === 'team_member' && assignee?.id) {
                assignedMember = Number(assignee.id) || assignee.id;
            } else if (assignee?.type === 'owner') {
                assignedOwner = targetSite?.owner?.id ?? null;
            }

            const updatePayload = {
                title: restPayload.title || 'Dostępny',
                date: availabilityData.date,
                start_time: restPayload.startTime,
                end_time: restPayload.endTime,
                meeting_length: restPayload.meeting_length || parseInt(restPayload.meetingDuration) || 60,
                time_snapping: restPayload.time_snapping || parseInt(restPayload.timeSnapping) || 30,
                buffer_time: restPayload.buffer_time || parseInt(restPayload.bufferTime) || 0,
                site: siteId,
                assigned_to_owner: assignedOwner,
                assigned_to_team_member: assignedMember,
                show_host: availabilityData.showHost ?? false,
            };
            
            const updatedBlock = await updateAvailabilityBlock(availabilityData.id, updatePayload);
            
            const transformedBlock = {
                ...updatedBlock,
                site_color: getSiteColorHex(
                    sites.find(s => s.id === updatedBlock.site)?.color_index ?? 0
                ),
                site_id: updatedBlock.site
            };
            
            setAvailabilityBlocks(prevBlocks => {
                const updatedBlocks = prevBlocks.map(b => b.id === availabilityData.id ? transformedBlock : b);
                if (user?.id) {
                    setCache(`${CACHE_KEYS.AVAILABILITY_BLOCKS}_${user.id}`, updatedBlocks, 1000 * 60 * 5);
                }
                return updatedBlocks;
            });
        } catch (error) {
            setError('Nie udało się zaktualizować dostępności. Spróbuj ponownie.');
        }
    };

    const handleCreateDayTemplate = () => {
        setCreatingTemplateMode('day');
    };

    const handleCreateWeekTemplate = () => {
        setCreatingTemplateMode('week');
    };

    const handleCancelTemplateCreation = () => {
        setCreatingTemplateMode(null);
        setSelectedTemplateDate(null);
    };

    const handleTemplateSelection = (date) => {
        setSelectedTemplateDate(date);
        setCreateTemplateModalOpen(true);
    };

    const handleConfirmTemplateCreation = async (templateName) => {
        try {
            // Check for duplicate names and auto-number if needed
            let finalTemplateName = templateName;
            const existingNames = templates.map(t => t.name);
            
            if (existingNames.includes(finalTemplateName)) {
                let counter = 2;
                while (existingNames.includes(`${templateName} ${counter}`)) {
                    counter++;
                }
                finalTemplateName = `${templateName} ${counter}`;
            }
            
            // Collect events and availability blocks for the template
            const templateType = creatingTemplateMode; // 'day' or 'week'
            let templateEvents = [];
            let templateAvailability = [];
            
            // Use filtered calendar data (only visible to user) instead of raw state
            const visibleEvents = eventsForCalendar;
            const visibleAvailability = availabilityForCalendar;
            
            if (templateType === 'day') {
                // Get events from the selected day
                const dayEvents = visibleEvents.filter(e => 
                    moment(e.date).format('YYYY-MM-DD') === selectedTemplateDate
                );
                
                // Get availability blocks from the selected day
                const dayAvailability = visibleAvailability.filter(block => 
                    moment(block.date).format('YYYY-MM-DD') === selectedTemplateDate
                );
                
                templateEvents = dayEvents.map(event => ({
                    title: event.title,
                    description: event.description || '',
                    start_time: event.start_time,
                    end_time: event.end_time,
                    event_type: event.event_type || event.meetingType || 'individual',
                    capacity: event.capacity || 1,
                    type: event.type || 'online',
                    location: event.location || '',
                    assignment_type: event.assignment_type || 'owner',
                    assigned_to_owner: event.assigned_to_owner || false,
                    assigned_to_team_member: event.assigned_to_team_member || null,
                    site: event.site
                }));
                
                templateAvailability = dayAvailability.map(block => ({
                    start_time: block.start_time,
                    end_time: block.end_time,
                    assignment_type: block.assignment_type || 'owner',
                    assigned_to_owner: block.assigned_to_owner || false,
                    assigned_to_team_member: block.assigned_to_team_member || null,
                    meeting_length: block.meeting_length || 60,
                    time_snapping: block.time_snapping || 30,
                    buffer_time: block.buffer_time || 0,
                    site: block.site
                }));
            } else if (templateType === 'week') {
                // Get events from the entire week
                const weekStart = moment(selectedTemplateDate).startOf('isoWeek');
                const weekEnd = moment(selectedTemplateDate).endOf('isoWeek');
                
                const weekEvents = visibleEvents.filter(e => {
                    const eventMoment = moment(e.date);
                    return eventMoment.isSameOrAfter(weekStart) && eventMoment.isSameOrBefore(weekEnd);
                });
                
                const weekAvailability = visibleAvailability.filter(block => {
                    const blockMoment = moment(block.date);
                    return blockMoment.isSameOrAfter(weekStart) && blockMoment.isSameOrBefore(weekEnd);
                });
                
                templateEvents = weekEvents.map(event => {
                    const eventMoment = moment(event.date);
                    const dayOfWeek = eventMoment.isoWeekday(); // 1=Monday, 7=Sunday
                    
                    return {
                        title: event.title,
                        description: event.description || '',
                        start_time: event.start_time,
                        end_time: event.end_time,
                        event_type: event.event_type || event.meetingType || 'individual',
                        capacity: event.capacity || 1,
                        type: event.type || 'online',
                        location: event.location || '',
                        assignment_type: event.assignment_type || 'owner',
                        assigned_to_owner: event.assigned_to_owner || false,
                        assigned_to_team_member: event.assigned_to_team_member || null,
                        day_of_week: dayOfWeek,
                        site: event.site
                    };
                });
                
                templateAvailability = weekAvailability.map(block => {
                    const blockMoment = moment(block.date);
                    const dayOfWeek = blockMoment.isoWeekday(); // 1=Monday, 7=Sunday
                    
                    return {
                        start_time: block.start_time,
                        end_time: block.end_time,
                        assignment_type: block.assignment_type || 'owner',
                        assigned_to_owner: block.assigned_to_owner || false,
                        assigned_to_team_member: block.assigned_to_team_member || null,
                        meeting_length: block.meeting_length || 60,
                        time_snapping: block.time_snapping || 30,
                        buffer_time: block.buffer_time || 0,
                        day_of_week: dayOfWeek,
                        site: block.site
                    };
                });
            }
            
            // Validate that template has at least one event or availability block
            if (templateEvents.length === 0 && templateAvailability.length === 0) {
                const errorMessage = 'Szablon musi zawierać co najmniej jedno wydarzenie lub blok dostępności';
                setError(errorMessage);
                addToast(errorMessage, { variant: 'error' });
                return;
            }
            
            // Prepare template data (without site field, as templates can work with multiple sites)
            const templateData = {
                name: finalTemplateName,
                template_config: {
                    template_type: templateType,
                    events: templateEvents,
                    availability_blocks: templateAvailability,
                    ...(templateType === 'day' ? {
                        day_abbreviation: moment(selectedTemplateDate).format('ddd')
                    } : {
                        day_count: [...new Set([...templateEvents, ...templateAvailability].map(item => item.day_of_week))].length,
                        active_days: [...new Set([...templateEvents, ...templateAvailability].map(item => item.day_of_week - 1))], // Convert to 0-based
                        total_events: templateEvents.length,
                        total_availability_blocks: templateAvailability.length
                    })
                }
            };
            
            // Call API to save template
            const createdTemplate = await createTemplate(templateData);
            
            addToast(`Szablon "${finalTemplateName}" został utworzony`, { variant: 'success' });
            
            // Refresh templates list
            const userId = user?.id;
            if (userId) {
                removeCache(`${CACHE_KEYS.TEMPLATES}_${userId}`);
                const updatedTemplates = await fetchTemplates();
                setTemplates(updatedTemplates);
            }
            
            setError(null);
            
        } catch (error) {
            
            // Check for duplicate name constraint violation
            let errorMessage = 'Nie udało się utworzyć szablonu. Spróbuj ponownie.';
            if (error?.response?.status === 500) {
                const errorDetail = JSON.stringify(error?.response?.data || '');
                if (errorDetail.includes('duplicate key') || errorDetail.includes('already exists')) {
                    errorMessage = `Szablon o nazwie "${templateName}" już istnieje. Wybierz inną nazwę.`;
                }
            } else if (error?.response?.data?.detail || error?.response?.data?.message) {
                errorMessage = error.response.data.detail || error.response.data.message;
            }
            
            setError(errorMessage);
            addToast(errorMessage, { variant: 'error' });
        } finally {
            // Close modal and reset state
            setCreateTemplateModalOpen(false);
            setCreatingTemplateMode(null);
            setSelectedTemplateDate(null);
        }
    };

    const handleCloseCreateTemplateModal = () => {
        setCreateTemplateModalOpen(false);
        setSelectedTemplateDate(null);
    };

    const handleTemplateDragStart = (template) => {
        setDraggingTemplate(template);
    };

    const handleTemplateDragEnd = () => {
        setDraggingTemplate(null);
    };

    const handleApplyTemplate = async (template, targetDate, affectedEvents, action = 'apply') => {
        try {
            const templateType = template.day_abbreviation ? 'day' : 'week';
            
            // First, delete affected events if action is 'replace'
            if (action === 'replace' && affectedEvents.length > 0) {
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
                        /* Continue removing other events even if one fails */
                    }
                }
            }
            // For 'add' action, we don't delete affected events, we just add new ones
            // For 'apply' action, there are no affected events to delete
            
            // Create availability blocks from template
            if (template.availability_blocks && template.availability_blocks.length > 0) {
                if (templateType === 'day') {
                    // Apply day template - create blocks for the specific date
                    for (const templateBlock of template.availability_blocks) {
                        const blockData = {
                            date: targetDate,
                            startTime: templateBlock.start_time,
                            endTime: templateBlock.end_time,
                            meeting_length: templateBlock.meeting_length,
                            time_snapping: templateBlock.time_snapping,
                            buffer_time: templateBlock.buffer_time,
                            site_id: selectedSiteId || sites[0]?.id
                        };
                        
                        await handleCreateAvailability(blockData);
                    }
                } else {
                    // Apply week template - create blocks for the whole week (skip past days)
                    const startOfWeek = moment(targetDate).startOf('isoWeek');
                    const today = moment().startOf('day');
                    
                    for (const templateBlock of template.availability_blocks) {
                        // Calculate the actual date based on day_of_week
                        const blockDate = startOfWeek.clone().add(templateBlock.day_of_week - 1, 'days');
                        
                        // Skip if the block date is in the past
                        if (blockDate.isBefore(today)) {
                            continue;
                        }
                        
                        const blockData = {
                            date: blockDate.format('YYYY-MM-DD'),
                            startTime: templateBlock.start_time,
                            endTime: templateBlock.end_time,
                            meeting_length: templateBlock.meeting_length,
                            time_snapping: templateBlock.time_snapping,
                            buffer_time: templateBlock.buffer_time,
                            site_id: selectedSiteId || sites[0]?.id
                        };
                        
                        await handleCreateAvailability(blockData);
                    }
                }
            }
            
            // Then create new events from template
            if (template.events && template.events.length > 0) {
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
                            siteId: selectedSiteId || sites[0]?.id
                        };
                        
                        await handleCreateEvent(eventData);
                    }
                } else {
                    // Apply week template - create events for the whole week (skip past days)
                    const startOfWeek = moment(targetDate).startOf('isoWeek');
                    const today = moment().startOf('day');
                    
                    for (const templateEvent of template.events) {
                        // Calculate the actual date based on day_of_week
                        const eventDate = startOfWeek.clone().add(templateEvent.day_of_week - 1, 'days');
                        
                        // Skip if the event date is in the past
                        if (eventDate.isBefore(today)) {
                            continue;
                        }
                        
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
                            siteId: selectedSiteId || sites[0]?.id
                        };
                        
                        await handleCreateEvent(eventData);
                    }
                }
            }
        } catch (error) {
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
        // Backend already filters events by user access (owner + linked team members)
        // Here we only apply UI filters (selected site, assignee filter, team size)
        return events
            .map((event) => {
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
            })
            .filter(Boolean);
    }, [events, selectedSiteId, selectedAssigneeFilter, siteTeamSizeMap]);

    const availabilityForCalendar = useMemo(() => {
        // Backend already filters availability blocks by user access (owner + linked team members)
        // Here we only apply UI filters (selected site)
        
        // If a site is selected, filter to only that site
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
                height: 'calc(100vh - 60px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
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
                        templates={templates}
                        sites={sites}
                        onCreateDayTemplate={handleCreateDayTemplate}
                        onCreateWeekTemplate={handleCreateWeekTemplate}
                        onTemplateDragStart={handleTemplateDragStart}
                        onTemplateDragEnd={handleTemplateDragEnd}
                        creatingTemplateMode={creatingTemplateMode}
                        onCancelTemplateCreation={handleCancelTemplateCreation}
                        onTemplatesRefresh={handleDataRefresh}
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
                            onEventClick={handleEventClick}
                            onMonthChange={setCurrentMonth}
                            onSiteSelect={handleSiteSelect}
                            teamRoster={currentRoster}
                            selectedAssigneeFilter={selectedAssigneeFilter}
                            onAssigneeFilterChange={handleAssigneeFilterChange}
                            currentSiteRole={currentSite?.calendarRole}
                            draggingTemplate={draggingTemplate}
                            onApplyTemplate={handleApplyTemplate}
                            creatingTemplateMode={creatingTemplateMode}
                            onTemplateSelection={handleTemplateSelection}
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
                onUpdateEvent={handleUpdateEvent}
                onUpdateAvailability={handleUpdateAvailability}
                operatingStartHour={operatingStartHour}
                operatingEndHour={operatingEndHour}
                onBookingRemoved={handleBookingRemoved}
                sitePermissions={sitePermissions}
                rolePermissionMap={ROLE_PERMISSIONS}
                siteRosters={siteRosters}
                ensureSiteRoster={ensureSiteRoster}
                onDataRefresh={handleDataRefresh}
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

            {/* Create Template Modal */}
            <CreateTemplateModal
                open={createTemplateModalOpen}
                onClose={handleCloseCreateTemplateModal}
                onConfirm={handleConfirmTemplateCreation}
                templateType={creatingTemplateMode}
                selectedDate={selectedTemplateDate}
                events={eventsForCalendar}
                availabilityBlocks={availabilityForCalendar}
                sites={sites}
            />
        </Box>
    );
};

export default CreatorCalendarApp;
