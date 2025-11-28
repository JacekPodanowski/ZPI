import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Chip,
    Alert
} from '@mui/material';
import {
    CalendarMonth as CalendarIcon,
    Warning as WarningIcon,
    EventNote as EventIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import moment from 'moment';

const TemplateConfirmationModal = ({
    open,
    onClose,
    onConfirm,
    template,
    targetDate,
    affectedEvents = []
}) => {
    // Don't render anything if modal is not open or data is missing
    if (!open || !template || !targetDate) return null;

    const templateType = template.day_abbreviation ? 'day' : 'week';
    const willOverwrite = affectedEvents.length > 0;
    
    // Check if target date is in the past
    const targetMoment = moment(targetDate);
    const isTargetPast = targetMoment.isBefore(moment(), 'day');
    const isToday = targetMoment.isSame(moment(), 'day');
    
    // Calculate available (non-past) days for week templates
    let availableDayCount = 0;
    let allDaysInPast = false;
    
    if (templateType === 'week') {
        const startOfWeek = targetMoment.clone().startOf('isoWeek');
        const today = moment().startOf('day');
        
        // Count how many days in the week are today or in the future
        for (let i = 0; i < 7; i++) {
            const day = startOfWeek.clone().add(i, 'days');
            if (day.isSameOrAfter(today, 'day')) {
                availableDayCount++;
            }
        }
        
        allDaysInPast = availableDayCount === 0;
    } else {
        // For day template
        allDaysInPast = isTargetPast;
    }
    
    // Format date based on template type
    let formattedDate;
    if (templateType === 'day') {
        formattedDate = moment(targetDate).format('DD MMMM YYYY');
    } else {
        // For week template, show date range
        const startOfWeek = moment(targetDate).startOf('isoWeek');
        const endOfWeek = moment(targetDate).endOf('isoWeek');
        formattedDate = `${startOfWeek.format('DD MMMM')} - ${endOfWeek.format('DD MMMM YYYY')}`;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    border: '2px solid rgba(146, 0, 32, 0.15)'
                }
            }}
        >
            <DialogTitle
                sx={{
                    pb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <EventIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                        Zastosować szablon "{template.name}"?
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Date Information */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: 'rgba(228, 229, 218, 0.3)'
                        }}
                    >
                        <CalendarIcon sx={{ color: 'primary.main' }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                Data
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formattedDate}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Template Info */}
                    <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                            Szablon zawiera:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {templateType === 'day' && template.events && (
                                <Chip
                                    size="small"
                                    label={`${template.events.length} wydarzeń`}
                                    sx={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                        color: 'rgb(59, 130, 246)',
                                        fontWeight: 600
                                    }}
                                />
                            )}
                            {templateType === 'week' && (
                                <>
                                    <Chip
                                        size="small"
                                        label={`${template.day_count || template.active_days?.length || 0} dni`}
                                        sx={{
                                            backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                            color: 'rgb(59, 130, 246)',
                                            fontWeight: 600
                                        }}
                                    />
                                    <Chip
                                        size="small"
                                        label={`${template.total_events || 0} wydarzeń`}
                                        sx={{
                                            backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                            color: 'rgb(59, 130, 246)',
                                            fontWeight: 600
                                        }}
                                    />
                                </>
                            )}
                        </Box>
                    </Box>

                    {/* Warning if all days are in the past */}
                    {allDaysInPast && (
                        <Alert
                            severity="error"
                            icon={<WarningIcon />}
                            sx={{
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                    color: 'error.main'
                                }
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Nie można zastosować szablonu do przeszłych dni
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {templateType === 'day' 
                                    ? 'Ten dzień już minął. Wybierz dzisiejszy lub przyszły dzień.'
                                    : 'Wszystkie dni w tym tygodniu już minęły. Wybierz przyszły tydzień.'}
                            </Typography>
                        </Alert>
                    )}

                    {/* Warning if some days will be skipped (for week templates) */}
                    {!allDaysInPast && templateType === 'week' && availableDayCount < 7 && (
                        <Alert
                            severity="info"
                            sx={{
                                borderRadius: 2,
                                backgroundColor: 'rgba(59, 130, 246, 0.08)'
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Szablon zostanie zastosowany do {availableDayCount} {availableDayCount === 1 ? 'dnia' : 'dni'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Przeszłe dni zostaną pominięte. Szablon będzie zastosowany tylko do dzisiejszego i przyszłych dni.
                            </Typography>
                        </Alert>
                    )}

                    {/* Warning if overwriting */}
                    {!allDaysInPast && willOverwrite && (
                        <Alert
                            severity="warning"
                            icon={<WarningIcon />}
                            sx={{
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                    color: 'warning.main'
                                }
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {templateType === 'week' 
                                    ? `Znaleziono ${affectedEvents.length} ${affectedEvents.length === 1 ? 'wydarzenie' : affectedEvents.length < 5 ? 'wydarzenia' : 'wydarzeń'} w tym tygodniu`
                                    : `Nadpisane zostaną ${affectedEvents.length} ${affectedEvents.length === 1 ? 'wydarzenie' : affectedEvents.length < 5 ? 'wydarzenia' : 'wydarzeń'}`
                                }
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {templateType === 'week'
                                    ? 'Możesz je zastąpić szablonem lub dodać wydarzenia z szablonu do istniejących'
                                    : 'Możesz je zastąpić szablonem lub dodać wydarzenia z szablonu do istniejących'
                                }
                            </Typography>
                        </Alert>
                    )}

                    {/* Success message if no conflicts */}
                    {!allDaysInPast && !willOverwrite && (
                        <Alert
                            severity="success"
                            sx={{
                                borderRadius: 2,
                                backgroundColor: 'rgba(76, 175, 80, 0.08)'
                            }}
                        >
                            <Typography variant="body2">
                                Szablon zostanie zastosowany bez konfliktów
                            </Typography>
                        </Alert>
                    )}
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
                    onClick={onClose}
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
                
                {/* Show different buttons based on whether there are conflicts */}
                {willOverwrite ? (
                    <>
                        {/* Add button - adds template events without removing existing ones */}
                        <Button
                            onClick={() => onConfirm('add')}
                            variant="outlined"
                            disabled={allDaysInPast}
                            sx={{
                                borderColor: 'rgba(59, 130, 246, 0.4)',
                                color: 'rgb(59, 130, 246)',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                    borderColor: 'rgb(59, 130, 246)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.08)'
                                },
                                '&.Mui-disabled': {
                                    borderColor: 'action.disabledBackground',
                                    color: 'action.disabled'
                                }
                            }}
                        >
                            Dodaj
                        </Button>
                        
                        {/* Replace button - removes existing events and adds template events */}
                        <Button
                            onClick={() => onConfirm('replace')}
                            variant="contained"
                            disabled={allDaysInPast}
                            sx={{
                                backgroundColor: allDaysInPast ? 'action.disabledBackground' : 'primary.main',
                                color: allDaysInPast ? 'action.disabled' : '#fff',
                                fontWeight: 600,
                                px: 3,
                                boxShadow: allDaysInPast ? 'none' : '0 4px 12px rgba(146, 0, 32, 0.25)',
                                '&:hover': {
                                    backgroundColor: allDaysInPast ? 'action.disabledBackground' : 'rgb(114, 0, 21)',
                                    boxShadow: allDaysInPast ? 'none' : '0 6px 16px rgba(146, 0, 32, 0.35)'
                                },
                                '&.Mui-disabled': {
                                    color: 'action.disabled'
                                }
                            }}
                        >
                            Zamień
                        </Button>
                    </>
                ) : (
                    /* Apply button - no conflicts, just apply */
                    <Button
                        onClick={() => onConfirm('apply')}
                        variant="contained"
                        disabled={allDaysInPast}
                        sx={{
                            backgroundColor: allDaysInPast ? 'action.disabledBackground' : 'primary.main',
                            color: allDaysInPast ? 'action.disabled' : '#fff',
                            fontWeight: 600,
                            px: 3,
                            boxShadow: allDaysInPast ? 'none' : '0 4px 12px rgba(146, 0, 32, 0.25)',
                            '&:hover': {
                                backgroundColor: allDaysInPast ? 'action.disabledBackground' : 'rgb(114, 0, 21)',
                                boxShadow: allDaysInPast ? 'none' : '0 6px 16px rgba(146, 0, 32, 0.35)'
                            },
                            '&.Mui-disabled': {
                                color: 'action.disabled'
                            }
                        }}
                    >
                        Zastosuj szablon
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

TemplateConfirmationModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    template: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        day_abbreviation: PropTypes.string,
        events: PropTypes.array,
        day_count: PropTypes.number,
        active_days: PropTypes.array,
        total_events: PropTypes.number
    }),
    targetDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    affectedEvents: PropTypes.array
};

export default TemplateConfirmationModal;
