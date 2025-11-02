import React from 'react';
import { Box } from '@mui/material';
import useNewEditorStore from '../../store/newEditorStore';
import SectionNavigator from './SectionNavigator';
import PropertiesPanel from './PropertiesPanel';
import DetailCanvas from './DetailCanvas';

const DetailMode = () => {
  const { devicePreview } = useNewEditorStore();

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Section Navigator - Left */}
      <SectionNavigator />

      {/* Canvas - Center */}
      <Box
        sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          bgcolor: 'rgb(228, 229, 218)',
          p: 3
        }}
      >
        <Box
          sx={{
            width: devicePreview === 'mobile' ? '375px' : '100%',
            maxWidth: devicePreview === 'desktop' ? '1440px' : '375px',
            height: devicePreview === 'mobile' ? 'auto' : '100%',
            bgcolor: 'white',
            borderRadius: devicePreview === 'mobile' ? '24px' : '0',
            boxShadow: devicePreview === 'mobile' 
              ? '0 20px 60px rgba(0, 0, 0, 0.2)' 
              : 'none',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <DetailCanvas />
        </Box>
      </Box>

      {/* Properties Panel - Right */}
      <PropertiesPanel />
    </Box>
  );
};

export default DetailMode;
