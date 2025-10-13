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
        hero: sizes['5xl'] ?? '4.5rem'
    };
};

// The 'width' now controls the entire space the word takes up, including the gap after it.
const LETTER_GROUPS = [
    { lead: 'Y', trail: 'our', width: 6.05},
    { lead: 'E', trail: 'asy', width: 6.3},
    { lead: 'S', trail: 'ite', width: 4.0}
];

const AnimatedWordmark = ({
    expanded,
    onToggle,
    align,
    size,
    duration,
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

    const transition = useMemo(
        () => `${duration}s cubic-bezier(0.4, 0.0, 0.2, 1)`,
        [duration]
    );

    const alignment = useMemo(() => {
        if (align === 'left') return 'flex-start';
        if (align === 'right') return 'flex-end';
        return 'center';
    }, [align]);

    // This calculation now correctly uses only 'width'
    const { expandedTranslations } = useMemo(() => {
        const expandedPositions = [0];
        
        for (let i = 1; i < LETTER_GROUPS.length; i++) {
            const prevGroup = LETTER_GROUPS[i - 1];
            expandedPositions[i] = expandedPositions[i - 1] + prevGroup.width;
        }

        const lastGroup = LETTER_GROUPS[LETTER_GROUPS.length - 1];
        const totalExpandedWidth = expandedPositions[expandedPositions.length - 1] + lastGroup.width;

        const totalCollapsedWidth = LETTER_GROUPS.length;
        const centerOffset = (totalExpandedWidth - totalCollapsedWidth) / 2;

        const translations = expandedPositions.map((expandedPos, i) => {
            const collapsedPos = i;
            return expandedPos - collapsedPos - centerOffset;
        });

        return { expandedTranslations: translations };
    }, []);


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
                {LETTER_GROUPS.map(({ lead, trail, width }, index) => {
                    const stagger = index * 0.05;
                    const expandDelay = expanded ? stagger : (LETTER_GROUPS.length - 1 - index) * 0.05;
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
                                transition: `transform ${duration * 1.2}s cubic-bezier(0.4, 0.0, 0.2, 1)`,
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
                                    transition: `transform ${duration * 1.2}s cubic-bezier(0.4, 0.0, 0.2, 1), opacity ${duration * 0.8}s ease`,
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

AnimatedWordmark.propTypes = {
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    size: PropTypes.oneOf(['small', 'medium', 'large', 'hero']),
    duration: PropTypes.number,
    allowToggle: PropTypes.bool,
    className: PropTypes.string
};

AnimatedWordmark.defaultProps = {
    expanded: false,
    onToggle: null,
    align: 'center',
    size: 'hero',
    duration: 1.2,
    allowToggle: true,
    className: undefined
};

export default AnimatedWordmark;