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

  // Animation variants for different flip styles
  const getAnimationVariants = () => {
    switch (flipStyle) {
      case 'flip':
        return {
          container: {
            position: 'relative',
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          },
          front: {
            rotateY: isFlipped ? 180 : 0,
            transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
          },
          back: {
            rotateY: isFlipped ? 0 : -180,
            transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
          },
          cardStyle: {
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }
        };

      case 'slide':
        return {
          container: {
            position: 'relative',
            overflow: 'hidden'
          },
          front: {
            x: isFlipped ? '-100%' : '0%',
            opacity: isFlipped ? 0 : 1,
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
          },
          back: {
            x: isFlipped ? '0%' : '100%',
            opacity: isFlipped ? 1 : 0,
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
          },
          cardStyle: {}
        };

      case 'fade':
        return {
          container: {
            position: 'relative'
          },
          front: {
            opacity: isFlipped ? 0 : 1,
            scale: isFlipped ? 0.95 : 1,
            transition: { duration: 0.4 }
          },
          back: {
            opacity: isFlipped ? 1 : 0,
            scale: isFlipped ? 1 : 0.95,
            transition: { duration: 0.4 }
          },
          cardStyle: {}
        };

      case 'rotate3d':
        return {
          container: {
            position: 'relative',
            transformStyle: 'preserve-3d',
            perspective: '1200px'
          },
          front: {
            rotateX: isFlipped ? -90 : 0,
            opacity: isFlipped ? 0 : 1,
            transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
          },
          back: {
            rotateX: isFlipped ? 0 : 90,
            opacity: isFlipped ? 1 : 0,
            transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
          },
          cardStyle: {
            transformStyle: 'preserve-3d'
          }
        };

      case 'cube':
        return {
          container: {
            position: 'relative',
            transformStyle: 'preserve-3d',
            perspective: '1500px'
          },
          front: {
            rotateY: isFlipped ? -90 : 0,
            opacity: isFlipped ? 0 : 1,
            transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
          },
          back: {
            rotateY: isFlipped ? 0 : 90,
            opacity: isFlipped ? 1 : 0,
            transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
          },
          cardStyle: {
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }
        };

      default:
        return getAnimationVariants.flip;
    }
  };

  const variants = getAnimationVariants();

  return (
    <Box
      sx={{
        ...variants.container,
        height: '100%',
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        ...sx
      }}
      onClick={handleFlip}
    >
      {/* Front Side */}
      <motion.div
        animate={variants.front}
        style={{
          position: flipStyle === 'flip' ? 'relative' : 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          overflow: 'hidden',
          ...variants.cardStyle
        }}
      >
        {frontContent}
      </motion.div>

      {/* Back Side */}
      <motion.div
        animate={variants.back}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          overflow: 'hidden',
          ...variants.cardStyle
        }}
      >
        {backContent}
      </motion.div>
    </Box>
  );
};

export default FlipCard;
