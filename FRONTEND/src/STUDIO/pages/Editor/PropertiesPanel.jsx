import React, { useState } from 'react';
import { Box, Stack, Typography, TextField, IconButton, Collapse, Divider, Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { ExpandMore, ExpandLess, Add, Delete, ArrowUpward, ArrowDownward, Settings } from '@mui/icons-material';
import { motion } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import { MODULE_REGISTRY } from '../../../SITES/components/modules/ModuleRegistry';
import ColorPicker from '../../../components/ColorPicker';
import ImageUploader from '../../../components/ImageUploader';
import SitePropertiesPanel from './SitePropertiesPanel';

// Component to render a single field based on its type
export const FieldRenderer = ({ fieldKey, fieldDef, module, pageId, onContentChange }) => {
  const value = module.content[fieldKey];

  switch (fieldDef.t) {
    case 'text':
      return (
        <TextField
          label={fieldDef.d || fieldKey}
          fullWidth
          size="small"
          value={value || ''}
          onChange={(e) => onContentChange(fieldKey, e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '&:hover fieldset': { borderColor: 'rgb(146, 0, 32)' },
              '&.Mui-focused fieldset': { borderColor: 'rgb(146, 0, 32)' }
            },
            '& .MuiInputLabel-root.Mui-focused': { color: 'rgb(146, 0, 32)' }
          }}
        />
      );
    
    case 'textarea':
    case 'richtext':
      return (
        <TextField
          label={fieldDef.d || fieldKey}
          fullWidth
          size="small"
          multiline
          rows={fieldDef.t === 'richtext' ? 6 : 4}
          value={value || ''}
          onChange={(e) => onContentChange(fieldKey, e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '&:hover fieldset': { borderColor: 'rgb(146, 0, 32)' },
              '&.Mui-focused fieldset': { borderColor: 'rgb(146, 0, 32)' }
            },
            '& .MuiInputLabel-root.Mui-focused': { color: 'rgb(146, 0, 32)' }
          }}
        />
      );
    
    case 'color':
      return (
        <Box sx={{ '& > div': { marginBottom: 0 } }}>
          <ColorPicker
            label={fieldDef.d || fieldKey}
            value={value || '#000000'}
            onChange={(color) => onContentChange(fieldKey, color)}
          />
        </Box>
      );
    
    case 'image':
      return (
        <ImageUploader
          label={fieldDef.d || fieldKey}
          value={value || ''}
          onChange={(url) => onContentChange(fieldKey, url)}
          siteId={pageId}
        />
      );
    
    case 'boolean':
      return (
        <FormControlLabel
          control={
            <Switch
              checked={!!value}
              onChange={(e) => onContentChange(fieldKey, e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'rgb(146, 0, 32)',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'rgb(146, 0, 32)',
                }
              }}
            />
          }
          label={fieldDef.d || fieldKey}
        />
      );
    
    case 'select':
    case 'enum':
      return (
        <FormControl fullWidth size="small">
          <InputLabel sx={{ '&.Mui-focused': { color: 'rgb(146, 0, 32)' } }}>
            {fieldDef.d || fieldKey}
          </InputLabel>
          <Select
            value={value || (fieldDef.options && (Array.isArray(fieldDef.options) ? fieldDef.options[0] : fieldDef.options[0].value))}
            label={fieldDef.d || fieldKey}
            onChange={(e) => onContentChange(fieldKey, e.target.value)}
            sx={{
              borderRadius: '8px',
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' }
            }}
          >
            {(fieldDef.options || []).map(option => {
              // Support both string options and {value, label} objects
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <MenuItem key={optionValue} value={optionValue}>
                  {optionLabel}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      );
    
    case 'number':
      return (
        <TextField
          label={fieldDef.d || fieldKey}
          fullWidth
          size="small"
          type="number"
          value={value || ''}
          onChange={(e) => onContentChange(fieldKey, e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '&:hover fieldset': { borderColor: 'rgb(146, 0, 32)' },
              '&.Mui-focused fieldset': { borderColor: 'rgb(146, 0, 32)' }
            },
            '& .MuiInputLabel-root.Mui-focused': { color: 'rgb(146, 0, 32)' }
          }}
        />
      );
    
    case 'array':
      return renderArrayField(fieldKey, fieldDef, value, module, pageId, onContentChange);
    
    case 'object':
      return (
        <Box
          sx={{
            p: 2,
            bgcolor: 'rgba(146, 0, 32, 0.05)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'rgba(30, 30, 30, 0.6)',
            textAlign: 'center'
          }}
        >
          {fieldDef.d} - Complex object editor
        </Box>
      );
    
    default:
      return (
        <Typography variant="caption" sx={{ color: 'rgba(30, 30, 30, 0.5)' }}>
          Unsupported field type: {fieldDef.t}
        </Typography>
      );
  }
};

