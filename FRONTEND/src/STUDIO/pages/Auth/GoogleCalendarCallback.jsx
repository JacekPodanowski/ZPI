import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button, Stack } from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const GoogleCalendarCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [error, setError] = useState(null);

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setStatus('error');
            setError('Autoryzacja została anulowana lub odrzucona.');
            return;
        }

        if (!code || !state) {
            setStatus('error');
            setError('Brak wymaganych parametrów autoryzacji.');
            return;
        }

        try {
            // Extract site ID from state (format: "site_123")
            const siteId = state.split('_')[1];
            
            if (!siteId) {
                throw new Error('Nieprawidłowy stan sesji.');
            }

            const token = localStorage.getItem('accessToken');
            
            await axios.post(
                `${API_URL}/google-calendar/callback/`,
                { code, state },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setStatus('success');
            
            // Redirect to calendar after 2 seconds
            setTimeout(() => {
                navigate('/studio/calendar/creator');
            }, 2000);

        } catch (error) {
            console.error('Callback error:', error);
            setStatus('error');
            setError(
                error.response?.data?.error || 
                error.message || 
                'Nie udało się połączyć z Google Calendar. Spróbuj ponownie.'
            );
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(228, 229, 218, 0.95) 0%, rgba(188, 186, 179, 0.95) 100%)',
                p: 3
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <Box
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        p: 5,
                        maxWidth: 480,
                        textAlign: 'center'
                    }}
                >
                    {status === 'loading' && (
                        <Stack spacing={3} alignItems="center">
                            <CircularProgress size={64} sx={{ color: 'primary.main' }} />
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                Łączenie z Google Calendar...
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Proszę czekać, trwa konfiguracja synchronizacji.
                            </Typography>
                        </Stack>
                    )}

                    {status === 'success' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            <Stack spacing={3} alignItems="center">
                                <CheckCircle 
                                    sx={{ 
                                        fontSize: 80, 
                                        color: 'success.main',
                                        filter: 'drop-shadow(0 4px 8px rgba(46, 125, 50, 0.3))'
                                    }} 
                                />
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    Połączono pomyślnie!
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Twój kalendarz jest teraz synchronizowany z Google Calendar.
                                    Wszystkie wydarzenia będą automatycznie aktualizowane.
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ pt: 2 }}>
                                    Przekierowywanie do kalendarza...
                                </Typography>
                            </Stack>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <Stack spacing={3} alignItems="center">
                            <ErrorIcon 
                                sx={{ 
                                    fontSize: 80, 
                                    color: 'error.main',
                                    filter: 'drop-shadow(0 4px 8px rgba(211, 47, 47, 0.3))'
                                }} 
                            />
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                Wystąpił błąd
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {error}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/studio/calendar/creator')}
                                sx={{
                                    mt: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 4
                                }}
                            >
                                Wróć do kalendarza
                            </Button>
                        </Stack>
                    )}
                </Box>
            </motion.div>
        </Box>
    );
};

export default GoogleCalendarCallback;
