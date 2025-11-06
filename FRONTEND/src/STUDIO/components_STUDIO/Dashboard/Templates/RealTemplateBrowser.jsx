import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { Add as AddIcon, Delete as DeleteIcon, ChevronRight, ExpandMore } from '@mui/icons-material';
import DayTemplate from './DayTemplate';
import WeekTemplate from './WeekTemplate';
import Logo from '../../../../components/Logo/Logo';
import { getSiteColorHex } from '../../../../theme/siteColors';
import TemplateDeletionModal from './TemplateDeletionModal';

const RealTemplateBrowser = ({ onCreateDayTemplate, onCreateWeekTemplate, onTemplateDragStart, onTemplateDragEnd }) => {
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

    // Mock templates - replace with actual data from store/API
    const dayTemplates = [
        {
            id: 'day-1',
            name: 'Poranny',
            day_abbreviation: 'Pon',
            events: [
                { 
                    type: 'individual', 
                    start_time: '09:00', 
                    end_time: '11:00',
                    title: 'Morning Session',
                    site_color: getSiteColorHex(0) // Red
                },
                { 
                    type: 'group', 
                    start_time: '14:00', 
                    end_time: '16:00',
                    title: 'Group Class',
                    site_color: getSiteColorHex(0) // Red
                }
            ]
        },
        {
            id: 'day-2',
            name: 'Wieczorny',
            day_abbreviation: 'Wt',
            events: [
                { 
                    type: 'group', 
                    start_time: '17:00', 
                    end_time: '19:00',
                    title: 'Evening Session',
                    site_color: getSiteColorHex(1) // Blue
                }
            ]
        }
    ];

    const weekTemplates = [
        {
            id: 'week-1',
            name: 'Standardowy',
            day_count: 5,
            active_days: [0, 1, 2, 3, 4],
            total_events: 12
        },
        {
            id: 'week-2',
            name: 'Intensywny',
            day_count: 6,
            active_days: [0, 1, 2, 3, 4, 5],
            total_events: 18
        }
    ];

    return (
        <motion.div
            initial={{ width: templateLibraryWidth }}
            animate={{ width: templateLibraryWidth }}
            style={{
                width: templateLibraryWidth,
                height: '100%',
                borderRight: '1px solid rgba(146, 0, 32, 0.1)',
                backgroundColor: 'rgba(228, 229, 218, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', // Prevent any scroll
                position: 'relative' // For absolute positioning of trash zone
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
                            {dayTemplates.length > 0 && (
                                <IconButton
                                    size="small"
                                    onClick={onCreateDayTemplate}
                                    sx={{
                                        p: 0.5,
                                        width: 24,
                                        height: 24,
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'rgba(146, 0, 32, 0.08)'
                                        }
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                        </Box>

                        <AnimatePresence>
                            {dayTemplatesExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ overflow: 'visible', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
                                >
                                    {dayTemplates.length > 0 ? (
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
                                                    backgroundColor: 'rgba(146, 0, 32, 0.2)',
                                                    borderRadius: '2px',
                                                    '&:hover': { backgroundColor: 'rgba(146, 0, 32, 0.3)' }
                                                }
                                            }}
                                        >
                                            {dayTemplates.map((template) => (
                                                <DayTemplate 
                                                    key={template.id} 
                                                    template={template} 
                                                    compact={false}
                                                    onDragStart={handleTemplateDragStart}
                                                    onDragEnd={handleTemplateDragEnd}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1.5,
                                                flexShrink: 0
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    textAlign: 'center',
                                                    border: '1px dashed',
                                                    borderColor: 'divider',
                                                    borderRadius: 2,
                                                    backgroundColor: 'action.hover'
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                                                    Brak szablonów
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                onClick={onCreateDayTemplate}
                                                sx={{
                                                    alignSelf: 'center',
                                                    width: 36,
                                                    height: 36,
                                                    backgroundColor: 'rgba(146, 0, 32, 0.08)',
                                                    color: 'primary.main',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(146, 0, 32, 0.15)'
                                                    }
                                                }}
                                            >
                                                <AddIcon sx={{ fontSize: 20 }} />
                                            </IconButton>
                                        </Box>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>

                    {/* Divider */}
                    <Box
                        sx={{
                            height: '1px',
                            backgroundColor: 'rgba(146, 0, 32, 0.16)',
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
                            {weekTemplates.length > 0 && (
                                <IconButton
                                    size="small"
                                    onClick={onCreateWeekTemplate}
                                    sx={{
                                        p: 0.5,
                                        width: 24,
                                        height: 24,
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'rgba(146, 0, 32, 0.08)'
                                        }
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                        </Box>

                        <AnimatePresence>
                            {weekTemplatesExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ overflow: 'visible', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
                                >
                                    {weekTemplates.length > 0 ? (
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
                                                    backgroundColor: 'rgba(146, 0, 32, 0.2)',
                                                    borderRadius: '2px',
                                                    '&:hover': { backgroundColor: 'rgba(146, 0, 32, 0.3)' }
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
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1.5,
                                                flexShrink: 0
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    textAlign: 'center',
                                                    border: '1px dashed',
                                                    borderColor: 'divider',
                                                    borderRadius: 2,
                                                    backgroundColor: 'action.hover'
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                                                    Brak szablonów
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                onClick={onCreateWeekTemplate}
                                                sx={{
                                                    alignSelf: 'center',
                                                    width: 36,
                                                    height: 36,
                                                    backgroundColor: 'rgba(146, 0, 32, 0.08)',
                                                    color: 'primary.main',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(146, 0, 32, 0.15)'
                                                    }
                                                }}
                                            >
                                                <AddIcon sx={{ fontSize: 20 }} />
                                            </IconButton>
                                        </Box>
                                    )}
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
                onConfirm={() => {
                    // TODO: Actually delete the template from store/API
                    console.log('Confirmed deletion of template:', templateToDelete);
                    setDeletionModalOpen(false);
                    setTemplateToDelete(null);
                }}
                template={templateToDelete}
            />
        </motion.div>
    );
};

RealTemplateBrowser.propTypes = {
    onCreateDayTemplate: PropTypes.func,
    onCreateWeekTemplate: PropTypes.func,
    onTemplateDragStart: PropTypes.func,
    onTemplateDragEnd: PropTypes.func
};

RealTemplateBrowser.defaultProps = {
    onCreateDayTemplate: () => console.log('Create day template'),
    onCreateWeekTemplate: () => console.log('Create week template'),
    onTemplateDragStart: () => {},
    onTemplateDragEnd: () => {}
};

export default RealTemplateBrowser;
