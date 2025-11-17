import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Fab,
    Stack,
    Chip,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    Alert,
    Divider,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    CalendarMonth as CalendarIcon,
    AccessTime as TimeIcon,
    EventNote as EventNoteIcon,
    Schedule as ScheduleIcon,
    Email as EmailIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    CleaningServices as MopIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import PropTypes from 'prop-types';
import useTheme from '../../../../theme/useTheme';
import BookingDetailsModal from './BookingDetailsModal';
import * as eventService from '../../../../services/eventService';
import { useToast } from '../../../../contexts/ToastContext';
import { getSiteColorHex } from '../../../../theme/siteColors';

const computeBlockMetrics = (start, end, dayStartMinutes, dayEndMinutes) => {
    // Handle undefined or invalid time strings
    if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
        console.warn('Invalid time values:', { start, end });
        return { top: '0%', height: '8.33%', startMinutes: 0, endMinutes: 60 }; // Default to 1 hour at start
    }
    
    const startParts = start.split(':');
    const endParts = end.split(':');
    
    // Accept both HH:MM and HH:MM:SS formats
    if (startParts.length < 2 || startParts.length > 3 || endParts.length < 2 || endParts.length > 3) {
        console.warn('Invalid time format:', { start, end });
        return { top: '0%', height: '8.33%', startMinutes: 0, endMinutes: 60 };
    }
    
    const [startHour, startMinute] = startParts.map(Number);
    const [endHour, endMinute] = endParts.map(Number);
    
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        console.warn('Non-numeric time values:', { start, end });
        return { top: '0%', height: '8.33%', startMinutes: 0, endMinutes: 60 };
    }
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    // Calculate position relative to the timeline (which starts at dayStartMinutes)
    const relativeStartMinutes = Math.max(startMinutes - dayStartMinutes, 0);
    const relativeEndMinutes = Math.min(endMinutes - dayStartMinutes, dayEndMinutes - dayStartMinutes);
    
    const duration = Math.max(relativeEndMinutes - relativeStartMinutes, 15);
    
    // Convert to percentages of total day range
    const totalMinutes = dayEndMinutes - dayStartMinutes;
    const topPercent = (relativeStartMinutes / totalMinutes) * 100;
    const heightPercent = (duration / totalMinutes) * 100;
    
    return { 
        top: `${topPercent}%`, 
        height: `${heightPercent}%`,
        startMinutes,
        endMinutes
    };
};

// Check if two time ranges overlap
const doTimesOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
};

// Calculate layout positions for overlapping events/blocks
const calculateOverlapLayout = (items, dayStartMinutes, dayEndMinutes) => {
    if (!items || items.length === 0) return [];

    // Calculate metrics for each item
    const itemsWithMetrics = items.map((item, index) => {
        const metrics = computeBlockMetrics(item.start_time, item.end_time, dayStartMinutes, dayEndMinutes);
        return {
            ...item,
            index,
            metrics,
            column: 0,
            totalColumns: 1
        };
    });

    // Sort by start time, then by duration (longer first)
    itemsWithMetrics.sort((a, b) => {
        const startDiff = a.metrics.startMinutes - b.metrics.startMinutes;
        if (startDiff !== 0) return startDiff;
        return (b.metrics.endMinutes - b.metrics.startMinutes) - (a.metrics.endMinutes - a.metrics.startMinutes);
    });

    // Group overlapping items
    const groups = [];
    for (const item of itemsWithMetrics) {
        let placed = false;
        
        // Try to find an existing group this item overlaps with
        for (const group of groups) {
            const overlapsWithGroup = group.some(groupItem => 
                doTimesOverlap(
                    item.metrics.startMinutes,
                    item.metrics.endMinutes,
                    groupItem.metrics.startMinutes,
                    groupItem.metrics.endMinutes
                )
            );
            
            if (overlapsWithGroup) {
                group.push(item);
                placed = true;
                break;
            }
        }
        
        if (!placed) {
            groups.push([item]);
        }
    }

    // Assign columns within each group
    for (const group of groups) {
        const maxColumns = Math.min(group.length, 5); // Limit to 5 columns
        
        // For each item in the group, find which column it should be in
        for (let i = 0; i < group.length; i++) {
            const item = group[i];
            
            // Find the first available column
            let column = 0;
            const columnsUsed = new Array(maxColumns).fill(null);
            
            // Check previous items to see which columns are occupied at this time
            for (let j = 0; j < i; j++) {
                const prevItem = group[j];
                if (doTimesOverlap(
                    item.metrics.startMinutes,
                    item.metrics.endMinutes,
                    prevItem.metrics.startMinutes,
                    prevItem.metrics.endMinutes
                )) {
                    columnsUsed[prevItem.column] = prevItem;
                }
            }
            
            // Find first free column
            column = columnsUsed.findIndex(col => col === null);
            if (column === -1) column = 0; // Fallback
            
            item.column = column;
            item.totalColumns = maxColumns;
        }
    }

    return itemsWithMetrics;
};

const createDefaultFormState = (siteId = null) => ({
    title: '',
    startTime: '10:00',
    endTime: '11:00',
    type: 'online',
    location: '',
    meetingType: 'individual',
    capacity: 1,
    meetingDuration: '60',
    timeSnapping: '30',
    bufferTime: '0',
    siteId: siteId || null,
    assigneeType: 'owner',
    assigneeId: null
});

