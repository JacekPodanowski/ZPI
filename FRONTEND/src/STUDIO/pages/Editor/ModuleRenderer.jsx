import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

// Simple module renderer - will be expanded based on module type
const ModuleRenderer = ({ module, pageId }) => {
  const renderContent = () => {
    switch (module.type) {
      case 'hero':
        const layout = module.content.layout || 'imageRight';
        const isImageLayout = layout === 'imageRight' || layout === 'imageLeft';
        
        return (
          <Box
            sx={{
              minHeight: '600px',
              display: 'flex',
              alignItems: 'center',
              bgcolor: module.content.bgColor || 'rgb(228, 229, 218)',
              color: module.content.textColor || 'rgb(30, 30, 30)',
              px: { xs: 4, md: 8 },
              py: 6,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                maxWidth: '1400px',
                width: '100%',
                mx: 'auto',
                display: 'flex',
                flexDirection: layout === 'imageLeft' ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 8
              }}
            >
              {/* Text Content */}
              <Box
                sx={{
                  flex: isImageLayout ? '1 1 50%' : '1 1 100%',
                  textAlign: isImageLayout ? 'left' : 'center',
                  mx: isImageLayout ? 0 : 'auto',
                  maxWidth: isImageLayout ? 'none' : '800px'
                }}
              >
                {module.visibility?.heading !== false && (
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '42px', md: '64px' },
                      fontWeight: 700,
                      mb: 2,
                      letterSpacing: '-1px',
                      lineHeight: 1.1
                    }}
                  >
                    {module.content.heading || 'Transform Your Vision'}
                  </Typography>
                )}
                {module.visibility?.subheading !== false && (
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '18px', md: '24px' },
                      fontWeight: 500,
                      opacity: 0.75,
                      mb: 3
                    }}
                  >
                    {module.content.subheading || 'Discover excellence through personalized service'}
                  </Typography>
                )}
                {module.visibility?.description !== false && module.content.description && (
                  <Typography
                    sx={{
                      fontSize: { xs: '14px', md: '16px' },
                      lineHeight: 1.7,
                      opacity: 0.65,
                      mb: 4
                    }}
                  >
                    {module.content.description}
                  </Typography>
                )}
                
                {/* CTA Buttons */}
                {module.visibility?.cta !== false && (module.content.cta?.primary || module.content.cta?.secondary) && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      justifyContent: isImageLayout ? 'flex-start' : 'center',
                      flexWrap: 'wrap'
                    }}
                  >
                    {module.content.cta?.primary && (
                      <Box
                        sx={{
                          px: 4,
                          py: 1.5,
                          bgcolor: module.content.accentColor || 'rgb(146, 0, 32)',
                          color: 'white',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(146, 0, 32, 0.3)'
                          }
                        }}
                      >
                        {module.content.cta.primary.text || 'Get Started'}
                      </Box>
                    )}
                    {module.content.cta?.secondary && (
                      <Box
                        sx={{
                          px: 4,
                          py: 1.5,
                          bgcolor: 'transparent',
                          color: module.content.textColor || 'rgb(30, 30, 30)',
                          border: `2px solid ${module.content.textColor || 'rgb(30, 30, 30)'}`,
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        {module.content.cta.secondary.text || 'Learn More'}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Image */}
              {isImageLayout && module.content.image?.url && (
                <Box
                  sx={{
                    flex: '1 1 50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src={module.content.image.url}
                    alt={module.content.image.alt || 'Hero image'}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '500px',
                      objectFit: 'cover',
                      borderRadius: '16px',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        );

      case 'about':
        return (
          <Box
            sx={{
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: module.content.bgColor || 'white',
              p: 6
            }}
          >
            <Box sx={{ maxWidth: '800px', textAlign: 'center' }}>
              {module.visibility?.title !== false && (
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: '48px',
                    fontWeight: 600,
                    mb: 3,
                    color: 'rgb(30, 30, 30)'
                  }}
                >
                  {module.content.title || 'About Us'}
                </Typography>
              )}
              {module.visibility?.description !== false && (
                <Typography
                  sx={{
                    fontSize: '18px',
                    lineHeight: 1.8,
                    color: 'rgba(30, 30, 30, 0.8)'
                  }}
                >
                  {module.content.description || 'Tell your story here...'}
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 'services':
        return (
          <Box
            sx={{
              minHeight: '500px',
              bgcolor: module.content.bgColor || 'white',
              p: 6
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: '48px',
                fontWeight: 600,
                mb: 2,
                textAlign: 'center',
                color: 'rgb(30, 30, 30)'
              }}
            >
              {module.content.title || 'Our Services'}
            </Typography>
            {module.content.subtitle && (
              <Typography
                sx={{
                  fontSize: '18px',
                  mb: 6,
                  textAlign: 'center',
                  color: 'rgba(30, 30, 30, 0.6)'
                }}
              >
                {module.content.subtitle}
              </Typography>
            )}
            <Grid container spacing={3} sx={{ maxWidth: '1200px', mx: 'auto' }}>
              {(module.content.services || []).map((service, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: 'rgba(228, 229, 218, 0.3)',
                      borderRadius: '12px',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '20px',
                        fontWeight: 600,
                        mb: 2,
                        color: 'rgb(30, 30, 30)'
                      }}
                    >
                      {service.name || 'Service'}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '16px',
                        mb: 2,
                        color: 'rgba(30, 30, 30, 0.7)'
                      }}
                    >
                      {service.description || 'Service description'}
                    </Typography>
                    {service.price && (
                      <Typography
                        sx={{
                          fontSize: '24px',
                          fontWeight: 700,
                          color: 'rgb(146, 0, 32)'
                        }}
                      >
                        {service.price} {module.content.currency || 'PLN'}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'gallery':
        return (
          <Box
            sx={{
              minHeight: '500px',
              bgcolor: module.content.bgColor || 'rgb(228, 229, 218)',
              p: 6
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: '48px',
                fontWeight: 600,
                mb: 6,
                textAlign: 'center',
                color: 'rgb(30, 30, 30)'
              }}
            >
              {module.content.title || 'Gallery'}
            </Typography>
            <Grid container spacing={2} sx={{ maxWidth: '1200px', mx: 'auto' }}>
              {(module.content.images || []).slice(0, 6).map((img, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                    sx={{
                      paddingTop: '100%',
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      bgcolor: 'rgba(30, 30, 30, 0.05)'
                    }}
                  >
                    {img && (
                      <Box
                        component="img"
                        src={img}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              ))}
              {(!module.content.images || module.content.images.length === 0) && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      height: '300px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed rgba(30, 30, 30, 0.2)',
                      borderRadius: '12px',
                      color: 'rgba(30, 30, 30, 0.4)'
                    }}
                  >
                    Add images to gallery
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 'calendar':
        return (
          <Box
            sx={{
              minHeight: '600px',
              bgcolor: module.content.bgColor || 'white',
              p: 6
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: '48px',
                fontWeight: 600,
                mb: 6,
                textAlign: 'center',
                color: module.content.color || 'rgb(146, 0, 32)'
              }}
            >
              {module.content.title || 'Book an Appointment'}
            </Typography>
            <Box
              sx={{
                maxWidth: '900px',
                mx: 'auto',
                p: 4,
                bgcolor: 'rgba(228, 229, 218, 0.3)',
                borderRadius: '16px',
                textAlign: 'center'
              }}
            >
              <Typography sx={{ color: 'rgba(30, 30, 30, 0.6)' }}>
                Calendar module preview - Full calendar will be rendered on live site
              </Typography>
            </Box>
          </Box>
        );

      case 'contact':
        return (
          <Box
            sx={{
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: module.content.bgColor || 'rgb(228, 229, 218)',
              p: 6
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: '48px',
                fontWeight: 600,
                mb: 4,
                color: 'rgb(30, 30, 30)'
              }}
            >
              {module.content.title || 'Get in Touch'}
            </Typography>
            <Box
              sx={{
                width: '100%',
                maxWidth: '500px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: '8px',
                  border: '1px solid rgba(30, 30, 30, 0.1)'
                }}
              >
                Email: {module.content.email || 'contact@example.com'}
              </Box>
              {module.content.phone && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: '8px',
                    border: '1px solid rgba(30, 30, 30, 0.1)'
                  }}
                >
                  Phone: {module.content.phone}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 'text':
        return (
          <Box
            sx={{
              minHeight: '300px',
              bgcolor: module.content.bgColor || 'white',
              p: 6
            }}
          >
            <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
              {module.content.heading && (
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: '36px',
                    fontWeight: 600,
                    mb: 3,
                    color: 'rgb(30, 30, 30)'
                  }}
                >
                  {module.content.heading}
                </Typography>
              )}
              <Typography
                sx={{
                  fontSize: '16px',
                  lineHeight: 1.8,
                  color: 'rgba(30, 30, 30, 0.8)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {module.content.text || 'Add your text content here...'}
              </Typography>
            </Box>
          </Box>
        );

      case 'video':
        return (
          <Box
            sx={{
              minHeight: '500px',
              bgcolor: module.content.bgColor || 'rgb(12, 12, 12)',
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {module.content.title && (
              <Typography
                variant="h2"
                sx={{
                  fontSize: '48px',
                  fontWeight: 600,
                  mb: 4,
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                {module.content.title}
              </Typography>
            )}
            <Box
              sx={{
                width: '100%',
                maxWidth: '900px',
                aspectRatio: '16/9',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              {module.content.videoUrl ? (
                <Typography>Video: {module.content.videoUrl}</Typography>
              ) : (
                <Typography>Add video URL</Typography>
              )}
            </Box>
          </Box>
        );

      case 'testimonials':
        return (
          <Box
            sx={{
              minHeight: '500px',
              bgcolor: module.content.bgColor || 'white',
              p: 6
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: '48px',
                fontWeight: 600,
                mb: 6,
                textAlign: 'center',
                color: 'rgb(30, 30, 30)'
              }}
            >
              {module.content.title || 'What People Say'}
            </Typography>
            <Grid container spacing={3} sx={{ maxWidth: '1200px', mx: 'auto' }}>
              {(module.content.testimonials || []).map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: 'rgba(228, 229, 218, 0.2)',
                      borderRadius: '12px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '16px',
                        fontStyle: 'italic',
                        mb: 3,
                        color: 'rgba(30, 30, 30, 0.8)',
                        flex: 1
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'rgb(30, 30, 30)'
                      }}
                    >
                      — {testimonial.author}
                    </Typography>
                  </Box>
                </Grid>
              ))}
              {(!module.content.testimonials || module.content.testimonials.length === 0) && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed rgba(30, 30, 30, 0.2)',
                      borderRadius: '12px',
                      color: 'rgba(30, 30, 30, 0.4)'
                    }}
                  >
                    Add testimonials
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 'pricing':
        return (
          <Box
            sx={{
              minHeight: '500px',
              bgcolor: module.content.bgColor || 'white',
              p: 6
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: '48px',
                fontWeight: 600,
                mb: 6,
                textAlign: 'center',
                color: 'rgb(30, 30, 30)'
              }}
            >
              {module.content.title || 'Pricing Plans'}
            </Typography>
            <Grid container spacing={3} sx={{ maxWidth: '1200px', mx: 'auto' }}>
              {(module.content.plans || []).map((plan, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box
                    sx={{
                      p: 4,
                      bgcolor: plan.featured ? 'rgb(146, 0, 32)' : 'rgba(228, 229, 218, 0.3)',
                      color: plan.featured ? 'white' : 'rgb(30, 30, 30)',
                      borderRadius: '16px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: plan.featured ? 'none' : '1px solid rgba(30, 30, 30, 0.08)',
                      transform: plan.featured ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '24px',
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '48px',
                        fontWeight: 700,
                        mb: 1
                      }}
                    >
                      {plan.price} {module.content.currency || 'PLN'}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        opacity: 0.7,
                        mb: 3
                      }}
                    >
                      {plan.period || 'per month'}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      {(plan.features || []).map((feature, idx) => (
                        <Typography
                          key={idx}
                          sx={{
                            fontSize: '14px',
                            mb: 1,
                            opacity: 0.9
                          }}
                        >
                          ✓ {feature}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              ))}
              {(!module.content.plans || module.content.plans.length === 0) && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed rgba(30, 30, 30, 0.2)',
                      borderRadius: '12px',
                      color: 'rgba(30, 30, 30, 0.4)'
                    }}
                  >
                    Add pricing plans
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 'faq':
        return (
          <Box
            sx={{
              minHeight: '400px',
              bgcolor: module.content.bgColor || 'white',
              p: 6
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: '48px',
                fontWeight: 600,
                mb: 6,
                textAlign: 'center',
                color: 'rgb(30, 30, 30)'
              }}
            >
              {module.content.title || 'Frequently Asked Questions'}
            </Typography>
            <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
              {(module.content.questions || []).map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    p: 3,
                    bgcolor: 'rgba(228, 229, 218, 0.2)',
                    borderRadius: '12px'
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '18px',
                      fontWeight: 600,
                      mb: 1.5,
                      color: 'rgb(30, 30, 30)'
                    }}
                  >
                    {item.question}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      color: 'rgba(30, 30, 30, 0.7)',
                      lineHeight: 1.6
                    }}
                  >
                    {item.answer}
                  </Typography>
                </Box>
              ))}
              {(!module.content.questions || module.content.questions.length === 0) && (
                <Box
                  sx={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed rgba(30, 30, 30, 0.2)',
                    borderRadius: '12px',
                    color: 'rgba(30, 30, 30, 0.4)'
                  }}
                >
                  Add FAQ items
                </Box>
              )}
            </Box>
          </Box>
        );

      case 'team':
        return (
          <Box
            sx={{
              minHeight: '500px',
              bgcolor: module.content.bgColor || 'white',
              p: 6
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: '48px',
                fontWeight: 600,
                mb: 6,
                textAlign: 'center',
                color: 'rgb(30, 30, 30)'
              }}
            >
              {module.content.title || 'Our Team'}
            </Typography>
            <Grid container spacing={4} sx={{ maxWidth: '1200px', mx: 'auto' }}>
              {(module.content.members || []).map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box
                    sx={{
                      textAlign: 'center'
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        paddingTop: '100%',
                        position: 'relative',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        bgcolor: 'rgba(228, 229, 218, 0.3)',
                        mb: 2
                      }}
                    >
                      {member.photo && (
                        <Box
                          component="img"
                          src={member.photo}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '18px',
                        fontWeight: 600,
                        mb: 0.5,
                        color: 'rgb(30, 30, 30)'
                      }}
                    >
                      {member.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        color: 'rgba(30, 30, 30, 0.6)'
                      }}
                    >
                      {member.role}
                    </Typography>
                  </Box>
                </Grid>
              ))}
              {(!module.content.members || module.content.members.length === 0) && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed rgba(30, 30, 30, 0.2)',
                      borderRadius: '12px',
                      color: 'rgba(30, 30, 30, 0.4)'
                    }}
                  >
                    Add team members
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(30, 30, 30, 0.02)',
              color: 'rgba(30, 30, 30, 0.4)',
              fontSize: '14px',
              p: 4
            }}
          >
            {module.type} module (renderer not implemented)
          </Box>
        );
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {renderContent()}
      
      {/* Custom Elements Overlay */}
      {module.customElements && module.customElements.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            px: 1.5,
            py: 0.5,
            bgcolor: 'rgba(146, 0, 32, 0.9)',
            color: 'white',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Extended
        </Box>
      )}
    </Box>
  );
};

export default ModuleRenderer;
