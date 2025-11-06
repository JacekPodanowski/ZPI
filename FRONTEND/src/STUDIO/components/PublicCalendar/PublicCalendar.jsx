import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment/locale/pl';
import { Box, Button, Fade, IconButton, Paper, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import useTheme from '../../../theme/useTheme';
import styles from './PublicCalendar.module.css';

moment.locale('pl');

const DAY_NAMES = ['pn', 'wt', 'śr', 'cz', 'pt', 'so', 'nd'];

const PublicCalendar = ({ eventsByDate, onDayClick }) => {
    const theme = useTheme();
    const [currentMonth, setCurrentMonth] = useState(moment().startOf('month'));
    const today = useMemo(() => moment().startOf('day'), []);

    const { days, monthLabel } = useMemo(() => {
        const startOfMonth = currentMonth.clone();
        const endOfMonth = currentMonth.clone().endOf('month');
        const daysInGrid = [];
        const leadingEmptyDays = (startOfMonth.isoWeekday() + 6) % 7; // convert ISO 1-7 into 0-6 offset

        for (let i = 0; i < leadingEmptyDays; i += 1) {
            daysInGrid.push(null);
        }

        for (let date = startOfMonth.clone(); date.isSameOrBefore(endOfMonth); date.add(1, 'day')) {
            const key = date.format('YYYY-MM-DD');
            const events = eventsByDate.get(key) || [];
            daysInGrid.push({
                moment: date.clone(),
                isToday: date.isSame(today, 'day'),
                events
            });
        }

        const trailingSpaces = (7 - (daysInGrid.length % 7)) % 7;
        for (let i = 0; i < trailingSpaces; i += 1) {
            daysInGrid.push(null);
        }

        const monthTitle = `${startOfMonth.format('MMMM YYYY')}`;

        return { days: daysInGrid, monthLabel: monthTitle };
    }, [currentMonth, eventsByDate, today]);

    const handlePrevMonth = () => setCurrentMonth((prev) => prev.clone().subtract(1, 'month'));
    const handleNextMonth = () => setCurrentMonth((prev) => prev.clone().add(1, 'month'));

    const renderDayCell = (day, index) => {
        if (!day) {
            return <Box key={`empty-${index}`} />;
        }

        const { moment: dayMoment, events, isToday } = day;
        const formatted = dayMoment.format('YYYY-MM-DD');
        const hasEvents = events.length > 0;

        const background = hasEvents ? 'rgba(160, 0, 22, 0.12)' : theme.palette.background.paper;
        const color = theme.palette.text.primary;

        return (
            <Fade in key={formatted} timeout={220}>
                <Paper
                    elevation={0}
                    className={[
                        styles.dayCell,
                        hasEvents ? styles.dayCellAvailable : '',
                        isToday ? styles.dayCellToday : ''
                    ].join(' ')}
                    style={{
                        background,
                        color,
                        border: isToday ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.04)'
                    }}
                >
                    <Typography variant="subtitle1" component="p" sx={{ fontWeight: 600 }}>
                        {dayMoment.date()}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {events.slice(0, 2).map((event) => (
                            <Box
                                key={event.id}
                                className={styles.dayChip}
                                style={{
                                    color: theme.palette.primary.main,
                                    backgroundColor: 'rgba(160, 0, 22, 0.16)'
                                }}
                            >
                                {event.title}
                            </Box>
                        ))}
                        {events.length > 2 && (
                            <Typography variant="caption" sx={{ opacity: 0.66 }}>
                                {`+${events.length - 2} więcej`}
                            </Typography>
                        )}
                    </Box>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => onDayClick?.(dayMoment.clone())}
                        sx={{
                            alignSelf: 'flex-start',
                            mt: 'auto',
                            color: theme.palette.primary.main,
                            fontSize: '0.75rem'
                        }}
                    >
                        Zobacz dzień
                    </Button>
                </Paper>
            </Fade>
        );
    };

    return (
        <Paper
            className={styles.calendarWrapper}
            elevation={0}
            style={{
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.divider}`
            }}
        >
            <Box className={styles.header}>
                <IconButton onClick={handlePrevMonth} aria-label="poprzedni miesiąc">
                    <ChevronLeft />
                </IconButton>
                <Typography className={styles.monthLabel} sx={{ color: theme.palette.text.primary }}>
                    {monthLabel}
                </Typography>
                <IconButton onClick={handleNextMonth} aria-label="następny miesiąc">
                    <ChevronRight />
                </IconButton>
            </Box>

            <Box className={styles.dayNamesRow}>
                {DAY_NAMES.map((name) => (
                    <Typography
                        key={name}
                        className={styles.dayNameCell}
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        {name}
                    </Typography>
                ))}
            </Box>

            <Box className={styles.daysGrid}>
                {days.map((day, index) => renderDayCell(day, index))}
            </Box>
        </Paper>
    );
};

PublicCalendar.propTypes = {
    eventsByDate: PropTypes.instanceOf(Map),
    onDayClick: PropTypes.func
};

PublicCalendar.defaultProps = {
    eventsByDate: new Map(),
    onDayClick: undefined
};

export default PublicCalendar;
