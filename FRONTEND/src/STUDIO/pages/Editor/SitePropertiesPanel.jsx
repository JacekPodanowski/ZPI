import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

// Array of helpful tips for users
const HELPFUL_TIPS = [
  "Kliknij w dowolny element strony, aby go edytować",
  "Użyj przycisków na górze, aby dodać nowe moduły",
  "Przeciągnij moduły, aby zmienić ich kolejność",
  "Każdy moduł ma własne ustawienia kolorów i stylów",
  "Zapisz zmiany przyciskiem 'Zapisz' w prawym górnym rogu",
  "Możesz przełączać się między stronami w lewym panelu",
  "Kliknij ikonę oka, aby zobaczyć podgląd swojej strony"
];

const SitePropertiesPanel = ({ placement = 'right' }) => {
  // Select a random tip each time the component renders
  const randomTip = React.useMemo(
    () => HELPFUL_TIPS[Math.floor(Math.random() * HELPFUL_TIPS.length)],
    []
  );

  const panelMotionProps = {
    initial: { x: placement === 'right' ? 320 : -320 },
    animate: { x: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  };

  const panelStyle = {
    width: '100%',
    height: '100%',
    flexShrink: 0,
    display: 'flex',
    maxWidth: placement === 'right' ? 360 : '100%',
    minWidth: placement === 'left' ? 250 : 400
  };

  const containerSx = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'rgb(228, 229, 218)',
    position: 'relative',
    ...(placement === 'left'
      ? {
          borderRight: '1px solid rgba(30, 30, 30, 0.1)'
        }
      : {
          '&::before': {
            content: "''",
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '40px',
            width: '1px',
            backgroundColor: 'rgba(30, 30, 30, 0.1)'
          }
        })
  };

  return (
    <motion.div
      {...panelMotionProps}
      style={panelStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <Box sx={containerSx}>
        {/* Main Content - Centered */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
            py: 6
          }}
        >
          {/* Decorative Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(146, 0, 32, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4
            }}
          >
            <Typography
              sx={{
                fontSize: '36px',
                color: 'rgb(146, 0, 32)'
              }}
            >
              ✨
            </Typography>
          </Box>

          {/* Helpful Tip */}
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'rgb(30, 30, 30)',
              textAlign: 'center',
              lineHeight: 1.6,
              mb: 3
            }}
          >
            {randomTip}
          </Typography>

          {/* Additional Info */}
          <Typography
            sx={{
              fontSize: '13px',
              color: 'rgba(30, 30, 30, 0.6)',
              textAlign: 'center',
              lineHeight: 1.5,
              maxWidth: 280
            }}
          >
            Każdy moduł ma własne ustawienia. Kliknij w element, który chcesz zmienić.
          </Typography>
        </Box>

        {/* Bottom Decorative Element */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderTop: '1px solid rgba(30, 30, 30, 0.1)',
            backgroundColor: 'rgba(220, 221, 210, 0.5)'
          }}
        >
          <Typography
            sx={{
              fontSize: '11px',
              color: 'rgba(30, 30, 30, 0.5)',
              textAlign: 'center',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}
          >
            Edytor YourEasySite
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default SitePropertiesPanel;
