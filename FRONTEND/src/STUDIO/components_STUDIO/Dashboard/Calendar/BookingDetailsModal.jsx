import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    TextField,
    Divider,
    Stack,
    Chip,
    IconButton,
    Alert
} from '@mui/material';
import {
    Close as CloseIcon,
    Email as EmailIcon,
    Cancel as CancelIcon,
    Person as PersonIcon,
    Event as EventIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import { useToast } from '../../../../contexts/ToastContext';
import { cancelBooking, contactClient } from '../../../../services/eventService';

const BookingDetailsModal = ({ open, onClose, booking, onBookingUpdated }) => {
    const [activeTab, setActiveTab] = useState('details'); // 'details', 'contact', 'cancel'
    const [contactSubject, setContactSubject] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const addToast = useToast();

    if (!booking) return null;

    const handleContactSubmit = async () => {
        if (!contactMessage.trim()) {
            setError('Wiadomość nie może być pusta');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await contactClient(
                booking.id,
                contactSubject || 'Wiadomość dotycząca Twojej rezerwacji',
                contactMessage
            );
            addToast('Wiadomość została wysłana', { variant: 'success' });
            setContactSubject('');
            setContactMessage('');
            setActiveTab('details');
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Nie udało się wysłać wiadomości. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) {
            setError('Podaj powód odwołania');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await cancelBooking(booking.id, cancelReason);
            addToast('Spotkanie zostało odwołane', { variant: 'success' });
            onBookingUpdated?.({
                action: 'cancel',
                bookingId: booking.id,
                eventId: booking.event ?? booking.event_id ?? booking.event_details?.id ?? booking.event_details?.event ?? null,
                booking
            });
            onClose();
        } catch (err) {
            console.error('Error cancelling booking:', err);
            setError('Nie udało się odwołać spotkania. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    const renderDetails = () => (
        <Box>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <PersonIcon fontSize="small" />
                        Klient
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                        {booking.client_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {booking.client_email}
                    </Typography>
                </Box>

                <Divider />

                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <EventIcon fontSize="small" />
                        Spotkanie
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                        {booking.event_details?.title}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <ScheduleIcon fontSize="small" />
                        Termin
                    </Typography>
                    <Typography variant="body2">
                        {format(parseISO(booking.event_details?.start_time), 'dd.MM.yyyy, HH:mm')} - {format(parseISO(booking.event_details?.end_time), 'HH:mm')}
                    </Typography>
                </Box>

                {booking.notes && (
                    <>
                        <Divider />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                                Notatki
                            </Typography>
                            <Typography variant="body2">
                                {booking.notes}
                            </Typography>
                        </Box>
                    </>
                )}

                <Divider />

                <Typography variant="caption" color="text.secondary">
                    Spotkanie zarezerwowane: {moment(booking.created_at).format('DD.MM.YYYY, HH:mm')}
                </Typography>
            </Stack>
        </Box>
    );

    const renderContactForm = () => (
        <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
                Wiadomość zostanie wysłana na adres: {booking.client_email}
            </Alert>

            <Stack spacing={2}>
                <TextField
                    label="Temat (opcjonalnie)"
                    fullWidth
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="Wiadomość dotycząca Twojego spotkania"
                />

                <TextField
                    label="Wiadomość"
                    fullWidth
                    multiline
                    rows={6}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Wpisz swoją wiadomość..."
                    required
                />
            </Stack>
        </Box>
    );

    const renderCancelForm = () => (
        <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
                Odwołanie spotkania jest nieodwracalne. Klient otrzyma powiadomienie email.
            </Alert>

            <TextField
                label="Powód odwołania"
                fullWidth
                multiline
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Podaj powód odwołania spotkania..."
                required
            />
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                    Szczegóły spotkania
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Box sx={{ px: 3, pb: 2 }}>
                <Stack direction="row" spacing={1}>
                    <Chip
                        label="Szczegóły"
                        onClick={() => setActiveTab('details')}
                        color={activeTab === 'details' ? 'primary' : 'default'}
                        sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                        label="Wyślij wiadomość"
                        icon={<EmailIcon fontSize="small" />}
                        onClick={() => setActiveTab('contact')}
                        color={activeTab === 'contact' ? 'primary' : 'default'}
                        sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                        label="Odwołaj spotkanie"
                        icon={<CancelIcon fontSize="small" />}
                        onClick={() => setActiveTab('cancel')}
                        color={activeTab === 'cancel' ? 'error' : 'default'}
                        sx={{ cursor: 'pointer' }}
                    />
                </Stack>
            </Box>

            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'details' && renderDetails()}
                    {activeTab === 'contact' && renderContactForm()}
                    {activeTab === 'cancel' && renderCancelForm()}
                </motion.div>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                {activeTab === 'details' && (
                    <Button onClick={onClose} variant="contained">
                        Zamknij
                    </Button>
                )}

                {activeTab === 'contact' && (
                    <>
                        <Button onClick={() => setActiveTab('details')}>
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleContactSubmit}
                            variant="contained"
                            disabled={loading || !contactMessage.trim()}
                            startIcon={<EmailIcon />}
                        >
                            {loading ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                        </Button>
                    </>
                )}

                {activeTab === 'cancel' && (
                    <>
                        <Button onClick={() => setActiveTab('details')}>
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleCancelBooking}
                            variant="contained"
                            color="error"
                            disabled={loading || !cancelReason.trim()}
                            startIcon={<CancelIcon />}
                        >
                            {loading ? 'Odwoływanie...' : 'Odwołaj spotkanie'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

BookingDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    booking: PropTypes.shape({
        id: PropTypes.number.isRequired,
        client_name: PropTypes.string.isRequired,
        client_email: PropTypes.string.isRequired,
        event_details: PropTypes.shape({
            title: PropTypes.string.isRequired,
            start_time: PropTypes.string.isRequired,
            end_time: PropTypes.string.isRequired,
        }).isRequired,
        notes: PropTypes.string,
        created_at: PropTypes.string.isRequired,
    }),
    onBookingUpdated: PropTypes.func
};

export default BookingDetailsModal;
