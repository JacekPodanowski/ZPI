import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import { MODULE_COLORS } from './moduleDefinitions';

const SectionNavigator = () => {
  const { getSelectedPage, selectedModuleId, selectModule } = useNewEditorStore();
  const page = getSelectedPage();

  const scrollToModule = (moduleId) => {
    selectModule(moduleId);
    // TODO: Implement smooth scroll to module in canvas
    const element = document.getElementById(`module-${moduleId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!page) return null;

  return (
    <motion.div
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        width: '100%',
        height: '100%',
        flexShrink: 0,
        display: 'flex'
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 1,
          overflow: 'hidden'
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
          Sections
        </Typography>

        <Stack spacing={0.5} sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
          {page.modules.length === 0 ? (
            <Box
              sx={{
                px: 2,
                py: 3,
                textAlign: 'center',
                color: 'rgba(30, 30, 30, 0.3)',
                fontSize: '13px'
              }}
            >
              No modules yet
            </Box>
          ) : (
            page.modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Box
                  onClick={() => scrollToModule(module.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    bgcolor: selectedModuleId === module.id 
                      ? 'rgba(146, 0, 32, 0.08)' 
                      : 'transparent',
                    borderLeft: selectedModuleId === module.id 
                      ? '3px solid rgb(146, 0, 32)'
                      : '3px solid transparent',
                    '&:hover': {
                      bgcolor: selectedModuleId === module.id
                        ? 'rgba(146, 0, 32, 0.08)'
                        : 'rgba(30, 30, 30, 0.04)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: MODULE_COLORS[module.type] || MODULE_COLORS.default,
                      flexShrink: 0
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: selectedModuleId === module.id ? 600 : 500,
                      color: selectedModuleId === module.id 
                        ? 'rgb(146, 0, 32)' 
                        : 'rgb(30, 30, 30)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {module.name}
                  </Typography>
                </Box>
              </motion.div>
            ))
          )}
        </Stack>
      </Box>
    </motion.div>
  );
};

export default SectionNavigator;