// Array field renderer for collections (team members, pricing offers, gallery images, etc.)
const renderArrayField = (fieldKey, fieldDef, items = [], module, pageId, onContentChange) => {
  const { updateCollectionItem, removeCollectionItem, reorderCollectionItem } = useNewEditorStore();
  
  // Helper to add a new item
  const handleAddItem = () => {
    const newItems = [...(items || [])];
    let defaultItem = { id: `${fieldKey}-${Date.now()}` };
    
    // Set defaults based on collection type
    if (fieldKey === 'members') {
      defaultItem = { ...defaultItem, name: 'Nowy członek', role: 'Rola', description: '', image: '' };
    } else if (fieldKey === 'offers' || fieldKey === 'services') {
      defaultItem = { ...defaultItem, name: 'Nowa usługa', price: '0', description: '' };
    } else if (fieldKey === 'items' && module.type === 'services') {
      defaultItem = { ...defaultItem, name: 'Nowa usługa', description: 'Opis usługi', image: '', details: '' };
    } else if (fieldKey === 'serviceItems') {
      defaultItem = { ...defaultItem, name: 'Nowa usługa', description: 'Opis usługi', image: '', details: '' };
    } else if (fieldKey === 'items') {
      defaultItem = { ...defaultItem, question: 'Nowe pytanie', answer: '<p>Nowa odpowiedź</p>' };
    } else if (fieldKey === 'images') {
      defaultItem = { url: '', caption: '' };
    } else if (fieldKey === 'timeline' || fieldKey === 'milestones') {
      // Timeline/milestones for About module
      const currentYear = new Date().getFullYear();
      defaultItem = {
        year: currentYear.toString(),
        title: 'Nowy kamień milowy',
        description: 'Opis tego etapu rozwoju'
      };
    } else if (fieldKey === 'keyHighlights' || fieldKey === 'highlights') {
      // Key highlights for About module
      defaultItem = {
        icon: 'star',
        title: 'Nowe osiągnięcie',
        description: 'Opis osiągnięcia lub wyróżniającej cechy'
      };
    } else if (fieldKey === 'events') {
      const today = new Date().toISOString().split('T')[0];
      defaultItem = {
        ...defaultItem,
        title: 'Nowe wydarzenie',
        date: today,
        tag: 'Nowe',
        location: '',
        summary: '<p>Dodaj krótki opis wydarzenia.</p>',
        fullDescription: '<p>Pełny opis wydarzenia.</p>',
        images: []
      };
    }
    
    newItems.push(defaultItem);
    onContentChange(fieldKey, newItems);
  };
  
  // Gallery images - special UI
  if (fieldKey === 'images' && module.type === 'gallery') {
    return (
      <Box key={fieldKey}>
        <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
          {fieldDef.d || 'Zdjęcia w galerii'}
        </Typography>
        
        <ImageUploader
          label=""
          value=""
          multiple={true}
          onChange={(urls) => {
            const currentImages = items || [];
            const newImages = urls.map(url => ({ url, caption: '' }));
            onContentChange(fieldKey, [...currentImages, ...newImages]);
          }}
          siteId={pageId}
        />
        
        {items && items.length > 0 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {items.map((item, index) => {
              const imageUrl = typeof item === 'string' ? item : item.url;
              const caption = typeof item === 'object' ? item.caption : '';
              
              return (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    position: 'relative'
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    {imageUrl && (
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={`Gallery ${index + 1}`}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Podpis obrazu..."
                        value={caption}
                        onChange={(e) => {
                          const newItems = [...items];
                          if (typeof newItems[index] === 'string') {
                            newItems[index] = { url: newItems[index], caption: e.target.value };
                          } else {
                            newItems[index] = { ...newItems[index], caption: e.target.value };
                          }
                          onContentChange(fieldKey, newItems);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '6px'
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                  
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                    <IconButton
                      size="small"
                      disabled={index === 0}
                      onClick={() => {
                        const newItems = [...items];
                        [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
                        onContentChange(fieldKey, newItems);
                      }}
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={index === items.length - 1}
                      onClick={() => {
                        const newItems = [...items];
                        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                        onContentChange(fieldKey, newItems);
                      }}
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newItems = items.filter((_, i) => i !== index);
                        onContentChange(fieldKey, newItems);
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    );
  }
  
  // Team members
  if (fieldKey === 'members') {
    return (
      <Box key={fieldKey}>
        <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
          {fieldDef.d || 'Członkowie zespołu'} ({items.length})
        </Typography>
        <Stack spacing={2}>
          {(items || []).map((member, index) => (
            <Box
              key={member.id || index}
              sx={{
                p: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              <IconButton
                size="small"
                onClick={() => {
                  const newItems = items.filter((_, i) => i !== index);
                  onContentChange(fieldKey, newItems);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'error.main'
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
              
              <TextField
                label="Imię i nazwisko"
                fullWidth
                size="small"
                value={member.name || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], name: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Rola"
                fullWidth
                size="small"
                value={member.role || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], role: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Biografia"
                fullWidth
                size="small"
                value={member.bio || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], bio: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Opis"
                fullWidth
                size="small"
                multiline
                rows={3}
                value={member.description || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], description: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2 }}
                placeholder="Krótki opis osoby..."
              />
              
              <ImageUploader
                label="Zdjęcie"
                value={member.image || ''}
                onChange={(url) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], image: url };
                  onContentChange(fieldKey, newItems);
                }}
                siteId={pageId}
              />
              
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === items.length - 1}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
        <Button
          startIcon={<Add />}
          onClick={handleAddItem}
          sx={{
            mt: 2,
            color: 'rgb(146, 0, 32)',
            '&:hover': { bgcolor: 'rgba(146, 0, 32, 0.04)' }
          }}
        >
          Dodaj członka
        </Button>
      </Box>
    );
  }
  
  if (fieldKey === 'events') {
    const eventItems = items || [];

    return (
      <Box key={fieldKey}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
            {fieldDef.d || 'Wydarzenia'} ({eventItems.length})
          </Typography>
          <Button
            startIcon={<Add />}
            size="small"
            onClick={handleAddItem}
            sx={{
              color: 'rgb(146, 0, 32)',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(146, 0, 32, 0.06)' }
            }}
          >
            Dodaj wydarzenie
          </Button>
        </Stack>

        {eventItems.length === 0 && (
          <Box
            sx={{
              p: 2,
              borderRadius: '10px',
              border: '1px dashed rgba(146, 0, 32, 0.3)',
              bgcolor: 'rgba(146, 0, 32, 0.04)',
              color: 'rgba(30, 30, 30, 0.6)',
              textAlign: 'center',
              fontSize: '13px'
            }}
          >
            Brak wydarzeń. Użyj przycisku powyżej, aby dodać pierwsze wydarzenie.
          </Box>
        )}

        <Stack spacing={2} sx={{ mt: eventItems.length ? 1 : 2 }}>
          {eventItems.map((eventItem, index) => (
            <Box
              key={eventItem.id || index}
              sx={{
                p: 2.25,
                borderRadius: '12px',
                border: '1px solid rgba(30, 30, 30, 0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                position: 'relative',
                background: '#fff'
              }}
            >
              <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 12, right: 12 }}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => {
                    const newItems = [...eventItems];
                    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === eventItems.length - 1}
                  onClick={() => {
                    const newItems = [...eventItems];
                    [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    const newItems = eventItems.filter((_, i) => i !== index);
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  label="Tytuł wydarzenia"
                  fullWidth
                  size="small"
                  value={eventItem.title || ''}
                  onChange={(e) => {
                    const newItems = [...eventItems];
                    newItems[index] = { ...eventItem, title: e.target.value };
                    onContentChange(fieldKey, newItems);
                  }}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Data"
                    type="date"
                    size="small"
                    fullWidth
                    value={eventItem.date || ''}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => {
                      const newItems = [...eventItems];
                      newItems[index] = { ...eventItem, date: e.target.value };
                      onContentChange(fieldKey, newItems);
                    }}
                  />
                  <TextField
                    label="Tag / kategoria"
                    size="small"
                    fullWidth
                    value={eventItem.tag || ''}
                    onChange={(e) => {
                      const newItems = [...eventItems];
                      newItems[index] = { ...eventItem, tag: e.target.value };
                      onContentChange(fieldKey, newItems);
                    }}
                  />
                  <TextField
                    label="Lokalizacja"
                    size="small"
                    fullWidth
                    value={eventItem.location || ''}
                    onChange={(e) => {
                      const newItems = [...eventItems];
                      newItems[index] = { ...eventItem, location: e.target.value };
                      onContentChange(fieldKey, newItems);
                    }}
                  />
                </Stack>

                <TextField
                  label="Krótki opis (HTML)"
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  value={eventItem.summary || ''}
                  onChange={(e) => {
                    const newItems = [...eventItems];
                    newItems[index] = { ...eventItem, summary: e.target.value };
                    onContentChange(fieldKey, newItems);
                  }}
                />

                <TextField
                  label="Pełny opis (HTML)"
                  fullWidth
                  size="small"
                  multiline
                  rows={6}
                  value={eventItem.fullDescription || ''}
                  onChange={(e) => {
                    const newItems = [...eventItems];
                    newItems[index] = { ...eventItem, fullDescription: e.target.value };
                    onContentChange(fieldKey, newItems);
                  }}
                />

                <Box>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, mb: 1 }}>
                    Zdjęcia wydarzenia ({(eventItem.images || []).length})
                  </Typography>

                  {(eventItem.images || []).length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
                      {(eventItem.images || []).map((imageUrl, imageIndex) => (
                        <Box
                          key={`${eventItem.id || index}-image-${imageIndex}`}
                          sx={{
                            position: 'relative',
                            width: 72,
                            height: 72,
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid rgba(30,30,30,0.08)'
                          }}
                        >
                          <Box
                            component="img"
                            src={imageUrl}
                            alt={`Event image ${imageIndex + 1}`}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newItems = [...eventItems];
                              const updatedImages = [...(eventItem.images || [])];
                              updatedImages.splice(imageIndex, 1);
                              newItems[index] = { ...eventItem, images: updatedImages };
                              onContentChange(fieldKey, newItems);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              bgcolor: 'rgba(0,0,0,0.45)',
                              color: '#fff',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' }
                            }}
                          >
                            <Delete fontSize="inherit" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )}

                  <ImageUploader
                    label="Dodaj zdjęcie"
                    value=""
                    onChange={(url) => {
                      if (!url) return;
                      const newItems = [...eventItems];
                      const updatedImages = [...(eventItem.images || []), url];
                      newItems[index] = { ...eventItem, images: updatedImages };
                      onContentChange(fieldKey, newItems);
                    }}
                    siteId={pageId}
                  />
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  // Pricing offers
  if (fieldKey === 'offers' || fieldKey === 'services') {
    return (
      <Box key={fieldKey}>
        <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
          {fieldDef.d || 'Usługi'} ({items.length})
        </Typography>
        <Stack spacing={2}>
          {(items || []).map((offer, index) => (
            <Box
              key={offer.id || index}
              sx={{
                p: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              <IconButton
                size="small"
                onClick={() => {
                  const newItems = items.filter((_, i) => i !== index);
                  onContentChange(fieldKey, newItems);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'error.main'
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
              
              <TextField
                label="Nazwa oferty"
                fullWidth
                size="small"
                value={offer.name || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], name: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Cena"
                fullWidth
                size="small"
                value={offer.price || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], price: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Opis"
                fullWidth
                size="small"
                multiline
                rows={3}
                value={offer.description || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], description: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
              />
              
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === items.length - 1}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
        <Button
          startIcon={<Add />}
          onClick={handleAddItem}
          sx={{
            mt: 2,
            color: 'rgb(146, 0, 32)',
            '&:hover': { bgcolor: 'rgba(146, 0, 32, 0.04)' }
          }}
        >
          Dodaj ofertę
        </Button>
      </Box>
    );
  }
  
  // Service items - for services module
  if (fieldKey === 'items' && module.type === 'services') {
    return (
      <Box key={fieldKey}>
        <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
          {fieldDef.d || 'Elementy usługi'} ({items.length})
        </Typography>
        <Stack spacing={2}>
          {(items || []).map((item, index) => (
            <Box
              key={item.id || index}
              sx={{
                p: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === items.length - 1}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    const newItems = items.filter((_, i) => i !== index);
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
              
              <TextField
                label="Service Name"
                fullWidth
                size="small"
                value={item.name || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], name: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2, mt: 1 }}
              />
              
              <TextField
                label="Description"
                fullWidth
                size="small"
                multiline
                rows={3}
                value={item.description || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], description: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2 }}
              />
              
              <ImageUploader
                label="Service Image"
                value={item.image || ''}
                onChange={(url) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], image: url };
                  onContentChange(fieldKey, newItems);
                }}
                siteId={pageId}
              />
              
              {item.details !== undefined && (
                <TextField
                  label="Dodatkowe szczegóły (opcjonalnie)"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={item.details || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...newItems[index], details: e.target.value };
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          ))}
        </Stack>
        <Button
          startIcon={<Add />}
          onClick={handleAddItem}
          sx={{
            mt: 2,
            color: 'rgb(146, 0, 32)',
            '&:hover': { bgcolor: 'rgba(146, 0, 32, 0.04)' }
          }}
        >
          Dodaj usługę
        </Button>
      </Box>
    );
  }
  
  // Service items - for services module (services field)
  if (fieldKey === 'serviceItems') {
    return (
      <Box key={fieldKey}>
        <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
          {fieldDef.d || 'Service Items'} ({items.length})
        </Typography>
        <Stack spacing={2}>
          {(items || []).map((item, index) => (
            <Box
              key={item.id || index}
              sx={{
                p: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === items.length - 1}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    const newItems = items.filter((_, i) => i !== index);
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
              
              <TextField
                label="Nazwa usługi"
                fullWidth
                size="small"
                value={item.name || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], name: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2, mt: 1 }}
              />
              
              <TextField
                label="Opis"
                fullWidth
                size="small"
                multiline
                rows={3}
                value={item.description || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], description: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2 }}
              />
              
              <ImageUploader
                label="Zdjęcie usługi"
                value={item.image || ''}
                onChange={(url) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], image: url };
                  onContentChange(fieldKey, newItems);
                }}
                siteId={pageId}
              />
              
              <TextField
                label="Dodatkowe szczegóły (opcjonalnie)"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={item.details || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], details: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mt: 2 }}
              />
            </Box>
          ))}
        </Stack>
        <Button
          startIcon={<Add />}
          onClick={handleAddItem}
          sx={{
            mt: 2,
            color: 'rgb(146, 0, 32)',
            '&:hover': { bgcolor: 'rgba(146, 0, 32, 0.04)' }
          }}
        >
          Dodaj usługę
        </Button>
      </Box>
    );
  }
  
  // FAQ items
  if (fieldKey === 'items' && module.type === 'faq') {
    return (
      <Box key={fieldKey}>
        <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
          {fieldDef.d || 'Pytania FAQ'} ({items.length})
        </Typography>
        <Stack spacing={2}>
          {(items || []).map((item, index) => (
            <Box
              key={item.id || index}
              sx={{
                p: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              <IconButton
                size="small"
                onClick={() => {
                  const newItems = items.filter((_, i) => i !== index);
                  onContentChange(fieldKey, newItems);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'error.main'
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
              
              <TextField
                label="Pytanie"
                fullWidth
                size="small"
                value={item.question || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], question: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Odpowiedź (HTML)"
                fullWidth
                size="small"
                multiline
                rows={4}
                value={item.answer || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...newItems[index], answer: e.target.value };
                  onContentChange(fieldKey, newItems);
                }}
              />
            </Box>
          ))}
        </Stack>
        <Button
          startIcon={<Add />}
          onClick={handleAddItem}
          sx={{
            mt: 2,
            color: 'rgb(146, 0, 32)',
            '&:hover': { bgcolor: 'rgba(146, 0, 32, 0.04)' }
          }}
        >
          Dodaj pytanie
        </Button>
      </Box>
    );
  }
  
  // Timeline milestones editor (for About module)
  if (fieldKey === 'timeline' || fieldKey === 'milestones') {
    return (
      <Box key={fieldKey}>
        <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
          {fieldDef.d || 'Oś czasu'} ({items.length})
        </Typography>
        <Stack spacing={2}>
          {(items || []).map((item, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Rok"
                  value={item.year || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, year: e.target.value };
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Tytuł"
                  value={item.title || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, title: e.target.value };
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Opis"
                  multiline
                  rows={2}
                  value={item.description || item.desc || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, description: e.target.value };
                    // Remove old 'desc' field if it exists
                    if (newItems[index].desc !== undefined) {
                      delete newItems[index].desc;
                    }
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />
              </Stack>
              
              <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === items.length - 1}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    const newItems = items.filter((_, i) => i !== index);
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
        <Button
          startIcon={<Add />}
          onClick={handleAddItem}
          sx={{
            mt: 2,
            color: 'rgb(146, 0, 32)',
            '&:hover': { bgcolor: 'rgba(146, 0, 32, 0.04)' }
          }}
        >
          Dodaj kamień milowy
        </Button>
      </Box>
    );
  }
  
  // Key highlights editor (for About module)
  if (fieldKey === 'keyHighlights' || fieldKey === 'highlights') {
    const iconOptions = ['star', 'award', 'heart', 'users', 'briefcase', 'chart', 'camera', 'building'];
    
    return (
      <Box key={fieldKey}>
        <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
          {fieldDef.d || 'Kluczowe osiągnięcia'} ({items.length})
        </Typography>
        <Stack spacing={2}>
          {(items || []).map((item, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Ikona"
                  value={item.icon || 'star'}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, icon: e.target.value };
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                >
                  {iconOptions.map(icon => (
                    <MenuItem key={icon} value={icon}>{icon}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  size="small"
                  label="Tytuł"
                  value={item.title || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, title: e.target.value };
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Opis"
                  multiline
                  rows={2}
                  value={item.description || item.desc || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, description: e.target.value };
                    // Remove old 'desc' field if it exists
                    if (newItems[index].desc !== undefined) {
                      delete newItems[index].desc;
                    }
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />
              </Stack>
              
              <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === items.length - 1}
                  onClick={() => {
                    const newItems = [...items];
                    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                    onContentChange(fieldKey, newItems);
                  }}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    const newItems = items.filter((_, i) => i !== index);
                    onContentChange(fieldKey, newItems);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
        <Button
          startIcon={<Add />}
          onClick={handleAddItem}
          sx={{
            mt: 2,
            color: 'rgb(146, 0, 32)',
            '&:hover': { bgcolor: 'rgba(146, 0, 32, 0.04)' }
          }}
        >
          Dodaj osiągnięcie
        </Button>
      </Box>
    );
  }
  
  // Generic array fallback - simple list with add/remove
  return (
    <Box key={fieldKey}>
      <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
        {fieldDef.d || fieldKey} ({items.length})
      </Typography>
      <Stack spacing={1.5}>
        {(items || []).map((item, index) => (
          <Box
            key={index}
            sx={{
              p: 1.5,
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Typography sx={{ flex: 1, fontSize: '13px' }}>
              Item {index + 1}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                const newItems = items.filter((_, i) => i !== index);
                onContentChange(fieldKey, newItems);
              }}
              sx={{ color: 'error.main' }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>
      <Button
        startIcon={<Add />}
        onClick={handleAddItem}
        sx={{
          mt: 2,
          color: 'rgb(146, 0, 32)',
          '&:hover': { bgcolor: 'rgba(146, 0, 32, 0.04)' }
        }}
      >
        Dodaj element
      </Button>
    </Box>
  );
};

const PropertiesPanel = ({ placement = 'right' }) => {
  const { selectedModuleId, selectedPageId, updateModuleContent, updateModuleProperty, deselectModule } = useNewEditorStore();
  
  // Subscribe to pages array so component re-renders when modules change
  const pages = useNewEditorStore(state => state.site.pages);
  const page = pages.find(p => p.id === selectedPageId);
  const module = page?.modules.find(m => m.id === selectedModuleId);
  
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const moduleDef = module ? MODULE_REGISTRY[module.type] : null;
  
  // Get available layouts for this module
  const availableLayouts = moduleDef?.layouts || [];
  // Check both module.layout and module.content.layout
  let rawLayout = module?.layout || module?.content?.layout || moduleDef?.defaultLayout || availableLayouts[0];
  
  console.log('[PropertiesPanel] Layout info:', {
    moduleType: module?.type,
    moduleLayout: module?.layout,
    contentLayout: module?.content?.layout,
    rawLayout,
    availableLayouts,
    defaultLayout: moduleDef?.defaultLayout
  });
  
  // Normalize layout: if current layout is not in available options, use default
  const currentLayout = availableLayouts.includes(rawLayout) 
    ? rawLayout 
    : (moduleDef?.defaultLayout || availableLayouts[0] || 'sidebar');

  const panelMotionProps = {
    initial: { x: placement === 'right' ? 320 : -320 },
    animate: { x: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  };

  const panelStyle = {
    width: '100%',
    height: '100%',
    flexShrink: 0,
    display: 'flex',
    maxWidth: placement === 'right' ? 360 : '100%',
    minWidth: placement === 'left' ? 220 : 260
  };

  const containerSx = {
    width: '100%',
    height: '100%',
    bgcolor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderLeft: placement === 'right' ? '1px solid rgba(30, 30, 30, 0.06)' : 'none',
    borderRight: placement === 'left' ? '1px solid rgba(30, 30, 30, 0.06)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const handleContentChange = (field, value) => {
    if (module && page) {
      console.log('🔧 PropertiesPanel - Content Change:', {
        field,
        value: typeof value === 'string' ? value.substring(0, 50) : value,
        moduleId: module.id,
        pageId: page.id
      });
      
      // Special handling for 'layout' - save to module.layout, not module.content.layout
      if (field === 'layout') {
        updateModuleProperty(page.id, module.id, 'layout', value);
      } else {
        updateModuleContent(page.id, module.id, { [field]: value });
      }
    }
  };
  
  // Filter fields by category
  const fields = moduleDef?.descriptor?.fields || {};
  const contentFields = Object.entries(fields).filter(([, def]) => def.category === 'content' || !def.category);
  const layoutFields = Object.entries(fields).filter(([, def]) => def.category === 'layout');
  const appearanceFields = Object.entries(fields).filter(([, def]) => def.category === 'appearance');
  const advancedFields = Object.entries(fields).filter(([, def]) => def.category === 'advanced');

  if (!selectedModuleId || !module) {
    return <SitePropertiesPanel placement={placement} />;
  }

  if (!moduleDef) {
    return (
      <motion.div
        {...panelMotionProps}
        style={panelStyle}
      >
        <Box
          sx={{
            ...containerSx,
            alignItems: 'center',
            justifyContent: 'center',
            p: 3
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
              color: 'rgba(30, 30, 30, 0.4)',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Module definition not found
          </Typography>
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...panelMotionProps}
      style={panelStyle}
    >
      <Box sx={containerSx}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(30, 30, 30, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'rgb(30, 30, 30)',
                mb: 0.5
              }}
            >
              {module.name || module.type}
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: 'rgba(30, 30, 30, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {module.type}
            </Typography>
          </Box>
          <IconButton
            onClick={deselectModule}
            size="small"
            sx={{
              color: 'rgba(30, 30, 30, 0.6)',
              '&:hover': {
                bgcolor: 'rgba(146, 0, 32, 0.08)',
                color: 'rgb(146, 0, 32)'
              }
            }}
          >
            <Settings />
          </IconButton>
        </Box>

        {/* Content Sections */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={3}>
            {/* CALENDAR TYPE SELECTOR - Only show for calendar modules */}
            {module.type === 'calendar' && (
              <Box>
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'rgba(30, 30, 30, 0.5)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    mb: 2
                  }}
                >
                  Calendar Type
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={module.content?.type || 'compact'}
                    onChange={(e) => handleContentChange('type', e.target.value)}
                    sx={{
                      borderRadius: '8px',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' }
                    }}
                  >
                    <MenuItem value="compact">Compact</MenuItem>
                    <MenuItem value="full">Full</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Divider after calendar type if exists */}
            {module.type === 'calendar' && (availableLayouts.length > 1 || contentFields.length > 0) && <Divider />}

            {/* LAYOUT SELECTOR - Only show if multiple layouts available and not Full calendar */}
            {availableLayouts.length > 1 && !(module.type === 'calendar' && module.content?.type === 'full') && (
              <Box>
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'rgba(30, 30, 30, 0.5)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    mb: 2
                  }}
                >
                  Layout Style
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={currentLayout}
                    onChange={(e) => handleContentChange('layout', e.target.value)}
                    sx={{
                      borderRadius: '8px',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' }
                    }}
                  >
                    {availableLayouts.map(layout => (
                      <MenuItem key={layout} value={layout}>
                        {layout.charAt(0).toUpperCase() + layout.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Layout-specific fields (substyle, flipStyle, etc.) */}
                {layoutFields.length > 0 && (
                  <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                    {layoutFields.map(([key, def]) => (
                      <FieldRenderer
                        key={key}
                        fieldKey={key}
                        fieldDef={def}
                        module={module}
                        pageId={page.id}
                        onContentChange={handleContentChange}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            )}
            
            {/* Divider after layout selector if layout fields or content exists */}
            {availableLayouts.length > 1 && !(module.type === 'calendar' && module.content?.type === 'full') && (layoutFields.length > 0 || contentFields.length > 0) && <Divider />}
            
            {/* LAYOUT OPTIONS Section */}
            {layoutFields.length > 0 && (
              <Box>
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'rgba(30, 30, 30, 0.5)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    mb: 2
                  }}
                >
                  Layout Options
                </Typography>
                <Stack spacing={2.5}>
                  {layoutFields.map(([key, def]) => {
                    const value = module.content?.[key];
                    
                    if (def.t === 'number') {
                      // Get default value from defaults based on current layout
                      const defaultValue = key === 'cardWidth' ? 320 : key === 'cardHeight' ? 420 : undefined;
                      return (
                        <TextField
                          key={key}
                          fullWidth
                          size="small"
                          type="number"
                          label={def.d || key}
                          value={value ?? defaultValue ?? ''}
                          onChange={(e) => handleContentChange(key, e.target.value ? Number(e.target.value) : null)}
                          InputLabelProps={{
                            sx: { '&.Mui-focused': { color: 'rgb(146, 0, 32)' } }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' }
                            }
                          }}
                        />
                      );
                    }
                    
                    return (
                      <FormControl key={key} fullWidth size="small">
                        <InputLabel sx={{ '&.Mui-focused': { color: 'rgb(146, 0, 32)' } }}>
                          {def.d || key}
                        </InputLabel>
                        <Select
                          value={value || (def.options && def.options[0]?.value)}
                          label={def.d || key}
                          onChange={(e) => handleContentChange(key, e.target.value)}
                          sx={{
                            borderRadius: '8px',
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(146, 0, 32)' }
                          }}
                        >
                          {(def.options || []).map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* Divider after layout options if content exists */}
            {layoutFields.length > 0 && contentFields.length > 0 && <Divider />}
            
            {/* CONTENT Section */}
            {contentFields.length > 0 && (
              <Box>
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'rgba(30, 30, 30, 0.5)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    mb: 2
                  }}
                >
                  Content
                </Typography>
                <Stack spacing={2.5}>
                  {contentFields.map(([key, def]) => (
                    <FieldRenderer
                      key={key}
                      fieldKey={key}
                      fieldDef={def}
                      module={module}
                      pageId={page.id}
                      onContentChange={handleContentChange}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* APPEARANCE Section */}
            {appearanceFields.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'rgba(30, 30, 30, 0.5)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      mb: 2
                    }}
                  >
                    Appearance
                  </Typography>
                  <Stack spacing={2.5}>
                    {appearanceFields.map(([key, def]) => (
                      <FieldRenderer
                        key={key}
                        fieldKey={key}
                        fieldDef={def}
                        module={module}
                        pageId={page.id}
                        onContentChange={handleContentChange}
                      />
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            {/* ADVANCED Section (Collapsible) */}
            {advancedFields.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Box
                    onClick={() => setAdvancedOpen(!advancedOpen)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      mb: advancedOpen ? 2 : 0,
                      '&:hover': {
                        '& .MuiTypography-root': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'rgba(30, 30, 30, 0.5)',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      Advanced
                    </Typography>
                    {advancedOpen ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                  <Collapse in={advancedOpen}>
                    <Stack spacing={2.5}>
                      {advancedFields.map(([key, def]) => (
                        <FieldRenderer
                          key={key}
                          fieldKey={key}
                          fieldDef={def}
                          module={module}
                          pageId={page.id}
                          onContentChange={handleContentChange}
                        />
                      ))}
                    </Stack>
                  </Collapse>
                </Box>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </motion.div>
  );
};

export default PropertiesPanel;
