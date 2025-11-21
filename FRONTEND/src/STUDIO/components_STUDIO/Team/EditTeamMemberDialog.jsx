import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography
} from '@mui/material';
import Avatar from '../../../components/Avatar/Avatar';
import AvatarUploader from '../../../components/Navigation/AvatarUploader';
import { useAuth } from '../../../contexts/AuthContext';

const EditTeamMemberDialog = ({ open, onClose, onSave, member, siteId }) => {
    const { user: currentUser, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role_description: '',
        permission_role: 'viewer',
        avatar_url: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (member) {
            // Handle both old format (first_name + last_name) and new format (name)
            const displayName = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim();
            
            // If editing owner, use currentUser's avatar
            const avatarUrl = member.is_owner && currentUser ? currentUser.avatar_url : member.avatar_url;
            
            setFormData({
                name: displayName,
                email: member.email || '',
                role_description: member.role_description || '',
                permission_role: member.permission_role || 'viewer',
                avatar_url: avatarUrl || ''
            });
        }
    }, [member, currentUser]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleAvatarChange = (newAvatarUrl) => {
        handleChange('avatar_url', newAvatarUrl);
        
        // If editing owner, also update the user context
        if (member?.is_owner && currentUser) {
            updateUser({ avatar_url: newAvatarUrl });
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Nazwa jest wymagana';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Nieprawidłowy format email';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setSubmitting(true);
        try {
            await onSave(member.id, formData);
            onClose();
        } catch (error) {
            console.error('Failed to update team member:', error);
            setErrors({ submit: 'Nie udało się zaktualizować członka zespołu' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setErrors({});
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: (theme) => theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.95)'
                        : 'rgba(35, 35, 35, 0.95)',
                    backdropFilter: 'blur(10px)'
                }
            }}
        >
            <DialogTitle>
                <Box
                    sx={{
                        fontWeight: 600,
                        fontSize: '1.5rem',
                        background: (theme) => theme.palette.mode === 'light'
                            ? 'linear-gradient(135deg, rgb(146, 0, 32) 0%, rgb(30, 30, 30) 100%)'
                            : 'linear-gradient(135deg, rgb(114, 0, 21) 0%, rgb(220, 220, 220) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    {member?.is_owner ? 'Edytuj profil właściciela' : 'Edytuj członka zespołu'}
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2, alignItems: 'center' }}>

                    {/* Avatar at the top center */}
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                            avatarUrl={formData.avatar_url}
                            user={member}
                            size={120}
                            sx={{
                                border: (theme) => `3px solid ${
                                    theme.palette.mode === 'light' 
                                        ? 'rgba(146, 0, 32, 0.2)' 
                                        : 'rgba(114, 0, 21, 0.3)'
                                }`
                            }}
                        />
                        {/* Show uploader only if not linked to a user (or is owner) */}
                        {(!member?.linked_user || member?.is_owner) && (
                            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                <AvatarUploader
                                    currentAvatar={formData.avatar_url}
                                    onAvatarChange={handleAvatarChange}
                                    size={120}
                                    uploadEndpoint={member?.is_owner ? null : `/team-members/${member?.id}/`}
                                />
                            </Box>
                        )}
                    </Box>

                    <Typography variant="caption" sx={{ 
                        color: 'text.secondary', 
                        textAlign: 'center',
                        mt: -1.5 
                    }}>
                        {member?.linked_user && !member?.is_owner
                            ? 'Połączony użytkownik zarządza swoim awatarem'
                            : 'Kliknij na awatar, aby zmienić zdjęcie'}
                    </Typography>

                    {/* Name field - full width */}
                    <TextField
                        label="Imię i nazwisko"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                        required
                        fullWidth
                        disabled={submitting}
                        sx={{ mt: 1 }}
                    />

                    <TextField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={Boolean(errors.email)}
                        helperText={errors.email || (member?.is_owner ? 'Email systemowy (niezmienny)' : 'Wymagane do wysłania zaproszenia')}
                        fullWidth
                        disabled={submitting || member?.is_owner}
                    />

                    <TextField
                        label="Rola/Specjalizacja"
                        value={formData.role_description}
                        onChange={(e) => handleChange('role_description', e.target.value)}
                        placeholder="np. Instruktor jogi, Terapeuta"
                        helperText="Wyświetlane na stronie publicznej"
                        fullWidth
                        disabled={submitting}
                    />

                    {!member?.is_owner && (
                        <FormControl fullWidth disabled={submitting}>
                            <InputLabel>Uprawnienia</InputLabel>
                            <Select
                                value={formData.permission_role}
                                onChange={(e) => handleChange('permission_role', e.target.value)}
                                label="Uprawnienia"
                            >
                                <MenuItem value="viewer">
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Viewer
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                            Widzi tylko swoje wydarzenia
                                        </Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="contributor">
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Contributor
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                            Zarządza swoim kalendarzem
                                        </Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="manager">
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Manager
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                            Pełna kontrola nad kalendarzem
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {errors.submit && (
                        <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
                            {errors.submit}
                        </Typography>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button
                    onClick={handleClose}
                    disabled={submitting}
                    sx={{ color: 'text.secondary' }}
                >
                    Anuluj
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting}
                    sx={{
                        bgcolor: 'rgb(146, 0, 32)',
                        '&:hover': {
                            bgcolor: 'rgb(114, 0, 21)'
                        }
                    }}
                >
                    {submitting ? 'Zapisywanie...' : 'Zapisz'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditTeamMemberDialog;
