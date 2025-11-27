import React, { useMemo, useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
    Tooltip,
    Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo/Logo';
import useTheme from '../../theme/useTheme';
import UserAvatarMenu from './UserAvatarMenu';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import ShadowAvatarSrc from '../../assets/yes-avatar-shadow.svg';
import AdminLink from '../AdminLink/AdminLink';

const drawerWidth = 280;
const NAV_HEIGHT = 60;

const Navigation = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { mode, toggleMode } = theme;

    const avatarSrc = ShadowAvatarSrc;
    const isAdminPage = location.pathname.startsWith('/studio/admin');

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
                label: 'Powiadomienia',
                icon: <NotificationsNoneOutlinedIcon fontSize="small" />,
                path: '/studio/account/notifications'
            },
            {
                label: 'Ustawienia profilu',
                icon: <PersonOutlineIcon fontSize="small" />,
                path: '/studio/account/profile'
            },
            {
                label: 'Plan i płatności',
                icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
                path: '/studio/account/billing'
            },
            {
                label: 'Domeny',
                icon: <LanguageIcon fontSize="small" />,
                path: '/studio/account/orders'
            },
            {
                label: 'Informacje',
                icon: <InfoOutlinedIcon fontSize="small" />,
                path: '/info'
            },
            {
                label: 'Ustawienia',
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
                { label: 'Strony', to: '/studio/sites', requiresAuth: true },
                { label: 'Kalendarz', to: '/studio/calendar/creator', requiresAuth: true },
                { label: 'Wydarzenia', to: '/studio/events', requiresAuth: true },
                { label: 'Viewer', to: '/viewer', requiresAuth: true }
            );
        }

        // Admin-specific navigation items
        const admin = [];
        if (user?.is_staff && isAdminPage) {
            admin.push(
                { label: 'Panel admina', to: '/studio/admin' },
                { label: 'Regulaminy', to: '/studio/admin/terms' }
            );
        }

        return {
            primary,
            admin,
            dev: [] // Keep for compatibility, but always empty
        };
    }, [isAuthenticated, user, isAdminPage]);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const handleLogout = () => {
        logout();
        setMobileOpen(false);
        navigate('/');
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
                        {/* Primary navigation */}
                        {navGroups.primary.map((item, index) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Button
                                    component={NavLink}
                                    to={item.to}
                                    sx={{
                                        color: 'text.secondary',
                                        transition: 'all 0.3s ease',
                                        '&.active': {
                                            color: 'primary.main',
                                            backgroundColor: 'rgba(160, 0, 22, 0.08)'
                                        }
                                    }}
                                >
                                    {item.label}
                                </Button>
                            </motion.div>
                        ))}
                        
                        {/* Separator and Admin routes when on admin pages */}
                        <AnimatePresence>
                            {isAdminPage && navGroups.admin.length > 0 && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        exit={{ opacity: 0, scaleX: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 30, alignSelf: 'center' }} />
                                    </motion.div>
                                    {navGroups.admin.map((item, index) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <Button
                                                component={NavLink}
                                                to={item.to}
                                                end={item.to === '/studio/admin'}
                                                sx={{
                                                    color: 'text.secondary',
                                                    transition: 'all 0.3s ease',
                                                    '&.active': {
                                                        color: 'primary.main',
                                                        backgroundColor: 'rgba(160, 0, 22, 0.08)'
                                                    }
                                                }}
                                            >
                                                {item.label}
                                            </Button>
                                        </motion.div>
                                    ))}
                                </>
                            )}
                        </AnimatePresence>
                    </Box>

                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
                        {/* Admin link button (only for staff users, only on non-admin pages) */}
                        {user?.is_staff && !isAdminPage && (
                            <Button
                                component={RouterLink}
                                to="/studio/admin"
                                sx={{
                                    color: 'text.secondary',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        color: 'primary.main',
                                        backgroundColor: 'rgba(160, 0, 22, 0.08)'
                                    }
                                }}
                            >
                                <AdminLink />
                            </Button>
                        )}
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
                            <>
                                <Tooltip title="Regulamin i informacje" arrow>
                                    <IconButton
                                        onClick={() => navigate('/info')}
                                        sx={{
                                            color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.6)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
                                                backgroundColor: 'action.hover'
                                            }
                                        }}
                                    >
                                        <InfoOutlinedIcon />
                                    </IconButton>
                                </Tooltip>
                                <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                                    Zaloguj
                                </Button>
                            </>
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
