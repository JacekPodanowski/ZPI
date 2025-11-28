import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  Box,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  TextField,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Slider,
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
  Divider,
  CircularProgress,
  ButtonBase
} from '@mui/material';
import {
  ArrowBack,
  Smartphone,
  Monitor,
  Save,
  Undo,
  Redo,
  Edit,
  Check,
  Close,
  FileDownload,
  FileUpload,
  Publish,
  LightMode,
  DarkMode,
  Schema,
  MoreVert,
  ZoomIn,
  ZoomOut,
  Menu as MenuIcon
} from '@mui/icons-material';
import useNewEditorStore from '../../store/newEditorStore';
import { renameSite, updateSiteTemplate, createSiteVersion, publishSite, fetchSiteVersions } from '../../../services/siteService';
import { useThemeContext } from '../../../theme/ThemeProvider';
import useTheme from '../../../theme/useTheme';
import getEditorColorTokens from '../../../theme/editorColorTokens';
import apiClient from '../../../services/apiClient';
import { retrieveTempImageWithThumbnail, isTempBlobUrl } from '../../../services/tempMediaCache';
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

const BRANCH_COLORS = ['#920020', '#2A547E', '#7C3AED', '#0D9488', '#B45309'];
const SHORT_TITLE_MAX_WORDS = 3;
const MAX_CHANGE_BULLETS = 4;
const FALLBACK_FULL_TITLE = 'Zmiany na stronie';
const FALLBACK_SHORT_TITLE = 'Zmiany strony';
const FALLBACK_CHANGE_DESCRIPTION = 'Aktualizacja strony';

const TITLE_PATTERN_MAP = [
  {
    keywords: ['hero'],
    full: 'Zmiany w sekcji Hero',
    short: 'Zmiany Hero'
  },
  {
    keywords: ['styl', 'style'],
    full: 'Zmiana stylu strony',
    short: 'Styl strony'
  },
  {
    keywords: ['kolor', 'color', 'palette', 'paleta'],
    full: 'Aktualizacja kolorów',
    short: 'Nowe kolory'
  },
  {
    keywords: ['nawig', 'menu'],
    full: 'Zmiany w nawigacji',
    short: 'Menu zmiany'
  },
  {
    keywords: ['tekst', 'text', 'content', 'treść'],
    full: 'Zmiany w treści',
    short: 'Treść zmiany'
  },
  {
    keywords: ['moduł', 'module'],
    full: 'Aktualizacja modułów',
    short: 'Zmiany modułów'
  }
];

const sanitizeText = (value = '') => value.replace(/\s+/g, ' ').trim();

const truncateWords = (value = '', limit = SHORT_TITLE_MAX_WORDS) => {
  const sanitized = sanitizeText(value);
  if (!sanitized) {
    return '';
  }
  return sanitized.split(' ').slice(0, limit).join(' ');
};

const capitalizeSentence = (value = '') => {
  const sanitized = sanitizeText(value);
  if (!sanitized) {
    return '';
  }
  return sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
};

const pickTitleVariant = (source = '') => {
  const normalized = source.toLowerCase();
  const pattern = TITLE_PATTERN_MAP.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (pattern) {
    return {
      full: pattern.full,
      short: pattern.short
    };
  }

  const fallbackFull = capitalizeSentence(source) || FALLBACK_FULL_TITLE;
  return {
    full: fallbackFull,
    short: truncateWords(fallbackFull) || FALLBACK_SHORT_TITLE
  };
};

