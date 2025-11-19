import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import useTheme from '../../../theme/useTheme';
import apiClient from '../../../services/apiClient';

const ChangePasswordPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useParams();

  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;
  const bgColor = theme.colors?.bg?.default || theme.palette.background.default;

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Check if token is present
  useEffect(() => {
    if (!token) {
      setError('Brak tokenu resetowania hasła. Poproś o nowy link.');
      setTokenValid(false);
    }
  }, [token]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = () => {
    if (!formData.newPassword) {
      setError('Wpisz nowe hasło');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Hasła różnią się');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tokenValid) {
      return;
    }
    
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/password-reset/verify/', {
        token: token,
        password: formData.newPassword
      });
      
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/studio/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Nie udało się zmienić hasła. Spróbuj ponownie.');
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        p: 2
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: '100%',
          backgroundColor: surfaceColor,
          borderRadius: '20px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          p: { xs: 3, sm: 4 },
          boxShadow: `0 8px 32px ${alpha(accentColor, 0.12)}`
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '16px',
              backgroundColor: alpha(accentColor, 0.1),
              mb: 2
            }}
          >
            <LockResetIcon sx={{ fontSize: 32, color: accentColor }} />
          </Box>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
            Zmiana hasła
          </Typography>
          <Typography variant="body2" sx={{ color: theme.colors?.text?.secondary }}>
            Wprowadź nowe hasło poniżej
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: '12px' }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            Hasło zmieniono pomyślnie! Przekierowywanie...
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              type={showPassword.new ? 'text' : 'password'}
              label="Nowe hasło"
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              disabled={loading || success}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                      disabled={loading || success}
                    >
                      {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              type={showPassword.confirm ? 'text' : 'password'}
              label="Potwierdź nowe nasło"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={loading || success}
              helperText="Wprowadź ponownie nowe hasło"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                      disabled={loading || success}
                    >
                      {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || success || !tokenValid}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}
            sx={{
              borderRadius: '12px',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: accentColor,
              boxShadow: `0 4px 14px ${alpha(accentColor, 0.3)}`,
              '&:hover': {
                backgroundColor: alpha(accentColor, 0.9),
                boxShadow: `0 6px 20px ${alpha(accentColor, 0.4)}`
              },
              '&:disabled': {
                backgroundColor: alpha(accentColor, 0.3)
              }
            }}
          >
            {loading ? 'Zmiana hasła...' : success ? 'Hasło zmienione!' : 'Zmień hasło'}
          </Button>
        </form>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="text"
            onClick={() => navigate('/studio/login')}
            disabled={loading}
            sx={{
              textTransform: 'none',
              color: theme.colors?.text?.secondary,
              '&:hover': {
                backgroundColor: alpha(accentColor, 0.08)
              }
            }}
          >
            Powrót do Logowania
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangePasswordPage;
