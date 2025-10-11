import React from 'react';
import { Box, Typography } from '@mui/material'; // MUI Box dla spójności, jeśli chcesz
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <Box component="footer" className={styles.footerTransparent}>
      <Typography variant="caption" className={styles.footerText}>
        ©{new Date().getFullYear()} Jacek Podanowski - Korepetycje IT
      </Typography>
    </Box>
  );
};

export default Footer;