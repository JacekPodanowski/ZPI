import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import useTheme from '../../../theme/useTheme';

const NotificationsPage = () => {
  const theme = useTheme();
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: surfaceColor,
        borderRadius: '16px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            textAlign: 'center',
            color: theme.colors?.text?.primary || theme.palette.text.primary
          }}
        >
          Your notifications will be here
        </Typography>
      </Box>
    </Paper>
  );
};

export default NotificationsPage;
