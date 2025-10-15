import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import useTheme from '../../theme/useTheme';
import Navigation from '../../components/Navigation/Navigation';

const settingsNavigation = [
  {
    label: 'Profile',
    path: '/studio/account/profile',
    icon: <PersonOutlineIcon />
  },
  {
    label: 'Billing & Plans',
    path: '/studio/account/billing',
    icon: <AccountBalanceWalletOutlinedIcon />
  },
  {
    label: 'Appearance',
    path: '/studio/account/appearance',
    icon: <PaletteOutlinedIcon />
  },
  {
    label: 'Settings',
    path: '/studio/account/settings',
    icon: <SettingsOutlinedIcon />
  }
];

const SettingsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;
  const subduedText = theme.colors?.text?.secondary || theme.palette.text.secondary;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.colors?.bg?.default || theme.palette.background.default
      }}
    >
      {/* Add Navigation at the top */}
      <Navigation />

      <Box sx={{ pt: 4, pb: 8 }}>
        <Container maxWidth="xl">
        <Typography
          variant="h3"
          sx={{
            mb: 1,
            fontWeight: 700,
            color: theme.colors?.text?.primary || theme.palette.text.primary
          }}
        >
          Account Settings
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: subduedText
          }}
        >
          Manage your account preferences and settings
        </Typography>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Sidebar Navigation */}
          <Paper
            elevation={0}
            sx={{
              width: { xs: 200, md: '15%' },
              minWidth: 180,
              flexShrink: 0,
              backgroundColor: surfaceColor,
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              p: 2,
              height: 'fit-content',
              position: 'sticky',
              top: 100
            }}
          >
            <Typography
              variant="overline"
              sx={{
                px: 2,
                py: 1,
                color: subduedText,
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              Navigation
            </Typography>
            <List disablePadding sx={{ mt: 1 }}>
              {settingsNavigation.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: '12px',
                      mb: 0.5,
                      backgroundColor: isActive
                        ? alpha(accentColor, 0.12)
                        : 'transparent',
                      color: isActive
                        ? accentColor
                        : theme.colors?.text?.primary || theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: alpha(accentColor, 0.08)
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isActive ? accentColor : subduedText
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: isActive ? 600 : 500
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>

          {/* Main Content Area */}
          <Box sx={{ flex: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </Container>
      </Box>
    </Box>
  );
};

export default SettingsLayout;
