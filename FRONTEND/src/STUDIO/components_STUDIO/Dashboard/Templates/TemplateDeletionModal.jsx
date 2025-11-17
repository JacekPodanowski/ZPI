import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Alert
} from '@mui/material';
import {
    DeleteOutline as DeleteIcon,
    Warning as WarningIcon,
    EventNote as EventIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const TemplateDeletionModal = ({
    open,
    onClose,
    onConfirm,
    template
}) => {
    // Don't render anything if modal is not open or data is missing
    if (!open || !template) return null;

    const templateType = template.day_abbreviation ? 'day' : 'week';
    const eventCount = templateType === 'day' 
        ? (template.events?.length || 0) 
        : (template.total_events || 0);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    border: '2px solid rgba(146, 0, 32, 0.2)'
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
                <DeleteIcon sx={{ color: 'error.main', fontSize: 28 }} />
                <Typography sx={{ fontWeight: 600, flex: 1, fontSize: '1.25rem' }}>
                    Usuń szablon
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Template Name */}
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5 }}>
                            Czy na pewno chcesz usunąć szablon{' '}
                            <Typography component="span" sx={{ fontWeight: 700, color: 'error.main' }}>
                                "{template.name}"
                            </Typography>
                            ?
                        </Typography>
                    </Box>

                    {/* Event Count Info */}
                    {eventCount > 0 && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            <EventIcon sx={{ color: 'rgb(59, 130, 246)', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                Szablon zawiera {eventCount} {eventCount === 1 ? 'wydarzenie' : 'wydarzeń'}
                            </Typography>
                        </Box>
                    )}

                    {/* Warning */}
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
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Ta operacja jest nieodwracalna
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Szablon zostanie trwale usunięty
                        </Typography>
                    </Alert>
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
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    sx={{
                        fontWeight: 600,
                        px: 3,
                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.25)',
                        '&:hover': {
                            boxShadow: '0 6px 16px rgba(211, 47, 47, 0.35)'
                        }
                    }}
                >
                    Usuń szablon
                </Button>
            </DialogActions>
        </Dialog>
    );
};

TemplateDeletionModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    template: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        day_abbreviation: PropTypes.string,
        events: PropTypes.array,
        total_events: PropTypes.number
    })
};

export default TemplateDeletionModal;
