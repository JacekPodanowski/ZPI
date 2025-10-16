import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const DayTemplate = ({ template, compact }) => {
    return (
        <motion.div
            whileHover={{ 
                scale: 1.02,
                boxShadow: '0 4px 12px rgba(146, 0, 32, 0.15)' 
            }}
            style={{ cursor: 'grab' }}
        >
            <Card
                sx={{
                    width: '100%',
                    p: 1.25,
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'rgba(146, 0, 32, 0.12)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        borderColor: 'rgba(146, 0, 32, 0.3)',
                        backgroundColor: 'rgba(228, 229, 218, 0.3)'
                    }
                }}
            >
                {/* Template Name */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.75
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                        }}
                    >
                        {template.name}
                    </Typography>
                    <Box
                        sx={{
                            minWidth: 28,
                            height: 28,
                            borderRadius: 1,
                            backgroundColor: 'rgba(146, 0, 32, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ml: 1
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: 'primary.main'
                            }}
                        >
                            {template.day_abbreviation}
                        </Typography>
                    </Box>
                </Box>

                {/* Event List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    {template.events?.slice(0, 2).map((event, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                py: 0.4,
                                px: 0.75,
                                borderRadius: 1,
                                backgroundColor: event.type === 'individual' 
                                    ? 'rgba(74, 222, 128, 0.08)' 
                                    : 'rgba(59, 130, 246, 0.08)',
                                border: '1px solid',
                                borderColor: event.type === 'individual'
                                    ? 'rgba(74, 222, 128, 0.2)'
                                    : 'rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: event.type === 'individual' 
                                        ? '#4ade80' 
                                        : '#3b82f6',
                                    flexShrink: 0
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.7rem',
                                    color: 'text.primary',
                                    fontWeight: 500,
                                    fontFamily: 'monospace',
                                    letterSpacing: '0.02em'
                                }}
                            >
                                {event.start_time}-{event.end_time}
                            </Typography>
                        </Box>
                    ))}
                    {template.events?.length > 2 && (
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.65rem',
                                color: 'text.secondary',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                mt: 0.25
                            }}
                        >
                            +{template.events.length - 2} więcej
                        </Typography>
                    )}
                </Box>

                {/* Subtle Drag Indicator */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: 6,
                        bottom: 6,
                        width: 16,
                        height: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.25,
                        transition: 'opacity 0.2s'
                    }}
                >
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>⋮⋮</Typography>
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
