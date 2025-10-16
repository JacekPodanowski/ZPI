import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import DayTemplate from './DayTemplate';
import WeekTemplate from './WeekTemplate';
import Logo from '../../../../components/Logo/Logo';

const RealTemplateBrowser = ({ onCreateDayTemplate, onCreateWeekTemplate }) => {
    const templateLibraryWidth = 240; // Fixed width for templates-only mode

    // Mock templates - replace with actual data from store/API
    const dayTemplates = [
        {
            id: 'day-1',
            name: 'Poranny',
            day_abbreviation: 'Pon',
            events: [
                { type: 'individual', start_time: '09:00', end_time: '11:00' },
                { type: 'group', start_time: '14:00', end_time: '16:00' }
            ]
        },
        {
            id: 'day-2',
            name: 'Wieczorny',
            day_abbreviation: 'Wt',
            events: [
                { type: 'group', start_time: '17:00', end_time: '19:00' }
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
                flexDirection: 'column'
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
                    minHeight: 0
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
                        gap: 2.5
                    }}
                >
                    {/* Day Templates */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.25,
                            flex: 1,
                            minHeight: 0
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 600, 
                                color: 'text.secondary', 
                                flexShrink: 0,
                                textAlign: 'left',
                                letterSpacing: '0.02em'
                            }}
                        >
                            Szablony dnia
                        </Typography>

                        {dayTemplates.length > 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.75,
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    pr: 0.5,
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
                                    <DayTemplate key={template.id} template={template} compact={false} />
                                ))}
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    backgroundColor: 'action.hover',
                                    flexShrink: 0
                                }}
                            >
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                                    Brak szablonów
                                </Typography>
                            </Box>
                        )}

                        <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: '0.75rem',
                                borderColor: 'rgba(146, 0, 32, 0.24)',
                                color: 'primary.main',
                                flexShrink: 0,
                                py: 0.75,
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: 'rgba(146, 0, 32, 0.5)',
                                    backgroundColor: 'rgba(146, 0, 32, 0.05)'
                                }
                            }}
                            onClick={onCreateDayTemplate}
                        >
                            + Nowy
                        </Button>
                    </Box>

                    {/* Divider */}
                    <Box
                        sx={{
                            height: '1px',
                            backgroundColor: 'rgba(146, 0, 32, 0.16)',
                            flexShrink: 0
                        }}
                    />

                    {/* Week Templates */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.25,
                            flex: 1,
                            minHeight: 0
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 600, 
                                color: 'text.secondary', 
                                flexShrink: 0,
                                textAlign: 'left',
                                letterSpacing: '0.02em'
                            }}
                        >
                            Szablony tygodnia
                        </Typography>

                        {weekTemplates.length > 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.75,
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    pr: 0.5,
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
                                    <WeekTemplate key={template.id} template={template} compact={false} />
                                ))}
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    backgroundColor: 'action.hover',
                                    flexShrink: 0
                                }}
                            >
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                                    Brak szablonów
                                </Typography>
                            </Box>
                        )}

                        <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: '0.75rem',
                                borderColor: 'rgba(146, 0, 32, 0.24)',
                                color: 'primary.main',
                                flexShrink: 0,
                                py: 0.75,
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: 'rgba(146, 0, 32, 0.5)',
                                    backgroundColor: 'rgba(146, 0, 32, 0.05)'
                                }
                            }}
                            onClick={onCreateWeekTemplate}
                        >
                            + Nowy
                        </Button>
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
};

RealTemplateBrowser.propTypes = {
    onCreateDayTemplate: PropTypes.func,
    onCreateWeekTemplate: PropTypes.func
};

RealTemplateBrowser.defaultProps = {
    onCreateDayTemplate: () => console.log('Create day template'),
    onCreateWeekTemplate: () => console.log('Create week template')
};

export default RealTemplateBrowser;
