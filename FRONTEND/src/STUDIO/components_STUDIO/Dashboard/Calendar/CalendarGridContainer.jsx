import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import useDashboardStore from '../../../store/dashboardStore';
import CalendarGridControlled from './CalendarGridControlled';

// Connects the controlled calendar grid with the Zustand dashboard store.
const CalendarGridContainer = ({ events, sites, onDayClick }) => {
    const mode = useDashboardStore((state) => state.mode);
    const selectedSiteId = useDashboardStore((state) => state.selectedSiteId);
    const currentMonth = useDashboardStore((state) => state.currentMonth);
    const setCurrentMonth = useDashboardStore((state) => state.setCurrentMonth);
    const switchMode = useDashboardStore((state) => state.switchMode);
    const updateLastInteraction = useDashboardStore((state) => state.updateLastInteraction);
    const selectSite = useDashboardStore((state) => state.selectSite);

    const handleDayClick = useCallback(
        (date) => {
            if (mode === 'site-focus') {
                switchMode('calendar-focus', 'day-click');
            }
            updateLastInteraction();
            onDayClick?.(date);
        },
        [mode, onDayClick, switchMode, updateLastInteraction]
    );

    const handleMonthChange = useCallback(
        (newMonth) => {
            setCurrentMonth(newMonth);
            updateLastInteraction();
        },
        [setCurrentMonth, updateLastInteraction]
    );

    const handleSiteSelect = useCallback(
        (siteId) => {
            selectSite(siteId);
            updateLastInteraction();
        },
        [selectSite, updateLastInteraction]
    );

    return (
        <CalendarGridControlled
            events={events}
            sites={sites}
            mode={mode}
            selectedSiteId={selectedSiteId}
            currentMonth={currentMonth || new Date()}
            onDayClick={handleDayClick}
            onMonthChange={handleMonthChange}
            onSiteSelect={handleSiteSelect}
        />
    );
};

CalendarGridContainer.propTypes = {
    events: PropTypes.arrayOf(PropTypes.object).isRequired,
    sites: PropTypes.arrayOf(PropTypes.object).isRequired,
    onDayClick: PropTypes.func
};

CalendarGridContainer.defaultProps = {
    onDayClick: () => {}
};

export default CalendarGridContainer;
