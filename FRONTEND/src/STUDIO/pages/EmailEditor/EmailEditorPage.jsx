import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tab,
  Tabs,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
  List,
  ListItemButton,
  ListItemText,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import useTheme from '../../../theme/useTheme';
import apiClient from '../../../services/apiClient';
import { useToast } from '../../../contexts/ToastContext';
import Navigation from '../../../components/Navigation/Navigation';

// Component to render email HTML in an isolated iframe
const EmailPreviewFrame = ({ html }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && html) {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
      
      // Auto-resize iframe to content height
      const resizeIframe = () => {
        if (iframeRef.current) {
          const iframeBody = iframeDoc.body;
          const iframeHtml = iframeDoc.documentElement;
          const height = Math.max(
            iframeBody?.scrollHeight || 0,
            iframeBody?.offsetHeight || 0,
            iframeHtml?.clientHeight || 0,
            iframeHtml?.scrollHeight || 0,
            iframeHtml?.offsetHeight || 0
          );
          iframeRef.current.style.height = height + 'px';
        }
      };

      // Resize after content loads
      setTimeout(resizeIframe, 100);
      // Also resize on window resize
      window.addEventListener('resize', resizeIframe);
      
      return () => window.removeEventListener('resize', resizeIframe);
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: '100%',
        border: 'none',
        minHeight: '500px',
        backgroundColor: 'white'
      }}
      title="Email Preview"
      sandbox="allow-same-origin allow-scripts"
    />
  );
};

const EmailEditorPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;
  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const addToast = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [templateType, setTemplateType] = useState('default'); // 'default', 'custom', or 'dev'
  const [saving, setSaving] = useState(false);

  // Editor state - directly editable
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Test email state
  const [testEmail, setTestEmail] = useState({
    from_email: '',
    to_email: '',
    language: 'pl',
    test_data: {}
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    // Auto-select first template of the selected type when templates load or type changes
    if (templates.length === 0) return;
    
    const filteredTemplates = templates.filter(t => {
      if (templateType === 'dev') return t.category === 'dev';
      if (templateType === 'default') return t.is_default && t.category !== 'dev';
      return !t.is_default && t.category !== 'dev';
    });
    
    if (filteredTemplates.length > 0 && !selectedTemplate) {
      handleTemplateClick(filteredTemplates[0]);
    }
  }, [templates, templateType]);

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get('/user-emails/');
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setTemplates(payload);
    } catch (err) {
      addToast?.('Nie udało się pobrać szablonów email', {variant: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTemplates = () => {
    return templates.filter(t => {
      if (templateType === 'dev') return t.category === 'dev';
      if (templateType === 'default') return t.is_default && t.category !== 'dev';
      return !t.is_default && t.category !== 'dev';
    });
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setEditedTemplate({ ...template });
  };

  const handleSaveTemplate = async () => {
    try {
      if (!editedTemplate.name || !editedTemplate.slug) {
        addToast?.('Proszę wypełnić nazwę i slug szablonu', {variant: 'error'});
        return;
      }

      setSaving(true);

      if (selectedTemplate && !selectedTemplate.is_default) {
        // Update existing custom template
        await apiClient.patch(`/user-emails/${selectedTemplate.id}/`, editedTemplate);
        addToast?.('Szablon zaktualizowany', {variant: 'success'});
      } else {
        // Create new template (or copy of default)
        const payload = { ...editedTemplate };
        if (!payload.slug) {
          payload.slug = payload.name.toLowerCase().replace(/\s+/g, '-');
        }
        payload.is_default = false; // Ensure new templates are custom
        await apiClient.post('/user-emails/', payload);
        addToast?.('Nowy szablon utworzony', {variant: 'success'});
        setTemplateType('custom'); // Switch to custom view
      }

      await fetchTemplates();
    } catch (err) {
      addToast?.('Błąd podczas zapisywania szablonu', {variant: 'error'});
      console.error('Error saving template:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (template.is_default) {
      addToast?.('Nie można usunąć domyślnego szablonu', {variant: 'error'});
      return;
    }

    if (!window.confirm(`Czy na pewno chcesz usunąć szablon "${template.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/user-emails/${template.id}/`);
      addToast?.('Szablon usunięty', {variant: 'success'});
      setSelectedTemplate(null);
      setEditedTemplate(null);
      await fetchTemplates();
    } catch (err) {
      addToast?.('Błąd podczas usuwania szablonu', {variant: 'error'});
      console.error('Error deleting template:', err);
    }
  };

  const handleSendTest = async () => {
    try {
      if (!selectedTemplate) {
        addToast?.('Wybierz szablon', {variant: 'error'});
        return;
      }

      if (!testEmail.from_email || !testEmail.to_email) {
        addToast?.('Wypełnij adresy email', {variant: 'error'});
        return;
      }

      await apiClient.post('/emails/test/', {
        template_id: selectedTemplate.id,
        from_email: testEmail.from_email,
        to_email: testEmail.to_email,
        language: testEmail.language,
        test_data: testEmail.test_data
      });

      addToast?.(`Testowy email wysłany na ${testEmail.to_email}`, {variant: 'success'});
      setTestEmailOpen(false);
    } catch (err) {
      addToast?.('Błąd podczas wysyłania testowego maila', {variant: 'error'});
      console.error('Error sending test email:', err);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      booking_confirmation: 'Potwierdzenie rezerwacji',
      session_cancelled_by_creator: 'Odwołanie rezerwacji',
      dev: 'Development/Testing'
    };
    return labels[category] || category;
  };

  const getCurrentContent = () => {
    if (!editedTemplate) return '';
    let content = editedTemplate.content_pl || '';
    
    // Replace template variables with mock data
    const mockData = {
      client_name: 'Jan Kowalski',
      student_name: 'Jan Kowalski',
      owner_name: 'Anna Nowak',
      event_title: 'Sesja Jogi dla Początkujących',
      event_date: '15 grudnia 2025',
      event_time: '18:00',
      event_duration: '60 minut',
      cancellation_link: '#',
      cancellation_deadline: '48 godzin',
      booking_date: '10 grudnia 2025',
      reason: 'Zmiana planów',
      session_title: 'Sesja Jogi dla Początkujących',
      session_date: '15 grudnia 2025',
      session_time: '18:00',
      subject: 'Sesja Jogi dla Początkujących',
      date: '15 grudnia 2025',
      start_time: '18:00',
      end_time: '19:00',
      calendar_url: '#'
    };
    
    Object.keys(mockData).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      content = content.replace(regex, mockData[key]);
    });
    
    return content;
  };

  const getCurrentSubject = () => {
    if (!editedTemplate) return '';
    return editedTemplate.subject_pl || '';
  };

  const updateCurrentContent = (newContent) => {
    if (!editedTemplate) return;
    setEditedTemplate({ ...editedTemplate, content_pl: newContent });
  };

  const updateCurrentSubject = (newSubject) => {
    if (!editedTemplate) return;
    setEditedTemplate({ ...editedTemplate, subject_pl: newSubject });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: theme.colors?.bg?.default || theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const filteredTemplates = getFilteredTemplates();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.colors?.bg?.default || theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Navigation />

      {/* Main Editor Layout */}
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, right: 24, zIndex: 10 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveTemplate}
            disabled={saving || !editedTemplate}
            sx={{
              backgroundColor: accentColor,
              '&:hover': { backgroundColor: alpha(accentColor, 0.9) }
            }}
          >
            {saving ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </Box>

        {/* Left Sidebar - Template List */}
        <Paper
          elevation={0}
          sx={{
            width: '250px',
            backgroundColor: surfaceColor,
            borderRadius: 0,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '100%'
          }}
        >
          {/* Template type toggle */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <ToggleButtonGroup
              value={templateType}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  setTemplateType(newValue);
                  setSelectedTemplate(null);
                  setEditedTemplate(null);
                }
              }}
              fullWidth
              size="small"
            >
              <ToggleButton value="default">
                Domyślne ({templates.filter(t => t.is_default && t.category !== 'dev').length})
              </ToggleButton>
              <ToggleButton value="custom">
                Twoje ({templates.filter(t => !t.is_default && t.category !== 'dev').length})
              </ToggleButton>
              <ToggleButton value="dev">
                Dev ({templates.filter(t => t.category === 'dev').length})
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Template List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List disablePadding>
              {filteredTemplates.map((template) => (
                <ListItemButton
                  key={template.id}
                  selected={selectedTemplate?.id === template.id}
                  onClick={() => handleTemplateClick(template)}
                  sx={{
                    borderLeft: selectedTemplate?.id === template.id 
                      ? `3px solid ${accentColor}` 
                      : '3px solid transparent',
                    backgroundColor: selectedTemplate?.id === template.id 
                      ? alpha(accentColor, 0.08) 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(accentColor, 0.04)
                    }
                  }}
                >
                  <ListItemText
                    primary={template.name}
                    primaryTypographyProps={{
                      fontWeight: selectedTemplate?.id === template.id ? 600 : 400,
                      fontSize: '0.95rem'
                    }}
                  />
                </ListItemButton>
              ))}
            </List>

            {filteredTemplates.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {templateType === 'custom' 
                    ? 'Brak customowych szablonów. Utwórz nowy!' 
                    : 'Brak domyślnych szablonów'}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {editedTemplate ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            {/* Editor Toolbar */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: surfaceColor,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ flex: 1 }} />

              {!editedTemplate.is_default && selectedTemplate && (
                <IconButton
                  color="error"
                  onClick={() => handleDeleteTemplate(editedTemplate)}
                  title="Usuń szablon"
                >
                  <DeleteIcon />
                </IconButton>
              )}

            </Box>

            {(!selectedTemplate || !editedTemplate.is_default) && (
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  backgroundColor: surfaceColor
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Nazwa szablonu"
                      value={editedTemplate.name || ''}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="Slug (identyfikator)"
                      value={editedTemplate.slug || ''}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, slug: e.target.value })}
                      size="small"
                      fullWidth
                      helperText="np: moj-szablon-123"
                    />
                  </Stack>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Kategoria</InputLabel>
                    <Select
                      value={editedTemplate.category || 'booking_confirmation'}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, category: e.target.value })}
                      label="Kategoria"
                    >
                      <MenuItem value="booking_confirmation">Potwierdzenie rezerwacji</MenuItem>
                      <MenuItem value="session_cancelled_by_creator">Sesja odwołana przez kreatora</MenuItem>
                    </Select>
                  </FormControl>

                  {selectedTemplate?.is_default && (
                    <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                      Edycja domyślnego szablonu utworzy nową, niestandardową wersję.
                    </Alert>
                  )}
                </Stack>
              </Box>
            )}

            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: surfaceColor
              }}
            >
              <TextField
                label="Temat wiadomości"
                value={getCurrentSubject()}
                onChange={(e) => updateCurrentSubject(e.target.value)}
                fullWidth
                size="small"
              />
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: theme.colors?.bg?.default || theme.palette.background.default,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: '12px',
                  minHeight: '100%',
                  p: 2
                }}
              >
                <EmailPreviewFrame html={getCurrentContent()} />
              </Paper>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors?.bg?.default || theme.palette.background.default
            }}
          >
            <Alert severity="info">
              Wybierz szablon z listy po lewej stronie lub utwórz nowy.
            </Alert>
          </Box>
        )}
      </Box>

      {/* Test Email Dialog */}
      <Dialog open={testEmailOpen} onClose={() => setTestEmailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Wyślij testowy email</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Alert severity="info">
                Szablon: <strong>{selectedTemplate.name}</strong>
              </Alert>

              <TextField
                label="Od (nadawca)"
                type="email"
                value={testEmail.from_email}
                onChange={(e) => setTestEmail({ ...testEmail, from_email: e.target.value })}
                fullWidth
                required
              />

              <TextField
                label="Do (odbiorca)"
                type="email"
                value={testEmail.to_email}
                onChange={(e) => setTestEmail({ ...testEmail, to_email: e.target.value })}
                fullWidth
                required
              />

              <FormControl fullWidth>
                <InputLabel>Język</InputLabel>
                <Select
                  value={testEmail.language}
                  onChange={(e) => setTestEmail({ ...testEmail, language: e.target.value })}
                  label="Język"
                >
                  <MenuItem value="pl">Polski</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Dane testowe (JSON)"
                value={JSON.stringify(testEmail.test_data)}
                onChange={(e) => {
                  try {
                    setTestEmail({ ...testEmail, test_data: JSON.parse(e.target.value) });
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                multiline
                rows={4}
                fullWidth
                helperText='Przykład: {"client_name": "Jan Kowalski", "event_title": "Sesja jogi"}'
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailOpen(false)}>Anuluj</Button>
          <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendTest}>
            Wyślij test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailEditorPage;
