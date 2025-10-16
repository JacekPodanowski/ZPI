import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import useDashboardStore from '../../../store/dashboardStore';
import DayTemplate from './DayTemplate';
import WeekTemplate from './WeekTemplate';
import Logo from '../../../../components/Logo/Logo';

const TemplateLibrary = ({ onCreateDayTemplate, onCreateWeekTemplate }) => {
    const navigate = useNavigate();
    const {
        mode,
        templates,
        templateLibraryWidth,
        switchMode,
        sites,
        selectedSiteId,
        selectSite
    } = useDashboardStore((state) => ({
        mode: state.mode,
        templates: state.templates,
        templateLibraryWidth: state.templateLibraryWidth,
        switchMode: state.switchMode,
        sites: state.sites,
        selectedSiteId: state.selectedSiteId,
        selectSite: state.selectSite
    }));

    const isSitePanelVisible = mode === 'site-focus';

    const dayTemplates = templates?.day || [
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

    const weekTemplates = templates?.week || [
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
            animate={{ width: templateLibraryWidth }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
                height: '100%',
                borderRight: '1px solid rgba(146, 0, 32, 0.1)',
                backgroundColor: 'rgba(228, 229, 218, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <Box
                sx={{
                    px: { xs: 2, md: 2.5 },
                    py: { xs: 2, md: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    height: '100%',
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5
                    }}
                >
                    <Logo text="Sites" size="small" align="left" variant="shadow-light" />
                    <Button
                        size="small"
                        variant="text"
                        onClick={() => switchMode(isSitePanelVisible ? 'calendar-focus' : 'site-focus', 'manual')}
                        sx={{
                            fontWeight: 600,
                            color: 'secondary.main',
                            letterSpacing: 0.4
                        }}
                    >
                        {isSitePanelVisible ? 'Ukryj' : 'Pokaż witryny'}
                    </Button>
                </Box>

                <AnimatePresence initial={false}>
                    {isSitePanelVisible ? (
                        <motion.div
                            key="site-meta"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            style={{ marginBottom: '12px' }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    borderRadius: 3,
                                    pb: 2.5
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                    {sites.length ? (
                                        sites.map((site) => {
                                            const isSelected = String(selectedSiteId) === String(site.id);

                                            return (
                                                <Box
                                                    key={site.id}
                                                    onClick={() => selectSite(site.id)}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        borderRadius: 2,
                                                        px: 1,
                                                        py: 0.75,
                                                        cursor: 'pointer',
                                                        border: `1px solid ${isSelected ? 'rgba(146, 0, 32, 0.32)' : 'rgba(146, 0, 32, 0.12)'}`,
                                                        backgroundColor: isSelected ? 'rgba(146, 0, 32, 0.05)' : 'transparent',
                                                        transition: 'all 200ms ease',
                                                        '&:hover': {
                                                            borderColor: 'rgba(146, 0, 32, 0.32)',
                                                            backgroundColor: 'rgba(146, 0, 32, 0.08)'
                                                        }
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                        {site.name}
                                                    </Typography>

                                                    <Box
                                                        sx={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: '50%',
                                                            backgroundColor: site.is_active ? '#4ade80' : '#ef4444',
                                                            boxShadow: site.is_active
                                                                ? '0 0 6px #4ade80cc'
                                                                : '0 0 6px #ef4444cc'
                                                        }}
                                                    />
                                                </Box>
                                            );
                                        })
                                    ) : (
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Brak stron do wyświetlenia.
                                        </Typography>
                                    )}

                                    <Box
                                        key="new-site-entry"
                                        onClick={() => navigate('/studio/new')}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            borderRadius: 2,
                                            px: 1,
                                            py: 0.75,
                                            cursor: 'pointer',
                                            border: '1px dashed rgba(146, 0, 32, 0.16)',
                                            color: 'text.disabled',
                                            transition: 'all 200ms ease',
                                            '&:hover': {
                                                borderColor: 'rgba(146, 0, 32, 0.32)',
                                                color: 'text.primary',
                                                backgroundColor: 'rgba(146, 0, 32, 0.04)'
                                            }
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            + Nowa strona
                                        </Typography>
                                    </Box>
                                    <Box sx={{ height: 60 }} />
                                </Box>
                            </Box>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <Divider sx={{ borderColor: 'rgba(146, 0, 32, 0.16)' }} />

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden' }}>
                    <Typography
                        variant="subtitle2"
                        sx={{ fontSize: 14, fontWeight: 600, color: 'text.secondary' }}
                    >
                        Szablony dnia
                    </Typography>

                    {dayTemplates.length > 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                overflowY: 'auto',
                                pr: 1,
                                maxHeight: isSitePanelVisible ? 146 : '100%',
                                '&::-webkit-scrollbar': { display: 'none' }
                            }}
                        >
                            {dayTemplates.map((template) => (
                                <DayTemplate key={template.id} template={template} compact={isSitePanelVisible} />
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
                                backgroundColor: 'action.hover'
                            }}
                        >
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                                Brak szablonów dnia
                            </Typography>
                        </Box>
                    )}

                    <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 12, borderColor: 'rgba(146, 0, 32, 0.24)' }}
                        onClick={onCreateDayTemplate}
                    >
                        + Nowy
                    </Button>
                </Box>

                <Divider sx={{ borderColor: 'rgba(146, 0, 32, 0.16)' }} />

                <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{ fontSize: 14, fontWeight: 600, color: 'text.secondary' }}
                    >
                        Szablony tygodnia
                    </Typography>

                    {weekTemplates.length > 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                maxHeight: isSitePanelVisible ? 140 : 180,
                                overflowY: 'auto',
                                pr: 1,
                                '&::-webkit-scrollbar': { display: 'none' }
                            }}
                        >
                            {weekTemplates.map((template) => (
                                <WeekTemplate key={template.id} template={template} compact={isSitePanelVisible} />
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
                                backgroundColor: 'action.hover'
                            }}
                        >
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                                Brak szablonów tygodnia
                            </Typography>
                        </Box>
                    )}

                    <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 12, borderColor: 'rgba(146, 0, 32, 0.24)' }}
                        onClick={onCreateWeekTemplate}
                    >
                        + Nowy
                    </Button>
                </Box>

                {mode === 'calendar-focus' && (sites?.length || 0) > 0 && (
                    <Box
                        sx={{
                            mt: 2.5,
                            borderRadius: 3,
                            px: 1.75,
                            py: 1.5,
                            backgroundColor: 'rgba(255,255,255,0.75)',
                            boxShadow: '0 16px 30px rgba(12,12,12,0.12)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.75
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.2, color: 'text.secondary' }}>
                            Legenda kalendarza
                        </Typography>
                        {(sites || []).slice(0, 5).map((site) => (
                            <Box key={site.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        backgroundColor: site.color_tag || 'rgb(146, 0, 32)',
                                        boxShadow: `0 0 8px ${alpha(site.color_tag || 'rgb(146, 0, 32)', 0.4)}`
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: 'text.primary' }}>
                                    {site.name}
                                </Typography>
                            </Box>
                        ))}
                        {sites.length > 5 && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                +{sites.length - 5} więcej
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
        </motion.div>
    );
};

TemplateLibrary.propTypes = {
    onCreateDayTemplate: PropTypes.func,
    onCreateWeekTemplate: PropTypes.func
};

TemplateLibrary.defaultProps = {
    onCreateDayTemplate: () => console.log('Create day template'),
    onCreateWeekTemplate: () => console.log('Create week template')
};

export default TemplateLibrary;
