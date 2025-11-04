import React from 'react';
import { Box, Typography } from '@mui/material';
import useTheme from '../../theme/useTheme';

/**
 * AdminLink component displays "Admin" with stylized branding:
 * - "A" in red (brand primary color)
 * - "dmin" in text primary color (black/white based on theme)
 * - Uses Montserrat Bold font like the Logo component
 * - Renders using the same logic as Logo.jsx for consistency
 */
const AdminLink = () => {
    const theme = useTheme();
    const typography = theme.typography || {};
    const accentColor = theme?.colors?.brand?.primary ?? '#82001F';
    const textColor = theme?.colors?.text?.primary ?? '#1F1F1F';
    const fontFamily = typography.fonts?.logo ?? '"Montserrat", sans-serif';
    const logoTextTokens = typography.textStyles?.logo || {};
    const fontWeight = logoTextTokens.fontWeight ?? 700;
    const lineHeight = logoTextTokens.lineHeight ?? 1.05;

    const text = 'Admin';
    const fontSize = '1rem';

    const baseLetterStyle = {
        display: 'inline-block',
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        fontStyle: 'italic',
        transition: 'color 0.3s ease'
    };

    const renderLetter = (character, index) => {
        const upper = character.toUpperCase();
        const isAccent = character === upper; // First letter "A" is uppercase
        const letterStyle = { ...baseLetterStyle };

        if (isAccent) {
            letterStyle.color = accentColor;
        } else {
            letterStyle.color = textColor;
        }

        return (
            <span key={`${character}-${index}`} style={letterStyle}>
                {character}
            </span>
        );
    };

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                userSelect: 'none'
            }}
        >
            <Typography
                component="span"
                sx={{
                    display: 'inline-block',
                    whiteSpace: 'nowrap'
                }}
            >
                {Array.from(text).map((letter, index) => renderLetter(letter, index))}
            </Typography>
        </Box>
    );
};

export default AdminLink;
