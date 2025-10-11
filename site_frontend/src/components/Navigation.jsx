import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

function Navigation() {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => { setMobileOpen(!mobileOpen); };
    const handleLogout = () => { logout(); /* Przekierowanie jest już w AuthContext */ };

    const baseNavItems = [
        { text: 'Strona Główna', path: '/' },
        { text: 'Kalendarz', path: '/calendar' },
        { text: 'Informacje', path: '/info' },
    ];

    const userSpecificNavItems = [];
    if (isAuthenticated && user) {
        // ### POCZĄTEK ZMIANY ###
        // Każdy zalogowany użytkownik (student, vip, a nawet admin) ma dostęp do swojego panelu studenta.
        userSpecificNavItems.push({ text: 'Panel Studenta', path: '/student-dashboard' });
        
        // Dodatkowo, jeśli użytkownik jest adminem, zobaczy link do panelu admina.
        if (user.user_type === 'admin') {
            userSpecificNavItems.push({ text: 'Panel Admina', path: '/admin' });
        }
        // ### KONIEC ZMIANY ###
    }
    const navItems = [...baseNavItems, ...userSpecificNavItems];

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250 }} role="presentation">
            <Typography variant="h6" sx={{ my: 2, color: 'primary.main' }}>Menu</Typography>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton component={RouterLink} to={item.path}>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {isAuthenticated ? (
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemText primary={`Wyloguj (${user?.first_name || user?.email?.split('@')[0]})`} />
                        </ListItemButton>
                    </ListItem>
                ) : (
                    <ListItem disablePadding>
                        <ListItemButton component={RouterLink} to="/login">
                            <ListItemText primary="Zaloguj" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar component="nav" position="sticky" elevation={0} sx={{ top: 0, zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'var(--surface-color)' }}>
                <Toolbar
                    sx={{
                        minHeight: 'var(--navbar-height) !important',
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingLeft: { xs: 2, sm: 4 },
                        paddingRight: { xs: 2, sm: 4 },
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}
                            sx={{
                                display: { sm: 'none' }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component={RouterLink} to="/" sx={{
                            color: 'primary.main',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            '&:hover': { color: 'primary.light' },
                            ml: { xs: 0, sm: 0 }
                        }}>
                            Korepetycje IT
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.text}
                                    component={NavLink}
                                    to={item.path}
                                    sx={(theme) => ({
                                        color: theme.palette.text.secondary,
                                        ml: 1.5,
                                        '&:hover': { color: theme.palette.primary.main, backgroundColor: 'rgba(255, 140, 0, 0.08)' },
                                        '&.active': { color: theme.palette.primary.main, fontWeight: 'bold', borderBottom: `2px solid ${theme.palette.primary.main}` }
                                    })}
                                >
                                    {item.text}
                                </Button>
                            ))}
                        </Box>
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, ml: 7 }}>
                            {isAuthenticated ? (
                                <Button onClick={handleLogout} color="secondary" variant="outlined">
                                    Wyloguj ({user?.first_name || user?.email?.split('@')[0]})
                                </Button>
                            ) : (
                                <Button component={RouterLink} to="/login" color="primary" variant="contained">
                                    Zaloguj
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true, }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, backgroundColor: 'background.paper' }, }} >
                {drawer}
            </Drawer>
        </>
    );
}
export default Navigation;