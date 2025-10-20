import React, { useMemo, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import PropTypes from 'prop-types';
import useDashboardStore from '../../../store/dashboardStore';
import { EventDot, EventBlock } from './EventDisplay';
import { alpha } from '@mui/material/styles';
import { shallow } from 'zustand/shallow';

const noop = () => {};

const FALLBACK_DASHBOARD_STATE = {
    storeMode: 'calendar-focus',
    selectedSiteId: null,
    currentMonth: null,
    setCurrentMonth: noop,
    switchMode: noop,
    updateLastInteraction: noop,
    selectSite: noop
};

const CalendarGrid = ({ events, sites, onDayClick, forceExtendedMode = false }) => {
    const dashboardSliceSelector = forceExtendedMode
        ? () => FALLBACK_DASHBOARD_STATE
        : (state) => ({
              storeMode: state.mode,
              selectedSiteId: state.selectedSiteId,
              currentMonth: state.currentMonth,
              setCurrentMonth: state.setCurrentMonth,
              switchMode: state.switchMode,
              updateLastInteraction: state.updateLastInteraction,
              selectSite: state.selectSite
          });

    const dashboardState = useDashboardStore(dashboardSliceSelector, shallow);

    const [localMonth, setLocalMonth] = useState(() => new Date());

    const mode = forceExtendedMode ? 'calendar-focus' : dashboardState.storeMode;
    const selectedSiteId = forceExtendedMode ? null : dashboardState.selectedSiteId;
    const currentMonth = forceExtendedMode && !dashboardState.currentMonth
        ? localMonth
        : dashboardState.currentMonth ?? localMonth;
    const setCurrentMonth = forceExtendedMode ? setLocalMonth : dashboardState.setCurrentMonth;
    const switchMode = forceExtendedMode ? noop : dashboardState.switchMode;
    const updateLastInteraction = forceExtendedMode ? noop : dashboardState.updateLastInteraction;
    const selectSite = forceExtendedMode ? noop : dashboardState.selectSite;

    console.log('(DEBUGLOG) CalendarGrid.render', {
        mode,
        storeMode: dashboardState.storeMode,
        selectedSiteId,
        eventsCount: events?.length ?? 0,
        sitesCount: sites?.length ?? 0,
        forceExtendedMode
    });

    const handleDayClick = (date) => {
        // Auto-switch to Calendar Power mode when clicking a day
        if (mode === 'site-focus') {
            switchMode('calendar-focus', 'day-click');
        }
        updateLastInteraction();
        onDayClick(date);
    };

    const handleMonthChange = (direction) => {
        const newMonth = moment(currentMonth).add(direction, 'month').toDate();
        setCurrentMonth(newMonth);
        updateLastInteraction();
        // Navigation does NOT trigger mode switch
    };

    const calendarDays = useMemo(() => {
        const startOfMonth = moment(currentMonth).startOf('month');
        const endOfMonth = moment(currentMonth).endOf('month');
        const startDate = startOfMonth.clone().startOf('week');
        const endDate = endOfMonth.clone().endOf('week');

        const days = [];
        let day = startDate.clone();

        while (day.isBefore(endDate)) {
            days.push(day.clone());
            day.add(1, 'day');
        }

        return days;
    }, [currentMonth]);

    const eventsByDate = useMemo(() => {
        const map = new Map();
        events.forEach(event => {
            const dateKey = moment(event.date).format('YYYY-MM-DD');
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey).push(event);
        });
        return map;
    }, [events]);

    const isPowerMode = mode === 'calendar-focus';
    const currentMonthMoment = moment(currentMonth);
    const showSiteButtons = mode !== 'site-focus';

    const primarySites = useMemo(() => (sites || []).slice(0, 3), [sites]);
    const secondarySites = useMemo(() => (sites || []).slice(3, 6), [sites]);

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
                    onClick={() => selectSite(site.id)}
                    sx={{
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 999,
                        cursor: 'pointer',
                        minWidth: 90,
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 500,
                        letterSpacing: 0.2,
                        backgroundColor: isSelected ? alpha(siteColor, 0.18) : alpha(siteColor, 0.05),
                        color: isSelected ? siteColor : 'text.secondary',
                        border: `1px solid ${alpha(siteColor, isSelected ? 0.45 : 0.16)}`,
                        transition: 'all 200ms ease',
                        '&:hover': {
                            backgroundColor: alpha(siteColor, 0.16),
                            color: siteColor
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
                        borderRadius: 12,
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
                        {showSiteButtons
                            ? primarySites.map((site) => renderSiteChip(site))
                            : null}
                    </AnimatePresence>
                </Box>

                <Box
                    sx={{
                        flex: '0 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, letterSpacing: 0.4 }}
                    >
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
                        {showSiteButtons
                            ? secondarySites.map((site) => renderSiteChip(site))
                            : null}
                    </AnimatePresence>
                </Box>

                <IconButton
                    onClick={() => handleMonthChange(1)}
                    size="small"
                    sx={{
                        borderRadius: 12,
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
                    gap: 0.75,
                    p: isPowerMode ? 0.5 : 0.5,
                    flex: 1,
                    minHeight: 0
                }}
            >
                {/* Day headers */}
                {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map(day => (
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

                {/* Calendar cells */}
                {calendarDays.map(day => {
                    const dateKey = day.format('YYYY-MM-DD');
                    const dayEvents = eventsByDate.get(dateKey) || [];
                    const isCurrentMonth = day.month() === currentMonthMoment.month();
                    const isToday = day.isSame(moment(), 'day');
                    const isDimmed = selectedSiteId && !dayEvents.some(event => event.site_id === selectedSiteId);

                    return (
                        <motion.div
                            key={dateKey}
                            layout
                            transition={{ duration: 0.2 }}
                        >
                            <Box
                                onClick={() => handleDayClick(day.toDate())}
                                sx={{
                                    border: '1px solid',
                                    borderColor: isToday ? 'primary.main' : 'rgba(146, 0, 32, 0.12)',
                                    borderRadius: 2,
                                    p: isPowerMode ? 0.85 : 0.65,
                                    minHeight: isPowerMode ? 112 : 58,
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
                                        color: isToday ? 'primary.main' : 'text.primary'
                                    }}
                                >
                                    {day.date()}
                                </Typography>

                                {isPowerMode ? (
                                    // Block view
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {dayEvents.slice(0, 3).map(event => (
                                            <EventBlock
                                                key={event.id}
                                                event={event}
                                                isSelectedSite={!selectedSiteId || event.site_id === selectedSiteId}
                                                siteColor={event.site_color || 'rgb(146, 0, 32)'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Event clicked:', event);
                                                }}
                                            />
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '10px',
                                                    color: 'text.secondary',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                +{dayEvents.length - 3} więcej
                                            </Typography>
                                        )}
                                    </Box>
                                ) : (
                                    // Dot view
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 0.5,
                                            alignItems: 'center'
                                        }}
                                    >
                                        {dayEvents.slice(0, 4).map(event => (
                                            <EventDot
                                                key={event.id}
                                                event={event}
                                                siteColor={event.site_color || 'rgb(146, 0, 32)'}
                                            />
                                        ))}
                                        {dayEvents.length > 4 && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '10px',
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                +{dayEvents.length - 4}
                                            </Typography>
                                        )}
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

CalendarGrid.propTypes = {
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
    ),
    onDayClick: PropTypes.func,
    forceExtendedMode: PropTypes.bool
};

CalendarGrid.defaultProps = {
    sites: [],
    onDayClick: () => {},
    forceExtendedMode: false
};

export default CalendarGrid;
