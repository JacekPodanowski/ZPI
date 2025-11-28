import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    format,
    startOfMonth,
    endOfMonth,
    addMonths,
    subMonths,
    addDays,
    getISODay,
    startOfDay,
    isSameDay,
    getDate
} from 'date-fns';
import { pl } from 'date-fns/locale';
import { Box, Fade, IconButton, Paper, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { applyOpacity } from '../../../../../utils/color';
import styles from './PublicCalendar.module.css';

const DAY_NAMES = ['pn', 'wt', 'śr', 'cz', 'pt', 'so', 'nd'];

// Helper for isSameOrBefore comparison
const dateSameOrBefore = (date, dateToCompare) => isSameDay(date, dateToCompare) || date < dateToCompare;

const PublicCalendar = ({ eventsByDate, onDayClick, style }) => {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    const today = useMemo(() => startOfDay(new Date()), []);

    const surface = style?.surface || '#ffffff';
    const textColor = style?.text || '#1f2937';
    const neutralText = style?.neutral || '#6b7280';
    const accent = style?.primary || '#920020';
    const borderColor = style?.colors?.border || style?.borderColor || 'rgba(0, 0, 0, 0.12)';
    const subtleBorder = style?.colors?.borderSubtle || applyOpacity(borderColor, 0.5);

    const { days, monthLabel } = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const daysInGrid = [];
        const leadingEmptyDays = (getISODay(monthStart) + 6) % 7; // convert ISO 1-7 into 0-6 offset

        for (let i = 0; i < leadingEmptyDays; i += 1) {
            daysInGrid.push(null);
        }

        let date = new Date(monthStart);
        while (dateSameOrBefore(date, monthEnd)) {
            const key = format(date, 'yyyy-MM-dd');
            const events = eventsByDate.get(key) || [];
            daysInGrid.push({
                date: new Date(date),
                isToday: isSameDay(date, today),
                events
            });
            date = addDays(date, 1);
        }

        const trailingSpaces = (7 - (daysInGrid.length % 7)) % 7;
        for (let i = 0; i < trailingSpaces; i += 1) {
            daysInGrid.push(null);
        }

        const monthTitle = format(monthStart, 'LLLL yyyy', { locale: pl });

        return { days: daysInGrid, monthLabel: monthTitle };
    }, [currentMonth, eventsByDate, today]);

    const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

    const renderDayCell = (day, index) => {
        if (!day) {
            return <Box key={`empty-${index}`} />;
        }

        const { date: dayDate, events, isToday } = day;
        const formatted = format(dayDate, 'yyyy-MM-dd');
        const hasEvents = events.length > 0;

    const background = hasEvents ? applyOpacity(accent, 0.12) : surface;
    const color = textColor;

        return (
            <Fade in key={formatted} timeout={220}>
                <Paper
                    elevation={0}
                    onClick={() => onDayClick?.(new Date(dayDate))}
                    className={[
                        styles.dayCell,
                        hasEvents ? styles.dayCellAvailable : '',
                        isToday ? styles.dayCellToday : ''
                    ].join(' ')}
                    style={{
                        background,
                        color,
                        border: isToday
                            ? `2px solid ${accent}`
                            : `1px solid ${subtleBorder}`
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        component="p"
                        className={styles.dayNumber}
                        sx={{ fontWeight: 600, color: color === '#fff' ? '#fff' : color }}
                    >
                        {getDate(dayDate)}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {events.slice(0, 2).map((event) => (
                            <Box
                                key={event.id}
                                className={styles.dayChip}
                                style={{
                                    color: accent,
                                    backgroundColor: applyOpacity(accent, 0.16)
                                }}
                            >
                                {event.title}
                            </Box>
                        ))}
                        {events.length > 2 && (
                            <Typography variant="caption" sx={{ opacity: 0.66, color: neutralText }}>
                                {`+${events.length - 2} więcej`}
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Fade>
        );
    };

    return (
        <Paper
            className={styles.calendarWrapper}
            elevation={0}
            style={{
                background: surface,
                color: textColor,
                border: `1px solid ${borderColor}`
            }}
        >
            <Box className={styles.header}>
                <IconButton onClick={handlePrevMonth} aria-label="poprzedni miesiąc" style={{ color: accent }}>
                    <ChevronLeft />
                </IconButton>
                <Typography className={styles.monthLabel} sx={{ color: textColor }}>
                    {monthLabel}
                </Typography>
                <IconButton onClick={handleNextMonth} aria-label="następny miesiąc" style={{ color: accent }}>
                    <ChevronRight />
                </IconButton>
            </Box>

            <Box className={styles.gridScrollArea}>
                <Box className={styles.dayNamesRow}>
                    {DAY_NAMES.map((name) => (
                        <Typography
                            key={name}
                            className={styles.dayNameCell}
                            sx={{ color: neutralText }}
                        >
                            {name}
                        </Typography>
                    ))}
                </Box>

                <Box className={styles.daysGrid}>
                    {days.map((day, index) => renderDayCell(day, index))}
                </Box>
            </Box>
        </Paper>
    );
};

PublicCalendar.propTypes = {
    eventsByDate: PropTypes.instanceOf(Map),
    onDayClick: PropTypes.func,
    style: PropTypes.object
};

PublicCalendar.defaultProps = {
    eventsByDate: new Map(),
    onDayClick: undefined,
    style: undefined
};

export default PublicCalendar;
