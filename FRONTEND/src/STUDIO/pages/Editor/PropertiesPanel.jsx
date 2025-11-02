import React, { useState } from 'react';
import { Box, Stack, Typography, TextField, IconButton, Collapse, Divider } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { motion } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';

const PropertiesPanel = () => {
  const { getSelectedModule, selectedModuleId, getSelectedPage, updateModuleContent } = useNewEditorStore();
  const [activeSection, setActiveSection] = useState('content');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const module = getSelectedModule();
  const page = getSelectedPage();

  const handleContentChange = (field, value) => {
    if (module && page) {
      updateModuleContent(page.id, module.id, { [field]: value });
    }
  };

  if (!selectedModuleId || !module) {
    return (
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '320px',
          height: '100%',
          flexShrink: 0
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(30, 30, 30, 0.06)',
            display: 'flex',
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
            Select a module to edit properties
          </Typography>
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        width: '320px',
        height: '100%',
        flexShrink: 0
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(30, 30, 30, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(30, 30, 30, 0.06)'
          }}
        >
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgb(30, 30, 30)',
              mb: 0.5
            }}
          >
            {module.name}
          </Typography>
          <Typography
            sx={{
              fontSize: '12px',
              color: 'rgba(30, 30, 30, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {module.type} • {module.moduleType}
          </Typography>
        </Box>

        {/* Content Sections */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={3}>
            {/* CONTENT Section */}
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

              <Stack spacing={2}>
                {module.type === 'hero' && (
                  <>
                    <TextField
                      label="Heading"
                      fullWidth
                      size="small"
                      value={module.content.heading || ''}
                      onChange={(e) => handleContentChange('heading', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                    <TextField
                      label="Subheading"
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      value={module.content.subheading || ''}
                      onChange={(e) => handleContentChange('subheading', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                  </>
                )}

                {module.type === 'about' && (
                  <>
                    <TextField
                      label="Title"
                      fullWidth
                      size="small"
                      value={module.content.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                    <TextField
                      label="Description"
                      fullWidth
                      size="small"
                      multiline
                      rows={4}
                      value={module.content.description || ''}
                      onChange={(e) => handleContentChange('description', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                  </>
                )}

                {module.type === 'contact' && (
                  <>
                    <TextField
                      label="Title"
                      fullWidth
                      size="small"
                      value={module.content.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                    <TextField
                      label="Email"
                      fullWidth
                      size="small"
                      value={module.content.email || ''}
                      onChange={(e) => handleContentChange('email', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                    <TextField
                      label="Phone"
                      fullWidth
                      size="small"
                      value={module.content.phone || ''}
                      onChange={(e) => handleContentChange('phone', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                  </>
                )}

                {module.type === 'text' && (
                  <>
                    <TextField
                      label="Heading (optional)"
                      fullWidth
                      size="small"
                      value={module.content.heading || ''}
                      onChange={(e) => handleContentChange('heading', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                    <TextField
                      label="Text Content"
                      fullWidth
                      size="small"
                      multiline
                      rows={8}
                      value={module.content.text || ''}
                      onChange={(e) => handleContentChange('text', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                  </>
                )}

                {module.type === 'video' && (
                  <>
                    <TextField
                      label="Title (optional)"
                      fullWidth
                      size="small"
                      value={module.content.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                    <TextField
                      label="Video URL"
                      fullWidth
                      size="small"
                      placeholder="YouTube, Vimeo, or direct video URL"
                      value={module.content.videoUrl || ''}
                      onChange={(e) => handleContentChange('videoUrl', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                  </>
                )}

                {module.type === 'services' && (
                  <>
                    <TextField
                      label="Title"
                      fullWidth
                      size="small"
                      value={module.content.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
                    <TextField
                      label="Subtitle (optional)"
                      fullWidth
                      size="small"
                      value={module.content.subtitle || ''}
                      onChange={(e) => handleContentChange('subtitle', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
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
                      Service items editor coming soon
                    </Box>
                  </>
                )}

                {module.type === 'gallery' && (
                  <>
                    <TextField
                      label="Title"
                      fullWidth
                      size="small"
                      value={module.content.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
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
                      Image upload coming soon
                    </Box>
                  </>
                )}

                {module.type === 'calendar' && (
                  <>
                    <TextField
                      label="Title"
                      fullWidth
                      size="small"
                      value={module.content.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
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
                      Calendar managed in Calendar tab
                    </Box>
                  </>
                )}

                {module.type === 'testimonials' && (
                  <>
                    <TextField
                      label="Title"
                      fullWidth
                      size="small"
                      value={module.content.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
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
                      Testimonials editor coming soon
                    </Box>
                  </>
                )}

                {module.type === 'pricing' && (
                  <>
                    <TextField
                      label="Title"
                      fullWidth
                      size="small"
                      value={module.content.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
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
                      Pricing plans editor coming soon
                    </Box>
                  </>
                )}

                {module.type === 'faq' && (
                  <>
                    <TextField
                      label="Title"
                      fullWidth
                      size="small"
                      value={module.content.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
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
                      FAQ editor coming soon
                    </Box>
                  </>
                )}

                {module.type === 'team' && (
                  <>
                    <TextField
                      label="Title"
                      fullWidth
                      size="small"
                      value={module.content.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgb(146, 0, 32)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'rgb(146, 0, 32)'
                        }
                      }}
                    />
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
                      Team members editor coming soon
                    </Box>
                  </>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* APPEARANCE Section */}
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

              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(30, 30, 30, 0.02)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'rgba(30, 30, 30, 0.6)'
                  }}
                >
                  Layout: {module.layout}
                </Box>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(30, 30, 30, 0.02)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'rgba(30, 30, 30, 0.6)'
                  }}
                >
                  Style: {module.style}
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* ADVANCED Section (Collapsible) */}
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
                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(30, 30, 30, 0.02)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: 'rgba(30, 30, 30, 0.6)',
                      textAlign: 'center'
                    }}
                  >
                    Advanced options coming soon
                  </Box>
                </Stack>
              </Collapse>
            </Box>
          </Stack>
        </Box>
      </Box>
    </motion.div>
  );
};

export default PropertiesPanel;
