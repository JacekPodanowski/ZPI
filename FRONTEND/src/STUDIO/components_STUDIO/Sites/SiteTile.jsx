import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Divider, ListSubheader, CircularProgress } from '@mui/material';
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
    Settings as SettingsIcon,
    Palette as PaletteIcon,
    ViewModule as ViewModuleIcon,
    Warning as WarningIcon,
    BugReport as BugReportIcon,
    People as PeopleIcon,
    Language as LanguageIcon
} from '@mui/icons-material';
import { deleteSite, updateSiteColor, updateSite } from '../../../services/siteService';
import SiteColorPicker from './SiteColorPicker';
import { getSiteColorHex } from '../../../theme/siteColors';
import { getSiteUrl, getSiteUrlDisplay } from '../../../utils/siteUrlUtils';

const SiteTile = ({ site, index, onSiteDeleted }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isMenuHovered, setIsMenuHovered] = useState(false);
    const [menuIconColor, setMenuIconColor] = useState('rgba(255, 255, 255, 0.9)');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [localColorIndex, setLocalColorIndex] = useState(site.color_index ?? 0);
    const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
    const [localStatus, setLocalStatus] = useState(site.status || (site.is_active ? 'online' : 'offline'));
    
    // Debug flag - set to true to see the menu click area
    const DEBUG_MENU_AREA = false;
    
    // Determine site status - can be 'online', 'offline', 'deploying', or 'problem'
    // Default to 'offline' if not specified
    const siteStatus = localStatus;
    
    // Get the site color
    const siteColor = getSiteColorHex(localColorIndex);
    
    // Mock analytics data - replace with actual API calls
    const [analytics] = useState({
        traffic: Math.floor(Math.random() * 5000) + 500,
        trafficChange: (Math.random() * 40 - 10).toFixed(1),
        totalEvents: Math.floor(Math.random() * 35),
        nextEvent: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
    });
    
    // Use real team_size from site object
    const teamSize = site.team_size ?? 1;

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

    const handleManageModules = () => {
        handleMenuClose();
        navigate(`/studio/sites/modules/${site.id}`);
    };

    const handleOpenLab = () => {
        handleMenuClose();
        navigate(`/studio/lab/${site.id}`);
    };

    const handleVisitSite = () => {
        handleMenuClose();
        const siteUrl = site.subdomain ? `https://${site.subdomain}` : getSiteUrl(site.identifier);
        window.open(siteUrl, '_blank');
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

    const handleChangeColor = () => {
        handleMenuClose();
        setColorPickerOpen(true);
    };

    const handleOpenStatusMenu = (event) => {
        event.stopPropagation();
        setStatusMenuAnchor(event.currentTarget);
    };

    const handleCloseStatusMenu = () => {
        setStatusMenuAnchor(null);
    };

    const handleChangeStatus = async (newStatus) => {
        try {
            await updateSite(site.id, { status: newStatus });
            setLocalStatus(newStatus);
            handleCloseStatusMenu();
            handleMenuClose();
        } catch (error) {
            console.error('Failed to update site status:', error);
            alert('Failed to update site status. Please try again.');
        }
    };

    const handleColorSelect = async (colorIndex) => {
        try {
            await updateSiteColor(site.id, colorIndex);
            setLocalColorIndex(colorIndex);
        } catch (error) {
            console.error('Failed to update site color:', error);
            alert('Failed to update site color. Please try again.');
        }
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
                        {/* Status Icon/Dot */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: siteStatus === 'problem' ? 16 : 12,
                                height: siteStatus === 'problem' ? 16 : 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {/* Pulsing ring for online status */}
                            {siteStatus === 'online' && (
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
                            
                            {/* Pulsing triangular glow for problem status - blurred icon */}
                            {siteStatus === 'problem' && (
                                <>
                                    <WarningIcon 
                                        sx={{
                                            position: 'absolute',
                                            fontSize: 16,
                                            color: '#eab308',
                                            filter: 'blur(12px)',
                                            opacity: 0.6,
                                            animation: 'pulseGlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                            '@keyframes pulseGlow': {
                                                '0%, 100%': {
                                                    opacity: 0.6,
                                                    transform: 'scale(1.5)'
                                                },
                                                '50%': {
                                                    opacity: 0.3,
                                                    transform: 'scale(2)'
                                                }
                                            }
                                        }}
                                    />
                                    <WarningIcon 
                                        sx={{
                                            position: 'absolute',
                                            fontSize: 16,
                                            color: '#eab308',
                                            filter: 'blur(6px)',
                                            opacity: 0.5,
                                            animation: 'pulseGlowInner 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                            '@keyframes pulseGlowInner': {
                                                '0%, 100%': {
                                                    opacity: 0.5,
                                                    transform: 'scale(1.2)'
                                                },
                                                '50%': {
                                                    opacity: 0.2,
                                                    transform: 'scale(1.5)'
                                                }
                                            }
                                        }}
                                    />
                                </>
                            )}
                            
                            {/* Main indicator */}
                            {siteStatus === 'problem' ? (
                                <WarningIcon 
                                    sx={{
                                        fontSize: 16,
                                        color: '#eab308',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                />
                            ) : siteStatus === 'deploying' ? (
                                <Box
                                    sx={{
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {/* Blue glow behind spinner */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            backgroundColor: '#3b82f6',
                                            filter: 'blur(8px)',
                                            opacity: 0.6
                                        }}
                                    />
                                    <CircularProgress
                                        size={16}
                                        thickness={5}
                                        sx={{
                                            color: '#3b82f6',
                                            position: 'relative',
                                            zIndex: 1,
                                            filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.8))'
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        backgroundColor: 
                                            siteStatus === 'online' ? '#4ade80' : 
                                            '#ef4444',
                                        boxShadow: 
                                            siteStatus === 'online' ? '0 0 12px rgba(74, 222, 128, 0.8)' :
                                            '0 0 12px rgba(239, 68, 68, 0.8)',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            )}
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                color: 
                                    siteStatus === 'online' ? '#16a34a' : 
                                    siteStatus === 'deploying' ? '#2563eb' :
                                    siteStatus === 'problem' ? '#ca8a04' :
                                    '#dc2626'
                            }}
                        >
                            {siteStatus === 'online' ? 'Online' : 
                             siteStatus === 'deploying' ? 'Deploying' :
                             siteStatus === 'problem' ? 'Problem' :
                             'Offline'}
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
                                    fontSize: '2rem',
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
                                color: siteColor,
                                padding: '6px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '& svg': {
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                },
                                '&:hover': {
                                    backgroundColor: `${siteColor}14`,
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
                        href={site.subdomain ? `https://${site.subdomain}` : getSiteUrl(site.identifier)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mb: 2,
                            color: siteColor,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                opacity: 0.8,
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
                            {site.subdomain || getSiteUrlDisplay(site.identifier)}
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

                        {/* Total Events */}
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
                                <EventAvailableIcon sx={{ fontSize: '0.9rem', color: 'primary.main' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                                    Events
                                </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
                                {analytics.totalEvents}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                scheduled
                            </Typography>
                        </Box>

                        {/* Team Members */}
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/studio/team/${site.id}`);
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
                                <PeopleIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                                    Team
                                </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
                                {teamSize}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                {teamSize === 1 ? 'member' : 'members'}
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
                    </Box>
                </Box>
            </Box>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                disableRestoreFocus
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            minWidth: 200,
                            marginTop: '-35px',
                            marginLeft: '1px'
                        }
                    }
                }}
            >
                <MenuItem onClick={handleChangeColor}>
                    <PaletteIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                    Change Color
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                    <EditIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                    Edit Site
                </MenuItem>
                <MenuItem onClick={() => {
                    handleMenuClose();
                    navigate(`/studio/${site.id}/domain`);
                }}>
                    <LanguageIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                    Change Domain
                </MenuItem>
                <MenuItem onClick={handleVisitSite}>
                    <LinkIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                    Visit Site
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleOpenStatusMenu}>
                    <BugReportIcon sx={{ mr: 1.5, fontSize: '1.25rem', color: 'info.main' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                        <Typography>Set Status (Dev)</Typography>
                        <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                            {siteStatus}
                        </Typography>
                    </Box>
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                {/* Hide delete for showcase site (ID=1) */}
                {site.id !== 1 && (
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <DeleteIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                        Delete Site
                    </MenuItem>
                )}
            </Menu>

            {/* Status Menu */}
            <Menu
                anchorEl={statusMenuAnchor}
                open={Boolean(statusMenuAnchor)}
                onClose={handleCloseStatusMenu}
                onClick={(e) => e.stopPropagation()}
                disableRestoreFocus
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            minWidth: 180
                        }
                    }
                }}
            >
                <ListSubheader sx={{ lineHeight: '32px', fontWeight: 600 }}>
                    Site Status
                </ListSubheader>
                <MenuItem 
                    onClick={() => handleChangeStatus('online')}
                    selected={siteStatus === 'online'}
                >
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: '#4ade80',
                            mr: 1.5,
                            boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)'
                        }}
                    />
                    Online
                </MenuItem>
                <MenuItem 
                    onClick={() => handleChangeStatus('offline')}
                    selected={siteStatus === 'offline'}
                >
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            mr: 1.5,
                            boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
                        }}
                    />
                    Offline
                </MenuItem>
                <MenuItem 
                    onClick={() => handleChangeStatus('deploying')}
                    selected={siteStatus === 'deploying'}
                >
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            mr: 1.5,
                            boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)'
                        }}
                    />
                    Deploying
                </MenuItem>
                <MenuItem 
                    onClick={() => handleChangeStatus('problem')}
                    selected={siteStatus === 'problem'}
                >
                    <WarningIcon 
                        sx={{ 
                            fontSize: 12, 
                            color: '#eab308',
                            mr: 1.5
                        }}
                    />
                    Problem
                </MenuItem>
            </Menu>

            {/* Color Picker Dialog */}
            <SiteColorPicker
                open={colorPickerOpen}
                onClose={() => setColorPickerOpen(false)}
                currentColorIndex={localColorIndex}
                onColorSelect={handleColorSelect}
                siteName={site.name}
            />

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
