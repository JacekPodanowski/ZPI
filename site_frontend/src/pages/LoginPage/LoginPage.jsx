import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

// ### POCZĄTEK ZMIANY: Importujemy hook `useGoogleLogin` i `GoogleIcon` ###
import { useGoogleLogin } from '@react-oauth/google';
import GoogleIcon from '@mui/icons-material/Google';
// ### KONIEC ZMIANY ###

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // ### POCZĄTEK ZMIANY: Pobieramy nową funkcję `googleLogin` z AuthContext ###
    const { login, googleLogin: handleGoogleLoginSuccess, isAuthenticated } = useAuth();
    // ### KONIEC ZMIANY ###
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated) {
            // Po zalogowaniu, logika w AuthContext (handlePendingBooking) sama nas przekieruje.
            // Możemy zostawić to dla pewności, gdyby ktoś wszedł na /login będąc już zalogowanym.
            navigate("/student-dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            const errorDetail = err.response?.data?.detail || (err.response?.data?.non_field_errors && err.response.data.non_field_errors.join(', '));
            setError(errorDetail || 'Logowanie nie powiodło się. Sprawdź dane i spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };
    
    const performGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');
            try {
                await handleGoogleLoginSuccess(tokenResponse.access_token);
            } catch (err) {
                setError('Logowanie przez Google nie powiodło się. Spróbuj ponownie.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError('Wystąpił błąd podczas logowania przez Google.');
            setLoading(false);
        },
    });

    return (
        <Container 
            component="main" 
            maxWidth="xs" 
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, py: 4 }}
        >
            <Paper 
                elevation={8} 
                sx={{ padding: { xs: 3, sm: 4 }, borderRadius: '12px', backgroundColor: 'rgba(30, 30, 30, 0.75)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', mt: { xs: 2, sm: 0 } }}
            > 
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography component="h1" variant="h4" color="primary" sx={{ mb: 3, fontWeight: 700, letterSpacing: '0.5px' }}>
                        Zaloguj się
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                        <TextField margin="normal" required fullWidth id="email" label="Adres Email" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} variant="outlined" />
                        <TextField margin="normal" required fullWidth name="password" label="Hasło" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!error} variant="outlined" />
                        {error && ( <Typography color="error" variant="body2" align="center" sx={{ mt: 2, mb: 0.5, whiteSpace: 'pre-wrap' }}>{error}</Typography> )}
                        <Button type="submit" fullWidth variant="contained" color="primary" disabled={loading} sx={{ mt: 3, mb: 2, py: 1.2, fontSize: '1rem' }} >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Zaloguj'}
                        </Button>
                        <Divider sx={{ my: 2, color: 'text.secondary', fontSize: '0.8rem' }}>LUB</Divider> 
                        
                        <Button
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            onClick={() => performGoogleLogin()}
                            disabled={loading}
                            startIcon={<GoogleIcon />}
                            sx={{ py: 1.2, fontSize: '1rem' }}
                        >
                            Kontynuuj z Google
                        </Button>
                        
                        <Grid container justifyContent="space-between" sx={{ mt: 3 }}>
                            <Grid item>
                                <Link component={RouterLink} to="/password/reset" variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' }}}>
                                    Zapomniałeś hasła?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link component={RouterLink} to="/signup" variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' }}}>
                                    Nie masz konta? Zarejestruj się
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}
export default LoginPage;