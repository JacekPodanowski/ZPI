import React, { useState, useMemo } from 'react';
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
    Person as PersonIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import PropTypes from 'prop-types';
import useTheme from '../../../../theme/useTheme';
import BookingDetailsModal from './BookingDetailsModal';
import * as eventService from '../../../../services/eventService';
import { useToast } from '../../../../contexts/ToastContext';

const computeBlockMetrics = (start, end, dayStartMinutes, dayEndMinutes) => {
    // Handle undefined or invalid time strings
    if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
        console.warn('Invalid time values:', { start, end });
        return { top: '0%', height: '8.33%' }; // Default to 1 hour at start
    }
    
    const startParts = start.split(':');
    const endParts = end.split(':');
    
    // Accept both HH:MM and HH:MM:SS formats
    if (startParts.length < 2 || startParts.length > 3 || endParts.length < 2 || endParts.length > 3) {
        console.warn('Invalid time format:', { start, end });
        return { top: '0%', height: '8.33%' };
    }
    
    const [startHour, startMinute] = startParts.map(Number);
    const [endHour, endMinute] = endParts.map(Number);
    
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        console.warn('Non-numeric time values:', { start, end });
        return { top: '0%', height: '8.33%' };
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
    
    return { top: `${topPercent}%`, height: `${heightPercent}%` };
};

const AvailabilityBlockDisplay = ({ block, siteColor, onClick, dayStartMinutes, dayEndMinutes }) => {
    const metrics = computeBlockMetrics(block.start_time, block.end_time, dayStartMinutes, dayEndMinutes);

    return (
        <Box
            onClick={() => onClick?.(block)}
            sx={{
                position: 'absolute',
                left: 60,
                right: 8,
                top: metrics.top,
                height: metrics.height,
                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                border: '2px dashed rgba(76, 175, 80, 0.4)',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.25)',
                    border: '2px dashed rgba(76, 175, 80, 0.6)',
                    transform: 'scale(1.01)'
                }
            }}
        >
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
    );
};

AvailabilityBlockDisplay.propTypes = {
    block: PropTypes.shape({
        start_time: PropTypes.string.isRequired,
        end_time: PropTypes.string.isRequired,
        title: PropTypes.string
    }).isRequired,
    siteColor: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    dayStartMinutes: PropTypes.number.isRequired,
    dayEndMinutes: PropTypes.number.isRequired
};


