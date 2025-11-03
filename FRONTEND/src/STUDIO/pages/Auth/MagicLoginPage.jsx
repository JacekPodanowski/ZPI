import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { verifyMagicLink } from '../../../services/authService';
import { useAuth } from '../../../contexts/AuthContext';

const MagicLoginPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { refresh } = useAuth();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');
    const [errorType, setErrorType] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid magic link - no token provided.');
                setErrorType('invalid');
                return;
            }

            try {
                const response = await verifyMagicLink(token);
                
                setStatus('success');
                setMessage(response.detail || 'Login successful!');
                setEmail(response.email || '');
                
                // Refresh user data
                await refresh();
                
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    navigate('/studio/sites');
                }, 2000);
                
            } catch (error) {
                setStatus('error');
                
                if (error.response?.data?.error === 'already_used') {
                    setMessage('This magic link has already been used. Please request a new one.');
                    setErrorType('already_used');
                } else if (error.response?.data?.error === 'expired') {
                    setMessage('This magic link has expired. Please request a new one.');
                    setErrorType('expired');
                } else if (error.response?.data?.error === 'invalid_token') {
                    setMessage('Invalid magic link. Please request a new one.');
                    setErrorType('invalid');
                } else if (error.response?.data?.detail) {
                    setMessage(error.response.data.detail);
                    setErrorType('other');
                } else {
                    setMessage('Failed to verify magic link. Please try again.');
                    setErrorType('other');
                }
            }
        };

        verify();
    }, [token, refresh, navigate]);

    const handleRequestNewLink = () => {
        navigate('/studio/login?mode=magic');
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
                            Verifying Magic Link
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Please wait while we sign you in...
                        </Typography>
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
                            Login Successful!
                        </Typography>
                        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                            {message}
                        </Alert>
                        {email && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Signed in as <strong>{email}</strong>
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            Redirecting to dashboard...
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
                            Magic Link Failed
                        </Typography>
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {message}
                        </Alert>
                        
                        {(errorType === 'already_used' || errorType === 'expired') && (
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleRequestNewLink}
                                    startIcon={<LockOpenIcon />}
                                    fullWidth
                                >
                                    Request New Magic Link
                                </Button>
                                <Typography variant="body2" color="text.secondary">
                                    Magic links expire after 15 minutes for security.
                                </Typography>
                            </Box>
                        )}
                        
                        {errorType === 'invalid' && (
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleRequestNewLink}
                                    fullWidth
                                >
                                    Go to Login
                                </Button>
                            </Box>
                        )}
                        
                        {errorType === 'other' && (
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate('/studio/login')}
                                    fullWidth
                                >
                                    Go to Login
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default MagicLoginPage;
