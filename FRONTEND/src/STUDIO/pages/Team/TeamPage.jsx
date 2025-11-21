import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, CircularProgress, Chip, Select, MenuItem, IconButton, Tooltip, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Add as AddIcon, Email as EmailIcon, Send as SendIcon, Delete as DeleteIcon, Edit as EditIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { fetchSiteById, addTeamMember, updateTeamMember, deleteTeamMember, sendTeamInvitation, fetchTeamMembers, fetchAttendanceReport } from '../../../services/siteService';
import { useAuth } from '../../../contexts/AuthContext';
import Avatar from '../../../components/Avatar/Avatar';
import AddTeamMemberDialog from '../../components_STUDIO/Team/AddTeamMemberDialog';
import EditTeamMemberDialog from '../../components_STUDIO/Team/EditTeamMemberDialog';
import AttendanceReportDialog from '../../components_STUDIO/Team/AttendanceReportDialog';
import REAL_DefaultLayout from '../../layouts/REAL_DefaultLayout';

const REPORT_PREVIEW_LIMIT = 25;

const TeamPage = () => {
    const { siteId } = useParams();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [site, setSite] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [reportDialog, setReportDialog] = useState({
        open: false,
        loading: false,
        rows: [],
        total: 0,
        limit: REPORT_PREVIEW_LIMIT,
        hostType: null,
        hostId: null,
        hostLabel: '',
        error: null,
        downloading: null,
    });

    // Calculate current user's role and permissions
    const userPermissions = useMemo(() => {
        if (!site || !currentUser) return { role: null, canEditOwner: false, canEditOthers: false, canChangeRoles: false, canDelete: false, canAdd: false };
        
        const isOwner = site.owner?.id === currentUser.id;
        if (isOwner) {
            return {
                role: 'owner',
                canEditOwner: true,
                canEditOthers: true,
                canChangeRoles: true,
                canDelete: true,
                canAdd: true
            };
        }

        // Find user's membership in this site
        const membership = teamMembers.find(m => m.linked_user === currentUser.id);
        const role = membership?.permission_role || null;

        if (role === 'manager') {
            return {
                role: 'manager',
                canEditOwner: false,
                canEditOthers: true,
                canChangeRoles: true,
                canDelete: true,
                canAdd: true
            };
        }

        if (role === 'contributor' || role === 'viewer') {
            return {
                role,
                canEditOwner: false,
                canEditOthers: false,
                canChangeRoles: false,
                canDelete: false,
                canAdd: false
            };
        }

        return { role: null, canEditOwner: false, canEditOthers: false, canChangeRoles: false, canDelete: false, canAdd: false };
    }, [site, currentUser, teamMembers]);

    const canViewOwnerReport = useMemo(() => {
        if (!site || !currentUser) return false;
        if (currentUser.is_staff) return true;
        if (site.owner?.id === currentUser.id) return true;
        return userPermissions.role === 'manager';
    }, [site, currentUser, userPermissions]);

    const canViewMemberReport = (member) => {
        if (!currentUser) return false;
        if (currentUser.is_staff) return true;
        if (site?.owner?.id === currentUser.id) return true;
        if (userPermissions.role === 'manager') return true;
        return member.linked_user === currentUser.id;
    };

    const getDisplayName = (entity) => {
        if (!entity) return '';
        const fullName = `${entity.first_name || ''} ${entity.last_name || ''}`.trim();
        return fullName || entity.email || '';
    };

    const formatDateForExport = (value) => {
        if (!value) return '-';
        try {
            return new Intl.DateTimeFormat('pl-PL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(value));
        } catch (error) {
            return value;
        }
    };

    const sanitizeFileName = (label, extension) => {
        const base = (label || 'raport').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'raport';
        const stamp = new Date().toISOString().slice(0, 10);
        return `${base}-${stamp}.${extension}`;
    };

    const exportRowsToCsv = (rows, hostLabel) => {
        const headers = ['Zajęcie', 'Czas trwania (min)', 'Data rozpoczęcia'];
        const csvLines = [headers.join(';')];

        rows.forEach((row) => {
            const values = [
                (row.title || '').replace(/"/g, '""'),
                row.duration_minutes,
                formatDateForExport(row.start_time)
            ];
            csvLines.push(values.map((value) => `"${value}"`).join(';'));
        });

        const blob = new Blob([`\ufeff${csvLines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = sanitizeFileName(hostLabel, 'csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const exportRowsToXlsx = (rows, hostLabel) => {
        const worksheetData = rows.map((row) => ({
            'Zajęcie': row.title,
            'Czas trwania (min)': row.duration_minutes,
            'Data rozpoczęcia': formatDateForExport(row.start_time)
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Raport');
        XLSX.writeFile(workbook, sanitizeFileName(hostLabel, 'xlsx'));
    };

    const openReportDialog = async (hostType, hostId, hostLabel) => {
        setReportDialog((prev) => ({
            ...prev,
            open: true,
            loading: true,
            rows: [],
            total: 0,
            limit: REPORT_PREVIEW_LIMIT,
            hostType,
            hostId,
            hostLabel,
            error: null,
        }));

        try {
            const data = await fetchAttendanceReport(siteId, {
                hostType,
                hostId,
                limit: REPORT_PREVIEW_LIMIT,
            });
            setReportDialog((prev) => ({
                ...prev,
                loading: false,
                rows: data.rows || [],
                total: data.total || 0,
                limit: data.limit,
            }));
        } catch (error) {
            console.error('Failed to load attendance report', error);
            setReportDialog((prev) => ({
                ...prev,
                loading: false,
                error: 'Nie udało się pobrać raportu. Spróbuj ponownie.',
            }));
        }
    };

    const handleReportDialogClose = () => {
        setReportDialog((prev) => ({ ...prev, open: false }));
    };

    const handleReportDownload = async (format) => {
        if (!reportDialog.hostType || !reportDialog.hostId) return;
        setReportDialog((prev) => ({ ...prev, downloading: format }));
        try {
            const data = await fetchAttendanceReport(siteId, {
                hostType: reportDialog.hostType,
                hostId: reportDialog.hostId,
                limit: 'all',
            });
            if (format === 'csv') {
                exportRowsToCsv(data.rows || [], reportDialog.hostLabel);
            } else {
                exportRowsToXlsx(data.rows || [], reportDialog.hostLabel);
            }
        } catch (error) {
            console.error('Failed to download report', error);
            alert('Nie udało się pobrać raportu. Spróbuj ponownie.');
        } finally {
            setReportDialog((prev) => ({ ...prev, downloading: null }));
        }
    };

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
            // Check if editing owner
            if (editingMember?.is_owner) {
                // Update owner via user profile endpoint
                const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://192.168.0.104:8000'}/api/v1/users/me/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({
                        first_name: memberData.name ? memberData.name.split(' ')[0] : memberData.first_name,
                        last_name: memberData.name ? memberData.name.split(' ').slice(1).join(' ') : memberData.last_name,
                        avatar_url: memberData.avatar_url,
                        role_description: memberData.role_description
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to update owner profile');
                }
                
                const updatedOwner = await response.json();
                
                // Update local site state with new owner data
                setSite(prev => ({
                    ...prev,
                    owner: {
                        ...prev.owner,
                        ...updatedOwner
                    }
                }));
                
                // Update user context so avatar is consistent everywhere
                updateUser(updatedOwner);
            } else {
                // Update regular team member
                const updatedMember = await updateTeamMember(memberId, memberData);
                setTeamMembers(prev => prev.map(member =>
                    member.id === memberId ? { ...member, ...updatedMember } : member
                ));
                // Refresh site data to get updated team_member_info if user is editing themselves
                const updatedSite = await fetchSiteById(siteId);
                setSite(updatedSite);
            }
        } catch (error) {
            console.error('Failed to update member:', error);
            throw error;
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        // Check if user can change roles
        if (!userPermissions.canChangeRoles) {
            alert('Nie masz uprawnień do zmiany ról.');
            return;
        }

        try {
            const updatedMember = await updateTeamMember(memberId, {
                permission_role: newRole
            });
            setTeamMembers(prev => prev.map(member =>
                member.id === memberId ? { ...member, ...updatedMember } : member
            ));
            // Refresh site data to get updated team_member_info
            const updatedSite = await fetchSiteById(siteId);
            setSite(updatedSite);
        } catch (error) {
            console.error('Failed to update role:', error);
            alert(error.response?.data?.detail || 'Nie udało się zmienić roli.');
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
        // Check if user can delete
        if (!userPermissions.canDelete) {
            alert('Nie masz uprawnień do usuwania członków zespołu.');
            return;
        }

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
            alert(error.response?.data?.detail || 'Nie udało się usunąć członka zespołu.');
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
                                    avatarUrl={site.owner.id === currentUser?.id ? currentUser.avatar_url : site.owner.avatar_url}
                                    user={site.owner.id === currentUser?.id ? currentUser : site.owner}
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
                                    {site.owner.role_description && (
                                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5, fontStyle: 'italic' }}>
                                            {site.owner.role_description}
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    {canViewOwnerReport && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<FileDownloadIcon />}
                                            onClick={() => openReportDialog('owner', site.owner.id, getDisplayName(site.owner))}
                                        >
                                            Pobierz raport
                                        </Button>
                                    )}

                                    {userPermissions.canEditOwner && (
                                        <Tooltip title="Edytuj profil właściciela">
                                            <IconButton
                                                onClick={() => handleEditMember({ 
                                                    ...site.owner, 
                                                    id: `owner-${site.owner.id}`,
                                                    is_owner: true 
                                                })}
                                                sx={{ color: 'rgb(146, 0, 32)' }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}

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
                                        {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim()}
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

                                {canViewMemberReport(member) && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<FileDownloadIcon />}
                                        onClick={() => openReportDialog('team_member', member.id, getDisplayName(member))}
                                    >
                                        Pobierz raport
                                    </Button>
                                )}

                                {userPermissions.canChangeRoles ? (
                                    <Select
                                        value={member.permission_role || ''}
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
                                ) : (
                                    <Chip
                                        label={member.permission_role}
                                        size="small"
                                        sx={{ 
                                            minWidth: 100,
                                            bgcolor: member.permission_role === 'manager' 
                                                ? 'rgba(146, 0, 32, 0.1)' 
                                                : 'rgba(188, 186, 179, 0.2)',
                                            color: member.permission_role === 'manager'
                                                ? 'rgb(146, 0, 32)'
                                                : 'text.primary'
                                        }}
                                    />
                                )}

                                {member.invitation_status !== 'mock' && (
                                    <Chip
                                        label={member.invitation_status}
                                        size="small"
                                        sx={{ 
                                            minWidth: 80,
                                            bgcolor: member.invitation_status === 'linked' 
                                                ? 'rgba(76, 175, 80, 0.2)' 
                                                : member.invitation_status === 'pending'
                                                ? 'rgba(255, 193, 7, 0.2)'
                                                : 'rgba(33, 150, 243, 0.2)',
                                            color: member.invitation_status === 'linked'
                                                ? 'rgb(46, 125, 50)'
                                                : member.invitation_status === 'pending'
                                                ? 'rgb(245, 124, 0)'
                                                : 'rgb(13, 71, 161)'
                                        }}
                                    />
                                )}

                                {(userPermissions.canEditOthers || member.linked_user === currentUser?.id) && (
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
                                )}

                                {userPermissions.canEditOthers && member.invitation_status === 'mock' && member.email && (
                                    <Tooltip title="Wyślij zaproszenie">
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<SendIcon />}
                                            onClick={() => handleSendInvitation(member.id)}
                                            sx={{ 
                                                bgcolor: 'rgb(146, 0, 32)',
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: 'rgb(114, 0, 21)'
                                                }
                                            }}
                                        >
                                            Zaproś
                                        </Button>
                                    </Tooltip>
                                )}

                                {userPermissions.canEditOthers && ['invited', 'pending'].includes(member.invitation_status) && member.email && (
                                    <Tooltip title="Wyślij ponownie zaproszenie">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleSendInvitation(member.id)}
                                            sx={{ color: 'rgb(146, 0, 32)' }}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {userPermissions.canDelete && (
                                    <Tooltip title="Usuń członka">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteMember(member.id)}
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </motion.div>
                    ))}

                    {/* Add New Member Button - Only for Owner and Manager */}
                    {userPermissions.canAdd && (
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
                    )}
                </Box>

            {/* Add Team Member Dialog */}
            <AddTeamMemberDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                onAdd={handleDialogAdd}
                siteId={siteId}
            />

            {/* Edit Team Member Dialog */}
            <EditTeamMemberDialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                onSave={handleEditDialogSave}
                member={editingMember}
                siteId={siteId}
            />

            <AttendanceReportDialog
                open={reportDialog.open}
                onClose={handleReportDialogClose}
                loading={reportDialog.loading}
                rows={reportDialog.rows}
                total={reportDialog.total}
                limit={reportDialog.limit}
                hostLabel={reportDialog.hostLabel}
                error={reportDialog.error}
                onDownload={handleReportDownload}
                downloadingFormat={reportDialog.downloading}
            />
        </REAL_DefaultLayout>
    );
};

export default TeamPage;
