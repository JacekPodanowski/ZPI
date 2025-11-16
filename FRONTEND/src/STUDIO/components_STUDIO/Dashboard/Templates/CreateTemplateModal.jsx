import React, { useState } from 'react';
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
import moment from 'moment';
import 'moment/locale/pl';
import { getSiteColorHex } from '../../../../theme/siteColors';

moment.locale('pl');

const CreateTemplateModal = ({
    open,
    onClose,
    onConfirm,
    templateType, // 'day' or 'week'
    selectedDate,
    events,
    sites
}) => {
    const [templateName, setTemplateName] = useState('');

    if (!open || !selectedDate) return null;

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
        ? moment(selectedDate).format('DD MMMM YYYY')
        : `Tydzień ${moment(selectedDate).format('DD MMMM')} - ${moment(selectedDate).endOf('isoWeek').format('DD MMMM YYYY')}`;

    // Get events for display
    const displayEvents = templateType === 'day'
        ? events.filter(e => moment(e.date).isSame(selectedDate, 'day'))
        : events.filter(e => {
            const eventMoment = moment(e.date);
            return eventMoment.isSameOrAfter(moment(selectedDate).startOf('isoWeek')) &&
                   eventMoment.isSameOrBefore(moment(selectedDate).endOf('isoWeek'));
        });

    // Group events by day for week templates
    const eventsByDay = templateType === 'week'
        ? displayEvents.reduce((acc, event) => {
            const dayKey = moment(event.date).format('YYYY-MM-DD');
            if (!acc[dayKey]) acc[dayKey] = [];
            acc[dayKey].push(event);
            return acc;
        }, {})
        : null;

    const getSiteColor = (siteId) => {
        const site = sites.find(s => s.id === siteId);
        return site ? getSiteColorHex(site.color_index ?? 0) : 'rgb(146, 0, 32)';
    };

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
                    borderColor: 'divider'
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Utwórz szablon {templateType === 'day' ? 'dnia' : 'tygodnia'}
                </Typography>
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

                    {/* Events preview */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Wydarzenia do zapisania:
                        </Typography>

                        {displayEvents.length === 0 ? (
                            <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                Brak wydarzeń w wybranym {templateType === 'day' ? 'dniu' : 'tygodniu'}
                            </Alert>
                        ) : templateType === 'day' ? (
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
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {Object.entries(eventsByDay).sort().map(([dayKey, dayEvents]) => (
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
                                            {moment(dayKey).format('dddd, DD MMMM')}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                            {dayEvents.map((event) => (
                                                <Box
                                                    key={event.id}
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
                                        </Box>
                                    </Box>
                                ))}
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
                    disabled={!templateName.trim() || displayEvents.length === 0}
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
    sites: PropTypes.array.isRequired
};

export default CreateTemplateModal;
