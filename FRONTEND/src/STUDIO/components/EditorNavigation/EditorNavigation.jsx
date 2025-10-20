import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Divider,
    FormControlLabel,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    DesktopWindows as DesktopWindowsIcon,
    MoreVert as MoreVertIcon,
    PhoneIphone as PhoneIphoneIcon,
    Publish as PublishIcon,
    Redo as RedoIcon,
    Save as SaveIcon,
    Undo as UndoIcon,
    WarningAmberRounded as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useEditorStore from '../../store/editorStore';
import { createSite, renameSite, updateSiteTemplate } from '../../../services/siteService';
import apiClient from '../../../services/apiClient';
import useNavigationBlocker, { BLOCK_STATES } from '../../../hooks/useNavigationBlocker';

const EditorNavigation = ({ siteId, siteName, isNewSite, disabled }) => {
    const {
        expertMode,
        setExpertMode,
        templateConfig,
        saveVersion,
        exportTemplate,
        importTemplate,
        animations,
        setAnimations,
        setSiteMeta,
        undoVersion,
        redoVersion,
        previewDevice,
        setPreviewDevice,
        mode,
        setMode,
        history,
        currentVersion,
        hasUnsavedChanges,
        setHasUnsavedChanges
    } = useEditorStore();

    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [status, setStatus] = useState(null);
    const [saving, setSaving] = useState(false);
    const [nameSaving, setNameSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [exitDialogOpen, setExitDialogOpen] = useState(false);
    const blocker = useNavigationBlocker(hasUnsavedChanges && !saving && !nameSaving && !disabled);
    const originalName = useMemo(() => siteName || '', [siteName]);
    const [nameDraft, setNameDraft] = useState(originalName);

    const menuOpen = Boolean(anchorEl);

    useEffect(() => {
        setNameDraft(originalName);
    }, [originalName]);

    const canUndo = useMemo(() => currentVersion > 0, [currentVersion]);
    const canRedo = useMemo(
        () => currentVersion >= 0 && currentVersion < history.length - 1,
        [currentVersion, history.length]
    );

    const isNameDirty = useMemo(() => nameDraft.trim() !== originalName.trim(), [nameDraft, originalName]);
    const nameFieldWidth = useMemo(() => {
        const length = nameDraft.trim().length || 10;
        const clamped = Math.min(48, Math.max(16, length + 4));
        return `${clamped}ch`;
    }, [nameDraft]);
    const canCommitName = useMemo(
        () => isNameDirty && nameDraft.trim().length > 0 && !nameSaving,
        [isNameDirty, nameDraft, nameSaving]
    );

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        if (blocker.state === BLOCK_STATES.BLOCKED) {
            setExitDialogOpen(true);
        }
        if ((blocker.state === BLOCK_STATES.UNBLOCKED || blocker.state === BLOCK_STATES.PROCEEDING) && exitDialogOpen) {
            setExitDialogOpen(false);
        }
    }, [blocker.state, exitDialogOpen]);

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    importTemplate(e.target.result);
                    setStatus({ type: 'success', message: 'Szablon importowany pomyślnie.' });
                } catch (error) {
                    setStatus({ type: 'error', message: 'Nie udało się zaimportować pliku JSON.' });
                }
            };
            reader.readAsText(file);
        };
        input.click();
        handleMenuClose();
    };

    const handleExport = () => {
        try {
            const jsonString = exportTemplate();
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${(siteName || 'studio').toLowerCase().replace(/\s+/g, '-')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setStatus({ type: 'success', message: 'Szablon wyeksportowany jako JSON.' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Nie udało się wyeksportować szablonu.' });
        }
        handleMenuClose();
    };

    const handleNameChange = (event) => {
        const { value } = event.target;
        setNameDraft(value);
    };

    const handleCommitName = useCallback(async () => {
        if (nameSaving) {
            return;
        }
        const trimmedName = nameDraft.trim();
        if (!trimmedName) {
            setStatus({ type: 'error', message: 'Nazwa strony nie może być pusta.' });
            return;
        }

        if (!isNameDirty) {
            return;
        }

        if (!siteId) {
            setSiteMeta({ id: null, name: trimmedName });
            setNameDraft(trimmedName);
            setHasUnsavedChanges(true);
            setStatus({
                type: 'info',
                message: 'Zmieniono nazwę roboczą. Zapisz stronę, aby ją utworzyć.'
            });
            return;
        }

        try {
            setNameSaving(true);
            const updated = await renameSite(siteId, trimmedName);
            setSiteMeta({ id: updated.id, name: updated.name });
            setNameDraft(trimmedName);
            setStatus({ type: 'success', message: 'Nazwa strony została zapisana.' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Nie udało się zapisać nowej nazwy.' });
        } finally {
            setNameSaving(false);
        }
    }, [isNameDirty, nameDraft, nameSaving, setHasUnsavedChanges, setNameSaving, setSiteMeta, setStatus, siteId]);

    const handleRevertName = () => {
        setNameDraft(originalName);
        setStatus(null);
    };

    const handleNameBlur = () => {
        if (isNameDirty && !nameSaving) {
            handleCommitName().catch(() => undefined);
        }
    };

    const handleNameKeyDown = (event) => {
        if (nameSaving) {
            event.preventDefault();
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            handleCommitName().catch(() => undefined);
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            handleRevertName();
        }
    };

    const handleSave = useCallback(async ({ redirectToEditor = true } = {}) => {
        const trimmedName = nameDraft.trim();

        if (!trimmedName) {
            setStatus({ type: 'error', message: 'Podaj nazwę strony przed zapisaniem.' });
            return false;
        }

        try {
            setSaving(true);
            let resultingId = siteId;
            if (!siteId) {
                const created = await createSite({
                    name: trimmedName,
                    template_config: templateConfig
                });
                resultingId = created.id;
                setSiteMeta({ id: created.id, name: created.name });
                setStatus({ type: 'success', message: 'Nowa strona została zapisana.' });
                saveVersion();
                setHasUnsavedChanges(false);
                if (redirectToEditor) {
                    navigate(`/studio/editor/${created.id}`, { replace: true });
                }
                return resultingId;
            }

            await updateSiteTemplate(siteId, templateConfig, trimmedName);
            setSiteMeta({ id: siteId, name: trimmedName });
            setStatus({ type: 'success', message: 'Zmiany zapisane.' });
            saveVersion();
            setHasUnsavedChanges(false);
            return resultingId;
        } catch (error) {
            setStatus({ type: 'error', message: 'Nie udało się zapisać zmian.' });
            return false;
        } finally {
            setSaving(false);
        }
    }, [navigate, nameDraft, saveVersion, setHasUnsavedChanges, setSiteMeta, siteId, templateConfig]);

    const handlePublish = async () => {
        if (!siteId) {
            setStatus({ type: 'error', message: 'You must save the site first before publishing.' });
            return;
        }

        await handleSave();

        setIsPublishing(true);
        setStatus({ type: 'info', message: 'Publishing process initiated...' });
        try {
            await apiClient.post(`/sites/${siteId}/publish/`);
            setStatus({
                type: 'success',
                message: 'Publish command sent successfully! Your site will be live shortly.'
            });
        } catch (error) {
            console.error('Publish failed:', error);
            setStatus({ type: 'error', message: 'Failed to publish site. Please check the console and try again.' });
        } finally {
            setIsPublishing(false);
        }
    };

    const attemptExit = () => {
        if (disabled || saving || nameSaving) {
            return;
        }
        navigate('/studio/sites');
    };

    const handleExitWithoutSaving = () => {
        if (blocker.state === BLOCK_STATES.BLOCKED) {
            setExitDialogOpen(false);
            blocker.proceed();
            return;
        }
        setExitDialogOpen(false);
        navigate('/studio/sites');
    };

    const handleCancelExit = () => {
        if (blocker.state === BLOCK_STATES.BLOCKED) {
            blocker.reset();
        }
        setExitDialogOpen(false);
    };

    const handleSaveAndExit = async () => {
        const saved = await handleSave({ redirectToEditor: false });
        if (!saved) {
            return;
        }
        if (blocker.state === BLOCK_STATES.BLOCKED) {
            setExitDialogOpen(false);
            blocker.proceed();
            return;
        }
        setExitDialogOpen(false);
        navigate('/studio/sites');
    };

    const animationLabel = useMemo(() => {
        if (!animations.enabled) {
            return 'Animacje wyłączone';
        }
        const styles = {
            smooth: 'Płynne przejścia',
            fade: 'Zanikanie',
            slide: 'Przesunięcie'
        };
        return styles[animations.style] || 'Własne animacje';
    }, [animations]);

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 0,
                    px: { xs: 2, md: 4 },
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper'
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                        <Tooltip title="Wróć do panelu Studio">
                            <span>
                                <IconButton onClick={attemptExit} disabled={saving || nameSaving || disabled}>
                                    <ArrowBackIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                value={nameDraft}
                                onChange={handleNameChange}
                                onBlur={handleNameBlur}
                                onKeyDown={handleNameKeyDown}
                                placeholder="Nazwa projektu"
                                variant="outlined"
                                size="small"
                                disabled={nameSaving || disabled}
                                sx={{
                                    width: nameFieldWidth,
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: { xs: 18, md: 20 },
                                        fontWeight: 600,
                                        borderRadius: 1,
                                        backgroundColor: (theme) => theme.palette.action.hover,
                                        transition: (theme) => theme.transitions.create(['box-shadow', 'background-color'], {
                                            duration: theme.transitions.duration.shortest
                                        }),
                                        '& fieldset': {
                                            borderColor: 'transparent'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: (theme) => theme.palette.primary.light,
                                            opacity: 0.4
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: (theme) => theme.palette.primary.main
                                        }
                                    }
                                }}
                            />
                            <Collapse
                                in={isNameDirty}
                                orientation="horizontal"
                                unmountOnExit
                                mountOnEnter
                                timeout={200}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        backgroundColor: (theme) => (theme.palette.mode === 'light'
                                            ? theme.palette.grey[200]
                                            : theme.palette.grey[800]),
                                        boxShadow: (theme) => theme.shadows[1]
                                    }}
                                >
                                    {nameSaving ? (
                                        <CircularProgress size={16} thickness={6} />
                                    ) : (
                                        <>
                                            <Tooltip title="Zapisz nową nazwę">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleCommitName().catch(() => undefined)}
                                                        disabled={!canCommitName}
                                                    >
                                                        <CheckIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Odrzuć zmiany">
                                                <IconButton size="small" color="inherit" onClick={handleRevertName}>
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </Box>
                            </Collapse>
                        </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    color="secondary"
                                    checked={expertMode}
                                    onChange={(event) => setExpertMode(event.target.checked)}
                                />
                            )}
                            label="Tryb ekspercki"
                        />

                        <Tooltip title="Cofnij do poprzedniej zapisanej wersji">
                            <span>
                                <IconButton onClick={undoVersion} disabled={!canUndo}>
                                    <UndoIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Przywróć następną wersję">
                            <span>
                                <IconButton onClick={redoVersion} disabled={!canRedo}>
                                    <RedoIcon />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <ToggleButtonGroup
                            size="small"
                            value={previewDevice}
                            exclusive
                            onChange={(_, value) => value && setPreviewDevice(value)}
                            sx={{ borderRadius: 2, overflow: 'hidden' }}
                        >
                            <ToggleButton value="desktop">
                                <DesktopWindowsIcon fontSize="small" />
                            </ToggleButton>
                            <ToggleButton value="mobile">
                                <PhoneIphoneIcon fontSize="small" />
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Tooltip title="Zapisz zmiany">
                            <span>
                                <Button
                                    variant="outlined"
                                    startIcon={<SaveIcon />}
                                    onClick={() => handleSave()}
                                    disabled={disabled || saving || nameSaving}
                                >
                                    Zapisz
                                </Button>
                            </span>
                        </Tooltip>
                        <Tooltip title="Publish site">
                            <span>
                                <Button
                                    variant="contained"
                                    startIcon={isPublishing ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        <PublishIcon />
                                    )}
                                    onClick={handlePublish}
                                    disabled={disabled || saving || nameSaving || isPublishing || !siteId}
                                >
                                    {isPublishing ? 'Publishing' : 'Publish'}
                                </Button>
                            </span>
                        </Tooltip>

                        <Tooltip title="Więcej opcji">
                            <IconButton onClick={handleMenuOpen}>
                                <MoreVertIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Paper>

            {status && (
                <Box sx={{ px: { xs: 2, md: 4 }, pt: 1 }}>
                    <Alert severity={status.type} onClose={() => setStatus(null)}>
                        {status.message}
                    </Alert>
                </Box>
            )}

            <Dialog
                open={exitDialogOpen}
                onClose={handleCancelExit}
                fullWidth
                maxWidth="xs"
                aria-labelledby="unsaved-changes-title"
            >
                <DialogTitle id="unsaved-changes-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="warning" />
                    Czy chcesz opuścić edytor?
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        Wykryliśmy niezapisane zmiany.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Zapisz aktualną wersję, aby zachować konfigurację, lub kontynuuj bez zapisywania. Możesz też
                        wrócić do edycji i kontynuować pracę.
                    </Typography>
                </DialogContent>
                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        gap: 1
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={handleSaveAndExit}
                        disabled={saving || nameSaving}
                        fullWidth
                    >
                        Zapisz i wróć do Studio
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleExitWithoutSaving}
                        disabled={saving || nameSaving}
                        fullWidth
                    >
                        Opuść bez zapisu
                    </Button>
                    <Button onClick={handleCancelExit} disabled={saving || nameSaving} fullWidth>
                        Kontynuuj edycję
                    </Button>
                </DialogActions>
            </Dialog>

            <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose} keepMounted>
                <Box sx={{ px: 2, py: 1.5, minWidth: 320 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                        Tryb pracy
                    </Typography>
                    <MenuItem
                        onClick={() => {
                            setMode(mode === 'edit' ? 'preview' : 'edit');
                            handleMenuClose();
                        }}
                    >
                        {mode === 'edit' ? 'Przełącz na podgląd' : 'Wróć do edycji'}
                    </MenuItem>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                        Animacje
                    </Typography>
                    <MenuItem
                        onClick={() => {
                            setAnimations({ enabled: !animations.enabled });
                            handleMenuClose();
                        }}
                    >
                        {animations.enabled ? 'Wyłącz animacje' : 'Włącz animacje'}
                    </MenuItem>
                    {animations.enabled && (
                        <Stack spacing={1} sx={{ pl: 1, pt: 1 }}>
                            <Button
                                size="small"
                                variant={animations.style === 'smooth' ? 'contained' : 'text'}
                                onClick={() => setAnimations({ style: 'smooth' })}
                            >
                                Płynne przejścia
                            </Button>
                            <Button
                                size="small"
                                variant={animations.style === 'fade' ? 'contained' : 'text'}
                                onClick={() => setAnimations({ style: 'fade' })}
                            >
                                Zanikanie
                            </Button>
                            <Button
                                size="small"
                                variant={animations.style === 'slide' ? 'contained' : 'text'}
                                onClick={() => setAnimations({ style: 'slide' })}
                            >
                                Przesunięcie
                            </Button>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {animationLabel}
                            </Typography>
                        </Stack>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                        Narzędzia
                    </Typography>
                    <MenuItem onClick={handleExport}>Eksportuj konfigurację</MenuItem>
                    <MenuItem onClick={handleImport}>Importuj z pliku</MenuItem>

                </Box>
            </Menu>
        </>
    );
};

export default EditorNavigation;
