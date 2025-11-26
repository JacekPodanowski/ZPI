import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Divider, CircularProgress, Alert } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Logo from '../../../components/Logo/Logo';
import apiClient from '../../../services/apiClient';
import Navigation from '../../../components/Navigation/Navigation';

const TermsOfServicePage = () => {
    const [terms, setTerms] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadTerms = async () => {
            try {
                const response = await apiClient.get('/terms/latest/');
                setTerms(response.data);
            } catch (err) {
                setError('Nie udało się załadować regulaminu');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadTerms();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const publishedDate = terms?.published_at 
        ? new Date(terms.published_at).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '';

    return (
        <>
            <Navigation />
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
            <Container maxWidth="md">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: 5,
                        border: '1px solid rgba(160, 0, 22, 0.14)'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Logo size="large" variant="shadow" />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', mb: 2 }}>
                        Regulamin Świadczenia Usług
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
                        Wersja {terms?.version} | Opublikowano: {publishedDate}
                    </Typography>
                    <Divider sx={{ mb: 4 }} />

                    <Box
                        sx={{
                            '& h1': { fontSize: '2rem', fontWeight: 600, mt: 4, mb: 2 },
                            '& h2': { fontSize: '1.5rem', fontWeight: 600, mt: 3, mb: 1.5 },
                            '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
                            '& p': { mb: 2, lineHeight: 1.7 },
                            '& ul, & ol': { mb: 2, pl: 4 },
                            '& li': { mb: 1 },
                            '& strong': { fontWeight: 600 },
                            '& a': { color: 'primary.main', textDecoration: 'underline' },
                        }}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {terms?.content_md || '# Brak treści regulaminu\n\nRegulamin nie został jeszcze utworzony.'}
                        </ReactMarkdown>
                    </Box>
                </Paper>
            </Container>
        </Box>
        </>
    );
};

export default TermsOfServicePage;
