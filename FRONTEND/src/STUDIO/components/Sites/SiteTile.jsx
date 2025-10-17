import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MoreVert as MoreVertIcon,
    TrendingUp as TrendingUpIcon,
    EventAvailable as EventAvailableIcon,
    EventBusy as EventBusyIcon,
    CalendarToday as CalendarTodayIcon,
    Link as LinkIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { deleteSite } from '../../../services/siteService';

const SiteTile = ({ site, index, onSiteDeleted }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isMenuHovered, setIsMenuHovered] = useState(false);
    const [menuIconColor, setMenuIconColor] = useState('rgba(255, 255, 255, 0.9)');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Debug flag - set to true to see the menu click area
    const DEBUG_MENU_AREA = false;
    
    // Determine if site is active (default to true if not specified)
    const isActive = site.is_active ?? false;
    
    // Mock analytics data - replace with actual API calls
    const [analytics] = useState({
        traffic: Math.floor(Math.random() * 5000) + 500,
        trafficChange: (Math.random() * 40 - 10).toFixed(1),
        onlineEvents: Math.floor(Math.random() * 20),
        offlineEvents: Math.floor(Math.random() * 15),
        nextEvent: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
    });

    useEffect(() => {
        // Preload image and detect color
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = site.preview_image || `https://picsum.photos/seed/${site.id}/800/600`;
        img.onload = () => {
            setImageLoaded(true);
            
            // Detect color in top-right corner (where menu icon is)
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Sample a 40x40 area in top-right corner
                const sampleSize = 40;
                const x = canvas.width - sampleSize;
                const y = 0;
                const imageData = ctx.getImageData(x, y, sampleSize, sampleSize);
                
                // Calculate average brightness
                let totalBrightness = 0;
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    // Use perceived brightness formula
                    const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
                    totalBrightness += brightness;
                }
                const avgBrightness = totalBrightness / (imageData.data.length / 4);
                
                // If background is bright, use dark icon; if dark, use light icon
                // Lower threshold (128) means more backgrounds will get dark dots
                if (avgBrightness > 128) {
                    setMenuIconColor('rgba(30, 30, 30, 0.85)');
                } else {
                    setMenuIconColor('rgba(255, 255, 255, 0.9)');
                }
            } catch (error) {
                // Fallback to white if detection fails
                console.log('Color detection failed, using default');
                setMenuIconColor('rgba(255, 255, 255, 0.9)');
            }
        };
        img.onerror = () => {
            setImageLoaded(true);
            setMenuIconColor('rgba(255, 255, 255, 0.9)');
        };
    }, [site]);

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        navigate(`/studio/editor/${site.id}`);
    };

    const handleOpenLab = () => {
        handleMenuClose();
        navigate(`/studio/lab/${site.id}`);
    };

    const handleVisitSite = () => {
        handleMenuClose();
        window.open(`https://${site.identifier}.youreasysite.com`, '_blank');
    };

    const handleDelete = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setIsDeleting(true);
            await deleteSite(site.id);
            setDeleteDialogOpen(false);
            if (onSiteDeleted) {
                onSiteDeleted(site.id);
            }
        } catch (error) {
            console.error('Failed to delete site:', error);
            alert('Failed to delete site. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    const handleTileClick = () => {
        navigate(`/studio/editor/${site.id}`);
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`;
        }
        return num.toString();
    };

    const getTrafficTrend = () => {
        const change = parseFloat(analytics.trafficChange);
        return {
            color: change >= 0 ? 'success.main' : 'error.main',
            icon: change >= 0 ? '+' : '',
            value: `${change >= 0 ? '+' : ''}${analytics.trafficChange}%`
        };
    };

    const trend = getTrafficTrend();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
            }}
            style={{ height: '100%' }}
        >
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
            >
                {/* Preview Image */}
                <Box
                    onClick={handleTileClick}
                    sx={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: '56.25%', // 16:9 aspect ratio
                        bgcolor: 'grey.200',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        '&:hover:not(:has(.menu-click-area:hover))': {
                            '& .site-preview-overlay': {
                                opacity: 1
                            },
                            '& .site-preview-image': {
                                transform: 'scale(1.05)'
                            }
                        }
                    }}
                >
                    <Box
                        className="site-preview-image"
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${site.preview_image || `https://picsum.photos/seed/${site.id}/800/600`})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: imageLoaded ? 1 : 0
                        }}
                    />
                    
                    {/* Overlay on hover */}
                    <Box
                        className="site-preview-overlay"
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
                            opacity: 0,
                            transition: 'opacity 0.4s ease',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            pb: 3,
                            zIndex: 1,
                            pointerEvents: 'none'
                        }}
                    >
                        <Typography
                            variant="button"
                            sx={{
                                color: 'white',
                                fontWeight: 600,
                                letterSpacing: '0.05em'
                            }}
                        >
                            Open Editor
                        </Typography>
                    </Box>

                    {/* Status Indicator */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            display: 'flex',
                            gap: 1.5,
                            alignItems: 'center',
                            zIndex: 20
                        }}
                    >
                        <Box
                            sx={{
                                position: 'relative',
                                width: 12,
                                height: 12
                            }}
                        >
                            {/* Pulsing ring for online status */}
                            {isActive && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: -4,
                                        borderRadius: '50%',
                                        backgroundColor: '#4ade80',
                                        opacity: 0.3,
                                        animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                        '@keyframes pulse': {
                                            '0%, 100%': {
                                                opacity: 0.3,
                                                transform: 'scale(1)'
                                            },
                                            '50%': {
                                                opacity: 0.1,
                                                transform: 'scale(1.3)'
                                            }
                                        }
                                    }}
                                />
                            )}
                            {/* Main dot */}
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    backgroundColor: isActive ? '#4ade80' : '#ef4444',
                                    boxShadow: isActive
                                        ? '0 0 12px rgba(74, 222, 128, 0.8)'
                                        : '0 0 12px rgba(239, 68, 68, 0.8)',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                color: isActive ? '#16a34a' : '#dc2626'
                            }}
                        >
                            {isActive ? 'Online' : 'Offline'}
                        </Typography>
                    </Box>

                    {/* Menu Button - Top-Right Corner Click Area */}
                    <Box
                        className="menu-click-area"
                        onClick={handleMenuOpen}
                        onMouseEnter={() => setIsMenuHovered(true)}
                        onMouseLeave={() => setIsMenuHovered(false)}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '80px',
                            height: '80px',
                            zIndex: 20,
                            cursor: 'pointer',
                            clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                            backgroundColor: DEBUG_MENU_AREA ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingLeft: '26px',
                            paddingBottom: '26px',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                                '& .menu-icon': {
                                    transform: 'scale(1.15)',
                                    '& svg': {
                                        fontSize: '2rem',
                                        filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.7))'
                                    }
                                }
                            }
                        }}
                    >
                        <Box
                            className="menu-icon"
                            sx={{
                                color: menuIconColor,
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '& svg': {
                                    fontSize: '1.8rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6))'
                                }
                            }}
                        >
                            <MoreVertIcon />
                        </Box>
                    </Box>
                </Box>

                {/* Content */}
                <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Title with Calendar Icon */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.75,
                            gap: 1
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '1.1rem',
                                flex: 1
                            }}
                        >
                            {site.name}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/studio/calendar/creator');
                                // TODO: Filter calendar by this site
                            }}
                            sx={{
                                color: 'primary.main',
                                padding: '6px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '& svg': {
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(146, 0, 32, 0.08)',
                                    transform: 'scale(1.1)',
                                    '& svg': {
                                        transform: 'scale(1.15)'
                                    }
                                }
                            }}
                        >
                            <CalendarTodayIcon sx={{ fontSize: '1.4rem' }} />
                        </IconButton>
                    </Box>

                    {/* URL - Clickable Link */}
                    <Box
                        component="a"
                        href={`https://${site.identifier}.youreasysite.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mb: 2,
                            color: 'primary.main',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                color: 'primary.dark',
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        <LinkIcon sx={{ fontSize: '1rem' }} />
                        <Typography
                            variant="body2"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: 600
                            }}
                        >
                            {site.identifier}.youreasysite.com
                        </Typography>
                    </Box>

                    {/* Analytics Grid */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 1.5,
                            mb: 0
                        }}
                    >
                        {/* Traffic */}
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenLab();
                            }}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                <TrendingUpIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                                    Traffic
                                </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
                                {formatNumber(analytics.traffic)}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: trend.color,
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                }}
                            >
                                {trend.value}
                            </Typography>
                        </Box>

                        {/* Next Event */}
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/studio/calendar/creator');
                            }}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                <CalendarTodayIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                                    Next Event
                                </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600} fontSize="0.9rem">
                                {analytics.nextEvent.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                {analytics.nextEvent.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        </Box>

                        {/* Online Events */}
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/studio/calendar/creator');
                            }}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                <EventAvailableIcon sx={{ fontSize: '0.9rem', color: 'success.main' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                                    Online
                                </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
                                {analytics.onlineEvents}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                events
                            </Typography>
                        </Box>

                        {/* Offline Events */}
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/studio/calendar/creator');
                            }}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                <EventBusyIcon sx={{ fontSize: '0.9rem', color: 'primary.main' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                                    In-Person
                                </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
                                {analytics.offlineEvents}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                events
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        minWidth: 200
                    }
                }}
            >
                <MenuItem onClick={handleEdit}>
                    <EditIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                    Edit Site
                </MenuItem>
                <MenuItem onClick={handleOpenLab}>
                    <SettingsIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                    Site Settings
                </MenuItem>
                <MenuItem onClick={handleVisitSite}>
                    <LinkIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                    Visit Site
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                    Delete Site
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onClick={(e) => e.stopPropagation()}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        minWidth: 400
                    }
                }}
            >
                <DialogTitle>Delete Site</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{site.name}</strong>? This action cannot be undone.
                        All events, bookings, and data associated with this site will be permanently deleted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleDeleteCancel} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                        sx={{
                            minWidth: 100
                        }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </motion.div>
    );
};

export default SiteTile;
