import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { UnfoldMore as ExpandIcon } from '@mui/icons-material';
import { getSiteColorHex } from '../../../../theme/siteColors';

// Threshold for collapsing events into a single "show more" rectangle
export const COLLAPSE_THRESHOLD = 10;

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

// Calculate event display mode based on event count and available space
const getEventDisplayMode = (eventCount) => {
    if (eventCount <= 4) return 'normal'; // Show all with normal size
    if (eventCount <= 7) return 'compact'; // Strip extra data, smaller
    if (eventCount <= 10) return 'minimal'; // Just time + title, very small
    return 'collapsed'; // Single rectangle with count
};

// Ethereal Minimalism Event Block
export const EventBlock = ({ 
    event, 
    isSelectedSite, 
    onClick, 
    eventCount = 1, 
    isHovered = false, 
    isDayCrowded = false 
}) => {
    // Get site color from color_index
    const baseColor = event.site_color || getSiteColorHex(event.site?.color_index ?? 0);
    const displayMode = getEventDisplayMode(eventCount);
    
    const bgColor = isSelectedSite
        ? alpha(baseColor, 0.15)
        : alpha('rgb(188, 186, 179)', 0.5);

    const borderColor = isSelectedSite ? baseColor : 'rgb(188, 186, 179)';
    const textColor = isSelectedSite ? baseColor : 'rgb(110, 110, 110)';

    // Calculate height based on density and hover state
    const getHeight = () => {
        if (displayMode === 'normal') return isHovered ? 36 : 32;
        if (displayMode === 'compact') return isHovered ? 27 : 24;
        if (displayMode === 'minimal') return isHovered ? 21 : 18;
        return 28;
    };

    // Calculate font size based on density
    const getFontSize = () => {
        if (displayMode === 'normal') return isHovered ? '12.5px' : '12px';
        if (displayMode === 'compact') return isHovered ? '11.5px' : '11px';
        return isHovered ? '10.5px' : '10px';
    };

    // Calculate hover transform based on crowd level
    const getHoverTransform = () => {
        if (isDayCrowded) {
            // Crowded: subtle scale with gentle lift
            return 'scale(1.04) translateY(-2px)';
        }
        // Not crowded: elegant lift
        return eventCount <= 2 ? 'translateY(-4px)' : 'translateY(-3px)';
    };

    return (
        <Box
            onClick={onClick}
            sx={{
                height: getHeight(),
                px: displayMode === 'minimal' ? 0.5 : 0.75,
                py: displayMode === 'minimal' ? 0.25 : 0.5,
                borderRadius: 1.5,
                borderLeft: `2px solid ${borderColor}`,
                backgroundColor: bgColor,
                cursor: 'pointer',
                transition: 'height 400ms cubic-bezier(0.34, 1.15, 0.64, 1), transform 400ms cubic-bezier(0.34, 1.15, 0.64, 1), background-color 400ms ease, box-shadow 400ms ease, font-size 400ms ease',
                overflow: 'visible',
                pointerEvents: isSelectedSite ? 'auto' : 'none',
                filter: isSelectedSite ? 'none' : 'grayscale(60%)',
                opacity: isSelectedSite ? 1 : 0.5,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                    backgroundColor: isSelectedSite ? alpha(baseColor, 0.18) : alpha('rgb(188, 186, 179)', 0.6),
                    transform: getHoverTransform(),
                    boxShadow: isDayCrowded 
                        ? `0 3px 12px ${alpha(baseColor, 0.25)}` 
                        : `0 4px 16px ${alpha(baseColor, 0.28)}`,
                    zIndex: 50,
                }
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontWeight: isHovered ? 600 : 500,
                    fontSize: getFontSize(),
                    color: textColor,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                    lineHeight: 1.2,
                    transition: 'font-size 400ms cubic-bezier(0.34, 1.15, 0.64, 1), font-weight 400ms ease'
                }}
            >
                <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                    {event.start_time || event.time}
                </Box>
                {displayMode !== 'minimal' && event.title}
                {displayMode === 'minimal' && event.title.split(' ')[0]}
            </Typography>
            
            {/* Show capacity only in normal mode */}
            {displayMode === 'normal' && event.event_type === 'group' && event.max_capacity && (
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '10px',
                        color: textColor,
                        opacity: 0.7,
                        flexShrink: 0
                    }}
                >
                    {event.current_capacity || 0}/{event.max_capacity}
                </Typography>
            )}
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
    eventCount: PropTypes.number,
    isHovered: PropTypes.bool,
    isDayCrowded: PropTypes.bool
};

EventBlock.defaultProps = {
    onClick: () => {},
    eventCount: 1,
    isHovered: false,
    isDayCrowded: false
};

// Collapsed events display (10+ events)
export const CollapsedEventsBlock = ({ eventCount, onClick, siteColors = [] }) => {
    // Use first site color or default
    const primaryColor = siteColors[0] || 'rgb(146, 0, 32)';
    
    return (
        <Box
            onClick={onClick}
            sx={{
                height: 36,
                px: 1,
                py: 0.75,
                borderRadius: 1.5,
                backgroundColor: 'rgba(248, 248, 245, 0.95)',
                border: `1px solid ${alpha(primaryColor, 0.2)}`,
                cursor: 'pointer',
                transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                '&:hover': {
                    backgroundColor: alpha(primaryColor, 0.08),
                    borderColor: alpha(primaryColor, 0.4),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(primaryColor, 0.2)}`,
                }
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: primaryColor,
                    letterSpacing: 0.2
                }}
            >
                {eventCount} wydarzeń
            </Typography>
            <ExpandIcon sx={{ fontSize: 18, color: alpha(primaryColor, 0.6) }} />
        </Box>
    );
};

CollapsedEventsBlock.propTypes = {
    eventCount: PropTypes.number.isRequired,
    onClick: PropTypes.func,
    siteColors: PropTypes.arrayOf(PropTypes.string)
};

CollapsedEventsBlock.defaultProps = {
    onClick: () => {},
    siteColors: []
};
