import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Stack, Typography, Tooltip, TextField, useMediaQuery, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { ArrowBack, Smartphone, Monitor, Save, Undo, Redo, Edit, Check, Close, FileDownload, FileUpload, Publish, LightMode, DarkMode, Schema, MoreVert } from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import { renameSite, updateSiteTemplate, createSiteVersion } from '../../../services/siteService';
import { useThemeContext } from '../../../theme/ThemeProvider';
import useTheme from '../../../theme/useTheme';
import getEditorColorTokens from '../../../theme/editorColorTokens';
import apiClient from '../../../services/apiClient';
import { retrieveTempImage, isTempBlobUrl } from '../../../services/tempMediaCache';

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

const formatHistoryDescription = (meta) => {
  if (!meta) {
    return '';
  }
  if (typeof meta.description === 'string' && meta.description.trim()) {
    return meta.description.trim();
  }
  if (typeof meta.actionType === 'string' && meta.actionType.trim()) {
    return meta.actionType.replace(/_/g, ' ').trim();
  }
  return '';
};

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
    site,
    undo,
    redo,
    structureHistory,
    detailHistory,
    lastSavedAt,
    currentVersionNumber,
    markAsSaved
  } = useNewEditorStore();

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
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:900px)');

  const selectedPage = getSelectedPage();
  const activeHistory = editorMode === 'structure' ? structureHistory : detailHistory;
  const modeLabel = editorMode === 'structure' ? 'Structure' : 'Detail';
  const pastEntries = activeHistory?.past || [];
  const futureEntries = activeHistory?.future || [];
  const canUndo = pastEntries.length > 0;
  const canRedo = futureEntries.length > 0;
  const undoMeta = canUndo ? pastEntries[pastEntries.length - 1]?.meta : null;
  const redoMeta = canRedo ? futureEntries[futureEntries.length - 1]?.meta : null;
  const undoDescription = formatHistoryDescription(undoMeta);
  const redoDescription = formatHistoryDescription(redoMeta);
  const undoTooltip = canUndo
    ? `Undo ${modeLabel}${undoDescription ? ` • ${undoDescription}` : ''} (Ctrl+Z)`
    : `Nothing to undo (${modeLabel})`;
  const redoTooltip = canRedo
    ? `Redo ${modeLabel}${redoDescription ? ` • ${redoDescription}` : ''} (Ctrl+Shift+Z)`
    : `Nothing to redo (${modeLabel})`;
  const versionLabel = currentVersionNumber ? `Version ${currentVersionNumber}` : 'Draft';
  const savedStatusText = isSaving
    ? 'Saving...'
    : hasUnsavedChanges
      ? 'Unsaved changes'
      : lastSavedAt
        ? `Saved ${formatRelativeTime(lastSavedAt)}`
        : 'Never saved';

  const getMostRecentHistoryMeta = () => {
    const candidates = [];
    if (structureHistory?.past?.length) {
      candidates.push(structureHistory.past[structureHistory.past.length - 1]);
    }
    if (detailHistory?.past?.length) {
      candidates.push(detailHistory.past[detailHistory.past.length - 1]);
    }
    if (!candidates.length) {
      return null;
    }

    return candidates.reduce((latest, entry) => {
      const entryTs = entry?.meta?.timestamp || 0;
      const latestTs = latest?.meta?.timestamp || 0;
      return entryTs >= latestTs ? entry : latest;
    }, null);
  };

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
      console.error('Site name is required');
      return;
    }

    if (!siteId) {
      console.warn('[Save] No siteId - cannot save');
      alert('Cannot save yet. Please create the site first.');
      return;
    }

    setIsSaving(true);

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

  await updateSiteTemplate(siteId, finalConfig, trimmedName);
      console.log('[Save] Site updated successfully');

      const latestMetaEntry = getMostRecentHistoryMeta();
      const changeSummary = formatHistoryDescription(latestMetaEntry?.meta) || '';

      let versionResponse = null;
      try {
        versionResponse = await createSiteVersion(siteId, {
          template_config: finalConfig,
          change_summary: changeSummary
        });
        console.log('[Save] Version snapshot stored');
      } catch (versionError) {
        console.error('[Save] Failed to create site version:', versionError);
      }

      useNewEditorStore.setState(() => ({ site: finalConfig }));

      if (versionResponse) {
        markAsSaved({ version: versionResponse });
      } else {
        markAsSaved({ lastSavedAt: new Date().toISOString() });
      }

      const successMessage = versionResponse
        ? `Site saved successfully (v${versionResponse.version_number}).`
        : 'Site saved, but version history could not be recorded.';
      alert(successMessage);
    } catch (error) {
      console.error('[Save] Save failed:', error);
      alert('Failed to save site. Please try again.');
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
              height: '56px',
              width: editorMode === 'detail' ? '72px' : '48px',
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
          <>
            {/* Undo/Redo */}
            <Tooltip title={undoTooltip}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => canUndo && undo(editorMode)}
                  disabled={!canUndo}
                  sx={{
                    color: textPrimary,
                    '&:hover': { bgcolor: hoverSurface },
                    '&.Mui-disabled': {
                      color: textMuted
                    }
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
                  onClick={() => canRedo && redo(editorMode)}
                  disabled={!canRedo}
                  sx={{
                    color: textPrimary,
                    '&:hover': { bgcolor: hoverSurface },
                    '&.Mui-disabled': {
                      color: textMuted
                    }
                  }}
                >
                  <Redo fontSize="small" />
                </IconButton>
              </span>
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
          </>
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
                onClick={() => { canUndo && undo(editorMode); setAnchorEl(null); }}
                disabled={!canUndo}
                sx={{ color: textPrimary }}
              >
                <ListItemIcon><Undo fontSize="small" sx={{ color: textPrimary }} /></ListItemIcon>
                <ListItemText>Undo</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => { canRedo && redo(editorMode); setAnchorEl(null); }}
                disabled={!canRedo}
                sx={{ color: textPrimary }}
              >
                <ListItemIcon><Redo fontSize="small" sx={{ color: textPrimary }} /></ListItemIcon>
                <ListItemText>Redo</ListItemText>
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

        <Stack spacing={0.25} alignItems="flex-end" sx={{ mr: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: textHint,
              letterSpacing: '0.02em'
            }}
          >
            {versionLabel}
          </Typography>
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
