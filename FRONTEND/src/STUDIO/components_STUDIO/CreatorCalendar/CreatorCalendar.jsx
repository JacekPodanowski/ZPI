import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment/locale/pl';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    FormControl,
    InputLabel,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material';
import { Add as AddIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import useTheme from '../../../theme/useTheme';
import styles from './CreatorCalendar.module.css';

moment.locale('pl');

const HOURS = Array.from({ length: 16 }, (_, idx) => 6 + idx);
const DAY_START_MINUTES = 6 * 60;
const DAY_END_MINUTES = 22 * 60;
const HOUR_HEIGHT = 48;

const mapCollectionByDate = (collection) => {
    const map = new Map();
    collection.forEach((item) => {
        const dateKey = item.date;
        if (!map.has(dateKey)) {
            map.set(dateKey, []);
        }
        map.get(dateKey).push(item);
    });
    return map;
};

const computeBlockMetrics = (start, end) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const clampedStart = Math.max(startMinutes, DAY_START_MINUTES);
    const clampedEnd = Math.min(endMinutes, DAY_END_MINUTES);
    const duration = Math.max(clampedEnd - clampedStart, 15);
    const top = ((clampedStart - DAY_START_MINUTES) / 60) * HOUR_HEIGHT;
    const height = (duration / 60) * HOUR_HEIGHT;
    return { top, height };
};

