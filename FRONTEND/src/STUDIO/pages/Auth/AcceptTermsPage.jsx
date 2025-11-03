import React, { useState, useEffect } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Container,
    FormControlLabel,
    Link,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchLatestTerms, acceptLatestTerms } from '../../../services/authService';
import Logo from '../../../components/Logo/Logo';
import Loader from '../../../components/Loader';

const AcceptTermsPage = () => {
    const { refresh } = useAuth();
    const [terms, setTerms] = useState(null);
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLatestTerms()
            .then(setTerms)
            .catch((err) => {
                console.error('Failed to fetch terms:', err);
                setError('Nie udało się pobrać Regulaminu. Spróbuj ponownie później.');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleAccept = async () => {
        setSubmitting(true);
        setError(null);
        try {
            await acceptLatestTerms();
            // Refresh user data to clear the ToS block
            await refresh();
            // Hard redirect to force a full state reload
            window.location.href = '/studio/sites';
        } catch (err) {
            console.error('Failed to accept terms:', err);
            setError('Nie udało się zaakceptować Regulaminu. Spróbuj ponownie.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (!terms) {
        return (
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        mt: { xs: 2, md: 8 },
                        p: { xs: 4, md: 6 },
                        borderRadius: 5,
                        border: '1px solid rgba(160, 0, 22, 0.14)'
                    }}
                >
                    <Alert severity="error">
                        Nie można załadować Regulaminu. Skontaktuj się z administratorem.
                    </Alert>
                </Paper>
            </Container>
        );
    }

    const publishedDate = new Date(terms.published_at).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Container maxWidth="md">
            <Paper
                elevation={0}
                sx={{
                    mt: { xs: 2, md: 8 },
                    p: { xs: 4, md: 6 },
                    borderRadius: 5,
                    border: '1px solid rgba(160, 0, 22, 0.14)'
                }}
            >
                <Stack spacing={4}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Logo size="large" variant="shadow" />
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
                        Zaktualizowaliśmy nasz Regulamin
                    </Typography>

                    <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Aby kontynuować korzystanie z naszej platformy, musisz przejrzeć i zaakceptować
                        zaktualizowany Regulamin Świadczenia Usług (wersja {terms.version}), 
                        opublikowany {publishedDate}.
                    </Typography>

                    {error && <Alert severity="error">{error}</Alert>}

                    <Box
                        sx={{
                            p: 3,
                            bgcolor: 'rgba(160, 0, 22, 0.04)',
                            borderRadius: 3,
                            border: '1px solid rgba(160, 0, 22, 0.1)'
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                            <DescriptionIcon sx={{ color: 'primary.main', fontSize: 40 }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Regulamin Świadczenia Usług
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Wersja {terms.version}
                                </Typography>
                            </Box>
                        </Stack>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Button
                                variant="outlined"
                                href={terms.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<DescriptionIcon />}
                            >
                                Pobierz i przejrzyj Regulamin (PDF)
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ px: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    Przeczytałem/-am i akceptuję nowy Regulamin Świadczenia Usług
                                </Typography>
                            }
                        />
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleAccept}
                        disabled={!accepted || submitting}
                        fullWidth
                    >
                        {submitting ? 'Przetwarzanie...' : 'Akceptuję i kontynuuję'}
                    </Button>

                    <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Nie możesz korzystać z platformy bez zaakceptowania Regulaminu.
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );
};

export default AcceptTermsPage;
