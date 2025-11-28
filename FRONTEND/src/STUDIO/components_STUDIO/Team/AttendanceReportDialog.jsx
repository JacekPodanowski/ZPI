import { useMemo, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    CircularProgress,
    Button,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DAYS_PL = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];
const MONTHS_PL = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

const getActivityColor = (count) => {
    if (count === 0) return 'transparent';
    if (count === 1) return 'rgba(146, 0, 32, 0.25)';
    if (count <= 3) return 'rgba(146, 0, 32, 0.5)';
    if (count <= 5) return 'rgba(146, 0, 32, 0.75)';
    return 'rgb(146, 0, 32)';
};

const MiniActivityCalendar = ({ rows = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { daysInMonth, firstDayOfWeek, activityMap, totalMinutes } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        // Convert Sunday=0 to Monday=0 format
        const firstDayOfWeek = firstDay === 0 ? 6 : firstDay - 1;

        // Build activity map for current month
        const activityMap = {};
        let totalMinutes = 0;
        rows.forEach(row => {
            if (!row.start_time) return;
            const date = new Date(row.start_time);
            if (date.getFullYear() === year && date.getMonth() === month) {
                const day = date.getDate();
                activityMap[day] = (activityMap[day] || 0) + 1;
                totalMinutes += row.duration_minutes || 0;
            }
        });

        return { daysInMonth, firstDayOfWeek, activityMap, totalMinutes };
    }, [currentDate, rows]);

    const totalActivitiesThisMonth = Object.values(activityMap).reduce((sum, count) => sum + count, 0);

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const renderDays = () => {
        const days = [];
        // Empty cells before first day
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(<Box key={`empty-${i}`} sx={{ width: 32, height: 32 }} />);
        }
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const count = activityMap[day] || 0;
            days.push(
                <Tooltip key={day} title={count > 0 ? `${count} zajęć` : 'Brak zajęć'} arrow>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: count > 0 ? 600 : 400,
                            bgcolor: getActivityColor(count),
                            color: count > 3 ? '#fff' : 'inherit',
                            cursor: 'default',
                            transition: 'all 0.15s',
                            '&:hover': {
                                transform: count > 0 ? 'scale(1.1)' : 'none'
                            }
                        }}
                    >
                        {day}
                    </Box>
                </Tooltip>
            );
        }
        return days;
    };

    return (
        <Box>
            {/* Month navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <IconButton size="small" onClick={handlePrevMonth}>
                    <ChevronLeftIcon />
                </IconButton>
                <Typography variant="subtitle1" fontWeight={600}>
                    {MONTHS_PL[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Typography>
                <IconButton size="small" onClick={handleNextMonth}>
                    <ChevronRightIcon />
                </IconButton>
            </Box>

            {/* Day headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)', gap: 0.5, mb: 1 }}>
                {DAYS_PL.map(day => (
                    <Box
                        key={day}
                        sx={{
                            width: 32,
                            textAlign: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            opacity: 0.6
                        }}
                    >
                        {day}
                    </Box>
                ))}
            </Box>

            {/* Calendar grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)', gap: 0.5 }}>
                {renderDays()}
            </Box>

            {/* Summary stats */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                    Podsumowanie miesiąca
                </Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color="primary">
                            {totalActivitiesThisMonth}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>zajęć</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color="primary">
                            {Math.round(totalMinutes / 60 * 10) / 10}h
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>łącznie</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color="primary">
                            {Object.keys(activityMap).length}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>aktywnych dni</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Legend */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>Mniej</Typography>
                {[0, 1, 3, 5, 6].map(count => (
                    <Box
                        key={count}
                        sx={{
                            width: 14,
                            height: 14,
                            borderRadius: 0.5,
                            bgcolor: getActivityColor(count),
                            border: count === 0 ? '1px solid' : 'none',
                            borderColor: 'divider'
                        }}
                    />
                ))}
                <Typography variant="caption" sx={{ opacity: 0.6 }}>Więcej</Typography>
            </Box>
        </Box>
    );
};

const AttendanceReportDialog = ({
    open,
    onClose,
    loading,
    rows = [],
    total = 0,
    hostLabel,
    error,
    onDownload,
    downloadingFormat
}) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ pb: 1 }}>
                Raport zajęć
                {hostLabel && (
                    <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                        {hostLabel}
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent dividers sx={{ minHeight: 280 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress size={32} />
                    </Box>
                )}

                {!loading && error && (
                    <Alert severity="error">{error}</Alert>
                )}

                {!loading && !error && rows.length === 0 && (
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        Brak zarejestrowanych zajęć w tym okresie.
                    </Typography>
                )}

                {!loading && !error && rows.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <MiniActivityCalendar rows={rows} />
                        <Typography variant="caption" sx={{ mt: 2, opacity: 0.6, textAlign: 'center' }}>
                            Łącznie {total} zajęć. Pobierz raport aby zobaczyć szczegóły.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Generuj raport
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={downloadingFormat === 'csv' ? <CircularProgress size={16} /> : <DownloadIcon />}
                        onClick={() => onDownload?.('csv')}
                        disabled={loading || Boolean(downloadingFormat)}
                    >
                        CSV
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={downloadingFormat === 'xlsx' ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                        onClick={() => onDownload?.('xlsx')}
                        disabled={loading || Boolean(downloadingFormat)}
                        sx={{ bgcolor: 'rgb(146, 0, 32)', '&:hover': { bgcolor: 'rgb(114, 0, 21)' } }}
                    >
                        XLSX
                    </Button>
                    <Button onClick={onClose}>Zamknij</Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default AttendanceReportDialog;
