import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import useTheme from '../../theme/useTheme';
import getEditorColorTokens from '../../theme/editorColorTokens';
import { resolveMediaUrl } from '../../config/api';
import useNewEditorStore from '../store/newEditorStore';
import { SIZE_LIMITS } from '../../shared/sizeLimits';

/**
 * EditableImage - Image component with selection support for the Editor
 * 
 * === THUMBNAIL SYSTEM ===
 * When an image is uploaded, two versions are created:
 * - Full size (1920px) - for high-res displays
 * - Thumbnail (400px) - for faster loading on smaller screens
 * 
 * The `thumbnails` prop is a map: { fullUrl: thumbnailUrl }
 * Stored in site config as `_thumbnails` and passed from SiteApp.
 * 
 * Uses srcset for SEO optimization - browser picks optimal size.
 * 
 * Clicking on the image selects it for the ImageLibraryPanel or AI Assistant.
 */
const EditableImage = ({ 
  value,
  onSave,
  elementId, // Unique identifier for this image element
  className = '',
  style = {},
  alt = '',
  isModuleSelected = false,
  thumbnails = {}, // Map of fullUrl -> thumbnailUrl from config._thumbnails
  sizes = '100vw', // Responsive sizes hint for browser
  ...otherProps 
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const siteId = useNewEditorStore((state) => state.siteId);

  // Check if this element is currently selected
  useEffect(() => {
    const selectedElementId = localStorage.getItem('selectedImageElement');
    setIsSelected(selectedElementId === elementId);
  }, [elementId]);

  // Listen for selection changes
  useEffect(() => {
    const handleStorageChange = () => {
      const selectedElementId = localStorage.getItem('selectedImageElement');
      setIsSelected(selectedElementId === elementId);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('imageSelectionChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('imageSelectionChange', handleStorageChange);
    };
  }, [elementId]);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Toggle selection
    if (isSelected) {
      // Deselect
      localStorage.removeItem('selectedImageElement');
      setIsSelected(false);
    } else {
      // Select this element
      localStorage.setItem('selectedImageElement', elementId);
      
      // Store the onSave callback reference for later use
      if (onSave) {
        window.__imageElementCallbacks = window.__imageElementCallbacks || {};
        window.__imageElementCallbacks[elementId] = onSave;
      }
      
      setIsSelected(true);
    }
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('imageSelectionChange'));
  };

  const resolvedImageUrl = resolveMediaUrl(value);
  const thumbnailUrl = thumbnails[value] ? resolveMediaUrl(thumbnails[value]) : null;
  
  // Build srcset for responsive images if thumbnail available
  const srcSetProps = thumbnailUrl ? {
    srcSet: `${thumbnailUrl} ${SIZE_LIMITS.THUMBNAIL_SIZE}w, ${resolvedImageUrl} ${SIZE_LIMITS.FULL_SIZE}w`,
    sizes: sizes
  } : {};

  return (
    <Box
      component="img"
      src={resolvedImageUrl || 'https://via.placeholder.com/400x300?text=Click+to+select'}
      {...srcSetProps}
      alt={alt}
      className={className}
      data-editable-image="true"
      data-element-id={elementId}
      loading="lazy"
      decoding="async"
      style={{
        ...style,
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
      onClick={handleClick}
      sx={{
        outline: isSelected ? `3px solid ${editorColors.interactive.main}` : 'none',
        outlineOffset: isSelected ? '4px' : '0px',
        boxShadow: isSelected ? `0 4px 16px ${editorColors.interactive.main}40` : 'none',
        '&:hover': {
          outline: isSelected ? `3px solid ${editorColors.interactive.main}` : `2px dashed ${editorColors.interactive.main}`,
          outlineOffset: '4px',
          transform: 'scale(1.01)'
        }
      }}
      {...otherProps}
    />
  );
};

export default EditableImage;
