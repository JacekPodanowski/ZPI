import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import 'moment/locale/pl';
import { Box, Typography, IconButton, Paper, CircularProgress, Alert, Modal, Backdrop, Fade, Button as MuiButton, TextField, TextareaAutosize, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ChevronLeft, ChevronRight, Close as CloseIcon, ArrowBack } from '@mui/icons-material';
import styles from './CustomCalendar.module.css';
import { getTimeSlotsForDate, getDailySummaries } from '../../services/timeSlotService';
import { createMeetingSession } from '../../services/meetingService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DiscordIcon from '../Icons/DiscordIcon';
import GoogleMeetIcon from '../Icons/GoogleMeetIcon';

moment.locale('pl');

const CalendarHeaderInternal = ({ currentDate, onPrevMonth, onNextMonth, canGoPrev, canGoNext }) => {
    const monthName = currentDate.format('MMMM');
    const year = currentDate.format('YYYY');
    return (<Box className={styles.header}><IconButton onClick={onPrevMonth} aria-label="poprzedni miesiąc" className={styles.navButton} disabled={!canGoPrev} sx={{ color: canGoPrev ? 'var(--accent-color-orange, orange)' : 'grey.600' }}><ChevronLeft /></IconButton><Typography variant="h5" component="h2" className={styles.dateDisplay}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</Typography><IconButton onClick={onNextMonth} aria-label="następny miesiąc" className={styles.navButton} disabled={!canGoNext} sx={{ color: canGoNext ? 'var(--accent-color-orange, orange)' : 'grey.600' }}><ChevronRight /></IconButton></Box>);
};

const MonthViewInternal = ({ currentDate, onDayClick, dailySummaries, selectedDate }) => {
    const firstDayOfMonth = moment(currentDate).startOf('month'); const lastDayOfMonth = moment(currentDate).endOf('month'); const today = moment().startOf('day'); const daysInMonthCells = [];
    const dayNamesRaw = moment.weekdaysMin(); const dayNames = [...dayNamesRaw.slice(1), dayNamesRaw[0]].map(d => d.length > 2 ? d.substring(0, 2) : d); const startingDayOfWeekISO = firstDayOfMonth.isoWeekday(); const daysToSkip = startingDayOfWeekISO - 1;
    for (let i = 0; i < daysToSkip; i++) { daysInMonthCells.push(<div className={`${styles.dayCell} ${styles.emptyCell}`} key={`empty-start-${i}`}></div>); }
    for (let dayIterator = moment(firstDayOfMonth); dayIterator.isSameOrBefore(lastDayOfMonth); dayIterator.add(1, 'days')) {
        const day = moment(dayIterator); const dayFormatted = day.format('YYYY-MM-DD'); const summary = dailySummaries.get(dayFormatted);
        const isClickable = summary ? summary.has_available_slots : false;
        const isSelected = selectedDate && selectedDate.isSame(day, 'day'); const isToday = day.isSame(today, 'day'); const isPastDay = day.isBefore(today, 'day'); let cellClasses = styles.dayCell;
        if (isPastDay) { cellClasses += ` ${styles.pastDayVisual} ${styles.nonClickableDay}`; } else if (isClickable) { cellClasses += ` ${styles.availableDay}`; } else { cellClasses += ` ${styles.unavailableDay} ${styles.nonClickableDay}`; }
        if (isSelected) cellClasses += ` ${styles.selectedDayVisual}`; if (isToday) cellClasses += ` ${styles.today}`;
        daysInMonthCells.push(<div className={cellClasses} key={dayFormatted} onClick={() => isClickable && onDayClick(moment(day))} role="button" tabIndex={isClickable ? 0 : -1} aria-disabled={!isClickable}><Typography variant="body1" component="span" className={styles.dayNumber}>{day.format('D')}</Typography>{isClickable && !isPastDay && <Box className={styles.availabilityIndicator}></Box>}</div>);
    }
    const totalCells = daysToSkip + lastDayOfMonth.date(); const cellsToEnd = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7); for (let i = 0; i < cellsToEnd; i++) { daysInMonthCells.push(<div className={`${styles.dayCell} ${styles.emptyCell}`} key={`empty-end-${i}`}></div>); }
    return (<Box className={styles.monthViewContainer}><Box className={styles.dayNamesHeader}>{dayNames.map(name => (<Typography variant="caption" component="div" key={name} className={styles.dayNameCell}>{name.toUpperCase()}</Typography>))}</Box><Box className={styles.daysGridContainer}>{daysInMonthCells}</Box></Box>);
};

