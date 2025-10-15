import React from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Typography } from '@mui/material';
import useTheme from '../../theme/useTheme';
import Logo from '../Logo/Logo';

const OwnerFooter = ({ ownerName }) => {
  const theme = useTheme();
  const background = theme.colors?.bg?.surface ?? theme.palette.background.paper;
  const borderColor = theme.colors?.border?.subtle ?? theme.palette.divider;
  const textPrimary = theme.colors?.text?.primary ?? theme.palette.text.primary;
  const textSecondary = theme.colors?.text?.secondary ?? theme.palette.text.secondary;

  return (
    <Box
      component="footer"
      sx={{
        borderTop: `1px solid ${borderColor}`,
        backgroundColor: background,
        py: { xs: 4, md: 6 },
        px: { xs: 3, md: 6 }
      }}
    >
      <Stack spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }} textAlign={{ xs: 'left', md: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: textPrimary }}>
          {ownerName}
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'center' }}>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            Created with
          </Typography>
          <Logo size="small" variant="shadow-light" align="left" animated={false} />
        </Stack>
      </Stack>
    </Box>
  );
};

OwnerFooter.propTypes = {
  ownerName: PropTypes.string
};

OwnerFooter.defaultProps = {
  ownerName: 'Site Owner'
};

export default OwnerFooter;
