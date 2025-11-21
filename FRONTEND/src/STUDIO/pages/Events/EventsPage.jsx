import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Grid, Card, CardContent, CardActions, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControlLabel, Checkbox } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon, CalendarMonth, LocationOn, People, Edit, Delete, Publish, Unpublished } from '@mui/icons-material';
import { fetchBigEvents, deleteBigEvent, publishBigEvent, unpublishBigEvent } from '../../../services/bigEventService';
import { useToast } from '../../../contexts/ToastContext';

const EventsPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [sendEmailOnPublish, setSendEmailOnPublish] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await fetchBigEvents();
            setEvents(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load events');
            showToast('Nie udało się załadować wydarzeń', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = () => {
        // TODO: Navigate to event creation page
        showToast('Funkcja tworzenia wydarzeń zostanie dodana wkrótce', 'info');
    };

    const handleEditEvent = (eventId) => {
        // TODO: Navigate to event edit page
        showToast('Funkcja edycji wydarzeń zostanie dodana wkrótce', 'info');
    };

    const handleDeleteEvent = (event) => {
        setSelectedEvent(event);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedEvent) return;
        
        try {
            setActionLoading(true);
            await deleteBigEvent(selectedEvent.id);
            showToast('Wydarzenie zostało usunięte', 'success');
            setEvents(events.filter(e => e.id !== selectedEvent.id));
        } catch (err) {
            showToast('Nie udało się usunąć wydarzenia', 'error');
        } finally {
            setActionLoading(false);
            setDeleteDialogOpen(false);
            setSelectedEvent(null);
        }
    };

    const handlePublishClick = (event) => {
        setSelectedEvent(event);
        setSendEmailOnPublish(event.send_email_on_publish || false);
        setPublishDialogOpen(true);
    };

    const confirmPublish = async () => {
        if (!selectedEvent) return;
        
        try {
            setActionLoading(true);
            const result = await publishBigEvent(selectedEvent.id, sendEmailOnPublish);
            showToast(
                result.email_sent 
                    ? 'Wydarzenie zostało opublikowane i wysłano powiadomienia email' 
                    : 'Wydarzenie zostało opublikowane',
                'success'
            );
            await loadEvents();
        } catch (err) {
            showToast('Nie udało się opublikować wydarzenia', 'error');
        } finally {
            setActionLoading(false);
            setPublishDialogOpen(false);
            setSelectedEvent(null);
            setSendEmailOnPublish(false);
        }
    };

    const handleUnpublish = async (event) => {
        try {
            setActionLoading(true);
            await unpublishBigEvent(event.id);
            showToast('Wydarzenie zostało cofnięte z publikacji', 'success');
            await loadEvents();
        } catch (err) {
            showToast('Nie udało się cofnąć publikacji wydarzenia', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                pt: { xs: 10, md: 12 },
                pb: 8,
                px: { xs: 2, sm: 4, md: 6 }
            }}
        >
            {/* Header Section */}
            <Box
                sx={{
                    maxWidth: 1400,
                    mx: 'auto',
                    mb: 6
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                fontSize: { xs: '2rem', md: '2.5rem' }
                            }}
                        >
                            Wydarzenia
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateEvent}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1.5,
                                fontWeight: 600
                            }}
                        >
                            Nowe wydarzenie
                        </Button>
                    </Stack>
                    <Typography variant="body1" color="text.secondary">
                        Zarządzaj dużymi wydarzeniami takimi jak wycieczki, warsztaty czy wyjazdy grupowe
                    </Typography>
                </motion.div>
            </Box>

            {/* Events Grid */}
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                {events.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 8,
                                px: 2
                            }}
                        >
                            <CalendarMonth
                                sx={{
                                    fontSize: 80,
                                    color: 'text.disabled',
                                    mb: 2
                                }}
                            />
                            <Typography variant="h5" gutterBottom>
                                Brak wydarzeń
                            </Typography>
                            <Typography variant="body1" color="text.secondary" mb={3}>
                                Utwórz swoje pierwsze wydarzenie, aby zacząć zarządzać wycieczkami i warsztatami
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateEvent}
                                sx={{ borderRadius: 2, px: 3, py: 1.5 }}
                            >
                                Utwórz wydarzenie
                            </Button>
                        </Box>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <Grid container spacing={3}>
                            {events.map((event, index) => (
                                <Grid item xs={12} sm={6} md={4} key={event.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 3,
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                                                    <Typography variant="h5" fontWeight={600} mb={1}>
                                                        {event.title}
                                                    </Typography>
                                                    <Chip
                                                        label={
                                                            event.status === 'published' ? 'Opublikowane' :
                                                            event.status === 'draft' ? 'Wersja robocza' :
                                                            event.status === 'cancelled' ? 'Anulowane' :
                                                            'Zakończone'
                                                        }
                                                        color={
                                                            event.status === 'published' ? 'success' :
                                                            event.status === 'draft' ? 'warning' :
                                                            'default'
                                                        }
                                                        size="small"
                                                    />
                                                </Stack>
                                                <Stack spacing={1.5}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <CalendarMonth fontSize="small" color="action" />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {new Date(event.start_date).toLocaleDateString('pl-PL', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </Typography>
                                                    </Stack>
                                                    {event.location && (
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <LocationOn fontSize="small" color="action" />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {event.location}
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <People fontSize="small" color="action" />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {event.current_participants} / {event.max_participants} uczestników
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                            <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                                                {event.status === 'draft' && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        startIcon={<Publish />}
                                                        onClick={() => handlePublishClick(event)}
                                                        sx={{ borderRadius: 2 }}
                                                    >
                                                        Publikuj
                                                    </Button>
                                                )}
                                                {event.status === 'published' && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<Unpublished />}
                                                        onClick={() => handleUnpublish(event)}
                                                        sx={{ borderRadius: 2 }}
                                                    >
                                                        Cofnij publikację
                                                    </Button>
                                                )}
                                                <Button
                                                    size="small"
                                                    startIcon={<Edit />}
                                                    onClick={() => handleEditEvent(event.id)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Edytuj
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    startIcon={<Delete />}
                                                    onClick={() => handleDeleteEvent(event)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Usuń
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </AnimatePresence>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !actionLoading && setDeleteDialogOpen(false)}
            >
                <DialogTitle>Usuń wydarzenie</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Czy na pewno chcesz usunąć wydarzenie "{selectedEvent?.title}"? 
                        Tej operacji nie można cofnąć.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)} 
                        disabled={actionLoading}
                    >
                        Anuluj
                    </Button>
                    <Button 
                        onClick={confirmDelete} 
                        color="error" 
                        variant="contained"
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : 'Usuń'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Publish Confirmation Dialog */}
            <Dialog
                open={publishDialogOpen}
                onClose={() => !actionLoading && setPublishDialogOpen(false)}
            >
                <DialogTitle>Publikuj wydarzenie</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Czy chcesz opublikować wydarzenie "{selectedEvent?.title}" na stronie?
                    </DialogContentText>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={sendEmailOnPublish}
                                onChange={(e) => setSendEmailOnPublish(e.target.checked)}
                                disabled={actionLoading}
                            />
                        }
                        label="Wyślij powiadomienie email do subskrybentów newslettera"
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setPublishDialogOpen(false)} 
                        disabled={actionLoading}
                    >
                        Anuluj
                    </Button>
                    <Button 
                        onClick={confirmPublish} 
                        color="primary" 
                        variant="contained"
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : 'Publikuj'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EventsPage;
