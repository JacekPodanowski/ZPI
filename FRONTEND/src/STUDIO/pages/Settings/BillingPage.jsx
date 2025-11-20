import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
  TextField,
  CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/Payment';
import useTheme from '../../../theme/useTheme';
import apiClient from '../../../services/apiClient';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '0 PLN',
    color: 'grey'
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '49 PLN',
    priceNote: '/miesiąc',
    color: 'primary',
    popular: true,
    testAmount: 4900
  },
  {
    id: 'pro-plus',
    name: 'PRO+',
    price: '99 PLN',
    priceNote: '/miesiąc',
    color: 'primary',
    testAmount: 9900
  }
];

const BillingPage = () => {
  const { colors, muiTheme } = useTheme();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [testAmount, setTestAmount] = useState('100');
  const [testDescription, setTestDescription] = useState('Test payment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const palette = muiTheme?.palette || {};
  const backgroundPalette = palette.background || {};
  const accentColor = colors?.interactive?.default
    || palette.primary?.main
    || '#1976d2';
  const surfaceColor = colors?.bg?.surface
    || backgroundPalette.paper
    || '#ffffff';
  const dividerColor = palette.divider || 'rgba(0, 0, 0, 0.12)';
  const defaultBackground = colors?.bg?.default
    || backgroundPalette.default
    || '#f5f5f5';

  const handleChoosePlan = async (planId, amount) => {
    if (planId === 'free' || !amount) {
      setCurrentPlan(planId);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/payments/create/', {
        amount: amount,
        description: `Plan ${plans.find(p => p.id === planId)?.name} - miesięczna subskrypcja`,
        plan_id: planId
      });
      
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      }
    } catch (err) {
      console.error('Payment creation error:', err);
      setError(err.response?.data?.error || 'Błąd podczas tworzenia płatności');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPayment = async () => {
    const amountInGrosze = parseInt(testAmount) * 100;
    
    if (!testAmount || amountInGrosze <= 0) {
      setError('Wprowadź poprawną kwotę');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/payments/create/', {
        amount: amountInGrosze,
        description: testDescription,
        plan_id: null
      });
      
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      }
    } catch (err) {
      console.error('Test payment error:', err);
      setError(err.response?.data?.error || 'Błąd podczas tworzenia płatności testowej');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: surfaceColor,
        borderRadius: '16px',
        border: `1px solid ${alpha(dividerColor, 0.1)}`,
        p: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
        Plan i płatności
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: colors?.text?.secondary }}>
        Wybierz plan odpowiedni dla Twoich potrzeb
      </Typography>

      {/* Payment Testing Section */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: `2px solid ${accentColor}`,
          borderRadius: '16px',
          backgroundColor: alpha(accentColor, 0.05)
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PaymentIcon sx={{ color: accentColor, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Test Płatności Przelewy24
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 3, color: colors?.text?.secondary }}>
            Przetestuj integrację z Przelewy24. Po kliknięciu "Testuj płatność" zostaniesz przekierowany do sandbox Przelewy24.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              label="Kwota (PLN)"
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              size="small"
              sx={{ maxWidth: 200 }}
            />
            <TextField
              label="Opis płatności"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleTestPayment}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
              sx={{
                borderRadius: '12px',
                backgroundColor: accentColor,
                '&:hover': {
                  backgroundColor: alpha(accentColor, 0.9)
                }
              }}
            >
              {loading ? 'Przygotowywanie...' : 'Testuj płatność'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Current Plan Info */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Aktualny plan
        </Typography>
        <Chip
          label={plans.find((p) => p.id === currentPlan)?.name || 'Free'}
          color="primary"
          sx={{ borderRadius: '8px', fontWeight: 600 }}
        />
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Plans Grid */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
        Dostępne plany
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)'
          },
          gap: { xs: 2, sm: 2 }
        }}
      >
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isPrimary = plan.color === 'primary';
          const borderColor = isPrimary
            ? accentColor
            : alpha(dividerColor, 0.2);

          return (
            <Card
              key={plan.id}
              elevation={0}
              sx={{
                position: 'relative',
                border: `2px solid ${isCurrentPlan ? accentColor : borderColor}`,
                borderRadius: '12px',
                backgroundColor: isPrimary
                  ? alpha(accentColor, 0.03)
                  : defaultBackground,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: accentColor,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 16px ${alpha(accentColor, 0.1)}`
                }
              }}
            >
              {plan.popular && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: 12,
                    backgroundColor: accentColor,
                    color: 'white',
                    px: 1.5,
                    py: 0.25,
                    borderRadius: '8px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  Popularne
                </Box>
              )}
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: isPrimary ? accentColor : 'text.primary',
                        mb: 1,
                        fontSize: { xs: '1.5rem', sm: '1.75rem' }
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: isPrimary ? accentColor : 'text.primary',
                          fontSize: { xs: '1.25rem', sm: '1.5rem' }
                        }}
                      >
                        {plan.price}
                      </Typography>
                      {plan.priceNote && (
                        <Typography variant="caption" color="text.secondary">
                          {plan.priceNote}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant={isCurrentPlan ? 'outlined' : isPrimary ? 'contained' : 'outlined'}
                    disabled={isCurrentPlan || loading}
                    onClick={() => handleChoosePlan(plan.id, plan.testAmount)}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                    sx={{
                      borderRadius: '8px',
                      py: 1,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      ...(isPrimary && !isCurrentPlan && {
                        backgroundColor: accentColor,
                        '&:hover': {
                          backgroundColor: alpha(accentColor, 0.9)
                        }
                      })
                    }}
                  >
                    {isCurrentPlan ? 'Aktualny' : `Wybierz`}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Billing History Section */}
      <Box sx={{ mt: { xs: 4, md: 6 } }}>
        <Divider sx={{ mb: 4 }} />
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          Historia płatności
        </Typography>
        <Alert severity="info" sx={{ borderRadius: '12px', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          <strong>TODO:</strong> Historia płatności i zarządzanie fakturami zostanie wdrożone tutaj.
        </Alert>
      </Box>
    </Paper>
  );
};

export default BillingPage;
