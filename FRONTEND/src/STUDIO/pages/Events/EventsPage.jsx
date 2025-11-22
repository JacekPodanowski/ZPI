import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Grid, Card, CardContent, CardActions, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControlLabel, Checkbox, TextField, MenuItem, InputAdornment, IconButton, Drawer } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Add as AddIcon, CalendarMonth, LocationOn, Edit, Delete, Publish, Unpublished, FilterList, Clear, Search, ExpandMore, ExpandLess, Chat as ChatIcon } from '@mui/icons-material';
import { fetchBigEvents, deleteBigEvent, publishBigEvent, unpublishBigEvent, createBigEvent, updateBigEvent } from '../../../services/bigEventService';
import { useToast } from '../../../contexts/ToastContext';
import { fetchSites } from '../../../services/siteService';
import ImageUploader from '../../../components/ImageUploader';
import { uploadMedia } from '../../../services/mediaService';
import { isTempBlobUrl, retrieveTempImage } from '../../../services/tempMediaCache';
import AIChatPanel from '../../components_STUDIO/AI/AIChatPanel';

const INITIAL_FORM_VALUES = {
    site: '',
    title: '',
    summary: '',
    description: '',
    location: '',
    tag: '',
    startDate: '',
    endDate: '',
    maxParticipants: '20',
    price: '',
    imageUrl: '',
    galleryImages: '',
    fullDescription: '',
    ctaLabel: '',
    ctaUrl: '',
    sendEmailOnPublish: false
};

