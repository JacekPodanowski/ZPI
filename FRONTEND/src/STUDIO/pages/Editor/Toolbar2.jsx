import React, { useState, useEffect, useRef, useMemo, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { 
  Box, 
  Stack, 
  Typography, 
  IconButton, 
  Tooltip,
  TextField,
  Select,
  MenuItem,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControl,
  InputLabel
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Delete, 
  Close, 
  ViewModule,
  Palette,
  Tune,
  Photo,
  ExpandMore,
  ExpandLess,
  Upload
} from '@mui/icons-material';
import { getAvailableModules, getDefaultModuleContent } from './moduleDefinitions';
import useTheme from '../../../theme/useTheme';
import useNewEditorStore from '../../store/newEditorStore';
import { alpha } from '@mui/material/styles';
import { STYLE_LIST, DEFAULT_STYLE_ID } from '../../../SITES/styles';
import ImageUploader from '../../../components/ImageUploader';

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
  { id: 'style', label: 'Style', icon: Palette, modes: ['detail', 'structure'] },
  { id: 'media', label: 'Media', icon: Photo, modes: ['detail'] }, // Only in detail mode
  { id: 'settings', label: 'Settings', icon: Tune, modes: ['detail', 'structure'] }
];

const INDICATOR_STYLE_OPTIONS = [
  { id: 'blade', label: 'Blade Curve', description: 'Smooth tapered shape with a crisp blade-like edge.' },
  { id: 'arrow', label: 'Arrowhead', description: 'Classic arrow profile with a sharp center hit.' },
  { id: 'curve', label: 'Soft Curve', description: 'Gentle concave profile that narrows into the canvas.' },
  { id: 'spike', label: 'Double Spike', description: 'Aggressive twin-spike cut for decisive collapsing.' },
  { id: 'stream', label: 'Streamline', description: 'Long aerodynamic taper with a narrow impact line.' }
];

const polygonToSvgPath = (polygon) => {
  if (!polygon) return '';
  const matches = polygon.match(/polygon\((.*)\)/);
  if (!matches?.[1]) return '';
  const points = matches[1]
    .split(',')
    .map((pair) => pair.trim().split(/\s+/).map((value) => parseFloat(value.replace('%', ''))))
    .filter((coords) => coords.length === 2 && coords.every((value) => !Number.isNaN(value)));
  if (!points.length) return '';
  const commands = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`);
  return `${commands.join(' ')} Z`;
};

const IndicatorShape = ({
  path,
  accentColor,
  blur = 0.8,
  strokeWidth = 0.35,
  gradientStops,
  sx,
  ...rest
}) => {
  const uniqueId = useId();
  const gradientId = `${uniqueId}-gradient`;
  const blurId = `${uniqueId}-blur`;
  const stops = gradientStops ?? [
    { offset: '0%', color: alpha(accentColor, 0) },
    { offset: '28%', color: alpha(accentColor, 0.35) },
    { offset: '62%', color: alpha(accentColor, 0.78) },
    { offset: '100%', color: alpha(accentColor, 1) }
  ];

  return (
    <Box
      component="svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      {...rest}
      sx={{
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        ...(sx || {})
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="50%" x2="100%" y2="50%">
          {stops.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
        <filter id={blurId} x="-12%" y="-10%" width="130%" height="140%">
          <feGaussianBlur stdDeviation={blur} edgeMode="duplicate" />
        </filter>
      </defs>
      <path d={path} fill={`url(#${gradientId})`} filter={`url(#${blurId})`} shapeRendering="geometricPrecision" />
      <path d={path} fill={alpha(accentColor, 0.55)} shapeRendering="geometricPrecision" />
      <path
        d={path}
        fill="none"
        stroke={alpha('#ffffff', 0.35)}
        strokeWidth={strokeWidth}
        shapeRendering="geometricPrecision"
        opacity={0.65}
      />
    </Box>
  );
};

