import React, { useEffect, useState } from 'react';
import { Fab, Tooltip, Badge, Box } from '@mui/material';
import { Image as ImageIcon, PhotoLibrary as PhotoLibraryIcon } from '@mui/icons-material';
import useTheme from '../../theme/useTheme';
import getEditorColorTokens from '../../theme/editorColorTokens';
import useImageSearchStore from '../store/imageSearchStore';
import ImageSelectorModal from './ImageSelectorModal';
import ImageLibraryPanel from './ImageLibraryPanel';
import useNewEditorStore from '../store/newEditorStore';

/**
 * ImageSearchIntegration
 * Floating button that opens image search based on selection count
 * - 1 image selected = Opens modal (Focused mode - 10 images)
 * - 2+ images selected = Opens panel (Bulk mode - 100 images)
 */
const ImageSearchIntegration = () => {
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const siteId = useNewEditorStore((state) => state.siteId);

  const {
    isModalOpen,
    isPanelOpen,
    openModal,
    closeModal,
    openPanel,
    closePanel,
    setActiveElement
  } = useImageSearchStore();

  // Listen for image selection changes
  useEffect(() => {
    const checkSelection = () => {
      const elementId = localStorage.getItem('selectedImageElement');
      setSelectedElementId(elementId);
      
      // Count how many images could be edited (for now, just 1 or 0)
      setSelectedCount(elementId ? 1 : 0);
    };

    checkSelection();
    window.addEventListener('imageSelectionChange', checkSelection);
    window.addEventListener('storage', checkSelection);

    return () => {
      window.removeEventListener('imageSelectionChange', checkSelection);
      window.removeEventListener('storage', checkSelection);
    };
  }, []);

  const handleButtonClick = () => {
    if (selectedCount === 0) {
      // No selection - open panel for browsing
      openPanel();
    } else if (selectedCount === 1) {
      // Single image selected - open modal (Focused mode)
      setActiveElement(selectedElementId, 'single');
      openModal();
    } else {
      // Multiple images selected - open panel (Bulk mode)
      setActiveElement(selectedElementId, 'multiple');
      openPanel();
    }
  };

  const handleImageSelect = (imageData, isPreview = false) => {
    // Apply image to the selected element
    if (selectedElementId && window.__imageElementCallbacks) {
      const callback = window.__imageElementCallbacks[selectedElementId];
      if (callback) {
        callback(imageData.url);
      }
    }

    // If not preview mode, clear selection and close
    if (!isPreview) {
      localStorage.removeItem('selectedImageElement');
      setSelectedElementId(null);
      setSelectedCount(0);
      window.dispatchEvent(new Event('imageSelectionChange'));
    }
  };

  const handleModalClose = () => {
    closeModal();
  };

  const handlePanelClose = () => {
    closePanel();
  };

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip
        title={
          selectedCount === 0
            ? 'Przeglądaj bibliotekę obrazów'
            : selectedCount === 1
            ? 'Wyszukaj obraz dla zaznaczonego elementu'
            : 'Wyszukaj obrazy dla zaznaczonych elementów'
        }
        placement="left"
      >
        <Fab
          color="primary"
          onClick={handleButtonClick}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200,
            bgcolor: editorColors.interactive.main,
            '&:hover': {
              bgcolor: editorColors.interactive.dark
            }
          }}
        >
          <Badge
            badgeContent={selectedCount}
            color="error"
            invisible={selectedCount === 0}
          >
            {selectedCount > 1 ? <PhotoLibraryIcon /> : <ImageIcon />}
          </Badge>
        </Fab>
      </Tooltip>

      {/* Image Selector Modal (Focused Mode) */}
      <ImageSelectorModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSelect={handleImageSelect}
      />

      {/* Image Library Panel (Bulk Mode) */}
      <ImageLibraryPanel
        onSelect={handleImageSelect}
        onClose={handlePanelClose}
      />
    </>
  );
};

export default ImageSearchIntegration;
