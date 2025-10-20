import React, { useMemo, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { EventDot, EventBlock } from './EventDisplay';

// Controlled-only view of the calendar grid; all state comes from props.
const CalendarGridControlled = ({
    events,
    sites,
    mode,
    selectedSiteId,
    currentMonth,
    onDayClick,
    onMonthChange,
    onSiteSelect
}) => {
    const [hoveredDayEvents, setHoveredDayEvents] = useState([]);

    const currentMonthMoment = useMemo(() => moment(currentMonth), [currentMonth]);
    const isPowerMode = mode === 'calendar-focus';
    const showSiteButtons = mode !== 'site-focus';

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
        const siteColor = site.color_tag || 'rgb(146, 0, 32)';
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
                        borderRadius: 2,
                        cursor: 'pointer',
                        minWidth: 90,
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 500,
                        letterSpacing: 0.2,
                        backgroundColor: isSelected ? siteColor : alpha(siteColor, 0.12),
                        color: isSelected ? '#fff' : 'text.secondary',
                        border: `2px solid ${alpha(siteColor, isSelected ? 1 : 0.34)}`,
                        transition: 'all 200ms ease',
                        '&:hover': {
                            backgroundColor: isSelected ? siteColor : alpha(siteColor, 0.25),
                            color: isSelected ? '#fff' : 'text.primary',
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
                position: 'relative'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: { xs: 1.5, md: 2 },
                    py: { xs: 0.75, md: 1 },
                    mb: isPowerMode ? 1.25 : 0.5,
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
                        {showSiteButtons ? primarySites.map(renderSiteChip) : null}
                    </AnimatePresence>
                </Box>

                <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: 0.4 }}>
                        {currentMonthMoment.format('MMMM YYYY')}
                    </Typography>
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
                        {showSiteButtons ? secondarySites.map(renderSiteChip) : null}
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

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridAutoRows: isPowerMode ? 'minmax(120px, 1fr)' : 'minmax(58px, 1fr)',
                    gap: 0.75,
                    p: 0.5,
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto'
                }}
            >
                {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map((day) => (
                    <Box
                        key={day}
                        sx={{
                            textAlign: 'center',
                            fontWeight: 600,
                            pb: isPowerMode ? 0.6 : 0,
                            fontSize: isPowerMode ? '16px' : '15px',
                            color: 'text.secondary'
                        }}
                    >
                        {day}
                    </Box>
                ))}

                {calendarDays.map((dayMoment) => {
                    const dateKey = dayMoment.format('YYYY-MM-DD');
                    const dayEvents = eventsByDate.get(dateKey) || [];
                    const isCurrentMonth = dayMoment.month() === currentMonthMoment.month();
                    const isToday = dayMoment.isSame(moment(), 'day');
                    const isDimmed = selectedSiteId && !dayEvents.some((event) => event.site_id === selectedSiteId);

                    const MAX_VISIBLE_EVENTS = 3;
                    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
                    const hasMore = dayEvents.length > MAX_VISIBLE_EVENTS;

                    return (
                        <motion.div key={dateKey} layout transition={{ duration: 0.2 }} style={{ minHeight: 0 }}>
                            <Box
                                onClick={() => onDayClick?.(dayMoment.toDate())}
                                onMouseEnter={() => setHoveredDayEvents(dayEvents.map((event) => event.id))}
                                onMouseLeave={() => setHoveredDayEvents([])}
                                sx={{
                                    border: '1px solid',
                                    borderColor: isToday ? 'primary.main' : 'rgba(146, 0, 32, 0.12)',
                                    borderRadius: 2,
                                    p: isPowerMode ? 0.85 : 0.65,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: isCurrentMonth ? 'background.paper' : 'rgba(228, 229, 218, 0.35)',
                                    cursor: 'pointer',
                                    transition: 'all 200ms',
                                    opacity: isDimmed ? 0.45 : 1,
                                    '&:hover': {
                                        backgroundColor: 'rgba(146, 0, 32, 0.05)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: isToday ? 700 : 600,
                                        mb: isPowerMode ? 0.75 : 0.35,
                                        fontSize: isPowerMode ? '15px' : '12.5px',
                                        color: isToday ? 'primary.main' : 'text.primary',
                                        flexShrink: 0
                                    }}
                                >
                                    {dayMoment.date()}
                                </Typography>

                                {isPowerMode ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, overflow: 'hidden' }}>
                                        {visibleEvents.map((event, index) => {
                                            const isHovered = hoveredDayEvents.includes(event.id);
                                            const shouldShrink = hoveredDayEvents.length > 0 && !isHovered;

                                            return (
                                                <motion.div
                                                    key={event.id}
                                                    animate={{
                                                        scale: shouldShrink ? 0.92 : 1,
                                                        opacity: shouldShrink ? 0.6 : 1
                                                    }}
                                                    transition={{ duration: 0.15 }}
                                                    style={{ zIndex: isHovered ? 10 : index }}
                                                >
                                                    <EventBlock
                                                        event={event}
                                                        isSelectedSite={!selectedSiteId || event.site_id === selectedSiteId}
                                                        siteColor={event.site_color || 'rgb(146, 0, 32)'}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                    />
                                                </motion.div>
                                            );
                                        })}
                                        {hasMore && (
                                            <Typography
                                                variant="caption"
                                                sx={{ fontSize: '10px', color: 'text.secondary', textAlign: 'center', mt: 0.5, flexShrink: 0 }}
                                            >
                                                +{dayEvents.length - MAX_VISIBLE_EVENTS} więcej
                                            </Typography>
                                        )}
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {dayEvents.slice(0, 6).map((event) => (
                                            <EventDot key={event.id} event={event} siteColor={event.site_color || 'rgb(146, 0, 32)'} />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </motion.div>
                    );
                })}
            </Box>
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
    mode: PropTypes.oneOf(['site-focus', 'calendar-focus']).isRequired,
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
