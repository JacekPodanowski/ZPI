import React, {useMemo} from 'react';
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
        hero: sizes['5xl'] ?? '4.5rem',
        heroLarge: sizes['6xl'] ?? '5.5rem',
        heroXL: sizes['7xl'] ?? '6rem',
        heroXXL: sizes['8xl'] ?? '7rem'
    };
};

// Width values tuned per size to keep the expanded logo optically centered.
const LETTER_SPACING_TABLES = Object.freeze({
    hero: [
        { lead: 'Y', trail: 'our', width: 6.05 },
        { lead: 'E', trail: 'asy', width: 6.3 },
        { lead: 'S', trail: 'ite', width: 4.0 }
    ],
    heroLarge: [
        { lead: 'Y', trail: 'our', width: 7.4 },
        { lead: 'E', trail: 'asy', width: 7.65 },
        { lead: 'S', trail: 'ite', width: 4.0 }
    ],
    heroXL: [
        { lead: 'Y', trail: 'our', width: 11 },
        { lead: 'E', trail: 'asy', width: 11.5},
        { lead: 'S', trail: 'ite', width: 4.0 }
    ]
});

const AnimatedLogo = ({
    expanded,
    onToggle,
    align,
    size,
    expandDuration,
    collapseDuration,
    allowToggle,
    className,
}) => {
    const theme = useTheme();
    const palette = theme?.colors || {};
    const typography = theme?.typography || {};
    const isDark = theme?.mode === 'dark';
    const glowColor = palette?.brand?.primary ?? '#82001F';
    const textPrimary = palette?.text?.primary ?? '#1D1D1D';
    const sizes = sizeMap(typography);
    const fontSize = sizes[size] ?? sizes.hero;
    const fontFamily = typography?.fonts?.logo ?? '"Montserrat", sans-serif';
    const activeDuration = expanded ? expandDuration : collapseDuration;

    const transition = useMemo(
        () => `${activeDuration}s cubic-bezier(0.4, 0.0, 0.2, 1)`,
        [activeDuration]
    );

    const alignment = useMemo(() => {
        if (align === 'left') return 'flex-start';
        if (align === 'right') return 'flex-end';
        return 'center';
    }, [align]);

    const currentLetterGroups = useMemo(
        () => LETTER_SPACING_TABLES[size] ?? LETTER_SPACING_TABLES.hero,
        [size]
    );

    // This calculation now correctly uses only 'width'
    const { expandedTranslations } = useMemo(() => {
        const expandedPositions = [0];

        for (let i = 1; i < currentLetterGroups.length; i++) {
            const prevGroup = currentLetterGroups[i - 1];
            expandedPositions[i] = expandedPositions[i - 1] + prevGroup.width;
        }

        const lastGroup = currentLetterGroups[currentLetterGroups.length - 1];
        const totalExpandedWidth = expandedPositions[expandedPositions.length - 1] + lastGroup.width;

        const totalCollapsedWidth = currentLetterGroups.length;
        const centerOffset = (totalExpandedWidth - totalCollapsedWidth) / 2;

        const translations = expandedPositions.map((expandedPos, i) => {
            const collapsedPos = i;
            return expandedPos - collapsedPos - centerOffset;
        });

        return { expandedTranslations: translations };
    }, [currentLetterGroups]);


    return (
        <Box
            role="presentation"
            aria-live="polite"
            aria-label={expanded ? 'YourEasySite' : 'YES'}
            onClick={allowToggle && onToggle ? () => onToggle(!expanded) : undefined}
            className={className}
            sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: alignment,
                userSelect: 'none',
                cursor: allowToggle && onToggle ? 'pointer' : 'default',
                filter: expanded
                    ? `drop-shadow(0 22px 44px ${glowColor}26)`
                    : `drop-shadow(0 16px 30px ${glowColor}20)`,
                transition: `filter ${transition}`,
                animation: 'wordmarkFloat 18s ease-in-out infinite',
                '@keyframes wordmarkFloat': {
                    '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
                    '45%': { transform: 'translate3d(0, -6px, 0) scale(1.015)' },
                    '55%': { transform: 'translate3d(0, -6px, 0) scale(1.015)' },
                    '100%': { transform: 'translate3d(0, 0, 0) scale(1)' }
                }
            }}
        >
            <Box
                component="span"
                sx={{
                    display: 'inline-flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    position: 'relative'
                }}
            >
                {currentLetterGroups.map(({ lead, trail, width }, index) => {
                    const stagger = index * 0.05;
                    const expandDelay = expanded
                        ? stagger
                        : (currentLetterGroups.length - 1 - index) * 0.05;
                    const moveDistance = expandedTranslations[index];
                    
                    return (
                        <Box
                            key={lead}
                            component="span"
                            sx={{
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'baseline',
                                transform: expanded 
                                    ? `translateX(${moveDistance}em)` 
                                    : 'translateX(0)',
                                transition: `transform ${activeDuration * 1.2}s cubic-bezier(0.4, 0.0, 0.2, 1)`,
                                transitionDelay: `${expandDelay}s`
                            }}
                        >
                            <Typography
                                component="span"
                                sx={{
                                    fontFamily,
                                    fontSize,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    fontStyle: 'italic',
                                    color: glowColor,
                                    textShadow: isDark
                                        ? `0 12px 28px ${glowColor}33`
                                        : `0 16px 40px ${glowColor}55, 0 8px 16px ${glowColor}33`,
                                    position: 'relative',
                                    zIndex: 2
                                }}
                            >
                                {lead}
                            </Typography>

                            <Typography
                                component="span"
                                sx={{
                                    fontFamily,
                                    fontSize,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    fontStyle: 'italic',
                                    color: textPrimary,
                                    position: 'absolute',
                                    left: '100%',
                                    transformOrigin: 'left center',
                                    transform: expanded
                                        ? 'translateX(0) scaleX(1)'
                                        : 'translateX(-50%) scaleX(0.01)',
                                    opacity: expanded ? 1 : 0,
                                    transition: `transform ${activeDuration * 1.2}s cubic-bezier(0.4, 0.0, 0.2, 1), opacity ${activeDuration * 0.8}s ease`,
                                    transitionDelay: `${expandDelay}s`,
                                    zIndex: 1,
                                    whiteSpace: 'nowrap',
                                    ml: '-0.05em'
                                }}
                            >
                                {trail}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

AnimatedLogo.propTypes = {
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    size: PropTypes.oneOf(['small', 'medium', 'large', 'hero', 'heroLarge', 'heroXL', 'heroXXL']),
    expandDuration: PropTypes.number,
    collapseDuration: PropTypes.number,
    allowToggle: PropTypes.bool,
    className: PropTypes.string
};

AnimatedLogo.defaultProps = {
    expanded: false,
    onToggle: null,
    align: 'center',
    size: 'hero',
    expandDuration: 1.2,
    collapseDuration: 0.9,
    allowToggle: true,
    className: undefined
};

export default AnimatedLogo;