import React, { useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/pl';
import { Box, Container, Stack, Typography } from '@mui/material';
import PublicCalendar from '../../site-template/components/PublicCalendar';

moment.locale('pl');

const PublicCalendarPage = () => {
    const eventsByDate = useMemo(() => {
        const map = new Map();
        const addEvent = (offset, title) => {
            const date = moment().add(offset, 'day').format('YYYY-MM-DD');
            if (!map.has(date)) {
                map.set(date, []);
            }
            map.get(date).push({ id: `${date}-${title}`, title });
        };

        addEvent(0, 'Sesja oddechowa 1:1');
        addEvent(0, 'Zajęcia grupowe Yin Joga');
        addEvent(2, 'Warsztat Mindfulness');
        addEvent(4, 'Weekend regeneracyjny');

        return map;
    }, []);

    return (
        <Container maxWidth="lg">
            <Stack spacing={4}>
                <Box sx={{ textAlign: 'center', mt: { xs: 0, md: 2 } }}>
                    <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: 3 }}>
                        Rezerwacje publiczne
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, mt: 1 }}>
                        Wybierz dogodny termin zajęć
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2, maxWidth: 720, mx: 'auto' }}>
                        Poniższy kalendarz prezentuje aktualne wydarzenia dostępne do rezerwacji. Wybierz dzień, aby przejść do pełnej listy spotkań i dokończyć zapis.
                    </Typography>
                </Box>
                <PublicCalendar
                    eventsByDate={eventsByDate}
                    onDayClick={(day) => {
                        console.info('Day selected:', day.format('YYYY-MM-DD'));
                    }}
                />
            </Stack>
        </Container>
    );
};

export default PublicCalendarPage;
