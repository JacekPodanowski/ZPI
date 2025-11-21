import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import apiClient from '../../../services/apiClient';

const NewsletterUnsubscribePage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const [siteName, setSiteName] = useState('');

    useEffect(() => {
        const unsubscribe = async () => {
            try {
                const response = await apiClient.get(`/newsletter/unsubscribe/${token}/`);
                setStatus('success');
                setMessage(response.data.message);
                setSiteName(response.data.site_name || '');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Wystąpił błąd podczas wypisywania z newslettera');
            }
        };

        if (token) {
            unsubscribe();
        }
    }, [token]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(228,229,218,0.3) 0%, rgba(255,255,255,0.8) 100%)',
                p: 2
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    maxWidth: 600,
                    width: '100%',
                    p: 6,
                    borderRadius: 4,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(228,229,218,0.85) 100%)',
                    border: '1px solid rgba(146, 0, 32, 0.12)',
                }}
            >
                {status === 'loading' && (
                    <>
                        <CircularProgress sx={{ color: 'rgb(146, 0, 32)', mb: 3 }} size={60} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                            Wypisywanie z newslettera...
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Poczekaj chwilę, przetwarzamy Twoją prośbę.
                        </Typography>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle sx={{ fontSize: 80, color: '#4ade80', mb: 3 }} />
                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: 'rgb(30, 30, 30)' }}>
                            ✅ Wypisano pomyślnie
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', fontSize: 16 }}>
                            {message}
                        </Typography>
                        {siteName && (
                            <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                                Nie będziesz już otrzymywać newslettera z <strong>{siteName}</strong>.
                            </Typography>
                        )}
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'rgba(74, 222, 128, 0.1)',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                                mb: 4
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'rgb(30, 30, 30)' }}>
                                💔 <strong>Przykro nam, że odchodzisz!</strong>
                                <br />
                                Jeśli zmienisz zdanie, zawsze możesz zapisać się ponownie.
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: 'rgb(146, 0, 32)',
                                '&:hover': { bgcolor: 'rgb(114, 0, 21)' },
                                px: 4,
                                py: 1.5,
                                fontWeight: 600,
                                borderRadius: 2
                            }}
                            onClick={() => navigate('/')}
                        >
                            Zamknij
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <Error sx={{ fontSize: 80, color: '#ef4444', mb: 3 }} />
                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: 'rgb(30, 30, 30)' }}>
                            ❌ Wystąpił problem
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                            {message}
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{
                                borderColor: 'rgb(146, 0, 32)',
                                color: 'rgb(146, 0, 32)',
                                '&:hover': {
                                    borderColor: 'rgb(114, 0, 21)',
                                    bgcolor: 'rgba(146, 0, 32, 0.05)'
                                },
                                px: 4,
                                py: 1.5,
                                fontWeight: 600,
                                borderRadius: 2
                            }}
                            onClick={() => navigate('/')}
                        >
                            Powrót do strony głównej
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default NewsletterUnsubscribePage;
