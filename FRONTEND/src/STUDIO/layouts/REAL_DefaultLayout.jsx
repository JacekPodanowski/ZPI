import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation/Navigation';

/**
 * REAL_DefaultLayout - The standard layout for Studio pages
 * 
 * Features:
 * - Navigation bar at the top
 * - Gradient title with animation
 * - Subtitle/description below title
 * - Optional action button (top right)
 * - No footer
 * - Free space for content below
 * - Full viewport height
 * 
 * Based on the /sites page design (SitesPage.jsx)
 */
const REAL_DefaultLayout = ({
    title,
    subtitle,
    actionButton,
    children,
    maxWidth = 1400,
    contentGap = 3,
    showBackground = true,
    showNavigation = true
}) => {
    return (
        <>
            {showNavigation && <Navigation />}
            
            <Box
                sx={{
                    minHeight: 'calc(100vh - 60px)',
                    background: showBackground
                        ? (theme) => theme.palette.mode === 'light'
                            ? 'linear-gradient(180deg, rgba(228, 229, 218, 0.4) 0%, rgba(228, 229, 218, 1) 100%)'
                            : 'linear-gradient(180deg, rgba(12, 12, 12, 0.4) 0%, rgba(12, 12, 12, 1) 100%)'
                        : 'transparent',
                    py: { xs: 1.5, md: 2 },
                    px: { xs: 2, md: 4, lg: 6 }
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
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5
                        }}
                    >
                        {title}
                    </Typography>
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
        </>
    );
};

REAL_DefaultLayout.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    actionButton: PropTypes.node,
    children: PropTypes.node.isRequired,
    maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    contentGap: PropTypes.number,
    showBackground: PropTypes.bool,
    showNavigation: PropTypes.bool
};

export default REAL_DefaultLayout;
