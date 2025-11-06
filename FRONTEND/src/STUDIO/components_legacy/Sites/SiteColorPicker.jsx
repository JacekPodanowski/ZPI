import React, { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { SITE_COLOR_PALETTE } from '../../../theme/siteColors';

const SiteColorPicker = ({ open, onClose, currentColorIndex, onColorSelect, siteName }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const handleColorClick = (colorIndex) => {
        onColorSelect(colorIndex);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'visible'
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 2
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={600}>
                        Change Site Color
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {siteName}
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            bgcolor: 'action.hover'
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pb: 3 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    This color will be used to identify this site in the calendar and throughout the app.
                </Typography>

                {/* Color Grid - 3 rows x 4 columns */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 2,
                        mb: 2
                    }}
                >
                    {SITE_COLOR_PALETTE.map((color) => (
                        <motion.div
                            key={color.index}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Box
                                onClick={() => handleColorClick(color.index)}
                                onMouseEnter={() => setHoveredIndex(color.index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    paddingTop: '100%',
                                    borderRadius: 2,
                                    backgroundColor: color.hex,
                                    cursor: 'pointer',
                                    border: currentColorIndex === color.index
                                        ? '3px solid'
                                        : '2px solid',
                                    borderColor: currentColorIndex === color.index
                                        ? (theme) => theme.palette.mode === 'light'
                                            ? 'rgba(30, 30, 30, 0.6)'
                                            : 'rgba(220, 220, 220, 0.6)'
                                        : 'transparent',
                                    boxShadow: currentColorIndex === color.index
                                        ? `0 4px 20px ${color.hex}60`
                                        : hoveredIndex === color.index
                                            ? `0 4px 16px ${color.hex}50`
                                            : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                    },
                                    // Checkmark for selected color
                                    '&::after': currentColorIndex === color.index ? {
                                        content: '"✓"',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: 'white',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                    } : {}
                                }}
                            />
                        </motion.div>
                    ))}
                </Box>

                {/* Color Name Display */}
                <Box
                    sx={{
                        textAlign: 'center',
                        minHeight: 24
                    }}
                >
                    {hoveredIndex !== null && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: SITE_COLOR_PALETTE[hoveredIndex].hex,
                                fontWeight: 600,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {SITE_COLOR_PALETTE[hoveredIndex].name}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default SiteColorPicker;