const EventDisplay = ({ event, siteColor, onHover, onClick, onBookingClick, dayStartMinutes, dayEndMinutes }) => {
    const metrics = computeBlockMetrics(event.start_time, event.end_time, dayStartMinutes, dayEndMinutes);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            style={{
                position: 'absolute',
                left: 60,
                right: 8,
                top: metrics.top,
                height: metrics.height,
                zIndex: 2
            }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
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
                    overflow: 'hidden'
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 600,
                        color: '#fff',
                        fontSize: '13px',
                        mb: 0.5
                    }}
                >
                    {event.title}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '11px'
                    }}
                >
                    {event.start_time} - {event.end_time}
                </Typography>
                {event.bookings && event.bookings.length > 0 ? (
                    <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
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
        max_capacity: PropTypes.number
    }).isRequired,
    siteColor: PropTypes.string.isRequired,
    onHover: PropTypes.func,
    onClick: PropTypes.func,
    dayStartMinutes: PropTypes.number.isRequired,
    dayEndMinutes: PropTypes.number.isRequired
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
    operatingEndHour = 22
}) => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [view, setView] = useState('timeline'); // 'timeline' | 'chooser' | 'createEvent' | 'createAvailability' | 'editEvent' | 'editAvailability'
    const [hoveredEventId, setHoveredEventId] = useState(null);
    const [editingItem, setEditingItem] = useState(null); // Store the item being edited
    const [selectedBooking, setSelectedBooking] = useState(null); // For BookingDetailsModal
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [contactFormOpen, setContactFormOpen] = useState(false);
    const [contactingBooking, setContactingBooking] = useState(null);
    const [contactMessage, setContactMessage] = useState({
        subject: 'Zmiana w terminie spotkania',
        message: 'Witam,\n\nNiestety muszę wprowadzić zmiany w harmonogramie. Proszę o kontakt w celu ustalenia nowego terminu.\n\nPrzepraszam za niedogodności.\nPozdrawiam'
    });
    const [formData, setFormData] = useState({
        title: '',
        startTime: '10:00',
        endTime: '11:00',
        type: 'online',
        location: '',
        meetingType: 'individual',
        capacity: 1,
        meetingLengths: ['30', '60'],
        timeSnapping: '30',
        bufferTime: '0',
        siteId: selectedSiteId || null  // Add siteId to form data
    });

    const dateFormatted = useMemo(() => moment(date).format('dddd, D MMMM YYYY'), [date]);
    const dateKey = useMemo(() => moment(date).format('YYYY-MM-DD'), [date]);

    const dayEvents = useMemo(() => {
        return events.filter(e => moment(e.date).format('YYYY-MM-DD') === dateKey);
    }, [events, dateKey]);

    const dayAvailability = useMemo(() => {
        return availabilityBlocks.filter(b => moment(b.date).format('YYYY-MM-DD') === dateKey);
    }, [availabilityBlocks, dateKey]);

    // Calculate extended timeline based on events outside operating hours
    const { actualStartHour, actualEndHour, dayStartMinutes, dayEndMinutes } = useMemo(() => {
        // Parse operating hours - floor the start hour, ceil the end hour
        const parseHour = (timeValue) => {
            if (typeof timeValue === 'string') {
                const [hours] = timeValue.split(':').map(Number);
                return hours;
            }
            return timeValue;
        };
        
        let minHour = Math.floor(parseHour(operatingStartHour));
        let maxHour = Math.ceil(parseHour(operatingEndHour));

        // Check all events for times outside operating hours
        [...dayEvents, ...dayAvailability].forEach(item => {
            const startTime = item.start_time;
            const endTime = item.end_time;
            
            if (startTime && typeof startTime === 'string') {
                const [startHour] = startTime.split(':').map(Number);
                if (!isNaN(startHour) && startHour < minHour) {
                    minHour = Math.floor(startHour);
                }
            }
            
            if (endTime && typeof endTime === 'string') {
                const [endHour] = endTime.split(':').map(Number);
                if (!isNaN(endHour) && endHour > maxHour) {
                    maxHour = Math.ceil(endHour);
                }
            }
        });

        return {
            actualStartHour: minHour,
            actualEndHour: maxHour,
            dayStartMinutes: minHour * 60,
            dayEndMinutes: maxHour * 60
        };
    }, [dayEvents, dayAvailability, operatingStartHour, operatingEndHour]);

    const HOURS = useMemo(() => {
        return Array.from({ length: actualEndHour - actualStartHour }, (_, idx) => actualStartHour + idx);
    }, [actualStartHour, actualEndHour]);

    const HOUR_HEIGHT = 60;
    const timelineHeight = ((dayEndMinutes - dayStartMinutes) / 60) * HOUR_HEIGHT;

    const handleClose = () => {
        setView('timeline');
        setFormData({
            title: '',
            startTime: '10:00',
            endTime: '11:00',
            type: 'online',
            location: '',
            meetingType: 'individual',
            capacity: 1,
            meetingLengths: ['30', '60'],
            timeSnapping: '30',
            bufferTime: '0',
            siteId: selectedSiteId || null
        });
        onClose();
    };

    const handleCreateChoice = (type) => {
        setView(type === 'event' ? 'createEvent' : 'createAvailability');
    };

    const handleEventClick = (event) => {
        setEditingItem(event);
        setFormData({
            title: event.title || '',
            startTime: event.start_time || '10:00',
            endTime: event.end_time || '11:00',
            type: event.type || 'online',
            location: event.location || '',
            meetingType: event.event_type || 'individual',
            capacity: event.max_capacity || 1,
            meetingLengths: ['30', '60'],
            timeSnapping: '30',
            bufferTime: '0',
            siteId: event.site || selectedSiteId || null
        });
        setView('editEvent');
    };

    const handleAvailabilityClick = (block) => {
        setEditingItem(block);
        setFormData({
            title: block.title || 'Dostępny',
            startTime: block.start_time || '10:00',
            endTime: block.end_time || '11:00',
            type: 'online',
            location: '',
            meetingType: 'individual',
            capacity: 1,
            meetingLengths: block.meeting_lengths || ['30', '60'],
            timeSnapping: block.time_snapping || '30',
            bufferTime: block.buffer_time || '0',
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
            showToast('Wiadomość została wysłana', 'success');
            setContactFormOpen(false);
            setContactingBooking(null);
            setContactMessage({
                subject: 'Zmiana w terminie spotkania',
                message: 'Witam,\n\nNiestety muszę wprowadzić zmiany w harmonogramie. Proszę o kontakt w celu ustalenia nowego terminu.\n\nPrzepraszam za niedogodności.\nPozdrawiam'
            });
        } catch (error) {
            console.error('Error sending message:', error);
            showToast('Nie udało się wysłać wiadomości', 'error');
        }
    };

    const handleRemoveBooking = async (booking) => {
        if (!window.confirm(`Czy na pewno chcesz usunąć uczestnika ${booking.client_name}? Zostanie wysłany email z powiadomieniem.`)) {
            return;
        }

        try {
            await eventService.cancelBooking(booking.id);
            showToast('Uczestnik został usunięty, wysłano powiadomienie email', 'success');
            
            // Refresh the event data
            if (editingItem) {
                const updatedBookings = editingItem.bookings.filter(b => b.id !== booking.id);
                setEditingItem({ ...editingItem, bookings: updatedBookings });
            }
            
            // Trigger parent refresh
            window.location.reload();
        } catch (error) {
            console.error('Error removing booking:', error);
            showToast('Nie udało się usunąć uczestnika', 'error');
        }
    };

    const handleSubmit = () => {
        if (view === 'createEvent') {
            onCreateEvent?.({
                ...formData,
                date: dateKey
            });
        } else if (view === 'createAvailability') {
            onCreateAvailability?.({
                ...formData,
                date: dateKey
            });
        }
        
        // Reset form and return to timeline instead of closing modal
        setFormData({
            title: '',
            startTime: '10:00',
            endTime: '11:00',
            type: 'online',
            location: '',
            meetingType: 'individual',
            capacity: 1,
            meetingLengths: ['30', '60'],
            timeSnapping: '30',
            bufferTime: '0',
            siteId: selectedSiteId || null
        });
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

            {/* Availability blocks (rendered first, under events) */}
            {dayAvailability.map((block) => (
                <AvailabilityBlockDisplay
                    key={block.id}
                    block={block}
                    siteColor={sites.find(s => s.id === (block.site_id || block.site))?.color_tag || 'rgb(146, 0, 32)'}
                    onClick={handleAvailabilityClick}
                    dayStartMinutes={dayStartMinutes}
                    dayEndMinutes={dayEndMinutes}
                />
            ))}

            {/* Events */}
            {dayEvents.map((event) => (
                <EventDisplay
                    key={event.id}
                    event={event}
                    siteColor={sites.find(s => s.id === (event.site_id || event.site))?.color_tag || 'rgb(146, 0, 32)'}
                    onHover={setHoveredEventId}
                    onClick={handleEventClick}
                    onBookingClick={(booking) => {
                        setSelectedBooking(booking);
                        setBookingModalOpen(true);
                    }}
                    dayStartMinutes={dayStartMinutes}
                    dayEndMinutes={dayEndMinutes}
                />
            ))}
            </Box>
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

                {/* Site selector */}
                <FormControl fullWidth required>
                    <InputLabel>Strona</InputLabel>
                    <Select
                        value={formData.siteId || ''}
                        label="Strona"
                        onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                    >
                        {sites.map((site) => (
                            <MenuItem key={site.id} value={site.id}>
                                {site.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

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
                    </>
                )}

                {!isEvent && (
                    <>
                        <TextField
                            fullWidth
                            label="Długości spotkań (min, oddzielone przecinkiem)"
                            value={formData.meetingLengths.join(', ')}
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                meetingLengths: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            })}
                            placeholder="30, 45, 60"
                            helperText="Możliwe długości spotkań, które klient może wybrać"
                        />

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
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    minHeight: '96vh',
                    maxHeight: '98vh',
                    height: '96vh',
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
                    <Stack direction="row" spacing={1}>
                        {view === 'timeline' && (
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
                        )}
                        <IconButton onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Stack>
            </DialogTitle>

            <Divider sx={{ mx: -1.5 }} />

            <DialogContent sx={{ pb: 2, px: 2, pt: 2, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait">
                    {view === 'timeline' && (
                        <motion.div
                            key="timeline"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            {renderTimeline()}
                        </motion.div>
                    )}

                    {view === 'chooser' && (
                        <motion.div
                            key="chooser"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
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
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
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
                    <Button onClick={handleSubmit} variant="contained">
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
                onBookingUpdated={() => {
                    // Refresh events after booking is cancelled
                    window.location.reload(); // Simple refresh, can be improved
                }}
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
    operatingEndHour: PropTypes.number
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
    operatingEndHour: 22
};

export default DayDetailsModal;
