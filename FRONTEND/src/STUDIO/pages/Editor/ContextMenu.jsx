import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Typography, Divider } from '@mui/material';
import { Delete as DeleteIcon, Tune as TuneIcon, Image as ImageIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import useTheme from '../../../theme/useTheme';
import getEditorColorTokens from '../../../theme/editorColorTokens';

/**
 * ContextMenu - reusable context menu component for the editor
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the menu is visible
 * @param {Object} props.position - Position {x, y} where the menu should appear
 * @param {Function} props.onClose - Callback when menu should close
 * @param {string} props.title - Title to display at the top of the menu
 * @param {Array} props.options - Array of menu options {label, icon, onClick, color}
 */
const ContextMenu = ({ open, position, onClose, title, options = [] }) => {
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const menuRef = useRef(null);
  const [computedPosition, setComputedPosition] = useState({ x: 0, y: 0 });

  // Set initial position immediately from cursor
  useEffect(() => {
    if (!open) return;

    const margin = 8;
    const pointerOffset = 4;
    const x = (position?.x ?? 0) + pointerOffset;
    const y = (position?.y ?? 0) + pointerOffset;

    // Set position immediately based on cursor
    setComputedPosition({ x, y });
  }, [position, open]);

  // Then adjust if menu would overflow viewport
  useEffect(() => {
    if (!open || !menuRef.current) return;

    const margin = 8;
    const pointerOffset = 4;
    const baseX = (position?.x ?? 0) + pointerOffset;
    const baseY = (position?.y ?? 0) + pointerOffset;

    const rect = menuRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - margin;
    const maxY = window.innerHeight - rect.height - margin;

    let x = baseX;
    let y = baseY;

    // Only adjust if overflow
    if (x > maxX) {
      x = Math.max(margin, maxX);
    }

    if (y > maxY) {
      y = Math.max(margin, maxY);
    }

    // Only update if position changed
    if (x !== baseX || y !== baseY) {
      setComputedPosition({ x, y });
    }
  }, [position, open, options.length]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            left: computedPosition.x,
            top: computedPosition.y,
            zIndex: 10000,
          }}
        >
          <Box
            sx={{
              minWidth: 180,
              bgcolor: editorColors.surfaces.elevated,
              border: `1px solid ${editorColors.borders.subtle}`,
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Title */}
            {title && (
              <>
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: editorColors.text.secondary,
                    }}
                  >
                    {title}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: editorColors.borders.subtle }} />
              </>
            )}

            {/* Options */}
            <Box sx={{ py: 0.5 }}>
              {options.map((option, index) => (
                <Box
                  key={index}
                  onClick={() => {
                    option.onClick();
                    onClose();
                  }}
                  sx={{
                    px: 2,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    color: option.color || editorColors.text.primary,
                    '&:hover': {
                      bgcolor: editorColors.surfaces.hover,
                    },
                  }}
                >
                  {option.icon && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18,
                        height: 18,
                      }}
                    >
                      {option.icon}
                    </Box>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    {option.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ContextMenu;
