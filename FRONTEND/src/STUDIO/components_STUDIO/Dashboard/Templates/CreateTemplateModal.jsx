import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
    Alert
} from '@mui/material';
import PropTypes from 'prop-types';
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, isBefore, isAfter } from 'date-fns';
import { pl } from 'date-fns/locale';
import { getSiteColorHex } from '../../../../theme/siteColors';

// Helper functions
const isSameOrAfter = (date, dateToCompare) => isSameDay(date, dateToCompare) || isAfter(date, dateToCompare);
const isSameOrBefore = (date, dateToCompare) => isSameDay(date, dateToCompare) || isBefore(date, dateToCompare);

const CreateTemplateModal = ({
    open,
    onClose,
    onConfirm,
    templateType, // 'day' or 'week'
    selectedDate,
    events,
    availabilityBlocks = [],
    sites
}) => {
    const [templateName, setTemplateName] = useState('');

    if (!open || !selectedDate) return null;

    const selectedDateObj = typeof selectedDate === 'string' ? parseISO(selectedDate) : selectedDate;

    const handleConfirm = () => {
        if (!templateName.trim()) return;
        onConfirm(templateName.trim());
        setTemplateName('');
    };

    const handleClose = () => {
        setTemplateName('');
        onClose();
    };

    // Format date display
    const formattedDate = templateType === 'day' 
        ? format(selectedDateObj, 'dd MMMM yyyy', { locale: pl })
        : `Tydzień ${format(selectedDateObj, 'dd MMMM', { locale: pl })} - ${format(endOfWeek(selectedDateObj, { weekStartsOn: 1 }), 'dd MMMM yyyy', { locale: pl })}`;

    // Get events for display
    const displayEvents = templateType === 'day'
        ? events.filter(e => {
            const eventDate = typeof e.date === 'string' ? parseISO(e.date) : e.date;
            return isSameDay(eventDate, selectedDateObj);
        })
        : events.filter(e => {
            const eventDate = typeof e.date === 'string' ? parseISO(e.date) : e.date;
            const weekStart = startOfWeek(selectedDateObj, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(selectedDateObj, { weekStartsOn: 1 });
            return isSameOrAfter(eventDate, weekStart) && isSameOrBefore(eventDate, weekEnd);
        });

    // Get availability blocks for display
    const displayAvailability = templateType === 'day'
        ? availabilityBlocks.filter(block => {
            const blockDate = typeof block.date === 'string' ? parseISO(block.date) : block.date;
            return isSameDay(blockDate, selectedDateObj);
        })
        : availabilityBlocks.filter(block => {
            const blockDate = typeof block.date === 'string' ? parseISO(block.date) : block.date;
            const weekStart = startOfWeek(selectedDateObj, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(selectedDateObj, { weekStartsOn: 1 });
            return isSameOrAfter(blockDate, weekStart) && isSameOrBefore(blockDate, weekEnd);
        });

    // Group events by day for week templates
    const eventsByDay = templateType === 'week'
        ? displayEvents.reduce((acc, event) => {
            const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
            const dayKey = format(eventDate, 'yyyy-MM-dd');
            if (!acc[dayKey]) acc[dayKey] = [];
            acc[dayKey].push(event);
            return acc;
        }, {})
        : null;

    // Group availability blocks by day for week templates
    const availabilityByDay = templateType === 'week'
        ? displayAvailability.reduce((acc, block) => {
            const blockDate = typeof block.date === 'string' ? parseISO(block.date) : block.date;
            const dayKey = format(blockDate, 'yyyy-MM-dd');
            if (!acc[dayKey]) acc[dayKey] = [];
            acc[dayKey].push(block);
            return acc;
        }, {})
        : null;

    const getSiteColor = (siteId) => {
        const site = sites.find(s => s.id === siteId);
        return site ? getSiteColorHex(site.color_index ?? 0) : 'rgb(146, 0, 32)';
    };

    const hasContent = displayEvents.length > 0 || displayAvailability.length > 0;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                }
            }}
        >
            <DialogTitle
                sx={{
                    pb: 2,
                    pt: 3,
                    px: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    fontWeight: 600
                }}
            >
                Utwórz szablon {templateType === 'day' ? 'dnia' : 'tygodnia'}
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {formattedDate}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Template name input */}
                    <TextField
                        autoFocus
                        label="Nazwa szablonu"
                        fullWidth
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder={templateType === 'day' ? 'np. Poranny' : 'np. Standardowy tydzień'}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />

                    {/* Events and Availability preview */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Zawartość szablonu:
                        </Typography>

                        {!hasContent ? (
                            <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                Brak wydarzeń ani bloków dostępności w wybranym {templateType === 'day' ? 'dniu' : 'tygodniu'}
                            </Alert>
                        ) : templateType === 'day' ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Day - Events Section */}
                                {displayEvents.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                                            Wydarzenia ({displayEvents.length})
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {displayEvents.map((event) => (
                                                <Box
                                                    key={event.id}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        borderLeft: `3px solid ${getSiteColor(event.site_id)}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: 'text.secondary',
                                                            minWidth: '80px'
                                                        }}
                                                    >
                                                        {event.start_time} - {event.end_time}
                                                    </Typography>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {event.title}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            {event.event_type === 'group' ? 'Grupowe' : 'Indywidualne'}
                                                            {event.capacity > 1 && ` • ${event.capacity} miejsc`}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* Day - Availability Blocks Section */}
                                {displayAvailability.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                                            Bloki dostępności ({displayAvailability.length})
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {displayAvailability.map((block) => (
                                                <Box
                                                    key={block.id}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        borderLeft: `3px solid ${getSiteColor(block.site)}`,
                                                        backgroundColor: 'rgba(146, 0, 32, 0.03)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: 'text.secondary',
                                                            minWidth: '80px'
                                                        }}
                                                    >
                                                        {block.start_time} - {block.end_time}
                                                    </Typography>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            Dostępność
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Blok czasowy
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {/* Week - Events and Availability by Day */}
                                {[...new Set([
                                    ...Object.keys(eventsByDay || {}),
                                    ...Object.keys(availabilityByDay || {})
                                ])].sort().map((dayKey) => {
                                    const dayEvents = eventsByDay?.[dayKey] || [];
                                    const dayAvailability = availabilityByDay?.[dayKey] || [];
                                    
                                    if (dayEvents.length === 0 && dayAvailability.length === 0) return null;
                                    
                                    return (
                                        <Box key={dayKey}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    mb: 0.75,
                                                    display: 'block'
                                                }}
                                            >
                                                {format(parseISO(dayKey), 'EEEE, dd MMMM', { locale: pl })}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                                {/* Events for this day */}
                                                {dayEvents.map((event) => (
                                                    <Box
                                                        key={`event-${event.id}`}
                                                        sx={{
                                                            p: 1,
                                                            borderRadius: 1.5,
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            borderLeft: `3px solid ${getSiteColor(event.site_id)}`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: 'text.secondary',
                                                                minWidth: '70px'
                                                            }}
                                                        >
                                                            {event.start_time} - {event.end_time}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                            {event.title}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                                
                                                {/* Availability blocks for this day */}
                                                {dayAvailability.map((block) => (
                                                    <Box
                                                        key={`avail-${block.id}`}
                                                        sx={{
                                                            p: 1,
                                                            borderRadius: 1.5,
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            borderLeft: `3px solid ${getSiteColor(block.site)}`,
                                                            backgroundColor: 'rgba(146, 0, 32, 0.03)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: 'text.secondary',
                                                                minWidth: '70px'
                                                            }}
                                                        >
                                                            {block.start_time} - {block.end_time}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, fontStyle: 'italic' }}>
                                                            Dostępność
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    pb: 2.5,
                    pt: 1,
                    gap: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{
                        borderColor: 'rgba(146, 0, 32, 0.24)',
                        color: 'text.primary',
                        fontWeight: 600,
                        px: 3,
                        '&:hover': {
                            borderColor: 'rgba(146, 0, 32, 0.4)',
                            backgroundColor: 'rgba(146, 0, 32, 0.05)'
                        }
                    }}
                >
                    Anuluj
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!templateName.trim() || !hasContent}
                    sx={{
                        backgroundColor: 'primary.main',
                        color: '#fff',
                        fontWeight: 600,
                        px: 3,
                        boxShadow: '0 4px 12px rgba(146, 0, 32, 0.25)',
                        '&:hover': {
                            backgroundColor: 'rgb(114, 0, 21)',
                            boxShadow: '0 6px 16px rgba(146, 0, 32, 0.35)'
                        },
                        '&.Mui-disabled': {
                            backgroundColor: 'action.disabledBackground',
                            color: 'action.disabled'
                        }
                    }}
                >
                    Utwórz szablon
                </Button>
            </DialogActions>
        </Dialog>
    );
};

CreateTemplateModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    templateType: PropTypes.oneOf(['day', 'week']),
    selectedDate: PropTypes.string,
    events: PropTypes.array.isRequired,
    availabilityBlocks: PropTypes.array,
    sites: PropTypes.array.isRequired
};

export default CreateTemplateModal;
