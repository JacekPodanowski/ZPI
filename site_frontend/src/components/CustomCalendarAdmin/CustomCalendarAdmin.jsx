import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import 'moment/locale/pl';
import { Box, Typography, IconButton, Paper, CircularProgress, Alert, Modal, Backdrop, Fade, Button as MuiButton, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight, Close as CloseIcon, Today as TodayIcon, CheckCircleOutline, HighlightOffOutlined } from '@mui/icons-material';
import styles from './CustomCalendarAdmin.module.css';
import { bulkCreateTimeSlots, bulkDeleteTimeSlots, getTimeSlots, getDailySummaries } from '../../services/timeSlotService';
import { getMeetings } from '../../services/meetingService';

moment.locale('pl');

const OPERATING_HOURS_START = 10;
const OPERATING_HOURS_END = 23;

const CalendarHeaderInternal = ({ currentDate, onPrevMonth, onNextMonth, onGoToToday, canGoPrevMonth, canGoNextMonth }) => {
    const monthName = currentDate.format('MMMM');
    const year = currentDate.format('YYYY');
    return (<Box className={styles.header}><Tooltip title="Poprzedni miesiąc"><IconButton onClick={onPrevMonth} className={styles.navButton} disabled={!canGoPrevMonth} sx={{ color: canGoPrevMonth ? 'var(--accent-color-orange, orange)' : 'grey.600' }}><ChevronLeft /></IconButton></Tooltip><Typography variant="h5" component="h2" className={styles.dateDisplay}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</Typography><Tooltip title="Przejdź do bieżącego miesiąca"><IconButton onClick={onGoToToday} className={styles.todayButton} sx={{ color: 'var(--accent-color-blue, #2196f3)'}}><TodayIcon /></IconButton></Tooltip><Tooltip title="Następny miesiąc"><IconButton onClick={onNextMonth} className={styles.navButton} disabled={!canGoNextMonth} sx={{ color: canGoNextMonth ? 'var(--accent-color-orange, orange)' : 'grey.600' }}><ChevronRight /></IconButton></Tooltip></Box>);
};

