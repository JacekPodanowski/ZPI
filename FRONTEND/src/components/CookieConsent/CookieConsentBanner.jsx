import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Switch,
  Collapse,
  Link
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CookieIcon from '@mui/icons-material/Cookie';
import { useNavigate } from 'react-router-dom';
import useTheme from '../../theme/useTheme';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserPreferences } from '../../services/authService';

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_CONSENT_VERSION = '1.0';

// Get consent from localStorage (for non-logged users)
const getLocalConsent = () => {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version === COOKIE_CONSENT_VERSION) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cookie consent:', e);
  }
  return null;
};

// Save consent to localStorage
const saveLocalConsent = (consent) => {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
    ...consent,
    version: COOKIE_CONSENT_VERSION,
    timestamp: new Date().toISOString()
  }));
};

const CookieConsentBanner = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true, // Always required
    analytics: true,  // Default to true for preferences
    marketing: true   // Default to true for preferences
  });

  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const bgColor = theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)';

  useEffect(() => {
    // Check if user already has consent
    if (isAuthenticated && user?.preferences?.consent) {
      // Logged-in user has already given consent
      setShowBanner(false);
      return;
    }

    // Check localStorage for non-logged users or new users
    const localConsent = getLocalConsent();
    if (localConsent) {
      setShowBanner(false);
      setConsent({
        necessary: true,
        analytics: localConsent.analytics || false,
        marketing: localConsent.marketing || false
      });
    } else {
      // No consent given yet - show banner
      setShowBanner(true);
    }
  }, [isAuthenticated, user]);

  const handleAcceptAll = async () => {
    const newConsent = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    
    await saveConsent(newConsent);
  };

  const handleSavePreferences = async () => {
    await saveConsent(consent);
  };

  const saveConsent = async (consentData) => {
    // Save to localStorage (for immediate use and non-logged users)
    saveLocalConsent(consentData);

    // If user is logged in, also save to backend
    if (isAuthenticated && user) {
      try {
        const updatedPreferences = {
          ...user.preferences,
          consent: {
            functionalCookies: true,
            analyticsCookies: consentData.analytics,
            marketingCookies: consentData.marketing,
            marketingEmails: consentData.marketing
          }
        };
        const response = await updateUserPreferences(updatedPreferences);
        updateUser(response);
      } catch (err) {
        console.error('Failed to save consent to backend:', err);
      }
    }

    setShowBanner(false);
  };

  const handleConsentChange = (type) => (event) => {
    if (type === 'necessary') return; // Cannot disable necessary cookies
    setConsent(prev => ({
      ...prev,
      [type]: event.target.checked
    }));
  };

  if (!showBanner) return null;

  return (
    <Paper
      elevation={24}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: bgColor,
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${alpha(accentColor, 0.2)}`,
        p: { xs: 2, sm: 3 },
        borderRadius: 0
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'stretch', md: 'flex-start' }}
          justifyContent="space-between"
        >
          {/* Text content */}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <CookieIcon sx={{ color: accentColor, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                Ta strona używa plików cookie
              </Typography>
            </Stack>
            
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
              Używamy plików cookie, aby zapewnić prawidłowe działanie strony oraz poprawić Twoje doświadczenia. 
              Niektóre cookies są niezbędne do funkcjonowania serwisu, inne pomagają nam analizować 
              ruch i personalizować treści.{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/policy')}
                sx={{ color: accentColor, fontWeight: 600 }}
              >
                Dowiedz się więcej
              </Link>
            </Typography>

            {/* Expandable details */}
            <Collapse in={showDetails}>
              <Stack spacing={1.5} sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.divider, 0.05), borderRadius: 2 }}>
                  {/* Necessary cookies */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Niezbędne
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Wymagane do działania strony (logowanie, bezpieczeństwo, preferencje)
                      </Typography>
                    </Box>
                    <Switch
                      checked={true}
                      disabled
                      size="small"
                    />
                  </Box>

                  {/* Analytics cookies */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Analityczne
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pomagają nam zrozumieć jak korzystasz ze strony
                      </Typography>
                    </Box>
                    <Switch
                      checked={consent.analytics}
                      onChange={handleConsentChange('analytics')}
                      size="small"
                      color="primary"
                    />
                  </Box>

                  {/* Marketing cookies */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Marketingowe
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Personalizacja treści i reklam
                      </Typography>
                    </Box>
                    <Switch
                      checked={consent.marketing}
                      onChange={handleConsentChange('marketing')}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </Stack>
              </Collapse>
          </Box>

          {/* Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row', md: 'column' }}
            spacing={1.5}
            sx={{ 
              minWidth: { md: 200 },
              alignItems: { xs: 'stretch', md: 'stretch' }
            }}
          >
            <Button
              variant="contained"
              onClick={handleAcceptAll}
              sx={{
                backgroundColor: accentColor,
                fontWeight: 600,
                borderRadius: '10px',
                textTransform: 'none',
                py: 1.2,
                '&:hover': {
                  backgroundColor: alpha(accentColor, 0.9)
                }
              }}
            >
              Akceptuj wszystkie
            </Button>

            {showDetails ? (
              <Button
                variant="outlined"
                onClick={handleSavePreferences}
                sx={{
                  borderColor: alpha(accentColor, 0.5),
                  color: accentColor,
                  fontWeight: 600,
                  borderRadius: '10px',
                  textTransform: 'none',
                  py: 1.2,
                  '&:hover': {
                    borderColor: accentColor,
                    backgroundColor: alpha(accentColor, 0.08)
                  }
                }}
              >
                Zapisz preferencje
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={() => setShowDetails(true)}
                sx={{
                  borderColor: alpha(theme.palette.divider, 0.3),
                  color: 'text.secondary',
                  fontWeight: 600,
                  borderRadius: '10px',
                  textTransform: 'none',
                  py: 1.2,
                  '&:hover': {
                    borderColor: alpha(accentColor, 0.5),
                    backgroundColor: alpha(accentColor, 0.05)
                  }
                }}
              >
                Zarządzaj preferencjami
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default CookieConsentBanner;
