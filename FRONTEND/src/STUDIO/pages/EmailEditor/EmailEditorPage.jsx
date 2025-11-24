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
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
      sandbox="allow-same-origin"
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
  const [language, setLanguage] = useState('pl');
  const [viewMode, setViewMode] = useState('rendered'); // 'code' or 'rendered'
  const [templateType, setTemplateType] = useState('default'); // 'default' or 'custom'
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
    const filteredTemplates = getFilteredTemplates();
    if (filteredTemplates.length > 0 && !selectedTemplate) {
      handleTemplateClick(filteredTemplates[0]);
    }
  }, [templates, templateType]);

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

  const getFilteredTemplates = () => {
    return templates.filter(t => 
      templateType === 'default' ? t.is_default : !t.is_default
    );
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setEditedTemplate({ ...template });
  };

  const handleCreateNew = () => {
    const newTemplate = {
      name: '',
      slug: '',
      category: 'booking_confirmation',
      subject_pl: '',
      subject_en: '',
      content_pl: '',
      content_en: '',
      is_default: false
    };
    setSelectedTemplate(null);
    setEditedTemplate(newTemplate);
    setTemplateType('custom'); // Switch to custom when creating new
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
        await apiClient.patch(`/email-templates/${selectedTemplate.id}/`, editedTemplate);
        addToast?.('Szablon zaktualizowany', {variant: 'success'});
      } else {
        // Create new template (or copy of default)
        const payload = { ...editedTemplate };
        if (!payload.slug) {
          payload.slug = payload.name.toLowerCase().replace(/\s+/g, '-');
        }
        payload.is_default = false; // Ensure new templates are custom
        await apiClient.post('/email-templates/', payload);
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
      await apiClient.delete(`/email-templates/${template.id}/`);
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
      booking_cancellation: 'Odwołanie rezerwacji',
      account_registration: 'Rejestracja konta',
      site_status: 'Status strony',
      plan_change: 'Zmiana planu',
      subscription_reminder: 'Przypomnienie o subskrypcji'
    };
    return labels[category] || category;
  };

  const getCurrentContent = () => {
    if (!editedTemplate) return '';
    return language === 'pl' ? editedTemplate.content_pl : editedTemplate.content_en;
  };

  const getCurrentSubject = () => {
    if (!editedTemplate) return '';
    return language === 'pl' ? editedTemplate.subject_pl : editedTemplate.subject_en;
  };

  const updateCurrentContent = (newContent) => {
    if (!editedTemplate) return;
    const field = language === 'pl' ? 'content_pl' : 'content_en';
    setEditedTemplate({ ...editedTemplate, [field]: newContent });
  };

  const updateCurrentSubject = (newSubject) => {
    if (!editedTemplate) return;
    const field = language === 'pl' ? 'subject_pl' : 'subject_en';
    setEditedTemplate({ ...editedTemplate, [field]: newSubject });
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
        backgroundColor: theme.colors?.bg?.default || theme.palette.background.default
      }}
    >
      <Navigation />

      {/* Header */}
      <Box
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: surfaceColor,
          py: 2,
          px: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: '100%', mx: 'auto' }}>
          <IconButton onClick={() => navigate('/studio/account/notifications')}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Edytor szablonów email
            </Typography>
            <Typography variant="body2" sx={{ color: theme.colors?.text?.secondary }}>
              Twórz i zarządzaj szablonami wiadomości email
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{ 
              backgroundColor: accentColor,
              '&:hover': { backgroundColor: alpha(accentColor, 0.9) }
            }}
          >
            Nowy szablon
          </Button>
        </Box>
      </Box>

      {/* Main Editor Layout */}
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 180px)',
          overflow: 'hidden',
          p: 3,
          gap: 3,
          maxWidth: '100%',
          mx: 'auto'
        }}
      >
        {/* Left Sidebar - Template List */}
        <Paper
          elevation={0}
          sx={{
            width: '320px',
            backgroundColor: surfaceColor,
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Template Type Toggle */}
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
                Zwykłe ({templates.filter(t => t.is_default).length})
              </ToggleButton>
              <ToggleButton value="custom">
                Customowe ({templates.filter(t => !t.is_default).length})
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
                    secondary={getCategoryLabel(template.category)}
                    primaryTypographyProps={{
                      fontWeight: selectedTemplate?.id === template.id ? 600 : 400,
                      fontSize: '0.95rem'
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.8rem'
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

        {/* Right Side - Editor */}
        {editedTemplate ? (
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              backgroundColor: surfaceColor,
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Editor Toolbar */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              {/* Language Selector */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
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

              {/* View Mode Toggle */}
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

              <Box sx={{ flex: 1 }} />

              {/* Action Buttons */}
              <Button
                variant="outlined"
                startIcon={<SendIcon />}
                onClick={() => setTestEmailOpen(true)}
                disabled={!selectedTemplate}
              >
                Wyślij test
              </Button>

              {!editedTemplate.is_default && selectedTemplate && (
                <IconButton
                  color="error"
                  onClick={() => handleDeleteTemplate(editedTemplate)}
                  title="Usuń szablon"
                >
                  <DeleteIcon />
                </IconButton>
              )}

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveTemplate}
                disabled={saving}
                sx={{ 
                  backgroundColor: accentColor,
                  '&:hover': { backgroundColor: alpha(accentColor, 0.9) }
                }}
              >
                {saving ? 'Zapisywanie...' : 'Zapisz'}
              </Button>
            </Box>

            {/* Template Basic Info (editable for new/custom) */}
            {(!selectedTemplate || !editedTemplate.is_default) && (
              <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
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
                      <MenuItem value="booking_cancellation">Odwołanie rezerwacji</MenuItem>
                      <MenuItem value="account_registration">Rejestracja konta</MenuItem>
                      <MenuItem value="site_status">Status strony</MenuItem>
                      <MenuItem value="plan_change">Zmiana planu</MenuItem>
                      <MenuItem value="subscription_reminder">Przypomnienie o subskrypcji</MenuItem>
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

            {/* Subject Editor */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <TextField
                label="Temat wiadomości"
                value={getCurrentSubject()}
                onChange={(e) => updateCurrentSubject(e.target.value)}
                fullWidth
                size="small"
              />
            </Box>

            {/* Content Editor/Preview */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {viewMode === 'rendered' ? (
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
              ) : (
                <TextField
                  value={getCurrentContent()}
                  onChange={(e) => updateCurrentContent(e.target.value)}
                  multiline
                  fullWidth
                  rows={20}
                  variant="outlined"
                  sx={{
                    '& textarea': {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }
                  }}
                  helperText="Użyj {{zmienna}} dla dynamicznych wartości"
                />
              )}
            </Box>

            {/* Template Info Footer */}
            {selectedTemplate && (
              <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label={`Kategoria: ${getCategoryLabel(editedTemplate.category)}`}
                    size="small"
                  />
                  {editedTemplate.is_default && (
                    <Chip label="Szablon domyślny" size="small" color="primary" />
                  )}
                  {selectedTemplate.created_at && (
                    <Chip
                      label={`Utworzony: ${new Date(selectedTemplate.created_at).toLocaleDateString('pl-PL')}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            )}
          </Paper>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
