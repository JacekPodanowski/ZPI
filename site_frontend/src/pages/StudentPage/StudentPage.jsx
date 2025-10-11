import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { getMeetings, cancelMeetingSession } from '../../services/meetingService.js';
import styles from './StudentPage.module.css';
import { Box, Typography, CircularProgress, Alert, Button as MuiButton, Paper, Divider, Chip, Tooltip, Modal, Fade, Backdrop } from '@mui/material';
import { EventAvailable, History, Cancel, EventBusy, WarningAmber } from '@mui/icons-material';
import DiscordIcon from '../../components/Icons/DiscordIcon';
import GoogleMeetIcon from '../../components/Icons/GoogleMeetIcon';
import moment from 'moment';
import 'moment/locale/pl';

moment.locale('pl');

const aggregateMeetings = (meetings) => {
    if (!meetings || meetings.length === 0) return [];
    const sortedMeetings = [...meetings].sort((a, b) => 
        moment(a.time_slot_details.start_time).diff(moment(b.time_slot_details.start_time))
    );
    const aggregated = []; let currentSession = [];
    sortedMeetings.forEach((meeting) => {
        if (currentSession.length === 0) { currentSession.push(meeting); }
        else { const last = currentSession[currentSession.length - 1]; if (moment(last.time_slot_details.end_time).isSame(moment(meeting.time_slot_details.start_time)) && last.subject === meeting.subject && last.platform === meeting.platform) { currentSession.push(meeting); } else { aggregated.push(currentSession); currentSession = [meeting]; } }
    });
    if (currentSession.length > 0) { aggregated.push(currentSession); }
    return aggregated.map(session => { const first = session[0]; const last = session[session.length - 1]; return { session_id: session.map(m => m.id).join('-'), subject: first.subject, notes: first.notes, platform: first.platform, status: first.status, start_time: first.time_slot_details.start_time, end_time: last.time_slot_details.end_time, meeting_ids: session.map(m => m.id) }; });
};

const MeetingCard = ({ session, onCancel }) => {
    const canBeCancelled = moment(session.start_time).isAfter(moment()) && (session.status === 'pending' || session.status === 'confirmed');
    const statusMap = { 
        pending: { label: 'Oczekujące', color: 'warning', icon: <EventAvailable fontSize="inherit" /> }, 
        confirmed: { label: 'Potwierdzone', color: 'success', icon: <EventAvailable fontSize="inherit" /> }, 
        canceled: { label: 'Anulowane', color: 'error', icon: <EventBusy fontSize="inherit" /> }, 
        completed: { label: 'Zakończone', color: 'info', icon: <History fontSize="inherit" /> } 
    };
    const platformMap = { discord: { label: 'Discord', icon: <DiscordIcon sx={{ fontSize: 20 }} />, link: '#' }, google_meet: { label: 'Google Meet', icon: <GoogleMeetIcon sx={{ fontSize: 18 }} />, link: '#' } };
    const statusInfo = statusMap[session.status] || { label: session.status, color: 'default' };
    const platformInfo = platformMap[session.platform] || { label: session.platform, icon: null };
    const isInactive = session.status === 'completed' || session.status === 'canceled';

    return (
        <Paper className={`${styles.meetingCard} ${isInactive ? styles.pastCard : ''}`}>
            <Box className={styles.cardHeader}>
                <Typography variant="h6" className={styles.subjectTitle}>{session.subject}</Typography>
                <Chip icon={statusInfo.icon} label={statusInfo.label} color={statusInfo.color} size="small" variant="outlined" />
            </Box>
            <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <Box className={styles.cardBody}>
                <Typography variant="body2"><strong>Data:</strong> {moment(session.start_time).format('dddd, D MMMM YYYY')}</Typography>
                <Typography variant="body2"><strong>Godzina:</strong> {moment(session.start_time).format('HH:mm')} - {moment(session.end_time).format('HH:mm')}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="body2"><strong>Platforma:</strong></Typography>
                    <Tooltip title={`Dołącz do spotkania na ${platformInfo.label}`}>
                        <Chip icon={platformInfo.icon} label={platformInfo.label} component="a" href={platformInfo.link} clickable size="small" />
                    </Tooltip>
                </Box>
                {session.notes && <Typography variant="caption" className={styles.notes}><strong>Twoje uwagi:</strong> {session.notes}</Typography>}
            </Box>
            {canBeCancelled && (
                <Box className={styles.cardActions}>
                    <MuiButton variant="outlined" color="error" size="small" startIcon={<Cancel />} onClick={() => onCancel(session)}>Anuluj Sesję</MuiButton>
                </Box>
            )}
        </Paper>
    );
};

const MeetingsSection = ({ title, icon, sessions, onCancel, defaultOpen = false }) => (
    <details open={defaultOpen}>
        <summary className={styles.sectionHeader}>
            <Box className={styles.sectionHeaderContent}>{icon}<Typography variant="h5">{title}</Typography></Box>
        </summary>
        <Box className={styles.meetingList}>
            {sessions.length > 0 ? (sessions.map(session => <MeetingCard key={session.session_id} session={session} onCancel={onCancel} />)) : (<Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>Brak spotkań w tej kategorii.</Typography>)}
        </Box>
    </details>
);

