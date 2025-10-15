import React, { useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/pl';
import { Box, Chip, CircularProgress, Container, Stack, Typography } from '@mui/material';
import PublicCalendar from '../../../SITES/components/PublicCalendar/PublicCalendar';
import useSiteCalendarData from '../../hooks/useSiteCalendarData';
import { CALENDAR_DATA_SOURCES, toEventsByDateMap } from '../../services/siteCalendarService';
import { MOCK_SITE_IDENTIFIER } from '../../data/mockSiteCalendar';

moment.locale('pl');

const PublicCalendarPage = () => {
    const { public: publicCalendar, status, error, siteIdentifier, dataSource } = useSiteCalendarData();

    const eventsByDate = useMemo(() => toEventsByDateMap(publicCalendar.events ?? []), [publicCalendar.events]);

    const dataSourceLabel = {
        [CALENDAR_DATA_SOURCES.API]: 'Źródło danych: backend API',
        [CALENDAR_DATA_SOURCES.MOCK]: 'Źródło danych: dane makietowe (mock)',
        [CALENDAR_DATA_SOURCES.UNKNOWN]: 'Źródło danych: trwa przygotowanie danych'
    };

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
                        Poniższy kalendarz prezentuje aktualne wydarzenia dostępne do rezerwacji w witrynie testowej
                        <strong> {siteIdentifier ?? MOCK_SITE_IDENTIFIER}</strong>.
                    </Typography>
                    <Stack alignItems="center" sx={{ mt: 2, gap: 1 }}>
                        <Chip
                            label={dataSourceLabel[dataSource] ?? dataSourceLabel[CALENDAR_DATA_SOURCES.UNKNOWN]}
                            color={dataSource === CALENDAR_DATA_SOURCES.API ? 'success' : dataSource === CALENDAR_DATA_SOURCES.MOCK ? 'warning' : 'default'}
                        />
                        {dataSource === CALENDAR_DATA_SOURCES.MOCK && (
                            <Typography variant="body2" sx={{ color: 'warning.main', maxWidth: 480 }}>
                                Backend nie zwrócił odpowiedzi – wyświetlamy stabilne dane makietowe, aby interfejs pozostał dostępny.
                            </Typography>
                        )}
                    </Stack>
                    {status === 'error' && (
                        <Typography variant="body2" sx={{ color: 'error.main', mt: 1 }}>
                            Nie udało się pobrać danych z API. Prezentujemy dane przykładowe. {error?.message}
                        </Typography>
                    )}
                </Box>
                {status === 'loading' && eventsByDate.size === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <PublicCalendar
                        eventsByDate={eventsByDate}
                        onDayClick={(day) => {
                            console.info('Day selected:', day.format('YYYY-MM-DD'));
                        }}
                    />
                )}
            </Stack>
        </Container>
    );
};

export default PublicCalendarPage;
