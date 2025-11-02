import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Stack, Typography, Tooltip, TextField } from '@mui/material';
import { ArrowBack, Smartphone, Monitor, Save, Undo, Redo, Edit, Check, Close, FileDownload, FileUpload, Publish, LightMode, DarkMode } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import { renameSite } from '../../../services/siteService';

const EditorTopBar = () => {
  const { 
    editorMode, 
    exitDetailMode, 
    devicePreview, 
    setDevicePreview,
    hasUnsavedChanges,
    getSelectedPage,
    siteId,
    siteName,
    setSiteName,
    site
  } = useNewEditorStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(siteName);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef(null);

  const selectedPage = getSelectedPage();

  // Update titleValue when siteName changes (after loading from API)
  useEffect(() => {
    setTitleValue(siteName);
  }, [siteName]);

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving...');
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify({ site }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${siteName.replace(/\s+/g, '-').toLowerCase()}-config.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          if (json.site) {
            // TODO: Load imported config into store
            console.log('Imported config:', json);
            // For now, just log it - implement loadSite() call when ready
          } else {
            console.error('Invalid config file');
          }
        } catch (error) {
          console.error('Failed to parse JSON:', error);
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handlePublish = () => {
    // TODO: Implement publish logic
    console.log('Publishing...');
  };

  const handleGoBack = () => {
    // Navigate back to studio dashboard
    window.location.href = '/studio';
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTitleValue(siteName);
  };

  const handleTitleSave = async () => {
    if (titleValue.trim() && titleValue !== siteName && siteId) {
      setIsSavingTitle(true);
      try {
        await renameSite(siteId, titleValue.trim());
        setSiteName(titleValue.trim());
        setIsEditingTitle(false);
      } catch (error) {
        console.error('Failed to update site name:', error);
        setTitleValue(siteName); // Revert on error
      } finally {
        setIsSavingTitle(false);
      }
    } else {
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setTitleValue(siteName);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  return (
    <Box
      sx={{
        height: '56px',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(30, 30, 30, 0.06)',
        display: 'flex',
        alignItems: 'center',
        pr: 2,
        gap: 2,
        zIndex: 100
      }}
    >
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Left Section */}
      <Stack direction="row" spacing={1} alignItems="center" flex={1}>
        {/* Go Back Button */}
        <Tooltip title="Back to Dashboard">
          <IconButton
            onClick={handleGoBack}
            sx={{
              height: '56px',
              width: '48px',
              borderRadius: 0,
              bgcolor: 'rgba(30, 30, 30, 0.02)',
              color: 'rgb(30, 30, 30)',
              borderRight: '1px solid rgba(30, 30, 30, 0.06)',
              '&:hover': {
                bgcolor: 'rgba(30, 30, 30, 0.06)'
              }
            }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>

        {/* Editable Site Title */}
        {!isEditingTitle ? (
          <Box
            onClick={handleTitleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(30, 30, 30, 0.04)',
                '& .edit-icon': {
                  opacity: 1
                }
              }
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'rgb(30, 30, 30)',
                fontSize: '16px'
              }}
            >
              {isSavingTitle ? 'Saving...' : siteName}
            </Typography>
            <Edit 
              className="edit-icon"
              sx={{ 
                fontSize: 16, 
                color: 'rgba(30, 30, 30, 0.4)',
                opacity: 0,
                transition: 'opacity 0.2s ease'
              }} 
            />
          </Box>
        ) : (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TextField
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              size="small"
              variant="outlined"
              placeholder="Site name"
              disabled={isSavingTitle}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'rgb(146, 0, 32)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgb(146, 0, 32)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgb(146, 0, 32)'
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '16px',
                  fontWeight: 600,
                  py: 0.75,
                  px: 1.5
                }
              }}
            />
            <Tooltip title="Save">
              <IconButton
                size="small"
                onClick={handleTitleSave}
                disabled={isSavingTitle}
                sx={{
                  bgcolor: 'rgb(146, 0, 32)',
                  color: 'white',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    bgcolor: 'rgb(114, 0, 21)'
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(146, 0, 32, 0.5)',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }
                }}
              >
                <Check fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton
                size="small"
                onClick={handleTitleCancel}
                disabled={isSavingTitle}
                sx={{
                  bgcolor: 'rgba(30, 30, 30, 0.08)',
                  color: 'rgb(30, 30, 30)',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    bgcolor: 'rgba(30, 30, 30, 0.15)'
                  }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}

        {editorMode === 'detail' && (
          <>
            <Box
              sx={{
                width: '1px',
                height: '24px',
                bgcolor: 'rgba(30, 30, 30, 0.1)',
                mx: 1
              }}
            />
            <IconButton 
              onClick={exitDetailMode}
              sx={{ 
                color: 'rgb(30, 30, 30)',
                '&:hover': { bgcolor: 'rgba(30, 30, 30, 0.04)' }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 500,
                color: 'rgb(30, 30, 30)',
                ml: 1
              }}
            >
              {selectedPage?.name || 'Untitled Page'}
            </Typography>
          </>
        )}
      </Stack>

      {/* Center Section - Device Toggle (Detail Mode Only) */}
      {editorMode === 'detail' && (
        <Stack 
          direction="row" 
          spacing={0}
          sx={{
            bgcolor: 'rgba(30, 30, 30, 0.04)',
            borderRadius: '8px',
            p: 0.5
          }}
        >
          <Tooltip title="Desktop View">
            <IconButton
              size="small"
              onClick={() => setDevicePreview('desktop')}
              sx={{
                color: devicePreview === 'desktop' ? 'rgb(146, 0, 32)' : 'rgb(30, 30, 30)',
                bgcolor: devicePreview === 'desktop' ? 'white' : 'transparent',
                '&:hover': { 
                  bgcolor: devicePreview === 'desktop' ? 'white' : 'rgba(30, 30, 30, 0.04)' 
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Monitor fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mobile View">
            <IconButton
              size="small"
              onClick={() => setDevicePreview('mobile')}
              sx={{
                color: devicePreview === 'mobile' ? 'rgb(146, 0, 32)' : 'rgb(30, 30, 30)',
                bgcolor: devicePreview === 'mobile' ? 'white' : 'transparent',
                '&:hover': { 
                  bgcolor: devicePreview === 'mobile' ? 'white' : 'rgba(30, 30, 30, 0.04)' 
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Smartphone fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      {/* Right Section */}
      <Stack direction="row" spacing={1} alignItems="center" flex={1} justifyContent="flex-end">
        {/* Undo/Redo */}
        <Tooltip title="Undo">
          <IconButton 
            size="small"
            sx={{ 
              color: 'rgb(30, 30, 30)',
              '&:hover': { bgcolor: 'rgba(30, 30, 30, 0.04)' }
            }}
          >
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Redo">
          <IconButton 
            size="small"
            sx={{ 
              color: 'rgb(30, 30, 30)',
              '&:hover': { bgcolor: 'rgba(30, 30, 30, 0.04)' }
            }}
          >
            <Redo fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Separator */}
        <Box
          sx={{
            width: '1px',
            height: '24px',
            bgcolor: 'rgba(30, 30, 30, 0.1)',
            mx: 0.5
          }}
        />

        {/* Dark/Light Mode Toggle */}
        <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
          <IconButton 
            size="small"
            onClick={() => setDarkMode(!darkMode)}
            sx={{ 
              color: 'rgb(30, 30, 30)',
              '&:hover': { bgcolor: 'rgba(30, 30, 30, 0.04)' }
            }}
          >
            {darkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Separator */}
        <Box
          sx={{
            width: '1px',
            height: '24px',
            bgcolor: 'rgba(30, 30, 30, 0.1)',
            mx: 0.5
          }}
        />

        {/* Download Config */}
        <Tooltip title="Download Config">
          <IconButton 
            size="small"
            onClick={handleDownload}
            sx={{ 
              color: 'rgb(30, 30, 30)',
              '&:hover': { bgcolor: 'rgba(30, 30, 30, 0.04)' }
            }}
          >
            <FileDownload fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Import Config */}
        <Tooltip title="Import Config">
          <IconButton 
            size="small"
            onClick={handleImport}
            sx={{ 
              color: 'rgb(30, 30, 30)',
              '&:hover': { bgcolor: 'rgba(30, 30, 30, 0.04)' }
            }}
          >
            <FileUpload fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Separator */}
        <Box
          sx={{
            width: '1px',
            height: '24px',
            bgcolor: 'rgba(30, 30, 30, 0.1)',
            mx: 0.5
          }}
        />

        {/* Save Button */}
        <Box
          onClick={handleSave}
          sx={{
            px: 2,
            py: 1,
            borderRadius: '6px',
            bgcolor: hasUnsavedChanges ? 'rgb(146, 0, 32)' : 'rgba(30, 30, 30, 0.06)',
            color: hasUnsavedChanges ? 'white' : 'rgba(30, 30, 30, 0.4)',
            cursor: hasUnsavedChanges ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 500,
            fontSize: '14px',
            '&:hover': hasUnsavedChanges ? {
              bgcolor: 'rgb(114, 0, 21)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(146, 0, 32, 0.3)'
            } : {}
          }}
        >
          <Save sx={{ fontSize: 18 }} />
          Save
        </Box>

        {/* Publish Button */}
        <Tooltip title="Publish Site">
          <Box
            onClick={handlePublish}
            sx={{
              px: 2,
              py: 1,
              borderRadius: '6px',
              bgcolor: 'rgb(146, 0, 32)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 500,
              fontSize: '14px',
              '&:hover': {
                bgcolor: 'rgb(114, 0, 21)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(146, 0, 32, 0.3)'
              }
            }}
          >
            <Publish sx={{ fontSize: 18 }} />
            Publish
          </Box>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default EditorTopBar;
