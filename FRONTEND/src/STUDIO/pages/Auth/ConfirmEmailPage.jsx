import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { confirmEmail } from '../../../services/authService';

const ConfirmEmailPage = () => {
    const { key } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'already_verified'
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const confirm = async () => {
            if (!key) {
                setStatus('error');
                setMessage('Invalid verification link - no key provided.');
                return;
            }

            try {
                const response = await confirmEmail(key);
                
                if (response.already_verified) {
                    setStatus('already_verified');
                    setMessage(response.detail || 'Email already verified.');
                } else {
                    setStatus('success');
                    setMessage(response.detail || 'Email verified successfully!');
                }
                
                setEmail(response.email || '');
            } catch (error) {
                setStatus('error');
                
                if (error.response?.data?.detail) {
                    setMessage(error.response.data.detail);
                } else if (error.response?.data?.error === 'invalid_key') {
                    setMessage('Invalid or expired verification link. Please request a new one.');
                } else {
                    setMessage('Failed to verify email. Please try again or contact support.');
                }
            }
        };

        confirm();
    }, [key]);

    const handleGoToLogin = () => {
        navigate('/studio/login');
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
                            Verifying Your Email
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Please wait while we confirm your email address...
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
                            Email Verified!
                        </Typography>
                        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                            {message}
                        </Alert>
                        {email && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Your account <strong>{email}</strong> is now active.
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleGoToLogin}
                            fullWidth
                        >
                            Go to Login
                        </Button>
                    </>
                )}

                {status === 'already_verified' && (
                    <>
                        <CheckCircleIcon
                            sx={{
                                fontSize: 80,
                                color: 'info.main',
                                mb: 2,
                            }}
                        />
                        <Typography variant="h5" gutterBottom>
                            Already Verified
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                            {message}
                        </Alert>
                        {email && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Account: <strong>{email}</strong>
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleGoToLogin}
                            fullWidth
                        >
                            Go to Login
                        </Button>
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
                            Verification Failed
                        </Typography>
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {message}
                        </Alert>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleGoToLogin}
                                fullWidth
                            >
                                Go to Login
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                                If your link expired, you can request a new verification email from the login page.
                            </Typography>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default ConfirmEmailPage;
