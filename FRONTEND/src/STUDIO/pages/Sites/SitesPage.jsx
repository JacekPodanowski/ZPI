import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon, People as PeopleIcon } from '@mui/icons-material';
import { fetchSites, fetchPendingInvitations } from '../../../services/siteService';
import SiteTile from '../../components_STUDIO/Sites/SiteTile';
import TeamMemberSiteTile from '../../components_STUDIO/Sites/TeamMemberSiteTile';

const SitesPage = () => {
    const navigate = useNavigate();
    const [ownedSites, setOwnedSites] = useState([]);
    const [teamMemberSites, setTeamMemberSites] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTeamSites, setShowTeamSites] = useState(true);

    useEffect(() => {
        let active = true;

        const loadSites = async () => {
            try {
                setLoading(true);
                const [sitesResponse, pendingResponse] = await Promise.all([
                    fetchSites(),
                    fetchPendingInvitations()
                ]);
                
                if (active) {
                    // Backend returns { owned_sites: [...], team_member_sites: [...] }
                    setOwnedSites(sitesResponse.owned_sites || sitesResponse);
                    setTeamMemberSites(sitesResponse.team_member_sites || []);
                    setPendingInvitations(pendingResponse || []);
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

    const handleInvitationUpdate = async () => {
        try {
            const [sitesResponse, pendingResponse] = await Promise.all([
                fetchSites(),
                fetchPendingInvitations()
            ]);
            setOwnedSites(sitesResponse.owned_sites || sitesResponse);
            setTeamMemberSites(sitesResponse.team_member_sites || []);
            setPendingInvitations(pendingResponse || []);
        } catch (err) {
            console.error('Failed to refresh sites:', err);
        }
    };

    const handleToggleTeamSites = () => {
        setShowTeamSites(prev => !prev);
    };

    const handleCreateSite = () => {
        navigate('/studio/new');
    };

    const handleSiteDeleted = (siteId) => {
        setOwnedSites(prevSites => prevSites.filter(site => site.id !== siteId));
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

    // Calculate total visible sites and number of rows
    const visibleTeamCount = showTeamSites ? (teamMemberSites.length + pendingInvitations.length) : 0;
    const totalSites = ownedSites.length + visibleTeamCount;
    const numberOfRows = Math.ceil(totalSites / 3);
    const gradientEnd = Math.min(30 + (numberOfRows * 20), 100); // Start at 30%, add 20% per row, max 100%

    return (
        <Box
            sx={{
                    minHeight: 'calc(100vh - 60px)',
                    background: (theme) => theme.palette.mode === 'light'
                        ? `linear-gradient(180deg, rgba(228, 229, 218, 0.4) 0%, rgba(228, 229, 218, 1) ${gradientEnd}%)`
                        : `linear-gradient(180deg, rgba(12, 12, 12, 0.4) 0%, rgba(12, 12, 12, 1) ${gradientEnd}%)`,
                    backgroundColor: (theme) => theme.palette.mode === 'light' 
                        ? 'rgb(228, 229, 218)' 
                        : 'rgb(12, 12, 12)',
                    py: { xs: 1.5, md: 2 },
                    px: { xs: 2, md: 4, lg: 6 },
                    pb: 6
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
                        Twoje strony
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            maxWidth: 600
                        }}
                    >
                        Monitoruj i zarządzaj swoimi stronami
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ display: 'flex', gap: '12px' }}
                >
                    {teamMemberSites.length > 0 && (
                        <Button
                            variant="contained"
                            onClick={handleToggleTeamSites}
                            sx={{
                                bgcolor: showTeamSites ? 'primary.main' : 'grey.400',
                                color: 'white',
                                minWidth: 'auto',
                                px: 2,
                                py: 1.5,
                                borderRadius: 2,
                                boxShadow: showTeamSites 
                                    ? '0 4px 20px rgba(146, 0, 32, 0.25)' 
                                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    bgcolor: showTeamSites ? 'primary.dark' : 'grey.500',
                                    boxShadow: showTeamSites 
                                        ? '0 6px 30px rgba(146, 0, 32, 0.35)' 
                                        : '0 6px 30px rgba(0, 0, 0, 0.15)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <PeopleIcon />
                        </Button>
                    )}
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
                        Utwórz nową stronę
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
                {(ownedSites.length === 0 && teamMemberSites.length === 0 && pendingInvitations.length === 0) ? (
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
                                Jeszcze nie masz żadnych stron
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 4,
                                    color: 'text.disabled'
                                }}
                            >
                                Utwórz swoją pierwszą stronę, aby zacząć
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
                                Utwórz swoją pierwszą stronę
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
                                lg: 'repeat(3, 1fr)'
                            },
                            gap: 3,
                            maxWidth: 1400,
                            mx: 'auto',
                            '& > *': {
                                minWidth: 0
                            }
                        }}
                    >
                        <AnimatePresence mode="popLayout">
                            {/* Owned Sites */}
                            {ownedSites.map((site, index) => (
                                <SiteTile
                                    key={site.id}
                                    site={site}
                                    index={index}
                                    onSiteDeleted={handleSiteDeleted}
                                />
                            ))}
                            
                            {/* Pending Invitations - shown as special tiles */}
                            {showTeamSites && pendingInvitations.map((inviteSite, index) => (
                                <TeamMemberSiteTile
                                    key={`pending-${inviteSite.id}`}
                                    site={inviteSite}
                                    teamMemberInfo={{
                                        id: inviteSite.team_member_id,
                                        invitation_status: 'pending',
                                        permission_role: inviteSite.permission_role
                                    }}
                                    index={ownedSites.length + index}
                                    onInvitationUpdate={handleInvitationUpdate}
                                />
                            ))}
                            
                            {/* Team Member Sites (linked) */}
                            {showTeamSites && teamMemberSites.map((teamSite, index) => {
                                // Manager gets full SiteTile with analytics
                                if (teamSite.team_member_info?.permission_role === 'manager') {
                                    return (
                                        <SiteTile
                                            key={teamSite.id}
                                            site={teamSite}
                                            index={ownedSites.length + pendingInvitations.length + index}
                                            onSiteDeleted={handleSiteDeleted}
                                        />
                                    );
                                }
                                // Contributor and Viewer get simplified TeamMemberSiteTile
                                return (
                                    <TeamMemberSiteTile
                                        key={teamSite.id}
                                        site={teamSite}
                                        teamMemberInfo={teamSite.team_member_info}
                                        index={ownedSites.length + pendingInvitations.length + index}
                                        onInvitationUpdate={handleInvitationUpdate}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default SitesPage;