const EventsPage = () => {
    const showToast = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [sendEmailOnPublish, setSendEmailOnPublish] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [sites, setSites] = useState([]);
    const [sitesLoading, setSitesLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
    const [filters, setFilters] = useState({
        siteId: 'all',
        status: 'all',
        search: '',
        dateFrom: '',
        dateTo: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    
    // AI Chat state
    const [aiChatOpen, setAiChatOpen] = useState(false);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [selectedSiteForChat, setSelectedSiteForChat] = useState(null);

    useEffect(() => {
        loadEvents();
        loadSites();
        
        // Listen for big event created by AI
        const handleBigEventCreated = (event) => {
            console.log('[Events] Big event created by AI:', event.detail);
            loadEvents(); // Reload events list
            showToast('Wydarzenie zostało dodane!', 'success');
        };
        
        window.addEventListener('big-event-created', handleBigEventCreated);
        
        return () => {
            window.removeEventListener('big-event-created', handleBigEventCreated);
        };
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

    const normalizeSitesResponse = (data) => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.results)) {
            return data.results;
        }

        const ownedSites = Array.isArray(data?.owned_sites) ? data.owned_sites : [];
        const teamSitesRaw = Array.isArray(data?.team_member_sites) ? data.team_member_sites : [];
        const manageableTeamSites = teamSitesRaw.filter((site) => {
            const permissions = site?.permissions || site?.capabilities;
            if (!permissions) return true;
            if (typeof permissions.can_manage_events === 'boolean') {
                return permissions.can_manage_events;
            }
            if (typeof permissions.can_edit_site === 'boolean') {
                return permissions.can_edit_site;
            }
            return true;
        });

        return [...ownedSites, ...manageableTeamSites];
    };

    const loadSites = async () => {
        try {
            setSitesLoading(true);
            const data = await fetchSites();
            const normalizedSites = normalizeSitesResponse(data);

            setSites(normalizedSites);
            setFormValues((prev) => ({
                ...prev,
                site: prev.site || (normalizedSites[0] ? String(normalizedSites[0].id) : '')
            }));
        } catch (err) {
            console.error(err);
            showToast('Nie udało się pobrać listy stron', 'error');
        } finally {
            setSitesLoading(false);
        }
    };

    const canCreateEvent = useMemo(() => !sitesLoading && sites.length > 0, [sitesLoading, sites.length]);

    const getEventSiteId = (event) => {
        if (!event) return null;
        if (typeof event.site === 'object' && event.site) {
            return event.site.id;
        }
        return event.site ?? event.site_id ?? event.siteId ?? null;
    };

    const handleFilterChange = (field) => (event) => {
        const value = event?.target?.value ?? '';
        setFilters((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            siteId: 'all',
            status: 'all',
            search: '',
            dateFrom: '',
            dateTo: ''
        });
    };

    const handleImageUploadChange = (value) => {
        const nextValue = Array.isArray(value) ? value[0] : value;
        setFormValues((prev) => ({
            ...prev,
            imageUrl: nextValue || ''
        }));
    };

    const resolveImageUrlForSubmit = async (value, siteIdNumber) => {
        if (!value) return null;
        if (!isTempBlobUrl(value)) {
            return value.trim();
        }

        const file = await retrieveTempImage(value);
        if (!file) {
            throw new Error('Nie udało się odczytać przesłanego pliku. Spróbuj ponownie.');
        }

        const uploadResult = await uploadMedia(file, {
            usage: 'site_content',
            siteId: siteIdNumber || undefined
        });

        if (!uploadResult?.url) {
            throw new Error('Serwer nie zwrócił adresu przesłanego obrazu.');
        }

        return uploadResult.url.trim();
    };

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const siteId = getEventSiteId(event);
            const statusMatch = filters.status === 'all' || event.status === filters.status;
            const siteMatch = filters.siteId === 'all' || String(siteId) === String(filters.siteId);

            let searchMatch = true;
            if (filters.search.trim()) {
                const haystack = [event.title, event.description, event.location]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                searchMatch = haystack.includes(filters.search.trim().toLowerCase());
            }

            const eventDate = event.start_date ? new Date(event.start_date) : null;
            let dateMatch = true;
            if (filters.dateFrom && eventDate) {
                dateMatch = eventDate >= new Date(filters.dateFrom);
            }
            if (dateMatch && filters.dateTo && eventDate) {
                dateMatch = eventDate <= new Date(filters.dateTo);
            }

            return statusMatch && siteMatch && searchMatch && dateMatch;
        });
    }, [events, filters]);

    const resetFormValues = (fallbackSiteId = '') => ({
        ...INITIAL_FORM_VALUES,
        site: fallbackSiteId
    });

    const handleCreateEvent = () => {
        if (!canCreateEvent) {
            showToast('Dodaj najpierw stronę, aby móc tworzyć wydarzenia.', 'warning');
            return;
        }
        const defaultSite = sites[0] ? String(sites[0].id) : '';
        setFormValues(resetFormValues(defaultSite));
        setIsEditing(false);
        setEditingEventId(null);
        setCreateDialogOpen(true);
    };

    const handleCreateDialogClose = () => {
        if (createLoading) return;
        setCreateDialogOpen(false);
        const defaultSite = sites[0] ? String(sites[0].id) : '';
        setFormValues(resetFormValues(defaultSite));
        setIsEditing(false);
        setEditingEventId(null);
    };

    const handleFormChange = (field) => (event) => {
        const value = event.target.value;
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleToggleSendEmail = (event) => {
        setFormValues((prev) => ({ ...prev, sendEmailOnPublish: event.target.checked }));
    };

    const handleCreateSubmit = async () => {
        if (!formValues.site) {
            showToast('Wybierz stronę dla wydarzenia', 'warning');
            return;
        }
        if (!formValues.title.trim()) {
            showToast('Podaj nazwę wydarzenia', 'warning');
            return;
        }
        if (!formValues.startDate) {
            showToast('Wybierz datę rozpoczęcia', 'warning');
            return;
        }

        const siteIdNumber = Number(formValues.site);
        if (Number.isNaN(siteIdNumber)) {
            showToast('Nie udało się odczytać wybranej strony. Odśwież widok i spróbuj ponownie.', 'error');
            return;
        }

        try {
            setCreateLoading(true);
            const imageUrl = await resolveImageUrlForSubmit(formValues.imageUrl, siteIdNumber);

            const payload = {
                site: siteIdNumber,
                title: formValues.title.trim(),
                description: formValues.description.trim(),
                location: formValues.location.trim(),
                start_date: formValues.startDate,
                end_date: formValues.endDate || null,
                max_participants: Number(formValues.maxParticipants) || 0,
                price: formValues.price || '0',
                send_email_on_publish: formValues.sendEmailOnPublish,
                image_url: imageUrl,
                details: {
                    summary: formValues.summary.trim() || formValues.description.trim(),
                    tag: formValues.tag.trim() || null,
                    full_description: formValues.fullDescription.trim(),
                    cta_label: formValues.ctaLabel.trim() || null,
                    cta_url: formValues.ctaUrl.trim() || null,
                    images: formValues.galleryImages
                        ? formValues.galleryImages.split(',').map((url) => url.trim()).filter(Boolean)
                        : []
                }
            };

            if (isEditing && editingEventId) {
                await updateBigEvent(editingEventId, payload);
                showToast('Wydarzenie zostało zaktualizowane', 'success');
            } else {
                await createBigEvent(payload);
                showToast('Wydarzenie zapisane jako szkic', 'success');
            }
            handleCreateDialogClose();
            await loadEvents();
        } catch (err) {
            console.error(err);
            showToast(err?.message || 'Nie udało się zapisać wydarzenia', 'error');
        } finally {
            setCreateLoading(false);
        }
    };

    const mapEventToForm = (event) => {
        const details = event.details || {};
        const siteId = typeof event.site === 'object' ? event.site?.id : event.site;
        const gallerySource = Array.isArray(details.images)
            ? details.images.join(', ')
            : typeof details.images === 'string'
                ? details.images
                : '';
        return {
            site: siteId ? String(siteId) : '',
            title: event.title || '',
            summary: details.summary || event.description || '',
            description: event.description || '',
            location: event.location || '',
            tag: details.tag || '',
            startDate: event.start_date ? event.start_date.slice(0, 10) : '',
            endDate: event.end_date ? event.end_date.slice(0, 10) : '',
            maxParticipants: String(event.max_participants ?? INITIAL_FORM_VALUES.maxParticipants),
            price: event.price || INITIAL_FORM_VALUES.price,
            imageUrl: event.image_url || '',
            galleryImages: gallerySource,
            fullDescription: details.full_description || event.description || '',
            ctaLabel: details.cta_label || '',
            ctaUrl: details.cta_url || '',
            sendEmailOnPublish: Boolean(event.send_email_on_publish)
        };
    };

    const handleEditEvent = (event) => {
        if (!event) return;
        setIsEditing(true);
        setEditingEventId(event.id);
        setFormValues(mapEventToForm(event));
        setCreateDialogOpen(true);
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
                            Duże wydarzenia
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
                            disabled={!canCreateEvent}
                        >
                            Nowe wydarzenie
                        </Button>
                    </Stack>
                    <Typography variant="body1" color="text.secondary">
                        Zarządzaj dużymi wydarzeniami takimi jak wycieczki, warsztaty czy wyjazdy grupowe
                    </Typography>
                </motion.div>
            </Box>

            <Box
                sx={{
                    maxWidth: 1400,
                    mx: 'auto',
                    mb: 4,
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    boxShadow: (theme) => theme.shadows[1]
                }}
            >
                <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={2} 
                    mb={filtersExpanded ? 2 : 0}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                >
                    <FilterList color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>
                        Filtry
                    </Typography>
                    <Box flexGrow={1} />
                    {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
                </Stack>

                <AnimatePresence>
                    {filtersExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Stack direction="row" justifyContent="flex-end" mb={2}>
                                <Button size="small" variant="text" onClick={clearFilters} startIcon={<Clear />}>
                                    Wyczyść
                                </Button>
                            </Stack>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        select
                                        label="Strona"
                                        value={filters.siteId}
                                        onChange={handleFilterChange('siteId')}
                                        fullWidth
                                    >
                                        <MenuItem value="all">Wszystkie strony</MenuItem>
                                        {sites.map((site) => (
                                            <MenuItem key={site.id} value={String(site.id)}>
                                                {site.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        select
                                        label="Status"
                                        value={filters.status}
                                        onChange={handleFilterChange('status')}
                                        fullWidth
                                    >
                                        <MenuItem value="all">Wszystkie statusy</MenuItem>
                                        <MenuItem value="published">Opublikowane</MenuItem>
                                        <MenuItem value="draft">Szkice</MenuItem>
                                        <MenuItem value="cancelled">Anulowane</MenuItem>
                                        <MenuItem value="completed">Zakończone</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Od"
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={handleFilterChange('dateFrom')}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Do"
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={handleFilterChange('dateTo')}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Szukaj"
                                        value={filters.search}
                                        onChange={handleFilterChange('search')}
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search fontSize="small" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: filters.search ? (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}>
                                                        <Clear fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : null
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                ) : filteredEvents.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 6,
                                px: 2,
                                borderRadius: 3,
                                border: '1px dashed',
                                borderColor: 'divider',
                                bgcolor: 'background.paper'
                            }}
                        >
                            <Typography variant="h5" gutterBottom>
                                Brak wydarzeń dla wybranych filtrów
                            </Typography>
                            <Typography variant="body1" color="text.secondary" mb={3}>
                                Zmodyfikuj kryteria lub wyczyść filtry, aby zobaczyć wszystkie pozycje.
                            </Typography>
                            <Button variant="outlined" startIcon={<Clear />} onClick={clearFilters}>
                                Wyczyść filtry
                            </Button>
                        </Box>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <Grid container spacing={3}>
                            {filteredEvents.map((event, index) => (
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
                                                    onClick={() => handleEditEvent(event)}
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
                open={createDialogOpen}
                onClose={handleCreateDialogClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>{isEditing ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} mt={1}>
                        <TextField
                            select
                            label="Strona"
                            value={formValues.site}
                            onChange={handleFormChange('site')}
                            disabled={sitesLoading}
                            helperText={!sitesLoading && sites.length === 0 ? 'Brak stron. Utwórz stronę w Studiu, aby dodać wydarzenia.' : ''}
                            required
                        >
                            {sites.map((site) => (
                                <MenuItem key={site.id} value={String(site.id)}>
                                    {site.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Nazwa wydarzenia"
                            value={formValues.title}
                            onChange={handleFormChange('title')}
                            required
                            fullWidth
                        />

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                label="Data rozpoczęcia"
                                type="date"
                                value={formValues.startDate}
                                onChange={handleFormChange('startDate')}
                                InputLabelProps={{ shrink: true }}
                                required
                                fullWidth
                            />
                            <TextField
                                label="Data zakończenia (opcjonalnie)"
                                type="date"
                                value={formValues.endDate}
                                onChange={handleFormChange('endDate')}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                label="Tag / kategoria"
                                value={formValues.tag}
                                onChange={handleFormChange('tag')}
                                fullWidth
                            />
                            <TextField
                                label="Lokalizacja"
                                value={formValues.location}
                                onChange={handleFormChange('location')}
                                fullWidth
                            />
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                label="Maks. uczestników"
                                type="number"
                                value={formValues.maxParticipants}
                                onChange={handleFormChange('maxParticipants')}
                                fullWidth
                            />
                            <TextField
                                label="Cena (PLN)"
                                type="number"
                                value={formValues.price}
                                onChange={handleFormChange('price')}
                                fullWidth
                            />
                        </Stack>

                        <TextField
                            label="Krótki opis (widoczny na liście)"
                            value={formValues.summary}
                            onChange={handleFormChange('summary')}
                            multiline
                            rows={2}
                            fullWidth
                        />

                        <TextField
                            label="Pełny opis"
                            value={formValues.description}
                            onChange={handleFormChange('description')}
                            multiline
                            rows={3}
                            fullWidth
                        />

                        <TextField
                            label="Opis modalny / dodatkowe informacje"
                            value={formValues.fullDescription}
                            onChange={handleFormChange('fullDescription')}
                            multiline
                            rows={3}
                            fullWidth
                        />

                        <Box sx={{ width: '100%' }}>
                            <ImageUploader
                                label="Zdjęcie wydarzenia"
                                value={formValues.imageUrl}
                                onChange={handleImageUploadChange}
                                aspectRatio="16/9"
                                usage="site_content"
                                siteId={formValues.site ? Number(formValues.site) : undefined}
                            />
                        </Box>

                        <TextField
                            label="Galeria (URL-e oddzielone przecinkiem)"
                            value={formValues.galleryImages}
                            onChange={handleFormChange('galleryImages')}
                            fullWidth
                        />

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                label="CTA label (opcjonalnie)"
                                value={formValues.ctaLabel}
                                onChange={handleFormChange('ctaLabel')}
                                fullWidth
                            />
                            <TextField
                                label="CTA link (opcjonalnie)"
                                value={formValues.ctaUrl}
                                onChange={handleFormChange('ctaUrl')}
                                fullWidth
                            />
                        </Stack>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formValues.sendEmailOnPublish}
                                    onChange={handleToggleSendEmail}
                                />
                            }
                            label="Domyślnie wyślij newsletter przy publikacji"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCreateDialogClose} disabled={createLoading}>
                        Anuluj
                    </Button>
                    <Button onClick={handleCreateSubmit} variant="contained" disabled={createLoading}>
                        {createLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            isEditing ? 'Zapisz zmiany' : 'Zapisz szkic'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

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

            {/* AI Chat Button */}
            {!aiChatOpen && (
                <IconButton
                    onClick={() => {
                        // Auto-select first site if available
                        if (sites.length > 0) {
                            setSelectedSiteForChat(sites[0]);
                            setAiChatOpen(true);
                        } else {
                            showToast('Dodaj najpierw stronę, aby korzystać z asystenta AI.', 'warning');
                        }
                    }}
                    disabled={isAiProcessing || sites.length === 0}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1200,
                        bgcolor: 'rgb(146, 0, 32)',
                        color: 'white',
                        width: 56,
                        height: 56,
                        boxShadow: '0 4px 20px rgba(146, 0, 32, 0.4)',
                        '&:hover': { 
                            bgcolor: 'rgb(114, 0, 21)',
                            boxShadow: '0 6px 24px rgba(146, 0, 32, 0.6)'
                        },
                        '&:disabled': {
                            bgcolor: 'rgba(146, 0, 32, 0.5)',
                            color: 'rgba(255, 255, 255, 0.5)'
                        }
                    }}
                >
                    <ChatIcon />
                </IconButton>
            )}

            {/* AI Chat Drawer */}
            <Drawer
                anchor="right"
                open={aiChatOpen}
                onClose={() => setAiChatOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: 400 },
                        top: { xs: 0, sm: 64 },
                        height: { xs: '100%', sm: 'calc(100% - 64px)' }
                    }
                }}
            >
                <AIChatPanel 
                    onClose={() => setAiChatOpen(false)}
                    onProcessingChange={setIsAiProcessing}
                    contextType="studio_events"
                    selectedSiteId={selectedSiteForChat?.id}
                    availableSites={sites}
                    onSiteChange={(site) => setSelectedSiteForChat(site)}
                />
            </Drawer>
        </Box>
    );
};

export default EventsPage;
