import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Stack,
  Typography
} from '@mui/material';
import Grow from '@mui/material/Grow';
import { alpha } from '@mui/material/styles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useNavigate } from 'react-router-dom';
import useTheme from '../../theme/useTheme';
import AvatarUploader from './AvatarUploader';
import { resolveMediaUrl } from '../../config/api';
import apiClient from '../../services/apiClient';
import Avatar from '../Avatar/Avatar';
import { useAuth } from '../../contexts/AuthContext';

const AVATAR_BUTTON_SIZE = 44;
const GLOW_MAX_RANGE = 7;

const UserAvatarMenu = ({ user, onLogout, menuItems: menuConfig }) => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const menuSurface = theme.colors?.bg?.surface || theme.palette.background.paper;
  const subduedText = theme.colors?.text?.secondary || theme.palette.text.secondary;
  const activeShadow = `0 12px 28px ${alpha(accentColor, theme.palette.mode === 'dark' ? 0.28 : 0.2)}`;

  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const open = Boolean(anchorEl);

  // Sync localUser with user prop
  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const displayName = useMemo(() => {
    if (!localUser) {
      return 'Nieznany użytkownik';
    }
    const composed = [localUser.first_name, localUser.last_name].filter(Boolean).join(' ').trim();
    return composed.length > 0 ? composed : localUser.email;
  }, [localUser]);

  const defaultMenuItems = useMemo(
    () => ({
      settings: [
        {
          label: 'Notifications',
          icon: <NotificationsOutlinedIcon fontSize="small" />,
          path: '/studio/account/notifications',
          badge: 0 // Can be updated with actual notification count
        },
        {
          label: 'Profile Settings',
          icon: <PersonOutlineIcon fontSize="small" />,
          path: '/studio/account/profile'
        },
        {
          label: 'Billing & Plans',
          icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
          path: '/studio/account/billing'
        },
        {
          label: 'Appearance',
          icon: <PaletteOutlinedIcon fontSize="small" />,
          path: '/studio/account/appearance'
        },
        {
          label: 'Settings',
          icon: <SettingsOutlinedIcon fontSize="small" />,
          path: '/studio/account/settings'
        }
      ]
    }),
    []
  );

  const menuItems = menuConfig && (menuConfig.notifications || menuConfig.settings) ? menuConfig : defaultMenuItems;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    handleClose();
    if (path) {
      navigate(path);
    }
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const handleAvatarChange = async (newAvatarUrl) => {
    // Update local state immediately
    setLocalUser((prev) => ({ ...prev, avatar_url: newAvatarUrl }));
    // Update global auth context
    updateUser({ avatar_url: newAvatarUrl });
  };

  const avatarUrl = localUser?.avatar_url ? resolveMediaUrl(localUser.avatar_url) : null;

  // Calculate the percentage where avatar edge is in the gradient
  const avatarEdgePercent = (AVATAR_BUTTON_SIZE / (AVATAR_BUTTON_SIZE + GLOW_MAX_RANGE * 2)) * 100;

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: AVATAR_BUTTON_SIZE,
          height: AVATAR_BUTTON_SIZE,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect layer - BEHIND avatar */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: AVATAR_BUTTON_SIZE + GLOW_MAX_RANGE * 2,
            height: AVATAR_BUTTON_SIZE + GLOW_MAX_RANGE * 2,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `radial-gradient(circle, 
              transparent 0%, 
              transparent ${avatarEdgePercent - 2}%, 
              ${alpha(accentColor, 0.6)} ${avatarEdgePercent}%, 
              ${alpha(accentColor, 0.35)} ${avatarEdgePercent + 8}%, 
              ${alpha(accentColor, 0.15)} ${avatarEdgePercent + 20}%, 
              ${alpha(accentColor, 0.05)} ${avatarEdgePercent + 40}%, 
              transparent 100%)`,
            opacity: (open || isHovered) ? 1 : 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
            filter: 'blur(12px)',
            zIndex: 0,
          }}
        />

        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{
            p: 0,
            width: AVATAR_BUTTON_SIZE,
            height: AVATAR_BUTTON_SIZE,
            position: 'relative',
            zIndex: 1,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'transparent',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            boxShadow: open ? activeShadow : 'none',
            overflow: 'visible',
            '&:hover': {
              transform: 'translateY(-2px)',
              backgroundColor: 'transparent',
              boxShadow: activeShadow,
            }
          }}
        >
          <Avatar
            avatarUrl={avatarUrl}
            user={localUser}
            size={AVATAR_BUTTON_SIZE - 2}
            sx={{ 
              position: 'relative',
              zIndex: 2,
            }}
          />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Grow}
        disableScrollLock
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            px: 2,
            py: 2,
            minWidth: 280,
            borderRadius: '18px',
            backgroundColor: menuSurface,
            border: `1px solid ${alpha(accentColor, 0.12)}`,
            boxShadow: `0 24px 48px ${alpha('#000', theme.palette.mode === 'dark' ? 0.6 : 0.18)}`
          }
        }}
        MenuListProps={{
          dense: true,
          sx: { display: 'flex', flexDirection: 'column', gap: 2 }
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                avatarUrl={avatarUrl}
                user={localUser}
                size={48}
              />
              {open && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  <AvatarUploader
                    currentAvatar={localUser?.avatar_url}
                    onAvatarChange={handleAvatarChange}
                    size={48}
                  />
                </Box>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {displayName}
              </Typography>
              {localUser?.email && (
                <Typography variant="body2" sx={{ color: subduedText }}>
                  {localUser.email}
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider sx={{ borderColor: alpha(subduedText || '#000', 0.2) }} />

          {/* Notifications Section */}
          {menuItems.notifications && menuItems.notifications.length > 0 && (
            <>
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    px: 2, 
                    py: 0.5, 
                    color: subduedText, 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem'
                  }}
                >
                  Notifications
                </Typography>
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  {menuItems.notifications.map((item) => (
                    <ListItemButton
                      key={item.label}
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick({ closeMenu: handleClose });
                        } else {
                          handleNavigate(item.path);
                        }
                      }}
                      disabled={item.disabled ?? !item.path}
                      sx={{
                        borderRadius: '12px',
                        color: 'text.primary',
                        '&:hover': {
                          backgroundColor: alpha(accentColor, 0.12)
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: subduedText }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                      {item.badge > 0 && (
                        <Box
                          sx={{
                            minWidth: 20,
                            height: 20,
                            borderRadius: '10px',
                            backgroundColor: accentColor,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            px: 0.75
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                    </ListItemButton>
                  ))}
                </List>
              </Box>

              <Divider sx={{ borderColor: alpha(subduedText || '#000', 0.2) }} />
            </>
          )}

          {/* Settings Section */}
          {menuItems.settings && menuItems.settings.length > 0 && (
            <Box>
              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {menuItems.settings.map((item) => (
                  <ListItemButton
                    key={item.label}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick({ closeMenu: handleClose });
                      } else {
                        handleNavigate(item.path);
                      }
                    }}
                    disabled={item.disabled ?? !item.path}
                    sx={{
                      borderRadius: '12px',
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: alpha(accentColor, 0.12)
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: subduedText }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}

          {/* Legacy support for old menu items format (array) */}
          {Array.isArray(menuItems) && (
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {menuItems.map((item) => (
                <ListItemButton
                  key={item.label}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick({ closeMenu: handleClose });
                    } else {
                      handleNavigate(item.path);
                    }
                  }}
                  disabled={item.disabled ?? !item.path}
                  sx={{
                    borderRadius: '12px',
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: alpha(accentColor, 0.12)
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: subduedText }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}

          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{ borderRadius: '14px', fontWeight: 600 }}
          >
            Wyloguj
          </Button>
        </Stack>
      </Menu>
    </>
  );
};

UserAvatarMenu.propTypes = {
  user: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string
  }),
  onLogout: PropTypes.func.isRequired,
  menuItems: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        icon: PropTypes.node.isRequired,
        path: PropTypes.string,
        disabled: PropTypes.bool,
        onClick: PropTypes.func,
        badge: PropTypes.number
      })
    ),
    PropTypes.shape({
      notifications: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          icon: PropTypes.node.isRequired,
          path: PropTypes.string,
          disabled: PropTypes.bool,
          onClick: PropTypes.func,
          badge: PropTypes.number
        })
      ),
      settings: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          icon: PropTypes.node.isRequired,
          path: PropTypes.string,
          disabled: PropTypes.bool,
          onClick: PropTypes.func
        })
      )
    })
  ])
};

UserAvatarMenu.defaultProps = {
  user: null,
  menuItems: undefined
};

export default UserAvatarMenu;