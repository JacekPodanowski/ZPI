import React, { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/pl';
import { Box, Container, CssBaseline, Typography } from '@mui/material';
import WelcomePage from './pages/WelcomePage';
import TemplatePicker from './pages/TemplatePicker';
import ModuleConfig from './pages/ModuleConfig';
import EditorPage from './pages/EditorPage';
import StudioPage from './pages/StudioPage';
import AdminCalendar from './components/AdminCalendar';

moment.locale('pl');

function CalendarPage() {
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
    ]
  }), []);

  const handleCreateEvent = (payload) => console.info('New event draft', payload);
  const handleCreateAvailability = (payload) => console.info('New availability draft', payload);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Kalendarz zajęć
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
            Zarządzaj spotkaniami i dostępnością.
          </Typography>
        </Box>
        <AdminCalendar
          events={calendarData.events}
          availabilityBlocks={calendarData.availability}
          onCreateEvent={handleCreateEvent}
          onCreateAvailability={handleCreateAvailability}
        />
      </Container>
    </>
  );
}

function EditorApp() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/studio" element={<StudioPage />} />
      <Route path="/templates" element={<TemplatePicker />} />
      <Route path="/configure/:templateId" element={<ModuleConfig />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
    </Routes>
  );
}

export default EditorApp;
