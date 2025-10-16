import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';

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

// Block view for Calendar Power mode
export const EventBlock = ({ event, isSelectedSite, siteColor, onClick }) => {
    const baseColor = siteColor || 'rgb(146, 0, 32)';
    const bgColor = isSelectedSite
        ? alpha(baseColor, 0.85)
        : alpha('rgb(188, 186, 179)', 0.7);

    const borderColor = isSelectedSite
        ? alpha(baseColor, 0.95)
        : 'rgb(188, 186, 179)';

    const textColor = isSelectedSite
        ? 'rgb(30, 30, 30)'
        : 'rgb(110, 110, 110)';

    return (
        <Box
            onClick={onClick}
            sx={{
                minHeight: 32,
                maxHeight: 50,
                p: 0.75,
                borderRadius: 1,
                borderLeft: `3px solid ${borderColor}`,
                backgroundColor: bgColor,
                cursor: 'pointer',
                transition: 'all 150ms',
                overflow: 'hidden',
                pointerEvents: isSelectedSite ? 'auto' : 'none',
                filter: isSelectedSite ? 'none' : 'grayscale(60%)',
                opacity: isSelectedSite ? 1 : 0.65,
                '&:hover': {
                    transform: 'scale(1.03) translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 20
                }
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontWeight: isSelectedSite ? 500 : 400,
                    display: 'block',
                    fontSize: '12px',
                    color: textColor,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                {event.start_time || event.time} {event.title}
            </Typography>
            {event.event_type === 'group' && event.max_capacity && (
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '11px',
                        color: textColor,
                        opacity: 0.8
                    }}
                >
                    [{event.current_capacity || 0}/{event.max_capacity}]
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
        current_capacity: PropTypes.number
    }).isRequired,
    isSelectedSite: PropTypes.bool.isRequired,
    siteColor: PropTypes.string.isRequired,
    onClick: PropTypes.func
};

EventBlock.defaultProps = {
    onClick: () => {}
};
