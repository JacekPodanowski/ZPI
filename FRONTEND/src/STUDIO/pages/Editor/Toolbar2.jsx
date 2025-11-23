import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, 
  Stack, 
  Typography, 
  IconButton, 
  Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Delete, 
  Close, 
  ViewModule,
  Palette,
  Settings,
  Photo
} from '@mui/icons-material';
import { getAvailableModules, getDefaultModuleContent } from './moduleDefinitions';
import useTheme from '../../../theme/useTheme';
import useNewEditorStore from '../../store/newEditorStore';
import { alpha } from '@mui/material/styles';

const EDITOR_TOP_BAR_HEIGHT = 56;
const TOOLBAR_WIDTH_MIN = 175;
const TOOLBAR_WIDTH_DEFAULT = 200;
const TOOLBAR_WIDTH_MAX = 300;
const COLLAPSED_TOOLBAR_WIDTH = 48;
const COLLAPSE_INDICATOR_BUFFER = 25;
const COLLAPSE_INDICATOR_MAX_DRAG = 140;
const COLLAPSE_INDICATOR_COLLAPSE_THRESHOLD = 45;
const INDICATOR_BASE_MIN_WIDTH = 18;
const INDICATOR_PREVIEW_SAMPLE_DRAG = 110;

// Define categories with their icons and modes
const ALL_CATEGORIES = [
  { id: 'modules', label: 'Modules', icon: ViewModule, modes: ['detail', 'structure'] },
  { id: 'styling', label: 'Styling', icon: Palette, modes: ['detail', 'structure'] },
  { id: 'media', label: 'Media', icon: Photo, modes: ['detail'] }, // Only in detail mode
  { id: 'settings', label: 'Settings', icon: Settings, modes: ['detail', 'structure'] }
];

const INDICATOR_STYLE_OPTIONS = [
  { id: 'blade', label: 'Blade Curve', description: 'Smooth tapered shape with a crisp blade-like edge.' },
  { id: 'arrow', label: 'Arrowhead', description: 'Classic arrow profile with a sharp center hit.' },
  { id: 'curve', label: 'Soft Curve', description: 'Gentle concave profile that narrows into the canvas.' },
  { id: 'spike', label: 'Double Spike', description: 'Aggressive twin-spike cut for decisive collapsing.' },
  { id: 'stream', label: 'Streamline', description: 'Long aerodynamic taper with a narrow impact line.' }
];

const INDICATOR_STYLE_CONFIGS = {
  blade: {
    minWidth: INDICATOR_BASE_MIN_WIDTH + 6,
    widthFactor: 0.68,
    clipPath: 'polygon(100% 0%, 99% 5%, 98% 10%, 96% 15%, 94% 20%, 91% 25%, 87% 30%, 82% 35%, 77% 40%, 72% 45%, 68% 50%, 72% 55%, 77% 60%, 82% 65%, 87% 70%, 91% 75%, 94% 80%, 96% 85%, 98% 90%, 99% 95%, 100% 100%)',
    background: (accent) => accent
  },
  arrow: {
    minWidth: INDICATOR_BASE_MIN_WIDTH + 4,
    widthFactor: 0.62,
    clipPath: 'polygon(100% 0%, 99% 5%, 97% 10%, 95% 15%, 92% 20%, 88% 25%, 83% 30%, 78% 35%, 73% 40%, 68% 45%, 64% 50%, 68% 55%, 73% 60%, 78% 65%, 83% 70%, 88% 75%, 92% 80%, 95% 85%, 97% 90%, 99% 95%, 100% 100%)',
    background: (accent) => accent
  },
  curve: {
    minWidth: INDICATOR_BASE_MIN_WIDTH + 8,
    widthFactor: 0.72,
    clipPath: 'polygon(100% 0%, 99% 5%, 98% 10%, 97% 15%, 95% 20%, 92% 25%, 88% 30%, 84% 35%, 79% 40%, 74% 45%, 70% 50%, 74% 55%, 79% 60%, 84% 65%, 88% 70%, 92% 75%, 95% 80%, 97% 85%, 98% 90%, 99% 95%, 100% 100%)',
    background: (accent) => accent
  },
  spike: {
    minWidth: INDICATOR_BASE_MIN_WIDTH + 5,
    widthFactor: 0.66,
    clipPath: 'polygon(100% 0%, 99% 5%, 97% 10%, 94% 15%, 91% 20%, 87% 25%, 82% 30%, 77% 35%, 72% 40%, 67% 45%, 62% 50%, 67% 55%, 72% 60%, 77% 65%, 82% 70%, 87% 75%, 91% 80%, 94% 85%, 97% 90%, 99% 95%, 100% 100%)',
    background: (accent) => accent
  },
  stream: {
    minWidth: INDICATOR_BASE_MIN_WIDTH + 7,
    widthFactor: 0.7,
    clipPath: 'polygon(100% 0%, 99% 5%, 98% 10%, 96% 15%, 94% 20%, 91% 25%, 87% 30%, 83% 35%, 78% 40%, 73% 45%, 69% 50%, 73% 55%, 78% 60%, 83% 65%, 87% 70%, 91% 75%, 94% 80%, 96% 85%, 98% 90%, 99% 95%, 100% 100%)',
    background: (accent) => accent
  }
};

