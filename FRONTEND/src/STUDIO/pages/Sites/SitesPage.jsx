import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchSites } from '../../../services/siteService';
import SiteTile from '../../components/Sites/SiteTile';

const SitesPage = () => {
    const navigate = useNavigate();
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;

        const loadSites = async () => {
            try {
                setLoading(true);
                const response = await fetchSites();
                if (active) {
                    setSites(response);
                }
            } catch (err) {
                if (active) {
                    setError(err.message || 'Failed to load sites');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadSites();

        return () => {
            active = false;
        };
    }, []);

    const handleCreateSite = () => {
        navigate('/studio/new');
    };

    const handleSiteDeleted = (siteId) => {
        setSites(prevSites => prevSites.filter(site => site.id !== siteId));
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 60px)',
                background: (theme) => theme.palette.mode === 'light'
                    ? 'linear-gradient(180deg, rgba(228, 229, 218, 0.4) 0%, rgba(228, 229, 218, 1) 100%)'
                    : 'linear-gradient(180deg, rgba(12, 12, 12, 0.4) 0%, rgba(12, 12, 12, 1) 100%)',
                py: { xs: 1.5, md: 2 },
                px: { xs: 2, md: 4, lg: 6 }
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    maxWidth: 1400,
                    mx: 'auto',
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 3
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '-0.02em',
                            background: (theme) => theme.palette.mode === 'light'
                                ? 'linear-gradient(135deg, rgb(146, 0, 32) 0%, rgb(30, 30, 30) 100%)'
                                : 'linear-gradient(135deg, rgb(114, 0, 21) 0%, rgb(220, 220, 220) 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5
                        }}
                    >
                        Your Sites
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            maxWidth: 600
                        }}
                    >
                        Manage and monitor all your personal sites
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateSite}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 20px rgba(146, 0, 32, 0.25)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                                boxShadow: '0 6px 30px rgba(146, 0, 32, 0.35)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Create New Site
                    </Button>
                </motion.div>
            </Box>

            {/* Sites Grid */}
            <Box
                sx={{
                    maxWidth: 1400,
                    mx: 'auto'
                }}
            >
                {sites.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 12,
                                px: 4
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 2,
                                    color: 'text.secondary',
                                    fontWeight: 500
                                }}
                            >
                                No sites yet
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 4,
                                    color: 'text.disabled'
                                }}
                            >
                                Create your first site to get started
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleCreateSite}
                                sx={{
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                        borderColor: 'primary.dark',
                                        bgcolor: 'rgba(146, 0, 32, 0.05)'
                                    }
                                }}
                            >
                                Create Your First Site
                            </Button>
                        </Box>
                    </motion.div>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                lg: sites.length > 3 ? 'repeat(auto-fit, minmax(300px, 1fr))' : 'repeat(3, 1fr)'
                            },
                            gap: sites.length > 3 ? 2 : 3,
                            maxWidth: sites.length > 3 ? '100%' : 1400,
                            mx: 'auto',
                            '& > *': {
                                minWidth: 0
                            }
                        }}
                    >
                        <AnimatePresence mode="popLayout">
                            {sites.map((site, index) => (
                                <SiteTile
                                    key={site.id}
                                    site={site}
                                    index={index}
                                    onSiteDeleted={handleSiteDeleted}
                                />
                            ))}
                        </AnimatePresence>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default SitesPage;
