import React, { useState } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { getSiteColorHex } from '../../../../theme/siteColors';

const DayTemplate = ({ template, compact, onDragStart, onDragEnd, isCollapsed }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e) => {
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('templateType', 'day');
        e.dataTransfer.setData('templateId', template.id);
        e.dataTransfer.setData('templateData', JSON.stringify(template));
        onDragStart?.({ ...template, type: 'day' }); // Include type in callback
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
            style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                transformOrigin: 'center',
                overflow: 'visible'
            }}
        >
            <Card
                sx={{
                    width: '100%',
                    mx: 0.25,
                    p: 1.25,
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'rgba(146, 0, 32, 0.12)',
                    boxShadow: 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'visible',
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
                            minWidth: 32,
                            height: 22,
                            borderRadius: 1,
                            backgroundColor: 'rgba(146, 0, 32, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ml: 1,
                            px: 0.5
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

                {/* Event and Availability List - styled like calendar blocks (hidden when collapsed) */}
                {!isCollapsed && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    {/* Combine events and availability blocks, then slice first 3 */}
                    {[
                        ...(template.events || []).map(event => ({ ...event, isAvailability: false })),
                        ...(template.availability_blocks || []).map(block => ({ ...block, isAvailability: true }))
                    ]
                    .sort((a, b) => a.start_time?.localeCompare(b.start_time))
                    .slice(0, 3)
                    .map((item, idx) => {
                        // Get site color - prioritize site_color, fallback to color_index, then use red as default
                        const siteColor = item.site_color || 
                                         (item.site?.color_index !== undefined ? getSiteColorHex(item.site.color_index) : null) ||
                                         getSiteColorHex(0); // Default to red
                        
                        // Different styling for availability blocks - match DayDetailsModal colors
                        const bgColor = item.isAvailability ? 'rgba(76, 175, 80, 0.15)' : alpha(siteColor, 0.15);
                        const borderColor = item.isAvailability ? 'rgba(76, 175, 80, 0.4)' : siteColor;
                        const borderStyle = item.isAvailability ? '2px dashed' : '2px solid';

                        return (
                            <Box
                                key={`${item.isAvailability ? 'avail' : 'event'}-${idx}`}
                                sx={{
                                    height: 20,
                                    px: 0.75,
                                    py: 0.4,
                                    borderRadius: 1.5,
                                    border: item.isAvailability ? `${borderStyle} ${borderColor}` : 'none',
                                    borderLeft: item.isAvailability ? `${borderStyle} ${borderColor}` : `2px solid ${borderColor}`,
                                    backgroundColor: bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    transition: 'all 200ms ease',
                                    position: 'relative'
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: '10px',
                                        color: item.isAvailability ? 'rgba(76, 175, 80, 0.85)' : borderColor,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        flex: 1,
                                        lineHeight: 1.1,
                                        fontStyle: item.isAvailability ? 'italic' : 'normal'
                                    }}
                                >
                                    <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                                        {item.start_time?.substring(0, 5) || item.start_time}
                                    </Box>
                                    {item.isAvailability ? 'Dostępność' : (item.title || 'Event')}
                                </Typography>
                                
                                {/* Site color circle for availability blocks */}
                                {item.isAvailability && (
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: siteColor,
                                            flexShrink: 0
                                        }}
                                    />
                                )}
                            </Box>
                        );
                    })}
                    {((template.events?.length || 0) + (template.availability_blocks?.length || 0)) > 3 && (
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
                            +{(template.events?.length || 0) + (template.availability_blocks?.length || 0) - 3} więcej
                        </Typography>
                    )}
                </Box>
                )}

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
                end_time: PropTypes.string,
                title: PropTypes.string,
                site_color: PropTypes.string
            })
        ),
        availability_blocks: PropTypes.arrayOf(
            PropTypes.shape({
                start_time: PropTypes.string,
                end_time: PropTypes.string,
                site_color: PropTypes.string
            })
        )
    }).isRequired,
    compact: PropTypes.bool,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func
};

DayTemplate.defaultProps = {
    compact: false,
    onDragStart: null,
    onDragEnd: null
};

export default DayTemplate;
