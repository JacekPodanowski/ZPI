import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { SvgIcon } from '@mui/material';

/**
 * REAL_DefaultLayout - The standard layout for Studio pages
 * 
 * Features:
 * - Gradient title with animation
 * - Subtitle/description below title
 * - Optional action button (top right)
 * - No footer
 * - Free space for content below
 * - Full viewport height
 * 
 * Based on the /sites page design (SitesPage.jsx)
 * Note: Navigation should be provided by NavigationLayout wrapper
 */
const REAL_DefaultLayout = ({
    title,
    titleIcon,
    subtitle,
    actionButton,
    children,
    maxWidth = 1400,
    contentGap = 3,
    showBackground = true,
    contentPadding
}) => {
    const defaultPadding = {
        py: { xs: 1.5, md: 2 },
        px: { xs: 2, md: 4, lg: 6 }
    };
    
    const effectivePadding = contentPadding !== undefined ? contentPadding : defaultPadding;
    
    return (
        <Box
                sx={{
                    minHeight: 'calc(100vh - 60px)',
                    background: showBackground
                        ? (theme) => theme.palette.mode === 'light'
                            ? 'linear-gradient(180deg, rgba(228, 229, 218, 0.4) 0%, rgba(228, 229, 218, 1) 100%)'
                            : 'linear-gradient(180deg, rgba(12, 12, 12, 0.4) 0%, rgba(12, 12, 12, 1) 100%)'
                        : 'transparent',
                    ...effectivePadding
                }}
            >
            {/* Header with Gradient Title */}
            <Box
                sx={{
                    maxWidth,
                    mx: 'auto',
                    mb: contentGap,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 3
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        {titleIcon && (
                            <Box
                                component={motion.div}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    '& > svg': {
                                        fontSize: 40,
                                        fill: 'url(#icon-gradient)'
                                    }
                                }}
                            >
                                <svg width="0" height="0" style={{ position: 'absolute' }}>
                                    <defs>
                                        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: 'rgb(146, 0, 32)', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: 'rgb(30, 30, 30)', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                {titleIcon}
                            </Box>
                        )}
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 600,
                                letterSpacing: '-0.02em',
                                background: (theme) => theme.palette.mode === 'light'
                                    ? 'linear-gradient(135deg, rgb(146, 0, 32) 0%, rgb(30, 30, 30) 100%)'
                                    : 'linear-gradient(135deg, rgb(114, 0, 21) 0%, rgb(220, 220, 220) 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>
                    {subtitle && (
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                maxWidth: 600
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </motion.div>

                {actionButton && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {actionButton}
                    </motion.div>
                )}
            </Box>

            {/* Content Area */}
            <Box
                sx={{
                    maxWidth,
                    mx: 'auto'
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

REAL_DefaultLayout.propTypes = {
    title: PropTypes.string.isRequired,
    titleIcon: PropTypes.node,
    subtitle: PropTypes.string,
    actionButton: PropTypes.node,
    children: PropTypes.node.isRequired,
    maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    contentGap: PropTypes.number,
    showBackground: PropTypes.bool,
    contentPadding: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
};

export default REAL_DefaultLayout;
