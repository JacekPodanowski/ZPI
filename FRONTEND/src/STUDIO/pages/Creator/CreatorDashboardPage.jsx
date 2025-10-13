import React from 'react';
import { Box, CircularProgress, Container, Stack, Typography } from '@mui/material';
import CreatorCalendar from '../../../SITES/components/CreatorCalendar/CreatorCalendar';
import useSiteCalendarData from '../../../SITES/hooks/useSiteCalendarData';
import { MOCK_SITE_IDENTIFIER } from '../../../SITES/data/mockSiteCalendar';

const CreatorDashboardPage = () => {
    const { creator, status, error, siteIdentifier } = useSiteCalendarData();

    const handleCreateEvent = (payload) => {
        // eslint-disable-next-line no-console
        console.info('Draft event payload', payload);
    };

    const handleCreateAvailability = (payload) => {
        // eslint-disable-next-line no-console
        console.info('Draft availability payload', payload);
    };

    return (
        <Container maxWidth="xl">
            <Stack spacing={4}>
                <Box>
                    <Typography variant="overline" sx={{ letterSpacing: 3, color: 'secondary.main' }}>
                        Panel twórcy
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, mt: 1 }}>
                        Planowanie spotkań i dostępności
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2, maxWidth: 840 }}>
                        Zarządzaj kalendarzem dla wszystkich swoich witryn. Dane w tym widoku pobieramy dla środowiska deweloperskiego witryny
                        <strong> {siteIdentifier ?? MOCK_SITE_IDENTIFIER}</strong>. Gdy backend będzie gotowy, komponent automatycznie wczyta prawdziwe dane.
                    </Typography>
                    {status === 'error' && (
                        <Typography variant="body2" sx={{ color: 'error.main', mt: 1 }}>
                            Nie udało się pobrać danych z API. Wyświetlamy dane makiety. {error?.message}
                        </Typography>
                    )}
                </Box>
                {status === 'loading' && creator.events.length === 0 ? (
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
            </Stack>
        </Container>
    );
};

export default CreatorDashboardPage;
