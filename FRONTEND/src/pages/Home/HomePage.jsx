import React from 'react';
import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedLogoHero from '../../components/Logo/AnimatedLogoHero';

const steps = [
    {
        title: 'Wybierz szablon',
        description: 'Startujesz od gotowego projektu dopasowanego do branży wellness. Wszystko jest w pełni responsywne.'
    },
    {
        title: 'Dopasuj moduły',
        description: 'Zdecyduj, które sekcje mają znaleźć się na stronie: kalendarz, oferta, opinie, blog i wiele więcej.'
    },
    {
        title: 'Publikuj jednym kliknięciem',
        description: 'Połącz stronę z naszym backendem, a nowa wersja pojawi się na Twojej domenie w kilkadziesiąt sekund.'
    }
];

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const startCreationFlow = () => {
        if (isAuthenticated) {
            navigate('/studio/new');
        } else {
            navigate('/login', { state: { from: { pathname: '/studio/new' } } });
        }
    };

    return (
        <Container maxWidth="lg">
            <AnimatedLogoHero size="xlarge" />
            <Stack spacing={{ xs: 6, md: 10 }}>
                <Box
                    sx={{
                        background: 'linear-gradient(120deg, rgba(160,0,22,0.12), rgba(12,12,12,0.05))',
                        borderRadius: 6,
                        px: { xs: 4, md: 8 },
                        py: { xs: 6, md: 10 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        textAlign: { xs: 'left', md: 'center' },
                        gap: 3
                    }}
                >
                    <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: 3 }}>
                        MODERN WELLNESS PLATFORM
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 700, maxWidth: 720 }}>
                        Zbuduj swoją osobistą stronę i studio rezerwacji w kilka minut
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600 }}>
                        Minimalistyczny edytor, gotowe moduły i wsparcie AI wprowadzające zmiany na żywo. Wszystko w jednym, 
                        centralnym panelu, który zadba o Twoją obecność w sieci.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button variant="contained" size="large" onClick={startCreationFlow}>
                            Stwórz swoją stronę
                        </Button>
                        <Button variant="outlined" size="large" onClick={() => navigate('/calendar')}>
                            Zobacz kalendarz klienta
                        </Button>
                    </Stack>
                </Box>

                <Box
                    sx={{
                        borderRadius: 6,
                        backgroundColor: 'background.paper',
                        border: '1px solid rgba(70, 70, 68, 0.2)',
                        px: { xs: 4, md: 8 },
                        py: { xs: 5, md: 8 },
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        Studio w Twoich rękach
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                        Po zalogowaniu przejdziesz do panelu Studio. Tam dobierzesz moduły, ustawisz kolory i treści, 
                        a następnie opublikujesz swoją stronę. Wszystko w jednym miejscu, bez znajomości kodu.
                    </Typography>
                    <Button variant="outlined" size="large" onClick={startCreationFlow}>
                        Przejdź do Studio
                    </Button>
                </Box>
            </Stack>
        </Container>
    );
};

export default HomePage;
