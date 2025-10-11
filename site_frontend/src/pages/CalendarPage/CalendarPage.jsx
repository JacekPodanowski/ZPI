import React from 'react';
import { Box } from '@mui/material';
import CustomCalendar from '../../components/CustomCalendar/CustomCalendar';
import styles from './CalendarPage.module.css';

const CalendarPage = () => {
    return (
        <Box className={styles.calendarPageContainer}>
            <CustomCalendar />
        </Box>
    );
};

export default CalendarPage;