const AvailabilityBlockDisplay = ({ block, siteColor, siteName, onClick, dayStartMinutes, dayEndMinutes, column = 0, totalColumns = 1 }) => {
    const metrics = computeBlockMetrics(block.start_time, block.end_time, dayStartMinutes, dayEndMinutes);
    const [isHovered, setIsHovered] = useState(false);

    // Calculate horizontal position based on column
    // Timeline content area: left margin 60px, right margin 8px
    const columnWidth = 100 / totalColumns;
    const gapSize = totalColumns > 1 ? 2 : 0; // 2px gap between columns
    
    return (
        <motion.div
            style={{
                position: 'absolute',
                left: `calc(60px + ${column} * ((100% - 68px) / ${totalColumns}))`,
                width: `calc((100% - 68px) / ${totalColumns} - ${gapSize}px)`,
                top: metrics.top,
                height: metrics.height,
                zIndex: isHovered ? 5 : 1
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Box
                onClick={() => onClick?.(block)}
                sx={{
                    height: '100%',
                    backgroundColor: isHovered ? 'rgba(76, 175, 80, 0.25)' : 'rgba(76, 175, 80, 0.15)',
                    border: isHovered ? '2px dashed rgba(76, 175, 80, 0.6)' : '2px dashed rgba(76, 175, 80, 0.4)',
                    borderRadius: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 200ms ease, border 200ms ease',
                    position: 'relative',
                    p: 1
                }}
            >
                {siteName && (
                    <Typography
                        variant="caption"
                        sx={{
                            position: 'absolute',
                            top: 4,
                            left: 6,
                            color: 'rgba(56, 142, 60, 0.8)',
                            fontWeight: 700,
                            fontSize: '9px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        {siteName}
                    </Typography>
                )}
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(56, 142, 60, 0.9)',
                        fontWeight: 600,
                        fontSize: '11px'
                    }}
                >
                    Dostępny
                </Typography>
            </Box>
        </motion.div>
    );
};

AvailabilityBlockDisplay.propTypes = {
    block: PropTypes.shape({
        start_time: PropTypes.string.isRequired,
        end_time: PropTypes.string.isRequired,
        title: PropTypes.string
    }).isRequired,
    siteColor: PropTypes.string.isRequired,
    siteName: PropTypes.string,
    onClick: PropTypes.func,
    dayStartMinutes: PropTypes.number.isRequired,
    dayEndMinutes: PropTypes.number.isRequired,
    column: PropTypes.number,
    totalColumns: PropTypes.number
};


const EventDisplay = ({ event, siteColor, onHover, onClick, onBookingClick, dayStartMinutes, dayEndMinutes, column = 0, totalColumns = 1 }) => {
    const metrics = computeBlockMetrics(event.start_time, event.end_time, dayStartMinutes, dayEndMinutes);
    const [isHovered, setIsHovered] = useState(false);

    // Calculate horizontal position based on column
    // Timeline content area: left margin 60px, right margin 8px = 68px total
    const gapSize = totalColumns > 1 ? 2 : 0; // 2px gap between columns
    const padding = 3; // px padding around event for clickable availability zones
    
    return (
        <motion.div
            style={{
                position: 'absolute',
                left: `calc(60px + ${column} * ((100% - 68px) / ${totalColumns}))`,
                width: `calc((100% - 68px) / ${totalColumns} - ${gapSize}px)`,
                top: `calc(${metrics.top} + ${padding}px)`,
                height: `calc(${metrics.height} - ${padding * 2}px)`,
                zIndex: isHovered ? 30 : 10,
                pointerEvents: 'auto'
            }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => {
                setIsHovered(true);
                onHover?.(event.id);
            }}
            onHoverEnd={() => {
                setIsHovered(false);
                onHover?.(null);
            }}
        >
            <Box
                onClick={() => onClick?.(event)}
                sx={{
                    height: '100%',
                    backgroundColor: siteColor,
                    borderRadius: 1.5,
                    p: 1,
                    cursor: 'pointer',
                    border: `2px solid ${siteColor}`,
                    opacity: isHovered ? 1 : 0.9,
                    transition: 'all 200ms ease',
                    boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'visible',
                    position: 'relative'
                }}
            >
                {/* Time in top-right corner */}
                <Typography
                    variant="caption"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '10px',
                        fontWeight: 500,
                        backgroundColor: 'rgba(0, 0, 0, 0.15)',
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 0.5,
                        lineHeight: 1.2
                    }}
                >
                    {event.start_time} - {event.end_time}
                </Typography>
                
                {/* Title */}
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 600,
                        color: '#fff',
                        fontSize: '13px',
                        mb: 0.5,
                        pr: 7 // Add padding to avoid overlap with time
                    }}
                >
                    {event.title}
                </Typography>
                {event.bookings && event.bookings.length > 0 ? (
                    <Box sx={{ 
                        mt: 0.5, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 0.3,
                        maxHeight: '120px',
                        minHeight: 'auto',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        flexShrink: 0,
                        pr: 0.5,
                        // Dodatkowe właściwości dla lepszej kompatybilności
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255, 255, 255, 0.4)',
                            borderRadius: '3px',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.6)',
                            }
                        }
                    }}>
                        {event.bookings.map((booking, idx) => (
                            <Chip
                                key={idx}
                                size="small"
                                label={booking.client_name}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onBookingClick?.(booking);
                                }}
                                sx={{
                                    height: 18,
                                    fontSize: '10px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                    }
                                }}
                            />
                        ))}
                    </Box>
                ) : (
                    <Chip
                        size="small"
                        label="Wolne"
                        sx={{
                            mt: 0.5,
                            height: 18,
                            fontSize: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            opacity: 0.7
                        }}
                    />
                )}
            </Box>
        </motion.div>
    );
};

EventDisplay.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        start_time: PropTypes.string.isRequired,
        end_time: PropTypes.string.isRequired,
        event_type: PropTypes.string,
        client_name: PropTypes.string,
        current_capacity: PropTypes.number,
        max_capacity: PropTypes.number,
        capacity: PropTypes.number
    }).isRequired,
    siteColor: PropTypes.string.isRequired,
    onHover: PropTypes.func,
    onClick: PropTypes.func,
    onBookingClick: PropTypes.func,
    dayStartMinutes: PropTypes.number.isRequired,
    dayEndMinutes: PropTypes.number.isRequired,
    column: PropTypes.number,
    totalColumns: PropTypes.number
};

