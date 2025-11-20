import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import useTheme from '../../../theme/useTheme';
import apiClient from '../../../services/apiClient';

const PaymentSuccessPage = () => {
  const { colors, muiTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  const palette = muiTheme?.palette || {};
  const backgroundPalette = palette.background || {};
  const accentColor = colors?.interactive?.default || palette.primary?.main || '#1976d2';
  const surfaceColor = colors?.bg?.surface || backgroundPalette.paper || '#ffffff';
  const successColor = palette.success?.main || '#4caf50';
  const errorColor = palette.error?.main || '#f44336';

  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      setError('Brak ID sesji płatności');
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await apiClient.get(`/payments/status/${sessionId}/`);
        setPaymentStatus(response.data);
      } catch (err) {
        console.error('Error checking payment status:', err);
        setError(err.response?.data?.error || 'Nie udało się sprawdzić statusu płatności');
      } finally {
        setLoading(false);
      }
    };

    // Check immediately
    checkPaymentStatus();

    // Poll every 3 seconds for up to 30 seconds
    const intervalId = setInterval(checkPaymentStatus, 3000);
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 30000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [searchParams]);

  const isSuccess = paymentStatus?.status === 'completed';
  const isPending = paymentStatus?.status === 'pending';
  const isFailed = paymentStatus?.status === 'failed' || paymentStatus?.status === 'cancelled';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        backgroundColor: colors?.bg?.default || backgroundPalette.default || '#f5f5f5'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 500,
          width: '100%',
          p: 4,
          borderRadius: '16px',
          border: `1px solid ${alpha(palette.divider || 'rgba(0,0,0,0.12)', 0.1)}`,
          backgroundColor: surfaceColor,
          textAlign: 'center'
        }}
      >
        {loading && (
          <>
            <CircularProgress size={60} sx={{ mb: 3, color: accentColor }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Sprawdzanie płatności...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proszę czekać, weryfikujemy status Twojej płatności
            </Typography>
          </>
        )}

        {!loading && error && (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: errorColor, mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Wystąpił błąd
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/studio/account/billing')}
              sx={{
                borderRadius: '12px',
                backgroundColor: accentColor,
                '&:hover': {
                  backgroundColor: alpha(accentColor, 0.9)
                }
              }}
            >
              Powrót do rozliczeń
            </Button>
          </>
        )}

        {!loading && !error && isSuccess && (
          <>
            <CheckCircleOutlineIcon sx={{ fontSize: 80, color: successColor, mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Płatność zakończona sukcesem!
            </Typography>
            <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', textAlign: 'left' }}>
              Twoja płatność została zrealizowana pomyślnie.
              {paymentStatus.plan_id && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Twój plan został zaktualizowany do: <strong>{paymentStatus.plan_id.toUpperCase()}</strong>
                </Typography>
              )}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Kwota: <strong>{(paymentStatus.amount / 100).toFixed(2)} PLN</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              ID transakcji: <strong>{paymentStatus.session_id}</strong>
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/studio/account/billing')}
              sx={{
                borderRadius: '12px',
                backgroundColor: accentColor,
                '&:hover': {
                  backgroundColor: alpha(accentColor, 0.9)
                }
              }}
            >
              Powrót do rozliczeń
            </Button>
          </>
        )}

        {!loading && !error && isPending && (
          <>
            <CircularProgress size={60} sx={{ mb: 3, color: accentColor }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Przetwarzanie płatności...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Twoja płatność jest weryfikowana. To może potrwać kilka chwil.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/studio/account/billing')}
              sx={{ borderRadius: '12px' }}
            >
              Powrót do rozliczeń
            </Button>
          </>
        )}

        {!loading && !error && isFailed && (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: errorColor, mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Płatność nieudana
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Niestety, Twoja płatność nie została zrealizowana. Spróbuj ponownie lub skontaktuj się z obsługą.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/studio/account/billing')}
              sx={{
                borderRadius: '12px',
                backgroundColor: accentColor,
                '&:hover': {
                  backgroundColor: alpha(accentColor, 0.9)
                }
              }}
            >
              Spróbuj ponownie
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentSuccessPage;
