import React from 'react';
import { Box, Button, Chip, CircularProgress, Container, CssBaseline, Stack, Typography } from '@mui/material';
import CreatorCalendar from '../../../SITES/components/CreatorCalendar/CreatorCalendar';
import useSiteCalendarData from '../../../SITES/hooks/useSiteCalendarData';
import { CALENDAR_DATA_SOURCES } from '../../../SITES/services/siteCalendarService';
import { MOCK_SITE_IDENTIFIER } from '../../../SITES/data/mockSiteCalendar';

const CreatorCalendarApp = () => {
    const { status, error, creator, refresh, siteIdentifier, dataSource } = useSiteCalendarData();

    const dataSourceLabel = dataSource === CALENDAR_DATA_SOURCES.API
        ? 'Źródło danych: backend API'
        : dataSource === CALENDAR_DATA_SOURCES.MOCK
            ? 'Źródło danych: dane makietowe (mock)'
            : 'Źródło danych: trwa przygotowanie danych';

    const handleCreateEvent = (payload) => {
        // eslint-disable-next-line no-console
        console.info('New event draft', payload);
    };

    const handleCreateAvailability = (payload) => {
        // eslint-disable-next-line no-console
        console.info('New availability draft', payload);
    };

    const isLoading = status === 'loading' && creator.events.length === 0 && creator.availabilityBlocks.length === 0;

    return (
        <>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Stack spacing={2} sx={{ mb: 4 }}>
                    <Box>
                        <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: 3 }}>
                            Podgląd środowiska deweloperskiego
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            Kalendarz twórcy
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                            Ten ekran pobiera dane kalendarza dla witryny <strong>{siteIdentifier ?? MOCK_SITE_IDENTIFIER}</strong>.
                            Informujemy na bieżąco, czy pracujesz na danych z backendu, czy na bezpiecznych danych makietowych przeznaczonych do prototypowania.
                        </Typography>
                    </Box>
                    <Chip
                        label={dataSourceLabel}
                        color={dataSource === CALENDAR_DATA_SOURCES.API ? 'success' : dataSource === CALENDAR_DATA_SOURCES.MOCK ? 'warning' : 'default'}
                        sx={{ alignSelf: 'flex-start' }}
                    />
                    {status === 'error' && (
                        <Typography variant="body2" sx={{ color: 'error.main' }}>
                            Wystąpił problem z pobraniem danych z API. Wyświetlamy dane przykładowe. {error?.message}
                        </Typography>
                    )}
                    {dataSource === CALENDAR_DATA_SOURCES.API && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Dane pochodzą z endpointu <code>/sites/{siteIdentifier ?? MOCK_SITE_IDENTIFIER}/calendar/</code>.
                        </Typography>
                    )}
                    {dataSource === CALENDAR_DATA_SOURCES.MOCK && (
                        <Typography variant="body2" sx={{ color: 'warning.main' }}>
                            Backend API nie zwrócił odpowiedzi – korzystasz z danych makietowych, które ułatwiają testowanie interfejsu.
                        </Typography>
                    )}
                    {status !== 'loading' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Aktualizuj dane ręcznie, aby zsynchronizować się z backendem:
                            </Typography>
                            <Button size="small" variant="outlined" onClick={refresh} disabled={status === 'loading'}>
                                Odśwież dane
                            </Button>
                        </Box>
                    )}
                </Stack>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <CreatorCalendar
                        events={creator.events}
                        availabilityBlocks={creator.availabilityBlocks}
                        externalEvents={creator.externalEvents}
                        templates={creator.templates}
                        onCreateEvent={handleCreateEvent}
                        onCreateAvailability={handleCreateAvailability}
                    />
                )}
            </Container>
        </>
    );
};

export default CreatorCalendarApp;
