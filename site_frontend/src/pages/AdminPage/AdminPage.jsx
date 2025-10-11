import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { getMeetings, confirmMeetingSession, cancelMeetingSession, deleteAllPastMeetings } from '../../services/meetingService.js';
import styles from './AdminPage.module.css';
import CustomCalendarAdmin from '../../components/CustomCalendarAdmin/CustomCalendarAdmin';
import { Paper, Typography, CircularProgress, Alert, Box, Card, CardContent, CardActions, Divider, Tooltip, Chip, Button as MuiButton, Modal, Fade, Backdrop } from '@mui/material';
import { CheckCircleOutline as ConfirmIcon, DeleteForever, EventAvailable, History, WarningAmber } from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/pl';

moment.locale('pl');

const STYLE_CONFIG = {
    dayHeader: {
        fontSize: '1.4rem',
        fontWeight: 650,
    },
    timeDisplay: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#f5f5f5'
    },
    sectionIcon: {
        fontSize: '2.5rem',
        mr: 1.5,
    }
};

// ... (aggregateMeetings i MeetingCardAdmin bez zmian) ...
const aggregateMeetings = (meetings) => {
    if (!meetings || meetings.length === 0) return [];
    const sortedMeetings = [...meetings].sort((a, b) =>
        moment(a.time_slot_details.start_time).diff(moment(b.time_slot_details.start_time))
    );
    const aggregated = [];
    let currentSession = [];
    sortedMeetings.forEach((meeting) => {
        if (currentSession.length === 0) {
            currentSession.push(meeting);
        } else {
            const last = currentSession[currentSession.length - 1];
            const isContinuation = moment(last.time_slot_details.end_time).isSame(moment(meeting.time_slot_details.start_time));
            const isSameDetails = last.subject === meeting.subject && last.platform === meeting.platform && last.student?.id === meeting.student?.id;
            if (isContinuation && isSameDetails) {
                currentSession.push(meeting);
            } else {
                aggregated.push(currentSession);
                currentSession = [meeting];
            }
        }
    });
    if (currentSession.length > 0) {
        aggregated.push(currentSession);
    }
    return aggregated.map(session => {
        const first = session[0];
        const last = session[session.length - 1];
        return {
            session_id: session.map(m => m.id).join('-'), subject: first.subject,
            student_details: first.student_details, notes: first.notes, platform: first.platform,
            status: first.status, start_time: first.time_slot_details.start_time,
            end_time: last.time_slot_details.end_time, meeting_ids: session.map(m => m.id)
        };
    });
};

const MeetingCardAdmin = ({ session, onConfirm, onDelete }) => {
    const isPast = moment(session.start_time).isBefore(moment());
    const studentName = session.student_details ? `${session.student_details.first_name} ${session.student_details.last_name || ''}`.trim() : 'Brak danych';
    const statusMap = {
        pending: { label: 'Oczekujące', color: 'warning' },
        confirmed: { label: 'Potwierdzone', color: 'success' },
    };
    const statusInfo = statusMap[session.status] || { label: 'Archiwalne', color: 'default' };
    const displayTime = `${moment(session.start_time).format('HH:mm')} - ${moment(session.end_time).format('HH:mm')}`;

    return (
        <Card className={`${styles.meetingCard} ${isPast ? styles.pastCard : ''}`}>
            <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" className={styles.meetingCardTitle}>{session.subject}</Typography>
                    <Chip label={statusInfo.label} color={statusInfo.color} size="small" variant="outlined" />
                </Box>
                <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <Typography variant="body2" className={styles.meetingCardText}><strong>Student:</strong> {studentName}</Typography>
                <Typography variant="body2" className={styles.meetingCardText}><strong>E-mail:</strong> {session.student_details?.email || 'Brak'}</Typography>
                <Typography variant="body2" className={styles.meetingCardText}>
                    <strong>Godzina:</strong>
                    <Box component="span" sx={{
                        fontWeight: STYLE_CONFIG.timeDisplay.fontWeight,
                        fontSize: STYLE_CONFIG.timeDisplay.fontSize,
                        color: STYLE_CONFIG.timeDisplay.color,
                        ml: 1
                    }}>
                        {displayTime}
                    </Box>
                </Typography>
                {session.notes && <Tooltip title={session.notes}><Typography variant="caption" className={styles.notes}><strong>Uwagi:</strong> {session.notes}</Typography></Tooltip>}
            </CardContent>
            <CardActions className={styles.cardActions}>
                {session.status === 'pending' && (
                    <Tooltip title="Potwierdź spotkanie">
                        <MuiButton size="small" color="success" startIcon={<ConfirmIcon />} onClick={() => onConfirm(session)}>
                            Potwierdź
                        </MuiButton>
                    </Tooltip>
                )}
                <Tooltip title="Usuń spotkanie na stałe">
                    <MuiButton size="small" color="error" startIcon={<DeleteForever />} sx={{ ml: 'auto' }} onClick={() => onDelete(session)}>
                        Usuń
                    </MuiButton>
                </Tooltip>
            </CardActions>
        </Card>
    );
};

