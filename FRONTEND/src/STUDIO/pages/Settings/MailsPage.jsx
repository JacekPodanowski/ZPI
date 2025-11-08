import React, { useEffect, useState, useRef } from 'react';
import {
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
  Box,
  Alert,
  Tab,
  Tabs,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { alpha } from '@mui/material/styles';
import useTheme from '../../../theme/useTheme';
import apiClient from '../../../services/apiClient';
import { useToast } from '../../../contexts/ToastContext';

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
            iframeBody.scrollHeight,
            iframeBody.offsetHeight,
            iframeHtml.clientHeight,
            iframeHtml.scrollHeight,
            iframeHtml.offsetHeight
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
      sandbox="allow-same-origin"
    />
  );
};

const MailsPage = () => {
  const theme = useTheme();
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;
  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const addToast = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [language, setLanguage] = useState('pl');
  const [viewMode, setViewMode] = useState('rendered'); // 'code' or 'rendered'

  // Editor state
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
    // Auto-select first template when templates load
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates]);

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get('/email-templates/');
      setTemplates(response.data || []);
    } catch (err) {
      addToast?.('Nie udało się pobrać szablonów email', {variant: 'error'});
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setEditedTemplate({ ...template });
    setEditorOpen(true);
  };

  const handleCreateNew = () => {
    const newTemplate = {
      name: '',
      category: 'booking_confirmation',
      subject_pl: '',
      subject_en: '',
      content_pl: '',
      content_en: ''
    };
    setSelectedTemplate(null);
    setEditedTemplate(newTemplate);
    setEditorOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (!editedTemplate.name || !editedTemplate.slug) {
        addToast?.('Proszę wypełnić nazwę i slug szablonu', {variant: 'error'});
        return;
      }

      if (selectedTemplate && !selectedTemplate.is_default) {
        // Update existing custom template
        await apiClient.patch(`/email-templates/${selectedTemplate.id}/`, editedTemplate);
        addToast?.('Szablon zaktualizowany', {variant: 'success'});
      } else {
        // Create new template (or copy of default)
        const payload = { ...editedTemplate };
        if (!payload.slug) {
          payload.slug = payload.name.toLowerCase().replace(/\s+/g, '-');
        }
        await apiClient.post('/email-templates/', payload);
        addToast?.('Nowy szablon utworzony', {variant: 'success'});
      }

      setEditorOpen(false);
      fetchTemplates();
    } catch (err) {
      addToast?.('Błąd podczas zapisywania szablonu', {variant: 'error'});
      console.error('Error saving template:', err);
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
      await apiClient.delete(`/email-templates/${template.id}/`);
      addToast?.('Szablon usunięty', {variant: 'success'});
      fetchTemplates();
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
      booking_cancellation: 'Odwołanie rezerwacji',
      account_registration: 'Rejestracja konta',
      site_status: 'Status strony',
      plan_change: 'Zmiana planu',
      subscription_reminder: 'Przypomnienie o subskrypcji'
    };
    return labels[category] || category;
  };

  const getCurrentContent = () => {
    if (!selectedTemplate) return '';
    return language === 'pl' ? selectedTemplate.content_pl : selectedTemplate.content_en;
  };

  const getCurrentSubject = () => {
    if (!selectedTemplate) return '';
    return language === 'pl' ? selectedTemplate.subject_pl : selectedTemplate.subject_en;
  };

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          backgroundColor: surfaceColor,
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          p: 4,
          textAlign: 'center'
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          backgroundColor: surfaceColor,
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          p: 4,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Szablony Email
          </Typography>
          <Typography variant="body2" sx={{ color: theme.colors?.text?.secondary }}>
            Zarządzaj szablonami wiadomości email
          </Typography>
        </Box>

        {/* Controls Row */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl sx={{ flex: 2 }}>
              <InputLabel>Wybierz szablon</InputLabel>
              <Select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value);
                  setSelectedTemplate(template);
                }}
                label="Wybierz szablon"
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <span>{template.name}</span>
                      {template.is_default && (
                        <Chip label="Domyślny" size="small" color="primary" />
                      )}
                      <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: theme.colors?.text?.secondary }}>
                        {getCategoryLabel(template.category)}
                      </span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ flex: 1, minWidth: 150 }}>
              <InputLabel>Język</InputLabel>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                label="Język"
              >
                <MenuItem value="pl">Polski 🇵🇱</MenuItem>
                <MenuItem value="en">English 🇬🇧</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              sx={{ minWidth: 120 }}
            >
              Nowy
            </Button>
          </Stack>
        </Stack>

        {/* Preview Area */}
        {selectedTemplate && (
          <Box sx={{ 
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            {/* Toolbar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                pb: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                width: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Podgląd szablonu
                </Typography>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => {
                    if (newMode !== null) {
                      setViewMode(newMode);
                    }
                  }}
                  size="small"
                >
                  <ToggleButton value="rendered">
                    <VisibilityIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                    Renderowany
                  </ToggleButton>
                  <ToggleButton value="code">
                    <CodeIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                    HTML
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setEditedTemplate({ ...selectedTemplate });
                    setEditorOpen(true);
                  }}
                >
                  Edytuj
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={() => setTestEmailOpen(true)}
                >
                  Wyślij test
                </Button>
                {!selectedTemplate.is_default && (
                  <Tooltip title="Usuń szablon">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteTemplate(selectedTemplate)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>

            {/* Subject Preview */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: theme.colors?.text?.secondary }}>
                Temat wiadomości:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                {getCurrentSubject()}
              </Typography>
            </Box>

            {/* Email Content Preview */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: theme.colors?.bg?.default || theme.palette.background.default,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: '12px',
                minHeight: '500px',
                maxHeight: '700px',
                width: '100%',
                maxWidth: '100%',
                position: 'relative',
                overflow: 'auto',
                p: 3
              }}
            >
              {/* Wewnętrzny box z zawartością */}
              {viewMode === 'rendered' ? (
                <EmailPreviewFrame html={getCurrentContent()} />
              ) : (
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: theme.colors?.text?.primary,
                    textAlign: 'left'
                  }}
                >
                  {getCurrentContent()}
                </Box>
              )}
            </Paper>

            {/* Template Info */}
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`Kategoria: ${getCategoryLabel(selectedTemplate.category)}`}
                size="small"
              />
              {selectedTemplate.is_default && (
                <Chip label="Szablon domyślny" size="small" color="primary" />
              )}
              <Chip
                label={`Utworzony: ${new Date(selectedTemplate.created_at).toLocaleDateString('pl-PL')}`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
        )}

        {!selectedTemplate && !loading && (
          <Alert severity="info">
            Wybierz szablon z listy rozwijanej, aby zobaczyć podgląd.
          </Alert>
        )}
      </Paper>

      {/* Template Editor Dialog */}
      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate?.is_default ? 'Kopiuj szablon (Edycja domyślnego tworzy kopię)' : selectedTemplate ? 'Edytuj szablon' : 'Nowy szablon'}
        </DialogTitle>
        <DialogContent>
          {editedTemplate && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Nazwa szablonu"
                value={editedTemplate.name || ''}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                fullWidth
              />
              
              <TextField
                label="Slug (identyfikator)"
                value={editedTemplate.slug || ''}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, slug: e.target.value })}
                fullWidth
                helperText="Unikalny identyfikator, np: moj-szablon-123"
              />

              <FormControl fullWidth>
                <InputLabel>Kategoria</InputLabel>
                <Select
                  value={editedTemplate.category || 'booking_confirmation'}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, category: e.target.value })}
                  label="Kategoria"
                >
                  <MenuItem value="booking_confirmation">Potwierdzenie rezerwacji</MenuItem>
                  <MenuItem value="booking_cancellation">Odwołanie rezerwacji</MenuItem>
                  <MenuItem value="account_registration">Rejestracja konta</MenuItem>
                  <MenuItem value="site_status">Status strony</MenuItem>
                  <MenuItem value="plan_change">Zmiana planu</MenuItem>
                  <MenuItem value="subscription_reminder">Przypomnienie o subskrypcji</MenuItem>
                </Select>
              </FormControl>

              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Polski" />
                <Tab label="Angielski" />
              </Tabs>

              {activeTab === 0 && (
                <Stack spacing={2}>
                  <TextField
                    label="Tytuł (PL)"
                    value={editedTemplate.subject_pl || ''}
                    onChange={(e) => setEditedTemplate({ ...editedTemplate, subject_pl: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Treść HTML (PL)"
                    value={editedTemplate.content_pl || ''}
                    onChange={(e) => setEditedTemplate({ ...editedTemplate, content_pl: e.target.value })}
                    multiline
                    rows={12}
                    fullWidth
                    helperText="Użyj {{zmienna}} dla dynamicznych wartości"
                  />
                </Stack>
              )}

              {activeTab === 1 && (
                <Stack spacing={2}>
                  <TextField
                    label="Tytuł (EN)"
                    value={editedTemplate.subject_en || ''}
                    onChange={(e) => setEditedTemplate({ ...editedTemplate, subject_en: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Treść HTML (EN)"
                    value={editedTemplate.content_en || ''}
                    onChange={(e) => setEditedTemplate({ ...editedTemplate, content_en: e.target.value })}
                    multiline
                    rows={12}
                    fullWidth
                    helperText="Use {{variable}} for dynamic values"
                  />
                </Stack>
              )}

              {selectedTemplate?.is_default && (
                <Alert severity="info">
                  Edycja domyślnego szablonu utworzy nową, niestandardową wersję.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default MailsPage;