const CreatorCalendar = ({
    events,
    availabilityBlocks,
    externalEvents,
    templates,
    onCreateEvent,
    onCreateAvailability
}) => {
    const theme = useTheme();
    const brand = theme.palette.brand ?? {
        subtle: 'rgba(188, 186, 179, 0.3)',
        text: theme.palette.text.primary
    };
    const [currentMonth, setCurrentMonth] = useState(moment().startOf('month'));
    const [selectedDay, setSelectedDay] = useState(null);
    const [modalView, setModalView] = useState('timeline');
    const [meetingType, setMeetingType] = useState('individual');
    const [meetingColor, setMeetingColor] = useState('#A00016');
    const [formState, setFormState] = useState({
        title: '',
        location: '',
        date: '',
        start: '10:00',
        end: '11:00',
        type: 'online',
        capacity: 1,
        templateKey: templates[0]?.id ?? null,
        buffer: 15,
        durations: ['30m', '60m'],
        snap: '30'
    });
    const [feedback, setFeedback] = useState({ type: null, message: null });

    const groupedEvents = useMemo(() => mapCollectionByDate(events), [events]);
    const groupedAvailability = useMemo(() => mapCollectionByDate(availabilityBlocks), [availabilityBlocks]);
    const groupedExternalEvents = useMemo(() => mapCollectionByDate(externalEvents), [externalEvents]);

    const daysForGrid = useMemo(() => {
        const startOfMonth = currentMonth.clone();
        const endOfMonth = currentMonth.clone().endOf('month');
        const grid = [];
        const leadingEmptyDays = (startOfMonth.isoWeekday() + 6) % 7;

        for (let i = 0; i < leadingEmptyDays; i += 1) {
            grid.push(null);
        }

        for (let date = startOfMonth.clone(); date.isSameOrBefore(endOfMonth); date.add(1, 'day')) {
            const key = date.format('YYYY-MM-DD');
            const dayEvents = groupedEvents.get(key) ?? [];
            const dayAvailabilities = groupedAvailability.get(key) ?? [];
            const dayOthers = groupedExternalEvents.get(key) ?? [];

            grid.push({
                date: date.clone(),
                events: dayEvents,
                availability: dayAvailabilities,
                external: dayOthers
            });
        }

        const trailing = (7 - (grid.length % 7)) % 7;
        for (let i = 0; i < trailing; i += 1) {
            grid.push(null);
        }

        return grid;
    }, [currentMonth, groupedAvailability, groupedEvents, groupedExternalEvents]);

    const handlePrevMonth = () => setCurrentMonth((prev) => prev.clone().subtract(1, 'month'));
    const handleNextMonth = () => setCurrentMonth((prev) => prev.clone().add(1, 'month'));

    const openDayModal = (day) => {
        setSelectedDay(day);
        setModalView('timeline');
        setFeedback({ type: null, message: null });
    };

    const closeModal = () => {
        setSelectedDay(null);
        setModalView('timeline');
        setFeedback({ type: null, message: null });
    };

    const handleCreationChoice = (type) => {
        setModalView(type === 'availability' ? 'createAvailability' : 'createEvent');
        setFeedback({ type: null, message: null });
        if (selectedDay) {
            const dateKey = selectedDay.date.format('YYYY-MM-DD');
            setFormState((prev) => ({ ...prev, date: dateKey }));
        }
    };

    const handleFormChange = (field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleDurationsChange = (value) => {
        const sanitized = value.split(',').map((part) => part.trim()).filter(Boolean);
        setFormState((prev) => ({ ...prev, durations: sanitized }));
    };

    const handleSubmit = () => {
        if (!selectedDay) return;

        const payload = {
            ...formState,
            meetingType,
            color: meetingColor,
            siteDate: selectedDay.date.format('YYYY-MM-DD')
        };

        if (modalView === 'createEvent') {
            onCreateEvent?.(payload);
            setFeedback({ type: 'success', message: 'Wydarzenie zapisane w szkicu.' });
        } else {
            onCreateAvailability?.(payload);
            setFeedback({ type: 'success', message: 'Okno dostępności zapisane.' });
        }

        setModalView('timeline');
    };

    const selectedDayKey = selectedDay?.date.format('YYYY-MM-DD');
    const dayEvents = selectedDay ? groupedEvents.get(selectedDayKey) ?? [] : [];
    const dayAvailabilities = selectedDay ? groupedAvailability.get(selectedDayKey) ?? [] : [];
    const dayOthers = selectedDay ? groupedExternalEvents.get(selectedDayKey) ?? [] : [];

    const timelineHeight = (DAY_END_MINUTES - DAY_START_MINUTES) / 60 * HOUR_HEIGHT;

    return (
        <Paper
            className={styles.wrapper}
            elevation={0}
            style={{
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.divider}`
            }}
        >
            <Box className={styles.topBar}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <IconButton onClick={handlePrevMonth} aria-label="poprzedni miesiąc">
                        <ChevronLeft />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {currentMonth.format('MMMM YYYY')}
                    </Typography>
                    <IconButton onClick={handleNextMonth} aria-label="następny miesiąc">
                        <ChevronRight />
                    </IconButton>
                    <Chip label="tryb twórcy" size="small" sx={{ background: brand.subtle, color: brand.text }} />
                </Stack>
                <Button variant="outlined">Konfiguruj szablony dnia</Button>
            </Box>

            <Box className={styles.dayGrid}>
                {daysForGrid.map((entry, index) => {
                    if (!entry) return <Box key={`empty-${index}`} />;
                    const dayKey = entry.date.format('YYYY-MM-DD');
                    const hasTemplates = templates.some((tpl) => tpl.days.includes(dayKey));

                    return (
                        <Paper
                            key={dayKey}
                            elevation={0}
                            className={[
                                styles.dayTile,
                                entry.events.length === 0 && entry.availability.length === 0 ? styles.dayTileUnavailable : '',
                                entry.external.length > 0 ? styles.dayTileExternal : ''
                            ].join(' ')}
                            style={{
                                background: entry.events.length > 0 ? 'rgba(160, 0, 22, 0.04)' : theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`
                            }}
                            onClick={() => openDayModal(entry)}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {entry.date.date()}
                            </Typography>
                            <Stack spacing={0.5}>
                                {entry.availability.slice(0, 1).map((block) => (
                                    <Chip key={block.id} size="small" label={`Dostępny ${block.start}-${block.end}`} color="success" variant="outlined" />
                                ))}
                                {entry.events.slice(0, 2).map((event) => (
                                    <Chip key={event.id} size="small" label={event.title} sx={{ background: `${event.color}22`, color: event.color }} />
                                ))}
                                {entry.external.length > 0 && (
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                        + wydarzenia z innych witryn
                                    </Typography>
                                )}
                                {hasTemplates && (
                                    <Box className={styles.templateBadge} style={{ background: brand.subtle, color: theme.palette.text.primary }}>
                                        dzień wg szablonu
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    );
                })}
            </Box>

            <Dialog open={Boolean(selectedDay)} onClose={closeModal} fullWidth maxWidth="md">
                {selectedDay && (
                    <>
                        <DialogTitle>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {selectedDay.date.format('dddd, D MMMM YYYY')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        {templates.find((tpl) => tpl.days.includes(selectedDayKey))?.name ?? 'Bez przypisanego szablonu'}
                                    </Typography>
                                </Box>
                                <Tooltip title="Dodaj wydarzenie lub dostępność">
                                    <Fab color="primary" className={styles.modalFab} onClick={() => setModalView('chooser')}>
                                        <AddIcon />
                                    </Fab>
                                </Tooltip>
                            </Stack>
                        </DialogTitle>

                        <DialogContent sx={{ position: 'relative', pt: 4 }}>
                            {feedback.message && (
                                <Alert severity={feedback.type} sx={{ mb: 2 }}>
                                    {feedback.message}
                                </Alert>
                            )}

                            {modalView === 'timeline' && (
                                <Box className={styles.modalTimeline} style={{ background: theme.palette.background.default, border: `1px solid ${theme.palette.divider}`, height: timelineHeight }}>
                                    {HOURS.map((hour) => (
                                        <Box key={hour} className={styles.modalHourLine} style={{ color: theme.palette.text.secondary }}>
                                            <Typography sx={{ width: 60, fontWeight: 500 }}>{`${hour.toString().padStart(2, '0')}:00`}</Typography>
                                        </Box>
                                    ))}

                                    {dayAvailabilities.map((block) => {
                                        const { top, height } = computeBlockMetrics(block.start, block.end);
                                        return (
                                            <Box
                                                key={block.id}
                                                className={styles.availabilityBlock}
                                                style={{ top, height }}
                                            >
                                                <Typography variant="subtitle2" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                                                    Dostępny
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                    {`${block.start} - ${block.end}`}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                    sloty: {block.durations.join(', ')} | bufor {block.buffer} min
                                                </Typography>
                                            </Box>
                                        );
                                    })}

                                    {dayEvents.map((event) => {
                                        const { top, height } = computeBlockMetrics(event.start, event.end);
                                        return (
                                            <Box
                                                key={event.id}
                                                className={styles.eventBlock}
                                                style={{ top, height, background: event.color }}
                                            >
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {event.title}
                                                </Typography>
                                                <Typography variant="body2">{`${event.start} - ${event.end}`}</Typography>
                                                <Typography variant="caption">
                                                    {event.meetingType === 'group'
                                                        ? `${event.booked}/${event.capacity} zapisanych`
                                                        : event.status ?? 'Wolny termin'}
                                                </Typography>
                                            </Box>
                                        );
                                    })}

                                    {dayOthers.map((event) => {
                                        const { top, height } = computeBlockMetrics(event.start, event.end);
                                        return (
                                            <Box
                                                key={event.id}
                                                className={[styles.eventBlock, styles.eventBlockExternal].join(' ')}
                                                style={{
                                                    top,
                                                    height,
                                                    background: 'rgba(70, 70, 70, 0.45)',
                                                    color: '#fff'
                                                }}
                                                onClick={() => window.open(event.url, '_blank', 'noopener noreferrer')}
                                            >
                                                <Typography variant="subtitle2">{event.title}</Typography>
                                                <Typography variant="caption">Edytuj w {event.siteName}</Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                            {modalView === 'chooser' && (
                                <Box className={styles.creationChooser}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Jak chcesz zaplanować ten dzień?
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        Wybierz, czy chcesz dodać pojedyncze spotkanie, czy okno dostępności, w którym klienci mogą sami zarezerwować termin.
                                    </Typography>
                                    <Box className={styles.creationOptions}>
                                        <Button
                                            variant="contained"
                                            startIcon={<span role="img" aria-label="spotkanie">📅</span>}
                                            onClick={() => handleCreationChoice('event')}
                                        >
                                            Stałe spotkanie
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<span role="img" aria-label="dostępność">🕐</span>}
                                            onClick={() => handleCreationChoice('availability')}
                                        >
                                            Godziny dostępności
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {modalView === 'createEvent' && (
                                <Stack spacing={2}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Nowe wydarzenie
                                    </Typography>
                                    <Box className={styles.formGrid}>
                                        <TextField
                                            fullWidth
                                            label="Nazwa"
                                            value={formState.title}
                                            onChange={(e) => handleFormChange('title', e.target.value)}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Data"
                                            type="date"
                                            value={formState.date}
                                            onChange={(e) => handleFormChange('date', e.target.value)}
                                        />
                                        <Box className={styles.formGridHalf}>
                                            <TextField
                                                label="Start"
                                                type="time"
                                                value={formState.start}
                                                onChange={(e) => handleFormChange('start', e.target.value)}
                                            />
                                            <TextField
                                                label="Koniec"
                                                type="time"
                                                value={formState.end}
                                                onChange={(e) => handleFormChange('end', e.target.value)}
                                            />
                                        </Box>
                                        <FormControl fullWidth>
                                            <InputLabel>Rodzaj</InputLabel>
                                            <Select
                                                value={formState.type}
                                                label="Rodzaj"
                                                onChange={(e) => handleFormChange('type', e.target.value)}
                                            >
                                                <MenuItem value="online">Online</MenuItem>
                                                <MenuItem value="local">Stacjonarnie</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            fullWidth
                                            label="Lokalizacja"
                                            value={formState.location}
                                            onChange={(e) => handleFormChange('location', e.target.value)}
                                            placeholder="np. Google Meet, Studio Downtown"
                                        />
                                        <ToggleButtonGroup
                                            color="primary"
                                            value={meetingType}
                                            exclusive
                                            onChange={(_, val) => val && setMeetingType(val)}
                                        >
                                            <ToggleButton value="individual">Indywidualne</ToggleButton>
                                            <ToggleButton value="group">Grupowe</ToggleButton>
                                        </ToggleButtonGroup>
                                        {meetingType === 'group' && (
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Maksymalna liczba osób"
                                                value={formState.capacity}
                                                onChange={(e) => handleFormChange('capacity', Number(e.target.value))}
                                                inputProps={{ min: 2 }}
                                            />
                                        )}
                                        <TextField
                                            fullWidth
                                            type="color"
                                            label="Kolor"
                                            value={meetingColor}
                                            onChange={(e) => setMeetingColor(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Box>
                                </Stack>
                            )}

                            {modalView === 'createAvailability' && (
                                <Stack spacing={2}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Okno dostępności
                                    </Typography>
                                    <Box className={styles.formGrid}>
                                        <TextField
                                            fullWidth
                                            label="Data"
                                            type="date"
                                            value={formState.date}
                                            onChange={(e) => handleFormChange('date', e.target.value)}
                                        />
                                        <Box className={styles.formGridHalf}>
                                            <TextField
                                                label="Start"
                                                type="time"
                                                value={formState.start}
                                                onChange={(e) => handleFormChange('start', e.target.value)}
                                            />
                                            <TextField
                                                label="Koniec"
                                                type="time"
                                                value={formState.end}
                                                onChange={(e) => handleFormChange('end', e.target.value)}
                                            />
                                        </Box>
                                        <TextField
                                            fullWidth
                                            label="Długości spotkań (np. 30m,45m,1h)"
                                            value={formState.durations.join(', ')}
                                            onChange={(e) => handleDurationsChange(e.target.value)}
                                        />
                                        <FormControl fullWidth>
                                            <InputLabel>Początek co</InputLabel>
                                            <Select
                                                value={formState.snap}
                                                label="Początek co"
                                                onChange={(e) => handleFormChange('snap', e.target.value)}
                                            >
                                                <MenuItem value="15">15 minut</MenuItem>
                                                <MenuItem value="30">30 minut</MenuItem>
                                                <MenuItem value="60">60 minut</MenuItem>
                                                <MenuItem value="0">Bez blokady</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Minimalny odstęp między spotkaniami (min)"
                                            value={formState.buffer}
                                            onChange={(e) => handleFormChange('buffer', Number(e.target.value))}
                                            inputProps={{ min: 0, step: 5 }}
                                        />
                                        <FormControl fullWidth>
                                            <InputLabel>Szablon dnia</InputLabel>
                                            <Select
                                                value={formState.templateKey}
                                                label="Szablon dnia"
                                                onChange={(e) => handleFormChange('templateKey', e.target.value)}
                                            >
                                                {templates.map((template) => (
                                                    <MenuItem key={template.id} value={template.id}>
                                                        {template.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Stack>
                            )}
                        </DialogContent>

                        <DialogActions>
                            {modalView !== 'timeline' && (
                                <Button onClick={() => setModalView('timeline')}>Anuluj</Button>
                            )}
                            {modalView === 'timeline' && (
                                <Button onClick={() => setModalView('chooser')}>Dodaj wpis</Button>
                            )}
                            {modalView === 'createEvent' || modalView === 'createAvailability' ? (
                                <Button variant="contained" onClick={handleSubmit}>
                                    Zapisz szkic
                                </Button>
                            ) : null}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Paper>
    );
};

CreatorCalendar.propTypes = {
    events: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        meetingType: PropTypes.oneOf(['individual', 'group']),
        status: PropTypes.string,
        capacity: PropTypes.number,
        booked: PropTypes.number,
        color: PropTypes.string
    })),
    availabilityBlocks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
        durations: PropTypes.arrayOf(PropTypes.string).isRequired,
        buffer: PropTypes.number
    })),
    externalEvents: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        siteName: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        url: PropTypes.string
    })),
    templates: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        days: PropTypes.arrayOf(PropTypes.string)
    })),
    onCreateEvent: PropTypes.func,
    onCreateAvailability: PropTypes.func
};

CreatorCalendar.defaultProps = {
    events: [],
    availabilityBlocks: [],
    externalEvents: [],
    templates: [],
    onCreateEvent: undefined,
    onCreateAvailability: undefined
};

export default CreatorCalendar;
