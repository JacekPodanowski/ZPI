import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import useDashboardStore from '../../store/dashboardStore';
import { EASING_CURVES } from '../../utils/dashboardAnimations';

const SiteButton = ({ site, isSelected }) => {
    const selectSite = useDashboardStore((state) => state.selectSite);

    const siteColor = site.color_tag || 'rgb(146, 0, 32)';

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.17, ease: EASING_CURVES.EASE_IN }}
        >
            <Box
                onClick={() => selectSite(site.id)}
                sx={{
                    height: 36,
                    px: 2,
                    py: 1.5,
                    borderRadius: 18,
                    backgroundColor: siteColor,
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 500,
                    minWidth: 80,
                    maxWidth: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isSelected
                        ? `0 0 20px ${siteColor}66, 0 2px 8px rgba(0,0,0,0.15)`
                        : '0 1px 3px rgba(0,0,0,0.1)',
                    border: isSelected ? '2px solid rgba(255,255,255,0.3)' : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    zIndex: isSelected ? 2 : 1,
                    transition: 'all 200ms ease',
                    '&:hover': {
                        transform: 'translateY(-1px) scale(1.02)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }
                }}
            >
                <Typography
                    variant="body2"
                    sx={{
                        fontSize: '13px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {site.name}
                </Typography>
            </Box>
        </motion.div>
    );
};

SiteButton.propTypes = {
    site: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        color_tag: PropTypes.string
    }).isRequired,
    isSelected: PropTypes.bool.isRequired
};

export default SiteButton;
