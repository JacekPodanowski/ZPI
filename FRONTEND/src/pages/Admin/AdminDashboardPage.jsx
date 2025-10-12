import React, { useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/pl';
import { Box, Container, Stack, Typography } from '@mui/material';
import AdminCalendar from '../../editor/components/AdminCalendar';

moment.locale('pl');

const AdminDashboardPage = () => {
    const calendarData = useMemo(
        () => ({
            events: [
                {
                    id: 'event-1',
                    date: moment().format('YYYY-MM-DD'),
                    start: '09:30',
                    end: '10:45',
                    title: 'Sesja oddechowa',
                    meetingType: 'individual',
                    status: 'Zarezerwowane',
                    capacity: 1,
                    booked: 1,
                    color: '#A00016'
                },
                {
                    id: 'event-2',
                    date: moment().add(1, 'day').format('YYYY-MM-DD'),
                    start: '18:00',
                    end: '19:30',
                    title: 'Wieczorna joga',
                    meetingType: 'group',
                    capacity: 15,
                    booked: 4,
                    color: '#770016'
                }
            ],
            availability: [
                {
                    id: 'avail-1',
                    date: moment().format('YYYY-MM-DD'),
                    start: '12:00',
                    end: '15:00',
                    durations: ['30m', '45m', '60m'],
                    buffer: 15
                }
            ],
            external: [
                {
                    id: 'ext-1',
                    siteName: 'Mindful Studio',
                    date: moment().format('YYYY-MM-DD'),
                    start: '16:00',
                    end: '17:00',
                    title: 'Warsztat zespołu',
                    url: 'https://example.com'
                }
            ],
            templates: [
                {
                    id: 'weekday',
                    name: 'Szablon tygodniowy',
                    days: [moment().format('YYYY-MM-DD')]
                }
            ]
        }),
        []
    );

    const handleCreateEvent = (payload) => {
        console.info('Draft event payload', payload);
    };

    const handleCreateAvailability = (payload) => {
        console.info('Draft availability payload', payload);
    };

    return (
        <Container maxWidth="xl">
            <Stack spacing={4}>
                <Box>
                    <Typography variant="overline" sx={{ letterSpacing: 3, color: 'secondary.main' }}>
                        Panel administratora
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, mt: 1 }}>
                        Planowanie spotkań i dostępności
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2, maxWidth: 840 }}>
                        Zarządzaj kalendarzem dla wszystkich swoich witryn. Dodawaj wydarzenia stałe, definiuj okna dostępności, a gdy klient zarezerwuje termin, system automatycznie stworzy wydarzenie w kalendarzu.
                    </Typography>
                </Box>

                <AdminCalendar
                    events={calendarData.events}
                    availabilityBlocks={calendarData.availability}
                    externalEvents={calendarData.external}
                    templates={calendarData.templates}
                    onCreateEvent={handleCreateEvent}
                    onCreateAvailability={handleCreateAvailability}
                />
            </Stack>
        </Container>
    );
};

export default AdminDashboardPage;