const MonthViewAdminInternal = ({ currentDisplayMonth, onDayClick, daysSummaries, selectedDate, onToggleWeekAvailability, onToggleMonthAvailability, activeWeeks, isMonthActive }) => {
    const firstDayOfMonth = moment(currentDisplayMonth).startOf('month'); const lastDayOfMonth = moment(currentDisplayMonth).endOf('month'); const today = moment().startOf('day'); const dayCells = []; const dayNamesRaw = moment.weekdaysMin(); const dayNames = [...dayNamesRaw.slice(1), dayNamesRaw[0]].map(d => d.length > 2 ? d.substring(0,2) : d); const startingDayOfWeekISO = firstDayOfMonth.isoWeekday(); const daysToSkip = startingDayOfWeekISO - 1; for (let i = 0; i < daysToSkip; i++) dayCells.push(<div className={`${styles.dayCell} ${styles.emptyCell}`} key={`empty-start-${i}`}></div>); let weeks = []; let currentWeekCells = [...dayCells];
    for (let dayIterator = moment(firstDayOfMonth); dayIterator.isSameOrBefore(lastDayOfMonth); dayIterator.add(1, 'days')) {
        const day = moment(dayIterator); const dayFormatted = day.format('YYYY-MM-DD'); const summary = daysSummaries.get(dayFormatted); const hasAvailableSlot = summary?.has_available_slots || false; const hasBookedMeeting = summary?.has_booked_slots || false; const isSelected = selectedDate && selectedDate.isSame(day, 'day'); const isCurrentOrFutureDay = day.isSameOrAfter(today, 'day'); let dayCellClasses = `${styles.dayCell} ${styles.adminClickableDay}`; if (!isCurrentOrFutureDay) dayCellClasses += ` ${styles.pastDay}`; if (hasBookedMeeting) dayCellClasses += ` ${styles.dayCellBookedMeeting}`; if (isSelected) dayCellClasses += ` ${styles.selectedDayVisual}`; if (day.isSame(today, 'day')) dayCellClasses += ` ${styles.today}`;
        currentWeekCells.push(<div className={dayCellClasses} key={dayFormatted} onClick={() => onDayClick(moment(day))} role="button" tabIndex={0}><Typography variant="body1" component="span" className={styles.dayNumber}>{day.format('D')}</Typography><Box className={styles.indicatorsContainer}>{hasAvailableSlot && isCurrentOrFutureDay && <Box className={`${styles.availabilityIndicator} ${styles.availableIndicatorAdmin}`}></Box>}{hasBookedMeeting && <Box className={`${styles.availabilityIndicator} ${styles.bookedIndicatorAdmin}`}></Box>}</Box></div>);
        if (day.isoWeekday() === 7 || day.isSame(lastDayOfMonth, 'day')) { if (day.isSame(lastDayOfMonth, 'day') && day.isoWeekday() !== 7) { for (let i = currentWeekCells.length; i < 7; i++) currentWeekCells.push(<div className={`${styles.dayCell} ${styles.emptyCell}`} key={`empty-end-fill-${day.format('YYYYMMDD')}-${i}`}></div>); } weeks.push({ days: [...currentWeekCells], weekNumber: day.isoWeek(), startDate: moment(day).startOf('isoWeek'), endDate: moment(day).endOf('isoWeek')}); currentWeekCells = []; }
    }
    if (currentWeekCells.length > 0 && currentWeekCells.some(cell => !cell.key?.startsWith('empty-'))) { while (currentWeekCells.length < 7) currentWeekCells.push(<div className={`${styles.dayCell} ${styles.emptyCell}`} key={`empty-final-${currentWeekCells.length}`}></div>); weeks.push({ days: currentWeekCells, weekNumber: lastDayOfMonth.isoWeek(), startDate: moment(lastDayOfMonth).startOf('isoWeek'), endDate: moment(lastDayOfMonth).endOf('isoWeek') }); }
    return (<Box className={styles.monthViewContainer}><Box className={styles.dayNamesHeader}>{dayNames.map(name => ( <Typography variant="caption" component="div" key={name} className={styles.dayNameCell}>{name.toUpperCase()}</Typography> ))}</Box><Box className={styles.weeksContainer}>{weeks.map((week, index) => { let canActivateWeek = false; for(let d = moment(week.startDate); d.isSameOrBefore(week.endDate); d.add(1, 'day')) { if (d.month() === currentDisplayMonth.month() && d.isSameOrAfter(today, 'day')) { canActivateWeek = true; break; }} const weekId = `${week.weekNumber}-${currentDisplayMonth.month()}`; return (<Box key={`week-${week.weekNumber}-${index}`} className={styles.weekRow}><MuiButton size="small" onClick={() => onToggleWeekAvailability(week.startDate, week.endDate)} className={`${styles.weekToggleButton} ${activeWeeks.has(weekId) ? styles.weekToggleButtonActive : ''}`} disabled={!canActivateWeek}>T{index + 1}</MuiButton><Box className={styles.daysGridContainerInWeek}>{week.days}</Box></Box>); })}</Box><Box sx={{display: 'flex', justifyContent: 'center', mt: 1.5, mb: 1}}><MuiButton variant="outlined" onClick={() => onToggleMonthAvailability(currentDisplayMonth)} className={`${styles.monthToggleButton} ${isMonthActive ? styles.monthToggleButtonActive : ''}`} disabled={currentDisplayMonth.isBefore(today, 'month') && !currentDisplayMonth.isSame(today, 'month')}> {isMonthActive ? 'Dezaktywuj wszystkie' : 'Aktywuj wszystkie'} w {currentDisplayMonth.format('MMMM')} </MuiButton></Box></Box>);
};

