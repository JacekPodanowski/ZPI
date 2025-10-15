import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
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
  const FooterComponent = useMemo(
    () => FOOTER_VARIANTS[footerVariant] || FOOTER_VARIANTS.standard,
    [footerVariant]
  );

  return (
    <>
      {showNavigation ? <Navigation /> : null}

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default'
        }}
      >
        <Box
          component="main"
          sx={{
            flex: '1 0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: contentPadding?.y ?? { xs: 4, md: 8 },
            px: contentPadding?.x ?? { xs: 3, md: 6 }
          }}
        >
          <Box
            {...contentWrapperProps}
            sx={{
              width: '100%',
              maxWidth: contentMaxWidth ?? 1200,
              mx: 'auto',
              ...(contentWrapperProps?.sx || {})
            }}
          >
            <Outlet />
          </Box>
        </Box>

        {showFooter ? <FooterComponent {...footerProps} /> : null}
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
