import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import apiClient from '../../../services/apiClient';

function SetupAccountPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Validate token and get user info
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await apiClient.get(`/api/v1/validate-setup-token/${token}/`);
        setUserInfo(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Link jest nieprawidłowy lub wygasł.');
        setLoading(false);
      }
    };
    
    validateToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.newPassword) {
      errors.newPassword = 'Hasło jest wymagane';
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'Hasło musi mieć minimum 8 znaków';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      errors.newPassword = 'Hasło musi zawierać małą literę, wielką literę i cyfrę';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Potwierdzenie hasła jest wymagane';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Hasła nie są identyczne';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const response = await apiClient.post(`/api/v1/setup-account/${token}/`, {
        new_password: formData.newPassword,
      });
      
      // Account setup successful - redirect to login with success message
      navigate('/studio/login', { 
        state: { 
          message: 'Konto zostało skonfigurowane! Możesz się teraz zalogować.',
          email: userInfo?.email 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Wystąpił błąd podczas konfiguracji konta.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !userInfo) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom color="error">
              Nieprawidłowy link
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/studio/login')}
            >
              Wróć do logowania
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 1 }}>
            Konfiguracja konta
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Witaj <strong>{userInfo?.email}</strong>! Ustaw bezpieczne hasło do swojego konta.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nowe hasło"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              error={!!validationErrors.newPassword}
              helperText={validationErrors.newPassword || 'Min. 8 znaków, mała litera, wielka litera, cyfra'}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Potwierdź hasło"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{ mb: 2 }}
            >
              {submitting ? 'Konfigurowanie...' : 'Ustaw hasło i aktywuj konto'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default SetupAccountPage;
