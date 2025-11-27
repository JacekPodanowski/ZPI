import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    CircularProgress,
    Button,
    Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const formatDateTime = (value) => {
    if (!value) return '-';
    try {
        return new Intl.DateTimeFormat('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(value));
    } catch (error) {
        return value;
    }
};

const AttendanceReportDialog = ({
    open,
    onClose,
    loading,
    rows = [],
    total = 0,
    limit,
    hostLabel,
    error,
    onDownload,
    downloadingFormat
}) => {
    const isLimited = typeof limit === 'number';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Zajęcie</TableCell>
                                    <TableCell sx={{ width: 140 }}>Czas trwania</TableCell>
                                    <TableCell sx={{ width: 220 }}>Data rozpoczęcia</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.title}</TableCell>
                                        <TableCell>{row.duration_minutes} min</TableCell>
                                        <TableCell>{formatDateTime(row.start_time)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                            Pokazano {rows.length} z {total} wierszy
                            {isLimited && total > rows.length ? ` (limit ${limit})` : ''}.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Eksportuj raport jako plik
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => onDownload?.('csv')}
                        disabled={loading || Boolean(downloadingFormat)}
                    >
                        CSV
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
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
