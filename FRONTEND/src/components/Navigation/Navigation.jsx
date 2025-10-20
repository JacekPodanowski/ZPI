import React, { useMemo, useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Stack,
    Toolbar,
    Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo/Logo';
import useTheme from '../../theme/useTheme';
import UserAvatarMenu from './UserAvatarMenu';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import ShadowAvatarSrc from '../../assets/yes-avatar-shadow.svg';

const drawerWidth = 280;
const NAV_HEIGHT = 60;

const Navigation = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, toggleMode } = theme;

    const avatarSrc = ShadowAvatarSrc;

    const displayName = useMemo(() => {
        if (!user) {
            return 'Gość';
        }
        const combined = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
        return combined.length > 0 ? combined : user.email;
    }, [user]);

    const userMenuItems = useMemo(
        () => ([
            {
                label: 'Notifications',
                icon: <NotificationsNoneOutlinedIcon fontSize="small" />,
                path: '/studio/account/notifications'
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
        ]),
        []
    );

    const navGroups = useMemo(() => {
        const primary = [];

        if (isAuthenticated) {
            primary.push(
                { label: 'Sites', to: '/studio/sites', requiresAuth: true },
                { label: 'Kalendarz twórcy', to: '/studio/calendar/creator', requiresAuth: true }
            );
        }

        const dev = [
            { label: 'Publiczny kalendarz', to: '/studio/calendar/public' },
            { label: 'Toasty', to: '/studio/lab/toast' },
            { label: 'Admin', to: '/studio/admin', requiresAuth: true }
        ];

        return {
            primary,
            dev: dev.filter((item) => !item.requiresAuth || isAuthenticated)
        };
    }, [isAuthenticated]);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const handleLogout = () => {
        logout();
        setMobileOpen(false);
    };

    const drawer = (
        <Box sx={{ textAlign: 'center', height: '100%' }} role="presentation" onClick={handleDrawerToggle}>
            <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
                <Logo size="small" variant="default" />
            </Box>
            <Divider />
            <List>
                {navGroups.primary.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton component={RouterLink} to={item.to} sx={{ textAlign: 'center' }}>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ my: 2 }} />
            {navGroups.dev.length > 0 && (
                <List
                    subheader={(
                        <ListSubheader component="div" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                            <Chip label="DEV" color="secondary" size="small" />
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 2 }}>
                                Podglądy kalendarza
                            </Typography>
                        </ListSubheader>
                    )}
                >
                    {navGroups.dev.map((item) => (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton component={RouterLink} to={item.to} sx={{ textAlign: 'center' }}>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
            <Divider sx={{ my: 2 }} />
            {isAuthenticated ? (
                <Box sx={{ px: 2, pb: 3, textAlign: 'left' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar src={avatarSrc} alt={displayName} sx={{ width: 48, height: 48 }} />
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {displayName}
                            </Typography>
                            {user?.email && (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {user.email}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                    <List sx={{ mb: 2 }}>
                        {userMenuItems.map((item) => (
                            <ListItem key={item.label} disablePadding>
                                <ListItemButton
                                    component={RouterLink}
                                    to={item.path}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setMobileOpen(false);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        textAlign: 'left'
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleLogout();
                        }}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                        Wyloguj
                    </Button>
                </Box>
            ) : (
                <Box sx={{ px: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to="/login"
                        onClick={(event) => {
                            event.stopPropagation();
                            setMobileOpen(false);
                        }}
                    >
                        Zaloguj
                    </Button>
                </Box>
            )}
            <Box sx={{ mt: 2, px: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleMode();
                    }}
                >
                    {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ flex: '0 0 auto', width: '100%' }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: (muiTheme) =>
                        muiTheme.palette.mode === 'dark'
                            ? 'rgba(12, 12, 12, 0.96)'
                            : 'rgba(228, 229, 218, 0.92)',
                    backdropFilter: 'blur(12px)',
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    height: NAV_HEIGHT
                }}
            >
                <Toolbar sx={{ minHeight: NAV_HEIGHT, height: NAV_HEIGHT, display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            color="inherit"
                            aria-label="open navigation"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Box
                            component={RouterLink}
                            to="/"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none'
                            }}
                        >
                            <Logo size="small" variant="default" animated />
                        </Box>
                    </Box>

                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
                        {navGroups.primary.map((item) => (
                            <Button
                                key={item.label}
                                component={NavLink}
                                to={item.to}
                                sx={{
                                    color: 'text.secondary',
                                    '&.active': {
                                        color: 'primary.main',
                                        backgroundColor: 'rgba(160, 0, 22, 0.08)'
                                    }
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>

                    {navGroups.dev.length > 0 && (
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                            <Chip label="DEV" color="secondary" size="small" sx={{ fontWeight: 600 }} />
                            {navGroups.dev.map((item) => (
                                <Button
                                    key={item.label}
                                    component={NavLink}
                                    to={item.to}
                                    sx={{
                                        color: 'text.secondary',
                                        '&.active': {
                                            color: 'primary.main',
                                            backgroundColor: 'rgba(160, 0, 22, 0.08)'
                                        }
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                    )}

                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
                        <IconButton
                            onClick={toggleMode}
                            color="inherit"
                            aria-label="toggle theme"
                            sx={{
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                        </IconButton>
                        {isAuthenticated ? (
                            <UserAvatarMenu
                                user={user}
                                onLogout={handleLogout}
                                menuItems={userMenuItems}
                            />
                        ) : (
                            <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                                Zaloguj
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="nav">
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>
        </Box>
    );
};

export default Navigation;
