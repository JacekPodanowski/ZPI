import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { KeyboardArrowDown as ExpandIcon, ExpandMore as ChevronDownIcon } from '@mui/icons-material';
import { getSiteColorHex } from '../../../../theme/siteColors';

// Threshold for collapsing events into a single "show more" rectangle
// When we have MORE than 4 events (5+), show first 3 + collapsed block
export const COLLAPSE_THRESHOLD = 4;

// Dot view for Site Management mode
export const EventDot = ({ event, siteColor }) => (
    <Tooltip title={`${event.title} - ${event.start_time || event.time}`} arrow>
        <Box
            sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: siteColor,
                cursor: 'pointer',
                transition: 'transform 150ms',
                '&:hover': {
                    transform: 'scale(1.3)',
                    zIndex: 10
                }
            }}
        />
    </Tooltip>
);

EventDot.propTypes = {
    event: PropTypes.shape({
        title: PropTypes.string.isRequired,
        start_time: PropTypes.string,
        time: PropTypes.string
    }).isRequired,
    siteColor: PropTypes.string.isRequired
};

// Simplified Event Block - max 3 events shown, rest collapsed
export const EventBlock = ({ 
    event, 
    isSelectedSite, 
    onClick, 
    isHovered = false 
}) => {
    // Get site color from color_index - always use site color
    const baseColor = event.site_color || getSiteColorHex(event.site?.color_index ?? 0);
    
    // Always use site colors, filtering affects opacity not color
    const bgColor = alpha(baseColor, 0.15);
    const borderColor = baseColor;
    const textColor = baseColor;

    // Fixed height for all events - 18px with 1px gaps
    // Available space: ~110px tile - 20px day header - 5px padding = ~85px
    // 3 events (3×18) + 2 gaps (2×1) + collapsed (24px) = 54 + 2 + 24 = 80px ✓
    const height = 18;
    const fontSize = isSelectedSite ? '10px' : '8.5px';

    return (
        <Box
            onClick={onClick}
            sx={{
                height: height,
                px: 0.75,
                py: 0.5,
                borderRadius: 1.5,
                borderLeft: `2px solid ${borderColor}`,
                backgroundColor: bgColor,
                cursor: 'pointer',
                overflow: 'hidden',
                pointerEvents: isSelectedSite ? 'auto' : 'none',
                filter: isSelectedSite ? 'none' : 'grayscale(40%)',
                opacity: isSelectedSite ? 1 : 0.6,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontWeight: 500,
                    fontSize: fontSize,
                    color: textColor,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                    lineHeight: 1.2
                }}
            >
                <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                    {event.start_time || event.time}
                </Box>
                {event.title}
            </Typography>
            
            {/* Show capacity/bookings */}
            <Typography
                variant="caption"
                sx={{
                    fontSize: '10px',
                    color: textColor,
                    opacity: 0.7,
                    flexShrink: 0
                }}
            >
                {event.bookings?.length || 0}/{event.capacity === -1 ? '∞' : (event.capacity || 1)}
            </Typography>
        </Box>
    );
};

EventBlock.propTypes = {
    event: PropTypes.shape({
        title: PropTypes.string.isRequired,
        start_time: PropTypes.string,
        time: PropTypes.string,
        event_type: PropTypes.string,
        max_capacity: PropTypes.number,
        current_capacity: PropTypes.number,
        site_color: PropTypes.string,
        site: PropTypes.shape({
            color_index: PropTypes.number
        })
    }).isRequired,
    isSelectedSite: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
    isHovered: PropTypes.bool
};

EventBlock.defaultProps = {
    onClick: () => {},
    isHovered: false
};

// Collapsed events display (4+ events)
export const CollapsedEventsBlock = ({ eventCount, visibleCount = 3, onClick, siteColors = [] }) => {
    // Deduplicate site colors - only show unique colors
    const uniqueColors = [...new Set(siteColors.filter(Boolean))];
    const additionalCount = eventCount - visibleCount;
    
    return (
        <Box
            onClick={onClick}
            sx={{
                height: 18,
                px: 0.75,
                py: 0.25,
                borderRadius: 1.5,
                backgroundColor: 'rgba(248, 248, 245, 0.95)',
                border: `1px solid rgba(146, 0, 32, 0.3)`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 0.5
            }}
        >
            {/* Expandable icon (like time in regular events) */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                minWidth: '28px',
                mr: 0.5
            }}>
                <ChevronDownIcon
                    sx={{
                        fontSize: '18px',
                        color: 'rgba(30, 30, 30, 0.5)',
                    }}
                />
            </Box>

            {/* Text: "+X wydarzeń" (positioned like event title) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0, ml: -0.5 }}>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 600,
                        fontSize: '11px',
                        color: 'rgb(30, 30, 30)',
                        letterSpacing: 0,
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Box component="span" sx={{ fontWeight: 700 }}>
                        +{additionalCount}
                    </Box>
                    {' '}wydarzeń
                </Typography>
            </Box>
            
            {/* Color circles for unique sites (like capacity in regular events) */}
            <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center', flexShrink: 0 }}>
                {uniqueColors.slice(0, 4).map((color, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: color,
                            boxShadow: `0 0 3px ${alpha(color, 0.6)}, 0 0 6px ${alpha(color, 0.3)}`
                        }}
                    />
                ))}
                {uniqueColors.length > 4 && (
                    <Typography
                        sx={{
                            fontSize: '7px',
                            color: 'rgba(30, 30, 30, 0.6)',
                            ml: 0.125,
                            fontWeight: 500,
                            lineHeight: 1
                        }}
                    >
                        +{uniqueColors.length - 4}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

CollapsedEventsBlock.propTypes = {
    eventCount: PropTypes.number.isRequired,
    visibleCount: PropTypes.number,
    onClick: PropTypes.func,
    siteColors: PropTypes.arrayOf(PropTypes.string)
};

CollapsedEventsBlock.defaultProps = {
    visibleCount: 3,
    onClick: () => {},
    siteColors: []
};
