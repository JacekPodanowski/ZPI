import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    Stack,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Save as SaveIcon,
    History as HistoryIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apiClient from '../../../services/apiClient';

const TermsAdminPage = () => {
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [content, setContent] = useState('');
    const [newVersion, setNewVersion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    // Załaduj wszystkie wersje regulaminu
    const loadVersions = async () => {
        try {
            const response = await apiClient.get('/terms/all/');
            setVersions(response.data);
            
            // Automatycznie załaduj najnowszą wersję
            if (response.data.length > 0) {
                loadVersion(response.data[0]);
            }
        } catch (err) {
            setError('Nie udało się załadować wersji regulaminu');
            console.error(err);
        }
    };

    // Załaduj konkretną wersję
    const loadVersion = (version) => {
        setSelectedVersion(version);
        setContent(version.content_md);
        // Sugeruj następną wersję
        const currentVersionNum = parseFloat(version.version);
        if (!isNaN(currentVersionNum)) {
            setNewVersion((currentVersionNum + 0.1).toFixed(1));
        }
    };

    // Zapisz jako nową wersję
    const saveAsNewVersion = async () => {
        if (!newVersion.trim()) {
            setError('Podaj numer wersji');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await apiClient.post('/terms/create/', {
                version: newVersion,
                content_md: content,
            });

            setSuccess(`Zapisano nową wersję regulaminu: ${newVersion}`);
            await loadVersions(); // Przeładuj listę
        } catch (err) {
            setError(err.response?.data?.detail || 'Nie udało się zapisać regulaminu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVersions();
    }, []);

    const isLatestVersion = selectedVersion && versions[0]?.id === selectedVersion.id;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                📋 Zarządzanie Regulaminem
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Lista wersji */}
                <Paper sx={{ width: { xs: '100%', md: 300 }, p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <HistoryIcon color="primary" />
                        <Typography variant="h6">Wersje</Typography>
                    </Stack>
                    <List>
                        {versions.map((version, index) => (
                            <ListItem key={version.id} disablePadding>
                                <ListItemButton
                                    selected={selectedVersion?.id === version.id}
                                    onClick={() => loadVersion(version)}
                                >
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <span>v{version.version}</span>
                                                {index === 0 && (
                                                    <Chip label="Najnowsza" size="small" color="primary" />
                                                )}
                                            </Stack>
                                        }
                                        secondary={new Date(version.published_at).toLocaleDateString('pl-PL')}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* Edytor */}
                <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 3 }}>
                        {selectedVersion && (
                            <>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                    <Typography variant="h6">
                                        {isLatestVersion ? 'Edycja (najnowsza wersja)' : 'Podgląd (wersja archiwalna)'}
                                    </Typography>
                                    <Button
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => setPreviewOpen(true)}
                                    >
                                        Podgląd
                                    </Button>
                                </Stack>

                                <Divider sx={{ mb: 2 }} />

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={20}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    disabled={!isLatestVersion}
                                    placeholder="Treść regulaminu w formacie Markdown..."
                                    sx={{ mb: 3, fontFamily: 'monospace' }}
                                />

                                {isLatestVersion && (
                                    <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', p: 2, borderRadius: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Zapisz jako nową wersję
                                        </Typography>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <TextField
                                                label="Numer wersji"
                                                value={newVersion}
                                                onChange={(e) => setNewVersion(e.target.value)}
                                                size="small"
                                                sx={{ width: 150 }}
                                                placeholder="2.0"
                                            />
                                            <Button
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                onClick={saveAsNewVersion}
                                                disabled={loading || !content.trim() || !newVersion.trim()}
                                            >
                                                {loading ? 'Zapisywanie...' : 'Zapisz jako nową wersję'}
                                            </Button>
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                            Zapiszesz nową wersję regulaminu. Stara wersja pozostanie w historii.
                                        </Typography>
                                    </Box>
                                )}

                                {!isLatestVersion && (
                                    <Alert severity="info">
                                        To jest wersja archiwalna. Nie możesz jej edytować.
                                        Aby wprowadzić zmiany, przejdź do najnowszej wersji i zapisz jako nową wersję.
                                    </Alert>
                                )}
                            </>
                        )}

                        {!selectedVersion && (
                            <Typography color="text.secondary">
                                Wybierz wersję z listy lub utwórz pierwszą wersję regulaminu.
                            </Typography>
                        )}
                    </Paper>
                </Box>
            </Stack>

            {/* Dialog podglądu */}
            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Podgląd Regulaminu v{selectedVersion?.version}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ '& h1': { fontSize: '2rem', fontWeight: 600, mb: 2 } }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)}>Zamknij</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TermsAdminPage;
