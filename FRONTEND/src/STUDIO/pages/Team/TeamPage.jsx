import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Chip, Select, MenuItem, IconButton, Tooltip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Add as AddIcon, Email as EmailIcon, Send as SendIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { fetchSiteById, addTeamMember, updateTeamMember, deleteTeamMember, sendTeamInvitation, fetchTeamMembers } from '../../../services/siteService';
import Avatar from '../../../components/Avatar/Avatar';
import AddTeamMemberDialog from '../../components_STUDIO/Team/AddTeamMemberDialog';
import EditTeamMemberDialog from '../../components_STUDIO/Team/EditTeamMemberDialog';
import REAL_DefaultLayout from '../../layouts/REAL_DefaultLayout';

const TeamPage = () => {
    const { siteId } = useParams();
    const [loading, setLoading] = useState(true);
    const [site, setSite] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

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
                
                // Fetch team members from API
                const members = await fetchTeamMembers(siteId);
                setTeamMembers(members);
            } catch (err) {
                console.error('[TeamPage] Failed to load site data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadSiteData();
    }, [siteId]);

    const handleAddMember = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleDialogAdd = async (memberData) => {
        try {
            const newMember = await addTeamMember({
                ...memberData,
                site: siteId
            });
            setTeamMembers(prev => [...prev, newMember]);
            // Refresh site data to get updated team_size
            const updatedSite = await fetchSiteById(siteId);
            setSite(updatedSite);
        } catch (error) {
            console.error('Failed to add team member:', error);
            throw error;
        }
    };

    const handleEditMember = (member) => {
        setEditingMember(member);
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setEditingMember(null);
    };

    const handleEditDialogSave = async (memberId, memberData) => {
        try {
            const updatedMember = await updateTeamMember(memberId, memberData);
            setTeamMembers(prev => prev.map(member =>
                member.id === memberId ? { ...member, ...updatedMember } : member
            ));
        } catch (error) {
            console.error('Failed to update team member:', error);
            throw error;
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        try {
            const updatedMember = await updateTeamMember(memberId, {
                permission_role: newRole
            });
            setTeamMembers(prev => prev.map(member =>
                member.id === memberId ? { ...member, ...updatedMember } : member
            ));
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const handleSendInvitation = async (memberId) => {
        try {
            const result = await sendTeamInvitation(memberId);
            setTeamMembers(prev => prev.map(member =>
                member.id === memberId
                    ? { ...member, invitation_status: result.status, invited_at: new Date().toISOString() }
                    : member
            ));
        } catch (error) {
            console.error('Failed to send invitation:', error);
        }
    };

    const handleDeleteMember = async (memberId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tego członka zespołu?')) {
            return;
        }
        
        try {
            await deleteTeamMember(memberId);
            setTeamMembers(prev => prev.filter(member => member.id !== memberId));
            // Refresh site data to get updated team_size
            const updatedSite = await fetchSiteById(siteId);
            setSite(updatedSite);
        } catch (error) {
            console.error('Failed to delete member:', error);
        }
    };

    if (loading) {
        return (
            <REAL_DefaultLayout
                title="Zespół"
                subtitle="Dodawaj członków zespołu, przypisuj role i wysyłaj zaproszenia"
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress />
                </Box>
            </REAL_DefaultLayout>
        );
    }

    return (
        <REAL_DefaultLayout
            title="Zespół"
            subtitle="Dodawaj członków zespołu, przypisuj role i wysyłaj zaproszenia"
        >

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
                    {teamMembers
                        .filter(member => member.linked_user !== site?.owner?.id)
                        .map((member, index) => (
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
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                opacity: 0.6,
                                                maxHeight: '3.6em',
                                                lineHeight: '1.2em',
                                                overflow: 'hidden',
                                                display: 'block',
                                                position: 'relative',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer',
                                                '&::after': {
                                                    content: '"..."',
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    bgcolor: (theme) => theme.palette.mode === 'light'
                                                        ? 'rgba(255, 255, 255, 0.9)'
                                                        : 'rgba(40, 40, 40, 0.9)',
                                                    pl: 0.5
                                                },
                                                '&:hover': {
                                                    maxHeight: 'none',
                                                    overflow: 'visible',
                                                    bgcolor: (theme) => theme.palette.mode === 'light'
                                                        ? 'rgba(255, 255, 255, 0.98)'
                                                        : 'rgba(50, 50, 50, 0.98)',
                                                    p: 1.5,
                                                    ml: -1.5,
                                                    mr: -1.5,
                                                    borderRadius: 1,
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                                    border: (theme) => theme.palette.mode === 'light'
                                                        ? '1px solid rgba(188, 186, 179, 0.4)'
                                                        : '1px solid rgba(70, 70, 68, 0.6)',
                                                    zIndex: 10,
                                                    '&::after': {
                                                        display: 'none'
                                                    }
                                                }
                                            }}
                                        >
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

                                <Tooltip title="Edytuj">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEditMember(member)}
                                        sx={{
                                            color: (theme) => theme.palette.mode === 'light'
                                                ? 'rgb(146, 0, 32)'
                                                : 'rgb(114, 0, 21)'
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>

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
                        transition={{ 
                            duration: 0.3, 
                            delay: 0.2 + (teamMembers.filter(m => m.linked_user !== site?.owner?.id).length + 1) * 0.05 
                        }}
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

            {/* Add Team Member Dialog */}
            <AddTeamMemberDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                onAdd={handleDialogAdd}
            />

            {/* Edit Team Member Dialog */}
            <EditTeamMemberDialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                onSave={handleEditDialogSave}
                member={editingMember}
            />
        </REAL_DefaultLayout>
    );
};

export default TeamPage;