// Font options for typography
const FONT_OPTIONS = [
  { value: '"Inter", sans-serif', label: 'Inter (Modern Sans)' },
  { value: '"Roboto", sans-serif', label: 'Roboto (Neutral Sans)' },
  { value: '"Montserrat", sans-serif', label: 'Montserrat (Geometric)' },
  { value: '"Poppins", sans-serif', label: 'Poppins (Rounded)' },
  { value: '"Open Sans", sans-serif', label: 'Open Sans (Friendly)' },
  { value: '"Lato", sans-serif', label: 'Lato (Clean Sans)' },
  { value: '"Playfair Display", serif', label: 'Playfair Display (Elegant Serif)' },
  { value: '"Cormorant Garamond", serif', label: 'Cormorant Garamond (Classic Serif)' },
  { value: '"Merriweather", serif', label: 'Merriweather (Readable Serif)' },
  { value: '"Lora", serif', label: 'Lora (Balanced Serif)' },
  { value: '"Crimson Text", serif', label: 'Crimson Text (Traditional)' },
  { value: 'Georgia, serif', label: 'Georgia (Web Safe Serif)' },
  { value: '"Times New Roman", serif', label: 'Times New Roman (Classic)' },
  { value: 'Arial, sans-serif', label: 'Arial (Web Safe Sans)' },
  { value: '"Helvetica Neue", sans-serif', label: 'Helvetica Neue (Swiss)' }
];

