import React, { useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * FlipCard - Reusable card component with multiple flip animation styles
 * @param {Object} props
 * @param {React.ReactNode} props.frontContent - Content for the front of the card
 * @param {React.ReactNode} props.backContent - Content for the back of the card
 * @param {string} props.flipStyle - Animation style: 'flip', 'slide', 'fade', 'rotate3d', 'cube'
 * @param {Object} props.sx - Additional MUI sx styles for container
 */
const FlipCard = ({ 
  frontContent, 
  backContent, 
  flipStyle = 'flip', 
  sx = {}
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // FLIP ANIMATION - Classic 3D card flip
  if (flipStyle === 'flip') {
    return (
      <Box
        sx={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          perspective: '1000px',
          height: '100%',
          width: '100%',
          cursor: 'pointer',
          ...sx
        }}
        onClick={handleFlip}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {frontContent}
        </motion.div>
        <motion.div
          initial={false}
          animate={{ rotateY: isFlipped ? 360 : 180 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {backContent}
        </motion.div>
      </Box>
    );
  }

  // SLIDE ANIMATION - Horizontal slide
  if (flipStyle === 'slide') {
    return (
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          width: '100%',
          cursor: 'pointer',
          ...sx
        }}
        onClick={handleFlip}
      >
        <motion.div
          initial={false}
          animate={{ x: isFlipped ? '-100%' : '0%' }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        >
          {frontContent}
        </motion.div>
        <motion.div
          initial={false}
          animate={{ x: isFlipped ? '0%' : '100%' }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        >
          {backContent}
        </motion.div>
      </Box>
    );
  }

  // FADE ANIMATION - Cross-fade with scale
  if (flipStyle === 'fade') {
    return (
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          cursor: 'pointer',
          ...sx
        }}
        onClick={handleFlip}
      >
        <motion.div
          initial={false}
          animate={{ 
            opacity: isFlipped ? 0 : 1,
            scale: isFlipped ? 0.95 : 1
          }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            pointerEvents: isFlipped ? 'none' : 'auto'
          }}
        >
          {frontContent}
        </motion.div>
        <motion.div
          initial={false}
          animate={{ 
            opacity: isFlipped ? 1 : 0,
            scale: isFlipped ? 1 : 0.95
          }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            pointerEvents: isFlipped ? 'auto' : 'none'
          }}
        >
          {backContent}
        </motion.div>
      </Box>
    );
  }

  // ROTATE3D ANIMATION - Rotate on X axis
  if (flipStyle === 'rotate3d') {
    return (
      <Box
        sx={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          perspective: '1200px',
          height: '100%',
          width: '100%',
          cursor: 'pointer',
          ...sx
        }}
        onClick={handleFlip}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: isFlipped ? -90 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {frontContent}
        </motion.div>
        <motion.div
          initial={false}
          animate={{ rotateY: isFlipped ? 0 : 90 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {backContent}
        </motion.div>
      </Box>
    );
  }

  // Default fallback
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        cursor: 'pointer',
        ...sx
      }}
      onClick={handleFlip}
    >
      {isFlipped ? backContent : frontContent}
    </Box>
  );
};

export default FlipCard;
