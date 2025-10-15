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
  Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import useTheme from '../../../theme/useTheme';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out the platform',
    color: 'grey',
    features: [
      { text: '1 site limit', available: true },
      { text: '30 days site lifetime', available: true },
      { text: 'No backups', available: false },
      { text: 'AI Assistant (30 requests/month)', available: true },
      { text: 'Basic templates', available: true },
      { text: 'Community support', available: true },
      { text: 'Analytics', available: false },
      { text: 'Custom domain', available: false }
    ]
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '$0',
    priceNote: '/month',
    description: 'For professionals',
    color: 'primary',
    popular: true,
    features: [
      { text: '3 sites (unlimited lifetime)', available: true },
      { text: 'Automatic backups', available: true },
      { text: 'AI Assistant (300 requests/month)', available: true },
      { text: 'All templates', available: true },
      { text: 'Priority support', available: true },
      { text: 'Advanced analytics', available: true },
      { text: 'Custom domain', available: true },
      { text: 'SEO tools', available: true }
    ]
  },
  {
    id: 'pro-plus',
    name: 'PRO+',
    price: '$0',
    priceNote: '/month',
    description: 'For agencies and power users',
    color: 'primary',
    features: [
      { text: '10 sites (unlimited lifetime)', available: true },
      { text: 'Automatic backups + version history', available: true },
      { text: 'AI Assistant (1000 requests/month)', available: true },
      { text: 'All templates + custom templates', available: true },
      { text: 'Dedicated support', available: true },
      { text: 'Advanced analytics + exports', available: true },
      { text: 'Multiple custom domains', available: true },
      { text: 'Advanced SEO tools', available: true },
      { text: 'White-label options', available: true },
      { text: 'API access', available: true }
    ]
  }
];

const BillingPage = () => {
  const { colors, muiTheme } = useTheme();
  const [currentPlan, setCurrentPlan] = useState('free');

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

  const handleChoosePlan = (planId) => {
    setCurrentPlan(planId);
    console.log('Plan selected:', planId);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: surfaceColor,
        borderRadius: '16px',
        border: `1px solid ${alpha(dividerColor, 0.1)}`,
        p: 4
      }}
    >
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Billing & Plans
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: colors?.text?.secondary }}>
        Choose the plan that fits your needs
      </Typography>

      <Alert severity="warning" sx={{ mb: 4, borderRadius: '12px' }}>
        <strong>Development Mode:</strong> Payment API is not connected. Plan changes are simulated only.
      </Alert>

      {/* Current Plan Info */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Current Plan
        </Typography>
        <Chip
          label={plans.find((p) => p.id === currentPlan)?.name || 'Free'}
          color="primary"
          sx={{ borderRadius: '8px', fontWeight: 600 }}
        />
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Plans Grid */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Available Plans
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          },
          gap: 3
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
                borderRadius: '16px',
                backgroundColor: isPrimary
                  ? alpha(accentColor, 0.03)
                  : defaultBackground,
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                '&:hover': {
                  borderColor: accentColor,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 24px ${alpha(accentColor, 0.15)}`
                }
              }}
            >
              {plan.popular && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: 24,
                    backgroundColor: accentColor,
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Most Popular
                </Box>
              )}
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Stack spacing={3} sx={{ flex: 1 }}>
                  {/* Plan Header */}
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: isPrimary ? accentColor : 'text.primary',
                        mb: 0.5
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: isPrimary ? accentColor : 'text.primary'
                        }}
                      >
                        {plan.price}
                      </Typography>
                      {plan.priceNote && (
                        <Typography variant="body2" color="text.secondary">
                          {plan.priceNote}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Features List */}
                  <List disablePadding sx={{ flex: 1 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {feature.available ? (
                            <CheckIcon sx={{ color: accentColor, fontSize: 20 }} />
                          ) : (
                            <CloseIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={feature.text}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: feature.available ? 'text.primary' : 'text.disabled',
                            sx: {
                              textDecoration: feature.available ? 'none' : 'line-through'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Action Button */}
                  <Button
                    fullWidth
                    variant={isCurrentPlan ? 'outlined' : isPrimary ? 'contained' : 'outlined'}
                    disabled={isCurrentPlan}
                    onClick={() => handleChoosePlan(plan.id)}
                    sx={{
                      borderRadius: '12px',
                      py: 1.5,
                      fontWeight: 600,
                      ...(isPrimary && !isCurrentPlan && {
                        backgroundColor: accentColor,
                        '&:hover': {
                          backgroundColor: alpha(accentColor, 0.9)
                        }
                      })
                    }}
                  >
                    {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Billing History Section */}
      <Box sx={{ mt: 6 }}>
        <Divider sx={{ mb: 4 }} />
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Billing History
        </Typography>
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          <strong>TODO:</strong> Billing history and invoice management will be implemented here.
        </Alert>
      </Box>
    </Paper>
  );
};

export default BillingPage;
