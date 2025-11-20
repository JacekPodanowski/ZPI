import React, { useMemo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { MODULE_REGISTRY } from '../../../SITES/components/modules/ModuleRegistry.js';
import { STYLES } from '../../../SITES/styles';
import useNewEditorStore from '../../store/newEditorStore';
import { buildNavigationContent } from './moduleDefinitions';

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
const ModuleRenderer = ({ module, pageId, theme, onNavigate, devicePreview = 'desktop' }) => {
  // Get siteId from store - it's a top-level field, not site.id
  const siteId = useNewEditorStore(state => state.siteId);
  const site = useNewEditorStore(state => state.site);
  const entryPointPageId = useNewEditorStore(state => state.entryPointPageId);
  const selectedPageId = useNewEditorStore(state => state.selectedPageId);
  const enterDetailMode = useNewEditorStore(state => state.enterDetailMode);

  // Debug log for Team module
  if (module?.type === 'team') {
    console.log('[ModuleRenderer] Team module - siteId:', siteId);
  }

  const resolvedStyle = useMemo(() => {
    return site?.style || STYLES.auroraMinimal || {};
  }, [site?.style]);
  
  if (!module) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'rgba(30, 30, 30, 0.4)' }}>
        No module data
      </Box>
    );
  }

  const moduleType = (module.type || '').toLowerCase();
  const moduleDef = MODULE_REGISTRY[moduleType];
  const isNavigationModule = moduleType === 'navigation';

  const navigationContent = useMemo(() => {
    if (!isNavigationModule) {
      return null;
    }
    const baseContent = buildNavigationContent(
      site,
      module.content || {},
      entryPointPageId,
      selectedPageId
    );

  const navBgFallback = '#ffffff';
  const navTextFallback = theme?.text || DEFAULT_THEME.text;

    return {
      ...baseContent,
      bgColor: !baseContent.bgColor || baseContent.bgColor === 'transparent'
        ? navBgFallback
        : baseContent.bgColor,
      textColor: !baseContent.textColor || baseContent.textColor === 'transparent'
        ? navTextFallback
        : baseContent.textColor,
      activeColor: !baseContent.activeColor || baseContent.activeColor === 'transparent'
        ? navTextFallback
        : baseContent.activeColor
    };
  }, [isNavigationModule, site, module.content, entryPointPageId, selectedPageId, theme]);

  const handleNavigation = useCallback((targetPageId) => {
    if (!targetPageId) return;
    if (onNavigate) {
      onNavigate(targetPageId);
      return;
    }
    enterDetailMode(targetPageId);
    const scrollContainer = document.querySelector('[data-detail-canvas-scroll="true"]');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [enterDetailMode, onNavigate]);

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

  // For calendar module, select component based on type
  let Component = moduleDef.component;
  if (moduleType === 'calendar' && module.content?.type) {
    if (module.content.type === 'full' && moduleDef.componentFull) {
      Component = moduleDef.componentFull;
    } else if (module.content.type === 'compact' && moduleDef.componentCompact) {
      Component = moduleDef.componentCompact;
    }
  }

  const baseLayout = module.layout || module.content?.layout || moduleDef.defaultLayout;
  const layout = isNavigationModule && devicePreview === 'mobile'
    ? 'mobile'
    : baseLayout;

  // Use provided theme or fall back to default
  const effectiveTheme = theme || DEFAULT_THEME;

  const componentProps = {
    layout,
    content: isNavigationModule ? (navigationContent || {}) : (module.content || {}),
    style: resolvedStyle,
    theme: effectiveTheme,
    siteId,
    isEditing: true,
    devicePreview
  };

  if (isNavigationModule) {
    componentProps.onNavigate = handleNavigation;
  }

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <Component {...componentProps} />
      
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
