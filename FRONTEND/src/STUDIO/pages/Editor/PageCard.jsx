import React, { useState } from 'react';
import { Box, IconButton, Stack, Typography, Menu, MenuItem } from '@mui/material';
import { MoreVert, Delete, Edit, RadioButtonUnchecked, RadioButtonChecked } from '@mui/icons-material';
import { motion } from 'framer-motion';
import useNewEditorStore from '../../store/newEditorStore';
import { MODULE_COLORS, getDefaultModuleContent, getModuleDefinition } from './moduleDefinitions';

const PageCard = ({ page, isEntryPoint, onSetEntryPoint, onClick, index }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { addModule, removeModule, removePage, renamePage } = useNewEditorStore();

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    removePage(page.id);
    handleMenuClose();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const moduleType = e.dataTransfer.getData('moduleType');
    if (moduleType) {
      addModule(page.id, {
        type: moduleType,
        content: getDefaultModuleContent(moduleType)
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <Box
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: '120px',
          bgcolor: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: isDragOver 
            ? '2px dashed rgb(146, 0, 32)' 
            : isEntryPoint 
              ? '2px solid rgb(146, 0, 32)'
              : '1px solid rgba(30, 30, 30, 0.08)',
          boxShadow: isHovered 
            ? '0 12px 40px rgba(0, 0, 0, 0.12)' 
            : '0 4px 12px rgba(0, 0, 0, 0.06)',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          '&:hover': {
            borderColor: isEntryPoint ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.15)'
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid rgba(30, 30, 30, 0.06)'
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onSetEntryPoint();
              }}
              sx={{ 
                color: isEntryPoint ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.3)',
                '&:hover': { 
                  bgcolor: 'rgba(146, 0, 32, 0.08)',
                  color: 'rgb(146, 0, 32)'
                }
              }}
            >
              {isEntryPoint ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
            </IconButton>
            
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'rgb(30, 30, 30)'
              }}
            >
              {page.name}
            </Typography>
            
            <Typography
              sx={{
                fontSize: '12px',
                color: 'rgba(30, 30, 30, 0.4)',
                fontFamily: 'monospace'
              }}
            >
              {page.route}
            </Typography>
          </Stack>

          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ 
              color: 'rgba(30, 30, 30, 0.5)',
              '&:hover': { bgcolor: 'rgba(30, 30, 30, 0.04)' }
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        {/* Modules */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            p: 2,
            minHeight: '60px'
          }}
        >
          {page.modules.length === 0 ? (
            <Box
              sx={{
                width: '100%',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed rgba(30, 30, 30, 0.1)',
                borderRadius: '8px',
                color: 'rgba(30, 30, 30, 0.3)',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Drag modules here
            </Box>
          ) : (
            page.modules.map((module) => {
              const definition = getModuleDefinition(module.type);
              return (
                <Box
                  key={module.id}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '6px',
                    bgcolor: definition.color,
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  {definition.label}
                </Box>
              );
            })
          )}
        </Box>

        {/* Drop Overlay */}
        {isDragOver && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(146, 0, 32, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgb(146, 0, 32)'
              }}
            >
              Drop module here
            </Typography>
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={(e) => { e.stopPropagation(); handleMenuClose(); }}>
          <Edit sx={{ mr: 1, fontSize: 18 }} /> Zmień nazwę
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'rgb(146, 0, 32)' }}>
          <Delete sx={{ mr: 1, fontSize: 18 }} /> Usuń
        </MenuItem>
      </Menu>
    </motion.div>
  );
};

export default PageCard;
