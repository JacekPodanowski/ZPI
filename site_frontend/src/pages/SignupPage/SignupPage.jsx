import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { Button, TextField, Box, Typography, Container, Paper, CircularProgress, Link, Grid, Divider } from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleIcon from '@mui/icons-material/Google';

function SignupPage() {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { signup, googleLogin: handleGoogleLoginSuccess, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/student-dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            setError('Hasła nie są identyczne.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await signup(firstName, email, password, password2);
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData) {
                const errorMessages = Object.entries(errorData).map(([key, value]) => {
                    const fieldName = { first_name: "Imię", email: "Email", password: "Hasło", password2: "Potwierdzenie hasła" }[key] || key;
                    return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
                });
                setError(errorMessages.join('\n'));
            } else {
                setError('Rejestracja nie powiodła się. Spróbuj ponownie.');
            }
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
                setError('Logowanie/rejestracja przez Google nie powiodła się. Spróbuj ponownie.');
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
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, py: 4 }} >
            <Paper elevation={8} sx={{ padding: { xs: 3, sm: 4 }, borderRadius: '12px', backgroundColor: 'rgba(30, 30, 30, 0.75)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', mt: { xs: 2, sm: 0 } }} > 
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography component="h1" variant="h4" color="primary" sx={{ mb: 3, fontWeight: 700, letterSpacing: '0.5px' }}>
                        Stwórz konto
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                        <TextField margin="normal" required fullWidth id="firstName" label="Imię" name="firstName" autoComplete="given-name" autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} variant="outlined" />
                        <TextField margin="normal" required fullWidth id="email" label="Adres Email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} variant="outlined" />
                        <TextField margin="normal" required fullWidth name="password" label="Hasło" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} variant="outlined" />
                        <TextField margin="normal" required fullWidth name="password2" label="Potwierdź hasło" type="password" id="password2" value={password2} onChange={(e) => setPassword2(e.target.value)} variant="outlined" />
                        
                        {error && ( <Typography color="error" variant="body2" align="center" sx={{ mt: 2, mb: 0.5, whiteSpace: 'pre-wrap' }}>{error}</Typography> )}
                        
                        <Button type="submit" fullWidth variant="contained" color="primary" disabled={loading} sx={{ mt: 3, mb: 2, py: 1.2, fontSize: '1rem' }} >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Zarejestruj się'}
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
                        
                        <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
                            <Grid item>
                                <Link component={RouterLink} to="/login" variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' }}}>
                                    Masz już konto? Zaloguj się
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}
export default SignupPage;