const DayDetailsModal = ({ 
    open, 
    date, 
    events, 
    availabilityBlocks, 
    sites, 
    selectedSiteId,
    onClose, 
    onCreateEvent, 
    onCreateAvailability,
    operatingStartHour = 6,
    operatingEndHour = 22,
    onBookingRemoved,
    sitePermissions,
    rolePermissionMap,
    siteRosters,
    ensureSiteRoster,
    onDataRefresh
}) => {
    const theme = useTheme();
        const addToast = useToast();
    const [view, setView] = useState('timeline'); // 'timeline' | 'chooser' | 'createEvent' | 'createAvailability' | 'editEvent' | 'editAvailability'
    const [hoveredEventId, setHoveredEventId] = useState(null);
    const [editingItem, setEditingItem] = useState(null); // Store the item being edited
    const [selectedBooking, setSelectedBooking] = useState(null); // For BookingDetailsModal
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [isZoomedTimeline, setIsZoomedTimeline] = useState(true); // Toggle between zoomed (smart) and full timeline
    const [contactFormOpen, setContactFormOpen] = useState(false);
    const [contactingBooking, setContactingBooking] = useState(null);
    const [contactMessage, setContactMessage] = useState({
        subject: 'Zmiana w terminie spotkania',
        message: 'Witam,\n\nNiestety muszę wprowadzić zmiany w harmonogramie. Proszę o kontakt w celu ustalenia nowego terminu.\n\nPrzepraszam za niedogodności.\nPozdrawiam'
    });
    const [formData, setFormData] = useState(() => createDefaultFormState(selectedSiteId || sites?.[0]?.id || null));
    const resetFormData = useCallback(() => {
        setFormData(createDefaultFormState(selectedSiteId || sites?.[0]?.id || null));
    }, [selectedSiteId, sites]);

    const dateFormatted = useMemo(() => moment(date).format('dddd, D MMMM YYYY'), [date]);
    const dateKey = useMemo(() => moment(date).format('YYYY-MM-DD'), [date]);
    const hasSingleSite = useMemo(() => Array.isArray(sites) && sites.length === 1, [sites]);
    const activeSiteId = formData.siteId || selectedSiteId || (Array.isArray(sites) && sites.length ? sites[0].id : null);
    const activeSite = useMemo(() => {
        if (!activeSiteId || !Array.isArray(sites)) {
            return null;
        }
        return sites.find((site) => String(site.id) === String(activeSiteId)) || null;
    }, [sites, activeSiteId]);
    const fallbackPermissions = useMemo(() => {
        if (!rolePermissionMap) {
            return {};
        }
        const roleKey = activeSite?.calendarRole ?? 'viewer';
        return rolePermissionMap[roleKey] || rolePermissionMap.viewer || {};
    }, [activeSite?.calendarRole, rolePermissionMap]);
    const currentPermissions = useMemo(() => {
        if (activeSiteId && sitePermissions && sitePermissions[activeSiteId]) {
            return sitePermissions[activeSiteId];
        }
        return fallbackPermissions;
    }, [activeSiteId, sitePermissions, fallbackPermissions]);
    const rosterData = activeSiteId && siteRosters ? siteRosters[activeSiteId] : null;
    const ownerProfile = rosterData?.owner || activeSite?.owner || null;
    const membershipId = activeSite?.calendarMembershipId || rosterData?.membership_id || null;
    const [rosterLoading, setRosterLoading] = useState(false);
    const assignmentOptions = useMemo(() => {
        if (!activeSiteId) {
            return [];
        }
        const options = [];
        if (ownerProfile) {
            const ownerName = `${ownerProfile.first_name ?? ''} ${ownerProfile.last_name ?? ''}`.trim() || ownerProfile.email || 'Właściciel strony';
            options.push({
                key: `owner:${ownerProfile.id ?? 'owner'}`,
                type: 'owner',
                id: ownerProfile.id ?? null,
                label: ownerName,
                avatar_url: ownerProfile.avatar_url,
                avatar_letter: ownerName.charAt(0)?.toUpperCase() || 'O',
                role: 'Właściciel strony'
            });
        }
        const members = Array.isArray(rosterData?.team_members) ? rosterData.team_members : [];
        members.forEach((member) => {
            const memberName = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim() || member.role_description || 'Członek zespołu';
            options.push({
                key: `team_member:${member.id}`,
                type: 'team_member',
                id: member.id,
                label: memberName,
                avatar_url: member.avatar_url,
                avatar_color: member.avatar_color,
                avatar_letter: member.avatar_letter || memberName.charAt(0)?.toUpperCase() || 'T',
                role: member.role_description || 'Członek zespołu'
            });
        });
        if (!options.length && ownerProfile === null) {
            options.push({
                key: 'owner:auto',
                type: 'owner',
                id: null,
                label: 'Właściciel strony',
                avatar_letter: 'O',
                role: 'Właściciel strony'
            });
        }
        return options;
    }, [activeSiteId, ownerProfile, rosterData]);
    const assignmentValue = useMemo(() => {
        if (formData.assigneeType === 'team_member' && formData.assigneeId) {
            return `team_member:${formData.assigneeId}`;
        }
        const ownerOption = assignmentOptions.find((option) => option.type === 'owner');
        return ownerOption?.key || 'owner:auto';
    }, [assignmentOptions, formData.assigneeType, formData.assigneeId]);

    const dayEvents = useMemo(() => {
        return events.filter(e => moment(e.date).format('YYYY-MM-DD') === dateKey);
    }, [events, dateKey]);

    const dayAvailability = useMemo(() => {
        return availabilityBlocks.filter(b => moment(b.date).format('YYYY-MM-DD') === dateKey);
    }, [availabilityBlocks, dateKey]);

    useEffect(() => {
        if (!hasSingleSite || !sites?.[0]?.id) {
            return;
        }
        setFormData((prev) => {
            if (prev.siteId && String(prev.siteId) !== String(sites[0].id)) {
                return prev;
            }
            if (view === 'editEvent' || view === 'editAvailability') {
                return prev;
            }
            return { ...prev, siteId: sites[0].id };
        });
    }, [hasSingleSite, sites, view]);

    useEffect(() => {
        if (!selectedSiteId) {
            return;
        }
        if (view !== 'timeline' && view !== 'chooser') {
            return;
        }
        setFormData((prev) => {
            if (String(prev.siteId) === String(selectedSiteId)) {
                return prev;
            }
            return { ...prev, siteId: selectedSiteId };
        });
    }, [selectedSiteId, view]);

    useEffect(() => {
        if (!activeSiteId || !ensureSiteRoster) {
            return;
        }
        const teamSize = activeSite?.team_size ?? 1;
        if (teamSize <= 1 || rosterData) {
            setRosterLoading(false);
            return;
        }
        let cancelled = false;
        setRosterLoading(true);
        ensureSiteRoster(activeSiteId)
            .catch((error) => {
                console.error('Nie udało się wczytać listy zespołu', error);
            })
            .finally(() => {
                if (!cancelled) {
                    setRosterLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [activeSiteId, activeSite?.team_size, rosterData, ensureSiteRoster]);

    useEffect(() => {
        if (view !== 'createEvent') {
            return;
        }
        if (!currentPermissions?.autoAssignSelf || !membershipId) {
            return;
        }
        setFormData((prev) => {
            if (prev.assigneeType === 'team_member' && String(prev.assigneeId) === String(membershipId)) {
                return prev;
            }
            return { ...prev, assigneeType: 'team_member', assigneeId: membershipId };
        });
    }, [view, currentPermissions?.autoAssignSelf, membershipId]);

    // Smart timeline calculation: show 1 hour before first event and 1 hour after last event (when zoomed)
    const { actualStartHour, actualEndHour, dayStartMinutes, dayEndMinutes } = useMemo(() => {
        // Parse operating hours - floor the start hour, ceil the end hour
        const parseHour = (timeValue) => {
            if (typeof timeValue === 'string') {
                const [hours] = timeValue.split(':').map(Number);
                return hours;
            }
            return timeValue;
        };
        
        const fullMinHour = Math.floor(parseHour(operatingStartHour));
        const fullMaxHour = Math.ceil(parseHour(operatingEndHour));
        
        // If not zoomed, always use full operating hours
        if (!isZoomedTimeline) {
            return {
                actualStartHour: fullMinHour,
                actualEndHour: fullMaxHour,
                dayStartMinutes: fullMinHour * 60,
                dayEndMinutes: fullMaxHour * 60
            };
        }
        
        const allItems = [...dayEvents, ...dayAvailability];
        
        // If no events or availability blocks, use full operating hours
        if (allItems.length === 0) {
            return {
                actualStartHour: fullMinHour,
                actualEndHour: fullMaxHour,
                dayStartMinutes: fullMinHour * 60,
                dayEndMinutes: fullMaxHour * 60
            };
        }
        
        // Find earliest and latest times from events and availability blocks
        let earliestMinutes = Infinity;
        let latestMinutes = -Infinity;
        
        allItems.forEach(item => {
            const startTime = item.start_time;
            const endTime = item.end_time;
            
            if (startTime && typeof startTime === 'string') {
                const [startHour, startMinute = 0] = startTime.split(':').map(Number);
                if (!isNaN(startHour)) {
                    const startMinutes = startHour * 60 + startMinute;
                    if (startMinutes < earliestMinutes) {
                        earliestMinutes = startMinutes;
                    }
                }
            }
            
            if (endTime && typeof endTime === 'string') {
                const [endHour, endMinute = 0] = endTime.split(':').map(Number);
                if (!isNaN(endHour)) {
                    const endMinutes = endHour * 60 + endMinute;
                    if (endMinutes > latestMinutes) {
                        latestMinutes = endMinutes;
                    }
                }
            }
        });
        
        // Add 1 hour padding before and after
        const paddedStartMinutes = Math.max(0, earliestMinutes - 60);
        const paddedEndMinutes = Math.min(24 * 60, latestMinutes + 60);
        
        // Convert back to hours (floor for start, ceil for end)
        const minHour = Math.floor(paddedStartMinutes / 60);
        const maxHour = Math.ceil(paddedEndMinutes / 60);

        return {
            actualStartHour: minHour,
            actualEndHour: maxHour,
            dayStartMinutes: minHour * 60,
            dayEndMinutes: maxHour * 60
        };
    }, [dayEvents, dayAvailability, operatingStartHour, operatingEndHour, isZoomedTimeline]);

    const HOURS = useMemo(() => {
        return Array.from({ length: actualEndHour - actualStartHour }, (_, idx) => actualStartHour + idx);
    }, [actualStartHour, actualEndHour]);

    const HOUR_HEIGHT = 60;
    const timelineHeight = ((dayEndMinutes - dayStartMinutes) / 60) * HOUR_HEIGHT;
    const canAssignAnyone = Boolean(currentPermissions?.canAssignAnyone);
    const canCreateEvents = Boolean(currentPermissions?.canCreateEvents);
    const canManageAvailability = Boolean(currentPermissions?.canManageAvailability);
    const ownerIdForSite = ownerProfile?.id ?? activeSite?.owner?.id ?? null;
    const siteHasTeam = (activeSite?.team_size ?? 1) > 1;
    const rosterUnavailable = siteHasTeam && !rosterData;
    const disableAssignmentSelect = !canAssignAnyone || assignmentOptions.length <= 1 || rosterLoading;
    const submitDisabled = (view === 'createEvent' && !canCreateEvents) || (view === 'createAvailability' && !canManageAvailability);

    const handleClose = () => {
        setView('timeline');
        resetFormData();
        setEditingItem(null);
        setSelectedBooking(null);
        setBookingModalOpen(false);
        onClose();
    };

    const handleCreateChoice = (type) => {
        if (type === 'event' && !currentPermissions?.canCreateEvents) {
            addToast('Nie masz uprawnień do tworzenia wydarzeń dla tej strony.', { variant: 'warning' });
            return;
        }
        if (type === 'availability' && !currentPermissions?.canManageAvailability) {
            addToast('Nie masz uprawnień do zarządzania dostępnością zespołu.', { variant: 'warning' });
            return;
        }
        setFormData((prev) => ({
            ...prev,
            siteId: activeSiteId,
            assigneeType: prev.assigneeType,
            assigneeId: prev.assigneeId
        }));
        setView(type === 'event' ? 'createEvent' : 'createAvailability');
    };

    const handleAssigneeSelection = (value) => {
        if (!value) {
            return;
        }
        const [type, rawId] = value.split(':');
        if (type === 'team_member') {
            const parsedId = Number(rawId);
            setFormData((prev) => ({
                ...prev,
                assigneeType: 'team_member',
                assigneeId: Number.isNaN(parsedId) ? rawId : parsedId
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                assigneeType: 'owner',
                assigneeId: null
            }));
        }
    };

    const handleEventClick = (event) => {
        setEditingItem(event);
        const derivedAssigneeType = event.assignment_type || (event.assigned_to_team_member ? 'team_member' : 'owner');
        setFormData({
            title: event.title || '',
            startTime: event.start_time || '10:00',
            endTime: event.end_time || '11:00',
            type: event.type || 'online',
            location: event.location || '',
            meetingType: event.event_type || 'individual',
            capacity: event.capacity || event.max_capacity || 1,
            meetingDuration: '60',
            timeSnapping: '30',
            bufferTime: '0',
            siteId: event.site || selectedSiteId || null,
            assigneeType: derivedAssigneeType,
            assigneeId: derivedAssigneeType === 'team_member' ? event.assigned_to_team_member : null
        });
        setView('editEvent');
    };

    const handleAvailabilityClick = (block) => {
        setEditingItem(block);
        // Get single duration from meeting_length field
        const duration = String(block.meeting_length || 60);
        
        setFormData({
            title: block.title || 'Dostępny',
            startTime: block.start_time || '10:00',
            endTime: block.end_time || '11:00',
            type: 'online',
            location: '',
            meetingType: 'individual',
            capacity: 1,
            meetingDuration: duration,
            timeSnapping: String(block.time_snapping || 30),
            bufferTime: String(block.buffer_time || 0),
            siteId: block.site || selectedSiteId || null
        });
        setView('editAvailability');
    };

    const handleContactBooking = (booking) => {
        setContactingBooking(booking);
        setContactFormOpen(true);
    };

    const handleSendContactMessage = async () => {
        if (!contactingBooking) return;

        try {
            await eventService.contactClient(
                contactingBooking.id,
                contactMessage.subject,
                contactMessage.message
            );
            addToast('Wiadomość została wysłana', { variant: 'success' });
            setContactFormOpen(false);
            setContactingBooking(null);
            setContactMessage({
                subject: 'Zmiana w terminie spotkania',
                message: 'Witam,\n\nNiestety muszę wprowadzić zmiany w harmonogramie. Proszę o kontakt w celu ustalenia nowego terminu.\n\nPrzepraszam za niedogodności.\nPozdrawiam'
            });
        } catch (error) {
            console.error('Error sending message:', error);
            addToast('Nie udało się wysłać wiadomości', { variant: 'error' });
        }
    };

    const handleRemoveBooking = async (booking) => {
        if (!window.confirm(`Czy na pewno chcesz usunąć uczestnika ${booking.client_name}? Zostanie wysłany email z powiadomieniem.`)) {
            return;
        }

        try {
            await eventService.cancelBooking(booking.id);

            const bookingId = booking.id;
            const eventId = editingItem?.id
                ?? booking.event
                ?? booking.event_id
                ?? booking.event_details?.id
                ?? booking.event_details?.event
                ?? null;

            addToast('Uczestnik został usunięty, wysłano powiadomienie email', { variant: 'success' });

            if (editingItem && Array.isArray(editingItem.bookings)) {
                const updatedBookings = editingItem.bookings.filter((b) => b.id !== bookingId);
                setEditingItem({ ...editingItem, bookings: updatedBookings });
            }

            if (selectedBooking?.id === bookingId) {
                setSelectedBooking(null);
                setBookingModalOpen(false);
            }

            onBookingRemoved?.({ eventId, bookingId });
        } catch (error) {
            console.error('Error removing booking:', error);
            addToast('Nie udało się usunąć uczestnika', { variant: 'error' });
        }
    };

    const handleBookingModalUpdate = useCallback((payload) => {
        if (!payload || payload.action !== 'cancel') {
            return;
        }

        const { bookingId } = payload;
        const eventId = payload.eventId
            ?? editingItem?.id
            ?? selectedBooking?.event
            ?? selectedBooking?.event_id
            ?? selectedBooking?.event_details?.id
            ?? selectedBooking?.event_details?.event
            ?? null;

        if (editingItem && Array.isArray(editingItem.bookings)) {
            const matchesEditingItem = eventId ? String(editingItem.id) === String(eventId) : true;
            if (matchesEditingItem) {
                const updatedBookings = editingItem.bookings.filter((b) => b.id !== bookingId);
                setEditingItem({ ...editingItem, bookings: updatedBookings });
            }
        }

        onBookingRemoved?.({ eventId, bookingId });

        setSelectedBooking(null);
        setBookingModalOpen(false);
    }, [editingItem, onBookingRemoved, selectedBooking, setSelectedBooking, setBookingModalOpen]);

    const handleSubmit = () => {
        const { assigneeType, assigneeId, meetingDuration, ...restFormData } = formData;
        
        const targetSiteId = restFormData.siteId || activeSiteId;

        if (!targetSiteId) {
            addToast('Wybierz stronę, aby zapisać zmiany.', { variant: 'warning' });
            return;
        }

        if (view === 'createEvent') {
            if (!canCreateEvents) {
                addToast('Nie masz uprawnień do tworzenia wydarzeń na tej stronie.', { variant: 'warning' });
                return;
            }
            const assigneePayload = assigneeType === 'team_member'
                ? { type: 'team_member', id: assigneeId }
                : { type: 'owner', id: ownerIdForSite };
            onCreateEvent?.({
                ...restFormData,
                siteId: targetSiteId,
                date: dateKey,
                assignee: assigneePayload
            });
        } else if (view === 'createAvailability') {
            if (!canManageAvailability) {
                addToast('Nie masz uprawnień do zarządzania dostępnością zespołu.', { variant: 'warning' });
                return;
            }
            onCreateAvailability?.({
                ...restFormData,
                meeting_length: parseInt(meetingDuration) || 60,
                time_snapping: parseInt(restFormData.timeSnapping) || 30,
                buffer_time: parseInt(restFormData.bufferTime) || 0,
                siteId: targetSiteId,
                date: dateKey
            });
        }
        
        resetFormData();
        setView('timeline');
    };

    const renderTimeline = () => (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'visible',
                position: 'relative'
            }}
        >
            <motion.div
                key={`timeline-${actualStartHour}-${actualEndHour}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                    duration: 0.4, 
                    ease: [0.4, 0, 0.2, 1]
                }}
                style={{ width: '100%', height: '100%' }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',  // Fill available space
                        backgroundColor: theme.palette.background.default,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2
                    }}
                >
            {/* Hour lines */}
            {HOURS.map((hour, index) => {
                const topPercent = (index / HOURS.length) * 100;
                const heightPercent = (1 / HOURS.length) * 100;
                return (
                    <Box
                        key={hour}
                        sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: `${topPercent}%`,
                            height: `${heightPercent}%`,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            alignItems: 'flex-start'
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                width: 50,
                                pl: 1,
                                pt: 0.5,
                                fontWeight: 500,
                                color: theme.palette.text.secondary,
                                fontSize: '12px'
                            }}
                        >
                            {`${hour.toString().padStart(2, '0')}:00`}
                        </Typography>
                    </Box>
                );
            })}

            {/* Current time indicator */}
            {(() => {
                // Check if the displayed date is today
                const today = moment().format('YYYY-MM-DD');
                const displayedDate = moment(date).format('YYYY-MM-DD');
                const isToday = today === displayedDate;
                
                if (!isToday) return null;
                
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const currentHours = now.getHours();
                const currentMins = now.getMinutes();
                const currentTimeString = `${currentHours.toString().padStart(2, '0')}:${currentMins.toString().padStart(2, '0')}`;
                
                // Only show if current time is within the timeline range
                if (currentMinutes >= dayStartMinutes && currentMinutes <= dayEndMinutes) {
                    const relativeMinutes = currentMinutes - dayStartMinutes;
                    const totalMinutes = dayEndMinutes - dayStartMinutes;
                    const topPercent = (relativeMinutes / totalMinutes) * 100;
                    
                    return (
                        <Box
                            sx={{
                                position: 'absolute',
                                left: 45,
                                right: 0,
                                top: `${topPercent}%`,
                                zIndex: 1000,
                                pointerEvents: 'none'
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    position: 'absolute',
                                    top: '-18px',
                                    left: 0,
                                    fontWeight: 700,
                                    color: theme.palette.primary.main,
                                    fontSize: '11px',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {currentTimeString}
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '2px',
                                    backgroundColor: theme.palette.primary.main,
                                    mr: 1
                                }}
                            />
                        </Box>
                    );
                }
                return null;
            })()}

            {/* Availability blocks (rendered first, under events) */}
            {(() => {
                const layoutedBlocks = calculateOverlapLayout(dayAvailability, dayStartMinutes, dayEndMinutes);
                return layoutedBlocks.map((block) => {
                    const site = sites.find(s => s.id === (block.site_id || block.site));
                    const siteColor = site ? getSiteColorHex(site.color_index ?? 0) : 'rgb(146, 0, 32)';
                    return (
                        <AvailabilityBlockDisplay
                            key={block.id}
                            block={block}
                            siteColor={siteColor}
                            siteName={site?.name}
                            onClick={handleAvailabilityClick}
                            dayStartMinutes={dayStartMinutes}
                            dayEndMinutes={dayEndMinutes}
                            column={block.column}
                            totalColumns={block.totalColumns}
                        />
                    );
                });
            })()}

            {/* Events */}
            {(() => {
                const layoutedEvents = calculateOverlapLayout(dayEvents, dayStartMinutes, dayEndMinutes);
                return layoutedEvents.map((event) => {
                    const site = sites.find(s => s.id === (event.site_id || event.site));
                    const siteColor = site ? getSiteColorHex(site.color_index ?? 0) : 'rgb(146, 0, 32)';
                    return (
                        <EventDisplay
                            key={event.id}
                            event={event}
                            siteColor={siteColor}
                            onHover={setHoveredEventId}
                            onClick={handleEventClick}
                            onBookingClick={(booking) => {
                                setSelectedBooking(booking);
                                setBookingModalOpen(true);
                            }}
                            dayStartMinutes={dayStartMinutes}
                            dayEndMinutes={dayEndMinutes}
                            column={event.column}
                            totalColumns={event.totalColumns}
                        />
                    );
                });
            })()}
                </Box>
            </motion.div>
        </Box>
    );

    const renderCreationForm = () => {
        const isEvent = view === 'createEvent' || view === 'editEvent';
        const isEditing = view === 'editEvent' || view === 'editAvailability';
        const hasBookings = isEditing && editingItem?.bookings && editingItem.bookings.length > 0;

        return (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Form fields */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Alert severity="info" sx={{ mb: 1 }}>
                        {isEvent ? (
                            <>
                                <EventNoteIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                                {isEditing ? 'Edytujesz' : 'Tworzysz'} <strong>konkretne spotkanie</strong>
                            </>
                        ) : (
                            <>
                                <ScheduleIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                                {isEditing ? 'Edytujesz' : 'Tworzysz'} <strong>okno dostępności</strong> - klienci będą mogli zarezerwować w tym czasie
                            </>
                        )}
                    </Alert>

                    {isEvent && !canCreateEvents && (
                        <Alert severity="warning">
                            Nie masz uprawnień do tworzenia wydarzeń na tej stronie. Poproś właściciela o rozszerzenie roli lub wybierz inną stronę.
                        </Alert>
                    )}
                    {!isEvent && !canManageAvailability && (
                        <Alert severity="warning">
                            Nie możesz edytować dostępności zespołu dla tej strony.
                        </Alert>
                    )}

                {!hasSingleSite && (
                    <FormControl fullWidth required>
                        <InputLabel>Strona</InputLabel>
                        <Select
                            value={formData.siteId || ''}
                            label="Strona"
                            onChange={(e) => {
                                const rawValue = e.target.value;
                                const parsedValue = Number(rawValue);
                                setFormData({
                                    ...formData,
                                    siteId: Number.isNaN(parsedValue) ? rawValue : parsedValue,
                                    assigneeType: 'owner',
                                    assigneeId: null
                                });
                            }}
                        >
                            {sites.map((site) => (
                                <MenuItem key={site.id} value={site.id}>
                                    {site.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <TextField
                    fullWidth
                    label="Tytuł"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={isEvent ? 'np. Spotkanie z klientem' : 'Dostępny'}
                />

                <Stack direction="row" spacing={2}>
                    <TextField
                        fullWidth
                        label="Od"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        fullWidth
                        label="Do"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Stack>

                {isEvent && (
                    <>
                        <ToggleButtonGroup
                            fullWidth
                            exclusive
                            value={formData.type}
                            onChange={(e, val) => val && setFormData({ ...formData, type: val })}
                        >
                            <ToggleButton value="online">Online</ToggleButton>
                            <ToggleButton value="local">Stacjonarnie</ToggleButton>
                        </ToggleButtonGroup>

                        {formData.type === 'local' && (
                            <TextField
                                fullWidth
                                label="Lokalizacja"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="np. ul. Kwiatowa 5, Warszawa"
                            />
                        )}

                        <ToggleButtonGroup
                            fullWidth
                            exclusive
                            value={formData.meetingType}
                            onChange={(e, val) => val && setFormData({ ...formData, meetingType: val })}
                        >
                            <ToggleButton value="individual">Indywidualne</ToggleButton>
                            <ToggleButton value="group">Grupowe</ToggleButton>
                        </ToggleButtonGroup>

                        {formData.meetingType === 'group' && (
                            <TextField
                                fullWidth
                                type="number"
                                label="Maksymalna liczba osób"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                inputProps={{ min: 1 }}
                            />
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>
                                Prowadzący
                            </Typography>
                            {rosterLoading && (
                                <Chip
                                    label="Ładuję listę zespołu..."
                                    size="small"
                                    sx={{ alignSelf: 'flex-start' }}
                                />
                            )}
                            <FormControl fullWidth disabled={disableAssignmentSelect}>
                                <InputLabel>Prowadzący wydarzenie</InputLabel>
                                <Select
                                    value={assignmentValue}
                                    label="Prowadzący wydarzenie"
                                    onChange={(e) => handleAssigneeSelection(e.target.value)}
                                    renderValue={(value) => {
                                        const option = assignmentOptions.find((opt) => opt.key === value);
                                        return option ? option.label : 'Właściciel strony';
                                    }}
                                >
                                    {assignmentOptions.map((option) => (
                                        <MenuItem key={option.key} value={option.key}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar
                                                    src={option.avatar_url || undefined}
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        bgcolor: option.avatar_url ? 'transparent' : (option.avatar_color || 'primary.main'),
                                                        color: option.avatar_url ? 'inherit' : '#fff',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {!option.avatar_url ? (option.avatar_letter || option.label?.charAt(0) || '•') : null}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {option.label}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {option.role}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                    {assignmentOptions.length === 0 && (
                                        <MenuItem value="owner:auto" disabled>
                                            Brak dostępnych prowadzących
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            {(!canAssignAnyone || assignmentOptions.length <= 1) && (
                                <Typography variant="caption" color="text.secondary">
                                    {!canAssignAnyone
                                        ? 'Twoja rola nie pozwala na zmianę prowadzącego – wydarzenia przypiszemy automatycznie.'
                                        : 'Na razie tylko właściciel strony może prowadzić spotkania.'}
                                </Typography>
                            )}
                            {rosterUnavailable && !rosterLoading && (
                                <Typography variant="caption" color="text.secondary">
                                    Dodaj aktywnych członków zespołu, aby przypisywać wydarzenia do konkretnej osoby.
                                </Typography>
                            )}
                        </Box>
                    </>
                )}

                {!isEvent && (
                    <>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Długość spotkania</InputLabel>
                            <Select
                                value={formData.meetingDuration || '60'}
                                label="Długość spotkania"
                                onChange={(e) => setFormData({ ...formData, meetingDuration: e.target.value })}
                            >
                                <MenuItem value="30">30 minut</MenuItem>
                                <MenuItem value="45">45 minut</MenuItem>
                                <MenuItem value="60">1 godzina</MenuItem>
                                <MenuItem value="90">1,5 godziny</MenuItem>
                                <MenuItem value="120">2 godziny</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Spotkania mogą zaczynać się co</InputLabel>
                            <Select
                                value={formData.timeSnapping}
                                label="Spotkania mogą zaczynać się co"
                                onChange={(e) => setFormData({ ...formData, timeSnapping: e.target.value })}
                            >
                                <MenuItem value="15">15 minut</MenuItem>
                                <MenuItem value="30">30 minut</MenuItem>
                                <MenuItem value="60">60 minut</MenuItem>
                                <MenuItem value="0">Dowolnie</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            type="number"
                            label="Przerwa między spotkaniami (min)"
                            value={formData.bufferTime}
                            onChange={(e) => setFormData({ ...formData, bufferTime: e.target.value })}
                            inputProps={{ min: 0 }}
                            helperText="Minimalny czas między spotkaniami"
                        />
                    </>
                )}
                </Box>

                {/* Participants list at the bottom */}
                {hasBookings && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: theme.palette.text.secondary }}>
                                Uczestnicy ({editingItem.bookings.length})
                            </Typography>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 1
                                }}
                            >
                                {editingItem.bookings.map((booking) => (
                                    <Box
                                        key={booking.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            p: 1.5,
                                            backgroundColor: theme.palette.background.paper,
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 1.5,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                                backgroundColor: theme.palette.action.hover
                                            }
                                        }}
                                    >
                                        {/* Avatar */}
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                backgroundColor: theme.palette.primary.main,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '16px',
                                                flexShrink: 0
                                            }}
                                        >
                                            {booking.client_name?.charAt(0)?.toUpperCase() || <PersonIcon />}
                                        </Box>

                                        {/* Name */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography 
                                                variant="body2" 
                                                fontWeight={600} 
                                                sx={{ 
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {booking.client_name}
                                            </Typography>
                                        </Box>

                                        {/* Action buttons */}
                                        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                            <Tooltip title="Wyślij wiadomość">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleContactBooking(booking)}
                                                    sx={{
                                                        color: theme.palette.primary.main,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.action.hover
                                                        }
                                                    }}
                                                >
                                                    <EmailIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Usuń uczestnika">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveBooking(booking)}
                                                    sx={{
                                                        color: theme.palette.error.main,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.error.light + '20'
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        );
    };

    return (
        <>
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={false}
            fullWidth={false}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    minHeight: '96vh',
                    maxHeight: '98vh',
                    height: '96vh',
                    width: '1000px',
                    maxWidth: '95vw',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1.5  // Reduced padding on the paper itself
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0, mt: 0 }}>
                            {dateFormatted}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {dayEvents.length} wydarzeń • {dayAvailability.length} okien dostępności
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {view === 'timeline' && (
                            <>
                                <Tooltip title="Usuń wszystkie wydarzenia z tego dnia">
                                    <IconButton
                                        onClick={async () => {
                                            if (window.confirm(`Czy na pewno chcesz usunąć wszystkie wydarzenia i bloki dostępności z dnia ${moment(date).format('DD MMMM YYYY')}?`)) {
                                                try {
                                                    // Delete all events from this day
                                                    for (const event of dayEvents) {
                                                        await eventService.deleteEvent(event.id);
                                                    }
                                                    // Delete all availability blocks from this day
                                                    for (const block of dayAvailability) {
                                                        await eventService.deleteAvailabilityBlock(block.id);
                                                    }
                                                    addToast('Usunięto wszystkie elementy z tego dnia', { variant: 'success' });
                                                    // Refresh calendar data
                                                    if (onDataRefresh) {
                                                        await onDataRefresh();
                                                    }
                                                    handleClose();
                                                } catch (error) {
                                                    console.error('Error clearing day:', error);
                                                    addToast('Nie udało się usunąć wszystkich elementów', { variant: 'error' });
                                                }
                                            }
                                        }}
                                        sx={{
                                            color: 'error.main',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                                transform: 'scale(1.1) rotate(-5deg)'
                                            }
                                        }}
                                    >
                                        <MopIcon sx={{ transform: 'rotate(15deg)' }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={isZoomedTimeline ? "Pokaż pełną oś czasu" : "Przybliż do wydarzeń"}>
                                    <IconButton
                                        onClick={() => setIsZoomedTimeline(!isZoomedTimeline)}
                                        sx={{
                                            color: 'primary.main',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(146, 0, 32, 0.08)',
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                    >
                                        <motion.div
                                            key={isZoomedTimeline ? 'zoom-out' : 'zoom-in'}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {isZoomedTimeline ? <ZoomOutIcon /> : <ZoomInIcon />}
                                        </motion.div>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Jak chcesz to zaplanować?">
                                    <Fab
                                        color="primary"
                                        size="small"
                                        onClick={() => setView('chooser')}
                                        sx={{
                                            boxShadow: '0 4px 12px rgba(146, 0, 32, 0.3)'
                                        }}
                                    >
                                        <AddIcon />
                                    </Fab>
                                </Tooltip>
                            </>
                        )}
                        <IconButton onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Stack>
            </DialogTitle>

            <Divider sx={{ mx: -1.5 }} />

            <DialogContent sx={{ pb: 2, px: 2, pt: 2, flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait">
                    {view === 'timeline' && (
                        <motion.div
                            key="timeline"
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.04 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            {renderTimeline()}
                        </motion.div>
                    )}

                    {view === 'chooser' && (
                        <motion.div
                            key="chooser"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    mt: 4,
                                    alignItems: 'center'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                    Jak chcesz to zaplanować?
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ width: '100%', maxWidth: 600 }}>
                                    <Box
                                        onClick={() => handleCreateChoice('event')}
                                        sx={{
                                            flex: 1,
                                            p: 4,
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                            borderRadius: 3,
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 200ms',
                                            '&:hover': {
                                                backgroundColor: 'rgba(146, 0, 32, 0.05)',
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 20px rgba(146, 0, 32, 0.2)'
                                            }
                                        }}
                                    >
                                        <CalendarIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            📅 Konkretne spotkanie
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Ustaw konkretną datę i czas spotkania
                                        </Typography>
                                    </Box>

                                    <Box
                                        onClick={() => handleCreateChoice('availability')}
                                        sx={{
                                            flex: 1,
                                            p: 4,
                                            border: '2px solid',
                                            borderColor: 'success.main',
                                            borderRadius: 3,
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 200ms',
                                            '&:hover': {
                                                backgroundColor: 'rgba(76, 175, 80, 0.05)',
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 20px rgba(76, 175, 80, 0.2)'
                                            }
                                        }}
                                    >
                                        <TimeIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            🕐 Godziny dostępności
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Pozwól klientom rezerwować w tym czasie
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </motion.div>
                    )}

                    {(view === 'createEvent' || view === 'createAvailability' || view === 'editEvent' || view === 'editAvailability') && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.04 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {renderCreationForm()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>

            {(view === 'createEvent' || view === 'createAvailability' || view === 'editEvent' || view === 'editAvailability') && (
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setView('timeline')} variant="outlined">
                        Anuluj
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={submitDisabled}>
                        {(view === 'editEvent' || view === 'editAvailability') ? 'Zaktualizuj' : 'Zapisz'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
        
        {/* Contact Client Dialog */}
        <Dialog
            open={contactFormOpen}
            onClose={() => {
                setContactFormOpen(false);
                setContactingBooking(null);
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2
                }
            }}
        >
            <DialogTitle>
                Wyślij wiadomość do {contactingBooking?.client_name}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Temat"
                        value={contactMessage.subject}
                        onChange={(e) => setContactMessage({ ...contactMessage, subject: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Wiadomość"
                        value={contactMessage.message}
                        onChange={(e) => setContactMessage({ ...contactMessage, message: e.target.value })}
                        placeholder="Napisz wiadomość do klienta..."
                    />
                    <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                        Wiadomość zostanie wysłana na adres email klienta wraz z Twoimi danymi kontaktowymi.
                    </Alert>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                    onClick={() => {
                        setContactFormOpen(false);
                        setContactingBooking(null);
                    }}
                    variant="outlined"
                >
                    Anuluj
                </Button>
                <Button 
                    onClick={handleSendContactMessage}
                    variant="contained"
                    disabled={!contactMessage.subject || !contactMessage.message}
                >
                    Wyślij
                </Button>
            </DialogActions>
        </Dialog>
        
        {/* Booking Details Modal */}
        {bookingModalOpen && (
            <BookingDetailsModal
                open={bookingModalOpen}
                onClose={() => {
                    setBookingModalOpen(false);
                    setSelectedBooking(null);
                }}
                booking={selectedBooking}
                onBookingUpdated={handleBookingModalUpdate}
            />
        )}
        </>
    );
};

DayDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    events: PropTypes.arrayOf(PropTypes.object),
    availabilityBlocks: PropTypes.arrayOf(PropTypes.object),
    sites: PropTypes.arrayOf(PropTypes.object),
    selectedSiteId: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    onCreateEvent: PropTypes.func,
    onCreateAvailability: PropTypes.func,
    operatingStartHour: PropTypes.number,
    operatingEndHour: PropTypes.number,
    onBookingRemoved: PropTypes.func,
    sitePermissions: PropTypes.object,
    rolePermissionMap: PropTypes.object,
    siteRosters: PropTypes.object,
    ensureSiteRoster: PropTypes.func,
    onDataRefresh: PropTypes.func
};

DayDetailsModal.defaultProps = {
    date: new Date(),
    events: [],
    availabilityBlocks: [],
    sites: [],
    selectedSiteId: null,
    onCreateEvent: undefined,
    onCreateAvailability: undefined,
    operatingStartHour: 6,
    operatingEndHour: 22,
    onBookingRemoved: undefined,
    sitePermissions: {},
    rolePermissionMap: {},
    siteRosters: {},
    ensureSiteRoster: undefined
};

export default DayDetailsModal;
