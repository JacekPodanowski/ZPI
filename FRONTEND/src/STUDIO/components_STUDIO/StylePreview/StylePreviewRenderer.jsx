import React, { useMemo, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import composeSiteStyle from '../../../SITES/styles/utils';
import { MODULE_REGISTRY } from '../../../SITES/components/modules/ModuleRegistry';
import apiClient from '../../../services/apiClient';

/**
 * Komponent renderujący statyczny podgląd strony demo w wybranym stylu.
 * Renderuje stronę w pełnym rozmiarze wewnątrz kontenera - bez skalowania.
 */
const StylePreviewRenderer = ({ styleId }) => {
    const [demoConfig, setDemoConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/demo-config/')
            .then(response => {
                setDemoConfig(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('[StylePreviewRenderer] Failed to load demo config:', err);
                setLoading(false);
            });
    }, []);

    const { style, modules, navModule } = useMemo(() => {
        if (!demoConfig?.site) {
            return { style: null, modules: [], navModule: null };
        }

        const composedStyle = composeSiteStyle(styleId);
        
        const homePage = demoConfig.site.pages?.find(p => p.id === 'home') || demoConfig.site.pages?.[0];
        const pageModules = homePage?.modules || [];

        const autoNavigation = demoConfig.site.pages ? {
            id: 'auto-navigation',
            type: 'navigation',
            order: -1000,
            enabled: true,
            content: {
                layout: 'horizontal',
                links: Array.isArray(demoConfig.site.pages) 
                    ? demoConfig.site.pages.map(page => ({
                        label: page.name || page.id,
                        href: page.route || `/${page.id}`,
                        pageId: page.id
                      }))
                    : []
            }
        } : null;

        return { style: composedStyle, modules: pageModules, navModule: autoNavigation };
    }, [styleId, demoConfig]);

    if (loading) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (!style || modules.length === 0) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary'
                }}
            >
                Brak konfiguracji demo
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: style?.colors?.background || '#f5f2eb',
                pointerEvents: 'none',
                userSelect: 'none',
                position: 'relative'
            }}
        >
            <Box
                sx={{
                    width: '200%',
                    height: '200%',
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none'
                }}
            >
                {navModule && (() => {
                    const moduleType = (navModule.type || navModule.id || '').toLowerCase();
                    const moduleDef = MODULE_REGISTRY[moduleType];

                    if (!moduleDef) return null;

                    const Component = moduleDef.component;
                    const layout = navModule.content?.layout || moduleDef.defaultLayout;

                    return (
                        <Component
                            key={navModule.id}
                            layout={layout}
                            content={navModule.content || {}}
                            style={style}
                            siteId="preview"
                        />
                    );
                })()}
                
                {modules.map((module, index) => {
                    const moduleType = (module.type || module.id || '').toLowerCase();
                    const moduleDef = MODULE_REGISTRY[moduleType];

                    if (!moduleDef) return null;

                    const Component = moduleDef.component;
                    const layout = module.content?.layout || moduleDef.defaultLayout;

                    return (
                        <Component
                            key={module.id || index}
                            layout={layout}
                            content={module.content || {}}
                            style={style}
                            siteId="preview"
                        />
                    );
                })}
            </Box>
        </Box>
    );
};

export default StylePreviewRenderer;
