import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Logo from './Logo';

const AnimatedLogoHero = ({ size, variant, text, tagline, align }) => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            mb: { xs: 4, md: 6 }
        }}
    >
        <Logo animated size={size} variant={variant} text={text} tagline={tagline} align={align} />
    </Box>
);

AnimatedLogoHero.propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    variant: PropTypes.oneOf(['default', 'shadow', 'shadow-light', 'shadow-strong', 'shadow-glow']),
    text: PropTypes.string,
    tagline: PropTypes.string,
    align: PropTypes.oneOf(['left', 'center', 'right'])
};

AnimatedLogoHero.defaultProps = {
    size: 'large',
    variant: 'default',
    text: 'YourEasySite',
    tagline: '',
    align: 'center'
};

export default AnimatedLogoHero;
