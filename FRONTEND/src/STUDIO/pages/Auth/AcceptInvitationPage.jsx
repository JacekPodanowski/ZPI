import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useAuth } from '../../../contexts/AuthContext';

const AcceptInvitationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, refresh } = useAuth();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'auth_required'
    const [message, setMessage] = useState('');
    const [siteInfo, setSiteInfo] = useState(null);

    useEffect(() => {
        const acceptInvitation = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid invitation link - no token provided.');
                return;
            }

            try {
                const API_BASE = import.meta.env.VITE_API_BASE;
                const response = await fetch(`${API_BASE}/api/v1/accept-invitation/${token}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(isAuthenticated && {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        })
                    }
                });

                const data = await response.json();

                if (response.status === 401 && data.auth_required) {
                    // Authentication required
                    setStatus('auth_required');
                    setMessage(data.message || 'Zaloguj się, aby zaakceptować zaproszenie.');
                    setSiteInfo({
                        name: data.site_name,
                        role: data.permission_role
                    });
                    // Store token for after authentication
                    sessionStorage.setItem('invitation_token', token);
                    return;
                }

                if (!response.ok) {
                    throw new Error(data.error || data.detail || 'Nie udało się zaakceptować zaproszenia');
                }

                // Success
                setStatus('success');
                setMessage(data.message || 'Zaproszenie zaakceptowane pomyślnie!');
                setSiteInfo({
                    id: data.site_id,
                    name: data.site_name,
                    role: data.permission_role
                });

                // Refresh user data to update team memberships
                if (isAuthenticated) {
                    await refresh();
                }

                // Redirect to sites page after 2 seconds
                setTimeout(() => {
                    navigate('/studio/sites');
                }, 2000);

            } catch (error) {
                setStatus('error');
                setMessage(error.message || 'Nie udało się zaakceptować zaproszenia. Link może być nieprawidłowy lub wygasły.');
                console.error('Accept invitation error:', error);
            }
        };

        acceptInvitation();
    }, [token, isAuthenticated, refresh, navigate]);

    const handleLogin = () => {
        // Store current invitation token
        sessionStorage.setItem('invitation_token', token);
        navigate('/studio/login', { state: { from: `/studio/accept-invitation/${token}` } });
    };

    const handleGoToSites = () => {
        navigate('/studio/sites');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 500,
                    width: '100%',
                    textAlign: 'center',
                }}
            >
                {status === 'loading' && (
                    <>
                        <CircularProgress size={60} sx={{ mb: 3 }} />
                        <Typography variant="h5" gutterBottom>
                            Przetwarzanie zaproszenia
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Proszę czekać, przetwarzamy Twoje zaproszenie do zespołu...
                        </Typography>
                    </>
                )}

                {status === 'auth_required' && (
                    <>
                        <GroupAddIcon
                            sx={{
                                fontSize: 80,
                                color: 'primary.main',
                                mb: 2,
                            }}
                        />
                        <Typography variant="h5" gutterBottom>
                            Zaproszenie do zespołu
                        </Typography>
                        {siteInfo && (
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Zostałeś zaproszony jako <strong>{siteInfo.role}</strong> do zespołu <strong>{siteInfo.name}</strong>
                            </Typography>
                        )}
                        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                            {message}
                        </Alert>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleLogin}
                                startIcon={<GroupAddIcon />}
                                fullWidth
                            >
                                Zaloguj się
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                                Po zalogowaniu zostaniesz automatycznie dodany do zespołu.
                            </Typography>
                        </Box>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircleIcon
                            sx={{
                                fontSize: 80,
                                color: 'success.main',
                                mb: 2,
                            }}
                        />
                        <Typography variant="h5" gutterBottom>
                            Zaproszenie zaakceptowane!
                        </Typography>
                        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                            {message}
                        </Alert>
                        {siteInfo && (
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                Jesteś teraz członkiem zespołu <strong>{siteInfo.name}</strong> jako <strong>{siteInfo.role}</strong>
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            Przekierowywanie do Twoich stron...
                        </Typography>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <ErrorIcon
                            sx={{
                                fontSize: 80,
                                color: 'error.main',
                                mb: 2,
                            }}
                        />
                        <Typography variant="h5" gutterBottom>
                            Błąd zaproszenia
                        </Typography>
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {message}
                        </Alert>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleGoToSites}
                                fullWidth
                            >
                                Przejdź do stron
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                                Skontaktuj się z właścicielem strony, jeśli uważasz, że to błąd.
                            </Typography>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default AcceptInvitationPage;
