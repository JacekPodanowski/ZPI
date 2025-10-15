import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import useTheme from '../../theme/useTheme';

const ACCENT_LETTERS = new Set(['Y', 'E', 'S']);

const sizeMap = (typography = {}) => {
    const sizes = typography.sizes || {};
    return {
        small: sizes.xl ?? '1.75rem',
        medium: sizes['2xl'] ?? '2.5rem',
        large: sizes['4xl'] ?? '3.5rem',
        xlarge: sizes['5xl'] ?? '4.5rem'
    };
};

const resolveAlign = (align) => {
    if (align === 'left') return 'flex-start';
    if (align === 'right') return 'flex-end';
    return 'center';
};

const buildVariantStyles = (theme) => {
    const primary = theme?.colors?.brand?.primary ?? '#82001F';
    return {
        default: {
            color: primary
        },
        shadow: {
            color: primary,
            textShadow: `0 12px 28px ${primary}33`
        },
        'shadow-light': {
            color: primary,
            textShadow: `0 4px 12px ${primary}22`
        },
        'shadow-strong': {
            color: primary,
            textShadow: `0 16px 40px ${primary}55, 0 8px 16px ${primary}33`
        },
        'shadow-glow': {
            color: primary,
            textShadow: `0 0 20px ${primary}99, 0 0 40px ${primary}66, 0 8px 24px ${primary}44`
        }
    };
};

const createCollapseAnimation = (primaryColor) => ({
    wrapper: {
        position: 'relative'
    },
    full: {
        position: 'relative',
        '@keyframes logoCollapseFull': {
            '0%': { opacity: 1, transform: 'translateY(0) scale(1)' },
            '40%': { opacity: 1, transform: 'translateY(0) scale(1)' },
            '55%': { opacity: 0, transform: 'translateY(-12px) scaleX(0.6)' },
            '80%': { opacity: 0, transform: 'translateY(-12px) scaleX(0.6)' },
            '100%': { opacity: 1, transform: 'translateY(0) scale(1)' }
        },
        animation: 'logoCollapseFull 6s ease-in-out infinite'
    },
    yes: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
        '@keyframes logoCollapseYes': {
            '0%': { opacity: 0, transform: 'translateY(16px) scale(0.6)' },
            '45%': { opacity: 0, transform: 'translateY(16px) scale(0.6)' },
            '55%': { opacity: 1, transform: 'translateY(0) scale(1)' },
            '75%': { opacity: 1, transform: 'translateY(0) scale(1)' },
            '90%': { opacity: 0, transform: 'translateY(-20px) scale(0.85)' },
            '100%': { opacity: 0, transform: 'translateY(-20px) scale(0.85)' }
        },
        animation: 'logoCollapseYes 6s ease-in-out infinite',
        pointerEvents: 'none'
    }
});

const Logo = ({
    text = 'YourEasySite',
    tagline = '',
    size = 'medium',
    variant = 'default',
    align = 'center',
    animated = false,
    animation = 'none'
}) => {
    const theme = useTheme();
    const typography = theme.typography || {};
    const sizes = sizeMap(typography);
    const variantStyles = buildVariantStyles(theme);
    const accentStyle = variantStyles[variant] || variantStyles.default;
    const accentColor = accentStyle.color ?? theme?.colors?.brand?.primary ?? '#82001F';
    const textColor = theme?.colors?.text?.primary ?? '#1F1F1F';
    const shadowSoft = theme?.colors?.shadow?.soft ?? '#00000029';
    const fontFamily = typography.fonts?.logo ?? '"Montserrat", sans-serif';
    const logoTextTokens = typography.textStyles?.logo || {};
    const fontWeight = logoTextTokens.fontWeight ?? 700;
    const lineHeight = logoTextTokens.lineHeight ?? 1.05;
    const taglineFont = typography.fonts?.body ?? fontFamily;
    const taglineSize = typography.sizes?.sm ?? '0.9rem';
    const taglineLetterSpacing = typography.letterSpacing?.wide ?? '0.1em';
    const taglineColor = theme?.colors?.text?.secondary ?? '#4A4A4A';

    const safeText = typeof text === 'string' && text.length ? text : 'YourEasySite';
    const enableCollapse = animation === 'collapse';
    const collapseAnimation = useMemo(
        () => (enableCollapse ? createCollapseAnimation(accentColor) : null),
        [enableCollapse, accentColor]
    );

    const baseLetterStyle = {
        display: 'inline-block',
        fontFamily,
        fontSize: sizes[size] || sizes.medium,
        fontWeight,
        lineHeight,
        fontStyle: 'italic',
        color: textColor,
        transition: 'color 0.3s ease'
    };

    const renderLetter = (character, index, options = {}) => {
        const { forceUppercase = false } = options;
        const letter = forceUppercase ? character.toUpperCase() : character;

        if (letter === ' ') {
            return <span key={`space-${index}`} style={{ whiteSpace: 'pre' }}> </span>;
        }

        const upper = letter.toUpperCase();
        const isAccent = letter === upper && ACCENT_LETTERS.has(upper);
        const letterStyle = { ...baseLetterStyle };

        if (isAccent) {
            Object.assign(letterStyle, accentStyle);
            if (!letterStyle.color) {
                letterStyle.color = accentColor;
            }
        }

        return (
            <span key={`${letter}-${index}`} style={letterStyle}>
                {letter}
            </span>
        );
    };

    return (
        <Box
            sx={{
                display: 'inline-flex',
                flexDirection: 'column',
                gap: 1,
                textAlign: align,
                alignItems: resolveAlign(align),
                cursor: animated ? 'pointer' : 'default',
                transition: animated ? 'transform 0.3s ease, filter 0.3s ease' : undefined,
                '&:hover': animated
                    ? {
                        transform: 'translateY(-2px)',
                        filter: `drop-shadow(0 8px 18px ${shadowSoft})`
                    }
                    : undefined,
                ...(enableCollapse ? collapseAnimation?.wrapper : {})
            }}
        >
            <Typography
                component="span"
                sx={{
                    display: 'inline-block',
                    position: 'relative',
                    whiteSpace: 'pre',
                    ...(enableCollapse ? collapseAnimation?.full : {})
                }}
            >
                {Array.from(safeText).map((letter, index) => renderLetter(letter, index))}
            </Typography>

            {enableCollapse ? (
                <Typography
                    component="span"
                    aria-hidden="true"
                    sx={{
                        display: 'inline-flex',
                        whiteSpace: 'pre',
                        ...(collapseAnimation?.yes || {})
                    }}
                >
                    {Array.from('YES').map((letter, index) => renderLetter(letter, index, { forceUppercase: true }))}
                </Typography>
            ) : null}

            {tagline ? (
                <Typography
                    variant="body2"
                    sx={{
                        color: taglineColor,
                        fontFamily: taglineFont,
                        fontSize: taglineSize,
                        letterSpacing: taglineLetterSpacing
                    }}
                >
                    {tagline}
                </Typography>
            ) : null}
        </Box>
    );
};

Logo.propTypes = {
    text: PropTypes.string,
    tagline: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    variant: PropTypes.oneOf(['default', 'shadow', 'shadow-light', 'shadow-strong', 'shadow-glow']),
    align: PropTypes.oneOf(['left', 'center', 'right']),
    animated: PropTypes.bool,
    animation: PropTypes.oneOf(['none', 'collapse'])
};

Logo.defaultProps = {
    text: 'YourEasySite',
    tagline: '',
    size: 'medium',
    variant: 'default',
    align: 'center',
    animated: false,
    animation: 'none'
};

export default Logo;