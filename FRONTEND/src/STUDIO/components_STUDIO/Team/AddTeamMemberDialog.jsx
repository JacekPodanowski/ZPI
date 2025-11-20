import React, { useState } from 'react';
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
    CircularProgress
} from '@mui/material';
import { PhotoCamera, Delete as DeleteIcon } from '@mui/icons-material';
import { uploadMedia } from '../../../services/mediaService';

const AddTeamMemberDialog = ({ open, onClose, onAdd, siteId }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role_description: '',
        bio: '',
        permission_role: 'viewer',
        public_image_url: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, image: 'Proszę wybrać plik obrazu' }));
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: 'Plik jest za duży (max 5MB)' }));
            return;
        }

        setUploadingImage(true);
        setErrors(prev => ({ ...prev, image: null }));

        try {
            const uploadedMedia = await uploadMedia(file, {
                usage: 'site_content',
                siteId: siteId
            });
            
            handleChange('public_image_url', uploadedMedia.url);
        } catch (error) {
            console.error('Image upload failed:', error);
            setErrors(prev => ({ ...prev, image: 'Nie udało się przesłać zdjęcia' }));
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveAvatar = () => {
        handleChange('public_image_url', '');
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
            await onAdd(formData);
            // Reset form
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                role_description: '',
                bio: '',
                permission_role: 'viewer',
                avatar_url: ''
            });
            setErrors({});
            onClose();
        } catch (error) {
            console.error('Failed to add team member:', error);
            setErrors({ submit: 'Nie udało się dodać członka zespołu' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                role_description: '',
                bio: '',
                permission_role: 'viewer',
                public_image_url: ''
            });
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
                    Dodaj członka zespołu
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>

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
                        helperText={errors.email || 'Opcjonalne - wymagane do wysłania zaproszenia'}
                        fullWidth
                        disabled={submitting}
                    />

                    <TextField
                        label="Rola/Specjalizacja"
                        value={formData.role_description}
                        onChange={(e) => handleChange('role_description', e.target.value)}
                        placeholder="np. Instruktor jogi, Terapeuta"
                        helperText="Opcjonalne - wyświetlane na stronie publicznej"
                        fullWidth
                        disabled={submitting}
                    />

                    <TextField
                        label="Bio"
                        value={formData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        placeholder="Krótki opis doświadczenia i specjalizacji"
                        helperText="Opcjonalne - wyświetlane na stronie publicznej"
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

                    {/* Public Image Upload Section */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        bgcolor: (theme) => theme.palette.mode === 'light' 
                            ? 'rgba(228, 229, 218, 0.3)' 
                            : 'rgba(30, 30, 30, 0.3)'
                    }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Zdjęcie publiczne
                        </Typography>
                        
                        {formData.public_image_url ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box
                                    component="img"
                                    src={formData.public_image_url}
                                    sx={{
                                        width: '100%',
                                        maxHeight: 200,
                                        objectFit: 'cover',
                                        borderRadius: 2,
                                        border: (theme) => `1px solid ${theme.palette.divider}`
                                    }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        size="small"
                                        startIcon={<PhotoCamera />}
                                        disabled={uploadingImage || submitting}
                                        fullWidth
                                    >
                                        Zmień zdjęcie
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                        />
                                    </Button>
                                    <IconButton
                                        onClick={handleRemoveAvatar}
                                        disabled={uploadingImage || submitting}
                                        size="small"
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        ) : (
                            <Button
                                component="label"
                                variant="outlined"
                                size="small"
                                startIcon={uploadingImage ? <CircularProgress size={16} /> : <PhotoCamera />}
                                disabled={uploadingImage || submitting}
                                fullWidth
                            >
                                {uploadingImage ? 'Wgrywanie...' : 'Dodaj zdjęcie'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                            </Button>
                        )}
                        
                        {errors.image && (
                            <Typography variant="caption" color="error">
                                {errors.image}
                            </Typography>
                        )}
                        
                        <Typography variant="caption" color="text.secondary">
                            Zdjęcie będzie wyświetlane na stronie publicznej (opcjonalne)
                        </Typography>
                    </Box>

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
                    disabled={submitting || uploadingImage}
                    sx={{
                        bgcolor: 'rgb(146, 0, 32)',
                        '&:hover': {
                            bgcolor: 'rgb(114, 0, 21)'
                        }
                    }}
                >
                    {submitting ? 'Dodawanie...' : 'Dodaj'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddTeamMemberDialog;