const MeetingsSectionAdmin = ({ title, icon, sessions, onConfirm, onDelete, defaultOpen = false, children }) => {
    const groupedByDate = sessions.reduce((acc, session) => {
        const date = moment(session.start_time).format('YYYY-MM-DD');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(session);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
        return title.toLowerCase().includes('nadchodzące') ? moment(a).diff(moment(b)) : moment(b).diff(moment(a));
    });

    return (
        <details open={defaultOpen}>
            <summary className={styles.sectionHeader}>
                <Box className={styles.sectionHeaderContent} sx={{ alignItems: 'center' }}>
                    {React.cloneElement(icon, { sx: { ...icon.props.sx, ...STYLE_CONFIG.sectionIcon } })}
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        className={styles.pageHeader}
                        sx={{
                            position: 'relative',
                            top: '10px',
                            margin: 0  
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
            </summary>
            <Box className={styles.sectionContent}>
                {children}
                {sortedDates.length > 0 ? (
                    sortedDates.map((date, index) => (
                        <Box key={date} className={styles.dayGroup}>
                            {index > 0 && <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
                            <Typography 
                                variant="h6"
                                className={styles.dayGroupHeader}
                                sx={{ 
                                    fontWeight: STYLE_CONFIG.dayHeader.fontWeight,
                                    fontSize: STYLE_CONFIG.dayHeader.fontSize,
                                }}
                            >
                                {moment(date).format('dddd, D MMMM YYYY').replace(/^\w/, c => c.toUpperCase())}
                            </Typography>
                            <Box className={styles.meetingList}>
                                {groupedByDate[date].map(session => (
                                    <MeetingCardAdmin key={session.session_id} session={session} onConfirm={onConfirm} onDelete={onDelete} />
                                ))}
                            </Box>
                        </Box>
                    ))
                ) : (
                    <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>Brak spotkań w tej kategorii.</Typography>
                )}
            </Box>
        </details>
    );
};


function AdminPage() {
    const { user, isAuthenticated } = useAuth();
    const [aggregatedSessions, setAggregatedSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalState, setModalState] = useState({ open: false, data: null, type: '', text: '' });

    const fetchAllMeetings = useCallback(async () => {
        if (!isAuthenticated || user?.user_type !== 'admin') {
            setLoading(false);
            return;
        }
        setLoading(true); setError('');
        try {
            const params = { page_size: 1000, ordering: 'time_slot__start_time' };
            const response = await getMeetings(params);
            const sessions = aggregateMeetings(response.data.results || response.data || []);
            setAggregatedSessions(sessions);
        } catch (err) { console.error('Error fetching meetings for admin:', err); setError('Nie udało się załadować listy spotkań.'); }
        finally { setLoading(false); }
    }, [isAuthenticated, user]);

    useEffect(() => { fetchAllMeetings(); }, [fetchAllMeetings]);

    const handleOpenModal = (data, type) => {
        const textMap = {
            delete: `Czy na pewno chcesz permanentnie usunąć sesję "${data.subject}" ze studentem ${data.student_details.email}? Slot(y) zostaną zwolnione.`,
            deleteAllPast: `Czy na pewno chcesz usunąć WSZYSTKIE ${data.count} archiwalne spotkania? Tej akcji nie można cofnąć.`,
            confirm: `Czy chcesz potwierdzić sesję "${data.subject}" ze studentem ${data.student_details.email}?`,
        };
        setModalState({ open: true, data, type, text: textMap[type] });
    };

    const handleCloseModal = () => setModalState({ open: false, data: null, type: '', text: '' });

    const handleConfirmAction = async () => {
        const { data, type } = modalState;
        if (!data) return;
        try {
            if (type === 'delete') {
                await cancelMeetingSession(data.meeting_ids);
            } else if (type === 'deleteAllPast') {
                await deleteAllPastMeetings();
            } else if (type === 'confirm') {
                await confirmMeetingSession(data.meeting_ids);
            }
            await fetchAllMeetings();
        } catch (err) {
            alert(err.response?.data?.detail || 'Operacja nie powiodła się.');
        } finally {
            handleCloseModal();
        }
    };

    if (!isAuthenticated || user?.user_type !== 'admin') { return <Alert severity="warning" sx={{ m: 3 }}>Brak uprawnień do tej strony.</Alert>; }

    const upcomingSessions = aggregatedSessions.filter(s => moment(s.end_time).isSameOrAfter(moment()) && s.status !== 'canceled' && s.status !== 'completed');
    const pastSessions = aggregatedSessions.filter(s => moment(s.end_time).isBefore(moment()) || s.status === 'canceled' || s.status === 'completed');

    return (
        <Box className={`${styles.adminPageContainer} container page-enter`}>
            <Box className={styles.mainContentWrapper}>
                <Box className={styles.calendarContainer}>
                    {user?.id && <CustomCalendarAdmin adminTutorId={user.id} key={`admin-calendar-${user.id}`} onDataChange={fetchAllMeetings} />}
                </Box>
                <Paper elevation={3} className={styles.meetingsSection}>
                    <Typography variant="h4" component="h1" className={styles.pageHeader}>Spotkania</Typography>
                    {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box> : error ? <Alert severity="error">{error}</Alert> : (
                        <>
                            <MeetingsSectionAdmin
                                title="Nadchodzące Spotkania"
                                icon={<EventAvailable sx={{ color: 'var(--accent-color-orange)' }} />}
                                sessions={upcomingSessions}
                                onConfirm={(session) => handleOpenModal(session, 'confirm')}
                                onDelete={(session) => handleOpenModal(session, 'delete')}
                                defaultOpen={true}
                            />
                            <MeetingsSectionAdmin
                                title="Historia Spotkań"
                                icon={<History sx={{ color: 'var(--accent-color-orange)' }} />}
                                sessions={pastSessions}
                                onConfirm={() => { }}
                                onDelete={(session) => handleOpenModal(session, 'delete')}
                            >
                                {pastSessions.length > 0 && (
                                    <Box className={styles.deleteAllContainer}>
                                        <MuiButton
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleOpenModal({ count: pastSessions.length }, 'deleteAllPast')}
                                            startIcon={<DeleteForever />}
                                        >
                                            Usuń wszystkie archiwalne
                                        </MuiButton>
                                    </Box>
                                )}
                            </MeetingsSectionAdmin>
                        </>
                    )}
                </Paper>
            </Box>

            <Modal open={modalState.open} onClose={handleCloseModal} closeAfterTransition slots={{ backdrop: Backdrop }}>
                <Fade in={modalState.open}>
                    <Paper className={styles.confirmModalPaper}>
                        <Box className={styles.modalHeader}><WarningAmber sx={{ color: 'var(--accent-color-orange)' }} /><Typography variant="h6">Potwierdź akcję</Typography></Box>
                        <Typography className={styles.modalBody}>{modalState.text}</Typography>
                        <Box className={styles.modalActions}>
                            <MuiButton onClick={handleCloseModal}>Anuluj</MuiButton>
                            <MuiButton variant="contained" color={modalState.type === 'delete' || modalState.type === 'deleteAllPast' ? 'error' : 'primary'} onClick={handleConfirmAction}>
                                Tak, potwierdź
                            </MuiButton>
                        </Box>
                    </Paper>
                </Fade>
            </Modal>
        </Box>
    );
}

export default AdminPage;