import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { getAvailableModules } from './moduleDefinitions';

const ModuleToolbar = () => {
  const modules = getAvailableModules();

  const handleDragStart = (e, moduleType) => {
    e.dataTransfer.setData('moduleType', moduleType);
  };

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '180px',
        zIndex: 10
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(30, 30, 30, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 1
        }}
      >
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'rgba(30, 30, 30, 0.5)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            mb: 1,
            px: 1
          }}
        >
          Modules
        </Typography>

        <Stack spacing={0.5}>
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
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: '8px',
                    cursor: 'grab',
                    transition: 'all 0.2s ease',
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(30, 30, 30, 0.04)',
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
                      color: 'rgb(30, 30, 30)'
                    }}
                  >
                    {module.label}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}
        </Stack>
      </Box>
    </motion.div>
  );
};

export default ModuleToolbar;
