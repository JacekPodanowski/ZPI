import React, { useState, useEffect } from 'react';
import {
    Box,
    IconButton,
    Popover,
    Typography,
    Button,
    CircularProgress,
    Tooltip,
    Stack,
    Chip
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useToast } from '../../../../contexts/ToastContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Google Calendar SVG Icon (official colors)
const GoogleCalendarIcon = ({ sx, ...props }) => (
    <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', ...sx }}
        {...props}
    >
        <rect x="3" y="4" width="18" height="18" rx="2" fill="#ffffff" stroke="#1a73e8" strokeWidth="2"/>
        <rect x="3" y="4" width="18" height="4" rx="2" fill="#4285f4"/>
        <path d="M7 2V6M17 2V6" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round"/>
        <text x="12" y="16" fontSize="8" fontWeight="bold" fill="#1a73e8" textAnchor="middle">31</text>
    </svg>
);

const GoogleCalendarPopup = ({ sites }) => {
    const addToast = useToast();
    const [anchorEl, setAnchorEl] = useState(null);
    const [statusMap, setStatusMap] = useState({}); // Map of siteId -> status
    const [loading, setLoading] = useState(false);

    const open = Boolean(anchorEl);

    // Calculate aggregate status
    const connectedSites = Object.values(statusMap).filter(s => s?.connected);
    const hasAnyConnection = connectedSites.length > 0;
    const allConnected = sites?.length > 0 && connectedSites.length === sites.length;

    const handleClick = async (event) => {
        setAnchorEl(event.currentTarget);
        if (Object.keys(statusMap).length === 0) {
            await loadAllStatuses();
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const loadAllStatuses = async () => {
        if (!sites || sites.length === 0) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const statusPromises = sites.map(site =>
                axios.get(
                    `${API_URL}/sites/${site.id}/google-calendar/status/`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                ).then(response => ({ siteId: site.id, status: response.data }))
                .catch(error => {
                    // Log only non-permission errors
                    if (error.response?.status !== 403) {
                        console.error(`Failed to load status for site ${site.id}:`, error);
                    }
                    // Return disconnected status for sites without permission or errors
                    return { siteId: site.id, status: { connected: false, integration: null } };
                })
            );
            
            const results = await Promise.all(statusPromises);
            const newStatusMap = {};
            results.forEach(({ siteId, status }) => {
                newStatusMap[siteId] = status;
            });
            setStatusMap(newStatusMap);
        } catch (error) {
            console.error('Failed to load Google Calendar statuses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (siteId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `${API_URL}/sites/${siteId}/google-calendar/connect/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Store siteId in sessionStorage to know which site to update after OAuth
            sessionStorage.setItem('google_calendar_connecting_site', siteId);
            
            // Redirect to Google OAuth
            window.location.href = response.data.authorization_url;
        } catch (error) {
            console.error('Failed to connect Google Calendar:', error);
            addToast('Nie udało się połączyć z Google Calendar', { variant: 'error' });
        }
    };

    const handleDisconnect = async (siteId) => {
        if (!confirm(`Czy na pewno chcesz odłączyć Google Calendar dla strony "${sites.find(s => s.id === siteId)?.name}"?`)) {
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(
                `${API_URL}/sites/${siteId}/google-calendar/disconnect/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            await loadAllStatuses();
            addToast('Google Calendar został odłączony', { variant: 'success' });
        } catch (error) {
            console.error('Failed to disconnect:', error);
            addToast('Nie udało się odłączyć', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSync = async (siteId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                `${API_URL}/sites/${siteId}/google-calendar/toggle-sync/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            setStatusMap(prev => ({
                ...prev,
                [siteId]: {
                    ...prev[siteId],
                    integration: response.data.integration
                }
            }));
            const message = response.data.integration.sync_enabled 
                ? 'Synchronizacja włączona' 
                : 'Synchronizacja wyłączona';
            addToast(message, { variant: 'success' });
        } catch (error) {
            console.error('Failed to toggle sync:', error);
            addToast('Nie udało się zmienić ustawień synchronizacji', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <Tooltip title="Synchronizacja z Google Calendar">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{
                        p: 0.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: 'rgba(66, 133, 244, 0.08)',
                            transform: 'scale(1.1)'
                        }
                    }}
                >
                    <GoogleCalendarIcon sx={{ width: 24, height: 24 }} />
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1,
                            borderRadius: 2,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            minWidth: 380,
                            maxWidth: 500,
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }
                    }
                }}
            >
                <Box sx={{ p: 2.5 }}>
                    {loading && Object.keys(statusMap).length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <Stack spacing={2.5}>
                                    {/* Header */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                                        <GoogleCalendarIcon sx={{ width: 32, height: 32 }} />
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                                Google Calendar
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {connectedSites.length} z {sites?.length || 0} połączonych
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Sites List */}
                                    {sites && sites.map(site => {
                                        const siteStatus = statusMap[site.id];
                                        const isConnected = siteStatus?.connected;

                                        return (
                                            <Box 
                                                key={site.id}
                                                sx={{ 
                                                    p: 2, 
                                                    borderRadius: 2, 
                                                    border: '1px solid rgba(0,0,0,0.08)',
                                                    backgroundColor: isConnected ? 'rgba(46, 125, 50, 0.04)' : 'rgba(0,0,0,0.02)'
                                                }}
                                            >
                                                <Stack spacing={1.5}>
                                                    {/* Site Header */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {isConnected ? (
                                                                <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                                                            ) : (
                                                                <Cancel sx={{ color: 'text.secondary', fontSize: 20 }} />
                                                            )}
                                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                {site.name}
                                                            </Typography>
                                                        </Box>
                                                        {isConnected && siteStatus.integration?.sync_enabled && (
                                                            <Chip
                                                                label="Aktywna"
                                                                color="success"
                                                                size="small"
                                                            />
                                                        )}
                                                    </Box>

                                                    {!isConnected ? (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleConnect(site.id)}
                                                            sx={{ textTransform: 'none' }}
                                                        >
                                                            Połącz z Google Calendar
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            {/* Connected Info */}
                                                            <Box sx={{ pl: 3.5 }}>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Konto: {siteStatus.integration?.google_email}
                                                                </Typography>
                                                                {siteStatus.integration?.last_sync_at && (
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        Ostatnia sync: {new Date(siteStatus.integration.last_sync_at).toLocaleString('pl-PL')}
                                                                    </Typography>
                                                                )}
                                                            </Box>

                                                            {/* Actions */}
                                                            <Stack direction="row" spacing={1} sx={{ pl: 3.5 }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => handleToggleSync(site.id)}
                                                                    disabled={loading}
                                                                    sx={{ textTransform: 'none', flex: 1 }}
                                                                >
                                                                    {siteStatus.integration?.sync_enabled ? 'Wyłącz sync' : 'Włącz sync'}
                                                                </Button>
                                                                <Button
                                                                    variant="text"
                                                                    color="error"
                                                                    size="small"
                                                                    onClick={() => handleDisconnect(site.id)}
                                                                    disabled={loading}
                                                                    sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
                                                                >
                                                                    Odłącz
                                                                </Button>
                                                            </Stack>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Box>
                                        );
                                    })}

                                    {/* Info Text */}
                                    {connectedSites.length === 0 && (
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            align="center"
                                            sx={{ py: 2 }}
                                        >
                                            Połącz swoje strony z Google Calendar. Wszystkie zmiany w wydarzeniach będą automatycznie synchronizowane.
                                        </Typography>
                                    )}
                                </Stack>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default GoogleCalendarPopup;
