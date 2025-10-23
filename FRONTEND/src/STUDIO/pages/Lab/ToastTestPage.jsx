import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    Chip,
    Divider
} from '@mui/material';
import { useToast } from '../../../contexts/ToastContext';

const ToastTestPage = () => {
    const addToast = useToast();
    const [message, setMessage] = useState('This is a test notification');
    const [variant, setVariant] = useState('info');
    const [duration, setDuration] = useState(5000);
    const [version, setVersion] = useState(1);

    const handleLaunchToast = () => {
        if (!message.trim()) {
            addToast('Please enter a message first', { variant: 'warning', duration: 3000, version: 1 });
            return;
        }
        addToast(message, { variant, duration, version });
    };

    const presetMessages = [
        { message: 'Site saved successfully!', variant: 'success' },
        { message: 'Failed to connect to server', variant: 'error' },
        { message: 'This action cannot be undone', variant: 'warning' },
        { message: 'New updates available', variant: 'info' }
    ];

    const handlePresetClick = (preset) => {
        setMessage(preset.message);
        setVariant(preset.variant);
        addToast(preset.message, { variant: preset.variant, duration, version });
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper'
                }}
            >
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Chip label="DEV" color="secondary" size="small" />
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            Toast Testing Lab
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Test different toast notifications with custom messages, variants, and durations.
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Stack spacing={3}>
                    {/* Message Input */}
                    <TextField
                        fullWidth
                        label="Toast Message"
                        variant="outlined"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your notification message..."
                        multiline
                        rows={2}
                    />

                    {/* Variant Selection */}
                    <FormControl fullWidth>
                        <InputLabel>Variant</InputLabel>
                        <Select
                            value={variant}
                            label="Variant"
                            onChange={(e) => setVariant(e.target.value)}
                        >
                            <MenuItem value="success">Success ✅</MenuItem>
                            <MenuItem value="error">Error ❌</MenuItem>
                            <MenuItem value="warning">Warning ⚠️</MenuItem>
                            <MenuItem value="info">Info ℹ️</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Duration Input */}
                    <FormControl fullWidth>
                        <InputLabel>Duration</InputLabel>
                        <Select
                            value={duration}
                            label="Duration"
                            onChange={(e) => setDuration(e.target.value)}
                        >
                            <MenuItem value={2000}>2 seconds</MenuItem>
                            <MenuItem value={3000}>3 seconds</MenuItem>
                            <MenuItem value={5000}>5 seconds (default)</MenuItem>
                            <MenuItem value={7000}>7 seconds</MenuItem>
                            <MenuItem value={10000}>10 seconds</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Version Input */}
                    <FormControl fullWidth>
                        <InputLabel>Version</InputLabel>
                        <Select
                            value={version}
                            label="Version"
                            onChange={(e) => setVersion(e.target.value)}
                        >
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={2}>2</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Launch Button */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleLaunchToast}
                        sx={{
                            py: 1.5,
                            fontWeight: 600,
                            fontSize: '1rem',
                            borderRadius: 2
                        }}
                    >
                        🚀 Launch Toast
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    {/* Quick Presets */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                            Quick Presets
                        </Typography>
                        <Stack spacing={1}>
                            {presetMessages.map((preset, index) => (
                                <Button
                                    key={index}
                                    variant="outlined"
                                    onClick={() => handlePresetClick(preset)}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        textAlign: 'left',
                                        textTransform: 'none',
                                        py: 1.5,
                                        px: 2,
                                        borderRadius: 2,
                                        borderColor: 'divider',
                                        color: 'text.primary',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                        <Chip
                                            label={preset.variant}
                                            size="small"
                                            color={preset.variant === 'success' ? 'success' : preset.variant === 'error' ? 'error' : 'default'}
                                            sx={{ minWidth: 70 }}
                                        />
                                        <Typography variant="body2">{preset.message}</Typography>
                                    </Stack>
                                </Button>
                            ))}
                        </Stack>
                    </Box>

                    {/* Stress Test */}
                    <Divider sx={{ my: 2 }} />
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                            Stress Test
                        </Typography>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                const variants = ['success', 'error', 'warning', 'info'];
                                for (let i = 0; i < 5; i++) {
                                    setTimeout(() => {
                                        const v = variants[i % variants.length];
                                        addToast(`Toast #${i + 1}`, { variant: v, duration: 5000, version: 1 });
                                    }, i * 200);
                                }
                            }}
                            sx={{ borderRadius: 2 }}
                        >
                            Launch 5 Toasts Rapidly
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
};

export default ToastTestPage;
