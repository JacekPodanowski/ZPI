import React from 'react';
import { Card, CardActionArea, CardContent, Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import useDashboardStore from '../../store/dashboardStore';
import { useNavigate } from 'react-router-dom';

const SiteCard = ({ site, index, isSelected }) => {
    const navigate = useNavigate();
    const selectSite = useDashboardStore((state) => state.selectSite);

    const config = site?.template_config || {};
    const heroModule = config?.pages?.home?.modules?.find(m =>
        m.type?.toLowerCase() === 'hero' || m.id?.toLowerCase().includes('hero')
    );

    const backgroundColor = heroModule?.config?.bgColor || 'rgba(228, 229, 218, 0.8)';
    const textColor = heroModule?.config?.textColor || 'rgb(30, 30, 30)';
    const siteColor = site.color_tag || 'rgb(146, 0, 32)';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ width: 300, flex: '0 0 auto' }}
        >
            <Card
                elevation={0}
                sx={{
                    borderRadius: 4,
                    height: '100%',
                    position: 'relative',
                    border: isSelected
                        ? `2px solid ${siteColor}`
                        : '1px solid rgba(160, 0, 22, 0.14)',
                    overflow: 'hidden',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    boxShadow: isSelected
                        ? `0 0 24px ${siteColor}40, 0 4px 16px rgba(0,0,0,0.2)`
                        : 'none',
                    transition: 'all 200ms ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }
                }}
            >
                <CardActionArea
                    onClick={() => selectSite(site.id)}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        position: 'relative',
                        '&:hover .site-card__overlay': {
                            opacity: 1
                        }
                    }}
                >
                    {/* Color Header Bar */}
                    <Box
                        sx={{
                            height: 35,
                            backgroundColor: siteColor,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            px: 1
                        }}
                    >
                        {/* Status Indicator */}
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: site.is_active ? '#4ade80' : '#ef4444',
                                boxShadow: site.is_active
                                    ? '0 0 8px #4ade80'
                                    : '0 0 8px #ef4444'
                            }}
                        />
                    </Box>

                    {/* Preview Image/Area */}
                    <Box
                        sx={{
                            height: 110,
                            backgroundColor,
                            backgroundImage: site.preview_image ? `url(${site.preview_image})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            p: 2,
                            gap: 0.5,
                            position: 'relative'
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(180deg, rgba(12, 12, 12, 0) 0%, rgba(12, 12, 12, 0.12) 100%)'
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                color: textColor,
                                position: 'relative',
                                fontSize: '11px',
                                opacity: 0.8
                            }}
                        >
                            {site.identifier || 'preview'}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: textColor,
                                fontWeight: 600,
                                position: 'relative',
                                fontSize: '16px'
                            }}
                        >
                            {site.name}
                        </Typography>
                    </Box>

                    {/* Site Info */}
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: site.is_active ? '#4ade80' : '#ef4444',
                                fontWeight: 'bold',
                                fontSize: '12px',
                                mb: 1
                            }}
                        >
                            {site.is_active ? '🟢 AKTYWNA' : '🔴 WYŁĄCZONA'}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                fontSize: '11px'
                            }}
                        >
                            📊 {site.event_count || 0} events
                        </Typography>
                    </CardContent>

                    <Box
                        className="site-card__overlay"
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(180deg, rgba(12, 12, 12, 0.15) 0%, rgba(12, 12, 12, 0.6) 100%)',
                            opacity: 0,
                            transition: 'opacity 200ms ease',
                            pointerEvents: 'none'
                        }}
                    >
                        <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            onClick={(event) => {
                                event.stopPropagation();
                                navigate(`/studio/editor/${site.id}`);
                            }}
                            sx={{ pointerEvents: 'auto', fontWeight: 600 }}
                        >
                            Otwórz edytor
                        </Button>
                    </Box>
                </CardActionArea>
            </Card>
        </motion.div>
    );
};

SiteCard.propTypes = {
    site: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        identifier: PropTypes.string,
        template_config: PropTypes.object,
        color_tag: PropTypes.string,
        is_active: PropTypes.bool,
        preview_image: PropTypes.string,
        event_count: PropTypes.number
    }).isRequired,
    index: PropTypes.number.isRequired,
    isSelected: PropTypes.bool.isRequired
};

export default SiteCard;
