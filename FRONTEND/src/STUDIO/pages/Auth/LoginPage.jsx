import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    Link,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../../contexts/AuthContext';

const LoginPage = () => {
    const { login, googleLogin, mockLogin } = useAuth();
    const location = useLocation();
    const redirectPath = location.state?.from?.pathname ?? '/admin';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password, redirectPath);
        } catch (err) {
            const detail = err.response?.data?.detail || err.message || 'Nie udało się zalogować.';
            setError(detail);
        } finally {
            setSubmitting(false);
        }
    };

    const handleMockAdminLogin = async () => {
        setError(null);
        setSubmitting(true);
        try {
            await mockLogin(redirectPath);
        } catch (err) {
            const detail = err?.response?.data?.detail || 'Logowanie demo nie powiodło się.';
            setError(detail);
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setSubmitting(true);
            setError(null);
            try {
                await googleLogin(tokenResponse.access_token, redirectPath);
            } catch (err) {
                setError('Logowanie przez Google nie powiodło się. Spróbuj ponownie.');
            } finally {
                setSubmitting(false);
            }
        },
        onError: () => setError('Wystąpił błąd po stronie Google. Spróbuj ponownie.')
    });

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
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="overline" sx={{ letterSpacing: 2, color: 'secondary.main' }}>
                            Studio Mindful Sites
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            Zaloguj się do panelu
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                            Zarządzaj stronami, publikuj nowe wersje i organizuj kalendarz spotkań.
                        </Typography>
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={2}>
                            <TextField
                                label="Adres e-mail"
                                type="email"
                                value={email}
                                required
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                            />
                            <TextField
                                label="Hasło"
                                type="password"
                                value={password}
                                required
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="current-password"
                            />
                            <Button type="submit" variant="contained" size="large" disabled={submitting}>
                                {submitting ? 'Logowanie...' : 'Zaloguj się'}
                            </Button>
                        </Stack>
                    </Box>

                    <Divider>lub</Divider>

                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<GoogleIcon />}
                        onClick={() => handleGoogle()}
                        disabled={submitting}
                    >
                        Kontynuuj z Google
                    </Button>

                    <Button
                        variant="text"
                        size="large"
                        onClick={handleMockAdminLogin}
                        disabled={submitting}
                    >
                        Zaloguj jako admin demo
                    </Button>

                    <Stack direction="row" justifyContent="space-between" sx={{ color: 'text.secondary' }}>
                        <Link component={RouterLink} to="/" underline="hover">
                            Wróć na stronę główną
                        </Link>
                        <Link component={RouterLink} to="/styles" underline="hover">
                            Zobacz style aplikacji
                        </Link>
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
};

export default LoginPage;