function StudentPage() {
    const { user, isAuthenticated } = useAuth();
    const [aggregatedSessions, setAggregatedSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [sessionToCancel, setSessionToCancel] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchMyMeetings = useCallback(async () => {
        if (!user) return; setLoading(true); setError('');
        try {
            const response = await getMeetings({ student: user.id, page_size: 1000 });
            const rawMeetings = response.data.results || response.data || [];
            const sessions = aggregateMeetings(rawMeetings);
            setAggregatedSessions(sessions);
        } catch (err) { console.error('Error fetching student meetings:', err); setError('Nie udało się załadować Twoich spotkań. Spróbuj odświeżyć stronę.'); } 
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => {
        if (isAuthenticated) { fetchMyMeetings(); } else { setLoading(false); }
    }, [isAuthenticated, fetchMyMeetings]);

    const handleOpenCancelModal = (session) => { setSessionToCancel(session); setIsCancelModalOpen(true); };
    const handleCloseCancelModal = () => { if (isCancelling) return; setIsCancelModalOpen(false); setSessionToCancel(null); };

    // --- POCZĄTEK POPRAWKI: Logika anulowania używa nowej, sesyjnej funkcji ---
    const handleConfirmCancel = async () => {
        if (!sessionToCancel) return;
        setIsCancelling(true);
        try {
            // Wysyłamy jedno żądanie z tablicą ID spotkań
            await cancelMeetingSession(sessionToCancel.meeting_ids);
            
            // Po sukcesie, odświeżamy listę spotkań
            await fetchMyMeetings();
            
            handleCloseCancelModal();
        } catch (err) {
            alert(err.response?.data?.detail || 'Nie udało się anulować spotkania.');
            console.error("Cancel session error:", err);
        } finally {
            setIsCancelling(false);
        }
    };
    // --- KONIEC POPRAWKI ---
    
    if (loading) { return ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Ładowanie Twojego panelu...</Typography></Box> ); }
    if (!isAuthenticated) { return <Alert severity="warning" sx={{ m: 3 }}>Proszę się zalogować, aby zobaczyć swój panel.</Alert>; }

    const now = moment();

    const upcomingSessions = aggregatedSessions.filter(s => 
        moment(s.end_time).isSameOrAfter(now) && s.status !== 'canceled'
    );
    const pastSessions = aggregatedSessions
        .filter(s => moment(s.end_time).isBefore(now) || s.status === 'canceled')
        .map(s => {
            if (moment(s.end_time).isBefore(now) && (s.status === 'pending' || s.status === 'confirmed')) {
                return { ...s, status: 'completed' };
            }
            return s;
        });

    return (
        <Box className={`${styles.studentPage} page-enter`}>
            <Box className={styles.pageTitleContainer}><Typography variant="h4" component="h1">Panel Studenta</Typography><Typography variant="subtitle1" color="text.secondary">Witaj, {user?.first_name || user?.email}!</Typography></Box>
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            
            <MeetingsSection title="Nadchodzące Spotkania" icon={<EventAvailable sx={{ color: 'var(--accent-color-orange)' }} />} sessions={upcomingSessions} onCancel={handleOpenCancelModal} defaultOpen={true} />
            <MeetingsSection title="Historia Spotkań" icon={<History sx={{ color: 'var(--accent-color-orange)' }} />} sessions={pastSessions} onCancel={handleOpenCancelModal} />
            
            <Modal open={isCancelModalOpen} onClose={handleCloseCancelModal} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500 } }}>
                <Fade in={isCancelModalOpen}>
                    <Paper className={styles.cancelModalPaper}>
                        <Box className={styles.modalHeader}>
                            <WarningAmber sx={{ color: 'var(--accent-color-orange)' }} />
                            <Typography variant="h6" component="h2">Potwierdź anulowanie</Typography>
                        </Box>
                        <Box className={styles.modalBody}>
                            <Typography sx={{ fontSize: '1.125rem' }}> 
                                Czy na pewno chcesz anulować sesję: <strong>{sessionToCancel?.subject}</strong>?
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                Termin: <strong>{moment(sessionToCancel?.start_time).format('D MMMM YYYY, HH:mm')}</strong>
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 2, opacity: 0.8 }}>
                                Tej akcji nie można cofnąć, a zarezerwowane godziny staną się ponownie dostępne dla innych.
                            </Typography>
                        </Box>
                        <Box className={styles.modalActions}>
                            <MuiButton onClick={handleCloseCancelModal} disabled={isCancelling}>Wróć</MuiButton>
                            <MuiButton variant="contained" color="error" onClick={handleConfirmCancel} disabled={isCancelling}>
                                {isCancelling ? <CircularProgress size={24} color="inherit"/> : "Odwołaj"}
                            </MuiButton>
                        </Box>
                    </Paper>
                </Fade>
            </Modal>
        </Box>
    );
}

export default StudentPage;