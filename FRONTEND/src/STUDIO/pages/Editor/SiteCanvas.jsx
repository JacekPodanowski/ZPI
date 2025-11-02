import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleRenderer from './ModuleRenderer';
import { getModuleDefinition, MODULE_COLORS, getDefaultModuleContent } from './moduleDefinitions';

const SiteCanvas = ({ page, renderMode = 'icon', showOverlay = true }) => {
  const { addModule } = useNewEditorStore();
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    const moduleType = e.dataTransfer.getData('moduleType');
    if (moduleType) {
      // Insert module at specific position
      addModule(page.id, {
        type: moduleType,
        content: getDefaultModuleContent(moduleType)
      }, index);
    }
  };

  const renderIconMode = (module) => {
    const definition = getModuleDefinition(module.type);
    const Icon = definition.icon;
    
    return (
      <Box
        sx={{
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {showOverlay && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: definition.color,
              opacity: 0.15,
              pointerEvents: 'none'
            }}
          />
        )}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            bgcolor: definition.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ fontSize: 24, color: 'white' }} />
        </Box>
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgb(30, 30, 30)'
          }}
        >
          {definition.label}
        </Typography>
      </Box>
    );
  };

  const renderRealMode = (module) => {
    const definition = getModuleDefinition(module.type);
    
    return (
      <Box sx={{ position: 'relative' }}>
        <ModuleRenderer module={module} pageId={page.id} />
        {showOverlay && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: definition.color,
              opacity: 0.12,
              pointerEvents: 'none',
              border: `2px solid ${definition.color}`,
              borderRadius: '4px'
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '700px', // Reduced from 1400px
        aspectRatio: '16/9',
        bgcolor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Drop Zone at Top */}
      <Box
        onDragOver={(e) => handleDragOver(e, 0)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 0)}
        sx={{
          height: dragOverIndex === 0 ? '60px' : '20px',
          transition: 'height 0.2s ease',
          bgcolor: dragOverIndex === 0 ? 'rgba(146, 0, 32, 0.1)' : 'transparent',
          borderBottom: dragOverIndex === 0 ? '2px dashed rgb(146, 0, 32)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: dragOverIndex === 0 ? 'rgb(146, 0, 32)' : 'transparent',
          fontSize: '12px',
          fontWeight: 600
        }}
      >
        {dragOverIndex === 0 && 'Drop module here'}
      </Box>

      {/* Modules Stack */}
      <Box sx={{ width: '100%', height: 'calc(100% - 40px)', overflow: 'auto' }}>
        {page.modules.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(30, 30, 30, 0.3)',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Drag modules here to build your page
          </Box>
        ) : (
          <Stack spacing={0}>
            {page.modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Box
                  sx={{
                    borderBottom: index < page.modules.length - 1 
                      ? '2px solid rgba(30, 30, 30, 0.08)' 
                      : 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 'inset 0 0 0 2px rgb(146, 0, 32)'
                    }
                  }}
                >
                  {renderMode === 'icon' ? renderIconMode(module) : renderRealMode(module)}
                </Box>

                {/* Drop Zone between modules */}
                <Box
                  onDragOver={(e) => handleDragOver(e, index + 1)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index + 1)}
                  sx={{
                    height: dragOverIndex === index + 1 ? '60px' : '0px',
                    transition: 'height 0.2s ease',
                    bgcolor: dragOverIndex === index + 1 ? 'rgba(146, 0, 32, 0.1)' : 'transparent',
                    borderTop: dragOverIndex === index + 1 ? '2px dashed rgb(146, 0, 32)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: dragOverIndex === index + 1 ? 'rgb(146, 0, 32)' : 'transparent',
                    fontSize: '12px',
                    fontWeight: 600,
                    overflow: 'hidden'
                  }}
                >
                  {dragOverIndex === index + 1 && 'Drop module here'}
                </Box>
              </motion.div>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default SiteCanvas;
