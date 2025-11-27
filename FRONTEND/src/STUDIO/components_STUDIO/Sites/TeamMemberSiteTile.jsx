import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, CircularProgress, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MoreVert as MoreVertIcon,
    CalendarToday as CalendarTodayIcon,
    Link as LinkIcon,
    Palette as PaletteIcon,
    Warning as WarningIcon,
    People as PeopleIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { getSiteColorHex } from '../../../theme/siteColors';
import SiteColorPicker from './SiteColorPicker';
import { updateSiteColor, acceptTeamInvitation, rejectTeamInvitation } from '../../../services/siteService';
import { getRoleInfo } from '../../../shared/teamRoles';
import { getSiteUrl, getSiteUrlDisplay } from '../../../utils/siteUrlUtils';

const TeamMemberSiteTile = ({ site, teamMemberInfo, index, onInvitationUpdate }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isMenuHovered, setIsMenuHovered] = useState(false);
    const [menuIconColor, setMenuIconColor] = useState('rgba(255, 255, 255, 0.9)');
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [localColorIndex, setLocalColorIndex] = useState(site.color_index ?? 0);
    const [localStatus] = useState(site.status || (site.is_active ? 'online' : 'offline'));
    const [acceptHovered, setAcceptHovered] = useState(false);
    const [rejectHovered, setRejectHovered] = useState(false);
    const [invitationStatus, setInvitationStatus] = useState(teamMemberInfo?.invitation_status ?? 'linked');
    const [isProcessingInvitation, setIsProcessingInvitation] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    const DEBUG_MENU_AREA = false;
    const siteStatus = localStatus;
    const siteColor = getSiteColorHex(localColorIndex);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = site.preview_image || `https://picsum.photos/seed/${site.id}/800/600`;
        img.onload = () => {
            setImageLoaded(true);
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const sampleSize = 40;
                const x = canvas.width - sampleSize;
                const y = 0;
                const imageData = ctx.getImageData(x, y, sampleSize, sampleSize);
                
                let totalBrightness = 0;
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
                    totalBrightness += brightness;
                }
                const avgBrightness = totalBrightness / (imageData.data.length / 4);
                
                if (avgBrightness > 128) {
                    setMenuIconColor('rgba(30, 30, 30, 0.85)');
                } else {
                    setMenuIconColor('rgba(255, 255, 255, 0.9)');
                }
            } catch (error) {
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

    const handleChangeColor = () => {
        handleMenuClose();
        setColorPickerOpen(true);
    };

    const handleColorSelect = async (colorIndex) => {
        try {
            await updateSiteColor(site.id, colorIndex);
            setLocalColorIndex(colorIndex);
        } catch (error) {
            console.error('Failed to update site color:', error);
            alert('Nie udało się zmienić koloru.');
        }
    };

    const handleLeaveTeam = () => {
        handleMenuClose();
        // TODO: Implement leave team API call
        console.log('Leave team:', site.id);
    };

    const handleAcceptInvitation = async () => {
        if (invitationStatus !== 'pending' || isProcessingInvitation || !teamMemberInfo?.id) {
            return;
        }
        setIsProcessingInvitation(true);
        try {
            await acceptTeamInvitation(teamMemberInfo.id);
            setInvitationStatus('linked');
            onInvitationUpdate?.();
        } catch (error) {
            console.error('Failed to accept invitation:', error);
            alert('Nie udało się zaakceptować zaproszenia.');
        } finally {
            setIsProcessingInvitation(false);
        }
    };

    const handleRejectInvitation = async () => {
        if (invitationStatus !== 'pending' || isProcessingInvitation || !teamMemberInfo?.id) {
            return;
        }
        setIsProcessingInvitation(true);
        try {
            await rejectTeamInvitation(teamMemberInfo.id);
            setInvitationStatus('rejected');
            setIsDismissed(true);
            onInvitationUpdate?.();
        } catch (error) {
            console.error('Failed to reject invitation:', error);
            alert('Nie udało się odrzucić zaproszenia.');
        } finally {
            setIsProcessingInvitation(false);
        }
    };

    // Team members cannot access editor - redirect to calendar instead
    const handleTileClick = () => {
        if (invitationStatus === 'linked') {
            navigate(`/studio/events/${site.id}`);
        }
    };

    useEffect(() => {
        setInvitationStatus(teamMemberInfo?.invitation_status ?? 'linked');
        setIsDismissed(false);
    }, [teamMemberInfo]);

    if (isDismissed) {
        return null;
    }

    const isPending = invitationStatus === 'pending';

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
                        paddingTop: '56.25%',
                        bgcolor: 'grey.200',
                        overflow: 'hidden',
                        cursor: isPending ? 'default' : 'pointer',
                        '&:hover:not(:has(.menu-click-area:hover))': isPending ? {} : {
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

                    {!isPending && (
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
                                Otwórz kalendarz
                            </Typography>
                        </Box>
                    )}

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
                                width: siteStatus === 'problem' ? 16 : 12,
                                height: siteStatus === 'problem' ? 16 : 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
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
                                <CircularProgress
                                    size={16}
                                    thickness={5}
                                    sx={{
                                        color: '#3b82f6',
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        backgroundColor: siteStatus === 'online' ? '#4ade80' : '#ef4444',
                                        boxShadow: siteStatus === 'online' ? '0 0 12px rgba(74, 222, 128, 0.8)' : '0 0 12px rgba(239, 68, 68, 0.8)',
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

                    {/* Menu Button */}
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

                {/* Content - Invitation Space */}
                <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Site Title and Calendar Icon */}
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

                    {/* URL */}
                    <Box
                        component="a"
                        href={getSiteUrl(site.identifier)}
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
                            {getSiteUrlDisplay(site.identifier)}
                        </Typography>
                    </Box>

                    {/* Large Invitation Box */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'background.default',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            minHeight: '200px',
                            justifyContent: isPending ? 'center' : 'flex-start'
                        }}
                    >
                        {isPending ? (
                            <>
                                {/* Owner Name */}
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        fontWeight: 700, 
                                        lineHeight: 1.2,
                                        fontSize: '1rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    {site.owner?.first_name} {site.owner?.last_name}
                                </Typography>

                                {/* Invitation Text with Tooltip */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
                                        zaprasza cię jako
                                    </Typography>
                                    <Tooltip
                                        title={getRoleInfo(teamMemberInfo.permission_role).description}
                                        placement="top"
                                        arrow
                                        slotProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: 'rgba(0, 0, 0, 0.85)',
                                                    fontSize: '0.875rem',
                                                    py: 1,
                                                    px: 1.5,
                                                    maxWidth: 280
                                                }
                                            },
                                            arrow: {
                                                sx: {
                                                    color: 'rgba(0, 0, 0, 0.85)'
                                                }
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'help' }}>
                                            <PeopleIcon sx={{ fontSize: '1.1rem', color: 'rgb(146, 0, 32)' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgb(146, 0, 32)', fontSize: '0.95rem' }}>
                                                {getRoleInfo(teamMemberInfo.permission_role).namePolish}
                                            </Typography>
                                        </Box>
                                    </Tooltip>
                                </Box>

                                {/* Accept/Reject Actions */}
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', mt: 0.5 }}>
                                    <IconButton
                                        onClick={handleAcceptInvitation}
                                        onMouseEnter={() => setAcceptHovered(true)}
                                        onMouseLeave={() => setAcceptHovered(false)}
                                        sx={{
                                            color: acceptHovered ? '#16a34a' : 'text.primary',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(74, 222, 128, 0.1)'
                                            }
                                        }}
                                    >
                                        <CheckIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleRejectInvitation}
                                        disabled={isProcessingInvitation}
                                        onMouseEnter={() => setRejectHovered(true)}
                                        onMouseLeave={() => setRejectHovered(false)}
                                        sx={{
                                            color: rejectHovered ? '#dc2626' : 'text.primary',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                            }
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </>
                        ) : (
                            <>
                                {/* Linked State - Top Left: Invited By */}
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        fontSize: '0.85rem',
                                        textAlign: 'left',
                                        mb: 1
                                    }}
                                >
                                    Zaproszony przez <Box component="span" sx={{ fontWeight: 700 }}>{site.owner?.first_name} {site.owner?.last_name}</Box>
                                </Typography>

                                {/* Center: Team Icon and Role in one line */}
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        flex: 1
                                    }}
                                >
                                    <PeopleIcon sx={{ fontSize: '1.8rem', color: 'rgb(146, 0, 32)' }} />
                                    <Tooltip
                                        title={getRoleInfo(teamMemberInfo.permission_role).description}
                                        placement="top"
                                        arrow
                                        slotProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: 'rgba(0, 0, 0, 0.85)',
                                                    fontSize: '0.875rem',
                                                    py: 1,
                                                    px: 1.5,
                                                    maxWidth: 280
                                                }
                                            },
                                            arrow: {
                                                sx: {
                                                    color: 'rgba(0, 0, 0, 0.85)'
                                                }
                                            }
                                        }}
                                    >
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                fontWeight: 600,
                                                color: 'rgb(146, 0, 32)',
                                                fontSize: '0.95rem',
                                                cursor: 'help'
                                            }}
                                        >
                                            {getRoleInfo(teamMemberInfo.permission_role).namePolish}
                                        </Typography>
                                    </Tooltip>
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Context Menu - Only Change Color and Leave Team */}
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
                    Zmień kolor
                </MenuItem>
                <MenuItem onClick={handleLeaveTeam} sx={{ color: 'error.main' }}>
                    <ExitToAppIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                    Opuść stronę
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
        </motion.div>
    );
};

export default TeamMemberSiteTile;
