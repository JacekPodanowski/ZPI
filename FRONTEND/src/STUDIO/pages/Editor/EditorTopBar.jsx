import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Stack, Typography, Tooltip, TextField, useMediaQuery, useTheme as useMuiTheme, Menu, MenuItem } from '@mui/material';
import { ArrowBack, Smartphone, Monitor, Save, Undo, Redo, Edit, Check, Close, FileDownload, FileUpload, Publish, LightMode, DarkMode, Schema, MoreVert } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import { renameSite, updateSiteTemplate } from '../../../services/siteService';
import { useThemeContext } from '../../../theme/ThemeProvider';
import useTheme from '../../../theme/useTheme';
import getEditorColorTokens from '../../../theme/editorColorTokens';
import apiClient from '../../../services/apiClient';
import { retrieveTempImage, isTempBlobUrl } from '../../../services/tempMediaCache';

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

  // Get theme context for dark/light mode
  const { mode, toggleMode } = useThemeContext();
  const theme = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // Extract editor color tokens
  const colors = getEditorColorTokens(theme);
  const {
    topBarBg,
    dividerColor,
    baseSurface,
    textPrimary,
    hoverSurface,
    selectedToggleBg,
    interactiveMain,
    interactiveHover,
    inverseText,
    textMuted,
    textHint,
    toggleGroupBg,
    toggleHoverBg,
    inactiveSaveBg,
    accentMain,
    accentHover
  } = colors;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(siteName);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const fileInputRef = useRef(null);

  const selectedPage = getSelectedPage();

  // Update titleValue when siteName changes (after loading from API)
  useEffect(() => {
    setTitleValue(siteName);
  }, [siteName]);

  const handleSave = async () => {
    if (!siteName.trim()) {
      console.error('Site name is required');
      return;
    }

    try {
      console.log('[Save] Starting save process...');
      
      // Deep clone the config
      let finalConfig = JSON.parse(JSON.stringify(site));
      
      // Find all blob URLs in the configuration
      const allBlobUrls = new Set();
      JSON.stringify(finalConfig, (key, value) => {
        if (typeof value === 'string' && value.includes('blob:')) {
          const matches = value.match(/blob:[^"')\s]+/g);
          if (matches) {
            matches.forEach((match) => allBlobUrls.add(match));
          }
        }
        return value;
      });

      console.log('[Save] Found blob URLs:', Array.from(allBlobUrls));

      // Upload each blob and create a URL map
      const uploadPromises = Array.from(allBlobUrls).map(async (blobUrl) => {
        let file = null;

        if (isTempBlobUrl(blobUrl)) {
          console.log('[Save] Uploading tracked blob:', blobUrl);
          file = await retrieveTempImage(blobUrl);
        } else {
          console.warn('[Save] Blob not tracked, attempting direct fetch:', blobUrl);
        }

        if (!file) {
          try {
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            const extension = (blob.type && blob.type.split('/')[1]) || 'bin';
            const fallbackName = `upload-${Date.now()}.${extension}`;
            file = new File([blob], fallbackName, { type: blob.type || 'application/octet-stream' });
            console.log('[Save] Retrieved file via fetch fallback');
          } catch (fetchError) {
            console.error('[Save] Failed to fetch blob:', blobUrl, fetchError);
          }
        }

        if (!file) {
          return { tempUrl: blobUrl, finalUrl: blobUrl, failed: true };
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('usage', 'site_content');
        if (siteId) {
          formData.append('site_id', siteId);
        }

        const response = await apiClient.post('/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const uploadedUrl = response?.data?.url;
        if (!uploadedUrl) {
          console.error('[Save] Upload response missing URL');
          return { tempUrl: blobUrl, finalUrl: blobUrl, failed: true };
        }

        return { tempUrl: blobUrl, finalUrl: uploadedUrl, failed: false };
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      const failedUploads = results.filter((result) => result.failed);
      
      if (failedUploads.length > 0) {
        console.error('[Save] Failed uploads:', failedUploads);
        alert('Failed to upload some images. Please try again.');
        return;
      }

      const urlMap = new Map(results.map((r) => [r.tempUrl, r.finalUrl]));

      // Replace all temporary blob URLs with permanent URLs
      if (urlMap.size > 0) {
        let configString = JSON.stringify(finalConfig);
        urlMap.forEach((finalUrl, tempUrl) => {
          const escapedTempUrl = tempUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedTempUrl, 'g');
          configString = configString.replace(regex, finalUrl);
        });
        finalConfig = JSON.parse(configString);
        
        // Verify no blob URLs remain
        const remainingBlobs = JSON.stringify(finalConfig).match(/blob:http[^\s"']*/g);
        if (remainingBlobs) {
          console.error('[Save] Blob URLs still present after replacement!', remainingBlobs);
        } else {
          console.log('[Save] ✓ All blob URLs replaced successfully');
        }
      }

      // Save to backend
      if (siteId) {
        await updateSiteTemplate(siteId, { site: finalConfig }, siteName);
        console.log('[Save] Site updated successfully');
      } else {
        console.warn('[Save] No siteId - cannot save');
        return;
      }

      // Update store with final URLs and mark as saved
      useNewEditorStore.getState().loadSite({
        id: siteId,
        name: siteName,
        site: finalConfig
      });
      
      alert('Site saved successfully!');
    } catch (error) {
      console.error('[Save] Save failed:', error);
      alert('Failed to save site. Please try again.');
    }
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
    // Navigate back to sites list
    window.location.href = '/studio/sites';
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
        bgcolor: topBarBg,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${dividerColor}`,
        display: 'flex',
        alignItems: 'center',
        pr: { xs: 1, md: 2 },
        gap: { xs: 0.5, md: 2 },
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
      <Stack direction="row" spacing={{ xs: 0.5, md: 1 }} alignItems="center" flex={1}>
        {/* Go Back Button - changes based on mode */}
        <Tooltip title={editorMode === 'detail' ? 'Back to Structure' : 'Back to Dashboard'}>
          <IconButton
            onClick={editorMode === 'detail' ? exitDetailMode : handleGoBack}
            sx={{
              height: '56px',
              width: { xs: '48px', md: editorMode === 'detail' ? '72px' : '48px' },
              borderRadius: 0,
              bgcolor: baseSurface,
              color: textPrimary,
              borderRight: `1px solid ${dividerColor}`,
              display: 'flex',
              gap: 1,
              transition: 'width 0.2s ease',
              '&:hover': {
                bgcolor: hoverSurface
              }
            }}
          >
            <ArrowBack />
            {editorMode === 'detail' && !isMobile && <Schema sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>

        {/* Title - Site name in structure mode, Page name in detail mode */}
        {!isEditingTitle ? (
          <Box
            onClick={editorMode === 'structure' ? handleTitleClick : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: { xs: 1, md: 1.5 },
              py: 0.75,
              borderRadius: '8px',
              cursor: editorMode === 'structure' ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              maxWidth: { xs: '120px', sm: '200px', md: '100%' },
              overflow: 'hidden',
              ...(editorMode === 'structure' && {
                '&:hover': {
                  bgcolor: hoverSurface,
                  '& .edit-icon': {
                    opacity: 1
                  }
                }
              })
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
              {editorMode === 'detail' 
                ? `${selectedPage?.name || 'Untitled'}${isMobile ? '' : ' Page'}`
                : (isSavingTitle ? 'Saving...' : siteName)
              }
            </Typography>
            {editorMode === 'structure' && (
              <Edit 
                className="edit-icon"
                sx={{ 
                  fontSize: 16, 
                  color: textHint,
                  opacity: 0,
                  transition: 'opacity 0.2s ease'
                }} 
              />
            )}
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
                  bgcolor: selectedToggleBg,
                  '& fieldset': {
                    borderColor: interactiveMain
                  },
                  '&:hover fieldset': {
                    borderColor: interactiveHover
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: interactiveMain
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
                  bgcolor: interactiveMain,
                  color: inverseText,
                  width: 32,
                  height: 32,
                  '&:hover': {
                    bgcolor: interactiveHover
                  },
                  '&.Mui-disabled': {
                    bgcolor: interactive.subtle,
                    color: textMuted
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
                  bgcolor: baseSurface,
                  color: textPrimary,
                  width: 32,
                  height: 32,
                  '&:hover': {
                    bgcolor: hoverSurface
                  }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      {/* Right Section */}
      <Stack direction="row" spacing={{ xs: 0.5, md: 1 }} alignItems="center" flex={1} justifyContent="flex-end">
        {/* Undo/Redo - Hidden on mobile */}
        {!isMobile && (
          <>
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
          </>
        )}

        {/* Dark/Light Mode Toggle - Hidden on mobile */}
        {!isMobile && (
          <>
            <Tooltip title={mode === 'dark' ? "Light Mode" : "Dark Mode"}>
              <IconButton 
                size="small"
                onClick={toggleMode}
                sx={{ 
                  color: textPrimary,
                  '&:hover': { bgcolor: hoverSurface }
                }}
              >
                {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
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
          </>
        )}

        {/* Download/Upload Config - Hidden on mobile */}
        {!isMobile && (
          <>
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
          </>
        )}

        {/* Device Toggle - Hidden on mobile */}
        {!isMobile && (
          <Stack 
            direction="row" 
            spacing={0}
            sx={{
              bgcolor: toggleGroupBg,
              borderRadius: '8px',
              p: 0.5
            }}
          >
            <Tooltip title="Desktop View">
              <IconButton
                size="small"
                onClick={() => setDevicePreview('desktop')}
                sx={{
                  color: devicePreview === 'desktop' ? interactiveMain : textHint,
                  bgcolor: devicePreview === 'desktop' ? selectedToggleBg : 'transparent',
                  '&:hover': { 
                    bgcolor: devicePreview === 'desktop' ? selectedToggleBg : toggleHoverBg 
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
                  color: devicePreview === 'mobile' ? interactiveMain : textHint,
                  bgcolor: devicePreview === 'mobile' ? selectedToggleBg : 'transparent',
                  '&:hover': { 
                    bgcolor: devicePreview === 'mobile' ? selectedToggleBg : toggleHoverBg 
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Smartphone fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}

        {/* Separator - Hidden on mobile */}
        {!isMobile && (
          <Box
            sx={{
              width: '1px',
              height: '24px',
              bgcolor: dividerColor,
              mx: 0.5
            }}
          />
        )}

        {/* Mobile overflow menu */}
        {isMobile && (
          <>
            <Tooltip title="More options">
              <IconButton
                size="small"
                onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
                sx={{
                  color: textPrimary,
                  '&:hover': { bgcolor: hoverSurface }
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={moreMenuAnchor}
              open={Boolean(moreMenuAnchor)}
              onClose={() => setMoreMenuAnchor(null)}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px'
                }
              }}
            >
              <MenuItem onClick={() => { toggleMode(); setMoreMenuAnchor(null); }}>
                {mode === 'dark' ? <LightMode sx={{ mr: 2, fontSize: 20 }} /> : <DarkMode sx={{ mr: 2, fontSize: 20 }} />}
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </MenuItem>
              <MenuItem onClick={() => { setDevicePreview('desktop'); setMoreMenuAnchor(null); }}>
                <Monitor sx={{ mr: 2, fontSize: 20 }} />
                Desktop View
              </MenuItem>
              <MenuItem onClick={() => { setDevicePreview('mobile'); setMoreMenuAnchor(null); }}>
                <Smartphone sx={{ mr: 2, fontSize: 20 }} />
                Mobile View
              </MenuItem>
              <MenuItem onClick={() => { handleDownload(); setMoreMenuAnchor(null); }}>
                <FileDownload sx={{ mr: 2, fontSize: 20 }} />
                Download Config
              </MenuItem>
              <MenuItem onClick={() => { handleImport(); setMoreMenuAnchor(null); }}>
                <FileUpload sx={{ mr: 2, fontSize: 20 }} />
                Import Config
              </MenuItem>
            </Menu>
          </>
        )}

        {/* Save Button */}
        <Tooltip title={hasUnsavedChanges ? "Save Changes" : "No Changes"}>
          <Box
            onClick={handleSave}
            sx={{
              px: { xs: 1, sm: 1.5, md: 2 },
              py: { xs: 0.75, md: 1 },
              borderRadius: '6px',
              bgcolor: hasUnsavedChanges ? interactiveMain : inactiveSaveBg,
              color: hasUnsavedChanges ? inverseText : textHint,
              cursor: hasUnsavedChanges ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, md: 1 },
              fontWeight: 500,
              fontSize: { xs: '13px', md: '14px' },
              minWidth: { xs: '40px', sm: 'auto' },
              justifyContent: 'center',
              '&:hover': hasUnsavedChanges ? {
                bgcolor: interactiveHover,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(146, 0, 32, 0.28)'
              } : {}
            }}
          >
            <Save sx={{ fontSize: { xs: 16, md: 18 } }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Save
            </Box>
          </Box>
        </Tooltip>

        {/* Publish Button */}
        <Tooltip title="Publish Site">
          <Box
            onClick={handlePublish}
            sx={{
              px: { xs: 1, sm: 1.5, md: 2 },
              py: { xs: 0.75, md: 1 },
              borderRadius: '6px',
              bgcolor: accentMain,
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, md: 1 },
              fontWeight: 500,
              fontSize: { xs: '13px', md: '14px' },
              minWidth: { xs: '40px', sm: 'auto' },
              justifyContent: 'center',
              '&:hover': {
                bgcolor: accentHover,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(146, 0, 32, 0.28)'
              }
            }}
          >
            <Publish sx={{ fontSize: { xs: 16, md: 18 } }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Publish
            </Box>
          </Box>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default EditorTopBar;
