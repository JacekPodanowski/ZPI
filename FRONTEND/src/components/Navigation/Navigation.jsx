import React, { useMemo, useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Toolbar,
    Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo/Logo';
import useTheme from '../../theme/useTheme';

const drawerWidth = 280;

const Navigation = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, toggleMode } = theme;

    const navGroups = useMemo(() => {
        const primary = [
            { label: 'Strona główna', to: '/' },
            { label: 'Style', to: '/styles' }
        ];

        if (isAuthenticated) {
            primary.push({ label: 'Studio', to: '/studio/dashboard', requiresAuth: true });
        }

        const dev = [
            { label: 'Publiczny kalendarz', to: '/studio/calendar/public' },
            { label: 'Kalendarz twórcy', to: '/studio/calendar/creator', requiresAuth: true },
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
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleLogout}
                >
                    Wyloguj ({user?.first_name || user?.email})
                </Button>
            ) : (
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                >
                    Zaloguj
                </Button>
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
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    backgroundColor: 'transparent',
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Toolbar sx={{ minHeight: 72, display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
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
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleLogout}
                            >
                                Wyloguj ({user?.first_name || user?.email})
                            </Button>
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
