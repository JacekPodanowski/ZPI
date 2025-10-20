import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import useDashboardStore from '../../../store/dashboardStore';
import CalendarGridControlled from './CalendarGridControlled';
import { shallow } from 'zustand/shallow';

/**
 * Container component that connects CalendarGridControlled to the dashboard store.
 * This handles all the Zustand state management and business logic.
 */
const CalendarGridContainer = ({ events, sites, onDayClick }) => {
    const dashboardState = useDashboardStore(
        (state) => ({
            mode: state.mode,
            selectedSiteId: state.selectedSiteId,
            currentMonth: state.currentMonth,
            setCurrentMonth: state.setCurrentMonth,
            switchMode: state.switchMode,
            updateLastInteraction: state.updateLastInteraction,
            selectSite: state.selectSite
        }),
        shallow
    );

    const handleDayClick = useCallback((date) => {
        // Auto-switch to Calendar Power mode when clicking a day
        if (dashboardState.mode === 'site-focus') {
            dashboardState.switchMode('calendar-focus', 'day-click');
        }
        dashboardState.updateLastInteraction();
        onDayClick?.(date);
    }, [dashboardState, onDayClick]);

    const handleMonthChange = useCallback((newMonth) => {
        dashboardState.setCurrentMonth(newMonth);
        dashboardState.updateLastInteraction();
    }, [dashboardState]);

    const handleSiteSelect = useCallback((siteId) => {
        dashboardState.selectSite(siteId);
        dashboardState.updateLastInteraction();
    }, [dashboardState]);

    return (
        <CalendarGridControlled
            events={events}
            sites={sites}
            mode={dashboardState.mode}
            selectedSiteId={dashboardState.selectedSiteId}
            currentMonth={dashboardState.currentMonth || new Date()}
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