const DayViewAdminInternal = ({ selectedDate, timeSlotsForDay, meetingsForDay, onClose, onToggleSingleSlot, onToggleWholeDay }) => {
    const [isLoadingSegment, setIsLoadingSegment] = useState(null);
    const [error, setError] = useState('');
    const timeIntervals = [];
    if (selectedDate) {
        for (let hour = OPERATING_HOURS_START; hour < OPERATING_HOURS_END; hour++) {
            timeIntervals.push(moment(selectedDate).hour(hour).minute(0).second(0).millisecond(0));
            timeIntervals.push(moment(selectedDate).hour(hour).minute(30).second(0).millisecond(0));
        }
    }

    const handleSegmentClick = async (segmentMoment) => {
        if (segmentMoment.isBefore(moment(), 'minute')) {
            setError("Nie można modyfikować przeszłych segmentów.");
            return;
        }
        setError('');
        setIsLoadingSegment(segmentMoment.toISOString());

        const existingSlot = timeSlotsForDay.find(slot => moment(slot.start_time).isSame(segmentMoment, 'minute'));
        const meetingInSegment = meetingsForDay.find(m => segmentMoment.isBetween(moment(m.time_slot_details?.start_time || m.start_time), moment(m.time_slot_details?.end_time || m.end_time), null, '[)'));

        if (meetingInSegment) {
            setError("Zajęte przez spotkanie. Odwołaj spotkanie, aby zwolnić.");
            setIsLoadingSegment(null);
            return;
        }

        try {
            const makeAvailable = !existingSlot;
            await onToggleSingleSlot(segmentMoment, makeAvailable);
        } catch (apiError) {
            const errMsg = apiError.response?.data?.detail || JSON.stringify(apiError.response?.data) || apiError.message || "Błąd operacji.";
            setError(`Błąd: ${errMsg}`);
        } finally {
            setIsLoadingSegment(null);
        }
    };

    const isDayFullyAvailable = timeIntervals.every(segmentMoment => {
        if (segmentMoment.isBefore(moment(), 'minute')) return true;
        const adminSlot = timeSlotsForDay.find(s => moment(s.start_time).isSame(segmentMoment, 'minute'));
        const meeting = meetingsForDay.find(m => segmentMoment.isBetween(moment(m.time_slot_details?.start_time || m.start_time), moment(m.time_slot_details?.end_time || m.end_time), null, '[)'));
        return !meeting && adminSlot && adminSlot.is_available;
    });

    const handleToggleDay = () => {
        onToggleWholeDay(selectedDate, !isDayFullyAvailable);
    };

    return (
        <Box className={styles.dayViewContentWrapper}>
            <Box className={styles.dayViewModalHeader}>
                <Typography variant="h6">{selectedDate ? selectedDate.format('dddd, D MMMM YYYY') : "Ładowanie..."}</Typography>
                <Tooltip title={isDayFullyAvailable ? "Dezaktywuj cały dzień" : "Aktywuj cały dzień"}>
                    <IconButton onClick={handleToggleDay} size="small" disabled={selectedDate ? selectedDate.isBefore(moment(), 'day') : true} sx={{mr:1}}>
                        {isDayFullyAvailable ? <HighlightOffOutlined sx={{color: 'var(--error-color, red)'}} /> : <CheckCircleOutline sx={{color: 'var(--success-color, green)'}} />}
                    </IconButton>
                </Tooltip>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </Box>
            {error && <Alert severity="error" sx={{ m: 1, fontSize: '0.8rem' }}>{error}</Alert>}
            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem', textAlign: 'center', color: 'text.secondary', mt: 0.5, mb:1 }}>Szary: Brak. Zielony: Dostępny. Fioletowy: Spotkanie.</Typography>
            <Box className={styles.dayViewScrollableContent}>
                <Box className={styles.timelineContainerVertical}>
                    {timeIntervals.map(segmentMoment => {
                        const timeStr = segmentMoment.format('HH:mm');
                        const segmentStartTime = moment(segmentMoment);
                        const isPastSegment = segmentMoment.isBefore(moment(), 'minute');
                        const adminSlotForSegment = timeSlotsForDay.find(s => moment(s.start_time).isSame(segmentStartTime, 'minute'));
                        const meetingInSegment = meetingsForDay.find(m => segmentStartTime.isBetween(moment(m.time_slot_details?.start_time || m.start_time), moment(m.time_slot_details?.end_time || m.end_time), null, '[)'));
                        let segmentClass = styles.timeIntervalVertical;
                        let segmentText = timeStr;
                        let isClickDisabled = false;
                        let tooltipTitle = "";

                        if (meetingInSegment) {
                            segmentClass += ` ${styles.adminMeetingSegment}`;
                            segmentText = `${timeStr} (Spotkanie)`;
                            isClickDisabled = true;
                            tooltipTitle = "Spotkanie (niemodyfikowalne)";
                        } else if (adminSlotForSegment?.is_available === true) {
                            segmentClass += ` ${styles.adminAvailableDefinedSlot}`;
                            tooltipTitle = "Kliknij, aby usunąć slot";
                        } else {
                            segmentClass += ` ${styles.adminEmptySegment}`;
                            tooltipTitle = "Kliknij, aby dodać slot";
                        }
                        if (isPastSegment) {
                            segmentClass += ` ${styles.adminPastSegment}`;
                            if (!meetingInSegment) {
                                isClickDisabled = true;
                                tooltipTitle = "Przeszły slot";
                            }
                        }

                        const isLoadingThisSegment = isLoadingSegment === segmentStartTime.toISOString();
                        const finalIsDisabled = isClickDisabled || isLoadingThisSegment;
                        if (finalIsDisabled && !isLoadingThisSegment && !segmentClass.includes(styles.adminPastSegment)) {
                            segmentClass += ` ${styles.adminDisabledSegmentVisual}`;
                        }

                        return (<Tooltip title={tooltipTitle} placement="right" key={`tooltip-${timeStr}`} enterDelay={500}><Box key={timeStr} className={segmentClass} onClick={() => !finalIsDisabled && handleSegmentClick(moment(segmentMoment))} role="button" aria-disabled={finalIsDisabled} sx={{ position: 'relative' }}><Typography variant="caption">{segmentText}</Typography>{isLoadingThisSegment && <CircularProgress size={18} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-9px', marginLeft: '-9px' }} />}</Box></Tooltip>);
                    })}
                </Box>
            </Box>
        </Box>
    );
};

const CustomCalendarAdmin = ({ adminTutorId, onDataChange }) => {
    const initialDate = moment().startOf('month');
    const [currentDisplayMonth, setCurrentDisplayMonth] = useState(initialDate.clone());
    const [dayForModal, setDayForModal] = useState(null);
    const [daysSummariesMap, setDaysSummariesMap] = useState(new Map());
    const [allTimeSlotsInRange, setAllTimeSlotsInRange] = useState([]);
    const [allMeetingsInRange, setAllMeetingsInRange] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataVersion, setDataVersion] = useState(0);
    const todayForNav = moment().startOf('month');
    const canGoPrevMonth = currentDisplayMonth.isAfter(todayForNav, 'month');
    const canGoNextMonth = true;

    const handleFullDataRefresh = useCallback(async (isInitialLoad = false) => {
        if (!adminTutorId) {
            setIsLoading(false);
            return;
        }
        if (!isInitialLoad) setIsLoading(true);
        setError(null);
        try {
            const startRangeISO = moment(currentDisplayMonth).startOf('month').subtract(7, 'days').toISOString();
            const endRangeISO = moment(currentDisplayMonth).endOf('month').add(7, 'days').toISOString();
            const slotParams = { start_time_after: startRangeISO, start_time_before: endRangeISO, tutor: adminTutorId, page_size: 2000 };
            const meetingParams = { start_time_after: startRangeISO, start_time_before: endRangeISO, tutor: adminTutorId, page_size: 1000 };
            const summaryStart = moment(currentDisplayMonth).startOf('month').format('YYYY-MM-DD');
            const summaryEnd = moment(currentDisplayMonth).endOf('month').format('YYYY-MM-DD');

            const [slotsResponse, meetingsResponse, summariesResponse] = await Promise.all([
                getTimeSlots(slotParams),
                getMeetings(meetingParams),
                getDailySummaries(summaryStart, summaryEnd)
            ]);

            setAllTimeSlotsInRange(slotsResponse.data?.results || slotsResponse.data || []);
            setAllMeetingsInRange(meetingsResponse.data?.results || meetingsResponse.data || []);

            const backendSummariesData = summariesResponse.data?.results || summariesResponse.data || [];
            const newSummaries = new Map();
            backendSummariesData.forEach(s => newSummaries.set(moment(s.date).format('YYYY-MM-DD'), {
                has_available_slots: s.has_available_slots,
                has_booked_slots: s.has_booked_slots
            }));
            setDaysSummariesMap(newSummaries);
        } catch (err) {
            setError(`Błąd odświeżania danych: ${err.message}.`);
        } finally {
            setIsLoading(false);
        }
    }, [adminTutorId, currentDisplayMonth]);
    
    const processBatchAndUpdateUI = useCallback(async (slotsToCreate, slotsToDeleteIds) => {
        if (!adminTutorId || (slotsToCreate.length === 0 && slotsToDeleteIds.length === 0)) {
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const promises = [];
            if (slotsToCreate.length > 0) {
                promises.push(bulkCreateTimeSlots(slotsToCreate));
            }
            if (slotsToDeleteIds.length > 0) {
                promises.push(bulkDeleteTimeSlots(slotsToDeleteIds));
            }
            await Promise.all(promises);
            await handleFullDataRefresh();
        } catch (err) {
            setError(`Krytyczny błąd masowej aktualizacji: ${err.message}`);
        }
        finally {
            if(!dayForModal) setDayForModal(null);
            setIsLoading(false);
            setDataVersion(v => v + 1);
            if(onDataChange) onDataChange();
        }
    }, [adminTutorId, onDataChange, handleFullDataRefresh, dayForModal]);

    useEffect(() => {
        setIsLoading(true);
        handleFullDataRefresh(true);
    }, [currentDisplayMonth, adminTutorId, handleFullDataRefresh]);

    const handleDayClick = (dayMoment) => { setDayForModal(moment(dayMoment)); };
    const handleCloseModal = () => setDayForModal(null);
    const handleGoToToday = () => { setCurrentDisplayMonth(initialDate.clone()); setDayForModal(null); };
    const handlePrevMonth = () => { if (canGoPrevMonth) { setCurrentDisplayMonth(prev => prev.clone().subtract(1, 'month')); setDayForModal(null); }};
    const handleNextMonth = () => { if (canGoNextMonth) { setCurrentDisplayMonth(prev => prev.clone().add(1, 'month')); setDayForModal(null); }};

    const slotsForDayInModal = dayForModal ? allTimeSlotsInRange.filter(s => moment(s.start_time).isSame(dayForModal, 'day')) : [];
    const meetingsForDayInModal = dayForModal ? allMeetingsInRange.filter(m => moment(m.time_slot_details?.start_time || m.start_time).isSame(dayForModal, 'day')) : [];

    const generateSlotsForPeriodAdmin = useCallback((loopStart, loopEnd, makeAvailable) => {
        const slotsToCreate = [];
        const slotsToDeleteIds = [];
        const now = moment();

        for (let day = moment(loopStart); day.isSameOrBefore(loopEnd); day.add(1, 'days')) {
            if (day.isBefore(moment(), 'day')) continue;

            for (let hour = OPERATING_HOURS_START; hour < OPERATING_HOURS_END; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const segmentStart = day.clone().hour(hour).minute(minute).second(0).millisecond(0);
                    if (segmentStart.isBefore(now, 'minute')) continue;
                    const segmentHasMeeting = allMeetingsInRange.some(m => segmentStart.isBetween(moment(m.time_slot_details?.start_time || m.start_time), moment(m.time_slot_details?.end_time || m.end_time), null, '[)'));
                    if (segmentHasMeeting) continue;
                    const existingSlot = allTimeSlotsInRange.find(s => moment(s.start_time).isSame(segmentStart, 'minute'));
                    if (makeAvailable) { if (!existingSlot) { slotsToCreate.push({ start_time: segmentStart.toISOString(), end_time: segmentStart.clone().add(30, 'minutes').toISOString() }); } }
                    else { if (existingSlot) { slotsToDeleteIds.push(existingSlot.id); } }
                }
            }
        }
        return { slotsToCreate, slotsToDeleteIds };
    }, [allTimeSlotsInRange, allMeetingsInRange]);
    
    const handleToggleSingleSlot = async (segmentMoment, makeAvailable) => {
        const slotsToCreate = [];
        const slotsToDeleteIds = [];
        if (makeAvailable) {
            slotsToCreate.push({
                start_time: segmentMoment.toISOString(),
                end_time: segmentMoment.clone().add(30, 'minutes').toISOString(),
            });
        } else {
            const existingSlot = allTimeSlotsInRange.find(s => moment(s.start_time).isSame(segmentMoment, 'minute'));
            if (existingSlot) {
                slotsToDeleteIds.push(existingSlot.id);
            }
        }
        await processBatchAndUpdateUI(slotsToCreate, slotsToDeleteIds);
    };

    const handleToggleWholeDay = async (dayToToggle, makeAvailable) => {
        const { slotsToCreate, slotsToDeleteIds } = generateSlotsForPeriodAdmin(moment(dayToToggle).startOf('day'), moment(dayToToggle).endOf('day'), makeAvailable);
        await processBatchAndUpdateUI(slotsToCreate, slotsToDeleteIds);
    };
    
    const hasAvailableFutureSlotsInPeriod = (start, end) => {
        const now = moment();
        return allTimeSlotsInRange.some(slot => {
            const slotStart = moment(slot.start_time);
            return slot.is_available && slotStart.isSameOrAfter(now) && slotStart.isBetween(start, end, 'day', '[]');
        });
    };

    const handleToggleWeekAvailabilityAdmin = async (start, end) => {
        const weekStart = moment.max(moment(start), moment(currentDisplayMonth).startOf('month'));
        const weekEnd = moment.min(moment(end), moment(currentDisplayMonth).endOf('month'));
        const isCurrentlyActive = hasAvailableFutureSlotsInPeriod(weekStart, weekEnd);
        const makeAvailable = !isCurrentlyActive;
        const { slotsToCreate, slotsToDeleteIds } = generateSlotsForPeriodAdmin(weekStart, weekEnd, makeAvailable);
        await processBatchAndUpdateUI(slotsToCreate, slotsToDeleteIds);
    };
    
    const handleToggleMonthAvailabilityAdmin = async (month) => {
        const monthStart = moment(month).startOf('month');
        const monthEnd = moment(month).endOf('month');
        const isCurrentlyActive = hasAvailableFutureSlotsInPeriod(monthStart, monthEnd);
        const makeAvailable = !isCurrentlyActive;
        const { slotsToCreate, slotsToDeleteIds } = generateSlotsForPeriodAdmin(monthStart, monthEnd, makeAvailable);
        await processBatchAndUpdateUI(slotsToCreate, slotsToDeleteIds);
    };
    
    const activeWeeks = new Set();
    if(allTimeSlotsInRange.length > 0) {
        const monthStart = moment(currentDisplayMonth).startOf('month');
        const monthEnd = moment(currentDisplayMonth).endOf('month');
        for(let day = monthStart.clone().startOf('isoWeek'); day.isBefore(monthEnd); day.add(1, 'week')) {
            if(day.clone().endOf('isoWeek').isBefore(monthStart)) continue;
            const weekStart = day.clone();
            const weekEnd = day.clone().endOf('isoWeek');
            if (hasAvailableFutureSlotsInPeriod(weekStart, weekEnd)) {
                activeWeeks.add(`${day.isoWeek()}-${currentDisplayMonth.month()}`);
            }
        }
    }
    const isMonthActive = hasAvailableFutureSlotsInPeriod(moment(currentDisplayMonth).startOf('month'), moment(currentDisplayMonth).endOf('month'));
    
    return (<Paper elevation={0} className={styles.calendarWrapper}><CalendarHeaderInternal currentDate={currentDisplayMonth} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} onGoToToday={handleGoToToday} canGoPrevMonth={canGoPrevMonth} canGoNextMonth={canGoNextMonth} />{isLoading && <Box display="flex" justifyContent="center" my={2}><CircularProgress size={30} /></Box>}{!isLoading && error && <Box my={1.5}><Alert severity="error" sx={{ fontSize: '0.85rem' }}>{error}</Alert></Box>}{!isLoading && !error && adminTutorId && (<MonthViewAdminInternal currentDisplayMonth={currentDisplayMonth} onDayClick={handleDayClick} daysSummaries={daysSummariesMap} selectedDate={dayForModal} onToggleWeekAvailability={handleToggleWeekAvailabilityAdmin} onToggleMonthAvailability={handleToggleMonthAvailabilityAdmin} activeWeeks={activeWeeks} isMonthActive={isMonthActive} />)}{!adminTutorId && !isLoading && !error && <Alert severity="warning">ID Administratora nie jest ustawione.</Alert>}<Modal open={!!dayForModal && !!adminTutorId} onClose={handleCloseModal} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 300, sx: { backgroundColor: 'rgba(0,0,0,0.7)' } } }}><Fade in={!!dayForModal && !!adminTutorId} timeout={300}><Paper className={styles.dayViewModalPaper} sx={{bgcolor: 'var(--background-color-dark)', color: 'var(--text-color-light)'}}>{dayForModal && adminTutorId && (<DayViewAdminInternal key={`${dayForModal.valueOf()}-${dataVersion}`} selectedDate={dayForModal} timeSlotsForDay={slotsForDayInModal} meetingsForDay={meetingsForDayInModal} onClose={handleCloseModal} onToggleSingleSlot={handleToggleSingleSlot} onToggleWholeDay={handleToggleWholeDay} />)}</Paper></Fade></Modal></Paper>);
};

export default CustomCalendarAdmin;