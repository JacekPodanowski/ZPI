import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    FormControlLabel,
    Link,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import DescriptionIcon from '@mui/icons-material/Description';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchLatestTerms, resendVerificationEmail, requestMagicLink } from '../../../services/authService';
import Logo from '../../../components/Logo/Logo';

const LoginPage = () => {
    const { login, signup, googleLogin, mockLogin } = useAuth();
    const location = useLocation();
    const redirectPath = location.state?.from?.pathname ?? '/studio/sites';

    const [mode, setMode] = useState('login'); // 'login', 'register', or 'magic'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [terms, setTerms] = useState({ file_url: '#', version: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [resendingEmail, setResendingEmail] = useState(false);
    const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

    useEffect(() => {
        if (mode === 'register') {
            fetchLatestTerms()
                .then(setTerms)
                .catch(console.error);
        }
    }, [mode]);
    
    // Pre-fill email if coming from account setup
    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setRegistrationSuccess(false);
        setMagicLinkSent(false);
        setSubmitting(true);
        try {
            if (mode === 'login') {
                await login(email, password, redirectPath);
            } else if (mode === 'magic') {
                const response = await requestMagicLink(email);
                setMagicLinkSent(true);
                setRegisteredEmail(email);
            } else {
                if (password !== password2) {
                    setError('Hasła muszą być identyczne.');
                    setSubmitting(false);
                    return;
                }
                if (!acceptTerms) {
                    setError('Musisz zaakceptować Regulamin aby się zarejestrować.');
                    setSubmitting(false);
                    return;
                }
                const response = await signup({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    password2,
                    accept_terms: acceptTerms
                });
                // Registration successful - show success message
                setRegistrationSuccess(true);
                setRegisteredEmail(email);
                // Clear form
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setPassword2('');
                setAcceptTerms(false);
            }
        } catch (err) {
            const detail = err.response?.data?.detail || err.message || 'Nie udało się przetworzyć żądania.';
            setError(detail);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        setResendingEmail(true);
        setError(null);
        try {
            await resendVerificationEmail(registeredEmail);
            alert('Email weryfikacyjny został wysłany ponownie. Sprawdź swoją skrzynkę.');
        } catch (err) {
            setError('Nie udało się wysłać emaila. Spróbuj ponownie później.');
        } finally {
            setResendingEmail(false);
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Logo size="large" variant="shadow" />
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
                        {mode === 'login' ? 'Zaloguj się' : mode === 'magic' ? 'Magiczny link' : 'Stwórz konto'}
                    </Typography>

                    {successMessage && (
                        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
                            {successMessage}
                        </Alert>
                    )}

                    {magicLinkSent && (
                        <Alert severity="success">
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                Magiczny link wysłany!
                            </Typography>
                            <Typography variant="body2">
                                Wysłaliśmy link logowania na adres <strong>{registeredEmail}</strong>. 
                                Kliknij w link w emailu, aby zalogować się bez hasła. Link jest ważny przez 15 minut.
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Nie otrzymałeś emaila? Sprawdź czy na pewno masz konto na ten mail ? lub folderze spam lub wyślij link ponownie używając formularza poniżej.
                            </Typography>
                        </Alert>
                    )}

                    {registrationSuccess && (
                        <Alert severity="success">
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                Rejestracja zakończona pomyślnie!
                            </Typography>
                            <Typography variant="body2">
                                Wysłaliśmy link weryfikacyjny na adres <strong>{registeredEmail}</strong>.
                                Kliknij w link w emailu, aby aktywować swoje konto i móc się zalogować.
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Nie otrzymałeś emaila? Sprawdź folder spam lub{' '}
                                <Link 
                                    href="#" 
                                    onClick={(e) => { 
                                        e.preventDefault(); 
                                        handleResendVerification();
                                    }}
                                    sx={{ cursor: resendingEmail ? 'wait' : 'pointer' }}
                                >
                                    {resendingEmail ? 'Wysyłanie...' : 'wyślij ponownie'}
                                </Link>.
                            </Typography>
                        </Alert>
                    )}

                    {error && <Alert severity="error">{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={2}>
                            {mode === 'register' && (
                                <>
                                    <TextField
                                        label="Imię"
                                        type="text"
                                        value={firstName}
                                        required
                                        onChange={(event) => setFirstName(event.target.value)}
                                        autoComplete="given-name"
                                    />
                                    <TextField
                                        label="Nazwisko (opcjonalnie)"
                                        type="text"
                                        value={lastName}
                                        onChange={(event) => setLastName(event.target.value)}
                                        autoComplete="family-name"
                                    />
                                </>
                            )}
                            <TextField
                                label="Adres e-mail"
                                type="email"
                                value={email}
                                required
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                            />
                            {(mode === 'login' || mode === 'register') && (
                                <TextField
                                    label="Hasło"
                                    type="password"
                                    value={password}
                                    required
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                />
                            )}
                            {mode === 'register' && (
                                <>
                                    <TextField
                                        label="Powtórz hasło"
                                        type="password"
                                        value={password2}
                                        required
                                        onChange={(event) => setPassword2(event.target.value)}
                                        autoComplete="new-password"
                                    />
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: 'rgba(160, 0, 22, 0.04)',
                                            borderRadius: 2,
                                            border: '1px solid rgba(160, 0, 22, 0.1)'
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={acceptTerms}
                                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2">
                                                    Akceptuję{' '}
                                                    <Link
                                                        href="/terms"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        Regulamin Świadczenia Usług (v{terms.version})
                                                    </Link>
                                                </Typography>
                                            }
                                        />
                                    </Box>
                                </>
                            )}
                            <Button type="submit" variant="contained" size="large" disabled={submitting}>
                                {submitting ? 'Przetwarzanie...' : mode === 'login' ? 'Zaloguj' : mode === 'magic' ? 'Wyślij magiczny link' : 'Zarejestruj'}
                            </Button>
                        </Stack>
                    </Box>

                    {mode === 'magic' && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="text"
                                onClick={() => {
                                    setMode('login');
                                    setError(null);
                                    setMagicLinkSent(false);
                                }}
                            >
                                Wróć do logowania hasłem
                            </Button>
                        </Box>
                    )}

                    {mode === 'login' && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="text"
                                startIcon={<LockOpenIcon />}
                                onClick={() => {
                                    setMode('magic');
                                    setError(null);
                                }}
                            >
                                Zaloguj się bez hasła (magiczny link)
                            </Button>
                        </Box>
                    )}

                    {(mode === 'login' || mode === 'register') && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="text"
                                onClick={() => {
                                    setMode(mode === 'login' ? 'register' : 'login');
                                    setError(null);
                                }}
                            >
                                {mode === 'login' ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
                            </Button>
                        </Box>
                    )}

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
                        size="xlarge"
                        onClick={handleMockAdminLogin}
                        disabled={submitting}
                        sx={{ 
                            fontWeight: 650,
                            color: 'black',
                            position: 'relative',
                            '@keyframes glitch': {
                                '0%': {
                                    textShadow: '2px 2px 0 rgba(255, 0, 0, 0.7), -2px -2px 0 rgba(0, 255, 255, 0.7)'
                                },
                                '25%': {
                                    textShadow: '-2px 2px 0 rgba(0, 255, 0, 0.7), 2px -2px 0 rgba(255, 0, 255, 0.7)'
                                },
                                '50%': {
                                    textShadow: '3px -3px 0 rgba(255, 255, 0, 0.7), -3px 3px 0 rgba(0, 0, 255, 0.7)'
                                },
                                '75%': {
                                    textShadow: '-3px -2px 0 rgba(255, 0, 255, 0.7), 3px 2px 0 rgba(0, 255, 0, 0.7)'
                                },
                                '100%': {
                                    textShadow: '2px 2px 0 rgba(0, 255, 255, 0.7), -2px -2px 0 rgba(255, 0, 0, 0.7)'
                                }
                            },
                            animation: 'glitch 0.3s infinite',
                            '&:hover': {
                                animation: 'glitch 0.15s infinite'
                            }
                        }}
                    >
                        --- DEV Zaloguj jako ADMIN ---
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
};

export default LoginPage;
