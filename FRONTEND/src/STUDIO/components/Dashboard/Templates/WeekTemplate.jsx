import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const WeekTemplate = ({ template, compact }) => {
    const cardWidth = compact ? 160 : 220;
    const cardHeight = compact ? 100 : 140;

    // Generate mini calendar preview
    const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];
    const activeDays = template.active_days || []; // Array of day indices that have events

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
                        {template.day_count || activeDays.length} dni
                    </Typography>
                </Box>

                {/* Mini Calendar Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: compact ? 0.25 : 0.5,
                        mt: 1,
                        mb: 0.5
                    }}
                >
                    {days.map((day, index) => {
                        const hasEvents = activeDays.includes(index);
                        const squareSize = compact ? 14 : 18;

                        return (
                            <Box
                                key={day}
                                sx={{
                                    width: squareSize,
                                    height: squareSize,
                                    borderRadius: 0.5,
                                    backgroundColor: hasEvents
                                        ? 'primary.main'
                                        : 'action.hover',
                                    border: '1px solid',
                                    borderColor: hasEvents
                                        ? 'primary.dark'
                                        : 'divider',
                                    transition: 'all 150ms'
                                }}
                            />
                        );
                    })}
                </Box>

                {/* Day Labels (only if not compact) */}
                {!compact && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: 0.5,
                            mt: 0.5
                        }}
                    >
                        {days.map((day) => (
                            <Typography
                                key={day}
                                variant="caption"
                                sx={{
                                    fontSize: 8,
                                    color: 'text.secondary',
                                    textAlign: 'center'
                                }}
                            >
                                {day[0]}
                            </Typography>
                        ))}
                    </Box>
                )}

                {/* Event Count */}
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: compact ? 9 : 10,
                        color: 'text.secondary',
                        mt: 0.5,
                        display: 'block'
                    }}
                >
                    {template.total_events || 0} wydarzeń
                </Typography>

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

WeekTemplate.propTypes = {
    template: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        day_count: PropTypes.number,
        active_days: PropTypes.arrayOf(PropTypes.number),
        total_events: PropTypes.number
    }).isRequired,
    compact: PropTypes.bool
};

WeekTemplate.defaultProps = {
    compact: false
};

export default WeekTemplate;
