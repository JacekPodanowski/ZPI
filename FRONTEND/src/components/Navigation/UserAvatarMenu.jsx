import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
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
  Tooltip,
  Typography
} from '@mui/material';
import Grow from '@mui/material/Grow';
import { alpha } from '@mui/material/styles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PhotoCameraBackOutlinedIcon from '@mui/icons-material/PhotoCameraBackOutlined';
import { useNavigate } from 'react-router-dom';
import useTheme from '../../theme/useTheme';
import ShadowAvatarSrc from '../../assets/yes-avatar-shadow.svg';

const AVATAR_BUTTON_SIZE = 44;
const GLOW_MAX_RANGE = 7;

const UserAvatarMenu = ({ user, onLogout, menuItems: menuConfig }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const menuSurface = theme.colors?.bg?.surface || theme.palette.background.paper;
  const subduedText = theme.colors?.text?.secondary || theme.palette.text.secondary;
  const activeShadow = `0 12px 28px ${alpha(accentColor, theme.palette.mode === 'dark' ? 0.28 : 0.2)}`;

  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const open = Boolean(anchorEl);

  const displayName = useMemo(() => {
    if (!user) {
      return 'Nieznany użytkownik';
    }
    const composed = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    return composed.length > 0 ? composed : user.email;
  }, [user]);

  const defaultMenuItems = useMemo(
    () => ([
      {
        label: 'Ustawienia profilu',
        icon: <PersonOutlineIcon fontSize="small" />,
        path: null
      },
      {
        label: 'Płatności',
        icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
        path: null
      },
      {
        label: 'Ustawienia',
        icon: <SettingsOutlinedIcon fontSize="small" />,
        path: null
      }
    ]),
    []
  );

  const menuItems = menuConfig && menuConfig.length > 0 ? menuConfig : defaultMenuItems;

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

  const avatarSrc = ShadowAvatarSrc;

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
            src={avatarSrc}
            alt={displayName}
            sx={{ 
              width: AVATAR_BUTTON_SIZE - 2, 
              height: AVATAR_BUTTON_SIZE - 2,
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
            <Avatar src={avatarSrc} alt={displayName} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {displayName}
              </Typography>
              {user?.email && (
                <Typography variant="body2" sx={{ color: subduedText }}>
                  {user.email}
                </Typography>
              )}
            </Box>
          </Stack>

          <Tooltip title="Prześlij avatar — funkcja w przygotowaniu">
            <span>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<PhotoCameraBackOutlinedIcon fontSize="small" />}
                disabled
                sx={{ borderRadius: '14px', justifyContent: 'flex-start', gap: 1 }}
              >
                Dodaj avatar (wkrótce)
              </Button>
            </span>
          </Tooltip>

          <Divider sx={{ borderColor: alpha(subduedText || '#000', 0.2) }} />

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
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      path: PropTypes.string,
      disabled: PropTypes.bool,
      onClick: PropTypes.func
    })
  )
};

UserAvatarMenu.defaultProps = {
  user: null,
  menuItems: undefined
};

export default UserAvatarMenu;