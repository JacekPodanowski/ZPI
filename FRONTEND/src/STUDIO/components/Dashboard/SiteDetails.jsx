import React, { useMemo } from 'react';
import { Box, Button, Typography, IconButton, Tooltip } from '@mui/material';
import { ExpandLess } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useDashboardStore from '../../store/dashboardStore';
import { shallow } from 'zustand/shallow';

const PANEL_HEIGHT = 250;

const buildSparklinePoints = (data) => {
    if (!Array.isArray(data) || data.length < 2) {
        return '';
    }

    const maxValue = Math.max(...data, 1);
    return data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (value / maxValue) * 100;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');
};

const SiteDetails = ({ sites }) => {
    const navigate = useNavigate();
    const { selectedSiteId } = useDashboardStore(
        (state) => ({
            selectedSiteId: state.selectedSiteId
        }),
        shallow
    );

    const selectedSite = useMemo(() => {
        if (selectedSiteId === null || selectedSiteId === undefined) {
            return null;
        }
        return sites.find((site) => String(site.id) === String(selectedSiteId)) || null;
    }, [selectedSiteId, sites]);

    const isActive = selectedSite?.is_active === true;
    const sparklineData = selectedSite?.analytics?.weekly_visits?.length
        ? selectedSite.analytics.weekly_visits
        : [9, 12, 8, 15, 11, 18, 14];
    const sparklinePoints = useMemo(
        () => buildSparklinePoints(sparklineData),
        [sparklineData]
    );
    const targetUrl = selectedSite?.identifier
        ? `https://${selectedSite.identifier}.youreasy.site`
        : '—';
    const totalVisits = useMemo(
        () => sparklineData.reduce((acc, value) => acc + value, 0),
        [sparklineData]
    );
    const avgVisits = sparklineData.length ? Math.round(totalVisits / sparklineData.length) : 0;
    const eventCount = typeof selectedSite?.event_count === 'number' ? selectedSite.event_count : '—';

    const previewBackground = selectedSite?.preview_image
        ? {
              backgroundImage: `url(${selectedSite.preview_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
          }
        : {
              background:
                  'linear-gradient(135deg, rgba(146,0,32,0.18) 0%, rgba(12,12,12,0.72) 100%)'
          };

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, height: PANEL_HEIGHT }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden', width: '100%' }}
        >
            <Box
                sx={{
                    height: PANEL_HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    px: { xs: 2, md: 2.25 },
                    py: { xs: 1.5, md: 1.75 },
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(228,229,218,0.78) 0%, rgba(255,255,255,0.9) 100%)',
                    boxShadow: 'inset 0 0 0 1px rgba(146, 0, 32, 0.08)',
                    position: 'relative'
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        <Typography
                            variant="overline"
                            sx={{ letterSpacing: 2, fontWeight: 600, color: 'secondary.main' }}
                        >
                            {selectedSite ? selectedSite.name : 'Wybierz witrynę'}
                        </Typography>
                        {!selectedSite && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Wybierz witrynę, aby wyświetlić szczegóły
                            </Typography>
                        )}
                    </Box>

                    <IconButton
                        size="small"
                        onClick={() => console.log('(DEBUGLOG) SiteDetails.toggleRequested')}
                        sx={{
                            backgroundColor: 'rgba(146, 0, 32, 0.08)',
                            '&:hover': { backgroundColor: 'rgba(146, 0, 32, 0.16)' }
                        }}
                    >
                        <ExpandLess fontSize="small" />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 1.25, md: 2 },
                        alignItems: 'stretch'
                    }}
                >
                    <Box
                        sx={{
                            flexBasis: { md: '42%' },
                            flexGrow: 1,
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 10px 22px rgba(12,12,12,0.18)',
                            minHeight: { xs: 140, md: '100%' },
                            ...previewBackground,
                            '&:hover .preview-action': {
                                opacity: 1,
                                transform: 'translateY(0)',
                                pointerEvents: 'auto'
                            }
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(180deg, rgba(12,12,12,0.1) 0%, rgba(12,12,12,0.55) 100%)'
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                color: 'rgb(228,229,218)'
                            }}
                        >
                            <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1.2 }}>
                                PODGLĄD
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
                                {selectedSite?.name || 'Brak witryny'}
                            </Typography>
                        </Box>
                        <Box
                            className="preview-action"
                            sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                opacity: 0,
                                transform: 'translateY(-6px)',
                                transition: 'all 200ms ease',
                                pointerEvents: 'none'
                            }}
                        >
                            <Button
                                size="small"
                                variant="contained"
                                color="secondary"
                                disabled={!selectedSite}
                                onClick={() => selectedSite && navigate(`/studio/editor/${selectedSite.id}`)}
                                sx={{ fontWeight: 600, letterSpacing: 0.4 }}
                            >
                                Otwórz edytor
                            </Button>
                        </Box>
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 12,
                                left: 12,
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                                color: 'rgb(228,229,218)'
                            }}
                        >
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: isActive ? '#4ade80' : '#ef4444',
                                    boxShadow: isActive
                                        ? '0 0 8px rgba(74,222,128,0.8)'
                                        : '0 0 8px rgba(239,68,68,0.8)'
                                }}
                            />
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                {isActive ? 'Online' : 'Offline'}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 1
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    letterSpacing: 2,
                                    textTransform: 'uppercase',
                                    color: 'primary.main',
                                    fontSize: '0.78rem',
                                    lineHeight: 1.2,
                                    opacity: 0.82,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                                title={isActive ? targetUrl : 'Witryna nieaktywna'}
                            >
                                URL:&nbsp;
                                <Box
                                    component="span"
                                    sx={{
                                        textTransform: 'none',
                                        letterSpacing: 0,
                                        fontWeight: 600,
                                        color: 'primary.main',
                                        fontSize: '0.86rem',
                                        opacity: 0.88
                                    }}
                                >
                                    {isActive ? targetUrl : 'Witryna nieaktywna'}
                                </Box>
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(2, minmax(0, 1fr))' },
                                gap: 1.5,
                                flex: 1
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'relative',
                                    borderRadius: 3,
                                    px: 1.75,
                                    py: 1.5,
                                    background: 'rgba(255,255,255,0.82)',
                                    boxShadow: '0 8px 18px rgba(12,12,12,0.12)',
                                    border: '1px solid rgba(146, 0, 32, 0.12)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Tooltip title="Otwórz laboratorium" disableInteractive>
                                    <span>
                                        <Button
                                            size="small"
                                            disabled={!selectedSite}
                                            onClick={() => selectedSite && navigate(`/studio/lab/${selectedSite.id}`)}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                minWidth: 44,
                                                padding: '2px 10px',
                                                borderRadius: 999,
                                                border: '1px solid rgba(146, 0, 32, 0.4)',
                                                backgroundColor: 'rgba(255,255,255,0.92)',
                                                color: 'rgba(146, 0, 32, 0.9)',
                                                fontWeight: 700,
                                                letterSpacing: 0.6,
                                                fontSize: 10,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255,255,255,1)'
                                                }
                                            }}
                                        >
                                            LAB
                                        </Button>
                                    </span>
                                </Tooltip>
                                <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 0.8 }}>
                                    Ruch (7 dni)
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                                    {totalVisits}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Średnio {avgVisits} / dzień
                                </Typography>
                                <Box sx={{ mt: 'auto', pt: 1, height: 36 }}>
                                    <svg
                                        viewBox="0 0 100 40"
                                        preserveAspectRatio="none"
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <polyline
                                            points={sparklinePoints}
                                            fill="none"
                                            stroke="rgba(146,0,32,0.75)"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    borderRadius: 3,
                                    px: 1.75,
                                    py: 1.5,
                                    background: 'rgba(12,12,12,0.78)',
                                    boxShadow: '0 12px 24px rgba(12,12,12,0.2)',
                                    border: '1px solid rgba(146, 0, 32, 0.22)',
                                    color: 'rgb(228,229,218)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography variant="caption" sx={{ letterSpacing: 0.8, opacity: 0.75 }}>
                                    Liczba wydarzeń
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {eventCount}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                                    Zliczamy potwierdzone i zaplanowane sesje
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
};

SiteDetails.propTypes = {
    sites: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            identifier: PropTypes.string,
            template_config: PropTypes.object,
            version_history: PropTypes.array,
            event_count: PropTypes.number,
            is_active: PropTypes.bool,
            preview_image: PropTypes.string,
            analytics: PropTypes.shape({
                weekly_visits: PropTypes.arrayOf(PropTypes.number)
            })
        })
    ).isRequired
};

export default SiteDetails;

