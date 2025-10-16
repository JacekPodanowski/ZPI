import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const DayTemplate = ({ template, compact }) => {
    const cardWidth = compact ? 160 : 220;
    const cardHeight = compact ? 80 : 100;

    return (
        <motion.div
            whileHover={{ transform: 'translateX(4px)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
            style={{ cursor: 'grab', marginBottom: 8 }}
        >
            <Card
                sx={{
                    width: cardWidth,
                    height: cardHeight,
                    p: compact ? 0.75 : 1.5,
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    transition: 'all 200ms',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Template Name */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 600,
                            fontSize: compact ? 11 : 13,
                            maxWidth: '70%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {template.name}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: compact ? 10 : 11,
                            color: 'text.secondary'
                        }}
                    >
                        {template.day_abbreviation}
                    </Typography>
                </Box>

                {/* Event List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    {template.events?.slice(0, compact ? 2 : 3).map((event, idx) => (
                        <Typography
                            key={idx}
                            variant="caption"
                            sx={{
                                fontSize: compact ? 9 : 11,
                                color: 'text.secondary',
                                fontFamily: 'monospace'
                            }}
                        >
                            {event.type === 'individual' ? 'I' : 'G'} {event.start_time}-{event.end_time}
                        </Typography>
                    ))}
                    {template.events?.length > (compact ? 2 : 3) && (
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: 9,
                                color: 'text.secondary',
                                fontStyle: 'italic'
                            }}
                        >
                            +{template.events.length - (compact ? 2 : 3)} więcej
                        </Typography>
                    )}
                </Box>

                {/* Drag Handle Icon */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: 4,
                        bottom: 4,
                        opacity: 0.3,
                        fontSize: 16,
                        color: 'text.secondary'
                    }}
                >
                    ⋮⋮
                </Box>
            </Card>
        </motion.div>
    );
};

DayTemplate.propTypes = {
    template: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        day_abbreviation: PropTypes.string,
        events: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.oneOf(['individual', 'group']),
                start_time: PropTypes.string,
                end_time: PropTypes.string
            })
        )
    }).isRequired,
    compact: PropTypes.bool
};

DayTemplate.defaultProps = {
    compact: false
};

export default DayTemplate;
