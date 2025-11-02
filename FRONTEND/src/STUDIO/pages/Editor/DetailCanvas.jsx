import React from 'react';
import { Box } from '@mui/material';
import useNewEditorStore from '../../store/newEditorStore';
import ModuleRenderer from './ModuleRenderer';

const DetailCanvas = () => {
  const { getSelectedPage, selectModule, selectedModuleId } = useNewEditorStore();
  const page = getSelectedPage();

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
        minHeight: '100%',
        overflow: 'auto'
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
                  : '2px solid rgba(146, 0, 32, 0.3)'
              }
            }}
          >
            <ModuleRenderer module={module} pageId={page.id} />
          </Box>
        ))
      )}
    </Box>
  );
};

export default DetailCanvas;