const getIndicatorVisuals = (styleId, size, accentColor) => {
  const config = INDICATOR_STYLE_CONFIGS[styleId] || INDICATOR_STYLE_CONFIGS.blade;
  const appliedSize = Math.min(COLLAPSE_INDICATOR_MAX_DRAG, Math.max(0, size));
  const width = config.minWidth + appliedSize * config.widthFactor;
  const visuals = {
    width,
    background: config.background(accentColor),
    clipPath: config.clipPath
  };

  return visuals;
};

const Toolbar2 = ({ isDraggingModule = false, onClose, mode = 'detail', onWidthChange }) => {
  const modules = getAvailableModules();
  const theme = useTheme();
  const isDarkMode = theme.mode === 'dark';
  
  // Filter categories based on mode
  const CATEGORIES = ALL_CATEGORIES.filter(cat => cat.modes.includes(mode));
  
  // Theme colors
  const accentColor = theme.colors?.interactive?.default || 'rgb(146, 0, 32)';
  const accentHoverColor = theme.colors?.interactive?.hover || 'rgb(114, 0, 21)';
  const moduleListBg = isDarkMode ? 'rgba(20, 20, 24, 0.94)' : 'rgba(255, 255, 255, 0.9)';
  const moduleListBorder = theme.colors?.border?.subtle || (isDarkMode ? 'rgba(220, 220, 220, 0.08)' : 'rgba(30, 30, 30, 0.06)');
  const moduleListHover = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 30, 30, 0.04)';
  const selectedBg = isDarkMode ? 'rgba(146, 0, 32, 0.24)' : 'rgba(146, 0, 32, 0.08)';
  const selectedHoverBg = isDarkMode ? 'rgba(146, 0, 32, 0.32)' : 'rgba(146, 0, 32, 0.12)';
  const textPrimary = theme.colors?.text?.base || (isDarkMode ? 'rgba(235, 235, 235, 0.94)' : 'rgb(30, 30, 30)');
  const textMuted = theme.colors?.text?.muted || (isDarkMode ? 'rgba(210, 210, 210, 0.65)' : 'rgba(30, 30, 30, 0.5)');
  const popupBackground = isDarkMode ? 'rgba(28, 28, 32, 0.96)' : 'white';
  const popupBorder = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 30, 30, 0.08)';
  const popupHeaderBg = isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)';
  const popupText = isDarkMode ? 'rgba(240, 240, 242, 0.95)' : 'rgb(30, 30, 30)';
  const popupMutedText = isDarkMode ? 'rgba(225, 225, 228, 0.75)' : 'rgba(30, 30, 30, 0.7)';
  
  const { removeModule, addModule, setDragging } = useNewEditorStore();
  
  // State
  const [activeCategory, setActiveCategory] = useState('modules');
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [popupCenterY, setPopupCenterY] = useState(0);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [toolbarWidth, setToolbarWidth] = useState(TOOLBAR_WIDTH_DEFAULT);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [collapseIndicatorSize, setCollapseIndicatorSize] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState('blade');
  const hasInitiallyAnimated = useRef(false);
  const toolbarRef = useRef(null);
  const moduleRefs = useRef({});
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const indicatorOption = useMemo(
    () => INDICATOR_STYLE_OPTIONS.find(option => option.id === indicatorStyle) || INDICATOR_STYLE_OPTIONS[0],
    [indicatorStyle]
  );

  const collapseIndicatorVisuals = useMemo(
    () => getIndicatorVisuals(indicatorStyle, collapseIndicatorSize, accentColor),
    [indicatorStyle, collapseIndicatorSize, accentColor]
  );

  const previewIndicatorVisuals = useMemo(
    () => getIndicatorVisuals(indicatorStyle, INDICATOR_PREVIEW_SAMPLE_DRAG, accentColor),
    [indicatorStyle, accentColor]
  );

  const handleDragStart = (e, moduleType) => {
    console.log('[Toolbar2] Drag started:', moduleType);
    e.dataTransfer.setData('moduleType', moduleType);
    e.dataTransfer.effectAllowed = 'copy';
    setSelectedModule(null);
  };

  const handleModuleClick = (e, module) => {
    e.stopPropagation();
    
    const boxElement = e.currentTarget;
    const contentArea = boxElement.closest('[data-toolbar-content]');
    const toolbar = toolbarRef.current;
    
    if (boxElement && contentArea && toolbar) {
      const boxRect = boxElement.getBoundingClientRect();
      const toolbarRect = toolbar.getBoundingClientRect();
      const scrollTop = contentArea.scrollTop || 0;
      
      // Calculate position relative to the entire toolbar (subtracting category tabs height)
      const moduleCenterY = (boxRect.top - toolbarRect.top) + scrollTop + (boxRect.height / 2) - EDITOR_TOP_BAR_HEIGHT;
      
      setPopupCenterY(moduleCenterY);
    }
    
    setSelectedModule(module);
    setIsFirstRender(false);
  };

  const handleAddModule = (module) => {
    const { currentPage } = useNewEditorStore.getState();
    if (currentPage) {
      const defaultContent = getDefaultModuleContent(module.type);
      addModule(currentPage.id, {
        type: module.type,
        content: defaultContent
      });
    }
    
    setSelectedModule(null);
    setIsFirstRender(true);
  };

  const handleTrashDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const moduleId = e.dataTransfer.getData('moduleId');
    const sourcePageId = e.dataTransfer.getData('sourcePageId');
    
    if (moduleId && sourcePageId) {
      console.log('[Toolbar2] Deleting module:', moduleId, 'from page:', sourcePageId);
      setIsOverTrash(false);
      removeModule(sourcePageId, moduleId);
      const raf = typeof window !== 'undefined' ? window.requestAnimationFrame : null;
      if (raf) {
        raf(() => setDragging(false));
      } else {
        setTimeout(() => setDragging(false), 0);
      }
    } else {
      setIsOverTrash(false);
      setDragging(false);
    }
  };

  const handleTrashDragOver = (e) => {
    if (!isDraggingModule) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOverTrash(true);
  };

  const handleTrashDragLeave = (e) => {
    if (!isDraggingModule) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsOverTrash(false);
    }
  };

  useEffect(() => {
    if (!isDraggingModule) {
      setIsOverTrash(false);
    }
  }, [isDraggingModule]);

  useEffect(() => {
    hasInitiallyAnimated.current = true;
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectedModule && !e.target.closest('[data-module-item]') && !e.target.closest('[data-module-popup]')) {
        setSelectedModule(null);
        setIsFirstRender(true);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedModule]);

  // Handle resize
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = toolbarWidth;
  };



  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const delta = e.clientX - resizeStartX.current;
      const targetWidth = resizeStartWidth.current + delta;

      if (targetWidth >= TOOLBAR_WIDTH_MIN) {
        // Between min and max: update width freely in real-time
        const clampedWidth = Math.max(TOOLBAR_WIDTH_MIN, Math.min(targetWidth, TOOLBAR_WIDTH_MAX));
        setToolbarWidth(clampedWidth);
        setCollapseIndicatorSize(0);
        onWidthChange?.(clampedWidth);
        return;
      }

      // Below minimum: keep at minimum and show collapse indicator
      const overshoot = TOOLBAR_WIDTH_MIN - targetWidth;

      if (overshoot <= COLLAPSE_INDICATOR_BUFFER) {
        setToolbarWidth(TOOLBAR_WIDTH_MIN);
        setCollapseIndicatorSize(0);
        onWidthChange?.(TOOLBAR_WIDTH_MIN);
        return;
      }

      setToolbarWidth(TOOLBAR_WIDTH_MIN);
      const effectiveOvershoot = Math.min(
        overshoot - COLLAPSE_INDICATOR_BUFFER,
        COLLAPSE_INDICATOR_MAX_DRAG
      );
      setCollapseIndicatorSize(effectiveOvershoot);
      onWidthChange?.(TOOLBAR_WIDTH_MIN);
    };

    const handleMouseUp = (e) => {
      setIsResizing(false);
      
      const delta = e.clientX - resizeStartX.current;
      const targetWidth = resizeStartWidth.current + delta;
      
      // If indicator was visible (pulled beyond minimum), collapse
      if (targetWidth < TOOLBAR_WIDTH_MIN && collapseIndicatorSize >= COLLAPSE_INDICATOR_COLLAPSE_THRESHOLD) {
        setIsCollapsed(true);
        setToolbarWidth(COLLAPSED_TOOLBAR_WIDTH);
        onWidthChange?.(COLLAPSED_TOOLBAR_WIDTH);
      }
      // Otherwise keep the current width (no snapping)
      
      setCollapseIndicatorSize(0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, collapseIndicatorSize]);

  const handleToggleCollapse = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setToolbarWidth(TOOLBAR_WIDTH_DEFAULT);
      onWidthChange?.(TOOLBAR_WIDTH_DEFAULT);
    } else {
      setIsCollapsed(true);
      setToolbarWidth(COLLAPSED_TOOLBAR_WIDTH);
      onWidthChange?.(COLLAPSED_TOOLBAR_WIDTH);
    }
  };

  // Notify parent on mount and width changes
  useEffect(() => {
    onWidthChange?.(toolbarWidth);
  }, [toolbarWidth, onWidthChange]);

  // Render content based on active category
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'modules':
        return (
          <Stack spacing={0.3}>
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, module.type)}
                  data-module-item
                >
                  <Box
                    ref={(el) => moduleRefs.current[module.type] = el}
                    onClick={(e) => handleModuleClick(e, module)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 1.25,
                      borderRadius: '8px',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      bgcolor: selectedModule?.type === module.type ? selectedBg : 'transparent',
                      '&:hover': {
                        bgcolor: selectedModule?.type === module.type ? selectedHoverBg : moduleListHover,
                        transform: 'translateX(4px)'
                      },
                      '&:active': {
                        cursor: 'grabbing',
                        transform: 'scale(0.95)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '6px',
                        bgcolor: module.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon sx={{ fontSize: 18, color: 'white' }} />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: textPrimary
                      }}
                    >
                      {module.label}
                    </Typography>
                  </Box>
                </motion.div>
              );
            })}
          </Stack>
        );
      
      case 'styling':
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '13px', color: textMuted }}>
              Styling options coming soon
            </Typography>
          </Box>
        );
      
      case 'media':
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '13px', color: textMuted }}>
              Media library coming soon
            </Typography>
          </Box>
        );
      
      case 'settings':
        return (
          <Stack spacing={1.5} sx={{ px: 1.5, py: 1.5 }}>
            <Typography sx={{ fontSize: '13px', letterSpacing: '0.4px', textTransform: 'uppercase', color: textMuted }}>
              Editor Settings
            </Typography>
            <Stack spacing={0.75}>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: textPrimary }}>
                Collapse Indicator Style
              </Typography>
              <Box
                component="select"
                value={indicatorStyle}
                onChange={(e) => setIndicatorStyle(e.target.value)}
                sx={{
                  width: '100%',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: textPrimary,
                  bgcolor: isDarkMode ? 'rgba(22, 22, 28, 0.85)' : 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '8px',
                  border: `1px solid ${moduleListBorder}`,
                  px: 1.5,
                  py: 1,
                  appearance: 'none',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  '&:focus': {
                    borderColor: accentColor,
                    boxShadow: `0 0 0 2px ${alpha(accentColor, 0.16)}`
                  },
                  '& option': {
                    color: textPrimary,
                    backgroundColor: isDarkMode ? 'rgba(18, 18, 22, 0.94)' : '#fff'
                  }
                }}
              >
                {INDICATOR_STYLE_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Box>
              <Typography sx={{ fontSize: '12.5px', color: textMuted, lineHeight: 1.5 }}>
                {indicatorOption?.description}
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  height: '52px',
                  borderRadius: '10px',
                  border: `1px dashed ${alpha(accentColor, 0.2)}`,
                  bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.65)',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: '8px',
                    bottom: '8px',
                    right: '18px',
                    width: `${previewIndicatorVisuals.width}px`,
                    background: previewIndicatorVisuals.background,
                    clipPath: previewIndicatorVisuals.clipPath,
                    transition: 'all 0.1s ease',
                    ...(previewIndicatorVisuals.boxShadow ? { boxShadow: previewIndicatorVisuals.boxShadow } : {}),
                    ...(previewIndicatorVisuals.highlight
                      ? { '&::after': { ...previewIndicatorVisuals.highlight, height: '48%' } }
                      : {})
                  }}
                />
              </Box>
            </Stack>
          </Stack>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={hasInitiallyAnimated.current ? false : { width: 0, opacity: 0 }}
      animate={{ width: toolbarWidth, opacity: 1 }}
      exit={hasInitiallyAnimated.current ? false : { width: 0, opacity: 0 }}
      transition={isResizing ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: '100%',
        flexShrink: 0
      }}
    >

      <Box
        ref={toolbarRef}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: moduleListBg,
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${moduleListBorder}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {/* Resize Handle & Collapse Indicator */}
        {!isCollapsed && (
          <>
            {/* Red line that stays visible */}
            <Box
              onMouseDown={handleResizeStart}
              onDoubleClick={() => {
                setIsCollapsed(false);
                setToolbarWidth(TOOLBAR_WIDTH_DEFAULT);
                onWidthChange?.(TOOLBAR_WIDTH_DEFAULT);
                setCollapseIndicatorSize(0);
              }}
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                cursor: 'ew-resize',
                zIndex: 1001,
                bgcolor: isResizing ? accentColor : 'transparent',
                opacity: isResizing ? 0.8 : 1,
                '&:hover': {
                  bgcolor: accentColor,
                  opacity: 0.5
                },
                transition: 'all 0.2s ease'
              }}
            />
            {/* Arrow indicator overlay */}
            {collapseIndicatorSize > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: `${collapseIndicatorVisuals.width}px`,
                  cursor: 'ew-resize',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  background: collapseIndicatorVisuals.background,
                  clipPath: collapseIndicatorVisuals.clipPath,
                  transition: 'all 0.065s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            )}
          </>
        )}

        {isCollapsed ? (
          // Collapsed View - Vertical Icons Only
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 1,
              pb: 2,
              gap: 1
            }}
          >
            {/* Category Icons */}
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <Tooltip key={category.id} title={category.label} placement="right">
                  <IconButton
                    onClick={() => {
                      setActiveCategory(category.id);
                      setIsCollapsed(false);
                      setToolbarWidth(TOOLBAR_WIDTH_DEFAULT);
                      onWidthChange?.(TOOLBAR_WIDTH_DEFAULT);
                    }}
                    sx={{
                      width: 36,
                      height: 36,
                      color: isActive ? accentColor : textMuted,
                      bgcolor: isActive ? selectedBg : 'transparent',
                      '&:hover': {
                        bgcolor: isActive ? selectedHoverBg : moduleListHover,
                        color: isActive ? accentHoverColor : textPrimary
                      }
                    }}
                  >
                    <Icon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>
        ) : (
          // Expanded View - Normal Toolbar
          <>
        {/* Category Tabs - Chrome Style */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
            px: 0.5,
            pt: 0.5,
            gap: 0.25,
            flexShrink: 0,
            position: 'relative',
            minWidth: 0,
            overflow: 'hidden'
          }}
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <Tooltip key={category.id} title={category.label} placement="top">
                <Box
                  onClick={() => setActiveCategory(category.id)}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    flex: '1 1 0',
                    minWidth: '32px',
                    px: toolbarWidth < 190 ? 0.5 : 1.5,
                    py: 1,
                    borderRadius: '8px 8px 0 0',
                    bgcolor: isActive ? moduleListBg : 'transparent',
                    color: isActive ? accentColor : textMuted,
                    transition: 'all 0.2s ease',
                    height: isActive ? '36px' : '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: isActive ? 0 : '4px',
                    '&:hover': {
                      bgcolor: isActive ? moduleListBg : moduleListHover,
                      color: isActive ? accentHoverColor : textPrimary,
                      height: isActive ? '36px' : '34px',
                      mb: isActive ? 0 : '2px'
                    },
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '-8px',
                      width: '8px',
                      height: '8px',
                      background: `radial-gradient(circle at 0 0, transparent 8px, ${moduleListBg} 8px)`,
                    } : {},
                    '&::after': isActive ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      right: '-8px',
                      width: '8px',
                      height: '8px',
                      background: `radial-gradient(circle at 100% 0, transparent 8px, ${moduleListBg} 8px)`,
                    } : {}
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
              </Tooltip>
            );
          })}
          
          {/* Close button */}
          {onClose && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                width: 28,
                height: 28,
                mb: 0.5,
                color: textMuted,
                '&:hover': {
                  color: accentColor,
                  bgcolor: 'rgba(146, 0, 32, 0.08)'
                }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Content Area - Fixed Height, Scrollable */}
        <Box
          data-toolbar-content
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: 2,
            pt: 1,
            pb: 2
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderCategoryContent()}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Module Info Popup */}
        <AnimatePresence mode="popLayout">
          {selectedModule && (
            <motion.div
              data-module-popup
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ 
                opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                x: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
                layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
              }}
              style={{
                position: 'absolute',
                left: `calc(100% + 16px)`,
                top: `${popupCenterY}px`,
                transform: 'translateY(-50%)',
                width: '300px',
                zIndex: 100
              }}
            >
              <Box
                sx={{
                  bgcolor: popupBackground,
                  borderRadius: '10px',
                  boxShadow: isDarkMode ? '0 12px 32px rgba(0, 0, 0, 0.45)' : '0 4px 20px rgba(0, 0, 0, 0.12)',
                  overflow: 'visible',
                  border: `1px solid ${popupBorder}`,
                  position: 'relative',
                  maxHeight: '50vh',
                  display: 'flex',
                  flexDirection: 'column',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '-10px',
                    top: '50%',
                    width: '20px',
                    height: '20px',
                    bgcolor: popupBackground,
                    border: `1px solid ${popupBorder}`,
                    borderRight: 'none',
                    borderBottom: 'none',
                    borderRadius: '3px 0 0 0',
                    transform: 'translateY(-50%) rotate(-45deg)',
                    boxShadow: '-2px -2px 4px rgba(0, 0, 0, 0.03)',
                    zIndex: -1
                  }
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    bgcolor: popupHeaderBg,
                    borderRadius: '10px 10px 0 0',
                    position: 'relative',
                    zIndex: 3
                  }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '5px',
                      bgcolor: selectedModule.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <selectedModule.icon sx={{ fontSize: 16, color: 'white' }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: popupText,
                      flex: 1
                    }}
                  >
                    {selectedModule.label}
                  </Typography>
                  
                  <Typography
                    onClick={() => handleAddModule(selectedModule)}
                    sx={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: accentColor,
                      cursor: 'pointer',
                      flexShrink: 0,
                      '&:hover': {
                        textDecoration: 'underline',
                        color: accentHoverColor
                      }
                    }}
                  >
                    Add
                  </Typography>
                </Box>

                {/* Description */}
                <Box 
                  sx={{ 
                    px: 1.25, 
                    py: 1, 
                    position: 'relative',
                    overflowY: 'auto',
                    flex: 1,
                    minHeight: '60px',
                    maxHeight: 'calc(50vh - 50px)',
                    bgcolor: popupBackground
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: popupMutedText,
                      textAlign: 'left',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedModule?.description || 'No description available'}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
        </>
        )}
      </Box>

      {/* Trash Zone Overlay */}
      <motion.div
        animate={{ 
          opacity: isDraggingModule ? 1 : 0,
          pointerEvents: isDraggingModule ? 'auto' : 'none'
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 20
        }}
      >
        <Box
          onDragOver={handleTrashDragOver}
          onDragLeave={handleTrashDragLeave}
          onDrop={handleTrashDrop}
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: isOverTrash 
              ? 'rgba(60, 60, 58, 1)' 
              : 'rgba(80, 80, 78, 1)',
            backdropFilter: 'blur(16px)',
            borderRight: `1px solid ${theme.colors?.border?.subtle || 'rgba(30, 30, 30, 0.12)'}`,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            gap: 1,
            transition: 'background-color 0.2s ease'
          }}
        >
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <motion.div
              animate={{ 
                y: isOverTrash ? [0, -10, 0] : 0,
                scale: isOverTrash ? [1, 1.08, 1] : 1
              }}
              transition={{ 
                duration: 1.1,
                repeat: isOverTrash ? Infinity : 0,
                repeatType: 'loop',
                ease: 'easeInOut'
              }}
            >
              <Delete 
                sx={{ 
                  fontSize: 56, 
                  color: 'rgba(220, 220, 220, 0.7)'
                }} 
              />
            </motion.div>
            <Typography
              sx={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'rgba(220, 220, 220, 0.8)',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}
            >
              Drop to delete
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </motion.div>
  );
};

export default Toolbar2;
