import React, { useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/pl';
import { Box, Container, CssBaseline, Typography } from '@mui/material';
import AdminCalendar from './components/AdminCalendar';

moment.locale('pl');

const EditorApp = () => {
    const calendarData = useMemo(() => ({
        events: [
            {
                id: 'event-1',
                date: moment().format('YYYY-MM-DD'),
                start: '09:30',
                end: '10:45',
                title: 'Sesja oddechowa',
                meetingType: 'individual',
                status: 'Anna Kowalska',
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
                url: 'https://example.com/admin'
            }
        ],
        templates: [
            {
                id: 'weekday',
                name: 'Szablon tygodniowy',
                days: [moment().format('YYYY-MM-DD')]
            }
        ]
    }), []);

    const handleCreateEvent = (payload) => {
        console.info('New event draft', payload);
    };

    const handleCreateAvailability = (payload) => {
        console.info('New availability draft', payload);
    };

    return (
        <>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Kalendarz zajęć
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                        Zarządzaj spotkaniami, blokami dostępności i szablonami tygodni.
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
            </Container>
        </>
    );
};

export default EditorApp;
