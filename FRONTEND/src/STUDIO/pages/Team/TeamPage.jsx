import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Chip, Select, MenuItem, IconButton, Tooltip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Add as AddIcon, Email as EmailIcon, Send as SendIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { fetchSiteById } from '../../../services/siteService';
import Avatar from '../../../components/Avatar/Avatar';

const TeamPage = () => {
    const { siteId } = useParams();
    const [loading, setLoading] = useState(true);
    const [site, setSite] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);

    useEffect(() => {
        const loadSiteData = async () => {
            try {
                setLoading(true);
                const siteData = await fetchSiteById(siteId);
                if (process.env.NODE_ENV !== 'production') {
                    console.log('[TeamPage] Loaded site data:', siteData);
                    console.log('[TeamPage] Owner payload:', siteData?.owner);
                }
                setSite(siteData);
                
                // TODO: Fetch actual team members from API
                setTeamMembers(siteData?.team_members || []);
            } catch (err) {
                console.error('[TeamPage] Failed to load site data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadSiteData();
    }, [siteId]);

    const handleAddMember = () => {
        // TODO: Open modal to add new member
        console.log('Add member clicked');
    };

    const handleRoleChange = (memberId, newRole) => {
        // TODO: Update member role via API
        console.log('Role changed:', memberId, newRole);
    };

    const handleSendInvitation = (memberId) => {
        // TODO: Send invitation via API
        console.log('Send invitation:', memberId);
    };

    const handleDeleteMember = (memberId) => {
        // TODO: Delete member via API
        console.log('Delete member:', memberId);
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

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 60px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}
        >
            {/* Header with gradient title */}
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
                    Zespół
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: 'text.secondary'
                    }}
                >
                    Dodawaj członków zespołu, przypisuj role i wysyłaj zaproszenia.
                </Typography>
                </motion.div>

            {/* Team Members List */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    background: (theme) => theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.8)'
                        : 'rgba(35, 35, 35, 0.9)',
                    borderRadius: 3,
                    p: { xs: 2, md: 3 },
                    border: (theme) => theme.palette.mode === 'light'
                        ? '1px solid rgba(188, 186, 179, 0.3)'
                        : '1px solid rgba(70, 70, 68, 0.3)',
                    boxShadow: '0 6px 30px rgba(0, 0, 0, 0.08)'
                }}
            >
                    {/* Owner */}
                    {site?.owner && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    background: (theme) => theme.palette.mode === 'light'
                                        ? 'rgba(255, 255, 255, 0.9)'
                                        : 'rgba(40, 40, 40, 0.9)',
                                    border: (theme) => theme.palette.mode === 'light'
                                        ? '1px solid rgba(146, 0, 32, 0.15)'
                                        : '1px solid rgba(146, 0, 32, 0.3)',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Avatar
                                    avatarUrl={site.owner.avatar_url}
                                    user={site.owner}
                                    size={56}
                                />

                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {site.owner.first_name && site.owner.last_name
                                            ? `${site.owner.first_name} ${site.owner.last_name}`
                                            : site.owner.email}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: '0.875rem', opacity: 0.6 }} />
                                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                            {site.owner.email}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Chip
                                    label="Owner"
                                    sx={{
                                        bgcolor: 'rgba(146, 0, 32, 0.15)',
                                        color: 'rgb(146, 0, 32)',
                                        fontWeight: 600,
                                        border: '1px solid rgba(146, 0, 32, 0.3)'
                                    }}
                                />
                            </Box>
                        </motion.div>
                    )}

                    {/* Team Members */}
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 + (index + 1) * 0.05 }}
                        >
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    background: (theme) => theme.palette.mode === 'light'
                                        ? 'rgba(255, 255, 255, 0.9)'
                                        : 'rgba(40, 40, 40, 0.9)',
                                    border: (theme) => theme.palette.mode === 'light'
                                        ? '1px solid rgba(188, 186, 179, 0.3)'
                                        : '1px solid rgba(70, 70, 68, 0.5)',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Avatar
                                    avatarUrl={member.avatar_url}
                                    user={member}
                                    size={56}
                                />

                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {member.first_name} {member.last_name}
                                    </Typography>
                                    {member.email && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <EmailIcon sx={{ fontSize: '0.875rem', opacity: 0.6 }} />
                                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                                {member.email}
                                            </Typography>
                                        </Box>
                                    )}
                                    {member.role_description && (
                                        <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                            {member.role_description}
                                        </Typography>
                                    )}
                                </Box>

                                <Select
                                    value={member.permission_role}
                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                    size="small"
                                    sx={{ minWidth: 140 }}
                                >
                                    <MenuItem value="viewer">
                                        <Tooltip title="Widzi tylko swoje wydarzenia">
                                            <span>Viewer</span>
                                        </Tooltip>
                                    </MenuItem>
                                    <MenuItem value="contributor">
                                        <Tooltip title="Zarządza swoim kalendarzem">
                                            <span>Contributor</span>
                                        </Tooltip>
                                    </MenuItem>
                                    <MenuItem value="manager">
                                        <Tooltip title="Pełna kontrola nad kalendarzem">
                                            <span>Manager</span>
                                        </Tooltip>
                                    </MenuItem>
                                </Select>

                                <Chip
                                    label={member.invitation_status}
                                    size="small"
                                    sx={{ minWidth: 80 }}
                                />

                                {member.invitation_status === 'mock' && member.email && (
                                    <Tooltip title="Wyślij zaproszenie">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleSendInvitation(member.id)}
                                            sx={{ color: 'rgb(146, 0, 32)' }}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                <Tooltip title="Usuń członka">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteMember(member.id)}
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </motion.div>
                    ))}

                    {/* Add New Member Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + (teamMembers.length + 1) * 0.05 }}
                    >
                        <Box
                            onClick={handleAddMember}
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                background: (theme) => theme.palette.mode === 'light'
                                    ? 'rgba(255, 255, 255, 0.7)'
                                    : 'rgba(40, 40, 40, 0.7)',
                                border: (theme) => theme.palette.mode === 'light'
                                    ? '2px dashed rgba(188, 186, 179, 0.5)'
                                    : '2px dashed rgba(70, 70, 68, 0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    background: (theme) => theme.palette.mode === 'light'
                                        ? 'rgba(255, 255, 255, 1)'
                                        : 'rgba(40, 40, 40, 1)',
                                    borderColor: 'rgb(146, 0, 32)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(146, 0, 32, 0.15)'
                                }
                            }}
                        >
                            <Avatar
                                avatarUrl={null}
                                user={null}
                                size={56}
                                sx={{
                                    bgcolor: (theme) => theme.palette.mode === 'light'
                                        ? 'rgba(188, 186, 179, 0.3)'
                                        : 'rgba(70, 70, 68, 0.5)'
                                }}
                            >
                                <AddIcon />
                            </Avatar>

                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: (theme) => theme.palette.mode === 'light'
                                        ? 'rgb(70, 70, 68)'
                                        : 'rgb(188, 186, 179)'
                                }}
                            >
                                + Dodaj członka zespołu
                            </Typography>
                        </Box>
                    </motion.div>
                </Box>
        </Box>
    );
};

export default TeamPage;