const describeFontValue = (fontValue) => {
  if (!fontValue) return 'Select a font';
  const option = FONT_OPTIONS.find((font) => font.value === fontValue);
  if (option) return option.label;
  const primaryFont = fontValue.split(',')[0]?.replace(/['"]/g, '').trim();
  return primaryFont ? `${primaryFont} (Custom)` : 'Custom font';
};

// Border radius options
const BORDER_RADIUS_OPTIONS = [
  { value: 'rounded-none', label: 'None', description: 'Sharp corners' },
  { value: 'rounded-sm', label: 'Small', description: 'Subtle rounding' },
  { value: 'rounded-md', label: 'Medium', description: 'Moderate rounding' },
  { value: 'rounded-lg', label: 'Large', description: 'Noticeable curves' },
  { value: 'rounded-xl', label: 'Extra Large', description: 'Very rounded' },
  { value: 'rounded-2xl', label: 'Extra Extra Large', description: 'Maximum rounding' }
];

// Shadow intensity options
const SHADOW_OPTIONS = [
  { value: 'shadow-none', label: 'None', description: 'No shadow' },
  { value: 'shadow-sm', label: 'Light', description: 'Subtle elevation' },
  { value: 'shadow-md', label: 'Medium', description: 'Moderate depth' },
  { value: 'shadow-lg', label: 'Strong', description: 'Clear separation' },
  { value: 'shadow-xl', label: 'Extra Strong', description: 'Heavy elevation' },
  { value: 'shadow-2xl', label: 'Maximum', description: 'Maximum depth' }
];

// Animation speed options
const ANIMATION_SPEED_OPTIONS = [
  { value: 'transition-none', label: 'None', description: 'Instant changes', duration: '0ms' },
  { value: 'transition-all duration-150 ease-in-out', label: 'Fast', description: 'Quick response', duration: '150ms' },
  { value: 'transition-all duration-300 ease-in-out', label: 'Normal', description: 'Balanced timing', duration: '300ms' },
  { value: 'transition-all duration-500 ease-in-out', label: 'Slow', description: 'Smooth & deliberate', duration: '500ms' },
  { value: 'transition-all duration-700 ease-in-out', label: 'Very Slow', description: 'Cinematic effect', duration: '700ms' }
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

Object.keys(INDICATOR_STYLE_CONFIGS).forEach((key) => {
  INDICATOR_STYLE_CONFIGS[key].path = polygonToSvgPath(INDICATOR_STYLE_CONFIGS[key].clipPath);
});

const getIndicatorVisuals = (styleId, size, accentColor) => {
  const config = INDICATOR_STYLE_CONFIGS[styleId] || INDICATOR_STYLE_CONFIGS.blade;
  const appliedSize = Math.min(COLLAPSE_INDICATOR_MAX_DRAG, Math.max(0, size));
  const width = config.minWidth + appliedSize * config.widthFactor;
  const visuals = {
    width,
    background: config.background(accentColor),
    clipPath: config.clipPath,
    path: config.path
  };

  return visuals;
};

const Toolbar2 = ({
  isDraggingModule = false,
  draggedItem = null,
  onClose,
  mode = 'detail',
  onWidthChange
}) => {
  const modules = getAvailableModules();
  const styles = STYLE_LIST;
  const theme = useTheme();
  const isDarkMode = theme.mode === 'dark';
  const site = useNewEditorStore((state) => state.site);
  const selectedPageId = useNewEditorStore((state) => state.selectedPageId);
  const selectedModuleId = useNewEditorStore((state) => state.selectedModuleId);
  const setStyleId = useNewEditorStore((state) => state.setStyleId);
  const updateStyleOverrides = useNewEditorStore((state) => state.updateStyleOverrides);
  
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
  const [popupPosition, setPopupPosition] = useState({ left: 0, top: 0 });
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [toolbarWidth, setToolbarWidth] = useState(TOOLBAR_WIDTH_DEFAULT);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [collapseIndicatorSize, setCollapseIndicatorSize] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState('blade');
  const [styleListExpanded, setStyleListExpanded] = useState(false);
  const [showStyleChangeDialog, setShowStyleChangeDialog] = useState(false);
  const [pendingStyleId, setPendingStyleId] = useState(null);
  const [showBackgroundImageUploader, setShowBackgroundImageUploader] = useState(false);
  const hasInitiallyAnimated = useRef(false);
  const toolbarRef = useRef(null);
  const moduleRefs = useRef({});
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const selectedPage = useMemo(() => {
    if (!site?.pages) return null;
    return site.pages.find((page) => page.id === selectedPageId) || null;
  }, [site?.pages, selectedPageId]);

  const selectedModuleInstance = useMemo(() => {
    if (!selectedPage?.modules) return null;
    return selectedPage.modules.find((module) => module.id === selectedModuleId) || null;
  }, [selectedPage?.modules, selectedModuleId]);

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

  // Notify parent of default width on mount
  useEffect(() => {
    onWidthChange?.(TOOLBAR_WIDTH_DEFAULT);
  }, [onWidthChange]);

  const handleDragStart = (e, moduleType) => {
    console.log('[Toolbar2] Drag started:', moduleType);
    e.dataTransfer.setData('moduleType', moduleType);
    e.dataTransfer.effectAllowed = 'copy';
    setDragging(true, {
      type: 'module',
      moduleType,
      source: 'toolbar'
    });
    setSelectedModule(null);
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  const computePopupPosition = useCallback((centerOverride = null) => {
    if (!toolbarRef.current) return;
    const toolbarRect = toolbarRef.current.getBoundingClientRect();
    const left = toolbarRect.right + 16;
    const centerY = centerOverride ?? popupCenterY;
    const top = toolbarRect.top + centerY - EDITOR_TOP_BAR_HEIGHT;
    setPopupPosition({ left, top });
  }, [popupCenterY]);

  const handleModuleClick = (e, module) => {
    e.stopPropagation();
    
    const boxElement = e.currentTarget;
    const contentArea = boxElement.closest('[data-toolbar-content]');
    const toolbar = toolbarRef.current;
    
    let moduleCenterY;
    if (boxElement && contentArea && toolbar) {
      const boxRect = boxElement.getBoundingClientRect();
      const toolbarRect = toolbar.getBoundingClientRect();
      const scrollTop = contentArea.scrollTop || 0;
      moduleCenterY = (boxRect.top - toolbarRect.top) + scrollTop + (boxRect.height / 2);
      setPopupCenterY(moduleCenterY);
    }

    setSelectedModule(module);
    setIsFirstRender(false);
    computePopupPosition(typeof moduleCenterY === 'number' ? moduleCenterY : undefined);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, activeCategory]);

  useEffect(() => {
    if (!selectedModule || typeof window === 'undefined') {
      return;
    }

    const handleRealtimePositioning = () => {
      computePopupPosition();
    };

    handleRealtimePositioning();
    window.addEventListener('resize', handleRealtimePositioning);
    window.addEventListener('scroll', handleRealtimePositioning, true);

    return () => {
      window.removeEventListener('resize', handleRealtimePositioning);
      window.removeEventListener('scroll', handleRealtimePositioning, true);
    };
  }, [selectedModule, computePopupPosition]);

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
        return;
      }

      // Below minimum: keep at minimum and show collapse indicator
      const overshoot = TOOLBAR_WIDTH_MIN - targetWidth;

      if (overshoot <= COLLAPSE_INDICATOR_BUFFER) {
        setToolbarWidth(TOOLBAR_WIDTH_MIN);
        setCollapseIndicatorSize(0);
        return;
      }

      setToolbarWidth(TOOLBAR_WIDTH_MIN);
      const effectiveOvershoot = Math.min(
        overshoot - COLLAPSE_INDICATOR_BUFFER,
        COLLAPSE_INDICATOR_MAX_DRAG
      );
      setCollapseIndicatorSize(effectiveOvershoot);
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
        setCollapseIndicatorSize(0);
        // Keep activeCategory in state for when toolbar is expanded again
        return;
      }

      // Commit the new width and notify parent once
      const finalWidth = Math.max(TOOLBAR_WIDTH_MIN, Math.min(targetWidth, TOOLBAR_WIDTH_MAX));
      setToolbarWidth(finalWidth);
      onWidthChange?.(finalWidth);
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
      // Restore active category or set to default
      if (!activeCategory) {
        setActiveCategory('modules');
      }
    } else {
      setIsCollapsed(true);
      setToolbarWidth(COLLAPSED_TOOLBAR_WIDTH);
      onWidthChange?.(COLLAPSED_TOOLBAR_WIDTH);
      // Keep activeCategory in state, don't clear it
    }
  };

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
                  onDragEnd={handleDragEnd}
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
      
      case 'style':
        const currentStyleId = site?.styleId || DEFAULT_STYLE_ID;
        const currentStyle = styles.find(s => s.id === currentStyleId) || styles[0];
        const currentOverrides = site?.styleOverrides || {};
        const hasCustomizations = Object.keys(currentOverrides).length > 0;
        const effectiveTitleFont = currentOverrides.titleFont || currentStyle.titleFont || FONT_OPTIONS[0].value;
        const effectiveTextFont = currentOverrides.textFont || currentStyle.textFont || currentStyle.titleFont || FONT_OPTIONS[0].value;
        const hasTitleFontOption = FONT_OPTIONS.some((font) => font.value === effectiveTitleFont);
        const hasTextFontOption = FONT_OPTIONS.some((font) => font.value === effectiveTextFont);
        
        const handleStyleChange = (newStyleId) => {
          if (newStyleId === currentStyleId) return;
          
          if (hasCustomizations) {
            setPendingStyleId(newStyleId);
            setShowStyleChangeDialog(true);
          } else {
            setStyleId(newStyleId, { resetOverrides: true });
          }
        };

        const handleConfirmStyleChange = (keepCustomizations) => {
          if (pendingStyleId) {
            if (keepCustomizations) {
              setStyleId(pendingStyleId, { resetOverrides: false });
            } else {
              setStyleId(pendingStyleId, { resetOverrides: true });
            }
          }
          setShowStyleChangeDialog(false);
          setPendingStyleId(null);
        };

        const handleOverrideChange = (key, value) => {
          updateStyleOverrides({ [key]: value });
        };
        
        return (
          <Stack spacing={2} sx={{ px: 0.5 }}>
            {/* Current Style Selector */}
            <Stack spacing={1}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: textMuted, textTransform: 'uppercase' }}>
                Current Style {hasCustomizations && <span style={{ color: accentColor }}>(Custom)</span>}
              </Typography>
              
              <Box
                onClick={() => setStyleListExpanded(!styleListExpanded)}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderRadius: '8px',
                  border: `1px solid ${moduleListBorder}`,
                  bgcolor: isDarkMode ? 'rgba(22, 22, 28, 0.85)' : 'rgba(255, 255, 255, 0.92)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: accentColor,
                    bgcolor: moduleListHover
                  }
                }}
              >
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: textPrimary }}>
                  {currentStyle.name}
                </Typography>
                {styleListExpanded ? <ExpandLess sx={{ fontSize: 20, color: textMuted }} /> : <ExpandMore sx={{ fontSize: 20, color: textMuted }} />}
              </Box>

              <Collapse in={styleListExpanded}>
                <Stack spacing={0.5} sx={{ mt: 0.5, maxHeight: '300px', overflowY: 'auto' }}>
                  {styles.map((style) => (
                    <Box
                      key={style.id}
                      onClick={() => handleStyleChange(style.id)}
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        bgcolor: style.id === currentStyleId ? selectedBg : 'transparent',
                        border: `1px solid ${style.id === currentStyleId ? accentColor : 'transparent'}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: style.id === currentStyleId ? selectedHoverBg : moduleListHover,
                          borderColor: accentColor
                        }
                      }}
                    >
                      <Typography sx={{ fontSize: '13px', fontWeight: 500, color: style.id === currentStyleId ? accentColor : textPrimary }}>
                        {style.name}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: textMuted, mt: 0.25 }}>
                        {style.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Collapse>
            </Stack>

            {/* Divider */}
            <Box sx={{ height: '1px', bgcolor: alpha(textPrimary, 0.08) }} />

            {/* Style Customization Options */}
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: textMuted, textTransform: 'uppercase' }}>
                Customize Style
              </Typography>

              {/* Colors Section */}
              <Box sx={{ pb: 3 }}>
                <Stack spacing={1.25}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Colors
                  </Typography>

                {/* Accent Color */}
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                    Accent Color
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={currentOverrides.accentColor || currentStyle.accentColor || '#920020'}
                      onChange={(e) => handleOverrideChange('accentColor', e.target.value)}
                      style={{
                        width: '40px',
                        height: '32px',
                        border: `1px solid ${moduleListBorder}`,
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                    <TextField
                      size="small"
                      value={currentOverrides.accentColor || currentStyle.accentColor || '#920020'}
                      onChange={(e) => handleOverrideChange('accentColor', e.target.value)}
                      sx={{
                        flex: 1,
                        '& .MuiInputBase-input': {
                          fontSize: '12px',
                          py: 0.75,
                          color: textPrimary
                        }
                      }}
                    />
                  </Box>
                </Stack>

                {/* Background Color */}
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                    Background Color
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={currentOverrides.backgroundColor || currentStyle.backgroundColor || '#f5f2eb'}
                      onChange={(e) => handleOverrideChange('backgroundColor', e.target.value)}
                      style={{
                        width: '40px',
                        height: '32px',
                        border: `1px solid ${moduleListBorder}`,
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                    <TextField
                      size="small"
                      value={currentOverrides.backgroundColor || currentStyle.backgroundColor || '#f5f2eb'}
                      onChange={(e) => handleOverrideChange('backgroundColor', e.target.value)}
                      sx={{
                        flex: 1,
                        '& .MuiInputBase-input': {
                          fontSize: '12px',
                          py: 0.75,
                          color: textPrimary
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Stack>
              </Box>

              {/* Background Image */}
              <Box sx={{ pb: 3 }}>
              <Stack spacing={0.75}>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Background
                </Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                  Background Image
                </Typography>
                <TextField
                  size="small"
                  placeholder="Enter image URL"
                  value={currentOverrides.backgroundTexture ?? currentStyle.backgroundTexture ?? ''}
                  onChange={(e) => handleOverrideChange('backgroundTexture', e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Upload Image" placement="top">
                        <IconButton
                          onClick={() => setShowBackgroundImageUploader(true)}
                          size="small"
                          sx={{
                            padding: 0,
                            marginRight: '-8px',
                            color: textMuted,
                            '&:hover': {
                              color: accentColor,
                              bgcolor: 'transparent'
                            }
                          }}
                        >
                          <Upload sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '12px',
                      py: 0.75,
                      color: textPrimary
                    }
                  }}
                />
                <Typography sx={{ fontSize: '10px', color: textMuted, fontStyle: 'italic' }}>
                  Paste URL or click upload button
                </Typography>
              </Stack>
              </Box>

              {/* Background Image Uploader Dialog */}
              <Dialog
                open={showBackgroundImageUploader}
                onClose={() => setShowBackgroundImageUploader(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                  sx: {
                    bgcolor: popupBackground,
                    borderRadius: '12px',
                    border: `1px solid ${popupBorder}`
                  }
                }}
              >
                <DialogTitle sx={{ color: textPrimary }}>
                  Upload Background Image
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ pt: 1 }}>
                    <ImageUploader
                      label="Background Image"
                      value={currentOverrides.backgroundTexture ?? currentStyle.backgroundTexture ?? ''}
                      onChange={(url) => {
                        handleOverrideChange('backgroundTexture', url);
                        setShowBackgroundImageUploader(false);
                      }}
                      aspectRatio="16/9"
                      usage="site_content"
                    />
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setShowBackgroundImageUploader(false)}
                    sx={{ color: textPrimary }}
                  >
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Typography Section */}
              <Box sx={{ pb: 3 }}>
              <Stack spacing={1.25}>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Typography
                </Typography>

                {/* Title Font */}
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                    Title Font (Headings)
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={effectiveTitleFont}
                      onChange={(e) => handleOverrideChange('titleFont', e.target.value)}
                      renderValue={(selected) => describeFontValue(selected)}
                      sx={{
                        fontSize: '12px',
                        color: textPrimary,
                        '& .MuiSelect-select': {
                          py: 0.75
                        }
                      }}
                    >
                      {!hasTitleFontOption && (
                        <MenuItem key={effectiveTitleFont} value={effectiveTitleFont} sx={{ fontSize: '13px', opacity: 0.75 }}>
                          {describeFontValue(effectiveTitleFont)}
                        </MenuItem>
                      )}
                      {FONT_OPTIONS.map((font) => (
                        <MenuItem key={font.value} value={font.value} sx={{ fontSize: '13px', fontFamily: font.value }}>
                          {font.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                {/* Text Font */}
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                    Text Font (Body)
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={effectiveTextFont}
                      onChange={(e) => handleOverrideChange('textFont', e.target.value)}
                      renderValue={(selected) => describeFontValue(selected)}
                      sx={{
                        fontSize: '12px',
                        color: textPrimary,
                        '& .MuiSelect-select': {
                          py: 0.75
                        }
                      }}
                    >
                      {!hasTextFontOption && (
                        <MenuItem key={effectiveTextFont} value={effectiveTextFont} sx={{ fontSize: '13px', opacity: 0.75 }}>
                          {describeFontValue(effectiveTextFont)}
                        </MenuItem>
                      )}
                      {FONT_OPTIONS.map((font) => (
                        <MenuItem key={font.value} value={font.value} sx={{ fontSize: '13px', fontFamily: font.value }}>
                          {font.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                {/* Font Size Scale */}
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                    Font Size Scale
                  </Typography>
                  <Box sx={{ px: 1 }}>
                    <Slider
                      value={currentOverrides.fontScale ?? 1}
                      onChange={(e, val) => handleOverrideChange('fontScale', val)}
                      min={0.8}
                      max={1.3}
                      step={0.05}
                      marks={[
                        { value: 0.8, label: '80%' },
                        { value: 1, label: '100%' },
                        { value: 1.3, label: '130%' }
                      ]}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(val) => `${Math.round(val * 100)}%`}
                      sx={{
                        color: accentColor,
                        '& .MuiSlider-markLabel': {
                          fontSize: '10px',
                          color: textMuted
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Stack>
              </Box>

              {/* Visual Effects Section */}
              <Box sx={{ pb: 3 }}>
              <Stack spacing={1.25}>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Visual Effects
                </Typography>

                {/* Border Radius */}
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                    Border Radius
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={currentOverrides.rounded || currentStyle.rounded || 'rounded-lg'}
                      onChange={(e) => handleOverrideChange('rounded', e.target.value)}
                      sx={{
                        fontSize: '12px',
                        color: textPrimary,
                        '& .MuiSelect-select': {
                          py: 0.75
                        }
                      }}
                    >
                      {BORDER_RADIUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ fontSize: '13px' }}>
                          <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>{option.label}</Typography>
                            <Typography sx={{ fontSize: '10px', color: textMuted }}>{option.description}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                {/* Shadow Intensity */}
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                    Shadow Intensity
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={currentOverrides.shadows || currentStyle.shadows || 'shadow-md'}
                      onChange={(e) => handleOverrideChange('shadows', e.target.value)}
                      sx={{
                        fontSize: '12px',
                        color: textPrimary,
                        '& .MuiSelect-select': {
                          py: 0.75
                        }
                      }}
                    >
                      {SHADOW_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ fontSize: '13px' }}>
                          <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>{option.label}</Typography>
                            <Typography sx={{ fontSize: '10px', color: textMuted }}>{option.description}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                {/* Animation Speed */}
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                    Animation Speed
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={currentOverrides.animations || currentStyle.animations || 'transition-all duration-300 ease-in-out'}
                      onChange={(e) => handleOverrideChange('animations', e.target.value)}
                      sx={{
                        fontSize: '12px',
                        color: textPrimary,
                        '& .MuiSelect-select': {
                          py: 0.75
                        }
                      }}
                    >
                      {ANIMATION_SPEED_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ fontSize: '13px' }}>
                          <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>{option.label}</Typography>
                            <Typography sx={{ fontSize: '10px', color: textMuted }}>{option.description} • {option.duration}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
              </Box>

              {/* Reset Button */}
              {hasCustomizations && (
                <Button
                  size="small"
                  onClick={() => setStyleId(currentStyleId, { resetOverrides: true })}
                  sx={{
                    mt: 1,
                    color: accentColor,
                    borderColor: accentColor,
                    '&:hover': {
                      borderColor: accentHoverColor,
                      bgcolor: alpha(accentColor, 0.08)
                    }
                  }}
                  variant="outlined"
                >
                  Reset to Default
                </Button>
              )}
            </Stack>

            {/* Style Change Dialog */}
            <Dialog
              open={showStyleChangeDialog}
              onClose={() => {
                setShowStyleChangeDialog(false);
                setPendingStyleId(null);
              }}
              PaperProps={{
                sx: {
                  bgcolor: popupBackground,
                  borderRadius: '12px',
                  border: `1px solid ${popupBorder}`
                }
              }}
            >
              <DialogTitle sx={{ color: popupText, fontWeight: 600 }}>
                Style Change Confirmation
              </DialogTitle>
              <DialogContent>
                <Typography sx={{ color: popupMutedText, lineHeight: 1.6 }}>
                  You have custom style changes. Would you like to keep your customizations or reset to the new style's defaults?
                </Typography>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                  onClick={() => {
                    setShowStyleChangeDialog(false);
                    setPendingStyleId(null);
                  }}
                  sx={{ color: textMuted }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleConfirmStyleChange(false)}
                  sx={{ color: textPrimary }}
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={() => handleConfirmStyleChange(true)}
                  variant="contained"
                  sx={{
                    bgcolor: accentColor,
                    '&:hover': { bgcolor: accentHoverColor }
                  }}
                >
                  Keep Customizations
                </Button>
              </DialogActions>
            </Dialog>
          </Stack>
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
        const secondaryTitle = mode === 'detail' && selectedModuleInstance
          ? 'Selected Module Parameters'
          : 'Site Settings';

        const moduleContentKeys = Object.keys(selectedModuleInstance?.content || {});

        return (
          <Stack spacing={2} sx={{ px: 1.5, py: 1.5 }}>
            <Stack spacing={1.25}>
              <Typography sx={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.35em', color: accentColor }}>
                DEV
              </Typography>
              <Box sx={{ height: '1px', width: '100%', bgcolor: alpha(textPrimary, 0.08) }} />
              <Stack spacing={0.75}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>
                Indicator Style
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
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <IndicatorShape
                      path={previewIndicatorVisuals.path}
                      accentColor={accentColor}
                      blur={0.55}
                      strokeWidth={0.25}
                    />
                  </Box>
                </Box>
              </Stack>
            </Stack>

            <Stack spacing={1.25}>
              <Typography sx={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.24em', color: textMuted }}>
                {secondaryTitle.toUpperCase()}
              </Typography>
              <Box sx={{ height: '1px', width: '100%', bgcolor: alpha(textPrimary, 0.08) }} />

              {mode === 'detail' && selectedModuleInstance ? (
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: '13px', color: textMuted }}>
                    Manage the live section currently selected on the canvas.
                  </Typography>
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontSize: '12px', color: textMuted }}>Module Type</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: textPrimary }}>
                      {selectedModuleInstance.type}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontSize: '12px', color: textMuted }}>Module ID</Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: textPrimary }}>
                      {selectedModuleInstance.id}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontSize: '12px', color: textMuted }}>Content Fields</Typography>
                    {moduleContentKeys.length ? (
                      <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {moduleContentKeys.map((key) => (
                          <Box
                            key={key}
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: '8px',
                              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 30, 30, 0.06)',
                              fontSize: '12px',
                              color: textPrimary
                            }}
                          >
                            {key}
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography sx={{ fontSize: '12px', color: textMuted }}>
                        This module does not expose editable parameters yet.
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: '13px', color: textMuted }}>
                    Quick overview of the current site context.
                  </Typography>
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontSize: '12px', color: textMuted }}>Site Name</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: textPrimary }}>
                      {site?.name || 'Untitled Site'}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontSize: '12px', color: textMuted }}>Current Page</Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: textPrimary }}>
                      {selectedPage?.name || 'No page selected'}
                    </Typography>
                    {selectedPage?.route && (
                      <Typography sx={{ fontSize: '12px', color: textMuted }}>
                        Route: {selectedPage.route}
                      </Typography>
                    )}
                  </Stack>
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontSize: '12px', color: textMuted }}>Pages</Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: textPrimary }}>
                      {site?.pages?.length || 0}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        );
      
      default:
        return null;
    }
  };

  const shouldShowTrash = isDraggingModule && (draggedItem?.source ?? 'canvas') !== 'toolbar';

  const modulePopupPortal = typeof document !== 'undefined'
    ? createPortal(
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
                position: 'fixed',
                left: popupPosition.left,
                top: popupPosition.top,
                transform: 'translateY(-50%)',
                width: '300px',
                zIndex: 3000,
                pointerEvents: 'auto'
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
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <motion.div
      initial={hasInitiallyAnimated.current ? false : { width: 0, opacity: 0 }}
      animate={{ width: toolbarWidth, opacity: 1 }}
      exit={hasInitiallyAnimated.current ? false : { width: 0, opacity: 0 }}
      transition={isResizing ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: '100%',
        flexShrink: 0,
        position: 'relative'
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
                right: '-8px',
                top: 0,
                bottom: 0,
                width: '20px',
                cursor: 'ew-resize',
                zIndex: 1001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&::after': {
                  content: '""',
                  width: '4px',
                  height: '100%',
                  bgcolor: isResizing ? accentColor : 'transparent',
                  opacity: isResizing ? 0.8 : 1,
                  transition: 'all 0.2s ease'
                },
                '&:hover::after': {
                  bgcolor: accentColor,
                  opacity: 0.5
                }
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
                  transition: 'all 0.065s ease',
                  filter: 'drop-shadow(-8px 0 14px rgba(0, 0, 0, 0.35))'
                }}
              >
                <IndicatorShape
                  path={collapseIndicatorVisuals.path}
                  accentColor={accentColor}
                  blur={1.15}
                  strokeWidth={0.45}
                />
              </Box>
            )}
          </>
        )}

        {isCollapsed ? (
          // Collapsed View - Vertical Icons Only
          <Box
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggleCollapse();
            }}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 1,
              pb: 2,
              gap: 1,
              userSelect: 'none'
            }}
          >
            {/* Category Icons */}
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = false; // Never show as active in collapsed state
              
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
        </>
        )}
      </Box>

      {modulePopupPortal}

      {/* Trash Zone Overlay */}
      <motion.div
        animate={{ 
          opacity: shouldShowTrash ? 1 : 0,
          pointerEvents: shouldShowTrash ? 'auto' : 'none'
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
