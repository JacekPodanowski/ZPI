import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import useTheme from '../../theme/useTheme';
import Logo from '../Logo/Logo';

const StandardFooter = () => {
  const theme = useTheme();
  const background = theme.colors?.bg?.surface ?? theme.palette.background.paper;
  const borderColor = theme.colors?.border?.subtle ?? theme.palette.divider;
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
      <Stack spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} textAlign={{ xs: 'left', md: 'center' }}>
        <Logo size="small" align="left" animated={false} />
        <Typography variant="body2" sx={{ color: textSecondary }}>
          Twój spokojny start w sieci. Wszystko w jednym miejscu.
        </Typography>
      </Stack>
    </Box>
  );
};

export default StandardFooter;
