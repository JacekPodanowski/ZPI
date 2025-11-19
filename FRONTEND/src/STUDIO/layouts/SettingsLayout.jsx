import React, { useState } from 'react';
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
  Divider,
  useMediaQuery,
  IconButton,
  Drawer
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import useTheme from '../../theme/useTheme';
import Navigation from '../../components/Navigation/Navigation';

const devNavigation = [
  {
    label: 'Toast',
    path: '/studio/account/toast',
    icon: <BugReportOutlinedIcon />
  }
];

const notificationsNavigation = [
  {
    label: 'Notifications',
    path: '/studio/account/notifications',
    icon: <NotificationsNoneOutlinedIcon />
  },
  {
    label: 'Mails',
    path: '/studio/account/mails',
    icon: <EmailOutlinedIcon />
  }
];

const settingsNavigation = [
  {
    label: 'Profile',
    path: '/studio/account/profile',
    icon: <PersonOutlineIcon />
  },
  {
    label: 'Domeny',
    path: '/studio/account/orders',
    icon: <LanguageIcon />
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
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;
  const subduedText = theme.colors?.text?.secondary || theme.palette.text.secondary;

  const renderNavItems = (items) =>
    items.map((item) => {
      const isActive = location.pathname === item.path;
      return (
        <ListItemButton
          key={item.path}
          onClick={() => {
            navigate(item.path);
            if (isMobile) setDrawerOpen(false);
          }}
          sx={{
            borderRadius: '12px',
            mb: 0.5,
            backgroundColor: isActive ? alpha(accentColor, 0.12) : 'transparent',
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
    });

  const sidebarContent = (
    <>
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
        Dev
      </Typography>
      <List disablePadding sx={{ mt: 1 }}>
        {renderNavItems(devNavigation)}
      </List>

      <Divider sx={{ my: 2 }} />

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
        Notifications
      </Typography>
      <List disablePadding sx={{ mt: 1 }}>
        {renderNavItems(notificationsNavigation)}
      </List>

      <Divider sx={{ my: 2 }} />

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
        Account Settings
      </Typography>
      <List disablePadding sx={{ mt: 1 }}>
        {renderNavItems(settingsNavigation)}
      </List>
    </>
  );

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          {/* Mobile Settings Menu Button */}
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                bgcolor: alpha(accentColor, 0.12),
                color: accentColor,
                '&:hover': {
                  bgcolor: alpha(accentColor, 0.2)
                }
              }}
            >
              <SettingsIcon />
            </IconButton>
          )}

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: theme.colors?.text?.primary || theme.palette.text.primary,
              fontSize: { xs: '1.75rem', md: '3rem' }
            }}
          >
            Twoje konto
          </Typography>
        </Box>
        
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            ml: isMobile ? '56px' : 0,
            color: subduedText,
            fontSize: { xs: '0.9rem', md: '1rem' }
          }}
        >
          Preferencje i ustawienia twojego konta
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Desktop Sidebar Navigation */}
          {!isMobile && (
            <Paper
              elevation={0}
              sx={{
                width: { xs: '100%', lg: 280 },
                minWidth: { xs: '100%', lg: 180 },
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
              {sidebarContent}
            </Paper>
          )}

          {/* Mobile Drawer */}
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: 280,
                backgroundColor: surfaceColor,
                p: 2
              }
            }}
          >
            {sidebarContent}
          </Drawer>

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
