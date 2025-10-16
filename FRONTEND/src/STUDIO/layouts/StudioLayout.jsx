import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';
import { OwnerFooter, StandardFooter } from '../../components/Footer';

const FOOTER_VARIANTS = {
  standard: StandardFooter,
  owner: OwnerFooter
};

const StudioLayout = ({
  showNavigation = true,
  showFooter = true,
  footerVariant = 'standard',
  footerProps,
  contentPadding,
  contentMaxWidth,
  contentWrapperProps
}) => {
  const location = useLocation();
  const FooterComponent = useMemo(
    () => FOOTER_VARIANTS[footerVariant] || FOOTER_VARIANTS.standard,
    [footerVariant]
  );

  const isDashboardRoute = useMemo(() => (
    location.pathname.startsWith('/studio/dashboard') ||
    location.pathname.startsWith('/studio/sites') ||
    location.pathname === '/studio/sites' ||
    location.pathname.startsWith('/studio/calendar/creator')
  ), [location.pathname]);

  const effectiveShowFooter = isDashboardRoute ? false : showFooter;

  const paddingX = isDashboardRoute
    ? 0
    : contentPadding?.x ?? { xs: 3, md: 6 };

  const paddingY = isDashboardRoute
    ? 0
    : contentPadding?.y ?? { xs: 4, md: 8 };

  const effectiveContentMaxWidth = isDashboardRoute
    ? '100%'
    : contentMaxWidth ?? 1200;

  const wrapperBaseSx = {
    width: '100%',
    maxWidth: effectiveContentMaxWidth,
    mx: 'auto',
    ...(contentWrapperProps?.sx || {})
  };

  const wrapperSx = isDashboardRoute
    ? {
        ...wrapperBaseSx,
        maxWidth: '100%',
        flex: '1 1 auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
      }
    : wrapperBaseSx;

  return (
    <>
      {showNavigation ? <Navigation /> : null}

      <Box
        sx={{
          minHeight: isDashboardRoute ? 'calc(100vh - 60px)' : '100vh',
          height: isDashboardRoute ? 'calc(100vh - 60px)' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
          overflow: isDashboardRoute ? 'hidden' : 'visible'
        }}
      >
        <Box
          component="main"
          sx={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isDashboardRoute ? 'stretch' : 'center',
            py: paddingY,
            px: paddingX,
            minHeight: 0,
            overflow: isDashboardRoute ? 'hidden' : 'visible'
          }}
        >
          <Box
            {...contentWrapperProps}
            sx={{
              ...wrapperSx
            }}
          >
            <Outlet />
          </Box>
        </Box>

        {effectiveShowFooter ? <FooterComponent {...footerProps} /> : null}
      </Box>
    </>
  );
};

StudioLayout.propTypes = {
  showNavigation: PropTypes.bool,
  showFooter: PropTypes.bool,
  footerVariant: PropTypes.oneOf(['standard', 'owner']),
  footerProps: PropTypes.object,
  contentPadding: PropTypes.shape({
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
  }),
  contentMaxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  contentWrapperProps: PropTypes.object
};

export default StudioLayout;
