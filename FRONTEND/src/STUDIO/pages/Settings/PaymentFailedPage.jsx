import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import useTheme from '../../../theme/useTheme';

const PaymentFailedPage = () => {
  const { colors, muiTheme } = useTheme();
  const navigate = useNavigate();

  const palette = muiTheme?.palette || {};
  const backgroundPalette = palette.background || {};
  const accentColor = colors?.interactive?.default || palette.primary?.main || '#1976d2';
  const surfaceColor = colors?.bg?.surface || backgroundPalette.paper || '#ffffff';
  const errorColor = palette.error?.main || '#f44336';

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
        <CancelOutlinedIcon sx={{ fontSize: 80, color: errorColor, mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Płatność anulowana
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Płatność została anulowana. Jeśli chcesz kontynuować, możesz spróbować ponownie.
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
      </Paper>
    </Box>
  );
};

export default PaymentFailedPage;
