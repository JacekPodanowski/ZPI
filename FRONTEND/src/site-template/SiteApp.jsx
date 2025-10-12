import React, { useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/pl';
import { Box, Container, CssBaseline, Typography } from '@mui/material';
import PublicCalendar from './components/PublicCalendar';

moment.locale('pl');

const SiteApp = () => {

    const eventsByDate = useMemo(() => {
        const map = new Map();
        const addEvent = (offsetDays, title) => {
            const date = moment().add(offsetDays, 'day').format('YYYY-MM-DD');
            if (!map.has(date)) {
                map.set(date, []);
            }
            map.get(date).push({ id: `${date}-${title}`, title });
        };

        addEvent(0, 'Spotkanie 1:1');
        addEvent(1, 'Grupa oddechowa');
        addEvent(1, 'Joga o zachodzie');
        addEvent(4, 'Weekendowy warsztat');

        return map;
    }, []);

    return (
        <>
            <CssBaseline />
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Zarezerwuj sesję
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                        Wybierz dogodny termin, a my potwierdzimy Twoją rezerwację tak szybko, jak to możliwe.
                    </Typography>
                </Box>
                <PublicCalendar eventsByDate={eventsByDate} onDayClick={(day) => console.info('Selected day', day.format('YYYY-MM-DD'))} />
            </Container>
        </>
    );
};

export default SiteApp;
