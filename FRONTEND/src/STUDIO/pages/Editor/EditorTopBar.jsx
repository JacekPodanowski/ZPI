import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Stack, Typography, Tooltip, TextField, useMediaQuery, Menu, MenuItem, ListItemIcon, ListItemText, Slider, alpha } from '@mui/material';
import { ArrowBack, Smartphone, Monitor, Save, Undo, Redo, Edit, Check, Close, FileDownload, FileUpload, Publish, LightMode, DarkMode, Schema, MoreVert, ZoomIn, ZoomOut } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import { renameSite, updateSiteTemplate, createSiteVersion } from '../../../services/siteService';
import { useThemeContext } from '../../../theme/ThemeProvider';
import useTheme from '../../../theme/useTheme';
import getEditorColorTokens from '../../../theme/editorColorTokens';
import apiClient from '../../../services/apiClient';
import { retrieveTempImage, isTempBlobUrl } from '../../../services/tempMediaCache';
import { useToast } from '../../../contexts/ToastContext';

const formatRelativeTime = (timestamp) => {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return 'just now';
  }
  if (diffMs < hour) {
    const mins = Math.floor(diffMs / minute);
    return `${mins} min ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleString();
};

const EditorTopBar = () => {
  const editorMode = useNewEditorStore((state) => state.editorMode);
  const exitDetailMode = useNewEditorStore((state) => state.exitDetailMode);
  const devicePreview = useNewEditorStore((state) => state.devicePreview);
  const setDevicePreview = useNewEditorStore((state) => state.setDevicePreview);
  const canvasZoom = useNewEditorStore((state) => state.canvasZoom);
  const setCanvasZoom = useNewEditorStore((state) => state.setCanvasZoom);
  const hasUnsavedChanges = useNewEditorStore((state) => state.hasUnsavedChanges);
  const getSelectedPage = useNewEditorStore((state) => state.getSelectedPage);
  const siteId = useNewEditorStore((state) => state.siteId);
  const siteName = useNewEditorStore((state) => state.siteName);
  const undo = useNewEditorStore((state) => state.undo);
  const redo = useNewEditorStore((state) => state.redo);
  const structureHistory = useNewEditorStore((state) => state.structureHistory);
  const detailHistory = useNewEditorStore((state) => state.detailHistory);
  const setSiteName = useNewEditorStore((state) => state.setSiteName);
  const site = useNewEditorStore((state) => state.site);
  const lastSavedAt = useNewEditorStore((state) => state.lastSavedAt);
  const currentVersionNumber = useNewEditorStore((state) => state.currentVersionNumber);
  const markAsSaved = useNewEditorStore((state) => state.markAsSaved);
  const loadSite = useNewEditorStore((state) => state.loadSite);

  const addToast = useToast();

  // Get theme context for dark/light mode
  const { mode, toggleMode } = useThemeContext();
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);
  const {
    surfaces,
    borders,
    text,
    interactive,
    controls
  } = editorColors;
  const textPrimary = text.primary;
  const textMuted = text.muted;
  const textHint = text.hint;
  const dividerColor = borders.subtle;
  const topBarBg = surfaces.overlay;
  const baseSurface = surfaces.base;
  const hoverSurface = surfaces.hover;
  const selectedToggleBg = surfaces.elevated;
  const inactiveSaveBg = surfaces.muted;
  const interactiveMain = interactive.main;
  const interactiveHover = interactive.hover;
  const inverseText = text.inverse;
  const toggleGroupBg = controls.groupBg;
  const toggleHoverBg = controls.groupHoverBg;
  const accentMain = interactive.main;
  const accentHover = interactive.hover;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(siteName);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [versions, setVersions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:900px)');

  // Check local history for undo/redo availability
  const currentHistory = editorMode === 'structure' ? structureHistory : detailHistory;
  const canUndoLocal = currentHistory?.past?.length > 0;
  const canRedoLocal = currentHistory?.future?.length > 0;

  const undoTooltip = canUndoLocal
    ? `Undo last change (Ctrl+Z)`
    : 'No changes to undo';
  const redoTooltip = canRedoLocal
    ? `Redo last change (Ctrl+Y)`
    : 'No changes to redo';

  const selectedPage = getSelectedPage();
  const savedStatusText = isSaving
    ? 'Saving...'
    : hasUnsavedChanges
      ? 'Unsaved changes'
      : lastSavedAt
        ? `Saved ${formatRelativeTime(lastSavedAt)}`
        : 'Never saved';
  const undoLabel = canUndoLocal ? 'Undo (Ctrl+Z)' : 'Undo';
  const redoLabel = canRedoLocal ? 'Redo (Ctrl+Y)' : 'Redo';

  const handleUndo = () => {
    if (canUndoLocal) {
      undo();
    }
  };

  const handleRedo = () => {
    if (canRedoLocal) {
      redo();
    }
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndoLocal) {
          undo();
        }
      }
      // Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z for redo
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        if (canRedoLocal) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndoLocal, canRedoLocal, undo, redo]); // Include all dependencies

  // Update titleValue when siteName changes (after loading from API)
  useEffect(() => {
    setTitleValue(siteName);
  }, [siteName]);

  const handleSave = async () => {
    if (isSaving || !hasUnsavedChanges) {
      return;
    }

    const trimmedName = siteName.trim();
    if (!trimmedName) {
      addToast('Site name is required', { variant: 'error' });
      return;
    }

    if (!siteId) {
      addToast('Cannot save yet. Please create the site first.', { variant: 'warning' });
      return;
    }

    setIsSaving(true);

    try {
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

      // Upload each blob and create a URL map
      const uploadPromises = Array.from(allBlobUrls).map(async (blobUrl) => {
        let file = null;

        if (isTempBlobUrl(blobUrl)) {
          file = await retrieveTempImage(blobUrl);
        } else {
        }

        if (!file) {
          try {
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            const extension = (blob.type && blob.type.split('/')[1]) || 'bin';
            const fallbackName = `upload-${Date.now()}.${extension}`;
            file = new File([blob], fallbackName, { type: blob.type || 'application/octet-stream' });
          } catch (fetchError) {
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

        // Remove Content-Type header to let browser set it with boundary for multipart/form-data
        const response = await apiClient.post('/upload/', formData, {
          headers: {
            'Content-Type': undefined
          }
        });

        const uploadedUrl = response?.data?.url;
        if (!uploadedUrl) {
          return { tempUrl: blobUrl, finalUrl: blobUrl, failed: true };
        }

        return { tempUrl: blobUrl, finalUrl: uploadedUrl, failed: false };
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      const failedUploads = results.filter((result) => result.failed);

      if (failedUploads.length > 0) {
        addToast('Failed to upload some images. Please try again.', { variant: 'error' });
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
        } else {
        }
      }

  await updateSiteTemplate(siteId, finalConfig, trimmedName);

      const changeSummary = 'Manual save'; // Simple default message

      let versionResponse = null;
      try {
        versionResponse = await createSiteVersion(siteId, {
          template_config: finalConfig,
          change_summary: changeSummary
        });
      } catch (versionError) {
      }

      // Update store with uploaded URLs (only current site state)
      if (urlMap.size > 0) {
        useNewEditorStore.setState((state) => {
          // Update current site
          let siteString = JSON.stringify(state.site);
          urlMap.forEach((finalUrl, tempUrl) => {
            const escapedTempUrl = tempUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedTempUrl, 'g');
            siteString = siteString.replace(regex, finalUrl);
          });
          
          return {
            site: JSON.parse(siteString)
          };
        });
      }

      if (versionResponse) {
        const normalizedVersion = {
          ...versionResponse,
          template_config: versionResponse.template_config || finalConfig
        };
        setVersions((prev = []) => {
          const filtered = prev.filter((entry) => entry.id !== normalizedVersion.id);
          return [...filtered, normalizedVersion];
        });
        markAsSaved({ version: versionResponse });
      } else {
        markAsSaved({ lastSavedAt: new Date().toISOString() });
      }

      const successMessage = versionResponse
        ? `Site saved successfully (v${versionResponse.version_number}).`
        : 'Site saved, but version history could not be recorded.';
      addToast(successMessage, { variant: 'success' });
    } catch (error) {
      addToast('Failed to save site. Please try again.', { variant: 'error' });
    } finally {
      setIsSaving(false);
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
            // For now, just log it - implement loadSite() call when ready
          } else {
            addToast('Invalid config file', { variant: 'error' });
          }
        } catch (error) {
          addToast('Failed to parse JSON', { variant: 'error' });
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handlePublish = () => {
    // TODO: Implement publish logic
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
        addToast('Failed to rename site', { variant: 'error' });
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
        {/* Go Back Button - changes based on mode */}
        <Tooltip title={editorMode === 'detail' ? 'Back to Structure' : 'Back to Dashboard'}>
          <IconButton
            onClick={editorMode === 'detail' ? exitDetailMode : handleGoBack}
            sx={{
              height: '48px',
              width: editorMode === 'detail' ? '60px' : '48px',
              borderRadius: '12px',
              bgcolor: baseSurface,
              color: textPrimary,
              display: 'flex',
              gap: 1,
              transition: 'width 0.2s ease',
              '&:hover': {
                bgcolor: hoverSurface
              }
            }}
          >
            <ArrowBack />
            {editorMode === 'detail' && <Schema sx={{ fontSize: 20 }} />}
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
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              cursor: editorMode === 'structure' ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
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
                color: textPrimary,
                fontSize: '16px'
              }}
            >
              {editorMode === 'detail' 
                ? `${selectedPage?.name || 'Untitled'} Page`
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
      <Stack direction="row" spacing={1} alignItems="center" flex={1} justifyContent="flex-end">
        {!isMobile ? (
          <Box display="flex" alignItems="center">
            {/* Divider from title controls */}
            <Box
              sx={{
                width: '1px',
                height: '24px',
                bgcolor: dividerColor,
                mx: 0.5
              }}
            />

            {/* Dark/Light Mode Toggle */}
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
                bgcolor: dividerColor,
                mx: 0.5
              }}
            />

            {/* Download Config */}
            <Tooltip title="Download Config">
              <IconButton 
                size="small"
                onClick={handleDownload}
                sx={{ 
                  color: textPrimary,
                  '&:hover': { bgcolor: hoverSurface }
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
                  color: textPrimary,
                  '&:hover': { bgcolor: hoverSurface }
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
                bgcolor: dividerColor,
                mx: 0.5
              }}
            />
          </Box>
        ) : null}

        {/* Device Toggle - Always visible */}
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

        {/* Zoom Controls */}
        {!isMobile && (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: 200 }}>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={() => setCanvasZoom(Math.max(0.25, canvasZoom - 0.1))}>
                <ZoomOut fontSize="small" />
              </IconButton>
            </Tooltip>
            <Slider
              value={canvasZoom}
              onChange={(e, newValue) => setCanvasZoom(newValue)}
              min={0.25}
              max={1}
              step={0.05}
              aria-labelledby="zoom-slider"
              sx={{
                color: interactiveMain,
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                  transition: '0.2s ease-in-out',
                  '&:hover, &.Mui-active': {
                    boxShadow: `0px 0px 0px 8px ${alpha(interactiveMain, 0.16)}`,
                  },
                },
              }}
            />
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={() => setCanvasZoom(Math.min(1, canvasZoom + 0.1))}>
                <ZoomIn fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography 
              variant="caption" 
              sx={{ fontWeight: 600, minWidth: '40px', textAlign: 'right', color: textMuted, cursor: 'pointer' }}
              onClick={() => setCanvasZoom(1)}
            >
              {Math.round(canvasZoom * 100)}%
            </Typography>
          </Stack>
        )}

        {/* Separator */}
        <Box
          sx={{
            width: '1px',
            height: '24px',
            bgcolor: dividerColor,
            mx: 0.5
          }}
        />

        {/* Mobile Menu Button */}
        {isMobile && (
          <>
            <Tooltip title="More Options">
              <IconButton 
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ 
                  color: textPrimary,
                  '&:hover': { bgcolor: hoverSurface }
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  bgcolor: topBarBg,
                  border: `1px solid ${dividerColor}`,
                  borderRadius: '8px',
                  mt: 1
                }
              }}
            >
              <MenuItem 
                onClick={() => { handleUndo(); setAnchorEl(null); }}
                disabled={!canUndoLocal}
                sx={{ color: textPrimary }}
              >
                <ListItemIcon><Undo fontSize="small" sx={{ color: textPrimary }} /></ListItemIcon>
                <ListItemText>{undoLabel}</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => { handleRedo(); setAnchorEl(null); }}
                disabled={!canRedoLocal}
                sx={{ color: textPrimary }}
              >
                <ListItemIcon><Redo fontSize="small" sx={{ color: textPrimary }} /></ListItemIcon>
                <ListItemText>{redoLabel}</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => { toggleMode(); setAnchorEl(null); }}
                sx={{ color: textPrimary }}
              >
                <ListItemIcon>
                  {mode === 'dark' ? <LightMode fontSize="small" sx={{ color: textPrimary }} /> : <DarkMode fontSize="small" sx={{ color: textPrimary }} />}
                </ListItemIcon>
                <ListItemText>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => { handleDownload(); setAnchorEl(null); }}
                sx={{ color: textPrimary }}
              >
                <ListItemIcon><FileDownload fontSize="small" sx={{ color: textPrimary }} /></ListItemIcon>
                <ListItemText>Download Config</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => { handleImport(); setAnchorEl(null); }}
                sx={{ color: textPrimary }}
              >
                <ListItemIcon><FileUpload fontSize="small" sx={{ color: textPrimary }} /></ListItemIcon>
                <ListItemText>Import Config</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}

        {/* Undo/Redo Controls */}
        {!isMobile && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title={undoTooltip}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleUndo}
                  disabled={!canUndoLocal}
                  aria-label={undoLabel}
                  sx={{
                    color: textPrimary,
                    '&:hover': { bgcolor: hoverSurface },
                    '&.Mui-disabled': { color: textMuted }
                  }}
                >
                  <Undo fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={redoTooltip}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleRedo}
                  disabled={!canRedoLocal}
                  aria-label={redoLabel}
                  sx={{
                    color: textPrimary,
                    '&:hover': { bgcolor: hoverSurface },
                    '&.Mui-disabled': { color: textMuted }
                  }}
                >
                  <Redo fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        )}

        <Stack spacing={0.25} alignItems="flex-end" sx={{ mr: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              color: (isSaving || hasUnsavedChanges) ? interactiveMain : textHint
            }}
          >
            {savedStatusText}
          </Typography>
        </Stack>

        {/* Save Button */}
        <Tooltip title={hasUnsavedChanges ? 'Save changes (Ctrl+S)' : 'No changes to save'}>
          <Box
            onClick={() => {
              if (!isSaving && hasUnsavedChanges) {
                handleSave();
              }
            }}
            sx={{
            px: isMobile ? 1 : 2,
            py: 1,
            borderRadius: '6px',
            bgcolor: hasUnsavedChanges ? interactiveMain : inactiveSaveBg,
            color: hasUnsavedChanges ? inverseText : textHint,
            cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 0 : 1,
            fontWeight: 500,
            fontSize: '14px',
            opacity: isSaving ? 0.7 : 1,
            '&:hover': hasUnsavedChanges && !isSaving ? {
              bgcolor: interactiveHover,
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(146, 0, 32, 0.28)'
            } : {}
          }}
        >
          <Save sx={{ fontSize: 18 }} />
          {!isMobile && (isSaving ? 'Saving...' : 'Save')}
        </Box>
        </Tooltip>

        {/* Publish Button */}
        <Tooltip title="Publish Site">
          <Box
            onClick={handlePublish}
            sx={{
              px: isMobile ? 1 : 2,
              py: 1,
              borderRadius: '6px',
              bgcolor: accentMain,
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 0 : 1,
              fontWeight: 500,
              fontSize: '14px',
              '&:hover': {
                bgcolor: accentHover,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(146, 0, 32, 0.28)'
              }
            }}
          >
            <Publish sx={{ fontSize: 18 }} />
            {!isMobile && 'Publish'}
          </Box>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default EditorTopBar;
