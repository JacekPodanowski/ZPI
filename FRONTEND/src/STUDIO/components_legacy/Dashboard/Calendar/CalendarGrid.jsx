import React from 'react';
import CalendarGridContainer from './CalendarGridContainer';
import CalendarGridControlled from './CalendarGridControlled';

// Legacy default export keeps existing imports working by returning the container variant.
const CalendarGrid = (props) => <CalendarGridContainer {...props} />;

export { CalendarGridContainer, CalendarGridControlled };
export default CalendarGrid;
