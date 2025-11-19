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
        'Payment Received',
        'Domain Configuration',
        'DNS Propagation'
    ];

    const activeStep = confirmed ? 1 : 0;

    if (confirming) {
        return (
            <REAL_DefaultLayout
                title="Processing Payment"
                subtitle="Please wait while we confirm your payment"
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
                        Confirming Your Payment...
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        This should only take a moment
                    </Typography>
                </Paper>
            </REAL_DefaultLayout>
        );
    }

    if (error || !confirmed) {
        return (
            <REAL_DefaultLayout
                title="Payment Error"
                subtitle="There was a problem processing your payment"
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
                            Payment Confirmation Failed
                        </Typography>
                        <Typography variant="body2">
                            {error || 'An unknown error occurred'}
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
                        Return to Dashboard
                    </Button>
                </Paper>
            </REAL_DefaultLayout>
        );
    }

    return (
        <REAL_DefaultLayout
            title="Purchase Successful!"
            subtitle="Your domain is being configured"
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
                        Payment Successful!
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                        Your payment has been confirmed. We are now configuring your domain and setting up DNS records. 
                        This process may take a few minutes.
                    </Typography>

                    <Alert severity="info" sx={{ mb: 4, borderRadius: 2, textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Order ID:</strong> #{orderId}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Status:</strong> {orderDetails?.status || 'Configuring DNS'}
                        </Typography>
                    </Alert>
                    
                    {/* Demo Notice */}
                    <Alert severity="info" sx={{ mb: 4, borderRadius: 2, textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            🧪 Demo Mode
                        </Typography>
                        <Typography variant="body2">
                            This is a demonstration of the domain purchase flow. In production, this would process 
                            a real payment through OVHcloud and automatically configure DNS records to point to your site.
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
                            ⏱️ DNS Propagation Time (Production Only)
                        </Typography>
                        <Typography variant="body2">
                            When using real domain purchases in production, DNS changes may take 24-48 hours 
                            to propagate globally. Your domain will be fully functional once propagation is complete.
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
                            Domain Settings
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
                            Back to Dashboard
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
                        What's Next?
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
                                    DNS Configuration (Demo Mode)
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    In production, our system would automatically configure DNS records to point your domain to your site. 
                                    This happens in the background via OVHcloud API.
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
                                    Production: Wait for Propagation
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    In production with real domains, DNS changes can take 24-48 hours to propagate worldwide. 
                                    You can check the status in your domain settings.
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
                                    Your Site is Live!
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Once DNS propagation is complete, your site will be accessible at your custom domain.
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