const buildTitleVariantsFromChanges = (changes = []) => {
  if (!Array.isArray(changes) || !changes.length) {
    return {
      full: FALLBACK_FULL_TITLE,
      short: FALLBACK_SHORT_TITLE
    };
  }

  const primary = changes[changes.length - 1] || changes[0];
  const variant = pickTitleVariant(primary || '');
  return {
    full: variant.full,
    short: truncateWords(variant.short || variant.full) || FALLBACK_SHORT_TITLE
  };
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
  const branchColorMapRef = useRef({ main: accentMain });

  useEffect(() => {
    branchColorMapRef.current = { main: accentMain };
  }, [accentMain, siteId]);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(siteName);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [versions, setVersions] = useState([]);
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [latestVersionId, setLatestVersionId] = useState(null);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyAnchor, setHistoryAnchor] = useState(null);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreTargets, setRestoreTargets] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:900px)');
  const postSaveActionRef = useRef(null);

  const setPostSaveAction = useCallback((action) => {
    postSaveActionRef.current = typeof action === 'function' ? action : null;
  }, []);

  const runPostSaveAction = useCallback(() => {
    const action = postSaveActionRef.current;
    postSaveActionRef.current = null;
    if (typeof action === 'function') {
      action();
    }
  }, []);


  const assignBranchColor = useCallback((branchId = 'main', preferredColor) => {
    const safeBranchId = branchId || 'main';
    if (preferredColor && !branchColorMapRef.current[safeBranchId]) {
      branchColorMapRef.current[safeBranchId] = preferredColor;
    }

    if (!branchColorMapRef.current[safeBranchId]) {
      const used = Object.values(branchColorMapRef.current);
      const palette = BRANCH_COLORS.length ? BRANCH_COLORS : [accentMain];
      const available = palette.find((color) => !used.includes(color));
      const fallback = available || palette[used.length % palette.length] || accentMain;
      branchColorMapRef.current[safeBranchId] = fallback;
    }

    return branchColorMapRef.current[safeBranchId];
  }, [accentMain]);

  const normalizeVersion = useCallback((rawVersion) => {
    if (!rawVersion) {
      return null;
    }

    let metadata = {};
    if (rawVersion.notes) {
      if (typeof rawVersion.notes === 'string') {
        try {
          metadata = JSON.parse(rawVersion.notes);
        } catch (error) {
          metadata = { title: rawVersion.notes };
        }
      } else if (typeof rawVersion.notes === 'object') {
        metadata = rawVersion.notes;
      }
    }

    const branchId = metadata.branchId || 'main';
    const branchColor = assignBranchColor(branchId, metadata.branchColor);
    const fallbackLabel = rawVersion.notes || `Wersja v${rawVersion.version_number || ''}`;
    const resolvedTitle = (metadata.title || fallbackLabel || '').toString().trim() || FALLBACK_FULL_TITLE;
    const shortTitle = (metadata.shortTitle || truncateWords(resolvedTitle, SHORT_TITLE_MAX_WORDS) || FALLBACK_SHORT_TITLE).trim();
    const changeList = Array.isArray(metadata.changeList)
      ? metadata.changeList.filter((entry) => typeof entry === 'string' && entry.trim())
      : rawVersion.change_summary
        ? [rawVersion.change_summary]
        : [];

    return {
      ...rawVersion,
      displayTitle: resolvedTitle,
      metadata: {
        ...metadata,
        title: resolvedTitle,
        shortTitle,
        changeList,
        branchId,
        branchColor,
        parentId: metadata.parentId || null
      }
    };
  }, [assignBranchColor]);

  const sortVersionsAscending = useCallback((list = []) => {
    return [...list].sort((a, b) => (a.version_number || 0) - (b.version_number || 0));
  }, []);

  const timelineVersions = useMemo(() => sortVersionsAscending(versions), [sortVersionsAscending, versions]);

  const siteCreationDate = site?.createdAt || site?.created_at || null;

  const timelineEntries = useMemo(() => {
    const ordered = [...timelineVersions].reverse();
    const originTimestamp = siteCreationDate || timelineVersions[0]?.created_at || new Date().toISOString();
    const originEntry = {
      id: 'site-origin',
      created_at: originTimestamp,
      metadata: {
        title: 'Stworzenie strony',
        shortTitle: 'Stworzenie strony',
        changeList: ['Początkowa konfiguracja']
      },
      displayTitle: 'Stworzenie strony',
      isOrigin: true,
      version_number: -1
    };

    return [...ordered, originEntry];
  }, [siteCreationDate, timelineVersions]);

  const latestVersionLabel = useMemo(() => {
    const latest = versions.find((version) => version.id === latestVersionId);
    return latest?.metadata?.title || latest?.displayTitle || 'najnowszej wersji';
  }, [latestVersionId, versions]);

  const newerVersionsRelativeToActive = useMemo(() => {
    return timelineVersions.filter((version) =>
      (version.version_number ?? 0) > (currentVersionNumber ?? 0)
    );
  }, [currentVersionNumber, timelineVersions]);

  const adaptTemplateFromVersion = useCallback((templateConfig) => {
    if (!templateConfig) {
      return null;
    }
    if (templateConfig.site) {
      return templateConfig;
    }
    return {
      site: templateConfig,
      userLibrary: templateConfig.userLibrary || { customAssets: [] },
      entryPointPageId: templateConfig.entryPointPageId || null
    };
  }, []);

  const buildVirtualInitialVersion = useCallback(() => {
    if (!siteId || !site) {
      return null;
    }

    return normalizeVersion({
      id: `initial-${siteId}`,
      version_number: 0,
      template_config: site,
      created_at: new Date().toISOString(),
      notes: JSON.stringify({
        title: 'Punkt startowy',
        branchId: 'main',
        branchColor: accentMain
      }),
      change_summary: 'Auto utworzona konfiguracja początkowa'
    });
  }, [accentMain, normalizeVersion, site, siteId]);

  const hydrateVersions = useCallback(async () => {
    if (!siteId) {
      setVersions([]);
      setActiveVersionId(null);
      setLatestVersionId(null);
      return;
    }

    setVersionsLoading(true);
    setHistoryError(null);
    try {
      const response = await fetchSiteVersions(siteId);
      const normalized = sortVersionsAscending(
        (response || [])
          .map((entry) => normalizeVersion(entry))
          .filter(Boolean)
      );

      let prepared = normalized;
      if (!prepared.length) {
        const fallback = buildVirtualInitialVersion();
        prepared = fallback ? [fallback] : [];
      }

      setVersions(prepared);
      const latest = prepared[prepared.length - 1] || null;
      setLatestVersionId(latest?.id || null);
      setActiveVersionId((prev) => prev || latest?.id || null);
    } catch (error) {
      setHistoryError('Nie udało się pobrać historii wersji');
    } finally {
      setVersionsLoading(false);
    }
  }, [buildVirtualInitialVersion, normalizeVersion, siteId, sortVersionsAscending]);

  useEffect(() => {
    hydrateVersions();
  }, [hydrateVersions]);

  useEffect(() => {
    if (!versions.length) {
      return;
    }

    if (currentVersionNumber !== undefined && currentVersionNumber !== null) {
      const matching = versions.find((version) => version.version_number === currentVersionNumber);
      if (matching && matching.id !== activeVersionId) {
        setActiveVersionId(matching.id);
      }
    }

    if (!activeVersionId) {
      const latest = versions[versions.length - 1];
      if (latest) {
        setActiveVersionId(latest.id);
      }
    }

    const latest = versions[versions.length - 1];
    if (latest && latest.id !== latestVersionId) {
      setLatestVersionId(latest.id);
    }
  }, [activeVersionId, currentVersionNumber, latestVersionId, versions]);

  const loadVersionIntoEditor = useCallback((version) => {
    if (!version?.template_config) {
      addToast('Brak konfiguracji dla tej wersji', { variant: 'error' });
      return false;
    }

    const adaptedTemplate = adaptTemplateFromVersion(version.template_config);
    if (!adaptedTemplate?.site) {
      addToast('Nieprawidłowy format konfiguracji wersji', { variant: 'error' });
      return false;
    }

    loadSite({
      id: siteId,
      name: siteName,
      site: adaptedTemplate.site,
      userLibrary: adaptedTemplate.userLibrary || { customAssets: [] },
      entryPointPageId:
        adaptedTemplate.entryPointPageId || adaptedTemplate.site.pages?.[0]?.id || 'home',
      currentVersionNumber: version.version_number,
      lastSavedAt: version.created_at
    });

    setActiveVersionId(version.id);
    return true;
  }, [adaptTemplateFromVersion, addToast, loadSite, siteId, siteName]);

  const determineBranchForSave = useCallback(() => {
    if (!versions.length) {
      return {
        parentId: null,
        branchId: 'main',
        branchColor: assignBranchColor('main')
      };
    }

    const activeVersion = versions.find((version) => version.id === activeVersionId) || versions[versions.length - 1];
    const parentId = activeVersion?.id || null;
    const parentBranchId = activeVersion?.metadata?.branchId || 'main';
    const parentColor = activeVersion?.metadata?.branchColor || assignBranchColor(parentBranchId);
    const isLatest = !latestVersionId || activeVersion?.id === latestVersionId;

    if (!isLatest && parentBranchId === 'main') {
      const generatedBranchId = `branch-${parentId || Date.now()}`;
      const assignedColor = assignBranchColor(generatedBranchId);
      return {
        parentId,
        branchId: generatedBranchId,
        branchColor: assignedColor
      };
    }

    return {
      parentId,
      branchId: parentBranchId,
      branchColor: parentColor
    };
  }, [activeVersionId, assignBranchColor, latestVersionId, versions]);

  const runOrQueueNavigation = useCallback((action) => {
    if (typeof action !== 'function') {
      return;
    }

    if (hasUnsavedChanges) {
      setPendingNavigation(() => action);
      setUnsavedDialogOpen(true);
      return;
    }

    action();
  }, [hasUnsavedChanges]);

  const handleVersionPointClick = useCallback((version) => {
    if (!version || version.id === activeVersionId) {
      setHistoryAnchor(null);
      return;
    }

    const action = () => loadVersionIntoEditor(version);
    setHistoryAnchor(null);
    runOrQueueNavigation(action);
  }, [activeVersionId, loadVersionIntoEditor, runOrQueueNavigation]);

  const handleReturnToLatest = useCallback(() => {
    if (!latestVersionId) {
      return;
    }

    const latestVersion = versions.find((version) => version.id === latestVersionId);
    if (!latestVersion) {
      return;
    }

    const action = () => loadVersionIntoEditor(latestVersion);
    setHistoryAnchor(null);
    runOrQueueNavigation(action);
  }, [latestVersionId, loadVersionIntoEditor, runOrQueueNavigation, versions]);

  const openRestoreConfirmation = useCallback(() => {
    setRestoreTargets(newerVersionsRelativeToActive);
    setRestoreDialogOpen(true);
  }, [newerVersionsRelativeToActive]);

  const closeRestoreConfirmation = useCallback(() => {
    setRestoreDialogOpen(false);
  }, []);

  const confirmRestore = useCallback(() => {
    setRestoreDialogOpen(false);
    handleReturnToLatest();
  }, [handleReturnToLatest]);

  // Check local history for undo/redo availability
  const currentHistory = editorMode === 'structure' ? structureHistory : detailHistory;
  const canUndoLocal = currentHistory?.past?.length > 0;
  const canRedoLocal = currentHistory?.future?.length > 0;

  const describeHistoryEntry = (meta) => {
    if (!meta) {
      return '';
    }
    if (meta.description && meta.description.trim()) {
      return meta.description.trim();
    }
    if (meta.actionType) {
      return meta.actionType.replace(/_/g, ' ');
    }
    return '';
  };

  const nextUndoMeta = canUndoLocal ? currentHistory?.past?.[currentHistory.past.length - 1]?.meta : null;
  const nextRedoMeta = canRedoLocal ? currentHistory?.future?.[currentHistory.future.length - 1]?.meta : null;

  const undoActionText = describeHistoryEntry(nextUndoMeta);
  const redoActionText = describeHistoryEntry(nextRedoMeta);

  const undoTooltip = canUndoLocal
    ? `Cofnij: ${undoActionText || 'ostatnia zmiana'} (Ctrl+Z)`
    : 'Brak zmian do cofnięcia';
  const redoTooltip = canRedoLocal
    ? `Przywróć: ${redoActionText || 'ostatnia zmiana'} (Ctrl+Y)`
    : 'Brak zmian do przywrócenia';

  const lastSaveTimestamp = useMemo(() => {
    if (!lastSavedAt) {
      return 0;
    }
    const parsed = new Date(lastSavedAt).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [lastSavedAt]);

  const collectUnsavedHistoryEntries = useCallback(() => {
    const filterEntries = (historyStack) => {
      return (historyStack?.past || []).filter((entry) => {
        const entryTimestamp = entry?.meta?.timestamp ?? 0;
        return entryTimestamp > lastSaveTimestamp;
      });
    };

    const combined = [
      ...filterEntries(structureHistory),
      ...filterEntries(detailHistory)
    ];

    return combined.sort((a, b) => (a?.meta?.timestamp || 0) - (b?.meta?.timestamp || 0));
  }, [detailHistory, lastSaveTimestamp, structureHistory]);

  const collectChangeDescriptions = useCallback(() => {
    const entries = collectUnsavedHistoryEntries();
    if (!entries.length) {
      return [FALLBACK_CHANGE_DESCRIPTION];
    }

    const seen = new Set();
    const uniqueChanges = [];

    entries.forEach((entry) => {
      const rawDescription = describeHistoryEntry(entry?.meta) || '';
      const formatted = capitalizeSentence(rawDescription);
      if (!formatted) {
        return;
      }
      const fingerprint = formatted.toLowerCase();
      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        uniqueChanges.push(formatted);
      }
    });

    if (!uniqueChanges.length) {
      uniqueChanges.push(FALLBACK_CHANGE_DESCRIPTION);
    }

    return uniqueChanges.slice(-MAX_CHANGE_BULLETS);
  }, [collectUnsavedHistoryEntries]);

  const selectedPage = getSelectedPage();
  const savedStatusText = isSaving
    ? 'Saving...'
    : hasUnsavedChanges
      ? 'Unsaved changes'
      : lastSavedAt
        ? `Saved ${formatRelativeTime(lastSavedAt)}`
        : 'Never saved';
  const undoLabel = canUndoLocal ? 'Cofnij (Ctrl+Z)' : 'Cofnij';
  const redoLabel = canRedoLocal ? 'Przywróć (Ctrl+Y)' : 'Przywróć';

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

  // Update titleValue when siteName changes (after loading from API)
  useEffect(() => {
    setTitleValue(siteName);
  }, [siteName]);

  useEffect(() => {
    return () => {};
  }, []);

  useEffect(() => {
    if (historyAnchor) {
      hydrateVersions();
    }
  }, [historyAnchor, hydrateVersions]);

  const performSave = useCallback(async () => {
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
      let finalConfig = JSON.parse(JSON.stringify(site));

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

      const uploadPromises = Array.from(allBlobUrls).map(async (blobUrl) => {
        let file = null;
        let thumbnailFile = null;

        if (isTempBlobUrl(blobUrl)) {
          const files = await retrieveTempImageWithThumbnail(blobUrl);
          file = files.full;
          thumbnailFile = files.thumbnail;
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
          return { tempUrl: blobUrl, finalUrl: blobUrl, thumbnailUrl: null, failed: true };
        }

        const formData = new FormData();
        formData.append('file', file);
        if (thumbnailFile) {
          formData.append('thumbnail', thumbnailFile);
        }
        formData.append('usage', 'site_content');
        if (siteId) {
          formData.append('site_id', siteId);
        }

        const response = await apiClient.post('/upload/', formData, {
          headers: {
            'Content-Type': undefined
          }
        });

        const uploadedUrl = response?.data?.url;
        const thumbnailUrl = response?.data?.thumbnailUrl || null;
        if (!uploadedUrl) {
          return { tempUrl: blobUrl, finalUrl: blobUrl, thumbnailUrl: null, failed: true };
        }

        return { tempUrl: blobUrl, finalUrl: uploadedUrl, thumbnailUrl, failed: false };
      });

      const results = await Promise.all(uploadPromises);
      const failedUploads = results.filter((result) => result.failed);

      if (failedUploads.length > 0) {
        addToast('Failed to upload some images. Please try again.', { variant: 'error' });
        return;
      }

      const urlMap = new Map(results.map((r) => [r.tempUrl, r.finalUrl]));
      
      // Build thumbnail map: fullUrl -> thumbnailUrl
      const thumbnailMap = {};
      results.forEach((r) => {
        if (r.finalUrl && r.thumbnailUrl) {
          thumbnailMap[r.finalUrl] = r.thumbnailUrl;
        }
      });

      if (urlMap.size > 0) {
        let configString = JSON.stringify(finalConfig);
        urlMap.forEach((finalUrl, tempUrl) => {
          const escapedTempUrl = tempUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedTempUrl, 'g');
          configString = configString.replace(regex, finalUrl);
        });
        finalConfig = JSON.parse(configString);
      }
      
      // Merge new thumbnails with existing ones
      const existingThumbnails = finalConfig._thumbnails || {};
      finalConfig._thumbnails = { ...existingThumbnails, ...thumbnailMap };

      await updateSiteTemplate(siteId, finalConfig, trimmedName);

      const changeDescriptions = collectChangeDescriptions();
      const titleVariants = buildTitleVariantsFromChanges(changeDescriptions);
      const changeSummary = changeDescriptions.join(' • ');
      let versionResponse = null;

      try {
        const branchMeta = determineBranchForSave();
        const notesPayload = {
          title: titleVariants.full,
          shortTitle: titleVariants.short,
          changeList: changeDescriptions,
          branchId: branchMeta.branchId,
          branchColor: branchMeta.branchColor,
          parentId: branchMeta.parentId,
          basedOnVersionId: branchMeta.parentId,
          createdFromVersionNumber:
            versions.find((entry) => entry.id === branchMeta.parentId)?.version_number ?? null
        };

        versionResponse = await createSiteVersion(siteId, {
          template_config: finalConfig,
          change_summary: changeSummary,
          notes: JSON.stringify(notesPayload)
        });
      } catch (versionError) {
      }

      if (urlMap.size > 0) {
        useNewEditorStore.setState((state) => {
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
        const normalizedVersion = normalizeVersion({
          ...versionResponse,
          template_config: versionResponse.template_config || finalConfig
        });
        setVersions((prev = []) => {
          const filtered = prev.filter((entry) => entry.id !== normalizedVersion.id);
          const next = sortVersionsAscending([...filtered, normalizedVersion]);
          const latest = next[next.length - 1] || null;
          setLatestVersionId(latest?.id || null);
          setActiveVersionId(normalizedVersion.id);
          return next;
        });
        markAsSaved({ version: versionResponse });
      } else {
        markAsSaved({ lastSavedAt: new Date().toISOString() });
      }

      addToast('Site saved successfully.', { variant: 'success' });
      runPostSaveAction();
    } catch (error) {
      addToast('Failed to save site. Please try again.', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [
    addToast,
    collectChangeDescriptions,
    determineBranchForSave,
    hasUnsavedChanges,
    isSaving,
    markAsSaved,
    normalizeVersion,
    runPostSaveAction,
    site,
    siteId,
    siteName,
    sortVersionsAscending,
    versions
  ]);

  const requestSaveFlow = useCallback(
    (options = {}) => {
      if (isSaving) {
        return;
      }

      if (!hasUnsavedChanges) {
        addToast('Brak zmian do zapisania', { variant: 'info' });
        return;
      }

      setPostSaveAction(options.onSuccess || null);
      performSave();
    },
    [addToast, hasUnsavedChanges, isSaving, performSave, setPostSaveAction]
  );

  const handleDiscardPendingNavigation = useCallback(() => {
    setUnsavedDialogOpen(false);
    if (pendingNavigation) {
      const action = pendingNavigation;
      setPendingNavigation(null);
      action();
    }
  }, [pendingNavigation]);

  const handleSavePendingNavigation = useCallback(() => {
    setUnsavedDialogOpen(false);
    if (pendingNavigation) {
      const action = pendingNavigation;
      setPendingNavigation(null);
      requestSaveFlow({ onSuccess: action });
    }
  }, [pendingNavigation, requestSaveFlow]);

  // Keyboard shortcuts for undo/redo and save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndoLocal) {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        if (canRedoLocal) {
          redo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        requestSaveFlow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canRedoLocal, canUndoLocal, redo, requestSaveFlow, undo]);

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

  const handlePublish = async () => {
    if (!siteId) {
      addToast('Nie można opublikować - brak ID strony', { variant: 'error' });
      return;
    }

    if (hasUnsavedChanges) {
      addToast('Zapisz zmiany przed publikacją', { variant: 'warning' });
      return;
    }

    try {
      const result = await publishSite(siteId);
      addToast(
        `Strona opublikowana: ${result.subdomain}`,
        { variant: 'success' }
      );
      
      // Reload site to get updated publication status
      if (loadSite) {
        await loadSite(siteId);
      }
    } catch (error) {
      console.error('Publish error:', error);
      addToast(
        error.response?.data?.error || 'Nie udało się opublikować strony',
        { variant: 'error' }
      );
    }
  };

  const handleGoBack = useCallback(() => {
    runOrQueueNavigation(() => {
      window.location.href = '/studio/sites';
    });
  }, [runOrQueueNavigation]);

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

  const isViewingLatest = !latestVersionId || activeVersionId === latestVersionId;

  return (
    <>
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

        <Tooltip title="Historia">
          <ButtonBase
            onClick={(event) => setHistoryAnchor(event.currentTarget)}
            sx={{
              px: 1,
              py: 0.75,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: historyAnchor ? hoverSurface : baseSurface,
              color: textPrimary,
              '&:hover': {
                bgcolor: hoverSurface
              }
            }}
          >
            <MenuIcon sx={{ fontSize: 18 }} />
            {!isMobile && (
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Historia
              </Typography>
            )}
          </ButtonBase>
        </Tooltip>

        {/* Save Button */}
        <Tooltip title={hasUnsavedChanges ? 'Save changes (Ctrl+S)' : 'No changes to save'}>
          <Box
            onClick={() => {
              if (!isSaving && hasUnsavedChanges) {
                requestSaveFlow();
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

      <Popover
        open={Boolean(historyAnchor)}
        anchorEl={historyAnchor}
        onClose={() => setHistoryAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: {
            bgcolor: topBarBg,
            borderRadius: '16px',
            border: `1px solid ${dividerColor}`,
            minWidth: 360,
            maxWidth: 420
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: textPrimary, fontWeight: 600 }}>
                Historia wersji
              </Typography>
              <Typography variant="caption" sx={{ color: textHint }}>
                Kliknij punkt, aby załadować daną wersję
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setHistoryAnchor(null)}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 2, borderColor: dividerColor }} />

          {historyError && (
            <Typography variant="caption" sx={{ color: interactiveMain }}>
              {historyError}
            </Typography>
          )}

          <Box sx={{ mt: 2, maxHeight: 320, overflowY: 'auto', pr: 1 }}>
            {versionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={20} sx={{ color: interactiveMain }} />
              </Box>
            ) : timelineEntries.length ? (
              <Stack
                direction="column"
                spacing={1.25}
                sx={{ width: '100%', minHeight: 260, position: 'relative', zIndex: 1, pb: 1 }}
              >
                {timelineEntries.map((version, index) => {
                  const branchColor = assignBranchColor('main');
                  const versionLabel = version?.metadata?.title || version.displayTitle || `v${version.version_number}`;
                  const shortHoverTitle = version?.metadata?.shortTitle || truncateWords(versionLabel, SHORT_TITLE_MAX_WORDS);
                  const versionDate = version.created_at ? new Date(version.created_at).toLocaleString() : '';
                  const tooltipChanges = (version?.metadata?.changeList || [versionLabel]).slice(0, MAX_CHANGE_BULLETS);
                  const isActiveVersion = version.id === activeVersionId;
                  const isLatestVersion = version.id === latestVersionId;
                  const isOrigin = Boolean(version.isOrigin);
                  const isFutureComparedToActive =
                    (currentVersionNumber ?? 0) < (version.version_number ?? 0);
                  const showConnectorUp = index > 0;
                  const showConnectorDown = index < timelineEntries.length - 1;
                  const relativeTimeLabel = version.created_at ? formatRelativeTime(version.created_at) : '';

                  const tooltipTitle = isOrigin ? null : (
                    <Stack spacing={0.5} sx={{ minWidth: 180 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: textPrimary }}>
                        {shortHoverTitle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: textHint }}>
                        {versionDate}
                      </Typography>
                      <Stack spacing={0.25}>
                        {tooltipChanges.map((changeText, changeIndex) => (
                          <Typography
                            key={`${version.id}-tooltip-${changeIndex}`}
                            variant="caption"
                            sx={{ color: textPrimary }}
                          >
                            • {changeText}
                          </Typography>
                        ))}
                      </Stack>
                    </Stack>
                  );

                  const point = (
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: `1px solid ${alpha(branchColor, isOrigin ? 0.4 : 0.9)}`,
                        backgroundColor: isOrigin
                          ? alpha(branchColor, 0.15)
                          : isActiveVersion
                            ? branchColor
                            : isFutureComparedToActive
                              ? baseSurface
                              : alpha(branchColor, 0.25),
                        boxShadow: isActiveVersion
                          ? `0 0 0 6px ${alpha(branchColor, 0.18)}`
                          : 'none',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                    />
                  );

                  return (
                    <Box
                      key={version.id}
                      sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                        alignItems: 'center',
                        columnGap: 1.25,
                        pr: 1
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          textAlign: 'right',
                          color: textHint,
                          pr: 0.5
                        }}
                      >
                        {relativeTimeLabel}
                      </Typography>
                      <Box
                        sx={{
                          position: 'relative',
                          width: 32,
                          minHeight: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            bottom: '50%',
                            width: '2px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: `linear-gradient(180deg, ${alpha(branchColor, 0.12)} 0%, ${alpha(branchColor, 0.35)} 100%)`,
                            opacity: showConnectorUp ? 1 : 0
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            bottom: 0,
                            width: '2px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: `linear-gradient(180deg, ${alpha(branchColor, 0.35)} 0%, ${alpha(branchColor, 0.08)} 100%)`,
                            opacity: showConnectorDown ? 1 : 0
                          }
                        }}
                      >
                        {isOrigin ? (
                          point
                        ) : (
                          <Tooltip title={tooltipTitle} placement="top">
                            <ButtonBase onClick={() => handleVersionPointClick(version)}>
                              {point}
                            </ButtonBase>
                          </Tooltip>
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isOrigin ? textHint : textPrimary,
                          fontWeight: isActiveVersion ? 600 : 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {versionLabel}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Typography variant="body2" align="center" sx={{ color: textHint }}>
                Brak zapisanych wersji
              </Typography>
            )}
          </Box>

          {latestVersionId && newerVersionsRelativeToActive.length > 0 && (
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={openRestoreConfirmation}
            >
              Powrót do wersji {latestVersionLabel}
            </Button>
          )}
        </Box>
      </Popover>

      <Dialog
        open={unsavedDialogOpen}
        onClose={() => {
          setUnsavedDialogOpen(false);
          setPendingNavigation(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Masz niezapisane zmiany</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Zapisz zmiany przed opuszczeniem edytora lub odrzuć je, aby kontynuować bez zapisu.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDiscardPendingNavigation} color="inherit">
            Odrzuć
          </Button>
          <Button onClick={handleSavePendingNavigation} variant="contained" autoFocus>
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={restoreDialogOpen}
        onClose={closeRestoreConfirmation}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Powrót do wersji {latestVersionLabel}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              Przywrócenie tej wersji usunie wszystkie zmiany zapisane po bieżącej. Te wersje zostaną zastąpione:
            </Typography>
            <Stack spacing={0.5} sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {restoreTargets.length ? (
                restoreTargets.map((version) => (
                  <Box
                    key={`restore-${version.id}`}
                    sx={{
                      p: 1,
                      borderRadius: '8px',
                      border: `1px solid ${dividerColor}`,
                      bgcolor: alpha(baseSurface, 0.4)
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: textPrimary, fontWeight: 600 }}>
                      {version?.metadata?.title || version.displayTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: textHint }}>
                      {new Date(version.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: textHint }}>
                  Brak nowszych zapisów.
                </Typography>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRestoreConfirmation} color="inherit">
            Anuluj
          </Button>
          <Button onClick={confirmRestore} variant="contained" color="error">
            Usuń zmiany i wróć
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(EditorTopBar);
