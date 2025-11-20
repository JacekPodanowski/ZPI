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
    Typography,
    IconButton,
    Avatar as MuiAvatar,
    CircularProgress
} from '@mui/material';
import { PhotoCamera, Delete as DeleteIcon } from '@mui/icons-material';
import { uploadMedia } from '../../../services/mediaService';

const EditTeamMemberDialog = ({ open, onClose, onSave, member }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role_description: '',
        bio: '',
        permission_role: 'viewer',
        avatar_url: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        if (member) {
            setFormData({
                first_name: member.first_name || '',
                last_name: member.last_name || '',
                email: member.email || '',
                role_description: member.role_description || '',
                bio: member.bio || '',
                permission_role: member.permission_role || 'viewer',
                avatar_url: member.avatar_url || ''
            });
        }
    }, [member]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, avatar: 'Proszę wybrać plik obrazu' }));
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, avatar: 'Plik jest za duży (max 5MB)' }));
            return;
        }

        setUploadingAvatar(true);
        setErrors(prev => ({ ...prev, avatar: null }));

        try {
            const uploadedMedia = await uploadMedia(file, {
                usage: 'avatar'
            });
            
            handleChange('avatar_url', uploadedMedia.url);
        } catch (error) {
            console.error('Avatar upload failed:', error);
            setErrors(prev => ({ ...prev, avatar: 'Nie udało się przesłać zdjęcia' }));
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = () => {
        handleChange('avatar_url', '');
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.first_name.trim()) {
            newErrors.first_name = 'Imię jest wymagane';
        }
        
        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Nazwisko jest wymagane';
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

    const displayAvatar = formData.avatar_url || null;
    const avatarLetter = formData.first_name ? formData.first_name.charAt(0).toUpperCase() : '?';

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
                    Edytuj członka zespołu
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
                    {/* Avatar Upload Section */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                            <MuiAvatar
                                src={displayAvatar}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    fontSize: '3rem',
                                    bgcolor: member?.avatar_color || 'rgb(146, 0, 32)'
                                }}
                            >
                                {avatarLetter}
                            </MuiAvatar>
                            {uploadingAvatar && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                                        borderRadius: '50%'
                                    }}
                                >
                                    <CircularProgress size={40} sx={{ color: 'white' }} />
                                </Box>
                            )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<PhotoCamera />}
                                disabled={uploadingAvatar || submitting}
                                size="small"
                            >
                                {formData.avatar_url ? 'Zmień zdjęcie' : 'Dodaj zdjęcie'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                            </Button>
                            
                            {formData.avatar_url && (
                                <IconButton
                                    onClick={handleRemoveAvatar}
                                    disabled={uploadingAvatar || submitting}
                                    size="small"
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Box>
                        
                        {errors.avatar && (
                            <Typography variant="caption" color="error">
                                {errors.avatar}
                            </Typography>
                        )}
                        
                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                            Zdjęcie będzie wyświetlane na stronie publicznej
                        </Typography>
                    </Box>

                    <TextField
                        label="Imię"
                        value={formData.first_name}
                        onChange={(e) => handleChange('first_name', e.target.value)}
                        error={Boolean(errors.first_name)}
                        helperText={errors.first_name}
                        required
                        fullWidth
                        disabled={submitting}
                    />

                    <TextField
                        label="Nazwisko"
                        value={formData.last_name}
                        onChange={(e) => handleChange('last_name', e.target.value)}
                        error={Boolean(errors.last_name)}
                        helperText={errors.last_name}
                        required
                        fullWidth
                        disabled={submitting}
                    />

                    <TextField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={Boolean(errors.email)}
                        helperText={errors.email || 'Wymagane do wysłania zaproszenia'}
                        fullWidth
                        disabled={submitting}
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

                    <TextField
                        label="Bio"
                        value={formData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        placeholder="Krótki opis doświadczenia i specjalizacji"
                        helperText="Wyświetlane na stronie publicznej"
                        fullWidth
                        multiline
                        rows={3}
                        disabled={submitting}
                    />

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
                    disabled={submitting || uploadingAvatar}
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
