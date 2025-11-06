import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Delete } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleRenderer from './ModuleRenderer';

const DetailCanvas = () => {
  const { selectModule, selectedModuleId, selectedPageId, removeModule } = useNewEditorStore();
  
  // Subscribe to the pages array so component re-renders when it changes
  const pages = useNewEditorStore(state => state.site.pages);
  const page = pages.find(p => p.id === selectedPageId);
  
  console.log('🖼️ DetailCanvas - Render:', {
    selectedPageId,
    pageFound: !!page,
    moduleCount: page?.modules.length,
    moduleIds: page?.modules.map(m => m.id)
  });

  const handleDeleteModule = (moduleId, e) => {
    e.stopPropagation(); // Prevent triggering module selection
    if (window.confirm('Are you sure you want to delete this module?')) {
      removeModule(page.id, moduleId);
    }
  };

  if (!page) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(30, 30, 30, 0.3)',
          fontSize: '14px'
        }}
      >
        No page selected
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%'
      }}
    >
      {page.modules.length === 0 ? (
        <Box
          sx={{
            width: '100%',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(30, 30, 30, 0.3)',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Add modules from Structure Mode
        </Box>
      ) : (
        page.modules.map((module) => (
          <Box
            key={module.id}
            id={`module-${module.id}`}
            onClick={() => selectModule(module.id)}
            sx={{
              position: 'relative',
              outline: selectedModuleId === module.id 
                ? '3px solid rgb(146, 0, 32)' 
                : 'none',
              outlineOffset: '-3px',
              transition: 'outline 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                outline: selectedModuleId === module.id 
                  ? '3px solid rgb(146, 0, 32)'
                  : '2px solid rgba(146, 0, 32, 0.3)',
                '& .delete-button': {
                  opacity: 1
                }
              }
            }}
          >
            <ModuleRenderer module={module} pageId={page.id} />
            
            {/* Delete Button - appears when module is selected or on hover */}
            {selectedModuleId === module.id && (
              <Tooltip title="Delete Section">
                <IconButton
                  className="delete-button"
                  onClick={(e) => handleDeleteModule(module.id, e)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgb(146, 0, 32)',
                    color: 'white',
                    opacity: 0,
                    transition: 'all 0.2s ease',
                    zIndex: 10,
                    '&:hover': {
                      bgcolor: 'rgb(114, 0, 21)',
                      transform: 'scale(1.1)'
                    }
                  }}
                  size="small"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ))
      )}
    </Box>
  );
};

export default DetailCanvas;
