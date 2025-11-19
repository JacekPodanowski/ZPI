import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Paper, 
    CircularProgress, 
    Button,
    Alert,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { 
    CheckCircle as CheckCircleIcon,
    Settings as SettingsIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { confirmDomainPayment } from '../../../services/domainService';
import REAL_DefaultLayout from '../../layouts/REAL_DefaultLayout';

const DomainPurchaseSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    
    const [confirming, setConfirming] = useState(true);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        const confirmPayment = async () => {
            if (!orderId) {
                setError('No order ID provided');
                setConfirming(false);
                return;
            }

            try {
                console.log('[DomainPurchaseSuccess] Confirming payment for order:', orderId);
                const response = await confirmDomainPayment(parseInt(orderId));
                console.log('[DomainPurchaseSuccess] Payment confirmed:', response);
                
                setOrderDetails(response);
                setConfirmed(true);
            } catch (err) {
                console.error('[DomainPurchaseSuccess] Failed to confirm payment:', err);
                setError(err.message || 'Failed to confirm payment');
            } finally {
                setConfirming(false);
            }
        };

        confirmPayment();
    }, [orderId]);

    const steps = [
        'Płatność otrzymana',
        'Konfiguracja domeny',
        'Propagacja DNS'
    ];

    const activeStep = confirmed ? 1 : 0;

    if (confirming) {
        return (
            <REAL_DefaultLayout
                title="Przetwarzanie płatności"
                subtitle="Proszę czekać, potwierdzamy Twoją płatność"
            >
                <Paper
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                    <Typography variant="h5" gutterBottom>
                        Potwierdzanie płatności...
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        To potrwa tylko chwilę
                    </Typography>
                </Paper>
            </REAL_DefaultLayout>
        );
    }

    if (error || !confirmed) {
        return (
            <REAL_DefaultLayout
                title="Błąd płatności"
                subtitle="Wystąpił problem z przetwarzaniem płatności"
            >
                <Paper
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Nie udało się potwierdzić płatności
                        </Typography>
                        <Typography variant="body2">
                            {error || 'Wystąpił nieznany błąd'}
                        </Typography>
                    </Alert>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/studio')}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4
                        }}
                    >
                        Wróć do panelu
                    </Button>
                </Paper>
            </REAL_DefaultLayout>
        );
    }

    return (
        <REAL_DefaultLayout
            title="Zakup zakończony sukcesem!"
            subtitle="Twoja domena jest konfigurowana"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper
                    sx={{
                        p: 5,
                        textAlign: 'center',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        mb: 4
                    }}
                >
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    >
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                bgcolor: 'success.light',
                                mb: 3
                            }}
                        >
                            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.dark' }} />
                        </Box>
                    </motion.div>

                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                        Płatność zakończona sukcesem!
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                        Twoja płatność została potwierdzona. Konfigurujemy Twoją domenę i ustawiamy rekordy DNS. 
                        Ten proces może potrwać kilka minut.
                    </Typography>

                    <Alert severity="info" sx={{ mb: 4, borderRadius: 2, textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>ID zamówienia:</strong> #{orderId}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Status:</strong> {orderDetails?.status || 'Konfiguracja DNS'}
                        </Typography>
                    </Alert>
                    
                    {/* Demo Notice */}
                    <Alert severity="info" sx={{ mb: 4, borderRadius: 2, textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            🧪 Tryb demo
                        </Typography>
                        <Typography variant="body2">
                            To jest demonstracja procesu zakupu domeny. W wersji produkcyjnej przetwarzana byłaby 
                            prawdziwa płatność przez OVHcloud i automatycznie konfigurowane rekordy DNS wskazujące na Twoją stronę.
                        </Typography>
                    </Alert>

                    {/* Progress Stepper */}
                    <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label, index) => (
                                <Step key={label}>
                                    <StepLabel
                                        StepIconProps={{
                                            sx: {
                                                '&.Mui-active': {
                                                    color: 'primary.main',
                                                },
                                                '&.Mui-completed': {
                                                    color: 'success.main',
                                                }
                                            }
                                        }}
                                    >
                                        {label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    <Alert severity="warning" sx={{ mb: 4, borderRadius: 2, textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            ⏱️ Czas propagacji DNS (tylko wersja produkcyjna)
                        </Typography>
                        <Typography variant="body2">
                            Przy prawdziwym zakupie domeny w wersji produkcyjnej, zmiany DNS mogą potrzebować 24-48 godzin 
                            aby rozpropagować się globalnie. Twoja domena będzie w pełni funkcjonalna po zakończeniu propagacji.
                        </Typography>
                    </Alert>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            startIcon={<SettingsIcon />}
                            onClick={() => navigate('/studio')}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 4,
                                py: 1.5
                            }}
                        >
                            Ustawienia domeny
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/studio')}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 4,
                                py: 1.5
                            }}
                        >
                            Wróć do panelu
                        </Button>
                    </Box>
                </Paper>

                {/* What's Next Section */}
                <Paper
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                        Co dalej?
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box
                                sx={{
                                    minWidth: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    color: 'primary.dark'
                                }}
                            >
                                1
                            </Box>
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Konfiguracja DNS (Tryb demo)
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    W wersji produkcyjnej nasz system automatycznie skonfigurowałby rekordy DNS aby wskazywały Twoją domenę na Twoją stronę. 
                                    Dzieje się to w tle poprzez API OVHcloud.
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box
                                sx={{
                                    minWidth: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    color: 'primary.dark'
                                }}
                            >
                                2
                            </Box>
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Produkcja: Czekaj na propagację
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    W wersji produkcyjnej z prawdziwymi domenami, zmiany DNS mogą potrzebować 24-48 godzin aby rozpropagować się globalnie. 
                                    Możesz sprawdzić status w ustawieniach domeny.
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box
                                sx={{
                                    minWidth: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    color: 'primary.dark'
                                }}
                            >
                                3
                            </Box>
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Twoja strona jest aktywna!
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Po zakończeniu propagacji DNS, Twoja strona będzie dostępna pod Twoją własną domeną.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </motion.div>
        </REAL_DefaultLayout>
    );
};

export default DomainPurchaseSuccessPage;