const DayViewInternal = ({ selectedDate, timeSlotsForDay, onClose, isUserLoggedIn, onSuccessfulBooking }) => {
    const [view, setView] = useState('timeSelection'); const [subject, setSubject] = useState(''); const [notes, setNotes] = useState(''); const [selectionStart, setSelectionStart] = useState(null); const [selectionEnd, setSelectionEnd] = useState(null); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [isBooking, setIsBooking] = useState(false); const [availableBlocks, setAvailableBlocks] = useState([]); const [platform, setPlatform] = useState('discord'); const navigate = useNavigate();
    
    const MIN_BOOKING_DURATION_MINUTES = 60; const MAX_BOOKING_DURATION_MINUTES = 4 * 60; const MIN_NOTICE_MINUTES = 20;
    const handlePlatformChange = (event, newPlatform) => { if (newPlatform !== null) setPlatform(newPlatform); };
    
    useEffect(() => {
        if (view !== 'timeSelection') return;
        if (timeSlotsForDay) {
            const availableSlots = timeSlotsForDay.filter(slot => slot.is_available);
            const sortedSlots = [...availableSlots].sort((a, b) => moment(a.start_time).diff(moment(b.start_time)));
            const blocks = []; let currentBlock = [];
            sortedSlots.forEach((slot) => {
                if (currentBlock.length === 0) { currentBlock.push(slot); } else { const last = currentBlock[currentBlock.length - 1]; if (moment(last.end_time).isSame(moment(slot.start_time))) { currentBlock.push(slot); } else { blocks.push(currentBlock); currentBlock = [slot]; } }
            });
            if (currentBlock.length > 0) { blocks.push(currentBlock); }
            const nowWithNotice = moment().add(MIN_NOTICE_MINUTES, 'minutes');
            const validBlocks = blocks.map(block => ({ start: moment(block[0].start_time), end: moment(block[block.length - 1].end_time), duration: moment(block[block.length - 1].end_time).diff(moment(block[0].start_time), 'minutes'), slots: block })).filter(block => block.duration >= MIN_BOOKING_DURATION_MINUTES && block.end.isAfter(nowWithNotice));
            setAvailableBlocks(validBlocks);
        } else { setAvailableBlocks([]); }
        setSelectionStart(null); setSelectionEnd(null); setError(''); setSuccess('');
    }, [selectedDate, timeSlotsForDay, view]);

    const timeIntervals = []; if (selectedDate) { for (let hour = 10; hour < 23; hour++) { timeIntervals.push(moment(selectedDate).hour(hour).minute(0)); timeIntervals.push(moment(selectedDate).hour(hour).minute(30)); } }
    const isTimeSegmentAvailable = (segmentMoment) => availableBlocks.some(block => segmentMoment.isBetween(block.start, block.end, null, '[)'));
    
    const handleTimeSegmentClick = (segmentMoment) => {
        setError(''); setSuccess('');
        const nowWithNotice = moment().add(MIN_NOTICE_MINUTES, 'minutes');
        if (segmentMoment.isBefore(nowWithNotice)) { setError(`Rezerwacja z min. ${MIN_NOTICE_MINUTES}-minutowym wyprzedzeniem.`); return; }
        if (!isTimeSegmentAvailable(segmentMoment)) { setError("Ten segment jest niedostępny."); return; }
        const clickedBlock = availableBlocks.find(block => segmentMoment.isBetween(block.start, block.end, null, '[)'));
        if (!clickedBlock) return;
        if (selectionStart && segmentMoment.isSame(selectionStart)) { setSelectionStart(null); setSelectionEnd(null); }
        else if (!selectionStart || segmentMoment.isBefore(selectionStart)) {
            const newStart = segmentMoment.clone();
            let newEnd = newStart.clone().add(MIN_BOOKING_DURATION_MINUTES, 'minutes');
            if (newEnd.isAfter(clickedBlock.end)) { newEnd = clickedBlock.end.clone(); }
            setSelectionStart(newStart); setSelectionEnd(newEnd);
        } else {
            const startBlock = availableBlocks.find(block => selectionStart.isBetween(block.start, block.end, null, '[)'));
            if (!startBlock || segmentMoment.isAfter(startBlock.end)) { setError("Nie można rozszerzyć zaznaczenia na inny blok."); return; }
            let newEndCandidate = segmentMoment.clone().add(30, 'minutes');
            const maxAllowedEndTime = selectionStart.clone().add(MAX_BOOKING_DURATION_MINUTES, 'minutes');
            if (newEndCandidate.isAfter(maxAllowedEndTime)) { newEndCandidate = maxAllowedEndTime; }
            if (newEndCandidate.isAfter(startBlock.end)) { newEndCandidate = startBlock.end.clone(); }
            setSelectionEnd(newEndCandidate);
        }
    };
    
    const handleProceedToConfirmation = () => { if (!selectionStart || !selectionEnd) { setError("Wybierz zakres czasu."); return; } if (selectionEnd.diff(selectionStart, 'minutes') < MIN_BOOKING_DURATION_MINUTES) { setError(`Minimalny czas rezerwacji to ${MIN_BOOKING_DURATION_MINUTES} minut.`); return; } setError(''); setView('confirmation'); };
    
    // --- POCZĄTEK POPRAWKI: Zrefaktoryzowana metoda `handleFinalBooking` ---
    const handleFinalBooking = async () => {
        if (!subject.trim()) { setError("Proszę wpisać temat spotkania."); return; }
        
        // Przygotowujemy dane do wysłania do API
        const slotsToBook = timeSlotsForDay.filter(slot => 
            slot.is_available && moment(slot.start_time).isBetween(selectionStart, selectionEnd, null, '[)')
        );
        
        const sessionData = {
            time_slot_ids: slotsToBook.map(slot => slot.id),
            subject: subject,
            notes: notes,
            platform: platform
        };

        if (sessionData.time_slot_ids.length === 0) {
            setError("Błąd: nie znaleziono dostępnych slotów w wybranym zakresie.");
            return;
        }

        // Jeśli użytkownik nie jest zalogowany, zapisujemy rezerwację i przekierowujemy
        if (!isUserLoggedIn) {
            const pendingBooking = { ...sessionData, startTime: selectionStart.toISOString(), endTime: selectionEnd.toISOString() };
            localStorage.setItem('pendingBooking', JSON.stringify(pendingBooking));
            navigate('/login');
            return;
        }

        setError(''); setSuccess(''); setIsBooking(true);
        try {
            await createMeetingSession(sessionData);
            setSuccess(`Sesja ${selectionStart.format('HH:mm')} - ${selectionEnd.format('HH:mm')} pomyślnie zarezerwowana!`);
            if (onSuccessfulBooking) {
                onSuccessfulBooking(true, selectedDate);
            }
        } catch (apiError) {
            setError(apiError.response?.data?.detail || "Błąd rezerwacji sesji.");
        } finally {
            setIsBooking(false);
        }
    };

    if (view === 'confirmation') { return (<Box className={styles.dayViewContentWrapper}><Box className={styles.dayViewModalHeader}><Typography variant="h6">Potwierdź rezerwację</Typography><IconButton onClick={onClose} size="small"><CloseIcon /></IconButton></Box><Box className={styles.confirmationViewContent}> {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{error}</Alert>}<Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>Data: <strong>{selectedDate.format('dddd, D MMMM YYYY')}</strong></Typography><Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>Godziny: <strong>{selectionStart?.format('HH:mm')} - {selectionEnd?.format('HH:mm')}</strong></Typography><TextField fullWidth required label="Temat spotkania (np. C++, Java)" variant="outlined" value={subject} onChange={(e) => {setSubject(e.target.value); setError('');}} sx={{ mb: 2 }} /><TextareaAutosize minRows={3} placeholder="Dodatkowe uwagi (opcjonalnie)" value={notes} onChange={(e) => setNotes(e.target.value)} className={styles.notesTextarea} /><Box className={styles.platformSelectorWrapper}><Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: 'text.secondary' }}>Wybierz platformę spotkania:</Typography><ToggleButtonGroup value={platform} exclusive onChange={handlePlatformChange} aria-label="platforma spotkania" fullWidth sx={{ justifyContent: 'center' }}><ToggleButton value="discord" aria-label="discord" sx={{ flexGrow: 1 }}><DiscordIcon sx={{ mr: 1, fontSize: 24 }} /> Discord</ToggleButton><ToggleButton value="google_meet" aria-label="google meet" sx={{ flexGrow: 1 }}><GoogleMeetIcon sx={{ mr: 1, fontSize: 24 }} /> Google Meet</ToggleButton></ToggleButtonGroup></Box></Box><Box className={styles.dayViewActionsConfirmation}><MuiButton variant="text" onClick={() => setView('timeSelection')} startIcon={<ArrowBack />}>Wróć</MuiButton><MuiButton variant="contained" onClick={handleFinalBooking} disabled={isBooking || !subject.trim()} className={styles.reserveButton}>{isBooking ? <CircularProgress size={22} color="inherit" /> : "Zarezerwuj i Potwierdź"}</MuiButton></Box></Box>); }
    const nowWithNotice = moment().add(MIN_NOTICE_MINUTES, 'minutes');
    return (<Box className={styles.dayViewContentWrapper}><Box className={styles.dayViewModalHeader}><Typography variant="h6">{selectedDate ? selectedDate.format('dddd, D MMMM YYYY') : "Wybierz dzień"}</Typography><IconButton onClick={onClose} size="small"><CloseIcon /></IconButton></Box><Box className={styles.dayViewInfoSection}>{error && <Alert severity="error" sx={{ mb: 1, fontSize: '0.8rem' }}>{error}</Alert>}{availableBlocks.length > 0 && (<Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.85rem', textAlign: 'center' }}>{!selectionStart ? "Wybierz godzinę rozpoczęcia." : `Wybrano: ${selectionStart.format('HH:mm')} - ${selectionEnd?.format('HH:mm') || '...'}.`}</Typography>)}</Box><Box className={styles.dayViewScrollableContent}><Box className={styles.timelineContainerVertical}>{timeIntervals.map(segmentMoment => { const isClickable = isTimeSegmentAvailable(moment(segmentMoment)) && segmentMoment.isSameOrAfter(nowWithNotice); let segmentClass = `${styles.timeIntervalVertical} ${isClickable ? styles.availableVertical : styles.unavailableTimelineSegment}`; if (selectionStart && selectionEnd && moment(segmentMoment).isBetween(selectionStart, selectionEnd, null, '[)')) { segmentClass += ` ${styles.inRangeVertical}`; if (moment(segmentMoment).isSame(selectionStart)) segmentClass += ` ${styles.selectionStartEdge}`; } return (<Box key={segmentMoment.format('HHmm')} className={segmentClass} onClick={() => isClickable && handleTimeSegmentClick(moment(segmentMoment))} role="button" aria-disabled={!isClickable}><Typography variant="caption">{segmentMoment.format('HH:mm')}</Typography></Box>);})}</Box></Box><Box className={styles.dayViewActions}><MuiButton variant="contained" onClick={handleProceedToConfirmation} disabled={!selectionStart || !selectionEnd || availableBlocks.length === 0} className={styles.reserveButton}>Dalej</MuiButton></Box></Box>);
};

const CustomCalendar = () => {
    const todayForNavigation = moment().startOf('month'); const [currentDisplayMonth, setCurrentDisplayMonth] = useState(todayForNavigation.clone()); const [dayForModal, setDayForModal] = useState(null); const [dailySummaries, setDailySummaries] = useState(new Map()); const [slotsForSelectedDayModal, setSlotsForSelectedDayModal] = useState([]); const [isLoadingSummaries, setIsLoadingSummaries] = useState(true); const [isLoadingSlotsForDay, setIsLoadingSlotsForDay] = useState(false); const [error, setError] = useState(null); const { user } = useAuth(); const navigate = useNavigate();
    const canGoPrev = currentDisplayMonth.isAfter(todayForNavigation, 'month'); const maxFutureMonth = todayForNavigation.clone().add(2, 'month'); const canGoNext = currentDisplayMonth.isBefore(maxFutureMonth, 'month');

    const fetchDailySummariesForMonth = useCallback(async (monthDate) => {
        setIsLoadingSummaries(true);
        setError(null);
        try {
            const firstDay = moment(monthDate).startOf('month').format('YYYY-MM-DD');
            const lastDay = moment(monthDate).endOf('month').format('YYYY-MM-DD');
            const response = await getDailySummaries(firstDay, lastDay);
            const summaries = response.data.results || response.data || [];
            const newSummariesMap = new Map();
            summaries.forEach(summary => newSummariesMap.set(moment(summary.date).format('YYYY-MM-DD'), summary));
            setDailySummaries(newSummariesMap);
        } catch (err) {
            console.error("Błąd pobierania podsumowań:", err);
            setError("Nie udało się załadować dostępności.");
        } finally {
            setIsLoadingSummaries(false);
        }
    }, []);

    useEffect(() => {
        fetchDailySummariesForMonth(currentDisplayMonth);
    }, [currentDisplayMonth, fetchDailySummariesForMonth]);

    const handleDayClick = useCallback(async (dayMoment) => {
        setDayForModal(dayMoment);
        setIsLoadingSlotsForDay(true);
        setError(null);
        setSlotsForSelectedDayModal([]);
        try {
            const dateStr = dayMoment.format('YYYY-MM-DD');
            const response = await getTimeSlotsForDate(dateStr);
            const slotsForDay = response.data.results || response.data || [];
            setSlotsForSelectedDayModal(slotsForDay);
            const availableSlots = slotsForDay.filter(slot => slot.is_available);
            const sortedSlots = [...availableSlots].sort((a, b) => moment(a.start_time).diff(moment(b.start_time)));
            const blocks = []; let currentBlock = [];
            sortedSlots.forEach((slot) => { if (currentBlock.length === 0) { currentBlock.push(slot); } else { const last = currentBlock[currentBlock.length - 1]; if (moment(last.end_time).isSame(moment(slot.start_time))) { currentBlock.push(slot); } else { blocks.push(currentBlock); currentBlock = [slot]; } } });
            if (currentBlock.length > 0) { blocks.push(currentBlock); }
            const nowWithNotice = moment().add(20, 'minutes');
            const validBlocks = blocks.filter(block => {
                const start = moment(block[0].start_time); const end = moment(block[block.length-1].end_time);
                return end.diff(start, 'minutes') >= 60 && end.isAfter(nowWithNotice);
            });
            if (validBlocks.length === 0) {
                setDailySummaries(prev => { const newMap = new Map(prev); if(newMap.has(dateStr)) newMap.get(dateStr).has_available_slots = false; return newMap; });
            }
        } catch (err) {
            console.error("Błąd pobierania slotów:", err);
            setError("Nie udało się załadować slotów.");
        } finally {
            setIsLoadingSlotsForDay(false);
        }
    }, []);

    const handleSuccessfulBooking = (shouldRedirect = false, bookedDate) => {
        fetchDailySummariesForMonth(currentDisplayMonth);
        handleCloseModal();
        if (shouldRedirect) {
             navigate('/student-dashboard'); 
        }
    };

    const handleCloseModal = () => { setDayForModal(null); setSlotsForSelectedDayModal([]); };
    const handlePrevMonth = () => { if (canGoPrev) { setCurrentDisplayMonth(prev => prev.clone().subtract(1, 'month')); } };
    const handleNextMonth = () => { if (canGoNext) { setCurrentDisplayMonth(prev => prev.clone().add(1, 'month')); } };

    return (
        <Paper elevation={0} className={styles.calendarWrapper}>
            <CalendarHeaderInternal currentDate={currentDisplayMonth} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} canGoPrev={canGoPrev} canGoNext={canGoNext} />
            {isLoadingSummaries ? <Box display="flex" justifyContent="center" my={2}><CircularProgress size={30} /></Box> :
             error ? <Alert severity="error" sx={{ fontSize: '0.85rem' }}>{error}</Alert> :
             <MonthViewInternal currentDate={currentDisplayMonth} onDayClick={handleDayClick} dailySummaries={dailySummaries} selectedDate={dayForModal} />}
            <Modal open={!!dayForModal} onClose={handleCloseModal} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 300, sx: { backgroundColor: 'rgba(0,0,0,0.7)' } } }}>
                <Fade in={!!dayForModal} timeout={300}>
                    <Paper className={styles.dayViewModalPaper}>
                        {dayForModal && (isLoadingSlotsForDay ? (<Box display="flex" justifyContent="center" alignItems="center" height="200px"><CircularProgress /></Box>) : (<DayViewInternal key={dayForModal.valueOf()} selectedDate={dayForModal} timeSlotsForDay={slotsForSelectedDayModal} onClose={handleCloseModal} isUserLoggedIn={!!user} onSuccessfulBooking={handleSuccessfulBooking} />))}
                    </Paper>
                </Fade>
            </Modal>
        </Paper>
    );
};

export default CustomCalendar;