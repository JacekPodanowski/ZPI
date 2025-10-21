import React, { useState } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const WeekTemplate = ({ template, compact, onDragStart, onDragEnd }) => {
    // Generate mini calendar preview
    const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];
    const activeDays = template.active_days || [];
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e) => {
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('templateType', 'week');
        e.dataTransfer.setData('templateId', template.id);
        e.dataTransfer.setData('templateData', JSON.stringify(template));
        onDragStart?.(template);
    };

    const handleDragEnd = (e) => {
        setIsDragging(false);
        onDragEnd?.(template);
    };

    return (
        <motion.div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            animate={{
                scale: isDragging ? 0.9 : 1,
                opacity: isDragging ? 0.5 : 1
            }}
            whileHover={{ 
                scale: isDragging ? 0.9 : 1.02
            }}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <Card
                sx={{
                    width: '100%',
                    p: 1.25,
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'rgba(146, 0, 32, 0.12)',
                    boxShadow: 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        borderColor: 'rgba(146, 0, 32, 0.3)',
                        backgroundColor: 'rgba(228, 229, 218, 0.3)',
                        boxShadow: '0 4px 12px rgba(146, 0, 32, 0.15)',
                        borderRadius: 2
                    }
                }}
            >
                {/* Template Name */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1
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
                            minWidth: 32,
                            height: 22,
                            borderRadius: 1,
                            backgroundColor: 'rgba(146, 0, 32, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ml: 1,
                            px: 0.75
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                color: 'primary.main',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {template.total_events || 0} Events
                        </Typography>
                    </Box>
                </Box>

                {/* Mini Calendar Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: 0.5,
                        mb: 0.75
                    }}
                >
                    {days.map((day, index) => {
                        const hasEvents = activeDays.includes(index);

                        return (
                            <Box
                                key={day}
                                sx={{
                                    aspectRatio: '1',
                                    borderRadius: 1,
                                    backgroundColor: hasEvents
                                        ? 'rgba(146, 0, 32, 0.15)'
                                        : 'rgba(188, 186, 179, 0.15)',
                                    border: '1.5px solid',
                                    borderColor: hasEvents
                                        ? 'rgba(146, 0, 32, 0.4)'
                                        : 'rgba(188, 186, 179, 0.3)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.6rem',
                                        fontWeight: hasEvents ? 700 : 500,
                                        color: hasEvents ? 'primary.main' : 'text.disabled'
                                    }}
                                >
                                    {day[0]}
                                </Typography>
                            </Box>
                        );
                    })}
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

WeekTemplate.propTypes = {
    template: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        day_count: PropTypes.number,
        active_days: PropTypes.arrayOf(PropTypes.number),
        total_events: PropTypes.number
    }).isRequired,
    compact: PropTypes.bool,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func
};

WeekTemplate.defaultProps = {
    compact: false,
    onDragStart: null,
    onDragEnd: null
};

export default WeekTemplate;
