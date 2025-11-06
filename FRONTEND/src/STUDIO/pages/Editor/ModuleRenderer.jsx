import React from 'react';
import { Box, Typography } from '@mui/material';
import { MODULE_REGISTRY } from '../../../SITES/components/modules/ModuleRegistry.js';

// Default vibe for STUDIO preview (same structure as SITES vibes)
const DEFAULT_VIBE = {
  name: 'Studio Preview',
  spacing: 'space-y-8 py-12 md:py-16 px-4 md:px-6',
  borders: 'border border-gray-200',
  shadows: 'shadow-sm hover:shadow-md',
  rounded: 'rounded-lg',
  animations: 'transition-all duration-300 ease-in-out',
  textSize: 'text-base md:text-lg leading-relaxed',
  headingSize: 'text-3xl md:text-4xl lg:text-5xl font-light tracking-tight',
  buttonStyle: 'px-6 md:px-8 py-2 md:py-3 rounded-md font-medium text-sm md:text-base',
  cardStyle: 'border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg'
};

// Default theme for STUDIO preview (modernWellness light mode)
const DEFAULT_THEME = {
  // Base colors
  background: '#e4e5da',
  text: '#1e1e1e',
  primary: '#920020',
  secondary: '#bcbab3',
  grey: '#bcbab3', // Alias for secondary
  // Surface colors
  page: '#e4e5da',
  surface: '#f5f5f0',
  elevated: '#ffffff',
  // Interactive states
  border: 'rgba(30, 30, 30, 0.12)',
  divider: 'rgba(30, 30, 30, 0.08)',
  hover: 'rgba(146, 0, 32, 0.08)',
  focus: 'rgba(146, 0, 32, 0.12)',
  disabled: 'rgba(30, 30, 30, 0.38)',
  // Status colors
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  success: '#2e7d32'
};

/**
 * ModuleRenderer - dynamically renders modules using MODULE_REGISTRY
 * This ensures STUDIO uses the same migrated components as SITES
 */
const ModuleRenderer = ({ module, pageId, theme }) => {
  console.log('🎬 ModuleRenderer - Render:', {
    moduleId: module?.id,
    moduleType: module?.type,
    contentKeys: Object.keys(module?.content || {}),
    hasBackgroundImage: !!module?.content?.backgroundImage,
    backgroundImage: module?.content?.backgroundImage?.substring(0, 50)
  });
  
  if (!module) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'rgba(30, 30, 30, 0.4)' }}>
        No module data
      </Box>
    );
  }

  const moduleType = (module.type || '').toLowerCase();
  const moduleDef = MODULE_REGISTRY[moduleType];

  if (!moduleDef) {
    return (
      <Box
        sx={{
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 0, 0, 0.05)',
          color: 'rgba(255, 0, 0, 0.7)',
          fontSize: '14px',
          p: 4,
          border: '2px dashed rgba(255, 0, 0, 0.3)',
          borderRadius: '8px'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>
            Module type "{moduleType}" not found in MODULE_REGISTRY
          </Typography>
          <Typography sx={{ fontSize: '12px', opacity: 0.7 }}>
            Make sure the module is properly migrated and registered
          </Typography>
        </Box>
      </Box>
    );
  }

  const Component = moduleDef.component;
  const layout = module.content?.layout || moduleDef.defaultLayout;

  // Use provided theme or fall back to default
  const effectiveTheme = theme || DEFAULT_THEME;

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <Component
        layout={layout}
        content={module.content || {}}
        vibe={DEFAULT_VIBE} // Use default vibe for STUDIO preview
        theme={effectiveTheme}
        isEditing={true} // Flag to indicate this is editor mode
      />
      
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
            letterSpacing: '0.5px',
            zIndex: 10
          }}
        >
          Extended
        </Box>
      )}
    </Box>
  );
};

export default ModuleRenderer;
