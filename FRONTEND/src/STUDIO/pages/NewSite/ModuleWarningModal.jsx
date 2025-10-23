import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { motion } from 'framer-motion';

const ModuleWarningModal = ({ open, onClose, onConfirm, warning }) => {
    if (!warning) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 2
                }
            }}
            TransitionComponent={motion.div}
            TransitionProps={{
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: 50 },
                transition: { duration: 0.3, ease: 'easeOut' }
            }}
        >
            <DialogTitle>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)'
                        }}
                    >
                        <WarningAmberIcon
                            sx={{
                                fontSize: 32,
                                color: '#ff9800'
                            }}
                        />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {warning.title}
                    </Typography>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, pl: 8 }}>
                    {warning.message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="contained" color="secondary">
                    {warning.cancelText || 'Anuluj'}
                </Button>
                <Button onClick={onConfirm} variant="text" sx={{ color: 'text.secondary' }}>
                    {warning.confirmText || 'Potwierdź'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModuleWarningModal;
