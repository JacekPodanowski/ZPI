import React, { useState } from 'react';
import { Box, Typography, IconButton, useTheme, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { Add as AddIcon, Delete as DeleteIcon, ChevronRight, ExpandMore, Remove as RemoveIcon } from '@mui/icons-material';
import DayTemplate from './DayTemplate';
import WeekTemplate from './WeekTemplate';
import Logo from '../../../../components/Logo/Logo';
import { getSiteColorHex } from '../../../../theme/siteColors';
import TemplateDeletionModal from './TemplateDeletionModal';


//orginal color  rgba(228, 229, 218, 0.5)

const RealTemplateBrowser = ({ 
    templates = [],
    sites = [],
    onCreateDayTemplate, 
    onCreateWeekTemplate, 
    onTemplateDragStart, 
    onTemplateDragEnd,
    creatingTemplateMode, // NEW: 'day' | 'week' | null
    onCancelTemplateCreation, // NEW: callback to cancel template creation
    onTemplatesRefresh // NEW: callback to refresh templates after deletion
}) => {
    const theme = useTheme();
    const templateLibraryWidth = 230; // Fixed width for templates-only mode
    const [draggingTemplate, setDraggingTemplate] = useState(null);
    const [dayTemplatesExpanded, setDayTemplatesExpanded] = useState(true);
    const [weekTemplatesExpanded, setWeekTemplatesExpanded] = useState(true);
    const [isOverTrash, setIsOverTrash] = useState(false); // Track if dragging over trash
    
    // Deletion modal state
    const [deletionModalOpen, setDeletionModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    const handleTemplateDragStart = (template) => {
        setDraggingTemplate(template);
        onTemplateDragStart?.(template); // Notify parent
    };

    const handleTemplateDragEnd = () => {
        setDraggingTemplate(null);
        onTemplateDragEnd?.(); // Notify parent
    };

    // Separate templates by type and transform to expected format
    const dayTemplates = templates
        .filter(t => t.template_config?.template_type === 'day')
        .map(t => ({
            id: t.id,
            name: t.name,
            day_abbreviation: t.template_config?.day_abbreviation || '—',
            events: t.template_config?.events || [],
            availability_blocks: t.template_config?.availability_blocks || [],
            template_config: t.template_config
        }));
    
    const weekTemplates = templates
        .filter(t => t.template_config?.template_type === 'week')
        .map(t => ({
            id: t.id,
            name: t.name,
            day_count: t.template_config?.day_count || 0,
            active_days: t.template_config?.active_days || [],
            total_events: t.template_config?.total_events || 0,
            total_availability_blocks: t.template_config?.total_availability_blocks || 0,
            template_config: t.template_config
        }));

    return (
        <motion.div
            initial={{ width: templateLibraryWidth }}
            animate={{ width: templateLibraryWidth }}
            style={{
                width: templateLibraryWidth,
                height: '100%',
                borderRight: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.semantic?.colors?.bg?.subtle || theme.palette.background.paper,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <Box
                sx={{
                    px: { xs: 2, md: 2.5 },
                    py: { xs: 1.5, md: 2.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden', // Prevent scroll from content
                    position: 'relative' // For absolute trash zone positioning
                }}
            >
                {/* Header with Sessions Logo */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <Logo 
                        text="Templates" 
                        size="small" 
                        variant="default"
                        align="center"
                    />
                </Box>

                {/* Templates Section */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        gap: 2.5,
                        overflow: 'visible'
                    }}
                >
                    {/* Day Templates Section */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.25,
                            flex: dayTemplatesExpanded ? (draggingTemplate ? 0.8 : 1) : 0,
                            minHeight: 0,
                            transition: 'flex 300ms ease'
                        }}
                    >
                        {/* Header with collapse button and + icon */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                flexShrink: 0
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={() => setDayTemplatesExpanded(!dayTemplatesExpanded)}
                                sx={{
                                    p: 0,
                                    width: 20,
                                    height: 20,
                                    color: 'text.secondary',
                                    transition: 'transform 200ms ease'
                                }}
                            >
                                {dayTemplatesExpanded ? (
                                    <ExpandMore sx={{ fontSize: 18 }} />
                                ) : (
                                    <ChevronRight sx={{ fontSize: 18 }} />
                                )}
                            </IconButton>
                            <Typography
                                variant="subtitle2"
                                onClick={() => setDayTemplatesExpanded(!dayTemplatesExpanded)}
                                sx={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: 600, 
                                    color: 'text.secondary', 
                                    flex: 1,
                                    textAlign: 'left',
                                    letterSpacing: '0.02em',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                            >
                                Szablony dnia
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={creatingTemplateMode === 'day' ? onCancelTemplateCreation : onCreateDayTemplate}
                                sx={{
                                    p: 0.5,
                                    width: 24,
                                    height: 24,
                                    color: creatingTemplateMode === 'day' ? 'error.main' : 'primary.main',
                                    '&:hover': {
                                        backgroundColor: creatingTemplateMode === 'day'
                                            ? 'rgba(211, 47, 47, 0.08)'
                                            : theme.palette.mode === 'dark'
                                            ? 'rgba(114, 0, 21, 0.15)'
                                            : 'rgba(146, 0, 32, 0.08)'
                                    }
                                }}
                            >
                                {creatingTemplateMode === 'day' ? (
                                    <RemoveIcon sx={{ fontSize: 16 }} />
                                ) : (
                                    <AddIcon sx={{ fontSize: 16 }} />
                                )}
                            </IconButton>
                        </Box>

                        <AnimatePresence mode="wait">
                            {dayTemplatesExpanded && (
                                <motion.div
                                    key={creatingTemplateMode === 'day' ? 'creating' : 'templates'}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, position: 'relative' }}
                                >
                                    {creatingTemplateMode === 'day' ? (
                                        <Box
                                            sx={{
                                                p: 1.25,
                                                borderRadius: 2,
                                                backgroundColor: theme.palette.mode === 'dark' 
                                                    ? 'rgba(228, 229, 218, 0.05)' 
                                                    : 'rgba(228, 229, 218, 0.7)',
                                                border: '1px solid rgba(146, 0, 32, 0.15)',
                                                flexShrink: 0,
                                                mt: 0.5,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                cursor: 'default'
                                            }}
                                        >
                                            {/* Template Header */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.8rem',
                                                        color: 'primary.main',
                                                        letterSpacing: '0.02em'
                                                    }}
                                                >
                                                    Nowy
                                                </Typography>
                                            </Box>
                                            
                                            {/* Icon + Message */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <AddIcon 
                                                    sx={{ 
                                                        fontSize: 32, 
                                                        color: 'primary.main',
                                                        opacity: 0.7
                                                    }} 
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        color: 'text.secondary',
                                                        textAlign: 'center',
                                                        lineHeight: 1.4
                                                    }}
                                                >
                                                    Kliknij dzień w kalendarzu aby utworzyć szablon
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ) : dayTemplates.length > 0 ? (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.75,
                                                overflowY: 'auto',
                                                overflowX: 'visible',
                                                pr: 0.5,
                                                pl: 0.25,
                                                pt: 0.25,
                                                flex: 1,
                                                minHeight: 0,
                                                '&::-webkit-scrollbar': { width: '4px' },
                                                '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: theme.palette.mode === 'dark' 
                                                        ? 'rgba(114, 0, 21, 0.4)' 
                                                        : 'rgba(146, 0, 32, 0.2)',
                                                    borderRadius: '2px',
                                                    '&:hover': { 
                                                        backgroundColor: theme.palette.mode === 'dark' 
                                                            ? 'rgba(114, 0, 21, 0.6)' 
                                                            : 'rgba(146, 0, 32, 0.3)' 
                                                    }
                                                }
                                            }}
                                        >
                                            {dayTemplates.map((template) => (
                                                <DayTemplate 
                                                    key={template.id} 
                                                    template={template}
                                                    sites={sites}
                                                    compact={false}
                                                    onDragStart={handleTemplateDragStart}
                                                    onDragEnd={handleTemplateDragEnd}
                                                    isCollapsed={creatingTemplateMode === 'day'}
                                                />
                                            ))}
                                        </Box>
                                    ) : (creatingTemplateMode !== 'day') ? (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexShrink: 0,
                                                mt: 1,
                                                py: 2
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    color: 'text.secondary',
                                                    textAlign: 'center',
                                                    lineHeight: 1.4
                                                }}
                                            >
                                                Kliknij + aby utworzyć szablon
                                            </Typography>
                                        </Box>
                                    ) : null}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>

                    {/* Divider */}
                    <Box
                        sx={{
                            height: '1px',
                            backgroundColor: theme.palette.divider,
                            flexShrink: 0
                        }}
                    />

                    {/* Week Templates Section */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.25,
                            flex: weekTemplatesExpanded ? (draggingTemplate ? 0.8 : 1) : 0,
                            minHeight: 0,
                            transition: 'flex 300ms ease'
                        }}
                    >
                        {/* Header with collapse button and + icon */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                flexShrink: 0
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={() => setWeekTemplatesExpanded(!weekTemplatesExpanded)}
                                sx={{
                                    p: 0,
                                    width: 20,
                                    height: 20,
                                    color: 'text.secondary',
                                    transition: 'transform 200ms ease'
                                }}
                            >
                                {weekTemplatesExpanded ? (
                                    <ExpandMore sx={{ fontSize: 18 }} />
                                ) : (
                                    <ChevronRight sx={{ fontSize: 18 }} />
                                )}
                            </IconButton>
                            <Typography
                                variant="subtitle2"
                                onClick={() => setWeekTemplatesExpanded(!weekTemplatesExpanded)}
                                sx={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: 600, 
                                    color: 'text.secondary', 
                                    flex: 1,
                                    textAlign: 'left',
                                    letterSpacing: '0.02em',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                            >
                                Szablony tygodnia
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={creatingTemplateMode === 'week' ? onCancelTemplateCreation : onCreateWeekTemplate}
                                sx={{
                                    p: 0.5,
                                    width: 24,
                                    height: 24,
                                    color: creatingTemplateMode === 'week' ? 'error.main' : 'primary.main',
                                    '&:hover': {
                                        backgroundColor: creatingTemplateMode === 'week'
                                            ? 'rgba(211, 47, 47, 0.08)'
                                            : theme.palette.mode === 'dark'
                                            ? 'rgba(114, 0, 21, 0.15)'
                                            : 'rgba(146, 0, 32, 0.08)'
                                    }
                                }}
                            >
                                {creatingTemplateMode === 'week' ? (
                                    <RemoveIcon sx={{ fontSize: 16 }} />
                                ) : (
                                    <AddIcon sx={{ fontSize: 16 }} />
                                )}
                            </IconButton>
                        </Box>

                        <AnimatePresence mode="wait">
                            {weekTemplatesExpanded && (
                                <motion.div
                                    key={creatingTemplateMode === 'week' ? 'creating' : 'templates'}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, position: 'relative' }}
                                >
                                    {creatingTemplateMode === 'week' ? (
                                        <Box
                                            sx={{
                                                p: 1.25,
                                                borderRadius: 2,
                                                backgroundColor: theme.palette.mode === 'dark' 
                                                    ? 'rgba(228, 229, 218, 0.05)' 
                                                    : 'rgba(228, 229, 218, 0.7)',
                                                border: '1px solid rgba(146, 0, 32, 0.15)',
                                                flexShrink: 0,
                                                mt: 0.75,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                cursor: 'default'
                                            }}
                                        >
                                            {/* Template Header */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.8rem',
                                                        color: 'primary.main',
                                                        letterSpacing: '0.02em'
                                                    }}
                                                >
                                                    Nowy
                                                </Typography>
                                            </Box>
                                            
                                            {/* Icon + Message */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <AddIcon 
                                                    sx={{ 
                                                        fontSize: 32, 
                                                        color: 'primary.main',
                                                        opacity: 0.7
                                                    }} 
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        color: 'text.secondary',
                                                        textAlign: 'center',
                                                        lineHeight: 1.4
                                                    }}
                                                >
                                                    Kliknij tydzień w kalendarzu aby utworzyć szablon
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ) : weekTemplates.length > 0 ? (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.75,
                                                overflowY: 'auto',
                                                overflowX: 'visible',
                                                pr: 0.5,
                                                pl: 0.25,
                                                pt: 0.25,
                                                flex: 1,
                                                minHeight: 0,
                                                '&::-webkit-scrollbar': { width: '4px' },
                                                '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: theme.palette.mode === 'dark' 
                                                        ? 'rgba(114, 0, 21, 0.4)' 
                                                        : 'rgba(146, 0, 32, 0.2)',
                                                    borderRadius: '2px',
                                                    '&:hover': { 
                                                        backgroundColor: theme.palette.mode === 'dark' 
                                                            ? 'rgba(114, 0, 21, 0.6)' 
                                                            : 'rgba(146, 0, 32, 0.3)' 
                                                    }
                                                }
                                            }}
                                        >
                                            {weekTemplates.map((template) => (
                                                <WeekTemplate 
                                                    key={template.id} 
                                                    template={template} 
                                                    compact={false}
                                                    onDragStart={handleTemplateDragStart}
                                                    onDragEnd={handleTemplateDragEnd}
                                                    isCollapsed={creatingTemplateMode === 'week'}
                                                />
                                            ))}
                                        </Box>
                                    ) : (creatingTemplateMode !== 'week') ? (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexShrink: 0,
                                                mt: 1,
                                                py: 2
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    color: 'text.secondary',
                                                    textAlign: 'center',
                                                    lineHeight: 1.4
                                                }}
                                            >
                                                Kliknij + aby utworzyć szablon
                                            </Typography>
                                        </Box>
                                    ) : null}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </Box>
            </Box>
            
            {/* Trash Zone - appears when dragging, positioned absolutely at bottom */}
            <AnimatePresence>
                {draggingTemplate && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 100
                        }}
                    >
                        <Box
                            sx={{
                                mx: 2.5,
                                mb: 2.5,
                                p: 2,
                                borderRadius: 2,
                                border: '2px dashed',
                                borderColor: isOverTrash ? 'error.dark' : 'error.main',
                                backgroundColor: isOverTrash ? 'rgba(211, 47, 47, 0.20)' : 'rgba(211, 47, 47, 0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                transition: 'all 200ms ease',
                                transform: isOverTrash ? 'translateY(-2px)' : 'none',
                                backdropFilter: 'blur(4px)'
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                setIsOverTrash(true);
                            }}
                            onDragLeave={() => {
                                setIsOverTrash(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsOverTrash(false);
                                const templateType = e.dataTransfer.getData('templateType');
                                const templateId = e.dataTransfer.getData('templateId');
                                const templateData = JSON.parse(e.dataTransfer.getData('templateData'));
                                
                                console.log('Delete template:', { templateType, templateId, templateData });
                                
                                // Open deletion confirmation modal
                                setTemplateToDelete(templateData);
                                setDeletionModalOpen(true);
                                setDraggingTemplate(null);
                            }}
                        >
                            <DeleteIcon sx={{ fontSize: 28, color: 'error.main' }} />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    color: 'error.main',
                                    fontSize: '0.7rem'
                                }}
                            >
                                Usuń szablon
                            </Typography>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Template Deletion Modal */}
            <TemplateDeletionModal
                open={deletionModalOpen}
                onClose={() => {
                    setDeletionModalOpen(false);
                    setTemplateToDelete(null);
                }}
                onConfirm={async () => {
                    if (!templateToDelete?.id) return;
                    
                    try {
                        // Import deleteTemplate from services
                        const { deleteTemplate } = await import('../../../../services/templateService');
                        await deleteTemplate(templateToDelete.id);
                        
                        // Refresh templates list
                        onTemplatesRefresh?.();
                        
                        setDeletionModalOpen(false);
                        setTemplateToDelete(null);
                    } catch (error) {
                        console.error('Error deleting template:', error);
                        // Could show an error toast here
                    }
                }}
                template={templateToDelete}
            />
        </motion.div>
    );
};

RealTemplateBrowser.propTypes = {
    templates: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        template_config: PropTypes.object
    })),
    onCreateDayTemplate: PropTypes.func,
    onCreateWeekTemplate: PropTypes.func,
    onTemplateDragStart: PropTypes.func,
    onTemplateDragEnd: PropTypes.func,
    creatingTemplateMode: PropTypes.oneOf(['day', 'week', null]),
    onCancelTemplateCreation: PropTypes.func,
    onTemplatesRefresh: PropTypes.func
};

RealTemplateBrowser.defaultProps = {
    templates: [],
    onCreateDayTemplate: () => console.log('Create day template'),
    onCreateWeekTemplate: () => console.log('Create week template'),
    onTemplateDragStart: () => {},
    onTemplateDragEnd: () => {},
    creatingTemplateMode: null,
    onCancelTemplateCreation: () => {},
    onTemplatesRefresh: () => {}
};

export default RealTemplateBrowser;
