import React, { useMemo, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { EventBlock, CollapsedEventsBlock, COLLAPSE_THRESHOLD } from './EventDisplay';
import { getSiteColorHex } from '../../../../theme/siteColors';
import TemplateConfirmationModal from '../Templates/TemplateConfirmationModal';

// Controlled-only view of the calendar grid; all state comes from props.
const CalendarGridControlled = ({
    events,
    sites,
    selectedSiteId,
    currentMonth,
    onDayClick,
    onMonthChange,
    onSiteSelect
}) => {
    const [hoveredEventId, setHoveredEventId] = useState(null);
    const [hoveredEventDayKey, setHoveredEventDayKey] = useState(null); // Track which day the hovered event is in
    const [hoveredDayKey, setHoveredDayKey] = useState(null); // Track which day is being hovered
    const [draggedOverDay, setDraggedOverDay] = useState(null); // Track day being dragged over
    const [isDragging, setIsDragging] = useState(false); // Track if dragging is active
    const [isOverMonthName, setIsOverMonthName] = useState(false); // Track if dragging over month name
    const [draggedTemplate, setDraggedTemplate] = useState(null); // Track the template being dragged
    const [draggedTemplateType, setDraggedTemplateType] = useState(null); // Track template type explicitly
    
    // Template confirmation modal state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingTemplate, setPendingTemplate] = useState(null);
    const [pendingTargetDate, setPendingTargetDate] = useState(null);

    const currentMonthMoment = useMemo(() => moment(currentMonth), [currentMonth]);

    const calendarDays = useMemo(() => {
        const startOfMonth = currentMonthMoment.clone().startOf('month');
        const endOfMonth = currentMonthMoment.clone().endOf('month');
        const startDate = startOfMonth.clone().startOf('week');
        const endDate = endOfMonth.clone().endOf('week');

        const days = [];
        const cursor = startDate.clone();
        while (cursor.isSameOrBefore(endDate)) {
            days.push(cursor.clone());
            cursor.add(1, 'day');
        }
        return days;
    }, [currentMonthMoment]);
    
    // Calculate number of rows needed (for 6-row months like November 2025)
    const numberOfRows = useMemo(() => {
        return Math.ceil(calendarDays.length / 7);
    }, [calendarDays]);

    const eventsByDate = useMemo(() => {
        const map = new Map();
        events.forEach((event) => {
            const dateKey = moment(event.date).format('YYYY-MM-DD');
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey).push(event);
        });
        return map;
    }, [events]);

    const primarySites = useMemo(() => (sites || []).slice(0, 3), [sites]);
    const secondarySites = useMemo(() => (sites || []).slice(3, 6), [sites]);

    const handleMonthChange = (direction) => {
        const newMonth = currentMonthMoment.clone().add(direction, 'month').toDate();
        onMonthChange?.(newMonth);
    };

    const handleSiteToggle = (siteId) => {
        const nextSelection = selectedSiteId === siteId ? null : siteId;
        onSiteSelect?.(nextSelection);
    };

    const renderSiteChip = (site) => {
        // Use the same color system as SiteTile
        const siteColor = getSiteColorHex(site.color_index ?? 0);
        const isSelected = selectedSiteId === site.id;

        return (
            <motion.div
                key={site.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
                <Box
                    onClick={() => handleSiteToggle(site.id)}
                    sx={{
                        px: 1.75,
                        py: 0.85,
                        borderRadius: 3,
                        cursor: 'pointer',
                        minWidth: 90,
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 500,
                        letterSpacing: 0.2,
                        backgroundColor: isSelected ? siteColor : alpha(siteColor, 0.12),
                        color: isSelected ? '#fff' : siteColor,
                        border: `2px solid ${alpha(siteColor, isSelected ? 1 : 0.34)}`,
                        transition: 'all 200ms ease',
                        '&:hover': {
                            backgroundColor: isSelected ? siteColor : alpha(siteColor, 0.25),
                            color: isSelected ? '#fff' : siteColor,
                            borderColor: alpha(siteColor, 0.65),
                            transform: 'translateY(-1px)'
                        }
                    }}
                >
                    {site.name}
                </Box>
            </motion.div>
        );
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                position: 'relative',
                '@keyframes pulse': {
                    '0%, 100%': {
                        boxShadow: '0 0 0 0 rgba(146, 0, 32, 0.4)'
                    },
                    '50%': {
                        boxShadow: '0 0 0 8px rgba(146, 0, 32, 0)'
                    }
                },
                '@keyframes monthGlow': {
                    '0%, 100%': {
                        boxShadow: '0 0 15px rgba(146, 0, 32, 0.4)',
                        transform: 'scale(1.03)'
                    },
                    '50%': {
                        boxShadow: '0 0 30px rgba(146, 0, 32, 0.7)',
                        transform: 'scale(1.08)'
                    }
                }
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: { xs: 1.5, md: 2 },
                    py: { xs: 1, md: 1.5 },
                    mb: 0,
                    borderBottom: '1px solid rgba(146, 0, 32, 0.08)'
                }}
            >
                <IconButton
                    onClick={() => handleMonthChange(-1)}
                    size="small"
                    sx={{
                        borderRadius: 2,
                        backgroundColor: 'rgba(146, 0, 32, 0.08)',
                        '&:hover': { backgroundColor: 'rgba(146, 0, 32, 0.16)' }
                    }}
                >
                    <ChevronLeft fontSize="small" />
                </IconButton>

                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 1,
                        minHeight: 38
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {primarySites.map(renderSiteChip)}
                    </AnimatePresence>
                </Box>

                <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            setIsOverMonthName(true);
                        }}
                        onDragLeave={() => {
                            setIsOverMonthName(false);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsOverMonthName(false);
                            const templateType = e.dataTransfer.getData('templateType');
                            const templateId = e.dataTransfer.getData('templateId');
                            const templateData = JSON.parse(e.dataTransfer.getData('templateData'));
                            
                            console.log('Apply template to entire month:', {
                                month: currentMonthMoment.format('MMMM YYYY'),
                                templateType,
                                templateId,
                                templateData
                            });
                            
                            // TODO: Show confirmation modal for month-wide application
                        }}
                        sx={{
                            px: 2.5,
                            py: 1,
                            borderRadius: 2,
                            transition: 'all 250ms ease',
                            backgroundColor: isOverMonthName ? 'rgba(146, 0, 32, 0.12)' : 'transparent',
                            border: isOverMonthName ? '2px dashed' : '2px solid transparent',
                            borderColor: isOverMonthName ? 'primary.main' : 'transparent',
                            ...(draggedTemplate && {
                                animation: 'monthGlow 2s ease-in-out infinite',
                                cursor: 'pointer'
                            }),
                            ...(isOverMonthName && {
                                animation: 'none',
                                transform: 'scale(1.05)',
                                boxShadow: '0 0 20px rgba(146, 0, 32, 0.3)'
                            })
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 600, 
                                letterSpacing: 0.4,
                                color: (isOverMonthName || draggedTemplate) ? 'primary.main' : 'text.primary',
                                transition: 'color 250ms ease'
                            }}
                        >
                            {currentMonthMoment.format('MMMM YYYY')}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 1,
                        minHeight: 38
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {secondarySites.map(renderSiteChip)}
                    </AnimatePresence>
                </Box>

                <IconButton
                    onClick={() => handleMonthChange(1)}
                    size="small"
                    sx={{
                        borderRadius: 2,
                        backgroundColor: 'rgba(146, 0, 32, 0.08)',
                        '&:hover': { backgroundColor: 'rgba(146, 0, 32, 0.16)' }
                    }}
                >
                    <ChevronRight fontSize="small" />
                </IconButton>
            </Box>

            {/* Day names header - separate from grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: { xs: 0.5, sm: 0.75 }, // Match calendar grid gap
                    px: { xs: 0.5, sm: 1 }, // Match calendar grid padding
                    pt: 0.75,
                    pb: 1
                }}
            >
                {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map((day) => (
                    <Box
                        key={day}
                        sx={{
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: { xs: '14px', sm: '16px' }, // Responsive font size
                            color: 'text.secondary'
                        }}
                    >
                        {day}
                    </Box>
                ))}
            </Box>

            {/* Calendar grid */}
            <Box
                onDragLeave={(e) => {
                    // Clear template when leaving calendar entirely
                    const relatedTarget = e.relatedTarget;
                    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
                        setDraggedTemplate(null);
                        setDraggedTemplateType(null);
                        setDraggedOverDay(null);
                    }
                }}
                onDrop={() => {
                    // Clear template on drop
                    setDraggedTemplate(null);
                    setDraggedTemplateType(null);
                }}
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridAutoRows: numberOfRows === 6 ? 'minmax(90px, 1fr)' : 'minmax(110px, 1fr)', // Scale down for 6 rows
                    gap: { xs: 0.5, sm: 0.75 }, // Responsive gap
                    px: { xs: 0.5, sm: 1 }, // Responsive padding
                    pb: 1,
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden'
                }}
            >
                {calendarDays.map((dayMoment) => {
                    const dateKey = dayMoment.format('YYYY-MM-DD');
                    const dayEvents = eventsByDate.get(dateKey) || [];
                    const isCurrentMonth = dayMoment.month() === currentMonthMoment.month();
                    const isToday = dayMoment.isSame(moment(), 'day');
                    const isPast = dayMoment.isBefore(moment(), 'day');
                    const isDimmed = selectedSiteId && !dayEvents.some((event) => event.site_id === selectedSiteId);
                    
                    // Determine if this day is crowded (events won't fit at normal size)
                    const eventCount = dayEvents.length;
                    const isDayCrowded = eventCount >= 4;
                    const shouldCollapse = eventCount >= COLLAPSE_THRESHOLD;

                    // Past days with no events should not be clickable
                    const isClickable = !isPast || eventCount > 0;
                    
                    // Day hover should be blocked when hovering an event
                    const isDayHovered = hoveredDayKey === dateKey && !hoveredEventId;
                    const isBeingDraggedOver = draggedOverDay === dateKey;
                    
                    // Week template logic
                    const isWeekTemplate = draggedTemplateType === 'week';
                    const currentWeekStart = moment().startOf('isoWeek'); // Monday of current week
                    
                    // Check if this day is part of the hovered week (for week templates)
                    const isInHoveredWeek = isWeekTemplate && draggedOverDay && 
                        dayMoment.isBetween(
                            moment(draggedOverDay).startOf('isoWeek'),
                            moment(draggedOverDay).endOf('isoWeek'),
                            'day',
                            '[]'
                        );
                    
                    // Determine if this day should be grayed out for week templates
                    let isGrayedOut = false;
                    let isInTemplateWeek = false;
                    
                    if (isWeekTemplate && draggedOverDay) {
                        const hoveredDayMoment = moment(draggedOverDay);
                        const hoveredWeekStart = hoveredDayMoment.clone().startOf('isoWeek'); // Monday
                        const hoveredWeekEnd = hoveredDayMoment.clone().endOf('isoWeek'); // Sunday
                        
                        isInTemplateWeek = dayMoment.isBetween(hoveredWeekStart, hoveredWeekEnd, 'day', '[]');
                        
                        if (isInTemplateWeek) {
                            const templateActiveDays = draggedTemplate.active_days || [0, 1, 2, 3, 4, 5, 6]; // Default all days
                            const dayOfWeek = dayMoment.day(); // 0 = Sunday, 1 = Monday, etc.
                            const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0 = Monday
                            
                            // Gray out if not in active days
                            if (!templateActiveDays.includes(adjustedDayOfWeek)) {
                                isGrayedOut = true;
                            }
                            
                            // Gray out if in next month
                            if (!isCurrentMonth) {
                                isGrayedOut = true;
                            }
                            
                            // Gray out past days (except current week)
                            if (isPast && !hoveredWeekStart.isSame(currentWeekStart, 'week')) {
                                isGrayedOut = true;
                            }
                        }
                    }
                    
                    // For day templates, gray out past days
                    if (!isWeekTemplate && draggedTemplate && isPast && !isToday) {
                        isGrayedOut = true;
                    }

                    const handleDragOver = (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        
                        const templateType = e.dataTransfer.getData('templateType');
                        const templateDataStr = e.dataTransfer.getData('templateData');

                        if (templateType) {
                            setDraggedTemplateType(templateType);
                        }

                        // Parse template data to determine type (only set once)
                        if (!draggedTemplate && templateDataStr) {
                            try {
                                const templateData = JSON.parse(templateDataStr);
                                setDraggedTemplate({ ...templateData, type: templateType });
                            } catch (err) {
                                console.error('Failed to parse template data:', err);
                            }
                        }
                        
                        setDraggedOverDay(dateKey);
                    };

                    const handleDragLeave = (e) => {
                        // Don't clear draggedOverDay here - let the grid-level handler do it
                        // This prevents flickering when dragging across days
                    };

                    const handleDrop = (e) => {
                        e.preventDefault();
                        const templateType = e.dataTransfer.getData('templateType');
                        const templateId = e.dataTransfer.getData('templateId');
                        const templateData = JSON.parse(e.dataTransfer.getData('templateData'));
                        
                        console.log('Template dropped on day:', {
                            date: dateKey,
                            templateType,
                            templateId,
                            templateData
                        });
                        
                        // Open confirmation modal
                        setPendingTemplate(templateData);
                        setPendingTargetDate(dateKey);
                        setConfirmModalOpen(true);
                        setDraggedOverDay(null);
                        setDraggedTemplate(null);
                        setDraggedTemplateType(null);
                    };

                    return (
                        <motion.div key={dateKey} layout transition={{ duration: 0.2 }} style={{ minHeight: 0 }}>
                            <Box
                                onClick={isClickable ? () => onDayClick?.(dayMoment.toDate()) : undefined}
                                onMouseEnter={() => setHoveredDayKey(dateKey)}
                                onMouseLeave={() => setHoveredDayKey(null)}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                sx={{
                                    border: isToday ? '2px solid' : '1px solid',
                                    borderColor: (isBeingDraggedOver || isInHoveredWeek)
                                        ? 'primary.main' 
                                        : isToday 
                                            ? 'primary.main' 
                                            : 'rgba(146, 0, 32, 0.12)',
                                    borderRadius: 2,
                                    p: isToday ? 0.75 : 0.85,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: isPast && !isCurrentMonth 
                                        ? 'rgba(228, 229, 218, 0.25)'
                                        : isPast 
                                            ? 'rgba(228, 229, 218, 0.15)'
                                            : isCurrentMonth 
                                                ? 'background.paper' 
                                                : 'rgba(228, 229, 218, 0.35)',
                                    cursor: isClickable ? 'pointer' : 'default',
                                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                                    opacity: isDimmed ? 0.45 : 1,
                                    overflow: 'visible', // Allow events to expand on hover
                                    position: 'relative',
                                    ...(isGrayedOut && {
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(128, 128, 128, 0.5)',
                                            pointerEvents: 'none',
                                            zIndex: 10
                                        }
                                    }),
                                    ...((isBeingDraggedOver || isInHoveredWeek) && !isGrayedOut && {
                                        borderStyle: 'dashed',
                                        borderWidth: '2px',
                                        backgroundColor: 'rgba(146, 0, 32, 0.05)',
                                        animation: isBeingDraggedOver ? 'pulse 1.5s ease-in-out infinite' : 'none'
                                    }),
                                    ...(isToday && {
                                        boxShadow: '0 0 12px rgba(146, 0, 32, 0.25), 0 0 24px rgba(146, 0, 32, 0.1)',
                                    }),
                                    ...(isDayHovered && isClickable && {
                                        backgroundColor: 'rgba(146, 0, 32, 0.05)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    })
                                }}
                            >
                                {/* Day number - unified with day tile hover */}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: isToday ? 700 : 600,
                                        mb: 0.25, // Reduced from 0.5 to save space
                                        fontSize: '15px',
                                        color: isToday ? 'primary.main' : 'text.primary',
                                        flexShrink: 0,
                                        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        zIndex: 5,
                                        pointerEvents: 'none', // Let parent handle clicks
                                        transformOrigin: 'center center', // Expand from center
                                        ...(isToday && {
                                            textShadow: '0 0 8px rgba(146, 0, 32, 0.3)',
                                        }),
                                        ...(isDayHovered && isClickable && {
                                            color: 'primary.main',
                                            fontSize: '16px', // Slightly bigger on hover
                                        })
                                    }}
                                >
                                    {dayMoment.date()}
                                </Typography>

                                {shouldCollapse ? (
                                    // Collapsed view for 10+ events
                                    <Box sx={{ 
                                        flex: 1, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        position: 'relative', 
                                        zIndex: 1,
                                        pointerEvents: 'auto'
                                    }}>
                                        <CollapsedEventsBlock
                                            eventCount={eventCount}
                                            siteColors={dayEvents.map(e => e.site_color).filter(Boolean)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDayClick?.(dayMoment.toDate());
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    // Smart scaling view for 1-7 events
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: eventCount <= 3 ? 0.5 : eventCount <= 5 ? 0.375 : 0.3,
                                        flex: 1, 
                                        overflow: 'visible', // Allow events to expand on hover
                                        position: 'relative',
                                        zIndex: 1,
                                        // For 0-1 events, allow parent hover to work in empty areas
                                        pointerEvents: eventCount <= 1 ? 'none' : 'auto'
                                    }}>
                                        {dayEvents.map((event, index) => {
                                            const isHovered = hoveredEventId === event.id;
                                            // Only shrink events in the SAME day as the hovered event
                                            const shouldShrink = hoveredEventId && !isHovered && hoveredEventDayKey === dateKey;
                                            const isFiltered = !selectedSiteId || event.site_id === selectedSiteId;

                                            return (
                                                <motion.div
                                                    key={event.id}
                                                    animate={{
                                                        scale: shouldShrink ? 0.92 : 1,
                                                        opacity: shouldShrink ? 0.7 : 1
                                                    }}
                                                    transition={{ 
                                                        duration: 0.25, 
                                                        ease: [0.25, 0.1, 0.25, 1]
                                                    }}
                                                    style={{ 
                                                        zIndex: isHovered ? 50 : 10 + index,
                                                        position: 'relative',
                                                        pointerEvents: 'auto', // Re-enable pointer events for the actual event block
                                                        overflow: 'visible' // Allow hover expansion to go outside
                                                    }}
                                                    onMouseEnter={() => {
                                                        setHoveredEventId(event.id);
                                                        setHoveredEventDayKey(dateKey);
                                                    }}
                                                    onMouseLeave={() => {
                                                        setHoveredEventId(null);
                                                        setHoveredEventDayKey(null);
                                                    }}
                                                >
                                                    <EventBlock
                                                        event={event}
                                                        isSelectedSite={isFiltered}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        eventCount={eventCount}
                                                        isHovered={isHovered}
                                                        isDayCrowded={isDayCrowded}
                                                    />
                                                </motion.div>
                                            );
                                        })}
                                    </Box>
                                )}
                            </Box>
                        </motion.div>
                    );
                })}
            </Box>
            
            {/* Template Confirmation Modal */}
            <TemplateConfirmationModal
                open={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setPendingTemplate(null);
                    setPendingTargetDate(null);
                }}
                onConfirm={() => {
                    // TODO: Apply template logic
                    console.log('Applying template:', {
                        template: pendingTemplate,
                        targetDate: pendingTargetDate,
                        affectedEvents: eventsByDate.get(pendingTargetDate) || []
                    });
                    setConfirmModalOpen(false);
                    setPendingTemplate(null);
                    setPendingTargetDate(null);
                }}
                template={pendingTemplate}
                targetDate={pendingTargetDate}
                affectedEvents={pendingTargetDate ? (eventsByDate.get(pendingTargetDate) || []) : []}
            />
        </Box>
    );
};

CalendarGridControlled.propTypes = {
    events: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            date: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            site_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            site_color: PropTypes.string
        })
    ).isRequired,
    sites: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            color_tag: PropTypes.string
        })
    ).isRequired,
    selectedSiteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currentMonth: PropTypes.instanceOf(Date).isRequired,
    onDayClick: PropTypes.func,
    onMonthChange: PropTypes.func,
    onSiteSelect: PropTypes.func
};

CalendarGridControlled.defaultProps = {
    selectedSiteId: null,
    onDayClick: () => {},
    onMonthChange: () => {},
    onSiteSelect: () => {}
};

export default CalendarGridControlled;
